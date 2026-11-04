/**
 * dsh-fitout — Host half.
 *
 * Fitout is entirely a browser-side concern: theme tokens, the layout layer,
 * brand slots and the settings panel. The Host row exists only so the bundle
 * patch can load the package into the profile; `apply` intentionally does
 * nothing.
 */

export const name = 'dsh-fitout'

/** No Host services are touched. */
export const inject = []

export function apply() {
  // Client-only plugin: see client.js (the wheel registered via `exports["./client"]`).
}
