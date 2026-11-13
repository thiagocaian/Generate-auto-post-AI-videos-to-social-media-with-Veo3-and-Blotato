/**
 * Builds the inactive TESTE n8n workflows from the rules module.
 * Run: npx tsx agents/fulfilment/scripts/build-workflows.ts
 * The script does not call StarShipIt, Telegram, Gemini, or Docker.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const enginePath = path.join(root, 'rules', 'engine.ts')
const clientsPath = path.join(root, 'clients', 'clients.json')
const outDir = path.join(root, 'n8n')

type Conn = Record<string, Record<string, { node: string; type: string; index: number }[][]>>
type WfNode = Record<string, unknown>

const ORDERS_DONE =
  "={{ !($response.body.data && $response.body.data.orders && $response.body.data.orders.length) || $pageCount >= ($response.body.total_pages || 1) }}"
const SHIPPED_DONE =
  "={{ !$response.body.orders || $response.body.orders.length === 0 || $pageCount >= ($response.body.total_pages || 1) }}"

export function engineSandboxSource(): string {
  const source = fs.readFileSync(enginePath, 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2020,
      strict: false,
      removeComments: false,
    },
    fileName: 'engine.ts',
  }).outputText
  const stripped = compiled
    .replace(/^\s*export\s+\{\s*\}\s*;?\s*$/gm, '')
    .replace(/^\s*export\s+/gm, '')
    .trim()
  const clientsJson = fs.readFileSync(clientsPath, 'utf8').trim()
  return `/* ENGINE_START */\n${stripped}\nconst CLIENTS = parseClients(${clientsJson});\n/* ENGINE_END */\n`
}

function readHom(): { cron: string; timezone: string; maxPages: number } {
  const parsed = JSON.parse(fs.readFileSync(clientsPath, 'utf8')) as {
    clients: { hom: { schedule: { cron: string }; timezone: string; starshipit: { maxPages: number } } }
  }
  return {
    cron: parsed.clients.hom.schedule.cron,
    timezone: parsed.clients.hom.timezone,
    maxPages: parsed.clients.hom.starshipit.maxPages,
  }
}

function connect(map: Conn, from: string, to: string, output = 0, kind = 'main'): void {
  if (!map[from]) map[from] = {}
  if (!map[from][kind]) map[from][kind] = []
  while (map[from][kind].length <= output) map[from][kind].push([])
  map[from][kind][output].push({ node: to, type: kind, index: 0 })
}

function code(id: string, name: string, position: [number, number], sandbox: string, tail: string, notes?: string): WfNode {
  const node: WfNode = {
    id,
    name,
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position,
    parameters: { jsCode: `${sandbox}${tail.trim()}\n` },
  }
  if (notes) node.notes = notes
  return node
}

function clock(cron: string, timezone: string): string {
  return `const WORKFLOW_CRON = ${JSON.stringify(cron)};\nconst WORKFLOW_TIMEZONE = ${JSON.stringify(timezone)};\n`
}

function envClient(): string {
  return `const env = (typeof $env === 'undefined' || $env === null) ? {} : $env;\nconst client = resolveClient(env, clientsForEnv(env, CLIENTS));\n`
}

function triggers(cron: string): WfNode[] {
  return [
    {
      id: 'schedule',
      name: 'Schedule 07:30',
      type: 'n8n-nodes-base.scheduleTrigger',
      typeVersion: 1.2,
      position: [0, 0],
      parameters: { rule: { interval: [{ field: 'cronExpression', expression: cron }] } },
    },
    {
      id: 'manual',
      name: 'Manual test',
      type: 'n8n-nodes-base.manualTrigger',
      typeVersion: 1,
      position: [0, 220],
      parameters: {},
    },
  ]
}

function ifNode(id: string, name: string, position: [number, number], leftValue: string): WfNode {
  return {
    id,
    name,
    type: 'n8n-nodes-base.if',
    typeVersion: 2,
    position,
    parameters: {
      conditions: {
        options: { caseSensitive: true, typeValidation: 'loose', version: 2 },
        combinator: 'and',
        conditions: [
          {
            id: `${id}-cond`,
            leftValue,
            rightValue: true,
            operator: { type: 'boolean', operation: 'true', singleValue: true },
          },
        ],
      },
      options: {},
    },
  }
}

function telegramNode(id: string, name: string, position: [number, number], textExpr: string): WfNode {
  return {
    id,
    name,
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position,
    disabled: true,
    notes: 'DRY-RUN: disabled. Do not enable in a TESTE workflow. Sending needs a separate reviewed copy.',
    parameters: {
      method: 'POST',
      url: '=https://api.telegram.org/bot{{ $env[$json.botTokenEnv] }}/sendMessage',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: textExpr,
      options: { timeout: 20000 },
    },
  }
}

function starshipitNode(args: {
  id: string
  name: string
  position: [number, number]
  queryKeys: string[]
  pagination: 'orders' | 'shipped' | 'none'
  maxPages: number
}): WfNode {
  const options: Record<string, unknown> = {
    timeout: 20000,
    redirect: { redirect: { followRedirects: false } },
  }
  if (args.pagination !== 'none') {
    options.pagination = {
      pagination: {
        paginationMode: 'updateAParameterInEachRequest',
        parameters: {
          parameters: [
            {
              type: 'qs',
              name: args.pagination === 'shipped' ? 'page' : 'page_number',
              value: '={{ $pageCount + 1 }}',
            },
          ],
        },
        paginationCompleteWhen: 'other',
        completeExpression: args.pagination === 'shipped' ? SHIPPED_DONE : ORDERS_DONE,
        limitPagesFetched: true,
        maxRequests: args.maxPages,
        requestInterval: 1200,
      },
    }
  }
  return {
    id: args.id,
    name: args.name,
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: args.position,
    alwaysOutputData: true,
    retryOnFail: true,
    maxTries: 2,
    waitBetweenTries: 3000,
    onError: 'continueRegularOutput',
    notes: 'GET only. The URL is the one the Guard node already checked.',
    parameters: {
      method: 'GET',
      url: '={{ $json.request.url }}',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'StarShipIT-Api-Key', value: '={{ $env[$json.apiKeyEnv] }}' },
          { name: 'Ocp-Apim-Subscription-Key', value: '={{ $env[$json.subscriptionKeyEnv] }}' },
        ],
      },
      sendQuery: args.queryKeys.length > 0,
      queryParameters: {
        parameters: args.queryKeys.map((name) => ({ name, value: `={{ $json.request.query.${name} }}` })),
      },
      options,
    },
  }
}

function sticky(id: string, position: [number, number], content: string, width = 520): WfNode {
  return {
    id,
    name: 'Note',
    type: 'n8n-nodes-base.stickyNote',
    typeVersion: 1,
    position,
    parameters: { content, width, height: 280 },
  }
}

function shell(name: string, nodes: WfNode[], connections: Conn, timezone: string) {
  return {
    name,
    active: false,
    nodes,
    connections,
    settings: { executionOrder: 'v1', timezone, callerPolicy: 'workflowsFromSameOwner' },
    pinData: {},
    meta: { templateCredsSetupCompleted: false },
  }
}

function prepareTail(which: 'dispatch' | 'pickup' | 'post' | 'all'): string {
  const header = `${envClient()}const baseUrl = requireBaseUrl(env, client);\nassertEnvPresent(env, client.starshipit.apiKeyEnv);\nassertEnvPresent(env, client.starshipit.subscriptionKeyEnv);\nconst now = new Date();\nconst pageSize = client.starshipit.pageSize;\n`
  let requests = ''
  if (which === 'dispatch' || which === 'all') {
    requests += `const dispatch = buildOrdersRequest({ baseUrl, path: '/api/orders', status: 'unshipped', sinceLastUpdated: calendarDaysAgo(now, client.windows.unshippedLookbackDays, client.timezone), pageSize });\n`
  }
  if (which === 'pickup' || which === 'all') {
    requests += `const printed = buildOrdersRequest({ baseUrl, path: '/api/orders', status: 'printed', sinceLastUpdated: calendarDaysAgo(now, client.windows.printedLookbackDays, client.timezone), pageSize });\nconst manifests = buildManifestRequest(baseUrl);\n`
  }
  if (which === 'post' || which === 'all') {
    requests += `const shipped = buildOrdersRequest({ baseUrl, path: '/api/orders/shipped', sinceLastUpdated: calendarDaysAgo(now, client.windows.shippedLookbackDays, client.timezone), pageSize });\n`
  }
  const body =
    which === 'dispatch'
      ? '{ dispatch }'
      : which === 'pickup'
        ? '{ printed, manifests }'
        : which === 'post'
          ? '{ shipped }'
          : '{ dispatch, printed, manifests, shipped }'
  return `${header}${requests}return [{ json: { clientId: client.id, baseUrl, apiKeyEnv: client.starshipit.apiKeyEnv, subscriptionKeyEnv: client.starshipit.subscriptionKeyEnv, botTokenEnv: client.telegram.botTokenEnv, chatIdEnv: client.telegram.chatIdEnv, clientAllowsTelegram: client.telegram.sendingEnabled === true, requests: ${body}, dryRun: true, writes: 'none' } }];\n`
}

function guardTail(requestKey: string, allowName: string): string {
  return `const prepared = $('Prepare').first().json;\nconst request = prepared.requests.${requestKey};\nassertStarShipItReadOnly(request, ALLOWLISTS.${allowName}, prepared.baseUrl);\nreturn [{ json: { request, apiKeyEnv: prepared.apiKeyEnv, subscriptionKeyEnv: prepared.subscriptionKeyEnv, botTokenEnv: prepared.botTokenEnv, chatIdEnv: prepared.chatIdEnv } }];\n`
}

function dryRunTail(): string {
  return `const item = $input.first().json;\nreturn [{ json: Object.assign({}, item, { dryRun: true, send: false, writes: 'none', telegramSendingEnabled: false }) }];\n`
}

function finishSend(map: Conn): void {
  connect(map, 'Dry-run log', 'Sending enabled?')
  connect(map, 'Sending enabled?', 'Telegram: send', 0)
}

function reportWorkflow(args: {
  name: string
  sandbox: string
  cron: string
  timezone: string
  maxPages: number
  prepare: 'dispatch' | 'pickup' | 'post'
  steps: { guard: string; allow: string; http: string; requestKey: string; queryKeys: string[]; pagination: 'orders' | 'shipped' | 'none' }[]
  summarise: string
  note: string
}) {
  const nodes: WfNode[] = [
    ...triggers(args.cron),
    code('prepare', 'Prepare', [280, 100], args.sandbox, prepareTail(args.prepare), 'Loads the client config. HOM is the default.'),
  ]
  const map: Conn = {}
  connect(map, 'Schedule 07:30', 'Prepare')
  connect(map, 'Manual test', 'Prepare')
  let previous = 'Prepare'
  let x = 560
  for (const step of args.steps) {
    nodes.push(code(`guard-${step.requestKey}`, step.guard, [x, 100], args.sandbox, guardTail(step.requestKey, step.allow), 'Throws on any non-GET method or non-allowlisted endpoint.'))
    connect(map, previous, step.guard)
    x += 280
    nodes.push(
      starshipitNode({
        id: `http-${step.requestKey}`,
        name: step.http,
        position: [x, 100],
        queryKeys: step.queryKeys,
        pagination: step.pagination,
        maxPages: args.maxPages,
      }),
    )
    connect(map, step.guard, step.http)
    previous = step.http
    x += 280
  }
  nodes.push(code('summarise', 'Summarise', [x, 100], args.sandbox, args.summarise))
  connect(map, previous, 'Summarise')
  x += 280
  nodes.push(code('dry-run', 'Dry-run log', [x, 100], '', dryRunTail(), 'This is the TESTE output. Telegram is not called.'))
  connect(map, 'Summarise', 'Dry-run log')
  x += 280
  nodes.push(ifNode('send-if', 'Sending enabled?', [x, 100], '={{ $json.dryRun === false && $json.telegramSendingEnabled === true }}'))
  x += 280
  nodes.push(
    telegramNode(
      'telegram',
      'Telegram: send',
      [x, 100],
      '={{ JSON.stringify({ chat_id: $env[$json.chatIdEnv], text: $json.text, disable_web_page_preview: true }) }}',
    ),
  )
  finishSend(map)
  nodes.push(sticky('note', [280, -220], args.note))
  return shell(args.name, nodes, map, args.timezone)
}

function summariseDispatchTail(cron: string, timezone: string): string {
  return `${clock(cron, timezone)}${envClient()}const prepared = $('Prepare').first().json;\nconst report = summariseDispatch({ client, pages: $input.all().map((item) => item.json), now: new Date(), workflowCron: WORKFLOW_CRON, workflowTimezone: WORKFLOW_TIMEZONE });\nreturn [{ json: Object.assign({}, report, { clientAllowsTelegram: prepared.clientAllowsTelegram === true, botTokenEnv: prepared.botTokenEnv, chatIdEnv: prepared.chatIdEnv, dryRun: true, send: false, writes: 'none', telegramSendingEnabled: false }) }];\n`
}

function summarisePickupTail(cron: string, timezone: string): string {
  return `${clock(cron, timezone)}${envClient()}const prepared = $('Prepare').first().json;\nconst report = summarisePickup({ client, printedPages: $('StarShipIt: printed').all().map((item) => item.json), manifestPages: $('StarShipIt: manifests').all().map((item) => item.json), now: new Date(), workflowCron: WORKFLOW_CRON, workflowTimezone: WORKFLOW_TIMEZONE });\nreturn [{ json: Object.assign({}, report, { clientAllowsTelegram: prepared.clientAllowsTelegram === true, botTokenEnv: prepared.botTokenEnv, chatIdEnv: prepared.chatIdEnv, dryRun: true, send: false, writes: 'none', telegramSendingEnabled: false }) }];\n`
}

function summarisePostTail(cron: string, timezone: string): string {
  return `${clock(cron, timezone)}${envClient()}const prepared = $('Prepare').first().json;\nconst report = summarisePostShipping({ client, pages: $input.all().map((item) => item.json), now: new Date(), workflowCron: WORKFLOW_CRON, workflowTimezone: WORKFLOW_TIMEZONE });\nreturn [{ json: Object.assign({}, report, { clientAllowsTelegram: prepared.clientAllowsTelegram === true, botTokenEnv: prepared.botTokenEnv, chatIdEnv: prepared.chatIdEnv, dryRun: true, send: false, writes: 'none', telegramSendingEnabled: false }) }];\n`
}

const ORDER_QUERY = ['status', 'page_size', 'since_last_updated']
const SHIPPED_QUERY = ['page_size', 'since_last_updated']

export function buildAll(): Record<string, ReturnType<typeof shell>> {
  const sandbox = engineSandboxSource()
  const hom = readHom()
  const note = (title: string, extra: string) =>
    `## ${title}\nTESTE workflow. Import inactive. active is false.\n\nRead-only: StarShipIt GET requests that pass the Guard node. No labels, no PUT, no POST to StarShipIt, no Shopify, Sheets, or Postgres writes.\n\nTelegram is disabled. The Dry-run log is the output.\n\nClient config is read at run time. Set FULFILMENT_CLIENT_ID (default hom). Override or add clients with FULFILMENT_CLIENTS_JSON.\n\nFree Gemini tier must not receive real customer addresses.\n\n${extra}`

  const dispatch = reportWorkflow({
    name: 'TESTE – Fulfilment Dispatch',
    sandbox,
    ...hom,
    prepare: 'dispatch',
    steps: [
      {
        guard: 'Guard dispatch',
        allow: 'dispatch',
        http: 'StarShipIt: unshipped',
        requestKey: 'dispatch',
        queryKeys: ORDER_QUERY,
        pagination: 'orders',
      },
    ],
    summarise: summariseDispatchTail(hom.cron, hom.timezone),
    note: note(
      'Dispatch',
      'Unshipped orders use since_last_updated. A listing without a date only returns about 24 hours. The HOM lookback is 120 days and is configurable per client.',
    ),
  })

  const pickup = reportWorkflow({
    name: 'TESTE – Fulfilment Pickup',
    sandbox,
    ...hom,
    prepare: 'pickup',
    steps: [
      {
        guard: 'Guard pickup orders',
        allow: 'pickupOrders',
        http: 'StarShipIt: printed',
        requestKey: 'printed',
        queryKeys: ORDER_QUERY,
        pagination: 'orders',
      },
      {
        guard: 'Guard manifests',
        allow: 'pickupManifests',
        http: 'StarShipIt: manifests',
        requestKey: 'manifests',
        queryKeys: [],
        pagination: 'none',
      },
    ],
    summarise: summarisePickupTail(hom.cron, hom.timezone),
    note: note('Pickup', 'Reads printed orders and manifests. StarShipIt has no pickups endpoint; the summary says to check the carrier portal.'),
  })

  const post = reportWorkflow({
    name: 'TESTE – Fulfilment Post-shipping',
    sandbox,
    ...hom,
    prepare: 'post',
    steps: [
      {
        guard: 'Guard shipped',
        allow: 'postShipping',
        http: 'StarShipIt: shipped',
        requestKey: 'shipped',
        queryKeys: SHIPPED_QUERY,
        pagination: 'shipped',
      },
    ],
    summarise: summarisePostTail(hom.cron, hom.timezone),
    note: note('Post-shipping', 'Reads GET /api/orders/shipped since the client lookback (HOM: 30 days). Exceptions and late in-transit parcels are escalations, not writes.'),
  })

  const coordinator = coordinatorWorkflow(sandbox, hom.cron, hom.timezone, hom.maxPages)
  const addresses = addressWorkflow(sandbox, hom.timezone)
  return {
    'teste-dispatch.json': dispatch,
    'teste-pickup.json': pickup,
    'teste-post-shipping.json': post,
    'teste-addresses.json': addresses,
    'teste-coordinator.json': coordinator,
  }
}

function coordinatorWorkflow(sandbox: string, cron: string, timezone: string, maxPages: number) {
  const summarise = `${clock(cron, timezone)}${envClient()}const prepared = $('Prepare').first().json;\nconst now = new Date();\nconst shared = { client, now, workflowCron: WORKFLOW_CRON, workflowTimezone: WORKFLOW_TIMEZONE };\nconst dispatch = summariseDispatch(Object.assign({}, shared, { pages: $('StarShipIt: unshipped').all().map((item) => item.json) }));\nconst pickup = summarisePickup(Object.assign({}, shared, { printedPages: $('StarShipIt: printed').all().map((item) => item.json), manifestPages: $('StarShipIt: manifests').all().map((item) => item.json) }));\nconst postShipping = summarisePostShipping(Object.assign({}, shared, { pages: $('StarShipIt: shipped').all().map((item) => item.json) }));\nconst routed = routeReports([dispatch, pickup, postShipping]);\nreturn [{ json: Object.assign({}, routed, { reports: [dispatch, pickup, postShipping], clientAllowsTelegram: prepared.clientAllowsTelegram === true, botTokenEnv: prepared.botTokenEnv, chatIdEnv: prepared.chatIdEnv, dryRun: true, send: false, writes: 'none', telegramSendingEnabled: false }) }];\n`
  const steps = [
    { guard: 'Guard dispatch', allow: 'dispatch', http: 'StarShipIt: unshipped', requestKey: 'dispatch', queryKeys: ORDER_QUERY, pagination: 'orders' as const },
    { guard: 'Guard pickup orders', allow: 'pickupOrders', http: 'StarShipIt: printed', requestKey: 'printed', queryKeys: ORDER_QUERY, pagination: 'orders' as const },
    { guard: 'Guard manifests', allow: 'pickupManifests', http: 'StarShipIt: manifests', requestKey: 'manifests', queryKeys: [], pagination: 'none' as const },
    { guard: 'Guard shipped', allow: 'postShipping', http: 'StarShipIt: shipped', requestKey: 'shipped', queryKeys: SHIPPED_QUERY, pagination: 'shipped' as const },
  ]
  const nodes: WfNode[] = [
    ...triggers(cron),
    code('prepare', 'Prepare', [280, 100], sandbox, prepareTail('all'), 'Builds every read-only request for the morning run.'),
  ]
  const map: Conn = {}
  connect(map, 'Schedule 07:30', 'Prepare')
  connect(map, 'Manual test', 'Prepare')
  let previous = 'Prepare'
  let x = 560
  for (const step of steps) {
    nodes.push(code(`guard-${step.requestKey}`, step.guard, [x, 100], sandbox, guardTail(step.requestKey, step.allow), 'Throws on any non-GET method or non-allowlisted endpoint.'))
    connect(map, previous, step.guard)
    x += 260
    nodes.push(starshipitNode({ id: `http-${step.requestKey}`, name: step.http, position: [x, 100], queryKeys: step.queryKeys, pagination: step.pagination, maxPages }))
    connect(map, step.guard, step.http)
    previous = step.http
    x += 260
  }
  nodes.push(code('summarise', 'Summarise', [x, 100], sandbox, summarise))
  connect(map, previous, 'Summarise')
  x += 260
  nodes.push(code('dry-run', 'Dry-run log', [x, 100], '', dryRunTail()))
  connect(map, 'Summarise', 'Dry-run log')
  x += 260
  nodes.push(ifNode('send-if', 'Sending enabled?', [x, 100], '={{ $json.dryRun === false && $json.telegramSendingEnabled === true }}'))
  x += 260
  nodes.push(telegramNode('telegram', 'Telegram: send', [x, 100], '={{ JSON.stringify({ chat_id: $env[$json.chatIdEnv], text: $json.text, disable_web_page_preview: true }) }}'))
  finishSend(map)
  nodes.push(
    sticky(
      'note',
      [280, -240],
      '## Coordinator\nTESTE workflow. Import inactive.\n\nRuns the three read-only morning reports in order and writes one dry-run log. It does not run the address webhook.\n\nLeave this inactive together with the three report workflows, or a later activation would read StarShipIt twice.\n\nNo labels. No StarShipIt writes. Telegram disabled.',
      560,
    ),
  )
  return shell('TESTE – Fulfilment Coordinator', nodes, map, timezone)
}

function addressWorkflow(sandbox: string, timezone: string) {
  const fixed = `${envClient()}const input = addressInputFromWebhook($json);\nconst validation = validateAddress(input, client);\nconst mapsCountry = (client.address.allowedCountries.find((item) => /^[A-Z]{2}$/.test(item)) || 'AU');\nconst response = addressWebhookResponse({ validation, llmSkipped: true, llmSkipReason: client.llm.allowCustomerPii === true ? null : FREE_TIER_PII_REASON });\nreturn [{ json: { validation, response, allowCustomerPii: client.llm.allowCustomerPii === true, mapsCountry, botTokenEnv: client.telegram.botTokenEnv, chatIdEnv: client.telegram.chatIdEnv, dryRun: true, writes: 'none' } }];\n`
  const review = `const response = addressWebhookResponse({ validation: $json.validation, llmSkipped: true, llmSkipReason: FREE_TIER_PII_REASON });\nreturn [{ json: { validation: $json.validation, response, botTokenEnv: $json.botTokenEnv, chatIdEnv: $json.chatIdEnv, dryRun: true, writes: 'none', telegramSendingEnabled: false, send: false } }];\n`
  const checkLlm = `${envClient()}assertConnectedLlm(client, { provider: 'gemini', model: 'models/gemini-2.5-flash' });\nconst prompt = buildAddressPrompt($json.validation);\nreturn [{ json: Object.assign({}, $json, { prompt, dryRun: true, writes: 'none' }) }];\n`
  const parse = `const previous = $('Fixed rules').first().json;\nconst suggestion = parseGeminiSuggestion(String($json.text || $json.output || ''));\nconst response = addressWebhookResponse({ validation: previous.validation, llm: suggestion, mapsConfirmed: false, llmSkipped: false });\nconst mapsQuery = !suggestion.precisa_cliente && suggestion.sugerido.rua && suggestion.sugerido.postcode ? suggestion.sugerido.rua + ', ' + suggestion.sugerido.suburb + ' ' + suggestion.sugerido.estado + ' ' + suggestion.sugerido.postcode + ', Australia' : '';\nreturn [{ json: { validation: previous.validation, suggestion, response, mapsQuery, mapsCountry: previous.mapsCountry, mapsRequest: { method: 'GET', url: MAPS_GEOCODE_URL }, botTokenEnv: previous.botTokenEnv, chatIdEnv: previous.chatIdEnv, dryRun: true, writes: 'none' } }];\n`
  const guardMaps = `const item = $input.first().json;\nassertMapsGet(item.mapsRequest);\nreturn [{ json: item }];\n`
  const checkMaps = `const parsed = $('Parse Gemini').first().json;\nconst confirmed = confirmMaps(parsed.suggestion, $json);\nconst response = addressWebhookResponse({ validation: parsed.validation, llm: parsed.suggestion, mapsConfirmed: confirmed, llmSkipped: false });\nreturn [{ json: { response, orderId: parsed.validation.orderId, mapsStatus: String(($json && $json.status) || ''), botTokenEnv: parsed.botTokenEnv, chatIdEnv: parsed.chatIdEnv, dryRun: true, writes: 'none', telegramSendingEnabled: false, send: false } }];\n`
  const nodes: WfNode[] = [
    {
      id: 'webhook',
      name: 'Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [0, 300],
      webhookId: 'teste-revisao-manual',
      parameters: { httpMethod: 'POST', path: 'teste-revisao-manual', responseMode: 'responseNode', options: {} },
    },
    code('guard', 'Guard StarShipIt', [260, 300], sandbox, `assertAddressesHaveNoStarShipIt($json);\nreturn [{ json: $json }];\n`, 'Throws if the payload asks this agent to call StarShipIt.'),
    code('fixed', 'Fixed rules', [520, 300], sandbox, fixed, 'Fixed rules decide. The webhook cannot turn allowCustomerPii on.'),
    ifNode('passed', 'Passed?', [780, 300], '={{ $json.validation.passou }}'),
    {
      id: 'respond-ok',
      name: 'Respond OK',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [1040, 120],
      parameters: { respondWith: 'json', responseBody: '={{ JSON.stringify($json.response) }}', options: {} },
    },
    ifNode('pii', 'PII allowed?', [1040, 420], '={{ $json.allowCustomerPii === true }}'),
    code('review', 'Review without LLM', [1300, 560], sandbox, review),
    {
      id: 'respond-rules',
      name: 'Respond rules',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [1560, 560],
      parameters: { respondWith: 'json', responseBody: '={{ JSON.stringify($json.response) }}', options: {} },
    },
    code('check-llm', 'Check LLM', [1300, 280], sandbox, checkLlm, 'Swap point: CONNECTED provider is gemini and the model node is Google Gemini Chat Model. Temperature stays 0.'),
    {
      id: 'gemini',
      name: 'Gemini Address',
      type: '@n8n/n8n-nodes-langchain.chainLlm',
      typeVersion: 1.5,
      position: [1560, 280],
      alwaysOutputData: true,
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 3000,
      onError: 'continueRegularOutput',
      parameters: { promptType: 'define', text: '={{ $json.prompt }}' },
    },
    {
      id: 'gemini-model',
      name: 'Google Gemini Chat Model',
      type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
      typeVersion: 1,
      position: [1560, 80],
      notes: 'Default chat model. To swap, connect a different chat-model subnode and change CONNECTED provider in Check LLM. Do not use the free tier for real addresses.',
      parameters: { modelName: 'models/gemini-2.5-flash', options: { temperature: 0 } },
    },
    code('parse', 'Parse Gemini', [1820, 280], sandbox, parse),
    ifNode('geocode', 'Geocode?', [2080, 280], '={{ Boolean($json.mapsQuery) }}'),
    code('guard-maps', 'Guard Maps', [2340, 160], sandbox, guardMaps, 'GET https://maps.googleapis.com/maps/api/geocode/json only. No key and no address in the URL.'),
    {
      id: 'maps',
      name: 'Google Maps Geocoding',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [2600, 160],
      alwaysOutputData: true,
      onError: 'continueRegularOutput',
      notes: 'Credential is selected in n8n (query auth). No key is stored in this workflow.',
      parameters: {
        method: 'GET',
        url: 'https://maps.googleapis.com/maps/api/geocode/json',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpQueryAuth',
        sendQuery: true,
        queryParameters: {
          parameters: [
            { name: 'address', value: '={{ $json.mapsQuery }}' },
            { name: 'components', value: "={{ 'country:' + $json.mapsCountry }}" },
          ],
        },
        options: { timeout: 10000, redirect: { redirect: { followRedirects: false } } },
      },
    },
    code('check-maps', 'Check Maps', [2860, 160], sandbox, checkMaps),
    {
      id: 'respond-review',
      name: 'Respond review',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [3120, 280],
      parameters: { respondWith: 'json', responseBody: '={{ JSON.stringify($json.response) }}', options: {} },
    },
    ifNode('maps-alert', 'Maps alert enabled?', [3120, 480], '={{ false }}'),
    telegramNode(
      'telegram',
      'Telegram: Maps alert',
      [3380, 480],
      '={{ JSON.stringify({ chat_id: $env[$json.chatIdEnv], text: "TESTE address agent: Google Maps did not confirm order " + ($json.orderId || "") + ". The address is not included in this alert.", disable_web_page_preview: true }) }}',
    ),
    sticky(
      'note',
      [260, -20],
      '## Addresses\nTESTE webhook path: teste-revisao-manual (not the production path).\n\nFixed rules decide. The model only suggests a correction when rules fail AND the client has allowCustomerPii true. HOM is false, so real addresses are not sent to Gemini.\n\nFree Gemini tier must not receive real customer addresses.\n\nThis agent never calls StarShipIt and never writes. The response is a suggestion for a person.\n\nTo swap the model, connect another n8n chat-model subnode to Gemini Address and set the same provider in Check LLM.',
      640,
    ),
  ]
  const map: Conn = {}
  connect(map, 'Webhook', 'Guard StarShipIt')
  connect(map, 'Guard StarShipIt', 'Fixed rules')
  connect(map, 'Fixed rules', 'Passed?')
  connect(map, 'Passed?', 'Respond OK', 0)
  connect(map, 'Passed?', 'PII allowed?', 1)
  connect(map, 'PII allowed?', 'Check LLM', 0)
  connect(map, 'PII allowed?', 'Review without LLM', 1)
  connect(map, 'Review without LLM', 'Respond rules')
  connect(map, 'Check LLM', 'Gemini Address')
  connect(map, 'Google Gemini Chat Model', 'Gemini Address', 0, 'ai_languageModel')
  connect(map, 'Gemini Address', 'Parse Gemini')
  connect(map, 'Parse Gemini', 'Geocode?')
  connect(map, 'Geocode?', 'Guard Maps', 0)
  connect(map, 'Geocode?', 'Respond review', 1)
  connect(map, 'Guard Maps', 'Google Maps Geocoding')
  connect(map, 'Google Maps Geocoding', 'Check Maps')
  connect(map, 'Check Maps', 'Respond review')
  connect(map, 'Check Maps', 'Maps alert enabled?')
  connect(map, 'Maps alert enabled?', 'Telegram: Maps alert', 0)
  return shell('TESTE – Fulfilment Addresses', nodes, map, timezone)
}

function writeWorkflows(): void {
  fs.mkdirSync(outDir, { recursive: true })
  const built = buildAll()
  for (const [file, workflow] of Object.entries(built)) {
    fs.writeFileSync(path.join(outDir, file), `${JSON.stringify(workflow, null, 2)}\n`)
  }
}

const entry = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ''
if (import.meta.url === entry) writeWorkflows()
