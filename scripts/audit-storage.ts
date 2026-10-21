/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Read-only storage audit (add AUDIT_FIX=true to clean up).
 *
 *   NODE_ENV=production pnpm audit:storage
 *
 * Reports: database size and reclaimable space, row counts per table, rows that
 * break foreign keys (orphans), media files on disk that no media document
 * points to, documents pointing to a missing file, and stale system rows.
 *
 * AUDIT_FIX=true then: deletes orphan media files, clears stale lock/job rows,
 * and compacts the database (VACUUM). It never touches content or user
 * preferences, and orphaned database rows are only reported.
 */
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

import config from '../src/payload.config'

const FIX = process.env.AUDIT_FIX === 'true'
const mb = (n: number) => `${(n / 1024 / 1024).toFixed(2)} MB`

const main = async () => {
  const payload = await getPayload({ config })
  const client = (payload.db as any).client
  const q = async (sql: string): Promise<any[]> => (await client.execute(sql)).rows as any[]
  const out = (msg = '') => console.log(msg)

  // ---- database size
  const [{ page_count }] = await q('PRAGMA page_count')
  const [{ page_size }] = await q('PRAGMA page_size')
  const [{ freelist_count }] = await q('PRAGMA freelist_count')
  out(`Database: ${mb(Number(page_count) * Number(page_size))} total, ${mb(Number(freelist_count) * Number(page_size))} reclaimable by VACUUM`)

  // ---- rows per table
  const tables = (await q("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")).map((r) => String(r.name))
  const counts: Record<string, number> = {}
  for (const t of tables) counts[t] = Number((await q(`SELECT count(*) AS n FROM \`${t}\``))[0].n)
  out('\nRows per table:')
  for (const t of tables) out(`  ${t.padEnd(46)} ${counts[t]}`)

  // ---- orphaned rows (rows pointing at parents that no longer exist)
  const violations = await q('PRAGMA foreign_key_check')
  const byTable: Record<string, number> = {}
  for (const v of violations) byTable[String(v.table)] = (byTable[String(v.table)] ?? 0) + 1
  out(`\nOrphaned rows (foreign-key violations): ${violations.length}`)
  for (const [t, n] of Object.entries(byTable)) out(`  ${t}: ${n}`)

  // ---- media files vs documents
  let orphanFiles = 0
  let orphanBytes = 0
  for (const collection of payload.config.collections.filter((c) => c.upload)) {
    const dir = (collection.upload as any).staticDir as string
    const docs: any[] = []
    for (let page = 1; ; page++) {
      const res = await payload.find({ collection: collection.slug as any, limit: 200, page, depth: 0, pagination: true })
      docs.push(...res.docs)
      if (!res.hasNextPage) break
    }
    const referenced = new Set<string>()
    for (const d of docs) {
      if (d.filename) referenced.add(d.filename)
      for (const size of Object.values(d.sizes ?? {}) as any[]) if (size?.filename) referenced.add(size.filename)
    }
    const onDisk = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isFile()) : []
    const orphans = onDisk.filter((f) => !referenced.has(f))
    const missing = [...referenced].filter((f) => !onDisk.includes(f))
    out(`\n${collection.slug}: ${docs.length} documents, ${onDisk.length} files in ${dir}`)
    for (const f of orphans) {
      const size = fs.statSync(path.join(dir, f)).size
      orphanFiles++
      orphanBytes += size
      out(`  ORPHAN FILE ${f} (${mb(size)})`)
      if (FIX) fs.unlinkSync(path.join(dir, f))
    }
    for (const f of missing) out(`  MISSING FILE ${f} (document exists, file does not)`)
  }
  out(`\nOrphan media files: ${orphanFiles} (${mb(orphanBytes)})${FIX && orphanFiles ? ' - deleted' : ''}`)

  // ---- stale system rows
  const stale = ['payload_locked_documents', 'payload_jobs', 'payload_kv'].filter((t) => counts[t])
  out('\nSystem tables with rows:')
  for (const t of stale) out(`  ${t}: ${counts[t]}`)
  out(`  payload_preferences: ${counts.payload_preferences ?? 0} (kept: saved admin UI state)`)
  if (FIX) {
    await client.execute('DELETE FROM payload_locked_documents')
    await client.execute("DELETE FROM payload_jobs WHERE completed_at IS NOT NULL OR has_error = 1")
    out('  cleared locked-document and finished/failed job rows')
  }

  if (FIX) {
    await client.execute('PRAGMA wal_checkpoint(TRUNCATE)')
    await client.execute('VACUUM')
    const [{ page_count: pc }] = await q('PRAGMA page_count')
    out(`\nVACUUM done. Database is now ${mb(Number(pc) * Number(page_size))}`)
  } else {
    out('\nRead-only run. Re-run with AUDIT_FIX=true to clean up.')
  }
  process.exit(0)
}

await main().catch((err) => {
  console.error(err)
  process.exit(1)
})
