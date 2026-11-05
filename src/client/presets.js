/** Built-in presets — the 精装 half of the product.
 *
 * A preset is not a token table: it is a set of field values on top of the one
 * shipped palette. Applying a preset writes those fields into the settings
 * record; touching any field afterwards flips the record to `custom`.
 *
 * Fonts are the one part that does not live in our own layer. Families and
 * sizes are the app's settings (`ctx.theme.setFontFamily` / `setFontSize`), so a
 * preset carries a recipe that is *written* when the theme is chosen, and
 * `matchesPreset` compares that recipe against the fonts actually in effect —
 * which is why it takes the live snapshot as a third argument.
 *
 * Adding a preset is adding an object here. Nothing else changes.
 */
import { TYPE_DEFAULTS, normalizeFont } from './store.js'


/** A type recipe, in the role order the app stores. */
const type = (text, code, terminal) => Object.freeze({ text, code, terminal })

/** Three font roles as real stacks ('' = whatever the app ships).
 *
 * Stacks are written West-first, East second, the way Chinese typesetting has
 * always done it: the Latin face wins for Latin glyphs, the CJK face catches
 * 汉字, and a generic family ends the list so an uninstalled name degrades into
 * something readable instead of nothing.
 */
const font = (text, code, terminal) => Object.freeze({ text, code, terminal })

const MONO = '"Menlo", "Monaco", monospace'
const NF_MONO = '"JetBrainsMono Nerd Font", "JetBrains Mono", "Menlo", monospace'

export const PRESETS = Object.freeze([
  Object.freeze({
    id: 'standard',
    name: '标准',
    surface: 'neutral',
    accent: 'sky',
    radius: 'default',
    font: font('', '', ''),
    type: type(14, 11, 13),
    weight: 'normal',
    shadow: 'soft',
    motion: 'normal',
    corner: 'round',
    codeTone: 'auto',
    effects: Object.freeze({ chip: true }),
  }),
  Object.freeze({
    id: 'compact',
    name: '紧凑',
    surface: 'neutral',
    accent: 'sky',
    radius: 'compact',
    font: font('"PT Sans", "PingFang SC", "Helvetica Neue", sans-serif', '"Menlo", "Monaco", monospace', '"Menlo", "Monaco", monospace'),
    type: type(13, 10, 12),
    weight: 'normal',
    shadow: 'flat',
    motion: 'off',
    corner: 'round',
    codeTone: 'auto',
    effects: Object.freeze({ chip: true }),
  }),
  Object.freeze({
    id: 'relaxed',
    name: '宽松',
    surface: 'neutral',
    accent: 'sky',
    radius: 'round',
    font: font('"Seravek", "PingFang SC", sans-serif', NF_MONO, MONO),
    type: type(16, 12, 14),
    weight: 'normal',
    shadow: 'soft',
    motion: 'slow',
    corner: 'round',
    codeTone: 'auto',
    effects: Object.freeze({ chip: true }),
  }),
  Object.freeze({
    id: 'indigo',
    name: '靛青',
    surface: 'neutral',
    accent: 'violet',
    radius: 'default',
    font: font('"Helvetica Neue", "PingFang SC", "Arial", sans-serif', MONO, MONO),
    type: type(14, 11, 13),
    weight: 'normal',
    shadow: 'soft',
    motion: 'normal',
    corner: 'round',
    codeTone: 'auto',
    effects: Object.freeze({ chip: true }),
  }),
  Object.freeze({
    id: 'celadon',
    name: '青瓷',
    surface: 'paper',
    accent: 'emerald',
    radius: 'compact',
    font: font('"Iowan Old Style", "Songti SC", "Georgia", serif', '"Courier New", "Courier", monospace', MONO),
    type: type(15, 12, 13),
    weight: 'normal',
    shadow: 'soft',
    motion: 'normal',
    corner: 'round',
    codeTone: 'auto',
    effects: Object.freeze({ chip: true }),
  }),
  Object.freeze({
    id: 'amber',
    name: '琥珀',
    surface: 'paper',
    accent: 'amber',
    radius: 'round',
    font: font('"Avenir Next", "Yuanti SC", sans-serif', '"Andale Mono", "Menlo", monospace', MONO),
    type: type(15, 12, 13),
    weight: 'normal',
    shadow: 'soft',
    motion: 'normal',
    corner: 'round',
    codeTone: 'auto',
    effects: Object.freeze({ chip: true }),
  }),
  Object.freeze({
    id: 'ink',
    name: '墨',
    surface: 'night',
    accent: 'sky',
    radius: 'default',
    font: font('"Charter", "Songti SC", "Georgia", serif', MONO, MONO),
    type: type(16, 12, 13),
    weight: 'normal',
    shadow: 'lifted',
    motion: 'slow',
    corner: 'squircle',
    codeTone: 'auto',
    effects: Object.freeze({ chip: true }),
  }),
  Object.freeze({
    id: 'terminal',
    name: '终端',
    surface: 'night',
    accent: 'emerald',
    radius: 'compact',
    font: font('"Menlo", "PingFang SC", monospace', NF_MONO, MONO),
    type: type(13, 11, 13),
    weight: 'normal',
    shadow: 'flat',
    motion: 'off',
    corner: 'round',
    codeTone: 'dark',
    effects: Object.freeze({ chip: true }),
  }),
  Object.freeze({
    id: 'nordic',
    name: '北境',
    surface: 'nord',
    accent: 'sky',
    radius: 'default',
    font: font('"Hiragino Sans GB", "PingFang SC", sans-serif', '"PT Mono", "Menlo", monospace', MONO),
    type: type(14, 11, 13),
    weight: 'normal',
    shadow: 'soft',
    motion: 'normal',
    corner: 'round',
    codeTone: 'auto',
    effects: Object.freeze({ chip: true }),
  }),
  Object.freeze({
    id: 'voyage',
    name: '夜航',
    surface: 'nord',
    accent: 'violet',
    radius: 'round',
    font: font('"Hoefler Text", "Kaiti SC", "Georgia", serif', '"Monaco", "Menlo", monospace', '"Monaco", "Menlo", monospace'),
    type: type(15, 11, 14),
    weight: 'normal',
    shadow: 'soft',
    motion: 'slow',
    corner: 'round',
    codeTone: 'auto',
    effects: Object.freeze({ chip: true }),
  }),
])

export const PRESET_IDS = Object.freeze(PRESETS.map((preset) => preset.id))

const RENAMED = Object.freeze({ neutral: 'standard', 'zcode-neutral': 'standard' })

export function findPreset(id) {
  return PRESETS.find((preset) => preset.id === id)
    ?? PRESETS.find((preset) => preset.id === RENAMED[id])
    ?? null
}

/** True when every field still matches the named preset.
 *
 * `live` is the app's font snapshot. When it is unavailable (a host that
 * publishes no fonts, or the offline preview) the record's own values stand in,
 * so the shelf still highlights something instead of going blank.
 */
export function matchesPreset(preset, settings, live) {
  if (preset === null || settings === null) return false
  const sameEffects = Object.keys(preset.effects).every((key) => preset.effects[key] === settings.effects[key])
  const sameOption = ['surface', 'accent', 'radius', 'measure', 'weight', 'shadow', 'motion', 'corner', 'codeTone']
    .every((key) => (preset[key] ?? null) === (settings[key] ?? null))
  const families = live?.ready === true ? live.families : settings.font
  const sizes = live?.ready === true ? live.sizes : settings.type
  const sameType = ['text', 'code', 'terminal'].every((role) => (
    normalizeFont(preset.font?.[role] ?? '') === normalizeFont(families?.[role] ?? '')
    && (preset.type?.[role] ?? TYPE_DEFAULTS[role]) === (sizes?.[role] ?? TYPE_DEFAULTS[role])
  ))
  return sameOption && sameEffects && sameType
}
