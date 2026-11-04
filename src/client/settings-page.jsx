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
  setEnabled, setLayoutGroup, setList, setRadius, setThemePreference, subscribe,
} from './store.js'
import { PRESETS, matchesPreset } from './presets.js'
import { MARK_PRESETS, renderMark } from './brand.jsx'
import { SECTIONS } from './sections.js'

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

function Seg({ value, choices, onChange }) {
  return React.createElement('div', { className: 'fto-seg' },
    choices.map((choice) => React.createElement('button', {
      key: choice.id, type: 'button', className: 'fto-segBtn',
      'data-on': value === choice.id ? 'true' : 'false',
      onClick: () => onChange(choice.id),
    }, React.createElement('span', { className: 'fto-segLabel' }, choice.label))))
}

/** One theme card: a small mock of the surface it installs. */
function ThemeCard({ preset, active }) {
  const accent = (ACCENTS.find((a) => a.id === preset.accent) ?? ACCENTS[0]).light
  return React.createElement('button', {
    type: 'button', className: 'fto-theme', 'data-on': active ? 'true' : 'false',
    onClick: () => applyPreset(preset),
  },
  React.createElement('span', {
    className: 'fto-themeArt',
    style: { borderRadius: RADIUS_PX[preset.radius] ?? '10px' },
  }, React.createElement('span', { className: 'fto-themeDot', style: { background: accent } })),
  React.createElement('span', { className: 'fto-themeName' }, preset.name))
}

function CustomCard({ active }) {
  return React.createElement('div', {
    className: 'fto-theme', 'data-on': active ? 'true' : 'false', 'data-static': 'true',
  },
  React.createElement('span', { className: 'fto-themeArt', style: { borderRadius: '10px' } },
    React.createElement('span', { className: 'fto-themeDot', style: { background: 'var(--dsw-alias-label-tertiary)' } })),
  React.createElement('span', { className: 'fto-themeName' }, '自定义'))
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
    ...MARK_PRESETS.map((preset) => ({ kind: preset.id, label: preset.label, node: preset.render(20) })),
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

export function FitoutSettingsPage({ t }) {
  const settings = useSettings()
  const [tuning, setTuning] = React.useState(false)
  const translate = typeof t === 'function' ? t : (key) => key
  const disabled = new Set(settings.layout.disabled)
  const isCustom = !PRESETS.some((preset) => settings.preset === preset.id && matchesPreset(preset, settings))

  return React.createElement('div', { className: 'fto-page' },
    React.createElement('div', { className: 'fto-head' },
      React.createElement('h2', { className: 'fto-pageTitle' }, translate('page.title')),
      React.createElement(Switch, {
        on: settings.enabled, label: translate('page.enable'), onChange: setEnabled,
      })),

    React.createElement('div', { className: 'fto-themes' },
      PRESETS.map((preset) => React.createElement(ThemeCard, {
        key: preset.id, preset,
        active: settings.preset === preset.id && matchesPreset(preset, settings),
      })),
      React.createElement(CustomCard, { active: isCustom })),

    React.createElement('button', {
      type: 'button', className: 'fto-tuneBtn', 'data-open': tuning ? 'true' : 'false',
      onClick: () => setTuning(!tuning),
    },
    React.createElement('span', null, translate('page.tune')),
    React.createElement('span', { className: 'fto-tuneChevron', 'aria-hidden': 'true' })),

    tuning ? React.createElement('div', { className: 'fto-tune' },
      React.createElement(Group, { title: translate('page.shapeGroup') },
        React.createElement(Feature, { title: translate('page.accent') },
          React.createElement('div', { className: 'fto-swatches' },
            ACCENTS.map((accent) => React.createElement('button', {
              key: accent.id, type: 'button', className: 'fto-swatch',
              'data-on': settings.accent === accent.id ? 'true' : 'false',
              'aria-label': accent.label, title: accent.label,
              style: { background: accent.light },
              onClick: () => setAccent(accent.id),
            })))),
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
            type: 'button', className: 'fto-btn', onClick: resetAppearance,
          }, translate('page.reset')),
          React.createElement('button', {
            type: 'button', className: 'fto-btn', 'data-tone': 'danger', onClick: resetAll,
          }, translate('page.resetAll'))))) : null)
}
