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
  const sameOption = ['accent', 'radius', 'density', 'fontSize', 'fontFamily', 'shadow', 'motion', 'corner', 'codeTone']
    .every((key) => (preset[key] ?? null) === (settings[key] ?? null))
  return sameOption && sameEffects && sameLayout
}

export { ALL_GROUPS }
