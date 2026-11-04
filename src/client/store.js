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

/** The three roles the shipped theme exposes, and each one's px range.
 *
 * These are not our invention: `FONT_SIZE_SPECS` in the shipped theme is what
 * `ctx.theme.setFontSize()` validates against, and a value outside the range
 * throws. Keeping our own copy means the panel can clamp before it asks.
 */
export const FONT_ROLES = Object.freeze(['text', 'code', 'terminal'])

export const TYPE_RANGES = Object.freeze({
  text: Object.freeze({ min: 10, max: 22 }),
  code: Object.freeze({ min: 10, max: 16 }),
  terminal: Object.freeze({ min: 10, max: 20 }),
})

/** The shipped theme's own defaults, so "跟随" has a number to fall back to. */
export const TYPE_DEFAULTS = Object.freeze({ text: 14, code: 11, terminal: 13 })

const DEFAULTS = Object.freeze({
  enabled: true,
  preset: 'standard',
  name: '',
  icon: { kind: 'official', value: '' },
  accent: 'sky',
  radius: 'default',
  density: 'default',
  effects: { underline: true, chip: true },
  layout: { disabled: [] },
  surface: 'neutral',
  glass: 'off',
  measure: 'auto',
  lineHeight: 'normal',
  radiusCustom: 0,
  font: Object.freeze({ text: '', code: '', terminal: '' }),
  type: Object.freeze({ ...TYPE_DEFAULTS }),
  shadow: 'soft',
  motion: 'normal',
  corner: 'round',
  codeTone: 'auto',
  background: { image: '', opacity: 55, blur: 0 },
  accentCustom: '',
  themes: [],
})

/** Every enumerated design option and its accepted values. */
export const OPTIONS = Object.freeze({
  surface: Object.freeze(['neutral', 'paper', 'night', 'nord']),
  glass: Object.freeze(['off', 'cards', 'all']),
  measure: Object.freeze(['auto', 'narrow', 'wide']),
  lineHeight: Object.freeze(['tight', 'normal', 'loose']),
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
    name: state.name,
    icon: { ...state.icon },
    accent: state.accent,
    radius: state.radius,
    density: state.density,
    effects: { ...state.effects },
    layout: { disabled: [...state.layout.disabled] },
    surface: state.surface,
    glass: state.glass,
    measure: state.measure,
    lineHeight: state.lineHeight,
    radiusCustom: state.radiusCustom,
    font: { ...state.font },
    type: { ...state.type },
    background: { ...state.background },
    accentCustom: state.accentCustom,
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
    surface: theme.surface ?? DEFAULTS.surface,
    glass: theme.glass ?? DEFAULTS.glass,
    measure: theme.measure ?? DEFAULTS.measure,
    lineHeight: theme.lineHeight ?? DEFAULTS.lineHeight,
    font: readFont(theme.font),
    type: readType(theme.type),
    shadow: theme.shadow ?? DEFAULTS.shadow,
    motion: theme.motion ?? DEFAULTS.motion,
    corner: theme.corner ?? DEFAULTS.corner,
    codeTone: theme.codeTone ?? DEFAULTS.codeTone,
    background: { ...DEFAULTS.background },
    accentCustom: theme.accentCustom ?? DEFAULTS.accentCustom,
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
    surface: readOption('surface', raw.surface),
    font: readFont(raw.font ?? migrateFont(raw)),
    type: readType(raw.type ?? migrateType(raw)),
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
      background: { ...DEFAULTS.background },
      accentCustom: DEFAULTS.accentCustom,
      surface: DEFAULTS.surface,
      glass: DEFAULTS.glass,
      measure: DEFAULTS.measure,
      lineHeight: DEFAULTS.lineHeight,
      radiusCustom: DEFAULTS.radiusCustom,
      font: { ...DEFAULTS.font },
      type: { ...DEFAULTS.type },
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

/** Background image + its two sliders; any malformed field falls back. */
function readBackground(raw) {
  if (raw === null || typeof raw !== 'object') return { ...DEFAULTS.background }
  const clamp = (value, min, max, fallback) => {
    const n = Number(value)
    return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback
  }
  return {
    image: typeof raw.image === 'string' ? raw.image : '',
    opacity: clamp(raw.opacity, 0, 100, DEFAULTS.background.opacity),
    blur: clamp(raw.blur, 0, 40, DEFAULTS.background.blur),
  }
}

/** A continuous corner radius in px; 0 means "use the three-step scale". */
function readRadiusCustom(raw) {
  const n = Number(raw)
  return Number.isFinite(n) ? Math.min(24, Math.max(0, Math.round(n))) : 0
}

/** Family keywords CSS must keep unquoted; mirrors the shipped normalizer. */
const GENERIC_FAMILIES = new Set([
  'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
  'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded', 'emoji', 'math',
  'fangsong', '-apple-system', 'blinkmacsystemfont',
])

/** Turn free text into the same font-family list the shipped theme would store.
 *
 * Matching a preset compares our record against the live theme snapshot, and
 * that snapshot holds normalized lists, so we normalize on the way in.
 */
export function normalizeFont(raw) {
  if (typeof raw !== 'string') return ''
  return raw
    .split(',')
    .map((name) => name.replace(/["'\\<>\u0000-\u001f\u007f]/gu, '').replace(/\s+/gu, ' ').trim())
    .filter((name) => name !== '')
    .map((name) => (GENERIC_FAMILIES.has(name.toLowerCase()) ? name : '"' + name + '"'))
    .join(', ')
}

function readTypeSize(role, raw) {
  const range = TYPE_RANGES[role]
  const n = Number(raw)
  return Number.isFinite(n)
    ? Math.min(range.max, Math.max(range.min, Math.round(n)))
    : TYPE_DEFAULTS[role]
}

function readType(raw) {
  return {
    text: readTypeSize('text', raw?.text ?? TYPE_DEFAULTS.text),
    code: readTypeSize('code', raw?.code ?? TYPE_DEFAULTS.code),
    terminal: readTypeSize('terminal', raw?.terminal ?? TYPE_DEFAULTS.terminal),
  }
}

function readFont(raw) {
  return {
    text: normalizeFont(raw?.text ?? ''),
    code: normalizeFont(raw?.code ?? ''),
    terminal: normalizeFont(raw?.terminal ?? ''),
  }
}

/* --- migration from the 0.7 two-enum model -------------------------------- */

const LEGACY_TYPE = Object.freeze({
  auto: null,
  compact: Object.freeze({ text: 13, code: 11, terminal: 12 }),
  standard: Object.freeze({ text: 15, code: 12, terminal: 13 }),
  large: Object.freeze({ text: 17, code: 13, terminal: 14 }),
})

const SERIF_STACK = '"Songti SC", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, "Times New Roman", serif'
const MONO_STACK = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace'
const ROUNDED_STACK = '"SF Pro Rounded", "Hiragino Maru Gothic ProN", "PingFang SC", system-ui, sans-serif'

const LEGACY_FONT = Object.freeze({
  default: null,
  serif: Object.freeze({ text: SERIF_STACK }),
  rounded: Object.freeze({ text: ROUNDED_STACK }),
  mono: Object.freeze({ text: MONO_STACK, code: MONO_STACK, terminal: MONO_STACK }),
})

/** Old records kept one font-size enum and one typeface enum; split them. */
function migrateFont(parsed) {
  const legacyFont = LEGACY_FONT[parsed?.fontFamily] ?? null
  const custom = typeof parsed?.fontFamilyCustom === 'string' ? parsed.fontFamilyCustom.trim() : ''
  return { ...(legacyFont ?? {}), ...(custom !== '' ? { text: custom } : {}) }
}

function migrateType(parsed) {
  return LEGACY_TYPE[parsed?.fontSize] ?? null
}

/** An arbitrary accent colour, or '' for the preset hues. */
function readAccent(raw) {
  return typeof raw === 'string' && /^#[0-9a-f]{6}$/i.test(raw) ? raw.toLowerCase() : ''
}

function readStored() {
  try {
    const raw = globalThis.localStorage?.getItem(KEY)
    if (raw !== null && raw !== undefined) {
      const parsed = JSON.parse(raw)
      return {
        enabled: parsed?.enabled !== false,
        preset: typeof parsed?.preset === 'string' ? parsed.preset : DEFAULTS.preset,
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
        background: readBackground(parsed?.background),
        accentCustom: readAccent(parsed?.accentCustom),
        surface: readOption('surface', parsed?.surface),
        glass: readOption('glass', parsed?.glass),
        measure: readOption('measure', parsed?.measure),
        lineHeight: readOption('lineHeight', parsed?.lineHeight),
        radiusCustom: readRadiusCustom(parsed?.radiusCustom),
        font: readFont(parsed?.font ?? migrateFont(parsed)),
        type: readType(parsed?.type ?? migrateType(parsed)),
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

/* --- type: written into the shipped settings, never overridden ------------ */

/** Clean a font recipe that crossed a file boundary (theme pack import). */
export function sanitizeFont(raw) {
  return readFont(raw)
}

/** Clean a size recipe that crossed a file boundary (theme pack import). */
export function sanitizeType(raw) {
  return readType(raw)
}

/** Read the font recipe out of a 0.7-era pack that only had the two enums. */
export function migrateFontFields(raw) {
  return readFont(migrateFont(raw))
}

/** Read the size recipe out of a 0.7-era pack that only had the size enum. */
export function migrateTypeField(raw) {
  return readType(migrateType(raw))
}

let fontSync = null
let fontRestore = null

/** Bind the entry-owned writer that puts a type recipe into the app settings. */
export function bindFontSync(fn) {
  fontSync = fn
}

/** Bind the writer that puts the pre-fitout fonts back when the layer is off. */
export function bindFontRestore(fn) {
  fontRestore = fn
}

/** Fonts are the app's own setting, so a recipe is *written*, not layered.
 *
 * It is pushed when a theme is chosen and when a control moves — not on boot.
 * Writing on every launch would quietly win a tug of war against the app's own
 * Appearance page, because both would be editing the same six fields.
 */
function pushFonts(next) {
  if (fontSync === null || next.enabled !== true) return
  try {
    fontSync({ font: { ...next.font }, type: { ...next.type } })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[dsh-fitout] could not apply the type recipe', error)
  }
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
  // Switching the layer off is a promise to stop changing things: the type
  // recipe we wrote goes back to what the app had before it arrived.
  if (!next && fontRestore !== null) {
    try {
      fontRestore()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[dsh-fitout] could not restore the previous fonts', error)
    }
  }
}

/** Apply one preset wholesale. `preset` stays selectable only while untouched. */
export function applyPreset(preset) {
  const next = {
    ...state,
    preset: preset.id,
    accent: preset.accent,
    radius: preset.radius,
    density: preset.density,
    surface: preset.surface ?? DEFAULTS.surface,
    glass: preset.glass ?? DEFAULTS.glass,
    measure: preset.measure ?? DEFAULTS.measure,
    lineHeight: preset.lineHeight ?? DEFAULTS.lineHeight,
    radiusCustom: DEFAULTS.radiusCustom,
    background: { ...DEFAULTS.background },
    accentCustom: '',
    font: readFont(preset.font),
    type: readType(preset.type),
    shadow: preset.shadow ?? DEFAULTS.shadow,
    motion: preset.motion ?? DEFAULTS.motion,
    corner: preset.corner ?? DEFAULTS.corner,
    codeTone: preset.codeTone ?? DEFAULTS.codeTone,
    effects: { ...state.effects, ...preset.effects },
    layout: { disabled: [...preset.layout.disabled] },
  }
  commit(next)
  pushFonts(next)
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
    surface: state.surface,
    glass: state.glass,
    measure: state.measure,
    lineHeight: state.lineHeight,
    radiusCustom: state.radiusCustom,
    font: state.font,
    type: state.type,
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

/** Wallpaper: an image URL or data URL, plus visibility and blur. */
export function setBackground(patch) {
  const next = readBackground({ ...state.background, ...patch })
  if (next.image === state.background.image
    && next.opacity === state.background.opacity
    && next.blur === state.background.blur) return
  commit(custom({ ...state, background: next }))
}

/** Continuous corner radius, 0 = fall back to the three-step scale. */
export function setRadiusCustom(value) {
  const next = readRadiusCustom(value)
  if (next === state.radiusCustom) return
  commit(custom({ ...state, radiusCustom: next }))
}

/** One role's font-family list; '' hands that role back to the app default. */
export function setFontFamily(role, value) {
  if (!FONT_ROLES.includes(role)) return
  const next = normalizeFont(value)
  if (next === state.font[role]) return
  const font = { ...state.font, [role]: next }
  const record = custom({ ...state, font })
  commit(record)
  pushFonts(record)
}

/** One role's font size in px; clamped into the range the app accepts. */
export function setTypeSize(role, value) {
  if (!FONT_ROLES.includes(role)) return
  const next = readTypeSize(role, value)
  if (next === state.type[role]) return
  const type = { ...state.type, [role]: next }
  const record = custom({ ...state, type })
  commit(record)
  pushFonts(record)
}

/** An arbitrary accent hex; '' restores the preset hues. */
export function setAccentCustom(hex) {
  const next = readAccent(hex)
  if (next === state.accentCustom) return
  commit(custom({ ...state, accentCustom: next }))
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
  const next = {
    ...clone(DEFAULTS),
    enabled: state.enabled,
  }
  commit(next)
  pushFonts(next)
}

/** Reset everything, including the master switch. */
export function resetAll() {
  const next = clone(DEFAULTS)
  commit(next)
  pushFonts(next)
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
