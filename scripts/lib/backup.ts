/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Shared helpers for backup-export.ts / backup-restore.ts.
 * All field handling is driven by the Payload config, so new collections and
 * fields are picked up automatically.
 */
import type { Field } from 'payload'

export const FORMAT_VERSION = 1

// System collections created by plugins; their data is generated, not content
export const isSystemCollection = (slug: string): boolean =>
  slug.startsWith('payload-') || ['exports', 'imports'].includes(slug)

export type Resolve = (relationTo: string, id: unknown) => unknown

const resolveRef = (field: any, value: any, resolve: Resolve): any => {
  const one = (item: any): any => {
    if (item == null) return undefined
    if (Array.isArray(field.relationTo)) {
      const id = resolve(item.relationTo, item.value)
      return id === undefined ? undefined : { relationTo: item.relationTo, value: id }
    }
    return resolve(field.relationTo, item)
  }
  if (field.hasMany) return (value as any[]).map(one).filter((v) => v !== undefined)
  return one(value) ?? null
}

const walkLexical = (node: any, resolve: Resolve): void => {
  if (!node || typeof node !== 'object') return
  if ((node.type === 'upload' || node.type === 'relationship') && node.relationTo) {
    node.value = resolve(node.relationTo, node.value)
  }
  if (node.type === 'link' && node.fields?.doc?.relationTo) {
    const id = resolve(node.fields.doc.relationTo, node.fields.doc.value)
    if (id === undefined) node.fields.doc = null
    else node.fields.doc.value = id
  }
  if (Array.isArray(node.children)) {
    node.children = node.children.filter(
      (c: any) => !((c?.type === 'upload' || c?.type === 'relationship') && c.value === undefined),
    )
    node.children.forEach((c: any) => walkLexical(c, resolve))
  }
  for (const v of Object.values(node.fields ?? {}) as any[]) {
    if (v?.root) walkLexical(v.root, resolve) // rich text nested in blocks
  }
}

/** Rewrites every relationship/upload reference in `data` (in place) via `resolve`. */
export const remapRefs = (fields: Field[], data: any, resolve: Resolve): void => {
  if (!data || typeof data !== 'object') return
  for (const f of fields as any[]) {
    if (f.type === 'tabs') {
      for (const tab of f.tabs) {
        if (tab.name) remapRefs(tab.fields, data[tab.name], resolve)
        else remapRefs(tab.fields, data, resolve)
      }
      continue
    }
    if (f.type === 'row' || f.type === 'collapsible') {
      remapRefs(f.fields, data, resolve)
      continue
    }
    if (!f.name || data[f.name] == null) continue
    const v = data[f.name]
    switch (f.type) {
      case 'group':
        remapRefs(f.fields, v, resolve)
        break
      case 'array':
        v.forEach((row: any) => remapRefs(f.fields, row, resolve))
        break
      case 'blocks':
        v.forEach((row: any) => {
          const block = (f.blocks ?? []).find((b: any) => b.slug === row.blockType)
          if (block) remapRefs(block.fields, row, resolve)
        })
        break
      case 'relationship':
      case 'upload':
        data[f.name] = resolveRef(f, v, resolve)
        break
      case 'richText':
        walkLexical(v.root, resolve)
        break
    }
  }
}

/** Collections that `fields` points to (used to order the restore). */
export const referencedCollections = (fields: Field[]): Set<string> => {
  const found = new Set<string>()
  const visit = (list: any[]) => {
    for (const f of list) {
      if (f.type === 'tabs') f.tabs.forEach((t: any) => visit(t.fields))
      else if (f.fields) visit(f.fields)
      else if (f.type === 'blocks') (f.blocks ?? []).forEach((b: any) => visit(b.fields))
      if (f.type === 'relationship' || f.type === 'upload') {
        ;[f.relationTo].flat().forEach((r: string) => found.add(r))
      }
      // Rich text can embed uploads of any upload collection
      if (f.type === 'richText') found.add('media')
    }
  }
  visit(fields as any[])
  return found
}

/** Order collections so referenced collections come first (ignoring self references). */
export const dependencyOrder = (deps: Map<string, Set<string>>): string[] => {
  const order: string[] = []
  const remaining = new Set(deps.keys())
  while (remaining.size) {
    const ready = [...remaining].filter((slug) =>
      [...(deps.get(slug) ?? [])].every((d) => d === slug || !remaining.has(d) || !deps.has(d)),
    )
    if (!ready.length) {
      order.push(...remaining) // cycle: best effort
      break
    }
    for (const slug of ready) {
      order.push(slug)
      remaining.delete(slug)
    }
  }
  return order
}

/** Plain-JSON description of the fields, for the config snapshot. */
export const describeFields = (fields: any[]): any[] =>
  fields.map((f) => ({
    name: f.name,
    type: f.type,
    required: f.required || undefined,
    hasMany: f.hasMany || undefined,
    relationTo: f.relationTo,
    options: f.options?.map((o: any) => (typeof o === 'string' ? o : o.value)),
    fields: f.fields ? describeFields(f.fields) : undefined,
    tabs: f.tabs?.map((t: any) => ({ name: t.name, fields: describeFields(t.fields) })),
    blocks: f.blocks?.map((b: any) => ({ slug: b.slug, fields: describeFields(b.fields) })),
  }))

export const topLevelFieldNames = (fields: any[]): string[] =>
  fields.flatMap((f) => (f.name ? [f.name] : f.fields ? topLevelFieldNames(f.fields) : []))
