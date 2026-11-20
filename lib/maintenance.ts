/**
 * Global Maintenance Mode Toggle
 *
 * Defaults to `true` while database/storage maintenance is in progress.
 * Set `NEXT_PUBLIC_MAINTENANCE_MODE=false` in environment variables (or change default below)
 * to immediately reopen the storefront.
 */
export const IS_MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE !== 'false';
