/** The Fitout page in Settings — 精装 on top, 高定 underneath.
 *
 * The order is the product: a reader sees one decision first (pick a preset),
 * and the twenty-odd switches only when they go looking for them.
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

function Row({ title, description, children }) {
  return React.createElement('div', { className: 'fto-row' },
    React.createElement('div', { className: 'fto-copy' },
      React.createElement('div', { className: 'fto-title' }, title),
      description === undefined ? null : React.createElement('div', { className: 'fto-desc' }, description)),
    children)
}

function Feature({ title, description, children }) {
  return React.createElement('div', { className: 'fto-feature' },
    React.createElement('div', { className: 'fto-featureCopy' },
      React.createElement('div', { className: 'fto-featureTitle' }, title),
      description === undefined ? null : React.createElement('div', { className: 'fto-featureDesc' }, description)),
    children)
}

function Group({ title, note, tools, children }) {
  return React.createElement('section', { className: 'fto-group' },
    React.createElement('div', { className: 'fto-groupHead' },
      React.createElement('h3', { className: 'fto-groupTitle' }, title),
      tools === undefined ? null : React.createElement('div', { className: 'fto-groupTools' }, tools)),
    children,
    note === undefined ? null : React.createElement('p', { className: 'fto-groupNote' }, note))
}

function Seg({ value, choices, onChange, align }) {
  return React.createElement('div', { className: 'fto-seg', 'data-align': align ?? 'end' },
    choices.map((choice) => React.createElement('button', {
      key: choice.id, type: 'button', className: 'fto-segBtn',
      'data-on': value === choice.id ? 'true' : 'false',
      onClick: () => onChange(choice.id),
    }, React.createElement('span', { className: 'fto-segLabel' }, choice.label))))
}

/** One preset card: the single decision the page leads with. */
function PresetCard({ preset, active, t }) {
  return React.createElement('button', {
    type: 'button', className: 'fto-preset', 'data-on': active ? 'true' : 'false',
    onClick: () => applyPreset(preset),
  },
  React.createElement('div', { className: 'fto-presetHead' },
    React.createElement('span', {
      className: 'fto-presetDot', 'aria-hidden': 'true',
      style: { background: (ACCENTS.find((a) => a.id === preset.accent) ?? ACCENTS[0]).light },
    }),
    React.createElement('span', { className: 'fto-presetName' }, preset.name),
    React.createElement('span', { className: 'fto-presetBadge' },
      active ? t('page.presetActive') : t('page.presetApply'))),
  React.createElement('div', { className: 'fto-presetDesc' }, preset.desc))
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
    ...MARK_PRESETS.map((preset) => ({ kind: preset.id, label: preset.label, node: preset.render(22) })),
  ]
  if (settings.icon.kind === 'custom' && settings.icon.value !== '') {
    options.push({ kind: 'custom', label: t('page.iconCustom'), node: renderMark(settings.icon, 22) })
  }

  return React.createElement('div', { className: 'fto-icons' },
    React.createElement('div', { className: 'fto-seg' }, options.map((option) =>
      React.createElement('button', {
        key: option.kind, type: 'button',
        className: 'fto-segBtn', 'data-on': settings.icon.kind === option.kind ? 'true' : 'false',
        onClick: () => choose(option.kind),
        title: option.label,
      },
      option.node === null ? React.createElement('span', { className: 'fto-officialDot', 'aria-hidden': 'true' }) : option.node,
      React.createElement('span', { className: 'fto-segLabel' }, option.label)))),
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
    value: preference, choices, align: 'end',
    onChange: (id) => {
      setThemePreference(id)
      setLocal(id)
    },
  })
}

/* --- page ------------------------------------------------------------------ */

export function FitoutSettingsPage({ t }) {
  const settings = useSettings()
  const translate = typeof t === 'function' ? t : (key) => key
  const previewName = settings.name.trim() === '' ? translate('page.previewOfficial') : settings.name
  const disabled = new Set(settings.layout.disabled)
  const total = ALL_GROUPS.length

  return React.createElement('div', { className: 'fto-page' },
    React.createElement('div', { className: 'fto-pageHead' },
      React.createElement('h2', { className: 'fto-pageTitle' }, translate('page.title')),
      React.createElement('p', { className: 'fto-pageDesc' }, translate('page.description'))),

    React.createElement(Row, {
      title: translate('page.enable'),
      description: translate('page.enableDesc'),
    }, React.createElement(Switch, {
      on: settings.enabled, label: translate('page.enable'), onChange: setEnabled,
    })),

    /* --- 精装 ------------------------------------------------------------- */
    React.createElement(Group, {
      title: translate('page.presetGroup'),
      note: translate('page.presetNote'),
    }, React.createElement('div', { className: 'fto-presets' },
      PRESETS.map((preset) => React.createElement(PresetCard, {
        key: preset.id, preset, t: translate,
        active: settings.preset === preset.id && matchesPreset(preset, settings),
      })))),

    /* --- 高定 ------------------------------------------------------------- */
    React.createElement(Group, { title: translate('page.customGroup'), note: translate('page.customNote') },
      React.createElement(Feature, {
        title: translate('page.accent'), description: translate('page.accentDesc'),
      }, React.createElement('div', { className: 'fto-swatches' },
        ACCENTS.map((accent) => React.createElement('button', {
          key: accent.id, type: 'button', className: 'fto-swatch',
          'data-on': settings.accent === accent.id ? 'true' : 'false',
          'aria-label': accent.label, title: accent.label,
          style: { background: accent.light },
          onClick: () => setAccent(accent.id),
        })))),
      React.createElement(Feature, {
        title: translate('page.radius'), description: translate('page.radiusDesc'),
      }, React.createElement(Seg, {
        value: settings.radius,
        choices: Object.keys(RADIUS_SCALES).map((id) => ({ id, label: translate('page.radius_' + id) })),
        onChange: setRadius,
      })),
      React.createElement(Feature, {
        title: translate('page.density'), description: translate('page.densityDesc'),
      }, React.createElement(Seg, {
        value: settings.density,
        choices: [
          { id: 'default', label: translate('page.density_default') },
          { id: 'compact', label: translate('page.density_compact') },
        ],
        onChange: setDensity,
      })),
      React.createElement(Feature, {
        title: translate('page.appearance'), description: translate('page.appearanceDesc'),
      }, React.createElement(AppearancePicker, { t: translate })),
      React.createElement(Feature, {
        title: translate('page.list'), description: translate('page.listDesc'),
      }, React.createElement(Seg, {
        value: settings.list,
        choices: [
          { id: 'zcode', label: translate('page.listZcode') },
          { id: 'native', label: translate('page.listNative') },
        ],
        onChange: setList,
      })),
      React.createElement(Feature, {
        title: translate('page.chip'), description: translate('page.chipDesc'),
      }, React.createElement(Switch, {
        size: 'sm', label: translate('page.chip'),
        on: settings.effects.chip,
        onChange: (next) => setEffect('chip', next),
      }))),

    /* --- 版式 ------------------------------------------------------------- */
    React.createElement(Group, {
      title: translate('page.layoutGroup'),
      note: translate('page.layoutNote'),
      tools: React.createElement(React.Fragment, null,
        React.createElement('button', {
          type: 'button', className: 'fto-linkBtn',
          onClick: () => setAllLayoutGroups(true, ALL_GROUPS),
          disabled: disabled.size === 0,
        }, translate('page.layoutAllOn')),
        React.createElement('button', {
          type: 'button', className: 'fto-linkBtn',
          onClick: () => setAllLayoutGroups(false, ALL_GROUPS),
          disabled: disabled.size === total,
        }, translate('page.layoutAllOff'))),
    },
    SECTIONS.map((section) => React.createElement(Feature, {
      key: section.id, title: section.title, description: section.desc,
    }, React.createElement(Switch, {
      size: 'sm', label: section.title,
      on: !disabled.has(section.id),
      onChange: (next) => setLayoutGroup(section.id, next),
    }))),
    React.createElement(Feature, {
      title: translate('page.underline'), description: translate('page.underlineDesc'),
    }, React.createElement(Switch, {
      size: 'sm', label: translate('page.underline'),
      on: settings.effects.underline,
      onChange: (next) => setEffect('underline', next),
    })),
    React.createElement(Feature, {
      title: translate('page.autoOlder'), description: translate('page.autoOlderDesc'),
    }, React.createElement('span', { className: 'fto-static', 'data-tone': 'on' },
      React.createElement('span', { className: 'fto-staticDot', 'aria-hidden': 'true' }),
      translate('page.autoOlderOn')))),

    /* --- 品牌 ------------------------------------------------------------- */
    React.createElement(Group, { title: translate('page.brandGroup') },
      React.createElement(Row, {
        title: translate('page.name'), description: translate('page.nameDesc'),
      }, React.createElement('input', {
        className: 'fto-input', type: 'text', value: settings.name, maxLength: 32,
        placeholder: translate('page.namePlaceholder'),
        onChange: (event) => setAppearance({ name: event.target.value }),
      })),
      React.createElement(Row, {
        title: translate('page.icon'), description: translate('page.iconDesc'),
      }, React.createElement(IconPicker, { t: translate, settings })),
      React.createElement('div', { className: 'fto-previewRow' },
        React.createElement('div', { className: 'fto-previewLabel' }, translate('page.preview')),
        React.createElement('div', { className: 'fto-preview' },
          renderMark(settings.icon, 24),
          settings.icon.kind === 'official'
            ? React.createElement('span', { className: 'fto-previewFallback', 'aria-hidden': 'true' })
            : null,
          React.createElement('span', { className: 'fto-previewName' }, previewName)))),

    /* --- 维护 ------------------------------------------------------------- */
    React.createElement(Group, { title: translate('page.maintainGroup') },
      React.createElement('div', { className: 'fto-btnRow' },
        React.createElement('button', {
          type: 'button', className: 'fto-btn', onClick: resetAppearance,
        }, translate('page.reset')),
        React.createElement('button', {
          type: 'button', className: 'fto-btn', 'data-tone': 'danger', onClick: resetAll,
        }, translate('page.resetAll'))),
      React.createElement('div', { className: 'fto-note' }, translate('page.storageNote'))))
}
