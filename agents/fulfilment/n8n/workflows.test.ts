import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import { describe, test } from 'vitest'
import { buildAll, engineSandboxSource } from '../scripts/build-workflows'

const dir = path.dirname(fileURLToPath(import.meta.url))
const PREFIX = 'TESTE \u2013 '
const FORBIDDEN = [
  'O5BuSS1CsCLrKrtG',
  'qzCqGf7YmL1br2jS',
  'xk3RN5oNcJsCnF5p',
  'RMyMz5bYaEZ626Qk',
  'YWwFTs5pJILhf2GU',
  'VQ6wVLFk26nS1XPn',
  'iahm6VwX217tGcwW',
  'AIza',
  'sk-',
]

type Wf = {
  name: string
  active: boolean
  nodes: {
    name: string
    type: string
    disabled?: boolean
    parameters?: Record<string, unknown>
    credentials?: unknown
    webhookId?: string
  }[]
  settings?: { errorWorkflow?: string; timezone?: string }
  id?: string
}

function load(file: string): Wf {
  return JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) as Wf
}

function engineBlock(jsCode: string): string {
  const start = jsCode.indexOf('/* ENGINE_START */')
  const end = jsCode.indexOf('/* ENGINE_END */')
  assert.ok(start >= 0 && end > start, 'code node is missing the rules engine')
  return jsCode.slice(start, end + '/* ENGINE_END */'.length)
}

describe('TESTE n8n workflows', () => {
  const built = buildAll()
  const files = Object.keys(built)

  test('the files on disk match the builder', () => {
    for (const file of files) {
      assert.deepEqual(load(file), built[file], `${file} is stale. Run npx tsx agents/fulfilment/scripts/build-workflows.ts`)
    }
  })

  test('every workflow is an inactive TESTE import with no production ids', () => {
    for (const file of files) {
      const wf = load(file)
      const raw = fs.readFileSync(path.join(dir, file), 'utf8')
      assert.equal(wf.active, false, file)
      assert.equal(wf.name.startsWith(PREFIX), true, wf.name)
      assert.equal('id' in wf, false, file)
      assert.equal(wf.settings?.errorWorkflow, undefined, file)
      for (const token of FORBIDDEN) assert.equal(raw.includes(token), false, `${file} contains ${token}`)
    }
  })

  test('StarShipIt calls are guarded GETs and Telegram cannot send', () => {
    for (const file of files) {
      const wf = load(file)
      const guards = wf.nodes.filter((node) => node.name.startsWith('Guard') && node.type === 'n8n-nodes-base.code')
      assert.ok(guards.length > 0, file)
      for (const guard of guards) {
        const jsCode = String(guard.parameters?.jsCode || '')
        assert.match(jsCode, /assertStarShipItReadOnly|assertAddressesHaveNoStarShipIt|assertMapsGet/)
      }
      for (const node of wf.nodes) {
        assert.equal('credentials' in node, false, `${file} ${node.name}`)
        const url = String(node.parameters?.url || '')
        const method = String(node.parameters?.method || node.parameters?.httpMethod || '')
        if (node.type === 'n8n-nodes-base.httpRequest' && node.disabled !== true) {
          assert.equal(method, 'GET', `${file} ${node.name}`)
          const allowed =
            url.includes('$json.request.url') || url === 'https://maps.googleapis.com/maps/api/geocode/json'
          assert.equal(allowed, true, `${file} ${node.name} ${url}`)
        }
        if (/telegram/i.test(node.name) || url.includes('api.telegram.org')) {
          assert.equal(node.disabled, true, `${file} ${node.name}`)
        }
        const jsCode = String(node.parameters?.jsCode || '')
        assert.equal(/fetch\s*\(/.test(jsCode), false, `${file} ${node.name}`)
        assert.equal(jsCode.includes('api.telegram.org'), false, `${file} ${node.name}`)
      }
      const outputs = wf.nodes.filter((node) => node.name === 'Dry-run log' || node.name.startsWith('Respond'))
      assert.ok(outputs.length > 0, file)
    }
  })

  test('the address webhook is not the production path and the model is gated', () => {
    const wf = load('teste-addresses.json')
    const webhook = wf.nodes.find((node) => node.name === 'Webhook')
    assert.equal(webhook?.parameters?.path, 'teste-revisao-manual')
    assert.notEqual(webhook?.parameters?.path, 'revisao-manual')
    const fixed = String(wf.nodes.find((node) => node.name === 'Fixed rules')?.parameters?.jsCode || '')
    const tail = fixed.slice(fixed.indexOf('/* ENGINE_END */'))
    assert.match(tail, /client\.llm\.allowCustomerPii/)
    assert.equal(tail.includes('allowCustomerPii: true'), false)
    assert.equal(tail.includes('b.allowCustomerPii'), false)
    const model = wf.nodes.find((node) => node.name === 'Google Gemini Chat Model')
    assert.equal((model?.parameters?.options as { temperature?: number })?.temperature, 0)
    assert.equal(model?.parameters?.modelName, 'models/gemini-2.5-flash')
  })

  test('the embedded rules match the TypeScript module and still catch PO Box12', () => {
    const sandbox = engineSandboxSource()
    const api = vm.runInNewContext(
      `${sandbox};({ chooseCarrier, detectMailbox, assertStarShipItReadOnly, ALLOWLISTS, CLIENTS })`,
      {},
    ) as {
      chooseCarrier: (input: { shippingMethod: string; weightKg: number; packagingText: string; addressText: string }, client: unknown) => { carrier: string }
      detectMailbox: (text: string, client: unknown) => string | null
      assertStarShipItReadOnly: (request: { method: string; url: string; query: Record<string, string> }, allow: unknown, base: string) => void
      ALLOWLISTS: { dispatch: unknown }
      CLIENTS: { hom: unknown }
    }
    assert.equal(api.detectMailbox('PO Box12', api.CLIENTS.hom), 'po_box')
    assert.equal(api.detectMailbox('Post Box 4', api.CLIENTS.hom), 'po_box')
    assert.equal(api.detectMailbox('APL 99', api.CLIENTS.hom), 'parcel_locker')
    assert.equal(api.detectMailbox('PMB 1', api.CLIENTS.hom), 'pmb')
    assert.equal(api.detectMailbox('CMB 7', api.CLIENTS.hom), 'cmb')
    const decision = api.chooseCarrier(
      { shippingMethod: 'Standard', weightKg: 0.3, packagingText: '', addressText: 'Post Office Box 77' },
      api.CLIENTS.hom,
    )
    assert.equal(decision.carrier, 'Australia Post')
    assert.throws(
      () =>
        api.assertStarShipItReadOnly(
          { method: 'POST', url: 'https://api.example.com/api/orders', query: {} },
          api.ALLOWLISTS.dispatch,
          'https://api.example.com',
        ),
      /Blocked non-GET/,
    )
    for (const file of files) {
      const wf = load(file)
      for (const node of wf.nodes) {
        const jsCode = String(node.parameters?.jsCode || '')
        if (!jsCode.includes('/* ENGINE_START */')) continue
        assert.equal(engineBlock(jsCode), sandbox.trim(), `${file} ${node.name} engine drift`)
      }
    }
  })
})
