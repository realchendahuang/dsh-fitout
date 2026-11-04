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
  description: '给 DeepSeek Harness 换配色和版式。骨架是官方的，装修可以一处一处改。',
  section: '装修',
  'page.title': '装修',
  'page.description': '上面是预设，选一套直接用；下面是自定义，逐项调整。改任何一项，预设就变成「自定义」。',
  'page.enable': '启用装修',
  'page.enableDesc': '关掉后立即恢复官方样式，你的设置都会保留。',
  'page.presetGroup': '预设',
  'page.presetNote': '预设只改圆角、疏密和版式，不动品牌与任务列表。',
  'page.presetActive': '使用中',
  'page.presetApply': '套用',
  'page.customGroup': '自定义',
  'page.customNote': '改任意一项，上面的预设会变成「自定义」。',
  'page.accent': '强调色',
  'page.accentDesc': '链接、选中态、焦点环和品牌高亮用的颜色。',
  'page.radius': '圆角',
  'page.radiusDesc': '卡片、输入框和按钮的圆角大小。',
  'page.radius_compact': '紧凑',
  'page.radius_default': '标准',
  'page.radius_round': '圆润',
  'page.appearance': '明暗偏好',
  'page.appearanceDesc': '直接切换 DSH 的明暗设置。',
  'page.themeSystem': '跟随系统',
  'page.themeLight': '浅色',
  'page.themeDark': '深色',
  'page.density': '侧栏密度',
  'page.densityDesc': '侧栏会话行的高度和字号。',
  'page.density_default': '标准',
  'page.density_compact': '紧凑',
  'page.list': '任务列表',
  'page.listDesc': '按项目分组的任务列表，也可以换回官方那套（带搜索、拖拽和归档）。',
  'page.listZcode': '分组',
  'page.listNative': '官方',
  'page.chip': '项目标签',
  'page.chipDesc': '在会话标题旁显示所属项目。',
  'page.layoutGroup': '版式',
  'page.layoutNote': '十二组样式，决定对话区怎么排。关掉一组，那部分恢复官方样式。',
  'page.layoutAllOn': '全部开启',
  'page.layoutAllOff': '全部关闭',
  'page.underline': '链接下划线',
  'page.underlineDesc': '正文里的链接改用下划线，不使用彩色文字。',
  'page.autoOlder': '自动加载更早',
  'page.autoOlderDesc': '滚动到接近顶部时自动加载上一页，不需要点「加载更早」。',
  'page.autoOlderPinned': '这一项没有开关，属于固定行为。',
  'page.autoOlderOn': '常开',
  'page.brandGroup': '品牌',
  'page.name': '名称',
  'page.nameDesc': '侧边栏顶部显示的文字。留空则使用官方品牌。',
  'page.namePlaceholder': '官方品牌',
  'page.icon': '图标',
  'page.iconDesc': '默认显示官方图标，也可以选一个预设，或上传不超过 256 KB 的图片。',
  'page.iconOfficial': '官方',
  'page.iconCustom': '自定义',
  'page.upload': '上传图片…',
  'page.iconType': '请选择图片文件（PNG / JPEG / SVG / WebP）',
  'page.iconTooLarge': '图片不能超过 256 KB',
  'page.preview': '预览',
  'page.previewOfficial': '官方品牌',
  'page.maintainGroup': '维护',
  'page.reset': '恢复默认',
  'page.resetAll': '全部重置',
  'page.storageNote': '设置保存在本机浏览器中，换机器需要重新设置。',
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
  description: 'Colour and layout for DeepSeek Harness. The frame is the product\'s; every fitting can be changed one at a time.',
  section: 'Fitout',
  'page.title': 'Fitout',
  'page.description': 'Presets on top — pick one and go. Your own hand below — change any field and the preset reads Custom.',
  'page.enable': 'Enable fitout',
  'page.enableDesc': 'Turning this off restores the shipped look immediately. Your settings are kept.',
  'page.presetGroup': 'Presets',
  'page.presetNote': 'A preset only changes corners, density and layout — never the brand or the task list.',
  'page.presetActive': 'In use',
  'page.presetApply': 'Apply',
  'page.customGroup': 'Custom',
  'page.customNote': 'Change any field and the preset above reads Custom.',
  'page.accent': 'Accent',
  'page.accentDesc': 'The colour used for links, selection, focus rings and brand highlights.',
  'page.radius': 'Corners',
  'page.radiusDesc': 'Corner size for cards, inputs and buttons.',
  'page.radius_compact': 'Tight',
  'page.radius_default': 'Standard',
  'page.radius_round': 'Round',
  'page.appearance': 'Light / dark',
  'page.appearanceDesc': 'Switch the DSH appearance directly.',
  'page.themeSystem': 'System',
  'page.themeLight': 'Light',
  'page.themeDark': 'Dark',
  'page.density': 'Sidebar density',
  'page.densityDesc': 'Row height and font size in the sidebar.',
  'page.density_default': 'Standard',
  'page.density_compact': 'Compact',
  'page.list': 'Task list',
  'page.listDesc': 'Sessions grouped by project; the shipped list (with search, drag and archive) is one click away.',
  'page.listZcode': 'Grouped',
  'page.listNative': 'Shipped',
  'page.chip': 'Project tag',
  'page.chipDesc': 'Show the owning project next to the session title.',
  'page.layoutGroup': 'Layout',
  'page.layoutNote': 'Twelve style groups that decide how the conversation is arranged. Turn one off and that part returns to the shipped look.',
  'page.layoutAllOn': 'All on',
  'page.layoutAllOff': 'All off',
  'page.underline': 'Underlined links',
  'page.underlineDesc': 'Links in the transcript use an underline instead of coloured text.',
  'page.autoOlder': 'Auto-load earlier',
  'page.autoOlderDesc': 'Load the previous page when the view nears the top; no manual "Load earlier" click.',
  'page.autoOlderPinned': 'No switch for this one — it is fixed behaviour.',
  'page.autoOlderOn': 'Always on',
  'page.brandGroup': 'Brand',
  'page.name': 'Name',
  'page.nameDesc': 'Text shown at the top of the sidebar. Empty keeps the official brand.',
  'page.namePlaceholder': 'Official brand',
  'page.icon': 'Icon',
  'page.iconDesc': 'Official by default. Pick a preset, or upload an image no larger than 256 KB.',
  'page.iconOfficial': 'Official',
  'page.iconCustom': 'Custom',
  'page.upload': 'Upload image…',
  'page.iconType': 'Choose an image file (PNG / JPEG / SVG / WebP)',
  'page.iconTooLarge': 'The image must be 256 KB or smaller',
  'page.preview': 'Preview',
  'page.previewOfficial': 'Official brand',
  'page.maintainGroup': 'Maintenance',
  'page.reset': 'Reset to defaults',
  'page.resetAll': 'Reset everything',
  'page.storageNote': 'Settings are stored in this browser. Another machine starts from the defaults.',
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
