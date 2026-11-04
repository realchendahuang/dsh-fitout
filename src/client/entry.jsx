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
import { pushLiveFonts } from './fonts.js'
import {
  FONT_ROLES, bindApplier, bindFontRestore, bindFontSync, bindThemeBridge, getSettings, resetAll, setAccent,
  setAllLayoutGroups, setAppearance, setDensity, setEffect, setEnabled, setLayoutGroup, setList,
  setRadius, subscribe,
} from './store.js'

export const name = 'dsh-fitout'

/** The panel needs the slot registry, the theme registry and the locale service. */
export const inject = ['slots', 'theme', 'locale']

const NS = 'settings.fitout'
const VERSION = '0.8.1'

export const ZH = {
  title: '装修',
  description: '主题商店：挑一套，或者自己调。',
  section: '装修',
  'page.title': '装修',
  'page.enable': '启用装修',
  'page.tune': '微调',
  'page.shapeGroup': '形状',
  'page.surface': '底色',
  'page.surface_neutral': '中性',
  'page.surface_paper': '暖纸',
  'page.surface_night': '夜蓝',
  'page.surface_nord': '极地',
  'page.lineHeight': '行高',
  'page.lineHeight_tight': '紧',
  'page.lineHeight_normal': '标准',
  'page.lineHeight_loose': '松',
  'page.fontCustom': '例如 PingFang SC, sans-serif',
  'page.fontCustomTitle': '正文自定义栈',
  'page.layoutGroup2': '布局',
  'page.measure': '消息宽度',
  'page.measure_auto': '跟随',
  'page.measure_narrow': '窄',
  'page.measure_wide': '宽',
  'page.glass': '毛玻璃',
  'page.glass_off': '关',
  'page.glass_cards': '卡片',
  'page.glass_all': '全部',
  'page.accentCustom': '自定义颜色',
  'page.bgGroup': '背景',
  'page.bgImage': '图片',
  'page.bgUpload': '上传图片…',
  'page.bgReplace': '换一张',
  'page.bgClear': '清除',
  'page.bgLink': '链接',
  'page.bgLinkPlaceholder': '粘贴图片地址',
  'page.bgLocal': '已使用本地图片',
  'page.bgOpacity': '可见度',
  'page.bgBlur': '模糊',
  'page.bgTooLarge': '请选择图片文件，且不超过 700 KB',
  'page.textGroup': '质感',
  'page.fontGroup': '字体',
  'page.fontRole_text': '正文',
  'page.fontRole_code': '代码',
  'page.fontRole_terminal': '终端',
  'page.fontApp': '跟随 App',
  'page.typeSize': '字号',
  'page.typeReset': '恢复默认',
  'page.fontPreview': '预览',
  'page.fontLive': '当前生效',
  'page.shadow': '阴影',
  'page.shadow_flat': '无',
  'page.shadow_soft': '柔和',
  'page.shadow_lifted': '明显',
  'page.motion': '动效',
  'page.motion_off': '关',
  'page.motion_normal': '标准',
  'page.motion_slow': '慢',
  'page.corner': '转角',
  'page.corner_round': '圆角',
  'page.corner_squircle': '超椭圆',
  'page.codeTone': '代码块',
  'page.codeTone_auto': '跟随',
  'page.codeTone_light': '浅',
  'page.codeTone_dark': '深',

  'page.accent': '强调色',
  'page.radius': '圆角',
  'page.radius_compact': '紧凑',
  'page.radius_default': '标准',
  'page.radius_round': '圆润',
  'page.density': '侧栏密度',
  'page.density_default': '标准',
  'page.density_compact': '紧凑',
  'page.appearance': '明暗',
  'page.themeSystem': '跟随系统',
  'page.themeLight': '浅色',
  'page.themeDark': '深色',
  'page.layoutGroup': '版式',
  'page.layoutAllOn': '全开',
  'page.layoutAllOff': '全关',
  'page.listGroup': '列表与细节',
  'page.list': '任务列表',
  'page.listZcode': '分组',
  'page.listNative': '官方',
  'page.chip': '项目标签',
  'page.underline': '链接下划线',
  'page.brandGroup': '品牌',
  'page.name': '名称',
  'page.namePlaceholder': '官方品牌',
  'page.icon': '图标',
  'page.iconOfficial': '官方',
  'page.iconCustom': '自定义',
  'page.upload': '上传图片…',
  'page.iconType': '请选择图片文件（PNG / JPEG / SVG / WebP）',
  'page.iconTooLarge': '图片不能超过 256 KB',
  'page.maintainGroup': '维护',
  'page.reset': '恢复默认',
  'page.resetAll': '全部重置',
  'page.import': '导入主题',
  'page.export': '导出当前',
  'page.importBad': '无法识别这个文件。支持装修导出的 JSON，或 dsh-dream-skin 的主题包。',
  'page.importDone': '已导入「{name}」',
  'page.loadingTheme': '',
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
  description: 'A theme shelf: pick one, or tune it yourself.',
  section: 'Fitout',
  'page.title': 'Fitout',
  'page.enable': 'Enable fitout',
  'page.tune': 'Fine tune',
  'page.shapeGroup': 'Shape',
  'page.surface': 'Surface',
  'page.surface_neutral': 'Neutral',
  'page.surface_paper': 'Paper',
  'page.surface_night': 'Night',
  'page.surface_nord': 'Arctic',
  'page.lineHeight': 'Line height',
  'page.lineHeight_tight': 'Tight',
  'page.lineHeight_normal': 'Normal',
  'page.lineHeight_loose': 'Loose',
  'page.fontCustom': 'For example, PingFang SC, sans-serif',
  'page.fontCustomTitle': 'Custom body stack',
  'page.layoutGroup2': 'Layout',
  'page.measure': 'Message width',
  'page.measure_auto': 'Follow',
  'page.measure_narrow': 'Narrow',
  'page.measure_wide': 'Wide',
  'page.glass': 'Frosted glass',
  'page.glass_off': 'Off',
  'page.glass_cards': 'Cards',
  'page.glass_all': 'Everything',
  'page.accentCustom': 'Custom colour',
  'page.bgGroup': 'Background',
  'page.bgImage': 'Image',
  'page.bgUpload': 'Upload image…',
  'page.bgReplace': 'Replace',
  'page.bgClear': 'Clear',
  'page.bgLink': 'Link',
  'page.bgLinkPlaceholder': 'Paste an image URL',
  'page.bgLocal': 'Using a local image',
  'page.bgOpacity': 'Visibility',
  'page.bgBlur': 'Blur',
  'page.bgTooLarge': 'Choose an image file of 700 KB or less',
  'page.textGroup': 'Texture',
  'page.fontGroup': 'Type',
  'page.fontRole_text': 'Body',
  'page.fontRole_code': 'Code',
  'page.fontRole_terminal': 'Terminal',
  'page.fontApp': 'App default',
  'page.typeSize': 'Size',
  'page.typeReset': 'Reset',
  'page.fontPreview': 'Preview',
  'page.fontLive': 'In effect',
  'page.shadow': 'Shadows',
  'page.shadow_flat': 'None',
  'page.shadow_soft': 'Soft',
  'page.shadow_lifted': 'Lifted',
  'page.motion': 'Motion',
  'page.motion_off': 'Off',
  'page.motion_normal': 'Standard',
  'page.motion_slow': 'Slow',
  'page.corner': 'Corners',
  'page.corner_round': 'Round',
  'page.corner_squircle': 'Squircle',
  'page.codeTone': 'Code block',
  'page.codeTone_auto': 'Follow',
  'page.codeTone_light': 'Light',
  'page.codeTone_dark': 'Dark',

  'page.accent': 'Accent',
  'page.radius': 'Corners',
  'page.radius_compact': 'Tight',
  'page.radius_default': 'Standard',
  'page.radius_round': 'Round',
  'page.density': 'Sidebar density',
  'page.density_default': 'Standard',
  'page.density_compact': 'Compact',
  'page.appearance': 'Light / dark',
  'page.themeSystem': 'System',
  'page.themeLight': 'Light',
  'page.themeDark': 'Dark',
  'page.layoutGroup': 'Layout',
  'page.layoutAllOn': 'All on',
  'page.layoutAllOff': 'All off',
  'page.listGroup': 'List & details',
  'page.list': 'Task list',
  'page.listZcode': 'Grouped',
  'page.listNative': 'Shipped',
  'page.chip': 'Project tag',
  'page.underline': 'Underlined links',
  'page.brandGroup': 'Brand',
  'page.name': 'Name',
  'page.namePlaceholder': 'Official brand',
  'page.icon': 'Icon',
  'page.iconOfficial': 'Official',
  'page.iconCustom': 'Custom',
  'page.upload': 'Upload image…',
  'page.iconType': 'Choose an image file (PNG / JPEG / SVG / WebP)',
  'page.iconTooLarge': 'The image must be 256 KB or smaller',
  'page.maintainGroup': 'Maintenance',
  'page.reset': 'Reset to defaults',
  'page.resetAll': 'Reset everything',
  'page.import': 'Import theme',
  'page.export': 'Export current',
  'page.importBad': 'Unrecognised file. Expected a Fitout export or a dsh-dream-skin theme pack.',
  'page.importDone': 'Imported “{name}”',
  'page.loadingTheme': '',
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

export function apply(ctx) {
  const theme = ctx.get('theme') ?? ctx.theme
  let layer = null
  let layoutTag = null
  let disposeRenderer = null

  /** Wallpaper layer: one fixed ::before element painted from body variables. */
  const syncWallpaper = (settings) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const bg = settings.background ?? {}
    const on = settings.enabled && typeof bg.image === 'string' && bg.image !== ''
    root.classList.toggle('fto-has-wallpaper', on)
    if (!on) {
      root.style.removeProperty('--fto-wallpaper')
      root.style.removeProperty('--fto-wallpaper-opacity')
      root.style.removeProperty('--fto-wallpaper-blur')
      return
    }
    root.style.setProperty('--fto-wallpaper', 'url("' + bg.image + '")')
    root.style.setProperty('--fto-wallpaper-opacity', String((bg.opacity ?? 55) / 100))
    root.style.setProperty('--fto-wallpaper-blur', (bg.blur ?? 0) + 'px')
  }

  /** html classes for the polish rules the token layer cannot express. */
  const syncRoot = (settings) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const on = settings.enabled
    root.classList.toggle('fto-underline-links', on && settings.effects.underline)
    root.classList.toggle('fto-dense-sidebar', on && settings.density === 'compact')
    root.classList.toggle('fto-glass-cards', on && settings.glass === 'cards')
    root.classList.toggle('fto-glass-all', on && settings.glass === 'all')
    root.classList.toggle('fto-lh-tight', on && settings.lineHeight === 'tight')
    root.classList.toggle('fto-lh-loose', on && settings.lineHeight === 'loose')
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
    syncWallpaper(settings)
    syncLayout(settings)
  }

  bindApplier(applyAppearance)
  bindThemeBridge(
    () => theme.getTheme().preference,
    (id) => theme.setTheme(id),
  )

  /** Put a type recipe into the app's own settings, one role at a time.
   *
   * Families and sizes are the app's settings, not our token layer: writing
   * `--dsh-font-family-text` ourselves would fight the Appearance page and the
   * boot script, and the panel would show a value that does nothing.
   */
  const writeFonts = (recipe) => {
    for (const role of FONT_ROLES) {
      const family = recipe?.font?.[role] ?? ''
      if (typeof theme.setFontFamily === 'function') {
        try {
          theme.setFontFamily(role, family)
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('[dsh-fitout] could not set the ' + role + ' font', error)
        }
      }
      const px = Number(recipe?.type?.[role])
      if (Number.isFinite(px) && typeof theme.setFontSize === 'function') {
        try {
          theme.setFontSize(role, Math.round(px))
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('[dsh-fitout] could not set the ' + role + ' size', error)
        }
      }
    }
  }
  let fontBaseline = null

  const syncFonts = (recipe) => {
    // Remember what the app had before the first recipe landed, so turning the
    // layer off can put it back instead of leaving our fonts behind.
    if (fontBaseline === null) {
      try {
        const snapshot = theme.getTheme()
        if (snapshot !== undefined && snapshot !== null) {
          fontBaseline = { font: { ...snapshot.fontFamilies }, type: { ...snapshot.fontSizes } }
        }
      } catch {
        /* no snapshot: nothing worth restoring */
      }
    }
    writeFonts(recipe)
  }
  bindFontSync(syncFonts)
  bindFontRestore(() => {
    if (fontBaseline === null) return
    const baseline = fontBaseline
    fontBaseline = null
    writeFonts(baseline)
  })

  // The panel needs the fonts that are actually in effect, not the ones this
  // record wishes for: the Appearance page can change them behind our back.
  ctx.effect(() => {
    const read = () => {
      try {
        const snapshot = theme.getTheme()
        if (snapshot !== undefined && snapshot !== null) {
          pushLiveFonts(snapshot.fontFamilies, snapshot.fontSizes)
        }
      } catch {
        /* a host without font settings keeps the shipped defaults */
      }
    }
    read()
    if (typeof ctx.on !== 'function') return () => {}
    const off = ctx.on('theme/change', read)
    return typeof off === 'function' ? off : () => {}
  }, 'dsh-fitout: live fonts')

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
      document.documentElement.classList.remove(
        'fto-underline-links', 'fto-dense-sidebar', 'fto-has-wallpaper',
        'fto-glass-cards', 'fto-glass-all', 'fto-lh-tight', 'fto-lh-loose',
      )
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
