/** Fitout settings: one record for the whole surface.
 *
 * The product has two halves, matching how people actually use it:
 *
 *   精装 (preset)  – pick one finished look; every field below comes from it
 *   高定 (custom)  – change any single field; the preset then reads as 自定义
 *
 * Persisted record:
 *   enabled   master switch
 *   preset    id of the applied preset, or 'custom' once a field was touched
 *   list      sidebar list: the task list or the shipped browser
 *   name      custom sidebar wordmark; empty keeps the shipped brand
 *   icon      { kind: 'official' | preset-id | 'custom', value }
 *   accent    accent hue id          (see ACCENTS)
 *   radius    corner scale id        (see RADIUS_SCALES)
 *   density   sidebar density id
 *   effects   { underline, chip }
 *   layout    { disabled: string[] } — layout groups turned off
 *
 * Persistence is localStorage: this is a client-only presentation plugin with no
 * Host service. Settings from the previous two-package generation are migrated
 * on first read.
 */

const KEY = 'dsh-fitout:settings'
const LEGACY_SKIN = 'dsh-zcode-skin:settings'
const LEGACY_STEPS = 'dsh-zcode-steps:settings'

export const ACCENTS = Object.freeze([
  { id: 'sky', label: '天蓝', light: '#0284c7', dark: '#38bdf8' },
  { id: 'violet', label: '紫罗兰', light: '#7c3aed', dark: '#a78bfa' },
  { id: 'emerald', label: '翡翠', light: '#059669', dark: '#34d399' },
  { id: 'amber', label: '琥珀', light: '#d97706', dark: '#fbbf24' },
  { id: 'rose', label: '玫红', light: '#e11d48', dark: '#fb7185' },
])

export const RADIUS_SCALES = Object.freeze({
  compact: { xs: '3px', sm: '4px', md: '6px', lg: '8px', xl: '12px', panel: '12px' },
  default: { xs: '4px', sm: '6px', md: '8px', lg: '12px', xl: '16px', panel: '16px' },
  round: { xs: '6px', sm: '8px', md: '12px', lg: '16px', xl: '20px', panel: '20px' },
})

const DEFAULTS = Object.freeze({
  enabled: true,
  preset: 'standard',
  list: 'zcode',
  name: '',
  icon: { kind: 'official', value: '' },
  accent: 'sky',
  radius: 'default',
  density: 'default',
  effects: { underline: true, chip: true },
  layout: { disabled: [] },
  fontSize: 'auto',
  fontFamily: 'default',
  shadow: 'soft',
  motion: 'normal',
  corner: 'round',
  codeTone: 'auto',
  themes: [],
})

/** Every enumerated design option and its accepted values. */
export const OPTIONS = Object.freeze({
  fontSize: Object.freeze(['auto', 'compact', 'standard', 'large']),
  fontFamily: Object.freeze(['default', 'serif', 'mono', 'rounded']),
  shadow: Object.freeze(['flat', 'soft', 'lifted']),
  motion: Object.freeze(['off', 'normal', 'slow']),
  corner: Object.freeze(['round', 'squircle']),
  codeTone: Object.freeze(['auto', 'light', 'dark']),
})

function readOption(key, value) {
  const allowed = OPTIONS[key]
  return allowed.includes(value) ? value : DEFAULTS[key]
}

export function clone(state) {
  return {
    enabled: state.enabled,
    preset: state.preset,
    list: state.list,
    name: state.name,
    icon: { ...state.icon },
    accent: state.accent,
    radius: state.radius,
    density: state.density,
    effects: { ...state.effects },
    layout: { disabled: [...state.layout.disabled] },
    fontSize: state.fontSize,
    fontFamily: state.fontFamily,
    shadow: state.shadow,
    motion: state.motion,
    corner: state.corner,
    codeTone: state.codeTone,
    themes: state.themes.map(copyTheme),
  }
}

/** One saved theme: the same shape as a built-in preset, plus its own id. */
function copyTheme(theme) {
  return {
    id: theme.id,
    name: theme.name,
    accent: theme.accent,
    radius: theme.radius,
    density: theme.density,
    effects: { ...theme.effects },
    layout: { disabled: [...theme.layout.disabled] },
    fontSize: theme.fontSize ?? DEFAULTS.fontSize,
    fontFamily: theme.fontFamily ?? DEFAULTS.fontFamily,
    shadow: theme.shadow ?? DEFAULTS.shadow,
    motion: theme.motion ?? DEFAULTS.motion,
    corner: theme.corner ?? DEFAULTS.corner,
    codeTone: theme.codeTone ?? DEFAULTS.codeTone,
  }
}

/** A saved theme is only trusted when it is complete and well-typed. */
function readSavedTheme(raw) {
  if (raw === null || typeof raw !== 'object') return null
  if (typeof raw.id !== 'string' || raw.id === '' || typeof raw.name !== 'string') return null
  return copyTheme({
    id: raw.id,
    name: raw.name.slice(0, 20),
    accent: typeof raw.accent === 'string' ? raw.accent : DEFAULTS.accent,
    radius: typeof raw.radius === 'string' ? raw.radius : DEFAULTS.radius,
    density: raw.density === 'compact' ? 'compact' : 'default',
    effects: {
      underline: raw.effects?.underline !== false,
      chip: raw.effects?.chip !== false,
    },
    layout: {
      disabled: Array.isArray(raw.layout?.disabled)
        ? raw.layout.disabled.filter((x) => typeof x === 'string')
        : [],
    },
    fontSize: readOption('fontSize', raw.fontSize),
    fontFamily: readOption('fontFamily', raw.fontFamily),
    shadow: readOption('shadow', raw.shadow),
    motion: readOption('motion', raw.motion),
    corner: readOption('corner', raw.corner),
    codeTone: readOption('codeTone', raw.codeTone),
  })
}

function oneOf(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback
}

function readLegacy() {
  try {
    const rawSkin = globalThis.localStorage?.getItem(LEGACY_SKIN)
    const skin = rawSkin ? JSON.parse(rawSkin) : null
    const rawSteps = globalThis.localStorage?.getItem(LEGACY_STEPS)
    const steps = rawSteps ? JSON.parse(rawSteps) : null
    if (skin === null && steps === null) return null
    return {
      enabled: skin?.enabled !== false,
      preset: 'custom',
      list: skin?.list === 'native' ? 'native' : 'zcode',
      name: typeof skin?.name === 'string' ? skin.name : '',
      icon: skin?.icon && typeof skin.icon === 'object'
        ? { kind: String(skin.icon.kind ?? 'official'), value: String(skin.icon.value ?? '') }
        : { ...DEFAULTS.icon },
      accent: oneOf(skin?.accent, ACCENTS.map((a) => a.id), DEFAULTS.accent),
      radius: oneOf(skin?.radius, Object.keys(RADIUS_SCALES), DEFAULTS.radius),
      density: oneOf(skin?.density, ['default', 'compact'], DEFAULTS.density),
      effects: {
        underline: skin?.effects?.underline !== false,
        chip: skin?.effects?.chip !== false,
      },
      layout: {
        disabled: Array.isArray(steps?.disabled) ? [...steps.disabled] : [],
      },
      fontSize: DEFAULTS.fontSize,
      fontFamily: DEFAULTS.fontFamily,
      shadow: DEFAULTS.shadow,
      motion: DEFAULTS.motion,
      corner: DEFAULTS.corner,
      codeTone: DEFAULTS.codeTone,
      themes: [],
    }
  } catch {
    return null
  }
}

function readStored() {
  try {
    const raw = globalThis.localStorage?.getItem(KEY)
    if (raw !== null && raw !== undefined) {
      const parsed = JSON.parse(raw)
      return {
        enabled: parsed?.enabled !== false,
        preset: typeof parsed?.preset === 'string' ? parsed.preset : DEFAULTS.preset,
        list: parsed?.list === 'native' ? 'native' : 'zcode',
        name: typeof parsed?.name === 'string' ? parsed.name : '',
        icon: parsed?.icon && typeof parsed.icon === 'object'
          ? { kind: String(parsed.icon.kind ?? 'official'), value: String(parsed.icon.value ?? '') }
          : { ...DEFAULTS.icon },
        accent: oneOf(parsed?.accent, ACCENTS.map((a) => a.id), DEFAULTS.accent),
        radius: oneOf(parsed?.radius, Object.keys(RADIUS_SCALES), DEFAULTS.radius),
        density: oneOf(parsed?.density, ['default', 'compact'], DEFAULTS.density),
        effects: {
          underline: parsed?.effects?.underline !== false,
          chip: parsed?.effects?.chip !== false,
        },
        layout: {
          disabled: Array.isArray(parsed?.layout?.disabled) ? parsed.layout.disabled.filter((x) => typeof x === 'string') : [],
        },
        fontSize: readOption('fontSize', parsed?.fontSize),
        fontFamily: readOption('fontFamily', parsed?.fontFamily),
        shadow: readOption('shadow', parsed?.shadow),
        motion: readOption('motion', parsed?.motion),
        corner: readOption('corner', parsed?.corner),
        codeTone: readOption('codeTone', parsed?.codeTone),
        themes: Array.isArray(parsed?.themes)
          ? parsed.themes.map(readSavedTheme).filter((theme) => theme !== null)
          : [],
      }
    }
  } catch {
    /* private mode or a malformed record: fall back to defaults */
  }
  return readLegacy() ?? clone(DEFAULTS)
}

let state = readStored()
let applier = null
const listeners = new Set()

function persist() {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(state))
    // Once migrated, the old keys would only fight the new record.
    globalThis.localStorage?.removeItem(LEGACY_SKIN)
    globalThis.localStorage?.removeItem(LEGACY_STEPS)
  } catch {
    /* storage unavailable: the choice stays session-only */
  }
}

function publish() {
  for (const listener of [...listeners]) listener()
}

function commit(next, reapply = true) {
  state = next
  persist()
  if (reapply && applier !== null) {
    try {
      applier(clone(state))
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[dsh-fitout] could not apply the appearance', error)
    }
  }
  publish()
}

/** Bind the entry-owned applier and push the initial state. */
export function bindApplier(fn) {
  applier = fn
  fn(clone(state))
}

export function getSettings() {
  return state
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/* --- master & preset ------------------------------------------------------ */

export function setEnabled(enabled) {
  const next = Boolean(enabled)
  if (next === state.enabled) return
  commit({ ...state, enabled: next })
}

/** Apply one preset wholesale. `preset` stays selectable only while untouched. */
export function applyPreset(preset) {
  commit({
    ...state,
    preset: preset.id,
    accent: preset.accent,
    radius: preset.radius,
    density: preset.density,
    fontSize: preset.fontSize ?? DEFAULTS.fontSize,
    fontFamily: preset.fontFamily ?? DEFAULTS.fontFamily,
    shadow: preset.shadow ?? DEFAULTS.shadow,
    motion: preset.motion ?? DEFAULTS.motion,
    corner: preset.corner ?? DEFAULTS.corner,
    codeTone: preset.codeTone ?? DEFAULTS.codeTone,
    effects: { ...state.effects, ...preset.effects },
    layout: { disabled: [...preset.layout.disabled] },
  })
}

/** One enumerated option (see OPTIONS); marks the record custom. */
export function setOption(key, value) {
  const allowed = OPTIONS[key]
  if (allowed === undefined || !allowed.includes(value)) return
  if (state[key] === value) return
  commit(custom({ ...state, [key]: value }))
}

/* --- saved themes ---------------------------------------------------------- */

/** Store the current appearance as a named theme and make it the active one. */
export function saveTheme(name) {
  const label = String(name ?? '').trim().slice(0, 20) || '我的主题'
  const theme = copyTheme({
    id: 'u-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: label,
    accent: state.accent,
    radius: state.radius,
    density: state.density,
    effects: state.effects,
    layout: state.layout,
    fontSize: state.fontSize,
    fontFamily: state.fontFamily,
    shadow: state.shadow,
    motion: state.motion,
    corner: state.corner,
    codeTone: state.codeTone,
  })
  commit({ ...state, themes: [...state.themes, theme], preset: theme.id })
  return theme
}

export function deleteTheme(id) {
  const themes = state.themes.filter((theme) => theme.id !== id)
  if (themes.length === state.themes.length) return
  commit({
    ...state,
    themes,
    preset: state.preset === id ? 'custom' : state.preset,
  })
}

export function renameTheme(id, name) {
  const label = String(name ?? '').trim().slice(0, 20)
  if (label === '') return
  commit({
    ...state,
    themes: state.themes.map((theme) => (theme.id === id ? { ...theme, name: label } : theme)),
  }, false)
}

/* --- 高定 fields ---------------------------------------------------------- */

export function setList(mode) {
  const next = mode === 'native' ? 'native' : 'zcode'
  if (next === state.list) return
  commit({ ...state, list: next }, false)
}

export function setAppearance(patch) {
  const next = { ...state }
  if (Object.prototype.hasOwnProperty.call(patch, 'name')) {
    next.name = String(patch.name ?? '').slice(0, 32)
  }
  if (patch.icon !== undefined) {
    next.icon = { kind: String(patch.icon.kind ?? 'official'), value: String(patch.icon.value ?? '') }
  }
  commit(next, false)
}

function custom(next) {
  return { ...next, preset: 'custom' }
}

export function setAccent(id) {
  if (state.accent === id || !ACCENTS.some((a) => a.id === id)) return
  commit(custom({ ...state, accent: id }))
}

export function setRadius(id) {
  if (state.radius === id || RADIUS_SCALES[id] === undefined) return
  commit(custom({ ...state, radius: id }))
}

export function setDensity(id) {
  const next = id === 'compact' ? 'compact' : 'default'
  if (state.density === next) return
  commit(custom({ ...state, density: next }))
}

export function setEffect(key, on) {
  if (!(key in state.effects) || state.effects[key] === Boolean(on)) return
  commit(custom({ ...state, effects: { ...state.effects, [key]: Boolean(on) } }))
}

/* --- 版式 groups ---------------------------------------------------------- */

export function setLayoutGroup(id, on) {
  const off = !on
  const has = state.layout.disabled.includes(id)
  if (off === has) return
  const disabled = off
    ? [...state.layout.disabled, id]
    : state.layout.disabled.filter((x) => x !== id)
  commit(custom({ ...state, layout: { disabled } }))
}

export function setAllLayoutGroups(all, ids) {
  const next = all ? [] : [...ids]
  if (next.length === state.layout.disabled.length) return
  commit(custom({ ...state, layout: { disabled: next } }))
}

/* --- resets --------------------------------------------------------------- */

/** Restore the shipped brand and every visual field; keep the master switch. */
export function resetAppearance() {
  commit({
    ...clone(DEFAULTS),
    enabled: state.enabled,
    list: state.list,
  })
}

/** Reset everything, including the list mode and the master switch. */
export function resetAll() {
  commit(clone(DEFAULTS))
}

/* --- theme bridge: the light/dark preference belongs to the host theme ----- */

let readTheme = () => 'system'
let writeTheme = () => {}

export function bindThemeBridge(read, write) {
  readTheme = read
  writeTheme = write
}

export function getThemePreference() {
  try {
    return readTheme()
  } catch {
    return 'system'
  }
}

export function setThemePreference(id) {
  try {
    writeTheme(id)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[dsh-fitout] could not change the theme preference', error)
  }
}
