import { columnVisibilityFeature, tableFeatures } from '@tanstack/react-table'

/**
 * TanStack Table v9 makes features opt-in so unused ones tree-shake away.
 * Every table in this app renders a plain unsorted, unfiltered, unpaginated
 * list, so the core row model plus column visibility is all that's needed --
 * the latter is what provides `row.getVisibleCells()`.
 *
 * It is shared rather than created per call site because v9's public types are
 * generic over the feature set -- `Table<typeof tableFeaturesCore, TData>` --
 * so a table instance can only be passed between components that agree on it.
 */
export const tableFeaturesCore = tableFeatures({ columnVisibilityFeature })

export type CoreTableFeatures = typeof tableFeaturesCore
