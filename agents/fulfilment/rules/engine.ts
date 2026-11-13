/**
 * Deterministic fulfilment rules for the Cytron agent team.
 * The LLM never selects a carrier, a box, or an address outcome.
 * HOM is one entry in clients/clients.json. Another client is another entry.
 */

export type Env = Record<string, string | undefined>

export interface CarrierService {
  carrier: string
  service: string
  signature: boolean
}

export interface WeightBand extends CarrierService {
  minKg?: number
  maxKg?: number
  minKgExclusive?: number
  rejectPackaging?: string[]
}

export interface MailboxPattern {
  kind: string
  source: string
}

export interface ClientConfig {
  id: string
  displayName: string
  timezone: string
  schedule: { cron: string }
  starshipit: {
    baseUrlEnv: string
    apiKeyEnv: string
    subscriptionKeyEnv: string
    pageSize: number
    maxPages: number
  }
  telegram: {
    botTokenEnv: string
    chatIdEnv: string
    sendingEnabled: boolean
  }
  llm: {
    provider: string
    model: string
    temperature: number
    allowCustomerPii: boolean
  }
  windows: {
    unshippedLookbackDays: number
    printedLookbackDays: number
    shippedLookbackDays: number
    inTransitEscalateAfterDays: number
  }
  methodPatterns: {
    express: string[]
    australiaPostSigned: string[]
  }
  carrierRules: {
    express: CarrierService
    mailbox: CarrierService
    australiaPostSigned: CarrierService
    envelopeFallback: CarrierService
    standardBands: WeightBand[]
  }
  mailboxPatterns: MailboxPattern[]
  mailboxRes: { kind: string; re: RegExp }[]
  address: {
    allowedCountries: string[]
    rejectMissingCountry: boolean
    requireSuburb: boolean
    stateAliases: Record<string, string>
    postcodeRanges: Record<string, [number, number][]>
    streetTypes: string[]
  }
}

export interface Escalation {
  severity: 'info' | 'review'
  code: string
  orderNumber?: string
  detail: string
}

export interface AgentReport {
  agent: 'dispatch' | 'pickup' | 'post-shipping'
  clientId: string
  dryRun: true
  writes: 'none'
  send: false
  text: string
  stats: Record<string, number>
  escalations: Escalation[]
  scheduleWarning: string | null
}

export interface StarShipItRequest {
  method: string
  url: string
  query: Record<string, string>
}

export interface AllowRule {
  method: 'GET'
  path: string
  statuses?: string[]
}

export const ALLOWLISTS: Record<string, AllowRule[]> = {
  dispatch: [{ method: 'GET', path: '/api/orders', statuses: ['unshipped'] }],
  pickupOrders: [{ method: 'GET', path: '/api/orders', statuses: ['printed'] }],
  pickupManifests: [{ method: 'GET', path: '/api/manifests' }],
  postShipping: [{ method: 'GET', path: '/api/orders/shipped' }],
  addresses: [],
}

const QUERY_KEYS = new Set(['status', 'page_size', 'page', 'page_number', 'since_last_updated'])

/** Aramex and StarTrack do not deliver to PO Boxes, locked bags, or parcel lockers. */
const MAILBOX_CARRIER_DENY = [/aramex/i, /startrack/i]

export const FREE_TIER_PII_REASON =
  'Free Gemini tier must not receive real customer addresses. allowCustomerPii is false for this client, so the model was not called. Review the fixed-rule problems manually. A paid Gemini or Vertex key with a data-processing agreement is required before turning allowCustomerPii on.'

export const MAPS_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json'

const ENV_NAME = /^[A-Z][A-Z0-9_]{2,80}$/

export interface FulfilmentOrder {
  order_id?: string | number
  order_number?: string | number
  status?: string
  carrier_name?: string
  carrier?: string
  carrier_service_name?: string
  carrier_service_code?: string
  shipping_method?: string
  shipping_description?: string
  total_weight?: number
  weight?: number
  weight_unit?: string
  order_date?: string
  printed_date?: string
  shipped_date?: string
  manifest_number?: string
  manifest_sent?: boolean
  tracking_short_status?: string
  tracking_full_status?: string
  reference?: string
  box_name?: string
  packaging_type?: string
  packages?: {
    weight?: number
    name?: string
    package_type?: string
    length?: number
    width?: number
    height?: number
  }[]
  items?: { weight?: number; quantity?: number; description?: string }[]
  destination?: {
    street?: string
    address1?: string
    building?: string
    address2?: string
    company?: string
    suburb?: string
    city?: string
    state?: string
    post_code?: string
    postcode?: string
    country?: string
    name?: string
  }
}

export interface ManifestRecord {
  sent?: boolean
  manifest_sent?: boolean
  status?: string
}

export interface AddressInput {
  order_id?: string
  name?: string
  address1?: string
  address2?: string
  company?: string
  suburb?: string
  state?: string
  postcode?: string
  country?: string
}

export interface AddressProblem {
  code: string
  message: string
}

export interface AddressValidation {
  orderId: string
  name: string
  address1: string
  address2: string
  company: string
  suburb: string
  state: string
  postcode: string
  country: string
  original: string
  passou: boolean
  problemas: AddressProblem[]
  mailbox: string | null
}

export interface GeminiSuggestion {
  sugerido: { rua: string; suburb: string; estado: string; postcode: string }
  motivo: string
  precisa_cliente: boolean
}

export interface ReviewResponse {
  order_id: string
  status: 'ok' | 'revisar' | 'corrigir' | 'contatar_cliente'
  original: string
  sugerido: { rua: string; suburb: string; estado: string; postcode: string }
  motivo: string
  maps_confirmado: boolean
  precisa_cliente: boolean
  problemas: string[]
  problemCodes: string[]
  mailbox: string | null
  llmSkipped: boolean
  llmSkipReason: string | null
  writes: 'none'
  decision: 'rules'
  llmMayOverride: false
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {}
}

function reqString(source: Record<string, unknown>, key: string, ctx: string): string {
  const value = source[key]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${ctx}.${key} must be a non-empty string`)
  }
  return value.trim()
}

function reqEnvName(source: Record<string, unknown>, key: string, ctx: string): string {
  const name = reqString(source, key, ctx)
  if (!ENV_NAME.test(name)) throw new Error(`${ctx}.${key} must be an env var name, not a secret`)
  return name
}

function reqBool(source: Record<string, unknown>, key: string, ctx: string): boolean {
  const value = source[key]
  if (typeof value !== 'boolean') throw new Error(`${ctx}.${key} must be a boolean`)
  return value
}

function reqInt(source: Record<string, unknown>, key: string, ctx: string, min: number, max: number): number {
  const value = source[key]
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${ctx}.${key} must be an integer from ${min} to ${max}`)
  }
  return value
}

function reqService(value: unknown, ctx: string): CarrierService {
  const source = asRecord(value)
  return {
    carrier: reqString(source, 'carrier', ctx),
    service: reqString(source, 'service', ctx),
    signature: reqBool(source, 'signature', ctx),
  }
}

function compileMailbox(patterns: MailboxPattern[], ctx: string): { kind: string; re: RegExp }[] {
  return patterns.map((pattern) => {
    if (pattern.source.length > 200) throw new Error(`${ctx} mailbox pattern is too long`)
    try {
      return { kind: pattern.kind, re: new RegExp(pattern.source, 'i') }
    } catch {
      throw new Error(`${ctx} mailbox pattern ${pattern.kind} is not a valid regular expression`)
    }
  })
}

export function parseClients(input: unknown): Record<string, ClientConfig> {
  const root = asRecord(input)
  const clients = asRecord(root.clients)
  const ids = Object.keys(clients)
  if (ids.length === 0) throw new Error('clients.json needs at least one client')
  if (ids.length > 50) throw new Error('clients.json has too many clients')
  const out: Record<string, ClientConfig> = {}
  for (const id of ids) {
    out[id] = parseClient(id, clients[id])
  }
  return out
}

function parseClient(id: string, value: unknown): ClientConfig {
  const source = asRecord(value)
  const ctx = `client ${id}`
  if (reqString(source, 'id', ctx) !== id) throw new Error(`${ctx} id must match its key`)
  const schedule = asRecord(source.schedule)
  const cron = reqString(schedule, 'cron', `${ctx}.schedule`)
  if (!/^(\d{1,2}) (\d{1,2}) \* \* \*$/.test(cron)) {
    throw new Error(`${ctx}.schedule.cron must be a daily cron "M H * * *"`)
  }
  const starshipit = asRecord(source.starshipit)
  const telegram = asRecord(source.telegram)
  const llm = asRecord(source.llm)
  const windows = asRecord(source.windows)
  const methods = asRecord(source.methodPatterns)
  const carrierRules = asRecord(source.carrierRules)
  const address = asRecord(source.address)
  const patterns = Array.isArray(source.mailboxPatterns) ? source.mailboxPatterns : []
  const mailboxPatterns = patterns.map((pattern, index) => {
    const row = asRecord(pattern)
    return {
      kind: reqString(row, 'kind', `${ctx}.mailboxPatterns[${index}]`),
      source: reqString(row, 'source', `${ctx}.mailboxPatterns[${index}]`),
    }
  })
  if (mailboxPatterns.length === 0) throw new Error(`${ctx} needs mailbox patterns`)
  const bandsIn = Array.isArray(carrierRules.standardBands) ? carrierRules.standardBands : []
  const standardBands = bandsIn.map((band, index) => parseBand(band, `${ctx}.standardBands[${index}]`))
  if (standardBands.length === 0) throw new Error(`${ctx} needs standard carrier bands`)
  const aliasesIn = asRecord(address.stateAliases)
  const stateAliases: Record<string, string> = {}
  for (const key of Object.keys(aliasesIn)) {
    const alias = aliasesIn[key]
    if (typeof alias !== 'string' || alias.trim() === '') throw new Error(`${ctx}.address.stateAliases.${key} is invalid`)
    stateAliases[key.toUpperCase()] = alias.trim().toUpperCase()
  }
  const rangesIn = asRecord(address.postcodeRanges)
  const postcodeRanges: Record<string, [number, number][]> = {}
  for (const state of Object.keys(rangesIn)) {
    const rows = rangesIn[state]
    if (!Array.isArray(rows) || rows.length === 0) throw new Error(`${ctx}.address.postcodeRanges.${state} is invalid`)
    postcodeRanges[state.toUpperCase()] = rows.map((row) => {
      if (!Array.isArray(row) || row.length !== 2 || typeof row[0] !== 'number' || typeof row[1] !== 'number' || row[0] > row[1]) {
        throw new Error(`${ctx}.address.postcodeRanges.${state} has an invalid range`)
      }
      return [row[0], row[1]]
    })
  }
  for (const alias of Object.values(stateAliases)) {
    if (!postcodeRanges[alias]) throw new Error(`${ctx} state alias ${alias} has no postcode range`)
  }
  const streetTypes = Array.isArray(address.streetTypes) ? address.streetTypes.filter((item): item is string => typeof item === 'string' && item.trim() !== '') : []
  if (streetTypes.length === 0) throw new Error(`${ctx} needs street types`)
  const temperature = llm.temperature
  if (typeof temperature !== 'number' || temperature < 0 || temperature > 1) {
    throw new Error(`${ctx}.llm.temperature must be a number from 0 to 1`)
  }
  const expressPatterns = stringList(methods.express, `${ctx}.methodPatterns.express`)
  const signedPatterns = stringList(methods.australiaPostSigned, `${ctx}.methodPatterns.australiaPostSigned`)
  return {
    id,
    displayName: reqString(source, 'displayName', ctx),
    timezone: reqString(source, 'timezone', ctx),
    schedule: { cron },
    starshipit: {
      baseUrlEnv: reqEnvName(starshipit, 'baseUrlEnv', `${ctx}.starshipit`),
      apiKeyEnv: reqEnvName(starshipit, 'apiKeyEnv', `${ctx}.starshipit`),
      subscriptionKeyEnv: reqEnvName(starshipit, 'subscriptionKeyEnv', `${ctx}.starshipit`),
      pageSize: reqInt(starshipit, 'pageSize', `${ctx}.starshipit`, 1, 250),
      maxPages: reqInt(starshipit, 'maxPages', `${ctx}.starshipit`, 1, 20),
    },
    telegram: {
      botTokenEnv: reqEnvName(telegram, 'botTokenEnv', `${ctx}.telegram`),
      chatIdEnv: reqEnvName(telegram, 'chatIdEnv', `${ctx}.telegram`),
      sendingEnabled: reqBool(telegram, 'sendingEnabled', `${ctx}.telegram`),
    },
    llm: {
      provider: reqString(llm, 'provider', `${ctx}.llm`),
      model: reqString(llm, 'model', `${ctx}.llm`),
      temperature,
      allowCustomerPii: reqBool(llm, 'allowCustomerPii', `${ctx}.llm`),
    },
    windows: {
      unshippedLookbackDays: reqInt(windows, 'unshippedLookbackDays', `${ctx}.windows`, 1, 3660),
      printedLookbackDays: reqInt(windows, 'printedLookbackDays', `${ctx}.windows`, 1, 366),
      shippedLookbackDays: reqInt(windows, 'shippedLookbackDays', `${ctx}.windows`, 1, 366),
      inTransitEscalateAfterDays: reqInt(windows, 'inTransitEscalateAfterDays', `${ctx}.windows`, 1, 60),
    },
    methodPatterns: { express: expressPatterns, australiaPostSigned: signedPatterns },
    carrierRules: {
      express: reqService(carrierRules.express, `${ctx}.carrierRules.express`),
      mailbox: reqService(carrierRules.mailbox, `${ctx}.carrierRules.mailbox`),
      australiaPostSigned: reqService(carrierRules.australiaPostSigned, `${ctx}.carrierRules.australiaPostSigned`),
      envelopeFallback: reqService(carrierRules.envelopeFallback, `${ctx}.carrierRules.envelopeFallback`),
      standardBands,
    },
    mailboxPatterns,
    mailboxRes: compileMailbox(mailboxPatterns, ctx),
    address: {
      allowedCountries: stringList(address.allowedCountries, `${ctx}.address.allowedCountries`).map((item) => item.toUpperCase()),
      rejectMissingCountry: reqBool(address, 'rejectMissingCountry', `${ctx}.address`),
      requireSuburb: reqBool(address, 'requireSuburb', `${ctx}.address`),
      stateAliases,
      postcodeRanges,
      streetTypes,
    },
  }
}

function parseBand(value: unknown, ctx: string): WeightBand {
  const source = asRecord(value)
  const band: WeightBand = { ...reqService(source, ctx) }
  if (typeof source.minKg === 'number') band.minKg = source.minKg
  if (typeof source.maxKg === 'number') band.maxKg = source.maxKg
  if (typeof source.minKgExclusive === 'number') band.minKgExclusive = source.minKgExclusive
  if (band.minKg === undefined && band.maxKg === undefined && band.minKgExclusive === undefined) {
    throw new Error(`${ctx} needs a weight bound`)
  }
  if (Array.isArray(source.rejectPackaging)) {
    band.rejectPackaging = source.rejectPackaging.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
  }
  return band
}

function stringList(value: unknown, ctx: string): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== 'string' || item.trim() === '')) {
    throw new Error(`${ctx} must be a list of non-empty strings`)
  }
  return value.map((item) => item.trim())
}

export function selectClient(clients: Record<string, ClientConfig>, clientId: string): ClientConfig {
  const client = clients[clientId]
  if (!client) {
    throw new Error(`Unknown fulfilment client "${clientId}". Known clients: ${Object.keys(clients).sort().join(', ') || '(none)'}`)
  }
  return client
}

export function clientsForEnv(env: Env, embedded: Record<string, ClientConfig>): Record<string, ClientConfig> {
  const raw = env.FULFILMENT_CLIENTS_JSON
  if (typeof raw !== 'string' || raw.trim() === '') return embedded
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('FULFILMENT_CLIENTS_JSON is not valid JSON')
  }
  return { ...embedded, ...parseClients(parsed) }
}

export function resolveClient(env: Env, clients: Record<string, ClientConfig>): ClientConfig {
  const clientId = (env.FULFILMENT_CLIENT_ID || 'hom').trim() || 'hom'
  return selectClient(clients, clientId)
}

export function assertEnvPresent(env: Env, name: string): void {
  const value = env[name]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing env var: ${name}`)
  }
}

export function requireBaseUrl(env: Env, client: ClientConfig): string {
  assertEnvPresent(env, client.starshipit.baseUrlEnv)
  return String(env[client.starshipit.baseUrlEnv]).trim().replace(/\/+$/, '')
}

export function formatDateInZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value
  if (!year || !month || !day) throw new Error(`Could not format a date in ${timeZone}`)
  return `${year}-${month}-${day}`
}

export function calendarDaysAgo(now: Date, days: number, timeZone: string): string {
  const today = formatDateInZone(now, timeZone)
  const [year, month, day] = today.split('-').map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day))
  utc.setUTCDate(utc.getUTCDate() - days)
  return utc.toISOString().slice(0, 10)
}

export function scheduleMismatch(client: ClientConfig, workflowCron: string, workflowTimezone: string): string | null {
  if (client.schedule.cron === workflowCron && client.timezone === workflowTimezone) return null
  return `Client ${client.id} expects cron ${client.schedule.cron} in ${client.timezone}, but this workflow is baked as ${workflowCron} in ${workflowTimezone}.`
}

export function normaliseKg(weight: number): number {
  if (!Number.isFinite(weight)) return weight
  return Math.round(weight * 1000) / 1000
}

export function detectMailbox(text: string, client: ClientConfig): string | null {
  const haystack = text || ''
  for (const pattern of client.mailboxRes) {
    if (pattern.re.test(haystack)) return pattern.kind
  }
  return null
}

export function orderAddressText(order: FulfilmentOrder): string {
  const destination = order.destination || {}
  return [
    destination.street,
    destination.address1,
    destination.building,
    destination.address2,
    destination.company,
    destination.suburb,
    destination.city,
  ]
    .filter((part) => typeof part === 'string' && part.trim() !== '')
    .join('\n')
}

export function orderPackagingText(order: FulfilmentOrder): string {
  const parts = [order.box_name, order.packaging_type]
  for (const pkg of order.packages || []) parts.push(pkg.name, pkg.package_type)
  return parts.filter((part) => typeof part === 'string' && part.trim() !== '').join(' ')
}

export function orderWeightKg(order: FulfilmentOrder): number | null {
  let weight: number | null = null
  if (typeof order.total_weight === 'number') weight = order.total_weight
  else if (typeof order.weight === 'number') weight = order.weight
  else if (Array.isArray(order.packages) && order.packages.length > 0) {
    weight = order.packages.reduce((sum, pkg) => sum + (Number(pkg.weight) || 0), 0)
  } else if (Array.isArray(order.items) && order.items.length > 0) {
    weight = order.items.reduce((sum, item) => sum + (Number(item.weight) || 0) * (Number(item.quantity) || 1), 0)
  }
  if (weight === null || !Number.isFinite(weight)) return null
  const unit = String(order.weight_unit || '').trim().toLowerCase()
  if (unit === 'g' || unit === 'gram' || unit === 'grams') weight = weight / 1000
  return normaliseKg(weight)
}

export function orderNumberOf(order: FulfilmentOrder): string {
  const value = order.order_number ?? order.order_id
  return value === undefined || value === null ? '' : String(value)
}

function methodMatches(method: string, patterns: string[]): boolean {
  const haystack = method.toLowerCase()
  return patterns.some((pattern) => haystack.includes(pattern.toLowerCase()))
}

function carrierDeniedForMailbox(carrier: string): boolean {
  return MAILBOX_CARRIER_DENY.some((pattern) => pattern.test(carrier))
}

export interface CarrierInput {
  shippingMethod: string
  weightKg: number | null
  packagingText: string
  addressText: string
}

export interface CarrierDecision {
  carrier: string | null
  service: string | null
  signature: boolean
  mailbox: string | null
  escalations: Escalation[]
}

function decisionFrom(service: CarrierService, mailbox: string | null, escalations: Escalation[] = []): CarrierDecision {
  return {
    carrier: service.carrier,
    service: service.service,
    signature: service.signature,
    mailbox,
    escalations,
  }
}

export function chooseCarrier(input: CarrierInput, client: ClientConfig): CarrierDecision {
  const method = input.shippingMethod || ''
  const mailbox = detectMailbox(input.addressText, client)
  if (mailbox) {
    const escalations: Escalation[] = []
    if (methodMatches(method, client.methodPatterns.express)) {
      escalations.push({
        severity: 'review',
        code: 'express_to_mailbox',
        detail: 'Express method to a mailbox. Suggested service is the mailbox service, not Express.',
      })
    }
    if (carrierDeniedForMailbox(client.carrierRules.mailbox.carrier)) {
      escalations.push({
        severity: 'review',
        code: 'mailbox_carrier_denied',
        detail: `Mailbox carrier "${client.carrierRules.mailbox.carrier}" is Aramex or StarTrack and was refused.`,
      })
      return { carrier: null, service: null, signature: false, mailbox, escalations }
    }
    return decisionFrom(client.carrierRules.mailbox, mailbox, escalations)
  }
  if (methodMatches(method, client.methodPatterns.express)) {
    return decisionFrom(client.carrierRules.express, null)
  }
  if (methodMatches(method, client.methodPatterns.australiaPostSigned)) {
    return decisionFrom(client.carrierRules.australiaPostSigned, null)
  }
  if (input.weightKg === null || input.weightKg <= 0) {
    return {
      carrier: null,
      service: null,
      signature: false,
      mailbox: null,
      escalations: [{ severity: 'info', code: 'weight_missing', detail: 'No positive weight, so no standard carrier was chosen.' }],
    }
  }
  const weight = normaliseKg(input.weightKg)
  const band = client.carrierRules.standardBands.find((item) => bandMatches(item, weight))
  if (!band) {
    return {
      carrier: null,
      service: null,
      signature: false,
      mailbox: null,
      escalations: [{ severity: 'review', code: 'no_carrier_band', detail: `No standard band covers ${weight} kg.` }],
    }
  }
  const packaging = (input.packagingText || '').toLowerCase()
  const rejected = (band.rejectPackaging || []).some((marker) => packaging.includes(marker.toLowerCase()))
  if (rejected) {
    return decisionFrom(client.carrierRules.envelopeFallback, null, [
      {
        severity: 'info',
        code: 'envelope_excluded_from_startrack',
        detail: 'Envelope or satchel is excluded from the StarTrack band. Fallback service was used.',
      },
    ])
  }
  return decisionFrom(band, null)
}

function bandMatches(band: WeightBand, weight: number): boolean {
  if (band.minKgExclusive !== undefined && !(weight > band.minKgExclusive)) return false
  if (band.minKg !== undefined && !(weight >= band.minKg)) return false
  if (band.maxKg !== undefined && !(weight <= band.maxKg)) return false
  return true
}

export function assertStarShipItReadOnly(request: StarShipItRequest, allow: AllowRule[], expectedBaseUrl: string): void {
  const method = String(request.method || '').toUpperCase()
  if (method !== 'GET') {
    throw new Error(`Blocked non-GET StarShipIt method: ${method || '(empty)'}`)
  }
  let url: URL
  try {
    url = new URL(request.url)
  } catch {
    throw new Error('Blocked StarShipIt call with an invalid URL')
  }
  if (url.protocol !== 'https:') throw new Error('Blocked non-HTTPS StarShipIt call')
  let expected: URL
  try {
    expected = new URL(expectedBaseUrl)
  } catch {
    throw new Error('Blocked StarShipIt call because the client base URL is invalid')
  }
  const path = url.pathname.replace(/\/+$/, '') || '/'
  if (url.origin !== expected.origin) {
    throw new Error(`Blocked non-allowlisted StarShipIt endpoint: ${path}`)
  }
  const rule = allow.find((item) => item.method === 'GET' && item.path === path)
  if (!rule) throw new Error(`Blocked non-allowlisted StarShipIt endpoint: ${path}`)
  const query = request.query || {}
  for (const key of Object.keys(query)) {
    if (!QUERY_KEYS.has(key)) throw new Error(`Blocked non-allowlisted StarShipIt query parameter: ${key}`)
  }
  if (rule.statuses) {
    const status = query.status
    if (!status || !rule.statuses.includes(status)) {
      throw new Error(`Blocked non-allowlisted StarShipIt status: ${status || '(empty)'}`)
    }
  } else if (query.status) {
    throw new Error(`Blocked non-allowlisted StarShipIt status: ${query.status}`)
  }
}

export function assertMapsGet(request: { method: string; url: string }): void {
  const method = String(request.method || '').toUpperCase()
  if (method !== 'GET') throw new Error(`Blocked non-GET geocode method: ${method || '(empty)'}`)
  let url: URL
  try {
    url = new URL(request.url)
  } catch {
    throw new Error('Blocked geocode call with an invalid URL')
  }
  const allowed = new URL(MAPS_GEOCODE_URL)
  if (url.origin !== allowed.origin || url.pathname !== allowed.pathname) {
    throw new Error(`Blocked non-allowlisted geocode endpoint: ${url.pathname}`)
  }
  if (url.searchParams.has('key') || url.searchParams.has('address')) {
    throw new Error('Blocked geocode URL that embeds a key or an address. Use the n8n query-auth credential and a separate address parameter.')
  }
}

export function assertAddressesHaveNoStarShipIt(payload: unknown): void {
  const record = asRecord(payload)
  const body = asRecord(record.body)
  const request = record.request || body.request
  if (!request) return
  const req = asRecord(request)
  const method = String(req.method || '')
  const url = String(req.url || '')
  if (!method || !url) {
    throw new Error('Blocked StarShipIt call from the address agent. This agent never calls StarShipIt.')
  }
  assertStarShipItReadOnly(
    { method, url, query: isRecord(req.query) ? (req.query as Record<string, string>) : {} },
    [],
    'https://starshipit.invalid',
  )
}

export function buildOrdersRequest(args: {
  baseUrl: string
  path: '/api/orders' | '/api/orders/shipped'
  status?: string
  sinceLastUpdated: string
  pageSize: number
}): StarShipItRequest {
  const query: Record<string, string> = {
    page_size: String(args.pageSize),
    since_last_updated: args.sinceLastUpdated,
  }
  if (args.status) query.status = args.status
  return { method: 'GET', url: `${args.baseUrl}${args.path}`, query }
}

export function buildManifestRequest(baseUrl: string): StarShipItRequest {
  return { method: 'GET', url: `${baseUrl}/api/manifests`, query: {} }
}

export function assertConnectedLlm(client: ClientConfig, connected: { provider: string; model: string }): void {
  if (client.llm.temperature !== 0) throw new Error('Address LLM temperature must be 0.')
  if (client.llm.allowCustomerPii !== true) throw new Error(FREE_TIER_PII_REASON)
  if (client.llm.provider !== connected.provider) {
    throw new Error(
      `Client llm.provider "${client.llm.provider}" does not match the connected chat model "${connected.provider}". Swap the chat-model subnode, then set CONNECTED_LLM in the Check LLM node.`,
    )
  }
  if (connected.provider === 'gemini' && client.llm.model !== connected.model) {
    throw new Error(`Client llm.model "${client.llm.model}" does not match the Gemini node "${connected.model}".`)
  }
}

function problem(code: string, message: string): AddressProblem {
  return { code, message }
}

export function addressInputFromWebhook(payload: unknown): AddressInput {
  const record = asRecord(payload)
  const body = isRecord(record.body) ? record.body : record
  const pick = (key: string): string => (typeof body[key] === 'string' ? String(body[key]).trim() : '')
  return {
    order_id: pick('order_id'),
    name: pick('name'),
    address1: pick('address1') || pick('street'),
    address2: pick('address2') || pick('building'),
    company: pick('company'),
    suburb: pick('suburb'),
    state: pick('state'),
    postcode: pick('postcode') || pick('post_code'),
    country: pick('country'),
  }
}

export function validateAddress(input: AddressInput, client: ClientConfig): AddressValidation {
  const address1 = (input.address1 || '').trim()
  const address2 = (input.address2 || '').trim()
  const company = (input.company || '').trim()
  const suburb = (input.suburb || '').trim()
  const rawState = (input.state || '').trim()
  const postcode = (input.postcode || '').trim()
  const country = (input.country || '').trim()
  const problemas: AddressProblem[] = []
  const street = [address1, address2].filter(Boolean).join(', ')
  const mailbox = detectMailbox([street, company, suburb].filter(Boolean).join('\n'), client)
  if (!/\d/.test([street, company].filter(Boolean).join(' '))) {
    problemas.push(problem('street_number_missing', 'Street number missing'))
  }
  const types = client.address.streetTypes.map(escapeRegExp).join('|')
  const typed = new RegExp(`[A-Za-z]{2,}\\.?\\s+(?:${types})\\b\\.?`, 'i')
  if (!mailbox && !typed.test(street)) {
    problemas.push(problem('street_type_unrecognised', 'Street type not identified'))
  }
  const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
  if (suburb && [address1, address2].some((line) => norm(line.replace(/\d+/g, '')) === norm(suburb) || norm(line) === norm(suburb))) {
    problemas.push(problem('suburb_repeated_on_street_line', 'Suburb is repeated on its own in the street line'))
  }
  if (client.address.requireSuburb && !suburb) {
    problemas.push(problem('suburb_missing', 'Suburb missing'))
  }
  const aliasKey = rawState.toUpperCase().replace(/\./g, '').replace(/\s+/g, ' ').trim()
  const state = client.address.stateAliases[aliasKey] || aliasKey
  if (!/^\d{4}$/.test(postcode)) {
    problemas.push(problem('postcode_invalid', 'Invalid postcode'))
  } else if (!client.address.postcodeRanges[state]) {
    problemas.push(problem('state_invalid', 'Invalid state'))
  } else if (!client.address.postcodeRanges[state].some(([start, end]) => Number(postcode) >= start && Number(postcode) <= end)) {
    problemas.push(problem('postcode_state_mismatch', 'Postcode does not belong to the state'))
  }
  const countryKey = country.toUpperCase()
  if (!country && client.address.rejectMissingCountry) {
    problemas.push(problem('country_missing', 'Country missing'))
  } else if (country && !client.address.allowedCountries.includes(countryKey)) {
    problemas.push(problem('country_not_allowed', 'Country is not allowed for this client'))
  }
  const original = `${[address1, address2].filter(Boolean).join(' / ')}, ${suburb} ${state} ${postcode}`.trim()
  return {
    orderId: (input.order_id || '').trim(),
    name: (input.name || '').trim(),
    address1,
    address2,
    company,
    suburb,
    state,
    postcode,
    country: country || 'AU',
    original,
    passou: problemas.length === 0,
    problemas,
    mailbox,
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function buildAddressPrompt(validation: AddressValidation): string {
  const problems = validation.problemas.map((item) => item.message).join('; ')
  return [
    'You suggest a correction for one postal address that already failed fixed rules.',
    'You do not decide the outcome and you cannot override the fixed rules.',
    'Do not invent a street number, suburb, state, or postcode.',
    'If a piece is missing, leave it empty and set precisa_cliente to true.',
    'Reply with strict JSON only, no markdown:',
    '{"sugerido":{"rua":"","suburb":"","estado":"","postcode":""},"motivo":"","precisa_cliente":false}',
    '',
    `Order: ${validation.orderId}`,
    `Line 1: ${validation.address1}`,
    `Line 2: ${validation.address2}`,
    `Suburb: ${validation.suburb}`,
    `State: ${validation.state}`,
    `Postcode: ${validation.postcode}`,
    `Problems from the fixed rules: ${problems}`,
  ].join('\n')
}

export function parseGeminiSuggestion(text: string): GeminiSuggestion {
  const cleaned = String(text || '').replace(/```json|```/g, '').trim()
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    return { sugerido: { rua: '', suburb: '', estado: '', postcode: '' }, motivo: 'Gemini response was not valid JSON', precisa_cliente: true }
  }
  const record = asRecord(parsed)
  const suggested = asRecord(record.sugerido)
  const suggestion: GeminiSuggestion = {
    sugerido: {
      rua: typeof suggested.rua === 'string' ? suggested.rua : '',
      suburb: typeof suggested.suburb === 'string' ? suggested.suburb : '',
      estado: typeof suggested.estado === 'string' ? suggested.estado : '',
      postcode: typeof suggested.postcode === 'string' ? suggested.postcode : '',
    },
    motivo: typeof record.motivo === 'string' ? record.motivo : '',
    precisa_cliente: record.precisa_cliente === true,
  }
  if (!suggestion.sugerido.rua || !suggestion.sugerido.postcode) suggestion.precisa_cliente = true
  return suggestion
}

export function confirmMaps(suggestion: GeminiSuggestion, mapsBody: unknown): boolean {
  if (suggestion.precisa_cliente) return false
  const record = asRecord(mapsBody)
  if (record.status !== 'OK' || !Array.isArray(record.results) || record.results.length === 0) return false
  const first = asRecord(record.results[0])
  const components = Array.isArray(first.address_components) ? first.address_components : []
  const locality = components.map(asRecord).find((component) => Array.isArray(component.types) && component.types.includes('locality'))
  const postal = components.map(asRecord).find((component) => Array.isArray(component.types) && component.types.includes('postal_code'))
  if (!locality || !postal) return false
  return String(locality.long_name || '').toLowerCase() === suggestion.sugerido.suburb.toLowerCase()
    && String(postal.long_name || '') === suggestion.sugerido.postcode
}

export function addressWebhookResponse(args: {
  validation: AddressValidation
  llm?: GeminiSuggestion | null
  mapsConfirmed?: boolean
  llmSkipped: boolean
  llmSkipReason?: string | null
}): ReviewResponse {
  const validation = args.validation
  const base = {
    order_id: validation.orderId,
    original: validation.original,
    problemas: validation.problemas.map((item) => item.message),
    problemCodes: validation.problemas.map((item) => item.code),
    mailbox: validation.mailbox,
    writes: 'none' as const,
    decision: 'rules' as const,
    llmMayOverride: false as const,
  }
  if (validation.passou) {
    return {
      ...base,
      status: 'ok',
      sugerido: {
        rua: [validation.address1, validation.address2].filter(Boolean).join(', '),
        suburb: validation.suburb,
        estado: validation.state,
        postcode: validation.postcode,
      },
      motivo: '',
      maps_confirmado: false,
      precisa_cliente: false,
      llmSkipped: true,
      llmSkipReason: null,
    }
  }
  if (args.llmSkipped || !args.llm) {
    return {
      ...base,
      status: 'revisar',
      sugerido: { rua: '', suburb: '', estado: '', postcode: '' },
      motivo: validation.problemas.map((item) => item.message).join('; '),
      maps_confirmado: false,
      precisa_cliente: true,
      llmSkipped: true,
      llmSkipReason: args.llmSkipReason || FREE_TIER_PII_REASON,
    }
  }
  const llm = args.llm
  const needsCustomer = llm.precisa_cliente || !llm.sugerido.rua || !llm.sugerido.postcode
  return {
    ...base,
    status: needsCustomer ? 'contatar_cliente' : 'corrigir',
    sugerido: llm.sugerido,
    motivo: llm.motivo || validation.problemas.map((item) => item.message).join('; '),
    maps_confirmado: args.mapsConfirmed === true,
    precisa_cliente: needsCustomer,
    llmSkipped: false,
    llmSkipReason: null,
  }
}

export function extractOrders(pages: unknown[]): { orders: FulfilmentOrder[]; apiError: boolean } {
  const orders: FulfilmentOrder[] = []
  let apiError = false
  for (const page of pages) {
    const record = asRecord(page)
    if (record.success === false || record.succeeded === false) apiError = true
    const statusCode = Number(record.statusCode)
    if (Number.isFinite(statusCode) && statusCode >= 400) apiError = true
    const data = asRecord(record.data)
    const list = Array.isArray(data.orders) ? data.orders : Array.isArray(record.orders) ? record.orders : []
    for (const item of list) {
      if (isRecord(item)) orders.push(item as FulfilmentOrder)
    }
  }
  return { orders: dedupeOrders(orders), apiError }
}

export function extractManifests(pages: unknown[]): { manifests: ManifestRecord[]; apiError: boolean } {
  const manifests: ManifestRecord[] = []
  let apiError = false
  for (const page of pages) {
    const record = asRecord(page)
    if (record.success === false || record.succeeded === false) apiError = true
    const statusCode = Number(record.statusCode)
    if (Number.isFinite(statusCode) && statusCode >= 400) apiError = true
    const data = asRecord(record.data)
    const list = Array.isArray(record.manifests) ? record.manifests : Array.isArray(data.manifests) ? data.manifests : []
    for (const item of list) {
      if (isRecord(item)) manifests.push(item as ManifestRecord)
    }
  }
  return { manifests, apiError }
}

function dedupeOrders(orders: FulfilmentOrder[]): FulfilmentOrder[] {
  const seen = new Set<string>()
  const out: FulfilmentOrder[] = []
  for (const order of orders) {
    const key = order.order_id ?? order.order_number
    if (key === undefined || key === null || key === '') {
      out.push(order)
      continue
    }
    const id = String(key)
    if (seen.has(id)) continue
    seen.add(id)
    out.push(order)
  }
  return out
}

function parseTimestamp(value: unknown): number {
  if (typeof value !== 'string' || value.trim() === '') return NaN
  const text = value.trim()
  const normalised = /Z$|[+-]\d\d:\d\d$/.test(text) ? text : `${text}Z`
  return new Date(normalised).getTime()
}

function hasOwn(order: FulfilmentOrder, key: keyof FulfilmentOrder): boolean {
  return Object.prototype.hasOwnProperty.call(order, key)
}

function capEscalations(items: Escalation[]): Escalation[] {
  if (items.length <= 50) return items
  return [
    ...items.slice(0, 50),
    { severity: 'review', code: 'escalations_truncated', detail: `${items.length - 50} more escalations were omitted from this payload.` },
  ]
}

function listTail(values: string[]): string {
  if (values.length === 0) return ''
  const head = values.slice(0, 10).join(', ')
  return values.length > 10 ? `${head} … +${values.length - 10}` : head
}

function finishReport(args: {
  agent: AgentReport['agent']
  client: ClientConfig
  lines: string[]
  stats: Record<string, number>
  escalations: Escalation[]
  workflowCron: string
  workflowTimezone: string
}): AgentReport {
  const scheduleWarning = scheduleMismatch(args.client, args.workflowCron, args.workflowTimezone)
  const escalations = [...args.escalations]
  if (scheduleWarning) {
    escalations.push({ severity: 'review', code: 'schedule_mismatch', detail: scheduleWarning })
  }
  const capped = capEscalations(escalations)
  const lines = [...args.lines]
  if (capped.length === 0) lines.push('Escalations: 0')
  else {
    lines.push(`Escalations: ${capped.length}`)
    for (const item of capped.slice(0, 10)) {
      lines.push(`• [${item.severity}] ${item.code}${item.orderNumber ? ` ${item.orderNumber}` : ''}: ${item.detail}`)
    }
  }
  lines.push('Writes: none. Dry-run: Telegram was not sent.')
  return {
    agent: args.agent,
    clientId: args.client.id,
    dryRun: true,
    writes: 'none',
    send: false,
    text: lines.join('\n'),
    stats: args.stats,
    escalations: capped,
    scheduleWarning,
  }
}

export function summariseDispatch(args: {
  client: ClientConfig
  pages: unknown[]
  now: Date
  workflowCron: string
  workflowTimezone: string
}): AgentReport {
  const { orders, apiError } = extractOrders(args.pages)
  const escalations: Escalation[] = []
  if (apiError) escalations.push({ severity: 'review', code: 'api_error', detail: 'The StarShipIt listing returned an error.' })
  const lines = [
    `Dispatch (StarShipIt, read-only)`,
    `Client: ${args.client.displayName} (${args.client.id})`,
    `Unshipped: ${orders.length}`,
  ]
  if (orders.length === 0) {
    if (apiError) lines.push('The API returned an error, please check.')
    return finishReport({ ...args, agent: 'dispatch', lines, stats: { unshipped: 0, apiError: apiError ? 1 : 0 }, escalations })
  }
  let noService = 0
  let noWeight = 0
  let weightMissingOnListing = 0
  let noBox = 0
  let hold = 0
  let statusMissing = true
  const byService: Record<string, number> = {}
  for (const order of orders) {
    const service = order.carrier_service_name || order.carrier_service_code || ''
    if (!service) noService += 1
    const bucket = `${order.carrier_name || order.carrier || 'no carrier'} / ${service || 'no service'}`
    byService[bucket] = (byService[bucket] || 0) + 1
    const weight = orderWeightKg(order)
    const weightKnown = hasOwn(order, 'total_weight') || hasOwn(order, 'weight') || Array.isArray(order.packages) || Array.isArray(order.items)
    if (!weightKnown || weight === null) weightMissingOnListing += 1
    else if (weight <= 0) noWeight += 1
    const boxed = Array.isArray(order.packages)
      ? order.packages.length > 0 && order.packages.some((pkg) => pkg.length || pkg.width || pkg.height || pkg.package_type || pkg.name)
      : !!(order.reference && String(order.reference).trim())
    if (!boxed) noBox += 1
    if (hasOwn(order, 'status')) {
      statusMissing = false
      if (/hold|on.?hold|retid|paus/i.test(String(order.status))) {
        hold += 1
        escalations.push({ severity: 'review', code: 'on_hold', orderNumber: orderNumberOf(order), detail: 'Order is on hold.' })
      }
    }
    const decision = chooseCarrier({
      shippingMethod: order.shipping_method || order.shipping_description || '',
      weightKg: weight,
      packagingText: orderPackagingText(order),
      addressText: orderAddressText(order),
    }, args.client)
    const current = `${order.carrier_name || ''} ${order.carrier || ''} ${order.carrier_service_name || ''} ${order.shipping_method || ''}`
    if (decision.mailbox && /aramex/i.test(current)) {
      escalations.push({
        severity: 'review',
        code: 'po_box_on_aramex',
        orderNumber: orderNumberOf(order),
        detail: 'Mailbox order is currently on Aramex. Aramex does not deliver to PO Boxes, parcel lockers, or private bags.',
      })
    } else if (decision.mailbox && !/australia post|auspost|\bap\b/i.test(current)) {
      escalations.push({
        severity: 'review',
        code: 'po_box_missing_carrier',
        orderNumber: orderNumberOf(order),
        detail: 'Mailbox order is not on Australia Post.',
      })
    }
    for (const item of decision.escalations) {
      if (item.code === 'express_to_mailbox' || item.code === 'mailbox_carrier_denied') {
        escalations.push({ ...item, orderNumber: orderNumberOf(order) })
      }
      if (item.code === 'no_carrier_band' && weight !== null && weight > 0) {
        escalations.push({ ...item, orderNumber: orderNumberOf(order) })
      }
    }
  }
  lines.push(`No service/carrier: ${noService}`)
  lines.push(`No box: ${noBox}`)
  lines.push(`No weight: ${weightMissingOnListing === orders.length ? 'n/a (the listing has no weight)' : noWeight}`)
  lines.push(`On hold: ${statusMissing ? 'n/a (no status field)' : hold}`)
  lines.push('By carrier/service:')
  for (const [name, count] of Object.entries(byService).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
    lines.push(`• ${name}: ${count}`)
  }
  const dated = orders
    .map((order) => ({ n: orderNumberOf(order), d: order.order_date }))
    .filter((item) => item.d)
    .sort((a, b) => String(a.d).localeCompare(String(b.d)))
  const oldest = dated[0]
  if (oldest?.d) {
    const parsed = parseTimestamp(oldest.d)
    const days = Number.isFinite(parsed) ? Math.floor((args.now.getTime() - parsed) / 86400000) : null
    lines.push(`Oldest: order ${oldest.n} (${String(oldest.d).slice(0, 10)}${days !== null ? `, ${days} days` : ''})`)
  }
  return finishReport({
    ...args,
    agent: 'dispatch',
    lines,
    stats: { unshipped: orders.length, noService, noBox, noWeight, hold, apiError: apiError ? 1 : 0 },
    escalations,
  })
}

export function summarisePickup(args: {
  client: ClientConfig
  printedPages: unknown[]
  manifestPages: unknown[]
  now: Date
  workflowCron: string
  workflowTimezone: string
}): AgentReport {
  const printed = extractOrders(args.printedPages)
  const manifests = extractManifests(args.manifestPages)
  const today = formatDateInZone(args.now, args.client.timezone)
  const todays = printed.orders.filter((order) => {
    const stamp = parseTimestamp(order.printed_date || order.shipped_date)
    if (!Number.isFinite(stamp)) return false
    return formatDateInZone(new Date(stamp), args.client.timezone) === today
  })
  const lines = [`Pickup (StarShipIt, read-only)`, `Client: ${args.client.displayName} (${args.client.id})`]
  const escalations: Escalation[] = []
  if (printed.apiError) escalations.push({ severity: 'review', code: 'api_error', detail: 'The printed-orders API returned an error.' })
  if (manifests.apiError) escalations.push({ severity: 'review', code: 'api_error', detail: 'The manifests API returned an error.' })
  if (todays.length === 0) lines.push('Labels printed today: 0 orders.')
  else {
    lines.push(`Labels printed today: ${todays.length}`)
    const byCarrier: Record<string, number> = {}
    for (const order of todays) {
      const name = order.carrier_name || order.carrier || 'no carrier'
      byCarrier[name] = (byCarrier[name] || 0) + 1
    }
    for (const [name, count] of Object.entries(byCarrier).sort((a, b) => b[1] - a[1])) lines.push(`• ${name}: ${count}`)
    const noManifest = todays.filter((order) => !order.manifest_number).length
    const manifestNotSent = todays.filter((order) => order.manifest_number && !order.manifest_sent).length
    lines.push(`No manifest: ${noManifest} | Manifest not sent: ${manifestNotSent}`)
  }
  lines.push(`Printed in the account (all returned): ${printed.orders.length}`)
  if (manifests.apiError) lines.push('Manifests: error querying the API.')
  else if (manifests.manifests.length === 0) lines.push('Open manifests: 0.')
  else {
    const open = manifests.manifests.filter((item) => item.sent === false || item.manifest_sent === false || /open|abert|pending/i.test(String(item.status || '')))
    lines.push(`Manifests: ${manifests.manifests.length} returned, ${open.length} open or unsent.`)
    if (open.length > 0) escalations.push({ severity: 'review', code: 'open_manifest', detail: `${open.length} manifest(s) are open or unsent.` })
  }
  lines.push('Pickups: the StarShipIt API has no pickups endpoint. Check the carrier portal.')
  return finishReport({
    agent: 'pickup',
    client: args.client,
    lines,
    stats: { printedToday: todays.length, printedReturned: printed.orders.length, manifests: manifests.manifests.length },
    escalations,
    workflowCron: args.workflowCron,
    workflowTimezone: args.workflowTimezone,
  })
}

const EXCEPTION_RE = /exception|fail|undeliver|return|attempt|delay|held|lost|damag|refus|problem|issue|unable|exceç|falha|devol/i
const DELIVERED_RE = /deliver(ed)?$|^delivered|entregue/i

export function summarisePostShipping(args: {
  client: ClientConfig
  pages: unknown[]
  now: Date
  workflowCron: string
  workflowTimezone: string
}): AgentReport {
  const extracted = extractOrders(args.pages)
  const cutoff = args.now.getTime() - args.client.windows.shippedLookbackDays * 86400000
  const before = extracted.orders.length
  const orders = extracted.orders.filter((order) => {
    const stamp = parseTimestamp(order.shipped_date)
    return Number.isFinite(stamp) && stamp >= cutoff
  })
  const lines = [
    `Post-shipment (StarShipIt, read-only)`,
    `Client: ${args.client.displayName} (${args.client.id})`,
  ]
  const escalations: Escalation[] = []
  if (extracted.apiError) escalations.push({ severity: 'review', code: 'api_error', detail: 'The shipped-orders API returned an error.' })
  if (orders.length === 0) {
    lines.push(`0 orders shipped in the last ${args.client.windows.shippedLookbackDays} days.`)
    return finishReport({
      agent: 'post-shipping',
      client: args.client,
      lines,
      stats: { shipped: 0, outsideWindow: before, apiError: extracted.apiError ? 1 : 0 },
      escalations,
      workflowCron: args.workflowCron,
      workflowTimezone: args.workflowTimezone,
    })
  }
  const noStatus: string[] = []
  const exceptions: string[] = []
  const late: string[] = []
  let delivered = 0
  let inTransit = 0
  const limitDays = args.client.windows.inTransitEscalateAfterDays
  for (const order of orders) {
    const status = String(order.tracking_short_status || order.tracking_full_status || '').trim()
    const id = orderNumberOf(order)
    if (!status) {
      noStatus.push(id)
      continue
    }
    if (EXCEPTION_RE.test(status) && !/^delivered/i.test(status)) {
      exceptions.push(`${id} (${status.slice(0, 40)})`)
      escalations.push({ severity: 'review', code: 'tracking_exception', orderNumber: id, detail: status.slice(0, 80) })
      continue
    }
    if (DELIVERED_RE.test(status)) {
      delivered += 1
      continue
    }
    inTransit += 1
    const stamp = parseTimestamp(order.shipped_date)
    if (Number.isFinite(stamp) && (args.now.getTime() - stamp) / 86400000 > limitDays) {
      const age = Math.floor((args.now.getTime() - stamp) / 86400000)
      late.push(`${id} (${age}d)`)
      escalations.push({ severity: 'review', code: 'in_transit_late', orderNumber: id, detail: `In transit for ${age} days.` })
    }
  }
  lines.push(`Shipped (${args.client.windows.shippedLookbackDays} days): ${orders.length}`)
  lines.push(`Delivered: ${delivered} | In transit: ${inTransit}`)
  lines.push(`With exception: ${exceptions.length}${exceptions.length ? ` → ${listTail(exceptions)}` : ''}`)
  lines.push(`In transit for more than ${limitDays} days: ${late.length}${late.length ? ` → ${listTail(late)}` : ''}`)
  lines.push(`No tracking status: ${noStatus.length}${noStatus.length === orders.length ? ' (the listing returned no tracking status)' : ''}`)
  lines.push(`Outside the ${args.client.windows.shippedLookbackDays}-day window: ${before - orders.length}`)
  return finishReport({
    agent: 'post-shipping',
    client: args.client,
    lines,
    stats: {
      shipped: orders.length,
      delivered,
      inTransit,
      exceptions: exceptions.length,
      late: late.length,
      noStatus: noStatus.length,
      outsideWindow: before - orders.length,
    },
    escalations,
    workflowCron: args.workflowCron,
    workflowTimezone: args.workflowTimezone,
  })
}

export function routeReports(reports: AgentReport[]): {
  dryRun: true
  send: false
  writes: 'none'
  humanReview: boolean
  escalationCount: number
  text: string
  agents: string[]
} {
  const escalations = reports.flatMap((report) => report.escalations)
  const humanReview = escalations.some((item) => item.severity === 'review')
  const text = [
    'Fulfilment coordinator (read-only, dry-run)',
    `Human review: ${humanReview ? 'yes' : 'no'}`,
    'Telegram: not sent.',
    'Writes: none.',
    '',
    ...reports.map((report) => report.text),
  ].join('\n\n')
  return {
    dryRun: true,
    send: false,
    writes: 'none',
    humanReview,
    escalationCount: escalations.length,
    text,
    agents: reports.map((report) => report.agent),
  }
}
