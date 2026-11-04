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
  title: '精装',
  description: '更自由的个性化，更优雅的精装房。',
  section: '我的精装',
  'page.title': '精装',
  'page.description': '先挑一套，拎包入住。不满意就一件件拆开改——改哪件，哪件就长成你的样子。',
  'page.enable': '启用',
  'page.enableDesc': '关掉就回到原样。你的设置都留着。',
  'page.presetGroup': '精装 · 拎包入住',
  'page.presetNote': '预设只管形状和疏密，不碰你的名字、图标和任务列表。',
  'page.presetActive': '住着',
  'page.presetApply': '住进来',
  'page.customGroup': '高定 · 一件件拆开',
  'page.customNote': '动了哪一项，上面就不再只是选好的那套，而是你自己的一间。',
  'page.accent': '强调色',
  'page.accentDesc': '所有该亮的地方，都亮这个颜色。',
  'page.radius': '边角',
  'page.radiusDesc': '利落一点，还是圆润一点。',
  'page.radius_compact': '利落',
  'page.radius_default': '适中',
  'page.radius_round': '圆润',
  'page.appearance': '明暗',
  'page.appearanceDesc': '白天浅一点，夜里深一点。也可以交给系统。',
  'page.themeSystem': '跟随系统',
  'page.themeLight': '浅色',
  'page.themeDark': '深色',
  'page.density': '疏密',
  'page.densityDesc': '一屏装得下多少会话。',
  'page.density_default': '宽松',
  'page.density_compact': '紧密',
  'page.list': '任务列表',
  'page.listDesc': '按项目分组，一眼看清各自在做什么。也可以换回官方那套。',
  'page.listZcode': '分组',
  'page.listNative': '官方',
  'page.chip': '项目标签',
  'page.chipDesc': '在标题旁边写清楚：这是哪个项目。',
  'page.layoutGroup': '版式 · 十二组',
  'page.layoutNote': '决定对话区怎么排。关掉一组，那部分就回到官方原样。',
  'page.layoutAllOn': '全开',
  'page.layoutAllOff': '全关',
  'page.underline': '链接下划线',
  'page.underlineDesc': '链接用下划线说话，不用颜色喊。',
  'page.autoOlder': '自动加载更早',
  'page.autoOlderDesc': '滚到顶，就自己翻到上一页。',
  'page.autoOlderPinned': '这一条没有开关。它本来就应该这样。',
  'page.autoOlderOn': '始终',
  'page.brandGroup': '品牌',
  'page.name': '名称',
  'page.nameDesc': '侧边栏最上面那几个字。留空就用官方的。',
  'page.namePlaceholder': '官方品牌',
  'page.icon': '图标',
  'page.iconDesc': '默认官方。也可以挑一个，或者传自己的（不超过 256 KB）。',
  'page.iconOfficial': '官方',
  'page.iconCustom': '自己的',
  'page.upload': '选一张图…',
  'page.iconType': '请选图片文件（PNG / JPEG / SVG / WebP）',
  'page.iconTooLarge': '图片不能超过 256 KB',
  'page.preview': '看看',
  'page.previewOfficial': '官方品牌',
  'page.maintainGroup': '维护',
  'page.reset': '恢复出厂',
  'page.resetAll': '全部清空',
  'page.storageNote': '所有设置都存在这台机器上。换台电脑，得重新装一遍。',
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
  section: 'My Fitout',
  'page.title': 'Fitout',
  'page.description': 'Pick one and move in. If it does not fit, take it apart piece by piece — whatever you change becomes yours.',
  'page.enable': 'Enable',
  'page.enableDesc': 'Turn it off to get the shipped look back. Your settings stay.',
  'page.presetGroup': 'Fitout · move in',
  'page.presetNote': 'A preset decides shapes and density only — never your name, icon or task list.',
  'page.presetActive': 'In use',
  'page.presetApply': 'Move in',
  'page.customGroup': 'Bespoke · piece by piece',
  'page.customNote': 'Change any field below and the room is no longer the one you picked — it is yours.',
  'page.accent': 'Accent',
  'page.accentDesc': 'Every place that should light up lights up in this colour.',
  'page.radius': 'Corners',
  'page.radiusDesc': 'Tidy, or a little softer.',
  'page.radius_compact': 'Tidy',
  'page.radius_default': 'Balanced',
  'page.radius_round': 'Soft',
  'page.appearance': 'Light & dark',
  'page.appearanceDesc': 'Lighter by day, darker by night. Or leave it to the system.',
  'page.themeSystem': 'System',
  'page.themeLight': 'Light',
  'page.themeDark': 'Dark',
  'page.density': 'Density',
  'page.densityDesc': 'How many sessions fit on one screen.',
  'page.density_default': 'Roomy',
  'page.density_compact': 'Tight',
  'page.list': 'Task list',
  'page.listDesc': 'Grouped by project, so you can see what each one is doing. The shipped list is still one click away.',
  'page.listZcode': 'Grouped',
  'page.listNative': 'Shipped',
  'page.chip': 'Project tag',
  'page.chipDesc': 'Say which project this is, right next to the title.',
  'page.layoutGroup': 'Layout · twelve groups',
  'page.layoutNote': 'How the conversation is arranged. Turn one off and that part returns to the shipped look.',
  'page.layoutAllOn': 'All on',
  'page.layoutAllOff': 'All off',
  'page.underline': 'Underlined links',
  'page.underlineDesc': 'Links speak with an underline instead of shouting in colour.',
  'page.autoOlder': 'Auto-load earlier',
  'page.autoOlderDesc': 'Reach the top and it fetches the previous page by itself.',
  'page.autoOlderPinned': 'No switch for this one. It is simply how it should behave.',
  'page.autoOlderOn': 'Always',
  'page.brandGroup': 'Brand',
  'page.name': 'Name',
  'page.nameDesc': 'The few words at the top of the sidebar. Empty keeps the official one.',
  'page.namePlaceholder': 'Official brand',
  'page.icon': 'Icon',
  'page.iconDesc': 'Official by default. Pick a preset, or upload your own (256 KB max).',
  'page.iconOfficial': 'Official',
  'page.iconCustom': 'Yours',
  'page.upload': 'Choose an image…',
  'page.iconType': 'Choose an image file (PNG / JPEG / SVG / WebP)',
  'page.iconTooLarge': 'The image must be 256 KB or smaller',
  'page.preview': 'Preview',
  'page.previewOfficial': 'Official brand',
  'page.maintainGroup': 'Maintenance',
  'page.reset': 'Back to factory',
  'page.resetAll': 'Clear everything',
  'page.storageNote': 'Everything lives on this machine. Another machine starts from scratch.',
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
