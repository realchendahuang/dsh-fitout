/** The Fitout page — a theme shelf, not a settings form.
 *
 * The page leads with what a shop leads with: a row of finished looks. Every
 * card is a whole appearance (colour + corners + density + layout), so picking
 * one is a single decision. Everything that can be nudged by hand lives behind
 * 微调 (fine tuning), collapsed by default.
 */
import React from 'react'
import {
  ACCENTS, RADIUS_SCALES, applyPreset, getSettings, getThemePreference, resetAll,
  resetAppearance, setAccent, setAppearance, setAllLayoutGroups, setDensity, setEffect,
  setEnabled, setLayoutGroup, setList, setRadius, setOption, setThemePreference, subscribe,
  saveTheme, deleteTheme, setAccentCustom, setBackground,
} from './store.js'
import { OPTIONS } from './store.js'
import { PRESETS, matchesPreset } from './presets.js'
import { MARK_PRESETS, renderMark } from './brand.jsx'
import { SECTIONS } from './sections.js'
import { readPack, writePack } from './theme-pack.js'
import { SURFACES } from './surfaces.js'

const MAX_ICON_BYTES = 256 * 1024
const ALL_GROUPS = SECTIONS.map((section) => section.id)
const RADIUS_PX = { compact: '7px', default: '10px', round: '14px' }

function useSettings() {
  return React.useSyncExternalStore(subscribe, getSettings, getSettings)
}

function Switch({ on, label, onChange, size }) {
  return React.createElement('button', {
    type: 'button', className: 'fto-switch', 'data-on': on ? 'true' : 'false',
    'data-size': size ?? 'md', role: 'switch',
    'aria-checked': on ? 'true' : 'false', 'aria-label': label,
    onClick: () => onChange(!on),
  }, React.createElement('span', { className: 'fto-knob', 'aria-hidden': 'true' }))
}

function Feature({ title, children }) {
  return React.createElement('div', { className: 'fto-feature' },
    React.createElement('div', { className: 'fto-featureCopy' },
      React.createElement('div', { className: 'fto-featureTitle' }, title)),
    children)
}

function Group({ title, tools, children }) {
  return React.createElement('section', { className: 'fto-group' },
    React.createElement('div', { className: 'fto-groupHead' },
      React.createElement('h3', { className: 'fto-groupTitle' }, title),
      tools === undefined ? null : React.createElement('div', { className: 'fto-groupTools' }, tools)),
    children)
}

/** A segmented control driven by one OPTIONS entry. */
function OptionSeg({ t, settings, name }) {
  const values = OPTIONS[name]
  return React.createElement(Seg, {
    value: settings[name],
    choices: values.map((value) => ({ id: value, label: t('page.' + name + '_' + value) })),
    onChange: (value) => setOption(name, value),
  })
}

function Seg({ value, choices, onChange }) {
  return React.createElement('div', { className: 'fto-seg' },
    choices.map((choice) => React.createElement('button', {
      key: choice.id, type: 'button', className: 'fto-segBtn',
      'data-on': value === choice.id ? 'true' : 'false',
      onClick: () => onChange(choice.id),
    }, React.createElement('span', { className: 'fto-segLabel' }, choice.label))))
}

/** One theme card: a small mock of the surface it installs. */
/** Paint a card with the palette of the theme it sells, not the active one. */
function cardVars(preset) {
  const surface = SURFACES[preset.surface] ?? SURFACES.neutral
  const accent = ACCENTS.find((a) => a.id === preset.accent) ?? ACCENTS[0]
  const pick = (mode, token, fallback) => surface[mode][token] ?? fallback
  return {
    '--fto-card-bg': pick('light', '--dsw-alias-bg-base', '#fafafa'),
    '--fto-card-bg-dark': pick('dark', '--dsw-alias-bg-base', '#171717'),
    '--fto-card-side': pick('light', '--dsw-specific-sidebar-fill', '#f5f5f5'),
    '--fto-card-side-dark': pick('dark', '--dsw-specific-sidebar-fill', '#1a1a1a'),
    '--fto-card-ink': pick('light', '--dsw-alias-label-secondary', '#525252'),
    '--fto-card-ink-dark': pick('dark', '--dsw-alias-label-secondary', '#a3a3a3'),
    '--fto-card-accent': accent.light,
    '--fto-card-accent-dark': accent.dark,
  }
}

function ThemeCard({ preset, active, onDelete }) {
  return React.createElement('div', { className: 'fto-theme', 'data-on': active ? 'true' : 'false' },
    React.createElement('button', {
      type: 'button', className: 'fto-themePick',
      onClick: () => applyPreset(preset),
    },
    React.createElement('span', {
      className: 'fto-themeArt',
      style: { borderRadius: RADIUS_PX[preset.radius] ?? '10px', ...cardVars(preset) },
    },
    React.createElement('span', { className: 'fto-themeSide' }),
    React.createElement('span', { className: 'fto-themeSideDash', style: { top: '12px' } }),
    React.createElement('span', { className: 'fto-themeSideDash', style: { top: '22px' } }),
    React.createElement('span', { className: 'fto-themeSideDash', style: { top: '32px' } }),
    React.createElement('span', { className: 'fto-themeLine', style: { top: '16px', width: '42%' } }),
    React.createElement('span', { className: 'fto-themeLine', style: { top: '27px', width: '30%' } }),
    React.createElement('span', { className: 'fto-themeDot' })),
    React.createElement('span', { className: 'fto-themeName' }, preset.name)),
    onDelete === undefined ? null : React.createElement('button', {
      type: 'button', className: 'fto-themeDel', 'aria-label': '删除主题',
      onClick: onDelete,
    }, '\u00d7'))
}

/** The trailing card: save whatever is on screen as a named theme. */
function AddCard({ saving, draft, onDraft, onStart, onCancel, onSave }) {
  if (saving) {
    return React.createElement('div', { className: 'fto-theme fto-themeAdd' },
      React.createElement('input', {
        className: 'fto-addInput', autoFocus: true, value: draft, maxLength: 20,
        placeholder: '主题名',
        onChange: (event) => onDraft(event.target.value),
        onKeyDown: (event) => {
          if (event.key === 'Enter') onSave()
          else if (event.key === 'Escape') onCancel()
        },
        onBlur: onSave,
      }))
  }
  return React.createElement('button', {
    type: 'button', className: 'fto-theme fto-themeAdd', onClick: onStart,
  },
  React.createElement('span', { className: 'fto-themeArt fto-addArt' }, '+'),
  React.createElement('span', { className: 'fto-themeName' }, '保存当前'))
}

function CustomCard({ active }) {
  return React.createElement('div', {
    className: 'fto-theme', 'data-on': active ? 'true' : 'false', 'data-static': 'true', 'data-live': 'true',
  },
  React.createElement('span', { className: 'fto-themeArt', style: { borderRadius: '10px' } },
    React.createElement('span', { className: 'fto-themeSide' }),
    React.createElement('span', { className: 'fto-themeSideDash', style: { top: '12px' } }),
    React.createElement('span', { className: 'fto-themeSideDash', style: { top: '22px' } }),
    React.createElement('span', { className: 'fto-themeSideDash', style: { top: '32px' } }),
    React.createElement('span', { className: 'fto-themeLine', style: { top: '16px', width: '42%' } }),
    React.createElement('span', { className: 'fto-themeLine', style: { top: '27px', width: '30%' } }),
    React.createElement('span', { className: 'fto-themeDot' })),
  React.createElement('span', { className: 'fto-themeName' }, '自定义'))
}

function Slider({ value, min, max, suffix, onChange }) {
  return React.createElement('div', { className: 'fto-slider' },
    React.createElement('input', {
      type: 'range', min, max, value,
      onChange: (event) => onChange(Number(event.target.value)),
    }),
    React.createElement('span', { className: 'fto-sliderValue' }, String(value) + (suffix ?? '')))
}

const MAX_WALLPAPER_BYTES = 700 * 1024

/** Wallpaper: a local image or a URL, plus how much of it shows through. */
function BackgroundPicker({ t, settings }) {
  const bg = settings.background
  const fileRef = React.useRef(null)
  const [error, setError] = React.useState('')
  const has = bg.image !== ''

  const onFile = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file === undefined) return
    if (!file.type.startsWith('image/')) {
      setError(t('page.bgTooLarge'))
      return
    }
    if (file.size > MAX_WALLPAPER_BYTES) {
      setError(t('page.bgTooLarge'))
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : ''
      if (url !== '') setBackground({ image: url })
    }
    reader.readAsDataURL(file)
  }

  return React.createElement('div', { className: 'fto-bg' },
    React.createElement(Feature, { title: t('page.bgImage') },
      React.createElement('div', { className: 'fto-bgActions' },
        React.createElement('button', {
          type: 'button', className: 'fto-btn',
          onClick: () => fileRef.current?.click(),
        }, has ? t('page.bgReplace') : t('page.bgUpload')),
        has ? React.createElement('button', {
          type: 'button', className: 'fto-btn', onClick: () => setBackground({ image: '', blur: 0, opacity: 55 }),
        }, t('page.bgClear')) : null,
        React.createElement('input', {
          ref: fileRef, type: 'file', accept: 'image/*',
          style: { display: 'none' }, onChange: onFile,
        }))),
    React.createElement(Feature, { title: t('page.bgLink') },
      React.createElement('input', {
        className: 'fto-input', type: 'text', value: bg.image.startsWith('data:') ? '' : bg.image,
        placeholder: bg.image.startsWith('data:') ? t('page.bgLocal') : t('page.bgLinkPlaceholder'),
        onChange: (event) => setBackground({ image: event.target.value.trim() }),
      })),
    has ? React.createElement(Feature, { title: t('page.bgOpacity') },
      React.createElement(Slider, {
        value: bg.opacity, min: 0, max: 100, suffix: '%',
        onChange: (value) => setBackground({ opacity: value }),
      })) : null,
    has ? React.createElement(Feature, { title: t('page.bgBlur') },
      React.createElement(Slider, {
        value: bg.blur, min: 0, max: 40, suffix: 'px',
        onChange: (value) => setBackground({ blur: value }),
      })) : null,
    error === '' ? null : React.createElement('div', { className: 'fto-note' }, error))
}

/* --- brand ----------------------------------------------------------------- */

function IconPicker({ t, settings }) {
  const [error, setError] = React.useState('')
  const fileRef = React.useRef(null)

  const choose = (kind, value) => {
    setError('')
    setAppearance({ icon: { kind, value: value ?? '' } })
  }

  const onFile = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError(t('page.iconType'))
      return
    }
    if (file.size > MAX_ICON_BYTES) {
      setError(t('page.iconTooLarge'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : ''
      if (url === '') setError(t('page.iconType'))
      else choose('custom', url)
    }
    reader.onerror = () => setError(t('page.iconType'))
    reader.readAsDataURL(file)
  }

  const options = [
    { kind: 'official', label: t('page.iconOfficial'), node: null },
    ...MARK_PRESETS.map((preset) => ({ kind: preset.id, label: preset.label, node: preset.render(20, true) })),
  ]
  if (settings.icon.kind === 'custom' && settings.icon.value !== '') {
    options.push({ kind: 'custom', label: t('page.iconCustom'), node: renderMark(settings.icon, 20) })
  }

  return React.createElement('div', { className: 'fto-icons' },
    React.createElement('div', { className: 'fto-seg' }, options.map((option) =>
      React.createElement('button', {
        key: option.kind, type: 'button',
        className: 'fto-segBtn', 'data-on': settings.icon.kind === option.kind ? 'true' : 'false',
        onClick: () => choose(option.kind),
        title: option.label,
      },
      option.node === null ? React.createElement('span', { className: 'fto-officialDot', 'aria-hidden': 'true' }) : option.node))),
    React.createElement('div', { className: 'fto-uploadRow' },
      React.createElement('button', {
        type: 'button', className: 'fto-btn',
        onClick: () => fileRef.current?.click(),
      }, t('page.upload')),
      React.createElement('input', {
        ref: fileRef, type: 'file', accept: 'image/png,image/jpeg,image/svg+xml,image/webp',
        style: { display: 'none' }, onChange: onFile,
      }),
      error === '' ? null : React.createElement('span', { className: 'fto-error' }, error)))
}

function AppearancePicker({ t }) {
  const [preference, setLocal] = React.useState(() => getThemePreference())
  const choices = [
    { id: 'system', label: t('page.themeSystem') },
    { id: 'light', label: t('page.themeLight') },
    { id: 'dark', label: t('page.themeDark') },
  ]
  return React.createElement(Seg, {
    value: preference, choices,
    onChange: (id) => {
      setThemePreference(id)
      setLocal(id)
    },
  })
}

/* --- page ------------------------------------------------------------------ */

export function FitoutSettingsPage({ t, initialTuning = false }) {
  const settings = useSettings()
  const [tuning, setTuning] = React.useState(initialTuning)
  const translate = typeof t === 'function' ? t : (key) => key
  const saved = settings.themes ?? []
  const cards = [...PRESETS, ...saved]
  const [saving, setSaving] = React.useState(false)
  const [draft, setDraft] = React.useState('')
  const disabled = new Set(settings.layout.disabled)
  const isCustom = !cards.some((theme) => settings.preset === theme.id && matchesPreset(theme, settings))

  const commitSave = () => {
    saveTheme(draft)
    setSaving(false)
    setDraft('')
  }

  const [notice, setNotice] = React.useState('')
  const importRef = React.useRef(null)

  const onImport = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file === undefined) return
    file.text().then((text) => {
      let spec = null
      try {
        spec = readPack(JSON.parse(text))
      } catch {
        spec = null
      }
      if (spec === null) {
        setNotice(translate('page.importBad'))
        return
      }
      setAccent(spec.accent)
      setRadius(spec.radius)
      setDensity(spec.density)
      setAllLayoutGroups(true, ALL_GROUPS)
      for (const id of spec.layout) setLayoutGroup(id, false)
      for (const [key, value] of Object.entries(spec.options ?? {})) setOption(key, value)
      setAccentCustom(spec.accentCustom ?? '')
      saveTheme(spec.name)
      setNotice(translate('page.importDone').replace('{name}', spec.name))
    })
  }

  const onExport = () => {
    const active = cards.find((theme) => theme.id === settings.preset)
    const pack = writePack(settings, active === undefined ? '我的主题' : active.name)
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = pack.name + '.json'
    link.click()
    globalThis.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return React.createElement('div', { className: 'fto-page' },
    React.createElement('div', { className: 'fto-head' },
      React.createElement('h2', { className: 'fto-pageTitle' }, translate('page.title')),
      React.createElement(Switch, {
        on: settings.enabled, label: translate('page.enable'), onChange: setEnabled,
      })),

    React.createElement('div', { className: 'fto-themes' },
      cards.map((theme) => React.createElement(ThemeCard, {
        key: theme.id, preset: theme,
        active: settings.preset === theme.id && matchesPreset(theme, settings),
        onDelete: PRESETS.some((preset) => preset.id === theme.id)
          ? undefined
          : () => deleteTheme(theme.id),
      })),
      React.createElement(CustomCard, { active: isCustom }),
      React.createElement(AddCard, {
        saving, draft,
        onDraft: setDraft,
        onStart: () => { setDraft(''); setSaving(true) },
        onCancel: () => { setSaving(false); setDraft('') },
        onSave: commitSave,
      })),

    React.createElement('button', {
      type: 'button', className: 'fto-tuneBtn', 'data-open': tuning ? 'true' : 'false',
      onClick: () => setTuning(!tuning),
    },
    React.createElement('span', null, translate('page.tune')),
    React.createElement('span', { className: 'fto-tuneChevron', 'aria-hidden': 'true' })),

    tuning ? React.createElement('div', { className: 'fto-tune' },
      React.createElement(Group, { title: translate('page.shapeGroup') },
        React.createElement(Feature, { title: translate('page.surface') },
          React.createElement(OptionSeg, { t: translate, settings, name: 'surface' })),
        React.createElement(Feature, { title: translate('page.accent') },
          React.createElement('div', { className: 'fto-swatches' },
            ACCENTS.map((accent) => React.createElement('button', {
              key: accent.id, type: 'button', className: 'fto-swatch',
              'data-on': settings.accent === accent.id ? 'true' : 'false',
              'aria-label': accent.label, title: accent.label,
              style: { background: accent.light },
              onClick: () => setAccent(accent.id),
            })),
        React.createElement('input', {
          type: 'color', className: 'fto-colorInput',
          value: settings.accentCustom === ''
            ? (ACCENTS.find((a) => a.id === settings.accent) ?? ACCENTS[0]).light
            : settings.accentCustom,
          title: translate('page.accentCustom'),
          'aria-label': translate('page.accentCustom'),
          onChange: (event) => setAccentCustom(event.target.value),
        }))),
        React.createElement(Feature, { title: translate('page.radius') },
          React.createElement(Seg, {
            value: settings.radius,
            choices: Object.keys(RADIUS_SCALES).map((id) => ({ id, label: translate('page.radius_' + id) })),
            onChange: setRadius,
          })),
        React.createElement(Feature, { title: translate('page.density') },
          React.createElement(Seg, {
            value: settings.density,
            choices: [
              { id: 'default', label: translate('page.density_default') },
              { id: 'compact', label: translate('page.density_compact') },
            ],
            onChange: setDensity,
          })),
        React.createElement(Feature, { title: translate('page.appearance') },
          React.createElement(AppearancePicker, { t: translate }))),

      React.createElement(Group, { title: translate('page.textGroup') },
        React.createElement(Feature, { title: translate('page.fontSize') },
          React.createElement(OptionSeg, { t: translate, settings, name: 'fontSize' })),
        React.createElement(Feature, { title: translate('page.fontFamily') },
          React.createElement(OptionSeg, { t: translate, settings, name: 'fontFamily' })),
        React.createElement(Feature, { title: translate('page.shadow') },
          React.createElement(OptionSeg, { t: translate, settings, name: 'shadow' })),
        React.createElement(Feature, { title: translate('page.motion') },
          React.createElement(OptionSeg, { t: translate, settings, name: 'motion' })),
        React.createElement(Feature, { title: translate('page.corner') },
          React.createElement(OptionSeg, { t: translate, settings, name: 'corner' })),
        React.createElement(Feature, { title: translate('page.codeTone') },
          React.createElement(OptionSeg, { t: translate, settings, name: 'codeTone' }))),

      React.createElement(Group, { title: translate('page.bgGroup') },
        React.createElement(BackgroundPicker, { t: translate, settings })),

      React.createElement(Group, {
        title: translate('page.layoutGroup'),
        tools: React.createElement(React.Fragment, null,
          React.createElement('button', {
            type: 'button', className: 'fto-linkBtn',
            onClick: () => setAllLayoutGroups(true, ALL_GROUPS),
            disabled: disabled.size === 0,
          }, translate('page.layoutAllOn')),
          React.createElement('button', {
            type: 'button', className: 'fto-linkBtn',
            onClick: () => setAllLayoutGroups(false, ALL_GROUPS),
            disabled: disabled.size === ALL_GROUPS.length,
          }, translate('page.layoutAllOff'))),
      },
      React.createElement('div', { className: 'fto-cells' },
        SECTIONS.map((section) => React.createElement('div', { key: section.id, className: 'fto-cell' },
          React.createElement(Switch, {
            size: 'sm', label: section.title,
            on: !disabled.has(section.id),
            onChange: (next) => setLayoutGroup(section.id, next),
          }),
          React.createElement('span', null, section.title))))),

      React.createElement(Group, { title: translate('page.listGroup') },
        React.createElement(Feature, { title: translate('page.list') },
          React.createElement(Seg, {
            value: settings.list,
            choices: [
              { id: 'zcode', label: translate('page.listZcode') },
              { id: 'native', label: translate('page.listNative') },
            ],
            onChange: setList,
          })),
        React.createElement(Feature, { title: translate('page.chip') },
          React.createElement(Switch, {
            size: 'sm', label: translate('page.chip'),
            on: settings.effects.chip,
            onChange: (next) => setEffect('chip', next),
          })),
        React.createElement(Feature, { title: translate('page.underline') },
          React.createElement(Switch, {
            size: 'sm', label: translate('page.underline'),
            on: settings.effects.underline,
            onChange: (next) => setEffect('underline', next),
          }))),

      React.createElement(Group, { title: translate('page.brandGroup') },
        React.createElement(Feature, { title: translate('page.name') },
          React.createElement('input', {
            className: 'fto-input', type: 'text', value: settings.name, maxLength: 32,
            placeholder: translate('page.namePlaceholder'),
            onChange: (event) => setAppearance({ name: event.target.value }),
          })),
        React.createElement(Feature, { title: translate('page.icon') },
          React.createElement(IconPicker, { t: translate, settings }))),

      React.createElement(Group, { title: translate('page.maintainGroup') },
        React.createElement('div', { className: 'fto-btnRow' },
          React.createElement('button', {
            type: 'button', className: 'fto-btn', onClick: () => importRef.current?.click(),
          }, translate('page.import')),
          React.createElement('button', {
            type: 'button', className: 'fto-btn', onClick: onExport,
          }, translate('page.export')),
          React.createElement('span', { className: 'fto-btnGap' }),
          React.createElement('button', {
            type: 'button', className: 'fto-btn', onClick: resetAppearance,
          }, translate('page.reset')),
          React.createElement('button', {
            type: 'button', className: 'fto-btn', 'data-tone': 'danger', onClick: resetAll,
          }, translate('page.resetAll')),
          React.createElement('input', {
            ref: importRef, type: 'file', accept: 'application/json,.json',
            style: { display: 'none' }, onChange: onImport,
          })),
        notice === '' ? null : React.createElement('div', { className: 'fto-note' }, notice))) : null)
}
