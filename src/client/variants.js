/** Runtime variants on top of the generated token layer.
 *
 * The accent hue and the corner scale are not separate stylesheets: they rewrite
 * the same token table the skin already overrides, so a change re-applies one
 * override layer and every shipped component follows.
 */
import { TOKENS } from './tokens.js'
import { ACCENTS, RADIUS_SCALES } from './store.js'

const BASE_ACCENT = ACCENTS[0]

const RADIUS_SLOTS = Object.freeze({
  '--dsw-radius-xs': 'xs',
  '--dsw-radius-sm': 'sm',
  '--dsw-radius-md': 'md',
  '--dsw-radius-lg': 'lg',
  '--dsw-radius-xl': 'xl',
  '--dsw-radius-panel': 'panel',
})

/** Swap the shipped sky hexes, keeping any trailing alpha byte intact. */
function recolor(value, accent) {
  if (typeof value !== 'string' || !value.includes('#')) return value
  return value
    .split(BASE_ACCENT.light).join(accent.light)
    .split(BASE_ACCENT.dark).join(accent.dark)
}

/** Token table for a settings record: the skin palette plus the two variants. */
export function buildTokens(settings) {
  const accent = ACCENTS.find((item) => item.id === settings?.accent) ?? BASE_ACCENT
  const scale = RADIUS_SCALES[settings?.radius] ?? RADIUS_SCALES.default
  const out = {}
  for (const [key, pair] of Object.entries(TOKENS)) {
    let light = pair.light
    let dark = pair.dark
    if (accent.id !== BASE_ACCENT.id) {
      light = recolor(light, accent)
      dark = recolor(dark, accent)
    }
    const slot = RADIUS_SLOTS[key]
    if (slot !== undefined) {
      light = scale[slot]
      dark = scale[slot]
    }
    out[key] = { light, dark }
  }
  return out
}

/** True when the settings need no variant work at all. */
export function isBaseline(settings) {
  return (settings?.accent ?? BASE_ACCENT.id) === BASE_ACCENT.id
    && (settings?.radius ?? 'default') === 'default'
}
