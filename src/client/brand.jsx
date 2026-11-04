/** Brand-slot occupants: an optional custom mark and wordmark.
 *
 * Both slots are declared by ui-sidebar and occupied by ui-brand-official at the
 * default priority. This plugin only takes them over while the user has actually
 * configured something (a name and/or a non-default icon); with the defaults the
 * shipped DeepSeek brand stays untouched, because the registration itself is
 * added and removed on demand (see entry.jsx).
 *
 * Every preset here is original artwork; the uploaded icon is rendered through
 * an <img>, so an SVG payload cannot script the page.
 */
import React from 'react'
import { getSettings, subscribe } from './store.js'

/** Re-render on any settings change; the snapshot is the whole record. */
export function useSkinSettings() {
  return React.useSyncExternalStore(subscribe, getSettings, getSettings)
}

const GRADIENT = 'linear-gradient(135deg, var(--dsw-alias-link, #0284c7) 0%, var(--dsw-alias-state-business-primary, #0ea5e9) 58%, #7dd3fc 100%)'

/** `plain` renders the glyph alone — used inside the icon picker, where four
 *  identical gradient tiles would be indistinguishable at 20px. */
function Frame({ size, children, plain }) {
  const px = typeof size === 'number' && size > 0 ? size : 24
  const fill = plain === true
    ? { background: 'transparent', color: 'var(--dsw-alias-label-secondary, #5b6070)' }
    : { background: GRADIENT, color: '#fff' }
  return React.createElement(
    'span',
    {
      style: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
        width: px + 'px', height: px + 'px', borderRadius: '7px', ...fill,
      },
      'aria-hidden': 'true',
    },
    children,
  )
}

/** Original mark presets. `id` is persisted; `label` is copy for the picker. */
export const MARK_PRESETS = [
  {
    id: 'chevron',
    label: '折线',
    render: (size, plain) => React.createElement(Frame, { size, plain }, React.createElement('svg', {
      width: Math.round(size * 0.6), height: Math.round(size * 0.6), viewBox: '0 0 14 14', fill: 'none',
    }, React.createElement('path', { d: 'M2.6 3.1h8.8L6.1 7.6h5.3L2.6 11.2l4.1-4.1H2.6z', fill: 'currentColor' }))),
  },
  {
    id: 'spark',
    label: '火花',
    render: (size, plain) => React.createElement(Frame, { size, plain }, React.createElement('svg', {
      width: Math.round(size * 0.62), height: Math.round(size * 0.62), viewBox: '0 0 14 14', fill: 'none',
    }, React.createElement('path', {
      d: 'M7 1.4c.28 2.7 1.9 4.32 4.6 4.6v.02c-2.7.28-4.32 1.9-4.6 4.6h-.02c-.28-2.7-1.9-4.32-4.6-4.6v-.02C5.08 5.72 6.7 4.1 6.98 1.4z',
      fill: 'currentColor',
    }))),
  },
  {
    id: 'orbit',
    label: '轨道',
    render: (size, plain) => React.createElement(Frame, { size, plain }, React.createElement('svg', {
      width: Math.round(size * 0.64), height: Math.round(size * 0.64), viewBox: '0 0 14 14', fill: 'none',
    },
    React.createElement('circle', { cx: 7, cy: 7, r: 4.4, stroke: 'currentColor', strokeWidth: 1.5 }),
    React.createElement('circle', { cx: 11.1, cy: 4.1, r: 1.5, fill: 'currentColor' }))),
  },
  {
    id: 'grid',
    label: '网格',
    render: (size, plain) => React.createElement(Frame, { size, plain }, React.createElement('svg', {
      width: Math.round(size * 0.58), height: Math.round(size * 0.58), viewBox: '0 0 14 14', fill: 'currentColor',
    },
    React.createElement('rect', { x: 2.2, y: 2.2, width: 4, height: 4, rx: 1.2 }),
    React.createElement('rect', { x: 7.8, y: 2.2, width: 4, height: 4, rx: 1.2, opacity: 0.65 }),
    React.createElement('rect', { x: 2.2, y: 7.8, width: 4, height: 4, rx: 1.2, opacity: 0.65 }),
    React.createElement('rect', { x: 7.8, y: 7.8, width: 4, height: 4, rx: 1.2 }))),
  },
]

/** Render one configured icon at a pixel size (shared by the slot and the preview). */
export function renderMark(icon, size) {
  const px = typeof size === 'number' && size > 0 ? size : 24
  if (icon.kind === 'custom' && icon.value !== '') {
    return React.createElement('img', {
      src: icon.value, alt: '', width: px, height: px,
      style: { width: px + 'px', height: px + 'px', borderRadius: '7px', objectFit: 'cover', display: 'block' },
      'aria-hidden': 'true',
    })
  }
  const preset = MARK_PRESETS.find((candidate) => candidate.id === icon.kind)
  return preset === undefined ? null : preset.render(px)
}

/** The sidebar mark. Returns null while the shipped mark is meant to show. */
export function FitoutMark({ size }) {
  const settings = useSkinSettings()
  if (settings.icon.kind === 'official') return null
  return renderMark(settings.icon, size)
}

/** The sidebar wordmark: the configured name, or null for the shipped wordmark. */
export function FitoutBrandName() {
  const settings = useSkinSettings()
  const name = settings.name.trim()
  if (name === '') return null
  return React.createElement(
    'span',
    {
      style: {
        fontFamily: 'var(--dsw-font-family-brand, var(--dsw-font-family))',
        fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: '20px',
        color: 'var(--dsw-alias-label-primary, #0a0a0a)', whiteSpace: 'nowrap',
      },
      'aria-hidden': 'true',
    },
    name,
  )
}
