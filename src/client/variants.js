/** Runtime variants on top of the generated token layer.
 *
 * The accent hue and the corner scale are not separate stylesheets: they rewrite
 * the same token table the skin already overrides, so a change re-applies one
 * override layer and every shipped component follows.
 */
import { TOKENS } from './tokens.js'
import { ACCENTS, RADIUS_SCALES } from './store.js'
import { surfaceTokens } from './surfaces.js'

const BASE_ACCENT = ACCENTS[0]

const SHADOWS = Object.freeze({
  flat: { mode: 'none' },
  soft: null,
  lifted: {
    mode: 'pair',
    light: 'var(--dsw-elevation-stroke), 0 6px 20px 0 #0a0a0a12, 0 0 32px 0 #0a0a0a0a',
    dark: 'var(--dsw-elevation-stroke), 0 8px 26px 0 #00000059, 0 0 38px 0 #0000003d',
  },
})

const MOTIONS = Object.freeze({
  off: { base: '0s', fast: '0s', slow: '0s' },
  normal: null,
  slow: { base: '0.3s', fast: '0.18s', slow: '0.45s' },
})

const CORNERS = Object.freeze({ round: 'round', squircle: 'superellipse(1.5)' })

const CODE_TONES = Object.freeze({
  auto: null,
  light: { light: '#f5f5f5', dark: '#262626' },
  dark: { light: '#1b1b1c', dark: '#0f0f10' },
})

const MEASURES = Object.freeze({ auto: null, narrow: '620px', wide: '960px' })

/** Reading weight for conversation text. 400 is the shipped value.
 *
 * These have to land on the *composite* font tokens, not on font-weight: the
 * shipped markdown rule is `font: var(--dsw-font-markdown-base)`, and a `font`
 * shorthand without a weight component resets it to 400 — so a `font-weight`
 * rule on any ancestor is overridden one level down. Rebuilding the shorthand
 * with a weight in front is the only way that survives.
 */
const WEIGHTS = Object.freeze({ normal: '400', medium: '500', heavy: '600' })

const CONTENT_SIZE = 'var(--dsh-content-font-size,14px)'
const CONTENT_LINE = 'calc(24px + var(--dsh-content-font-delta))'
const SECONDARY_SIZE = 'var(--dsh-content-font-size-secondary,13px)'
const SECONDARY_LINE = 'calc(22px + var(--dsh-content-font-delta-secondary,0px))'
const FAMILY = 'var(--dsw-font-family)'

/** The shipped markdown shorthands, re-emitted with an explicit weight. */
function weightedMarkdownTokens(weight) {
  return {
    '--dsw-font-markdown-base': weight + ' ' + CONTENT_SIZE + ' / ' + CONTENT_LINE + ' ' + FAMILY,
    '--dsw-font-markdown-base-italic': 'italic ' + weight + ' ' + CONTENT_SIZE + ' / ' + CONTENT_LINE + ' ' + FAMILY,
    '--dsw-font-markdown-table': weight + ' ' + SECONDARY_SIZE + '/' + SECONDARY_LINE + ' ' + FAMILY,
    '--dsw-font-markdown-small': weight + ' 12px/20px ' + FAMILY,
    '--dsw-font-markdown-small-italic': 'italic ' + weight + ' 12px/20px ' + FAMILY,
  }
}

/** Continuous radius: one px value drives the whole ladder. */
function customRadiusScale(value) {
  return {
    xs: Math.round(value * 0.34),
    sm: Math.round(value * 0.5),
    md: Math.round(value * 0.67),
    lg: Math.round(value),
    xl: Math.round(value * 1.33),
    panel: Math.round(value * 1.33),
  }
}

const RADIUS_SLOTS = Object.freeze({
  '--dsw-radius-xs': 'xs',
  '--dsw-radius-sm': 'sm',
  '--dsw-radius-md': 'md',
  '--dsw-radius-lg': 'lg',
  '--dsw-radius-xl': 'xl',
  '--dsw-radius-panel': 'panel',
})

/** Mix two hex colours; `t` is how much of `b` ends up in the result. */
function mixHex(a, b, t) {
  const parse = (hex) => {
    const m = /^#([0-9a-f]{6})$/i.exec(hex)
    return m === null ? [0, 0, 0] : [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16))
  }
  const [r1, g1, b1] = parse(a)
  const [r2, g2, b2] = parse(b)
  const channel = (x, y) => Math.round(x * (1 - t) + y * t).toString(16).padStart(2, '0')
  return '#' + channel(r1, r2) + channel(g1, g2) + channel(b1, b2)
}

/** The dark-palette twin of an arbitrary accent: same hue, lifted. */
export function liftAccent(hex) {
  return /^#[0-9a-f]{6}$/i.test(hex) ? mixHex(hex, '#ffffff', 0.34) : hex
}

/** Swap the shipped sky hexes, keeping any trailing alpha byte intact. */
function recolor(value, accent) {
  if (typeof value !== 'string' || !value.includes('#')) return value
  return value
    .split(BASE_ACCENT.light).join(accent.light)
    .split(BASE_ACCENT.dark).join(accent.dark)
}

/** Token table for a settings record: the skin palette plus the two variants. */
export function buildTokens(settings) {
  const custom = typeof settings?.accentCustom === 'string' && /^#[0-9a-f]{6}$/i.test(settings.accentCustom)
    ? { id: 'custom', light: settings.accentCustom.toLowerCase(), dark: liftAccent(settings.accentCustom.toLowerCase()) }
    : null
  const accent = custom ?? ACCENTS.find((item) => item.id === settings?.accent) ?? BASE_ACCENT
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
  return applyOptions(out, settings)
}

/** Stack the enumerated design options on top of the palette tokens. */
function applyOptions(out, settings) {
  const both = (value) => ({ light: value, dark: value })

  // The surface goes first: it repaints every layer, border and text step.
  const surface = surfaceTokens(settings?.surface)
  if (surface !== null) {
    for (const [token, value] of Object.entries(surface.light)) {
      out[token] = { ...(out[token] ?? both(value)), light: value }
    }
    for (const [token, value] of Object.entries(surface.dark)) {
      out[token] = { ...(out[token] ?? both(value)), dark: value }
    }
  }

  // Type is not layered here on purpose. Families and sizes are the app's own
  // setting, so they are written through ctx.theme.setFontFamily/setFontSize;
  // a token override on the same variables would only win the last paint and
  // leave the Appearance page showing values that do nothing.

  // A continuous radius overrides the three-step scale.
  const radiusValue = Number(settings?.radiusCustom)
  if (Number.isFinite(radiusValue) && radiusValue > 0) {
    const scale = customRadiusScale(radiusValue)
    for (const [token, slot] of Object.entries(RADIUS_SLOTS)) {
      out[token] = both(scale[slot] + 'px')
    }
  }

  const weight = WEIGHTS[settings?.weight]
  if (weight !== undefined) {
    out['--fto-body-weight'] = both(weight)
    for (const [token, value] of Object.entries(weightedMarkdownTokens(weight))) {
      out[token] = both(value)
    }
  }

  const measure = MEASURES[settings?.measure]
  if (measure !== undefined && measure !== null) {
    out['--dsh-chat-content-width'] = both(measure)
  }

  const shadow = SHADOWS[settings?.shadow]
  if (shadow !== undefined && shadow !== null) {
    if (shadow.mode === 'none') {
      out['--dsw-elevation-panel'] = both('none')
      out['--dsw-elevation-prominent'] = both('none')
      out['--dsw-elevation-soft'] = both('none')
    } else {
      out['--dsw-elevation-panel'] = { light: shadow.light, dark: shadow.dark }
      out['--dsw-elevation-prominent'] = { light: shadow.light, dark: shadow.dark }
      out['--dsw-elevation-soft'] = { light: shadow.light, dark: shadow.dark }
    }
  }

  const motion = MOTIONS[settings?.motion]
  if (motion !== undefined && motion !== null) {
    out['--ds-transition-duration'] = both(motion.base)
    out['--ds-transition-duration-fast'] = both(motion.fast)
    out['--ds-transition-duration-slow'] = both(motion.slow)
  }

  out['--dsw-corner-shape'] = both(CORNERS[settings?.corner] ?? CORNERS.round)

  const tone = CODE_TONES[settings?.codeTone]
  if (tone !== undefined && tone !== null) {
    out['--dsw-alias-markdown-code-block'] = { light: tone.light, dark: tone.dark }
  }

  // A wallpaper needs something to show through, so the base surface thins out.
  const image = settings?.background?.image
  if (typeof image === 'string' && image !== '') {
    const visible = Math.min(100, Math.max(0, Number(settings.background.opacity) || 0))
    const keep = Math.round(100 - visible * 0.55)
    for (const token of ['--dsw-alias-bg-base', '--dsw-alias-bg-layer-1']) {
      const pair = out[token]
      if (pair === undefined) continue
      out[token] = {
        light: `color-mix(in srgb, ${pair.light} ${keep}%, transparent)`,
        dark: `color-mix(in srgb, ${pair.dark} ${keep}%, transparent)`,
      }
    }
  }

  return out
}

/** True when the settings need no variant work at all. */
export function isBaseline(settings) {
  return (settings?.accent ?? BASE_ACCENT.id) === BASE_ACCENT.id
    && (settings?.radius ?? 'default') === 'default'
}
