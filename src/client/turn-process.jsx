/** 轮次折叠头：ZCode 那种「安静一行」——完成态 + 时长 + 轻量计量。 */
import React from 'react'

const VISUALLY_HIDDEN = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
}

function formatDuration(milliseconds) {
  const total = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor(total / 60) % 60
  const seconds = total % 60
  const parts = []
  if (hours > 0) parts.push(`${hours} 小时`)
  if (total >= 60) parts.push(`${minutes} 分`)
  parts.push(`${seconds} 秒`)
  return parts.join(' ')
}

export function TurnProcessHeader({ node, turnProcess }) {
  if (turnProcess === undefined) return null
  const location = node.location
  const turn = location?.kind === 'turn' || location?.kind === 'step' ? location.turn : undefined
  if (turn?.status !== 'closed') return null

  const reason = turn.end?.data?.reason?.kind
  const stopped = reason === 'aborted' || reason === 'interrupted'
  const failed = reason === 'error'
  const alwaysOpen = stopped || failed
  const canCollapse = turnProcess.foldable && turnProcess.hasContent && !alwaysOpen
  const open = !turnProcess.foldable || turnProcess.open
  const elapsed = turn.start === undefined || turn.end === undefined
    ? undefined
    : Math.max(1000, turn.end.time - turn.start.time)

  const data = node.data ?? {}
  const calls = data.toolCallCount ?? 0
  const subagents = data.subagentCount ?? 0
  const meta = []
  if (calls > 0) meta.push(`${calls} 次工具调用`)
  if (subagents > 0) meta.push(`${subagents} 个子智能体`)

  const title = stopped ? '已停止' : failed ? '处理失败' : elapsed === undefined ? '已处理' : '已完成'
  const announcement = stopped ? '本轮已停止' : failed ? '本轮处理失败' : '本轮已完成'
  const showDuration = !stopped && !failed && elapsed !== undefined

  return React.createElement(
    React.Fragment,
    null,
    React.createElement('span', {
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
      style: VISUALLY_HIDDEN,
    }, announcement),
    React.createElement(
      'button',
      {
        type: 'button',
        className: 'fto-turn',
        'data-turn-process': data.turn,
        'data-turn-process-messages': data.messageCount,
        'data-turn-process-tool-calls': data.toolCallCount,
        'data-turn-process-subagents': data.subagentCount,
        'data-open': open || undefined,
        'aria-expanded': turnProcess.hasContent ? open : undefined,
        disabled: !canCollapse,
        onClick: (event) => {
          event.currentTarget.focus()
          turnProcess.setOpen(!open)
        },
      },
      React.createElement('span', { className: 'fto-turn-label' }, title),
      showDuration
        ? React.createElement(React.Fragment, null,
            React.createElement('span', { className: 'fto-turn-dot', 'aria-hidden': 'true' }),
            React.createElement('span', { className: 'fto-turn-duration' }, formatDuration(elapsed)))
        : null,
      meta.length > 0 ? React.createElement('span', { className: 'fto-turn-meta' }, meta.join(' · ')) : null,
      canCollapse
        ? React.createElement('svg', {
            className: 'fto-turn-chevron',
            viewBox: '0 0 16 16',
            width: 14,
            height: 14,
            'aria-hidden': 'true',
          }, React.createElement('path', {
            d: 'M6 3.5L10.5 8L6 12.5',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 1.6,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }))
        : null,
    ),
  )
}
