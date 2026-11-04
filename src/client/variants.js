/** Runtime variants on top of the generated token layer.
 *
 * The accent hue and the corner scale are not separate stylesheets: they rewrite
 * the same token table the skin already overrides, so a change re-applies one
 * override layer and every shipped component follows.
 */
import { TOKENS } from './tokens.js'
import { ACCENTS, RADIUS_SCALES } from './store.js'

const BASE_ACCENT = ACCENTS[0]

const FONT_SIZES = Object.freeze({
  auto: null,
  compact: { content: '13px', code: '11px', terminal: '12px' },
  standard: { content: '15px', code: '12px', terminal: '13px' },
  large: { content: '17px', code: '13px', terminal: '14px' },
})

const FONT_FAMILIES = Object.freeze({
  default: null,
  serif: '"Songti SC","Source Han Serif SC","Noto Serif CJK SC",Georgia,"Times New Roman",serif',
  mono: 'ui-monospace,"SF Mono",Menlo,Consolas,monospace',
  rounded: '"SF Pro Rounded","Hiragino Maru Gothic ProN","PingFang SC",system-ui,sans-serif',
})

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
  return applyOptions(out, settings)
}

/** Stack the enumerated design options on top of the palette tokens. */
function applyOptions(out, settings) {
  const both = (value) => ({ light: value, dark: value })

  const size = FONT_SIZES[settings?.fontSize]
  if (size !== undefined && size !== null) {
    out['--dsh-content-font-size'] = both(size.content)
    out['--dsh-code-font-size'] = both(size.code)
    out['--dsh-terminal-font-size'] = both(size.terminal)
  }

  const family = FONT_FAMILIES[settings?.fontFamily]
  if (family !== undefined && family !== null) {
    out['--dsh-font-family-text'] = both(family)
    out['--dsw-font-family'] = both(family)
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

  return out
}

/** True when the settings need no variant work at all. */
export function isBaseline(settings) {
  return (settings?.accent ?? BASE_ACCENT.id) === BASE_ACCENT.id
    && (settings?.radius ?? 'default') === 'default'
}
