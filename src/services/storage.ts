import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export const reactQueryPersister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ?  window.localStorage : undefined,
})
