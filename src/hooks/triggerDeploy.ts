import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  Payload,
} from 'payload'

// Fire-and-forget POST to the deploy hook URL configured in Site
// Settings, so the static frontend rebuilds when content changes.
const fire = async (payload: Payload): Promise<void> => {
  try {
    const settings = await payload.findGlobal({ slug: 'site-settings' })
    const url = settings?.deployHookUrl
    if (!url) return
    fetch(url, { method: 'POST' }).catch((err) => {
      payload.logger.warn(`Deploy hook request failed: ${err?.message}`)
    })
  } catch (err) {
    payload.logger.warn(`Deploy hook lookup failed: ${(err as Error)?.message}`)
  }
}

// Rebuild only for changes the public site can see: publishing,
// unpublishing, or editing a published document. Documents without a
// draft status (tags, categories, media) always count.
export const triggerDeployAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  const status = (doc as { _status?: string })?._status
  const prevStatus = (previousDoc as { _status?: string })?._status
  if (status === undefined || status === 'published' || prevStatus === 'published') {
    await fire(req.payload)
  }
  return doc
}

export const triggerDeployAfterDelete: CollectionAfterDeleteHook = async ({ req }) => {
  await fire(req.payload)
}

export const triggerDeployAfterGlobalChange: GlobalAfterChangeHook = async ({ doc, req }) => {
  await fire(req.payload)
  return doc
}
