/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Retire categories that no live document uses any more.
 *
 *   NODE_ENV=production pnpm prune:categories                       # dry run
 *   PRUNE_APPLY=true NODE_ENV=production pnpm prune:categories      # delete
 *
 * Why: posts and projects keep version history. Old saved versions can still
 * point at a retired category, and the database then refuses to delete it
 * ("Something went wrong"). This removes those old versions (never the latest
 * one) and then deletes the category itself.
 *
 * Safety: a category that any current post or project still uses is skipped.
 * Run a backup first (scripts/vps-backup.sh): the removed versions are the
 * pre-change history of those documents.
 *
 * Env: PRUNE_SLUGS=technical,guides,modelling,open-source (default),
 *      PRUNE_APPLY=true to delete.
 */
import { getPayload } from 'payload'

import config from '../src/payload.config'

const APPLY = process.env.PRUNE_APPLY === 'true'
const SLUGS = (process.env.PRUNE_SLUGS || 'technical,guides,modelling,open-source')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
const VERSIONED = ['posts', 'projects'] as const

const main = async () => {
  const payload = await getPayload({ config })
  const out = (msg = '') => console.log(msg)
  out(APPLY ? 'Mode: APPLY (deleting)' : 'Mode: dry run (set PRUNE_APPLY=true to delete)')

  const { docs: categories } = await payload.find({
    collection: 'categories',
    where: { slug: { in: SLUGS } },
    limit: 100,
    depth: 0,
    pagination: false,
  })

  for (const category of categories) {
    out(`\n${category.name} (id ${category.id})`)

    // Skip anything a current document still uses
    let inUse = 0
    for (const collection of VERSIONED) {
      const { totalDocs } = await payload.count({
        collection,
        where: { categories: { equals: category.id } },
      })
      inUse += totalDocs
    }
    if (inUse > 0) {
      out(`  SKIPPED: ${inUse} current document(s) still use it`)
      continue
    }

    // Old versions that still point at it (the latest version is never removed)
    const stale: Record<string, number> = {}
    for (const collection of VERSIONED) {
      const { totalDocs } = await payload.countVersions({
        collection,
        where: {
          and: [
            { 'version.categories': { equals: category.id } },
            { latest: { not_equals: true } },
          ],
        },
      })
      stale[collection] = totalDocs
      out(`  ${collection}: ${totalDocs} old version(s) reference it`)
    }

    if (!APPLY) continue

    for (const collection of VERSIONED) {
      if (!stale[collection]) continue
      await payload.db.deleteVersions({
        collection,
        where: {
          and: [
            { 'version.categories': { equals: category.id } },
            { latest: { not_equals: true } },
          ],
        },
      })
      out(`  removed old ${collection} versions`)
    }

    await payload.delete({ collection: 'categories', id: category.id })
    out('  deleted category')
  }

  const missing = SLUGS.filter((s) => !categories.some((c) => c.slug === s))
  if (missing.length) out(`\nNot found (already gone?): ${missing.join(', ')}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
