/** Built-in presets — the 精装 half of the product.
 *
 * A preset is not a token table: it is a set of field values on top of the one
 * shipped palette. Applying a preset writes those fields into the settings
 * record; touching any field afterwards flips the record to `custom`.
 *
 * Adding a preset is adding an object here. Nothing else changes.
 */
import { SECTIONS } from './sections.js'

const ALL_GROUPS = SECTIONS.map((section) => section.id)

export const PRESETS = Object.freeze([
  Object.freeze({
    id: 'standard',
    name: '标准',
    surface: 'neutral',
    accent: 'sky',
    radius: 'default',
    density: 'default',
    fontSize: 'auto',
    fontFamily: 'default',
    shadow: 'soft',
    motion: 'normal',
    corner: 'round',
    codeTone: 'auto',
    effects: Object.freeze({ underline: true, chip: true }),
    layout: Object.freeze({ disabled: Object.freeze([]) }),
  }),
  Object.freeze({
    id: 'compact',
    name: '紧凑',
    surface: 'neutral',
    accent: 'sky',
    radius: 'compact',
    density: 'compact',
    fontSize: 'compact',
    fontFamily: 'default',
    shadow: 'flat',
    motion: 'off',
    corner: 'round',
    codeTone: 'auto',
    effects: Object.freeze({ underline: true, chip: true }),
    layout: Object.freeze({ disabled: Object.freeze([]) }),
  }),
  Object.freeze({
    id: 'relaxed',
    name: '宽松',
    surface: 'neutral',
    accent: 'sky',
    radius: 'round',
    density: 'default',
    fontSize: 'large',
    fontFamily: 'default',
    shadow: 'soft',
    motion: 'slow',
    corner: 'round',
    codeTone: 'auto',
    effects: Object.freeze({ underline: true, chip: true }),
    layout: Object.freeze({ disabled: Object.freeze([]) }),
  }),
  Object.freeze({
    id: 'indigo',
    name: '靛青',
    surface: 'neutral',
    accent: 'violet',
    radius: 'default',
    density: 'default',
    fontSize: 'auto',
    fontFamily: 'default',
    shadow: 'soft',
    motion: 'normal',
    corner: 'round',
    codeTone: 'auto',
    effects: Object.freeze({ underline: true, chip: true }),
    layout: Object.freeze({ disabled: Object.freeze([]) }),
  }),
  Object.freeze({
    id: 'celadon',
    name: '青瓷',
    surface: 'paper',
    accent: 'emerald',
    radius: 'compact',
    density: 'default',
    fontSize: 'auto',
    fontFamily: 'default',
    shadow: 'soft',
    motion: 'normal',
    corner: 'round',
    codeTone: 'auto',
    effects: Object.freeze({ underline: true, chip: true }),
    layout: Object.freeze({ disabled: Object.freeze([]) }),
  }),
  Object.freeze({
    id: 'amber',
    name: '琥珀',
    surface: 'paper',
    accent: 'amber',
    radius: 'round',
    density: 'default',
    fontSize: 'large',
    fontFamily: 'default',
    shadow: 'soft',
    motion: 'normal',
    corner: 'round',
    codeTone: 'auto',
    effects: Object.freeze({ underline: true, chip: true }),
    layout: Object.freeze({ disabled: Object.freeze([]) }),
  }),
  Object.freeze({
    id: 'ink',
    name: '墨',
    surface: 'night',
    accent: 'sky',
    radius: 'default',
    density: 'default',
    fontSize: 'large',
    fontFamily: 'serif',
    shadow: 'lifted',
    motion: 'slow',
    corner: 'squircle',
    codeTone: 'auto',
    effects: Object.freeze({ underline: true, chip: true }),
    layout: Object.freeze({ disabled: Object.freeze([]) }),
  }),
  Object.freeze({
    id: 'terminal',
    name: '终端',
    surface: 'night',
    accent: 'emerald',
    radius: 'compact',
    density: 'compact',
    fontSize: 'compact',
    fontFamily: 'mono',
    shadow: 'flat',
    motion: 'off',
    corner: 'round',
    codeTone: 'dark',
    effects: Object.freeze({ underline: true, chip: true }),
    layout: Object.freeze({ disabled: Object.freeze([]) }),
  }),
  Object.freeze({
    id: 'nordic',
    name: '北境',
    surface: 'nord',
    accent: 'sky',
    radius: 'default',
    density: 'default',
    fontSize: 'auto',
    fontFamily: 'default',
    shadow: 'soft',
    motion: 'normal',
    corner: 'round',
    codeTone: 'auto',
    effects: Object.freeze({ underline: true, chip: true }),
    layout: Object.freeze({ disabled: Object.freeze([]) }),
  }),
  Object.freeze({
    id: 'voyage',
    name: '夜航',
    surface: 'nord',
    accent: 'violet',
    radius: 'round',
    density: 'default',
    fontSize: 'auto',
    fontFamily: 'default',
    shadow: 'soft',
    motion: 'slow',
    corner: 'round',
    codeTone: 'auto',
    effects: Object.freeze({ underline: true, chip: true }),
    layout: Object.freeze({ disabled: Object.freeze([]) }),
  }),
])

export const PRESET_IDS = Object.freeze(PRESETS.map((preset) => preset.id))

const RENAMED = Object.freeze({ neutral: 'standard', 'zcode-neutral': 'standard' })

export function findPreset(id) {
  return PRESETS.find((preset) => preset.id === id)
    ?? PRESETS.find((preset) => preset.id === RENAMED[id])
    ?? null
}

/** True when every field still matches the named preset. */
export function matchesPreset(preset, settings) {
  if (preset === null || settings === null) return false
  const sameEffects = Object.keys(preset.effects).every((key) => preset.effects[key] === settings.effects[key])
  const sameLayout = preset.layout.disabled.length === settings.layout.disabled.length
    && preset.layout.disabled.every((id) => settings.layout.disabled.includes(id))
  const sameOption = ['surface', 'accent', 'radius', 'density', 'fontSize', 'fontFamily', 'shadow', 'motion', 'corner', 'codeTone']
    .every((key) => (preset[key] ?? null) === (settings[key] ?? null))
  return sameOption && sameEffects && sameLayout
}

export { ALL_GROUPS }
