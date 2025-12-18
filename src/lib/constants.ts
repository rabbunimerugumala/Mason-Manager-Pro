// ✅ Generated following IndiBuddy project rules

/**
 * Application constants
 */
export const APP_NAME = 'Manager Pro' as const;

/**
 * Storage keys for browser storage
 */
export const STORAGE_KEYS = {
  USER_ID: 'manager-pro',
} as const;

/**
 * Application routes
 */
export const ROUTES = {
  HOME: '/',
  SITES: '/sites',
  PLACE: (id: string) => `/places/${id}`,
  PLACE_HISTORY: (id: string) => `/places/${id}/history`,
  SETTINGS: '/settings',
} as const;

