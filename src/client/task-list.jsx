/** ZCode-style task list for the sidebar's `sidebar.workspaces` seat.
 *
 * Registered at priority -1 only while the user keeps the "ZCode 任务列表" mode,
 * so the shipped WorkspaceBrowser is shadowed rather than modified. The data is
 * the same Host state the shipped browser reads:
 *   - `useWorkspaces` (WorkspaceSnapshot: items / pinnedSessionIds / archivedSessionIds)
 *   - `useSessions`   (SessionListState: ids / byId[summary])
 * and the actions come from the same client services (ctx.uiWorkspace,
 * ctx.contextMenus) — no cordis access from the component itself.
 *
 * Deliberately out of scope (the shipped browser owns them): drag reordering,
 * the in-workspace directory picker, the archived-only view, and the
 * section-header shortcut hints. Right-click still opens the shipped Session /
 * Workspace context menus, so rename / fork / pin / archive stay reachable.
 */
import React from 'react'

const GROUP_STORAGE_KEY = 'dsh-fitout:collapsed-groups'

function readCollapsed() {
  try {
    const raw = globalThis.localStorage?.getItem(GROUP_STORAGE_KEY)
    if (raw === null || raw === undefined) return new Set()
    const parsed = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed.map(String) : [])
  } catch {
    return new Set()
  }
}

function writeCollapsed(set) {
  try {
    globalThis.localStorage?.setItem(GROUP_STORAGE_KEY, JSON.stringify([...set]))
  } catch {
    /* session-only */
  }
}

/** Relative time in the ZCode row language (刚刚 / 5分钟 / 3小时 / 2天 / 日期). */
export function relativeTime(ms, now, t) {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms <= 0) return ''
  const delta = Math.max(0, now - ms)
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (delta < minute) return t('time.now')
  if (delta < hour) return String(Math.floor(delta / minute)) + t('time.minute')
  if (delta < day) return String(Math.floor(delta / hour)) + t('time.hour')
  if (delta < 30 * day) return String(Math.floor(delta / day)) + t('time.day')
  const date = new Date(ms)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const dayOfMonth = String(date.getDate()).padStart(2, '0')
  return month + '-' + dayOfMonth
}

function HashIcon() {
  return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none', 'aria-hidden': 'true' },
    React.createElement('path', { d: 'M5.4 2 4.6 12M9.4 2 8.6 12M2.2 5h9.6M1.8 9h9.6', stroke: 'currentColor', 'stroke-width': 1.2, 'stroke-linecap': 'round' }))
}

function PlusIcon() {
  return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none', 'aria-hidden': 'true' },
    React.createElement('path', { d: 'M7 2.5v9M2.5 7h9', stroke: 'currentColor', 'stroke-width': 1.4, 'stroke-linecap': 'round' }))
}

function SearchIcon() {
  return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none', 'aria-hidden': 'true' },
    React.createElement('circle', { cx: 6.2, cy: 6.2, r: 3.9, stroke: 'currentColor', 'stroke-width': 1.2 }),
    React.createElement('path', { d: 'm9.2 9.2 2.6 2.6', stroke: 'currentColor', 'stroke-width': 1.2, 'stroke-linecap': 'round' }))
}

function MoreIcon() {
  return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 14 14', fill: 'currentColor', 'aria-hidden': 'true' },
    React.createElement('circle', { cx: 3, cy: 7, r: 1.1 }),
    React.createElement('circle', { cx: 7, cy: 7, r: 1.1 }),
    React.createElement('circle', { cx: 11, cy: 7, r: 1.1 }))
}

function CollapseIcon({ collapsed }) {
  return React.createElement('svg', {
    width: 12, height: 12, viewBox: '0 0 12 12', fill: 'none', 'aria-hidden': 'true',
    style: { transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform .12s ease' },
  }, React.createElement('path', { d: 'M2.5 4.5 6 8l3.5-3.5', stroke: 'currentColor', 'stroke-width': 1.3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }))
}

/** One session row: status dot, title, relative time, hover menu button. */
function SessionRow({ summary, label, time, active, onOpen, onMenu }) {
  return React.createElement('div', {
    className: 'fto-list-row', 'data-active': active ? 'true' : 'false', role: 'treeitem',
    'aria-selected': active ? 'true' : 'false',
    onClick: onOpen,
    onContextMenu: (event) => {
      event.preventDefault()
      onMenu({ x: event.clientX, y: event.clientY })
    },
  },
  React.createElement('span', { className: 'fto-list-state', 'data-running': summary.running ? 'true' : 'false', 'aria-hidden': 'true' }),
  React.createElement('span', { className: 'fto-list-title' }, label),
  React.createElement('span', { className: 'fto-list-time' }, time),
  React.createElement('button', {
    type: 'button', className: 'fto-list-more', 'aria-label': label,
    onClick: (event) => {
      event.stopPropagation()
      const rect = event.currentTarget.getBoundingClientRect()
      onMenu({ x: rect.left, y: rect.bottom + 2 })
    },
  }, React.createElement(MoreIcon)))
}

/** The replacement browser. Props: owner (wide, expandSidebar), injected actions/hooks, t. */
export function FitoutTaskList(props) {
  const { t, useWorkspaces, useSessions, openSession, startSession, archiveSession, forkSession, copyText } = props
  const items = useWorkspaces((state) => state.items)
  const pinnedSessionIds = useWorkspaces((state) => state.pinnedSessionIds)
  const archivedSessionIds = useWorkspaces((state) => state.archivedSessionIds)
  const list = useSessions((state) => state)
  const [mode, setMode] = React.useState('group')
  const [query, setQuery] = React.useState('')
  const [collapsed, setCollapsed] = React.useState(readCollapsed)
  const [now, setNow] = React.useState(() => Date.now())
  const [menu, setMenu] = React.useState(null)

  React.useEffect(() => {
    const timer = globalThis.setInterval(() => setNow(Date.now()), 60_000)
    return () => globalThis.clearInterval(timer)
  }, [])

  const pinned = React.useMemo(() => new Set(pinnedSessionIds ?? []), [pinnedSessionIds])
  const archived = React.useMemo(() => new Set(archivedSessionIds ?? []), [archivedSessionIds])
  const byId = list?.byId ?? {}
  const needle = query.trim().toLowerCase()

  const visible = React.useCallback((summary) => {
    if (summary === undefined || summary === null) return false
    if (archived.has(summary.id)) return false
    if (needle === '') return true
    return String(summary.title ?? '').toLowerCase().includes(needle)
  }, [archived, needle])

  const labelOf = (summary) => {
    if (summary.blank === true || summary.title === undefined || summary.title.trim() === '') return t('list.untitled')
    return summary.title
  }

  const sortMembers = (members) => members.slice().sort((a, b) => {
    const pa = pinned.has(a.id) ? 0 : 1
    const pb = pinned.has(b.id) ? 0 : 1
    if (pa !== pb) return pa - pb
    return (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
  })

  const groups = React.useMemo(() => {
    if (mode === 'recent') {
      const members = sortMembers(Object.values(byId).filter(visible))
      return [{ id: '__recent__', title: t('list.recent'), path: '', members, synthetic: true }]
    }
    const out = []
    const accounted = new Set()
    for (const workspace of items ?? []) {
      const members = sortMembers((workspace.sessionIds ?? [])
        .map((id) => byId[id])
        .filter((summary) => summary !== undefined && visible(summary)))
      for (const summary of members) accounted.add(summary.id)
      if (needle !== '' && members.length === 0) continue
      out.push({ id: workspace.workspaceId, title: workspace.title, path: workspace.path, members })
    }
    // Sessions that belong to no workspace trail at the end, like the shipped ungrouped bucket.
    const loose = sortMembers(Object.values(byId).filter((summary) => !accounted.has(summary.id) && visible(summary)))
    if (loose.length > 0) out.push({ id: '__loose__', title: t('list.ungrouped'), path: '', members: loose, synthetic: true })
    return out
  }, [mode, byId, items, visible, pinned, t])

  const total = groups.reduce((sum, group) => sum + group.members.length, 0)

  const toggleGroup = (id) => {
    setCollapsed((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      writeCollapsed(next)
      return next
    })
  }

  const header = React.createElement('div', { className: 'fto-list-head' },
    React.createElement('div', { className: 'fto-list-headLine' },
      React.createElement('span', { className: 'fto-list-headTitle' }, t('list.title')),
      React.createElement('span', { className: 'fto-list-count' }, String(total)),
      React.createElement('span', { className: 'fto-list-headGap' }),
      React.createElement('button', {
        type: 'button', className: 'fto-list-iconBtn', 'data-on': query !== '' ? 'true' : 'false',
        'aria-label': t('list.search'), title: t('list.search'),
        onClick: () => setQuery(query === '' ? '__focus__' : ''),
      }, React.createElement(SearchIcon))),
    query === '' ? null : React.createElement('input', {
      className: 'fto-list-search', type: 'text', autoFocus: true, value: query === '__focus__' ? '' : query,
      placeholder: t('list.searchPlaceholder'),
      onChange: (event) => setQuery(event.target.value),
      onKeyDown: (event) => {
        if (event.key === 'Escape') setQuery('')
      },
    }),
    React.createElement('div', { className: 'fto-list-seg' },
      React.createElement('button', {
        type: 'button', className: 'fto-list-segBtn', 'data-on': mode === 'group' ? 'true' : 'false',
        onClick: () => setMode('group'),
      }, t('list.group')),
      React.createElement('button', {
        type: 'button', className: 'fto-list-segBtn', 'data-on': mode === 'recent' ? 'true' : 'false',
        onClick: () => setMode('recent'),
      }, t('list.recent'))))

  const body = groups.map((group) => {
    const isCollapsed = collapsed.has(group.id)
    const groupRow = React.createElement('div', {
      className: 'fto-list-groupRow', role: 'button', tabIndex: 0,
      onClick: () => toggleGroup(group.id),
      onKeyDown: (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          toggleGroup(group.id)
        }
      },
      onContextMenu: group.synthetic ? undefined : (event) => {
        event.preventDefault()
        openWorkspaceMenu(group.id, group.path, group.title, { x: event.clientX, y: event.clientY })
      },
    },
    React.createElement('span', { className: 'fto-list-groupIcon' }, React.createElement(HashIcon)),
    React.createElement('span', { className: 'fto-list-groupTitle' }, group.title),
    React.createElement('span', { className: 'fto-list-count' }, String(group.members.length)),
    React.createElement('span', { className: 'fto-list-headGap' }),
    isCollapsed ? null : React.createElement('button', {
      type: 'button', className: 'fto-list-iconBtn fto-list-add',
      'aria-label': t('list.newTask'), title: t('list.newTask'),
      onClick: (event) => {
        event.stopPropagation()
        if (group.id === '__recent__' || group.id === '__loose__') startSession(undefined)
        else startSession(group.id)
      },
    }, React.createElement(PlusIcon)),
    React.createElement('span', { className: 'fto-list-chevron' }, React.createElement(CollapseIcon, { collapsed: isCollapsed })))

    const rows = isCollapsed || group.members.length === 0 ? null : React.createElement('div', { className: 'fto-list-rows' },
      group.members.map((summary) => React.createElement(SessionRow, {
          key: summary.id,
          summary,
          label: labelOf(summary),
          time: relativeTime(summary.updatedAt, now, t),
          active: (summary.retainedBy?.mainView ?? 0) > 0,
          onOpen: () => openSession(summary.id),
          onMenu: (point) => setMenu({ summary, x: point.x, y: point.y }),
        }))
      )

    return React.createElement('div', { className: 'fto-list-group', key: group.id }, groupRow, rows)
  })

  const menuItem = (label, onSelect) => React.createElement('div', {
    className: 'fto-list-menuItem', role: 'menuitem',
    onClick: () => { onSelect(); setMenu(null) },
  }, label)

  const menuLayer = menu === null ? null : React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'fto-list-backdrop', onPointerDown: () => setMenu(null) }),
    React.createElement('div', {
      className: 'fto-list-menu', role: 'menu',
      style: { left: String(Math.min(menu.x, globalThis.innerWidth - 180)) + 'px', top: String(Math.min(menu.y, globalThis.innerHeight - 140)) + 'px' },
    },
    menuItem(t('menu.open'), () => openSession(menu.summary.id)),
    menuItem(t('menu.fork'), () => { void forkSession(menu.summary.id) }),
    menu.summary.running ? null : menuItem(t('menu.archive'), () => { void archiveSession(menu.summary.id) }),
    menuItem(t('menu.copyId'), () => copyText(menu.summary.id))))

  return React.createElement('div', { className: 'fto-list-root', 'data-mode': mode },
    header,
    React.createElement('div', { className: 'fto-list-scroll' },
      total === 0 ? React.createElement('div', { className: 'fto-list-empty fto-list-emptyAll' }, t('list.empty')) : body),
    menuLayer)
}
