import assert from 'node:assert/strict'
import { describe, test } from 'vitest'
import rawClients from '../clients/clients.json'
import {
  ALLOWLISTS,
  FREE_TIER_PII_REASON,
  MAPS_GEOCODE_URL,
  addressInputFromWebhook,
  addressWebhookResponse,
  assertAddressesHaveNoStarShipIt,
  assertConnectedLlm,
  assertEnvPresent,
  assertMapsGet,
  assertStarShipItReadOnly,
  buildAddressPrompt,
  buildManifestRequest,
  buildOrdersRequest,
  calendarDaysAgo,
  chooseCarrier,
  clientsForEnv,
  confirmMaps,
  detectMailbox,
  formatDateInZone,
  parseClients,
  orderWeightKg,
  parseGeminiSuggestion,
  requireBaseUrl,
  resolveClient,
  routeReports,
  selectClient,
  summariseDispatch,
  summarisePickup,
  summarisePostShipping,
  validateAddress,
  type ClientConfig,
} from './engine'

const NOW = new Date('2026-11-12T21:30:00.000Z')
const clients = parseClients(rawClients)
const hom = selectClient(clients, 'hom')
const CRON = '30 7 * * *'
const ZONE = 'Australia/Brisbane'

function carrier(args: { method?: string; weight?: number | null; packaging?: string; address: string }) {
  return chooseCarrier(
    {
      shippingMethod: args.method ?? 'Standard',
      weightKg: args.weight === undefined ? 1 : args.weight,
      packagingText: args.packaging ?? '',
      addressText: args.address,
    },
    hom,
  )
}

describe('HOM client config', () => {
  test('loads House of Mouth as data, with the free Gemini tier closed', () => {
    assert.equal(hom.id, 'hom')
    assert.equal(hom.displayName, 'House of Mouth')
    assert.equal(hom.timezone, ZONE)
    assert.equal(hom.schedule.cron, CRON)
    assert.equal(hom.llm.provider, 'gemini')
    assert.equal(hom.llm.model, 'models/gemini-2.5-flash')
    assert.equal(hom.llm.temperature, 0)
    assert.equal(hom.llm.allowCustomerPii, false)
    assert.equal(hom.telegram.sendingEnabled, false)
    assert.equal(hom.starshipit.apiKeyEnv, 'HOM_STARSHIPIT_API_KEY')
    assert.equal(hom.windows.unshippedLookbackDays, 120)
    assert.deepEqual(
      hom.carrierRules.standardBands.map((band) => band.carrier),
      ['Aramex', 'StarTrack', 'Australia Post'],
    )
  })

  test('adds another client from an env overlay without changing the rules module', () => {
    const overlay = JSON.parse(JSON.stringify(rawClients)) as {
      clients: Record<string, { id: string; displayName: string; carrierRules: { standardBands: Record<string, unknown>[] } }>
    }
    const acme = JSON.parse(JSON.stringify(overlay.clients.hom)) as (typeof overlay.clients)[string]
    acme.id = 'acme'
    acme.displayName = 'Acme Supplies'
    acme.carrierRules.standardBands = [
      { ...acme.carrierRules.standardBands[0], maxKg: 100, carrier: 'Acme Freight', service: 'Ground' },
    ]
    overlay.clients.acme = acme
    const merged = clientsForEnv({ FULFILMENT_CLIENTS_JSON: JSON.stringify(overlay) }, clients)
    assert.equal(resolveClient({ FULFILMENT_CLIENT_ID: 'acme' }, merged).displayName, 'Acme Supplies')
    const decision = chooseCarrier(
      { shippingMethod: 'Standard', weightKg: 2, packagingText: '', addressText: '12 Queen St' },
      merged.acme,
    )
    assert.equal(decision.carrier, 'Acme Freight')
    assert.equal(carrier({ address: '12 Queen St', weight: 2 }).carrier, 'Aramex')
  })

  test('rejects an unknown client and a bad overlay', () => {
    assert.throws(() => selectClient(clients, 'missing'), /Unknown fulfilment client/)
    assert.throws(() => clientsForEnv({ FULFILMENT_CLIENTS_JSON: '{not json' }, clients), /not valid JSON/)
  })

  test('refuses to treat a secret as an env var name', () => {
    const overlay = JSON.parse(JSON.stringify(rawClients)) as { clients: { hom: { starshipit: { apiKeyEnv: string } } } }
    overlay.clients.hom.starshipit.apiKeyEnv = 'sk-live-secret'
    assert.throws(() => parseClients(overlay), /env var name/)
  })
})

describe('dates and StarShipIt requests', () => {
  test('formats Brisbane dates and the lookback the unshipped listing needs', () => {
    assert.equal(formatDateInZone(NOW, ZONE), '2026-11-13')
    assert.equal(calendarDaysAgo(NOW, 120, ZONE), '2026-07-16')
    assert.equal(calendarDaysAgo(NOW, 30, ZONE), '2026-10-14')
    assert.equal(calendarDaysAgo(NOW, 2, ZONE), '2026-11-11')
  })

  test('builds allowlisted GETs and strips the base URL slash', () => {
    const env = {
      HOM_STARSHIPIT_BASE_URL: 'https://api.example.com/',
      HOM_STARSHIPIT_API_KEY: 'sentinel-key',
      HOM_STARSHIPIT_SUBSCRIPTION_KEY: 'sentinel-sub',
    }
    assertEnvPresent(env, 'HOM_STARSHIPIT_API_KEY')
    const baseUrl = requireBaseUrl(env, hom)
    assert.equal(baseUrl, 'https://api.example.com')
    assert.equal(baseUrl.includes('sentinel'), false)
    const since = calendarDaysAgo(NOW, hom.windows.unshippedLookbackDays, ZONE)
    const request = buildOrdersRequest({
      baseUrl,
      path: '/api/orders',
      status: 'unshipped',
      sinceLastUpdated: since,
      pageSize: 250,
    })
    assert.equal(request.method, 'GET')
    assert.equal(request.query.since_last_updated, '2026-07-16')
    assert.doesNotThrow(() => assertStarShipItReadOnly(request, ALLOWLISTS.dispatch, baseUrl))
    assert.equal(buildManifestRequest(baseUrl).url, 'https://api.example.com/api/manifests')
  })

  test('the guard throws on non-GET methods and non-allowlisted endpoints', () => {
    const base = 'https://api.example.com'
    const ok = { method: 'GET', url: `${base}/api/orders`, query: { status: 'unshipped', page_size: '250', since_last_updated: '2026-07-16' } }
    assert.throws(() => assertStarShipItReadOnly({ ...ok, method: 'POST' }, ALLOWLISTS.dispatch, base), /Blocked non-GET StarShipIt method: POST/)
    assert.throws(() => assertStarShipItReadOnly({ ...ok, method: 'PUT' }, ALLOWLISTS.dispatch, base), /PUT/)
    assert.throws(() => assertStarShipItReadOnly({ ...ok, method: 'DELETE' }, ALLOWLISTS.dispatch, base), /DELETE/)
    assert.throws(
      () => assertStarShipItReadOnly({ method: 'GET', url: `${base}/api/orders/shipment`, query: {} }, ALLOWLISTS.dispatch, base),
      /non-allowlisted StarShipIt endpoint: \/api\/orders\/shipment/,
    )
    assert.throws(
      () => assertStarShipItReadOnly({ method: 'GET', url: 'https://evil.example/api/orders', query: ok.query }, ALLOWLISTS.dispatch, base),
      /non-allowlisted/,
    )
    assert.throws(
      () => assertStarShipItReadOnly({ method: 'GET', url: 'http://api.example.com/api/orders', query: ok.query }, ALLOWLISTS.dispatch, base),
      /non-HTTPS/,
    )
    assert.throws(
      () => assertStarShipItReadOnly({ ...ok, query: { ...ok.query, label: '1' } }, ALLOWLISTS.dispatch, base),
      /query parameter: label/,
    )
    assert.throws(
      () => assertStarShipItReadOnly({ ...ok, query: { ...ok.query, status: 'shipped' } }, ALLOWLISTS.dispatch, base),
      /status: shipped/,
    )
    assert.doesNotThrow(() =>
      assertStarShipItReadOnly(
        { method: 'GET', url: `${base}/api/orders`, query: { status: 'printed', page_size: '250', since_last_updated: '2026-11-11' } },
        ALLOWLISTS.pickupOrders,
        base,
      ),
    )
    assert.doesNotThrow(() => assertStarShipItReadOnly({ method: 'GET', url: `${base}/api/manifests`, query: {} }, ALLOWLISTS.pickupManifests, base))
    assert.doesNotThrow(() =>
      assertStarShipItReadOnly(
        { method: 'GET', url: `${base}/api/orders/shipped`, query: { since_last_updated: '2026-10-14', page_size: '250' } },
        ALLOWLISTS.postShipping,
        base,
      ),
    )
  })
})

describe('mailbox detection and carrier rules', () => {
  const mailboxCases: { text: string; kind: string }[] = [
    { text: 'PO Box 12', kind: 'po_box' },
    { text: 'PO Box12', kind: 'po_box' },
    { text: 'POBox12', kind: 'po_box' },
    { text: 'P.O. Box 12', kind: 'po_box' },
    { text: 'Post Office Box 77', kind: 'po_box' },
    { text: 'Post Box 5', kind: 'po_box' },
    { text: 'GPO Box 100', kind: 'po_box' },
    { text: 'Locked Bag 4', kind: 'locked_bag' },
    { text: 'Private Bag 3', kind: 'private_bag' },
    { text: 'Parcel Locker 10123', kind: 'parcel_locker' },
    { text: 'Parcel Collect 55', kind: 'parcel_locker' },
    { text: 'APL 123456', kind: 'parcel_locker' },
    { text: 'PMB 9', kind: 'pmb' },
    { text: 'CMB 2', kind: 'cmb' },
  ]

  test('recognises the PO Box spellings the old rule missed', () => {
    for (const item of mailboxCases) {
      assert.equal(detectMailbox(item.text, hom), item.kind, item.text)
    }
    assert.equal(detectMailbox('12 Flat Rock Rd', hom), null)
    assert.equal(detectMailbox('8 Level Crossing Rd', hom), null)
    assert.equal(detectMailbox('12 Apollo St', hom), null)
    assert.equal(detectMailbox('Box Hill', hom), null)
    assert.equal(detectMailbox('10 Queen St\nPO Box 1234', hom), 'po_box')
  })

  test('sends mailboxes to Australia Post and never to Aramex', () => {
    for (const item of mailboxCases) {
      const decision = carrier({ address: item.text, weight: 0.3, method: 'Standard' })
      assert.equal(decision.carrier, 'Australia Post', item.text)
      assert.equal(decision.service, 'Parcel Post')
      assert.equal(decision.signature, true)
      assert.equal(/aramex/i.test(decision.carrier || ''), false)
    }
    const building = carrier({ address: '10 Queen Street\nPO Box 1234\nAcme Pty Ltd', weight: 0.3 })
    assert.equal(building.carrier, 'Australia Post')
    const denied = parseClients(rawClients).hom
    denied.carrierRules.mailbox = { carrier: 'Aramex', service: 'PO Box', signature: false }
    const refused = chooseCarrier(
      { shippingMethod: 'Standard', weightKg: 0.3, packagingText: '', addressText: 'PO Box 12' },
      denied,
    )
    assert.equal(refused.carrier, null)
    assert.equal(refused.escalations.some((item) => item.code === 'mailbox_carrier_denied'), true)
  })

  test('applies the HOM weight bands and the express rule', () => {
    assert.equal(carrier({ address: '12 Queen St', method: 'Express', weight: 8 }).service, 'Express')
    assert.equal(carrier({ address: '12 Queen St', method: 'FREE Express', weight: 1 }).carrier, 'Australia Post')
    assert.equal(carrier({ address: '12 Queen St', method: 'Standard Shipping (Australia Post +)', weight: 1 }).signature, true)
    assert.deepEqual(
      [4.99, 5, 6, 6.01].map((weight) => carrier({ address: '12 Queen St', weight }).carrier),
      ['Aramex', 'StarTrack', 'StarTrack', 'Australia Post'],
    )
    const gap = carrier({ address: '12 Queen St', weight: 4.995 })
    assert.equal(gap.carrier, null)
    assert.equal(gap.escalations[0]?.code, 'no_carrier_band')
    const envelope = carrier({ address: '12 Queen St', weight: 5.5, packaging: 'DL envelope' })
    assert.equal(envelope.carrier, 'Australia Post')
    assert.equal(envelope.escalations[0]?.code, 'envelope_excluded_from_startrack')
    assert.equal(carrier({ address: '12 Queen St', weight: 5.5, packaging: 'carton' }).carrier, 'StarTrack')
    assert.equal(carrier({ address: '12 Queen St', weight: null }).escalations[0]?.code, 'weight_missing')
    assert.equal(orderWeightKg({ total_weight: 4990, weight_unit: 'g' }), 4.99)
    assert.equal(orderWeightKg({ total_weight: 4.99, weight_unit: 'kg' }), 4.99)
    assert.equal(carrier({ address: '12 Queen St', weight: orderWeightKg({ total_weight: 4990, weight_unit: 'g' }) }).carrier, 'Aramex')
    const grams = carrier({ address: '12 Queen St', weight: 4.99 })
    assert.equal(grams.carrier, 'Aramex')
  })

  test('express to a mailbox stays on the mailbox service and is escalated', () => {
    const decision = carrier({ address: 'PO Box 12', method: 'Express', weight: 1 })
    assert.equal(decision.service, 'Parcel Post')
    assert.equal(decision.escalations.some((item) => item.code === 'express_to_mailbox'), true)
  })
})

describe('address rules', () => {
  function check(input: Parameters<typeof validateAddress>[0]) {
    return validateAddress(input, hom)
  }

  test('accepts a normal street and the mailbox forms, including PO Box12', () => {
    const ok = check({ address1: '12 Queen St', suburb: 'Brisbane', state: 'QLD', postcode: '4000', country: 'AU' })
    assert.equal(ok.passou, true)
    assert.equal(ok.mailbox, null)
    const flat = check({ address1: '12 Flat Rock Rd', suburb: 'Kingsgrove', state: 'NSW', postcode: '2208' })
    assert.equal(flat.passou, true)
    assert.equal(flat.mailbox, null)
    const level = check({ address1: '8 Level Crossing Rd', suburb: 'Tamworth', state: 'NSW', postcode: '2340' })
    assert.equal(level.passou, true)
    for (const address1 of ['PO Box12', 'Post Box 5', 'Parcel Locker 10123', 'APL 123456', 'PMB 9', 'CMB 2']) {
      const result = check({ address1, suburb: 'Sydney', state: 'NSW', postcode: '2000' })
      assert.equal(result.passou, true, address1)
      assert.notEqual(result.mailbox, null, address1)
    }
    const building = check({
      address1: '10 Queen St',
      address2: 'PO Box 1234',
      suburb: 'Brisbane',
      state: 'QLD',
      postcode: '4000',
    })
    assert.equal(building.mailbox, 'po_box')
    assert.equal(building.passou, true)
  })

  test('fails a missing suburb and a postcode in the wrong state', () => {
    const missing = check({ address1: '12 Queen St', suburb: '', state: 'QLD', postcode: '4000' })
    assert.equal(missing.passou, false)
    assert.equal(missing.problemas.some((item) => item.code === 'suburb_missing'), true)
    const empty = check({ address1: '', suburb: '', state: '', postcode: '' })
    assert.equal(empty.problemas.some((item) => item.code === 'suburb_missing'), true)
    const wrong = check({ address1: '12 Queen St', suburb: 'Brisbane', state: 'QLD', postcode: '2000' })
    assert.equal(wrong.problemas.some((item) => item.code === 'postcode_state_mismatch'), true)
  })

  test('normalises Queensland and rejects a non-AU country', () => {
    const state = check({ address1: '12 Queen St', suburb: 'Brisbane', state: 'Queensland', postcode: '4000' })
    assert.equal(state.state, 'QLD')
    assert.equal(state.passou, true)
    const abroad = check({ address1: '12 Queen St', suburb: 'Brisbane', state: 'QLD', postcode: '4000', country: 'GB' })
    assert.equal(abroad.problemas.some((item) => item.code === 'country_not_allowed'), true)
  })

  test('keeps the known street-type gaps visible', () => {
    const broadway = check({ address1: '12 Broadway', suburb: 'Sydney', state: 'NSW', postcode: '2000' })
    assert.equal(broadway.problemas.some((item) => item.code === 'street_type_unrecognised'), true)
    const unit = check({ address1: 'Unit 5, Queen St', suburb: 'Brisbane', state: 'QLD', postcode: '4000' })
    assert.equal(unit.passou, true)
    const southport = check({ address1: '12 Queen St', suburb: 'Southport', state: 'QLD', postcode: '4000' })
    assert.equal(southport.passou, true)
  })

  test('reads the webhook body and does not take allowCustomerPii from it', () => {
    const input = addressInputFromWebhook({
      body: { order_id: 'A1', address1: '12 Queen St', allowCustomerPii: true, clientId: 'acme' },
    })
    assert.equal(input.order_id, 'A1')
    assert.equal(input.address1, '12 Queen St')
    assert.equal('allowCustomerPii' in input, false)
    assert.equal('clientId' in input, false)
  })

  test('a rules failure skips the model while the free tier is closed', () => {
    const validation = check({ address1: '12 Queen St', suburb: '', state: 'QLD', postcode: '4000', order_id: 'A70' })
    const response = addressWebhookResponse({ validation, llmSkipped: true })
    assert.equal(response.status, 'revisar')
    assert.equal(response.llmSkipped, true)
    assert.equal(response.llmMayOverride, false)
    assert.equal(response.writes, 'none')
    assert.equal(response.llmSkipReason, FREE_TIER_PII_REASON)
    assert.equal(response.sugerido.rua, '')
    const passed = addressWebhookResponse({
      validation: check({ address1: '12 Queen St', suburb: 'Brisbane', state: 'QLD', postcode: '4000', order_id: 'A1' }),
      llmSkipped: true,
    })
    assert.equal(passed.status, 'ok')
    assert.equal(passed.precisa_cliente, false)
  })

  test('parses a model suggestion and checks it against a geocode result', () => {
    const bad = parseGeminiSuggestion('not json')
    assert.equal(bad.precisa_cliente, true)
    const suggestion = parseGeminiSuggestion('{"sugerido":{"rua":"12 Queen St","suburb":"Brisbane","estado":"QLD","postcode":"4000"},"motivo":"suburb was empty","precisa_cliente":false}')
    assert.equal(suggestion.precisa_cliente, false)
    const maps = {
      status: 'OK',
      results: [{ address_components: [{ long_name: 'Brisbane', types: ['locality'] }, { long_name: '4000', types: ['postal_code'] }] }],
    }
    assert.equal(confirmMaps(suggestion, maps), true)
    assert.equal(confirmMaps(suggestion, { status: 'ZERO_RESULTS', results: [] }), false)
    const validation = check({ address1: 'Queen St', suburb: '', state: 'QLD', postcode: '4000', order_id: 'A2' })
    const response = addressWebhookResponse({ validation, llm: suggestion, mapsConfirmed: true, llmSkipped: false })
    assert.equal(response.status, 'corrigir')
    assert.equal(response.maps_confirmado, true)
    assert.equal(response.llmMayOverride, false)
    const prompt = buildAddressPrompt(validation)
    assert.match(prompt, /Do not invent/)
    assert.match(prompt, /cannot override the fixed rules/)
    assert.match(prompt, /Queen St/)
  })

  test('the address agent refuses any StarShipIt request, and geocoding stays a fixed GET', () => {
    assert.doesNotThrow(() => assertAddressesHaveNoStarShipIt({ body: { address1: '12 Queen St' } }))
    assert.throws(() => assertAddressesHaveNoStarShipIt({ request: { method: 'POST', url: 'https://api.example.com/api/orders' } }), /non-GET/)
    assert.throws(() => assertAddressesHaveNoStarShipIt({ request: { method: 'GET', url: 'https://api.example.com/api/orders' } }), /never calls StarShipIt|non-allowlisted/)
    assert.doesNotThrow(() => assertMapsGet({ method: 'GET', url: MAPS_GEOCODE_URL }))
    assert.throws(() => assertMapsGet({ method: 'POST', url: MAPS_GEOCODE_URL }), /non-GET geocode/)
    assert.throws(() => assertMapsGet({ method: 'GET', url: `${MAPS_GEOCODE_URL}?key=AIzaSecret&address=12+Queen+St` }), /embeds a key or an address/)
  })

  test('the connected model must be the configured provider, at temperature 0, with PII allowed', () => {
    assert.throws(() => assertConnectedLlm(hom, { provider: 'gemini', model: hom.llm.model }), new RegExp(FREE_TIER_PII_REASON.slice(0, 24)))
    const paid = { ...hom, llm: { ...hom.llm, allowCustomerPii: true, provider: 'openai' } } as ClientConfig
    assert.throws(() => assertConnectedLlm(paid, { provider: 'gemini', model: hom.llm.model }), /does not match the connected chat model/)
    const warm = { ...hom, llm: { ...hom.llm, allowCustomerPii: true, temperature: 0.2 } } as ClientConfig
    assert.throws(() => assertConnectedLlm(warm, { provider: 'gemini', model: hom.llm.model }), /temperature must be 0/)
    const ready = { ...hom, llm: { ...hom.llm, allowCustomerPii: true } } as ClientConfig
    assert.doesNotThrow(() => assertConnectedLlm(ready, { provider: 'gemini', model: 'models/gemini-2.5-flash' }))
  })
})

describe('summaries', () => {
  const run = { workflowCron: CRON, workflowTimezone: ZONE }

  test('flags a PO Box that is sitting on Aramex and does not copy the street into the report', () => {
    const report = summariseDispatch({
      client: hom,
      now: NOW,
      ...run,
      pages: [
        {
          data: {
            orders: [
              {
                order_number: 'W106',
                carrier_name: 'Aramex',
                carrier_service_name: 'Aramex 300G',
                shipping_method: 'Standard',
                total_weight: 0.3,
                status: 'unshipped',
                order_date: '2026-11-01T00:00:00Z',
                destination: { street: 'Post Office Box 77', suburb: 'Mudgee', state: 'NSW', post_code: '2850' },
                packages: [{ name: 'B-SML', weight: 0.3, length: 20, width: 15, height: 5 }],
              },
              {
                order_id: 'W106',
                order_number: 'duplicate',
                carrier_name: 'Aramex',
                destination: { street: 'Post Office Box 77' },
              },
              {
                order_number: 'W108',
                carrier_name: 'Aramex',
                carrier_service_name: 'Aramex 300G',
                shipping_method: 'Standard',
                total_weight: 0.3,
                destination: { street: '1 Stuart Hwy', building: 'PO Box 1234', suburb: 'Alice Springs' },
                packages: [{ name: 'B-SML', length: 1, width: 1, height: 1 }],
              },
              {
                order_number: '1001',
                carrier_name: 'Aramex',
                carrier_service_name: 'Standard',
                shipping_method: 'Standard',
                total_weight: 1,
                status: 'on hold',
                destination: { street: '12 Queen St', suburb: 'Brisbane' },
                packages: [{ name: 'B-SML', length: 1, width: 1, height: 1 }],
              },
            ],
          },
        },
      ],
    })
    assert.equal(report.dryRun, true)
    assert.equal(report.send, false)
    assert.equal(report.writes, 'none')
    assert.equal(report.stats.unshipped, 3)
    assert.equal(report.escalations.some((item) => item.code === 'po_box_on_aramex' && item.orderNumber === 'W106'), true)
    assert.equal(report.escalations.some((item) => item.code === 'po_box_on_aramex' && item.orderNumber === 'W108'), true)
    assert.equal(report.escalations.some((item) => item.code === 'on_hold' && item.orderNumber === '1001'), true)
    assert.equal(report.text.includes('Post Office Box 77'), false)
    assert.equal(report.text.includes('PO Box 1234'), false)
    assert.match(report.text, /Telegram was not sent/)
  })

  test('reports an API error and a schedule mismatch', () => {
    const report = summariseDispatch({
      client: hom,
      now: NOW,
      pages: [{ success: false, orders: [] }],
      workflowCron: CRON,
      workflowTimezone: 'UTC',
    })
    assert.equal(report.stats.unshipped, 0)
    assert.equal(report.escalations.some((item) => item.code === 'api_error'), true)
    assert.match(report.scheduleWarning || '', /UTC/)
  })

  test('counts labels printed today in Brisbane and open manifests', () => {
    const report = summarisePickup({
      client: hom,
      now: NOW,
      ...run,
      printedPages: [
        {
          orders: [
            { order_number: 'P1', printed_date: '2026-11-12T21:00:00.000Z', carrier_name: 'Australia Post', manifest_number: '' },
            { order_number: 'P2', printed_date: '2026-11-12T10:00:00.000Z', carrier_name: 'Aramex', manifest_sent: false, manifest_number: 'M1' },
          ],
        },
      ],
      manifestPages: [{ manifests: [{ sent: false, status: 'open' }, { sent: true, status: 'sent' }] }],
    })
    assert.equal(report.stats.printedToday, 1)
    assert.match(report.text, /Labels printed today: 1/)
    assert.match(report.text, /no pickups endpoint/)
    assert.equal(report.escalations.some((item) => item.code === 'open_manifest'), true)
  })

  test('separates delivered, exceptions, and parcels in transit too long', () => {
    const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86400000).toISOString()
    const report = summarisePostShipping({
      client: hom,
      now: NOW,
      ...run,
      pages: [
        {
          orders: [
            { order_number: 'S1', shipped_date: daysAgo(1), tracking_short_status: 'Delivered' },
            { order_number: 'S2', shipped_date: daysAgo(2), tracking_short_status: 'Delivery attempted' },
            { order_number: 'S3', shipped_date: daysAgo(6), tracking_short_status: 'In transit' },
            { order_number: 'S4', shipped_date: daysAgo(40), tracking_short_status: 'Delivered' },
          ],
        },
      ],
    })
    assert.equal(report.stats.shipped, 3)
    assert.equal(report.stats.delivered, 1)
    assert.equal(report.stats.exceptions, 1)
    assert.equal(report.stats.late, 1)
    assert.equal(report.stats.outsideWindow, 1)
    assert.equal(report.escalations.some((item) => item.code === 'tracking_exception' && item.orderNumber === 'S2'), true)
    assert.equal(report.escalations.some((item) => item.code === 'in_transit_late' && item.orderNumber === 'S3'), true)
    assert.equal(report.escalations.some((item) => item.orderNumber === 'S1'), false)
  })

  test('the coordinator routes escalations and never sends', () => {
    const dispatch = summariseDispatch({
      client: hom,
      now: NOW,
      ...run,
      pages: [{ orders: [{ order_number: 'W106', carrier_name: 'Aramex', shipping_method: 'Standard', total_weight: 0.3, destination: { street: 'PO Box12' } }] }],
    })
    const routed = routeReports([dispatch])
    assert.equal(routed.send, false)
    assert.equal(routed.dryRun, true)
    assert.equal(routed.writes, 'none')
    assert.equal(routed.humanReview, true)
    assert.match(routed.text, /po_box_on_aramex/)
    assert.equal(routed.text.includes('PO Box12'), false)
  })
})
