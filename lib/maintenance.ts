/**
 * Global Maintenance Mode Toggle
 *
 * Defaults to `false` (live storefront active).
 * Set `NEXT_PUBLIC_MAINTENANCE_MODE=true` in environment variables to enable `/bakim`.
 */
export const IS_MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
