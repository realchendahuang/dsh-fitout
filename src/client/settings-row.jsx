/** The General-settings row that toggles the skin (name/icon live on the
 * plugin's own Settings page). Mirrors the shipped row anatomy. */
import React from 'react'
import { getSettings, setEnabled, subscribe } from './store.js'

export function FitoutSettingsRow({ t }) {
  const settings = React.useSyncExternalStore(subscribe, getSettings, getSettings)
  const translate = typeof t === 'function' ? t : (key) => key
  return React.createElement(
    'div',
    { className: 'fto-row' },
    React.createElement(
      'div',
      { className: 'fto-copy' },
      React.createElement('div', { className: 'fto-title' }, translate('title')),
      React.createElement('div', { className: 'fto-desc' }, translate('description')),
    ),
    React.createElement(
      'button',
      {
        type: 'button',
        className: 'fto-switch',
        'data-on': settings.enabled ? 'true' : 'false',
        role: 'switch',
        'aria-checked': settings.enabled ? 'true' : 'false',
        'aria-label': translate('title'),
        onClick: () => setEnabled(!settings.enabled),
      },
      React.createElement('span', { className: 'fto-knob', 'aria-hidden': 'true' }),
    ),
  )
}
