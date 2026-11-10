import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { describe, test } from 'vitest'
import { companyRecordFilters, scopedRowMissing } from './company-scope'

const root = path.resolve(__dirname, '../..')

describe('company scoping', () => {
  test('every scoped lookup carries the caller company and the record id', () => {
    const filters = companyRecordFilters('company-a', 'row-1')
    assert.deepEqual(filters, { id: 'row-1', company_id: 'company-a' })
    assert.notEqual(companyRecordFilters('company-b', 'row-1').company_id, filters.company_id)
  })

  test('refuses a query that is missing a company or an id', () => {
    assert.throws(() => companyRecordFilters('', 'row-1'), /companyId is required/)
    assert.throws(() => companyRecordFilters('company-a', ''), /id is required/)
  })

  test('a row from another company is a miss, so the route can return 404', () => {
    const filters = companyRecordFilters('company-a', 'row-1')
    const foreign = { id: 'row-1', company_id: 'company-b' }
    const visible = foreign.id === filters.id && foreign.company_id === filters.company_id ? [foreign] : []
    assert.equal(scopedRowMissing(visible), true)
    assert.equal(scopedRowMissing(null), true)
    assert.equal(scopedRowMissing([]), true)

    const own = { id: 'row-1', company_id: 'company-a' }
    const ownRows = own.id === filters.id && own.company_id === filters.company_id ? [own] : []
    assert.equal(scopedRowMissing(ownRows), false)
    assert.equal(scopedRowMissing(own), false)
  })

  test('service-role reads, updates, and deletes on tenant tables filter by company_id', () => {
    const files = [
      'app/api/quotes/route.ts',
      'app/api/marketing-posts/route.ts',
      'app/api/jobs/route.ts',
      'app/api/invoices/route.ts',
      'app/api/compliance/route.ts',
      'app/api/field-commander/route.ts',
      'app/api/materials/route.ts',
    ]

    for (const file of files) {
      const source = fs.readFileSync(path.join(root, file), 'utf8')
      assert.match(source, /companyRecordFilters\(/, `${file} does not use companyRecordFilters`)

      const deletes = source.split('.delete()').slice(1)
      for (const chunk of deletes) {
        assert.match(chunk.slice(0, 500), /company_id/, `${file} deletes without company_id`)
      }
    }

    const marketing = fs.readFileSync(path.join(root, 'app/api/marketing-posts/route.ts'), 'utf8')
    const singleLookup = marketing.slice(marketing.indexOf('if (singleId)'), marketing.indexOf('const { data, error } = await admin'))
    assert.match(singleLookup, /companyRecordFilters\(/)
    assert.doesNotMatch(singleLookup, /\.eq\('id', singleId\)/)

    const quotes = fs.readFileSync(path.join(root, 'app/api/quotes/route.ts'), 'utf8')
    const quoteDelete = quotes.slice(quotes.indexOf('export async function DELETE'))
    assert.match(quoteDelete, /companyRecordFilters\(/)
    assert.match(quoteDelete, /scopedRowMissing/)

    const jobs = fs.readFileSync(path.join(root, 'app/api/jobs/route.ts'), 'utf8')
    const linkQuote = jobs.slice(jobs.indexOf('LINK QUOTE'))
    assert.match(linkQuote, /from\('quotes'\)/)
    assert.match(linkQuote, /companyRecordFilters\(/)
  })
})
