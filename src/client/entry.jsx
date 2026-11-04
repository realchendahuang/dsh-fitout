/** Client half of dsh-fitout — the 装配式精装 layer for DeepSeek Harness.
 *
 * One activation, six registrations:
 *   1. the token layer (palette) with per-record accent and corner variants;
 *   2. the layout layer (twelve switchable style groups);
 *   3. the settings page: 精装 presets on top, 高定 fields underneath;
 *   4. a General row holding the master switch;
 *   5. brand slots, registered on demand only — the shipped brand stays until
 *      the user actually sets a name or an icon;
 *   6. the task list, the header workspace chip and the chat step renderer.
 *
 * Nothing else is touched: no shipped plugin is disabled, no slot is replaced,
 * and unloading the bundle disposes every registration through Cordis effects.
 */
import { TOKENS } from './tokens.js'
import { buildTokens } from './variants.js'
import { buildCss, SECTIONS } from './sections.js'
import { CSS, adoptStyles } from './styles.js'
import { FitoutMark, FitoutBrandName } from './brand.jsx'
import { FitoutSettingsRow } from './settings-row.jsx'
import { FitoutSettingsPage } from './settings-page.jsx'
import { FitoutTaskList } from './task-list.jsx'
import { WorkspaceChip } from './header-chip.jsx'
import { TurnProcessHeader } from './turn-process.jsx'
import { ALL_GROUPS, PRESETS, findPreset } from './presets.js'
import {
  bindApplier, bindThemeBridge, getSettings, resetAll, setAccent, setAllLayoutGroups,
  setAppearance, setDensity, setEffect, setEnabled, setLayoutGroup, setList, setRadius,
  subscribe,
} from './store.js'

export const name = 'dsh-fitout'

/** The panel needs the slot registry, the theme registry and the locale service. */
export const inject = ['slots', 'theme', 'locale']

const NS = 'settings.fitout'
const VERSION = '0.1.0'

const ZH = {
  title: '装修',
  description: '更自由的个性化，更优雅的精装房。',
  section: '装修',
  'page.title': '装修',
  'page.description': '骨架是官方的。颜色、边角、疏密、十二扇版式——装上去的每一件，都能再拆下来。',
  'page.enable': '启用装修',
  'page.enableDesc': '合上便回到原样。你定过的每一处，都留着。',
  'page.presetGroup': '成屋 · 择一',
  'page.presetNote': '三间屋子已经装好，直接住下。挑哪一间，都不动你的名称、图标与任务列表。',
  'page.presetActive': '在此',
  'page.presetApply': '移入',
  'page.customGroup': '自装 · 逐处',
  'page.customNote': '动了哪一处，上面便不再是一间成屋，而是你自己装的那间。',
  'page.accent': '设色',
  'page.accentDesc': '所有该亮的地方，都染成这个颜色。',
  'page.radius': '方圆',
  'page.radiusDesc': '棱角是方的，还是圆的。',
  'page.radius_compact': '方',
  'page.radius_default': '方圆之间',
  'page.radius_round': '圆',
  'page.appearance': '明暗',
  'page.appearanceDesc': '昼浅夜深。也可以交给系统。',
  'page.themeSystem': '随后',
  'page.themeLight': '昼',
  'page.themeDark': '夜',
  'page.density': '疏密',
  'page.densityDesc': '一屏之内，能搁下多少事。',
  'page.density_default': '疏',
  'page.density_compact': '密',
  'page.list': '任务列表',
  'page.listDesc': '按项目分列，一条条看得清。也可以换回官方那套。',
  'page.listZcode': '分列',
  'page.listNative': '官方',
  'page.chip': '题识',
  'page.chipDesc': '标题之侧，标明这是哪一处。',
  'page.layoutGroup': '十二扇',
  'page.layoutNote': '决定对话区怎么排。合上一扇，那一处便回到原样。',
  'page.layoutAllOn': '全开',
  'page.layoutAllOff': '全合',
  'page.underline': '划线',
  'page.underlineDesc': '链接用一道线示意，不必拿颜色去喊。',
  'page.autoOlder': '自动加载更早',
  'page.autoOlderDesc': '行至顶端，自会翻到上一页。',
  'page.autoOlderPinned': '此处不留开关。它本该如此。',
  'page.autoOlderOn': '常开',
  'page.brandGroup': '门牌',
  'page.name': '名称',
  'page.nameDesc': '侧栏最上那几个字。空着，便用官方的。',
  'page.namePlaceholder': '官方',
  'page.icon': '图标',
  'page.iconDesc': '默认官方。也可以另选一个，或换上自己的（不超过 256 KB）。',
  'page.iconOfficial': '官方',
  'page.iconCustom': '自己的',
  'page.upload': '择一图…',
  'page.iconType': '请择图片（PNG / JPEG / SVG / WebP）',
  'page.iconTooLarge': '图不可过 256 KB',
  'page.preview': '样式',
  'page.previewOfficial': '官方',
  'page.maintainGroup': '维护',
  'page.reset': '复归原样',
  'page.resetAll': '全部重置',
  'page.storageNote': '所有设定都存在这台机器上。换个地方，需重新装一遍。',
  'list.title': '任务',
  'list.group': '分组',
  'list.recent': '最近',
  'list.untitled': '新会话',
  'list.empty': '还没有任务',
  'list.emptyGroup': '暂无会话',
  'list.ungrouped': '其他',
  'list.search': '搜索',
  'list.searchPlaceholder': '搜索会话…',
  'list.newTask': '新建会话',
  'menu.open': '打开',
  'menu.fork': '分叉会话',
  'menu.archive': '归档',
  'menu.copyId': '复制会话 ID',
  'time.now': '刚刚',
  'time.minute': ' 分钟',
  'time.hour': ' 小时',
  'time.day': ' 天',
}



const EN = {
  title: 'Fitout',
  description: 'More freedom to be yourself, more grace in the finish.',
  section: 'Fitout',
  'page.title': 'Fitout',
  'page.description': 'The frame is the product\'s. Colour, corners, density, twelve leaves — everything fitted on can be taken off again.',
  'page.enable': 'Enable fitout',
  'page.enableDesc': 'Close it and the shipped room returns. Everything you set is kept.',
  'page.presetGroup': 'Finished rooms · pick one',
  'page.presetNote': 'Three rooms, already fitted. Move into any of them — your name, icon and task list stay untouched.',
  'page.presetActive': 'Here',
  'page.presetApply': 'Move in',
  'page.customGroup': 'Your own hand · one at a time',
  'page.customNote': 'Change one thing and it is no longer a finished room — it is the one you built.',
  'page.accent': 'Colour',
  'page.accentDesc': 'Everything that should light up, lights up in this.',
  'page.radius': 'Square or round',
  'page.radiusDesc': 'How sharp the corners are.',
  'page.radius_compact': 'Square',
  'page.radius_default': 'Between',
  'page.radius_round': 'Round',
  'page.appearance': 'Light and dark',
  'page.appearanceDesc': 'Pale by day, deep by night. Or let the system decide.',
  'page.themeSystem': 'Follow',
  'page.themeLight': 'Day',
  'page.themeDark': 'Night',
  'page.density': 'Density',
  'page.densityDesc': 'How much fits on one screen.',
  'page.density_default': 'Airy',
  'page.density_compact': 'Dense',
  'page.list': 'Task list',
  'page.listDesc': 'Grouped by project, one row each. The shipped list is one click away.',
  'page.listZcode': 'Grouped',
  'page.listNative': 'Shipped',
  'page.chip': 'Inscription',
  'page.chipDesc': 'Beside the title: which place this is.',
  'page.layoutGroup': 'Twelve leaves',
  'page.layoutNote': 'How the conversation is arranged. Fold one shut and that part returns to the shipped room.',
  'page.layoutAllOn': 'All open',
  'page.layoutAllOff': 'All shut',
  'page.underline': 'Rule line',
  'page.underlineDesc': 'Links are marked with a line, not by shouting in colour.',
  'page.autoOlder': 'Auto-load earlier',
  'page.autoOlderDesc': 'Reach the top and the page before it arrives on its own.',
  'page.autoOlderPinned': 'No switch here. This is how it ought to behave.',
  'page.autoOlderOn': 'Always',
  'page.brandGroup': 'Doorplate',
  'page.name': 'Name',
  'page.nameDesc': 'The words at the top of the sidebar. Empty keeps the official one.',
  'page.namePlaceholder': 'Official',
  'page.icon': 'Icon',
  'page.iconDesc': 'Official by default. Pick another, or bring your own (256 KB max).',
  'page.iconOfficial': 'Official',
  'page.iconCustom': 'Yours',
  'page.upload': 'Choose an image…',
  'page.iconType': 'Choose an image file (PNG / JPEG / SVG / WebP)',
  'page.iconTooLarge': 'The image must be 256 KB or smaller',
  'page.preview': 'Preview',
  'page.previewOfficial': 'Official',
  'page.maintainGroup': 'Maintenance',
  'page.reset': 'Back to the frame',
  'page.resetAll': 'Reset everything',
  'page.storageNote': 'Every setting lives on this machine. Another machine starts from the bare frame.',
  'list.title': 'Tasks',
  'list.group': 'Groups',
  'list.recent': 'Recent',
  'list.untitled': 'New session',
  'list.empty': 'No tasks yet',
  'list.emptyGroup': 'No sessions',
  'list.ungrouped': 'Other',
  'list.search': 'Search',
  'list.searchPlaceholder': 'Search sessions…',
  'list.newTask': 'New session',
  'menu.open': 'Open',
  'menu.fork': 'Fork',
  'menu.archive': 'Archive',
  'menu.copyId': 'Copy session ID',
  'time.now': 'now',
  'time.minute': 'm',
  'time.hour': 'h',
  'time.day': 'd',
}



/** Auto-prefetch older history when the chat approaches the top.
 *
 * ZCode prefetches the previous window on scroll instead of showing a manual
 * "Load earlier" row. The shipped chat renders that row while `hasMore`; this
 * watcher hides it (via the `fto-auto-older` root class) and clicks it whenever
 * the chat scroller is near the top, until the history is exhausted.
 */
function installAutoOlder() {
  if (typeof document === 'undefined') return () => {}

  const getScroller = () => {
    const flow = document.querySelector('[data-chat-flow]')
    return flow === null ? null : flow.parentElement
  }
  const getButton = () => {
    const row = document.querySelector('[data-chat-flow] [class*="_older"]')
    return row === null ? null : row.querySelector('button')
  }

  let scheduled = false
  let timer = null

  const syncRoot = () => {
    document.documentElement.classList.add('fto-auto-older')
  }

  const tryLoad = () => {
    const scroller = getScroller()
    const button = getButton()
    if (scroller === null || button === null || button.disabled) return
    if (scroller.scrollTop > 160) return
    button.click()
  }

  const onScroll = () => {
    if (scheduled) return
    scheduled = true
    globalThis.setTimeout(() => {
      scheduled = false
      tryLoad()
    }, 120)
  }

  document.addEventListener('scroll', onScroll, true)
  // DOM updates (a new page arrives, a session opens) do not always fire scroll.
  timer = globalThis.setInterval(() => {
    syncRoot()
    tryLoad()
  }, 700)
  syncRoot()

  return () => {
    document.removeEventListener('scroll', onScroll, true)
    if (timer !== null) globalThis.clearInterval(timer)
    document.documentElement.classList.remove('fto-auto-older')
  }
}

export function apply(ctx) {
  const theme = ctx.get('theme') ?? ctx.theme
  let layer = null
  let layoutTag = null
  let disposeRenderer = null

  /** html classes for the polish rules the token layer cannot express. */
  const syncRoot = (settings) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const on = settings.enabled
    root.classList.toggle('fto-underline-links', on && settings.effects.underline)
    root.classList.toggle('fto-dense-sidebar', on && settings.density === 'compact')
  }

  /** Rebuild the token layer for one settings record. */
  const syncTokens = (settings) => {
    if (layer !== null) {
      layer()
      layer = null
    }
    if (settings.enabled) layer = theme.overrideTokens('dsh-fitout', buildTokens(settings))
  }

  /** Rewrite the layout stylesheet; disabled groups simply are not emitted. */
  const syncLayout = (settings) => {
    if (typeof document === 'undefined') return
    const wanted = settings.enabled
    if (layoutTag === null) {
      const existing = document.getElementById('dsh-fitout-layout')
      layoutTag = existing ?? document.createElement('style')
      if (existing === null) {
        layoutTag.id = 'dsh-fitout-layout'
        document.head.appendChild(layoutTag)
      }
    }
    layoutTag.textContent = wanted ? buildCss(settings.layout.disabled) : ''
    if (wanted && disposeRenderer === null) {
      const slots = ctx.get('slots') ?? ctx.slots
      if (slots !== undefined && slots !== null) {
        disposeRenderer = slots.inject('conversation.chat.node', () => slots.register(
          { name: 'conversation.chat.node', key: 'turn-process', priority: -1 },
          TurnProcessHeader,
        ))
      }
    } else if (!wanted && disposeRenderer !== null) {
      disposeRenderer()
      disposeRenderer = null
    }
  }

  const applyAppearance = (settings) => {
    syncTokens(settings)
    syncRoot(settings)
    syncLayout(settings)
  }

  bindApplier(applyAppearance)
  bindThemeBridge(
    () => theme.getTheme().preference,
    (id) => theme.setTheme(id),
  )

  // A small face for other plugins, for the settings page and for inspection.
  const api = Object.freeze({
    version: VERSION,
    get: getSettings,
    subscribe,
    setEnabled,
    setList,
    setAccent,
    setRadius,
    setDensity,
    setEffect,
    setLayoutGroup,
    setAllLayoutGroups,
    resetAll,
    presets: PRESETS,
    groups: SECTIONS.map((section) => ({ id: section.id, title: section.title, desc: section.desc })),
    tokenCount: Object.keys(TOKENS).length,
  })
  const service = Object.freeze({
    version: VERSION,
    get settings() {
      return getSettings()
    },
    tokenCount: Object.keys(TOKENS).length,
    presets: PRESETS.map((preset) => preset.id),
  })
  try {
    ctx.effect(() => ctx.reflect.provide('fitout', service), 'dsh-fitout: service')
  } catch {
    /* hosts without ctx.reflect keep the plugin working */
  }
  ctx.effect(() => {
    globalThis.__dshFitout = api
    return () => {
      if (globalThis.__dshFitout === api) delete globalThis.__dshFitout
    }
  }, 'dsh-fitout: window api')

  ctx.effect(() => () => {
    if (layer !== null) {
      layer()
      layer = null
    }
    if (layoutTag !== null) {
      layoutTag.textContent = ''
      layoutTag.remove()
      layoutTag = null
    }
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('fto-underline-links', 'fto-dense-sidebar')
    }
  }, 'dsh-fitout: teardown')

  let translate = (key) => key
  const locale = ctx.get('locale') ?? ctx.locale
  if (locale !== undefined && locale !== null) {
    try {
      ctx.effect(() => locale.register(NS, { zh: ZH, en: EN }), 'dsh-fitout: dictionaries')
      translate = locale.bind(NS)
    } catch {
      /* a host without the locale service keeps the raw keys */
    }
  }

  ctx.effect(() => adoptStyles(CSS), 'dsh-fitout: styles')
  ctx.effect(() => installAutoOlder(), 'dsh-fitout: auto older')

  const slots = ctx.get('slots') ?? ctx.slots
  if (slots === undefined || slots === null || typeof slots.inject !== 'function') return

  // The plugin's own Settings page.
  slots.inject('settings.section', () => slots.register(
    { name: 'settings.section', id: 'fitout', order: 14, label: () => translate('section'), locale: NS },
    FitoutSettingsPage,
  ))
  // Quick toggle in General.
  slots.inject('settings.general.item', () => slots.register(
    { name: 'settings.general.item', id: 'fitout', order: 16, locale: NS },
    FitoutSettingsRow,
  ))

  /** Register a brand occupant while `wanted(settings)` holds; remove it otherwise. */
  const bindBrand = (key, component, wanted) => {
    slots.inject(key, () => {
      let dispose = null
      const sync = () => {
        const should = wanted(getSettings())
        if (should && dispose === null) {
          dispose = slots.register({ name: key, priority: -1 }, component)
        } else if (!should && dispose !== null) {
          dispose()
          dispose = null
        }
      }
      const off = subscribe(sync)
      sync()
      return () => {
        off()
        if (dispose !== null) {
          dispose()
          dispose = null
        }
      }
    })
  }

  bindBrand('sidebar.brand.mark', FitoutMark, (settings) => settings.icon.kind !== 'official')
  bindBrand('sidebar.brand.name', FitoutBrandName, (settings) => settings.name.trim() !== '')

  // The task list shadows the shipped WorkspaceBrowser while the setting is
  // 'zcode'. The services must exist before the occupant can be registered, so
  // the whole thing lives inside ctx.inject (activation order is not assumed).
  ctx.inject(['workspaces', 'sessions', 'uiWorkspace'], (scope) => {
    const workspaces = scope.workspaces ?? ctx.get('workspaces')
    const sessions = scope.sessions ?? ctx.get('sessions')
    const uiWorkspace = scope.uiWorkspace ?? ctx.get('uiWorkspace')
    if (workspaces === undefined || sessions === undefined || uiWorkspace === undefined) return

    // The project next to the session title, as one header-action row.
    slots.inject('conversation.session.header.actions', () => {
      let dispose = null
      const sync = () => {
        const settings = getSettings()
        const want = settings.enabled && settings.effects.chip
        if (want && dispose === null) {
          dispose = slots.register({
            name: 'conversation.session.header.actions',
            id: 'fitout-workspace-chip',
            order: -1,
            inject: () => ({ hooks: { sessions: sessions.list, workspaces: workspaces.list } }),
          }, WorkspaceChip)
        } else if (!want && dispose !== null) {
          dispose()
          dispose = null
        }
      }
      const off = subscribe(sync)
      sync()
      return () => {
        off()
        if (dispose !== null) {
          dispose()
          dispose = null
        }
      }
    })

    slots.inject('sidebar.workspaces', () => {
      let dispose = null
      const sync = () => {
        const want = getSettings().list === 'zcode'
        if (want && dispose === null) {
          dispose = slots.register({
            name: 'sidebar.workspaces',
            priority: -1,
            locale: NS,
            inject: () => ({
              hooks: { workspaces: workspaces.list, sessions: sessions.list },
              openSession: (sessionId) => { uiWorkspace.openSession(sessionId) },
              startSession: (workspaceId) => { uiWorkspace.startSession(workspaceId) },
              archiveSession: (sessionId) => { workspaces.archiveSession(sessionId) },
              unarchiveSession: (sessionId) => { workspaces.unarchiveSession(sessionId) },
              forkSession: (sessionId) => { uiWorkspace.forkSession(sessionId) },
              copyText: (text) => {
                try {
                  void globalThis.navigator?.clipboard?.writeText(text)
                } catch {
                  /* clipboard is optional */
                }
              },
            }),
          }, FitoutTaskList)
        } else if (!want && dispose !== null) {
          dispose()
          dispose = null
        }
      }
      const off = subscribe(sync)
      sync()
      return () => {
        off()
        if (dispose !== null) {
          dispose()
          dispose = null
        }
      }
    })
  })
}
