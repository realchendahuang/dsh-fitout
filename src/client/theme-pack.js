/** Theme pack import / export.
 *
 * Two shapes are readable:
 *
 *   dsh-fitout/theme       our own export — colour, corners, density, layout
 *   dsh-dream-skin/pack    the format already circulating in the ecosystem —
 *                          a manifest with a token dictionary
 *
 * A foreign pack only carries colours, so it is reduced to the nearest built-in
 * accent and the standard shape. What we export is a superset: it also carries
 * the layout groups, which no other pack format has.
 */
import { ACCENTS, OPTIONS, RADIUS_SCALES } from './store.js'

export const OUR_FORMAT = 'dsh-fitout/theme'

function hexToRgb(value) {
  if (typeof value !== 'string') return null
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim())
  if (match === null) return null
  const raw = match[1]
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ]
}

/** Nearest built-in accent to an arbitrary hex colour, by plain RGB distance. */
export function nearestAccent(value) {
  const target = hexToRgb(value)
  if (target === null) return null
  let best = null
  let bestDistance = Infinity
  for (const accent of ACCENTS) {
    const candidate = hexToRgb(accent.light)
    if (candidate === null) continue
    const distance = (target[0] - candidate[0]) ** 2
      + (target[1] - candidate[1]) ** 2
      + (target[2] - candidate[2]) ** 2
    if (distance < bestDistance) {
      bestDistance = distance
      best = accent.id
    }
  }
  return best
}

const ACCENT_IDS = ACCENTS.map((accent) => accent.id)

/** Read any supported pack into { name, accent, radius, density, source }. */
const OPTION_KEYS = ['fontSize', 'fontFamily', 'shadow', 'motion', 'corner', 'codeTone']

function readOptions(source) {
  const out = {}
  for (const key of OPTION_KEYS) {
    const value = source?.[key]
    if (typeof value === 'string' && OPTIONS[key].includes(value)) out[key] = value
  }
  return out
}

export function readPack(json) {
  if (json === null || typeof json !== 'object') return null

  // Our own export, or a hand-written object with the same field names.
  if (json.format === OUR_FORMAT || (typeof json.accent === 'string' && typeof json.radius === 'string' && json.manifest === undefined)) {
    return {
      name: String(json.name ?? '导入的主题').slice(0, 20),
      accent: ACCENT_IDS.includes(json.accent) ? json.accent : 'sky',
      radius: RADIUS_SCALES[json.radius] === undefined ? 'default' : json.radius,
      density: json.density === 'compact' ? 'compact' : 'default',
      layout: Array.isArray(json.layout?.disabled)
        ? json.layout.disabled.filter((id) => typeof id === 'string')
        : [],
      options: readOptions(json),
      source: 'fitout',
    }
  }

  // A foreign pack: manifest + token dictionary.
  const manifest = json.manifest
  if (manifest !== null && typeof manifest === 'object') {
    const tokens = manifest.tokens !== null && typeof manifest.tokens === 'object' ? manifest.tokens : {}
    const probe = manifest.accent
      ?? tokens['--dsw-alias-link']
      ?? tokens['--dsw-alias-brand-primary-new-colorprimary-new-color']
      ?? tokens['--dsw-alias-brand-primary']
      ?? tokens['--dsw-alias-state-business-primary']
    return {
      name: String(manifest.nameZh ?? manifest.name ?? '导入的主题').slice(0, 20),
      accent: nearestAccent(probe) ?? 'sky',
      radius: 'default',
      density: 'default',
      layout: [],
      options: {},
      source: 'pack',
    }
  }

  return null
}

/** Serialise the current appearance as our own pack. */
export function writePack(settings, name) {
  return {
    format: OUR_FORMAT,
    version: 1,
    name: String(name ?? '我的主题').slice(0, 20),
    accent: settings.accent,
    radius: settings.radius,
    density: settings.density,
    effects: { underline: settings.effects.underline, chip: settings.effects.chip },
    layout: { disabled: [...settings.layout.disabled] },
    fontSize: settings.fontSize,
    fontFamily: settings.fontFamily,
    shadow: settings.shadow,
    motion: settings.motion,
    corner: settings.corner,
    codeTone: settings.codeTone,
  }
}
