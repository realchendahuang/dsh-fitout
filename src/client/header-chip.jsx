/** Header workspace chip: the folder + project name ZCode shows next to the
 * session title. Additive only — it is one list row in the shipped header
 * actions slot, so the chips other plugins put there stay put.
 *
 * Data comes from the standard hooks: the current session (retained by the main
 * view) and the workspace that owns it. A session outside every workspace falls
 * back to the basename of its cwd, like the shipped ungrouped bucket.
 */
import React from 'react'

function FolderIcon() {
  return React.createElement('svg', {
    width: 13, height: 13, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true', strokeWidth: 1,
  },
  React.createElement('path', {
    d: 'M1.5 3.6c0-.55.45-1 1-1h2.93c.24 0 .48.09.66.25l1.62 1.43c.18.16.42.25.66.25h5.12c.55 0 1 .45 1 1v7.85c0 .55-.45 1-1 1H2.5c-.55 0-1-.45-1-1V3.6Z',
    stroke: 'currentColor',
  }))
}

export function WorkspaceChip(props) {
  const { useSessions, useWorkspaces } = props
  const list = useSessions((state) => state)
  const items = useWorkspaces((state) => state.items)

  const current = React.useMemo(() => {
    const byId = list?.byId ?? {}
    return Object.values(byId).find((summary) => (summary?.retainedBy?.mainView ?? 0) > 0)
  }, [list])

  const name = React.useMemo(() => {
    if (current === undefined || current === null) return ''
    const workspace = (items ?? []).find((candidate) => (candidate.sessionIds ?? []).includes(current.id))
    if (workspace !== undefined && workspace.title) return workspace.title
    const cwd = current.cwd
    if (typeof cwd !== 'string' || cwd === '') return ''
    const parts = cwd.split(/[\\/]/).filter(Boolean)
    return parts.length === 0 ? cwd : parts[parts.length - 1]
  }, [current, items])

  if (name === '') return null
  return React.createElement('span', {
    className: 'fto-chip-chip', title: current?.cwd ?? name, 'data-zcode-workspace-chip': 'true',
  },
  React.createElement(FolderIcon),
  React.createElement('span', { className: 'fto-chip-name' }, name))
}
