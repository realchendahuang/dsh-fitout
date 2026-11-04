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
    id: 'neutral',
    name: '素净',
    en: 'Bare',
    desc: '灰阶打底，只留一束清亮的蓝。',
    accent: 'sky',
    radius: 'default',
    density: 'default',
    effects: Object.freeze({ underline: true, chip: true }),
    layout: Object.freeze({ disabled: Object.freeze([]) }),
  }),
  Object.freeze({
    id: 'compact',
    name: '密致',
    en: 'Dense',
    desc: '窗与窗挤在一处时，把边角收一收。',
    accent: 'sky',
    radius: 'compact',
    density: 'compact',
    effects: Object.freeze({ underline: true, chip: false }),
    layout: Object.freeze({ disabled: Object.freeze([]) }),
  }),
  Object.freeze({
    id: 'relaxed',
    name: '疏朗',
    en: 'Airy',
    desc: '读长文时，让字里行间透些气来。',
    accent: 'sky',
    radius: 'round',
    density: 'default',
    effects: Object.freeze({ underline: true, chip: true }),
    layout: Object.freeze({ disabled: Object.freeze([]) }),
  }),
])

export const PRESET_IDS = Object.freeze(PRESETS.map((preset) => preset.id))

export function findPreset(id) {
  return PRESETS.find((preset) => preset.id === id) ?? null
}

/** True when every field still matches the named preset. */
export function matchesPreset(preset, settings) {
  if (preset === null || settings === null) return false
  const sameEffects = Object.keys(preset.effects).every((key) => preset.effects[key] === settings.effects[key])
  const sameLayout = preset.layout.disabled.length === settings.layout.disabled.length
    && preset.layout.disabled.every((id) => settings.layout.disabled.includes(id))
  return preset.accent === settings.accent
    && preset.radius === settings.radius
    && preset.density === settings.density
    && sameEffects
    && sameLayout
}

export { ALL_GROUPS }
