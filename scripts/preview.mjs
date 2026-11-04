/**
 * Render the settings page to a standalone HTML file — no DSH, no browser login.
 *
 * The plugin's own page is a pure function of the settings record, so it can be
 * server-rendered with a stub translator and a copy of the token table. This is
 * how the panel gets reviewed without running the app.
 *
 *   node scripts/preview.mjs            # collapsed
 *   node scripts/preview.mjs --tuned    # with the fine-tune section open
 *   ZOOM=0.44 node scripts/preview.mjs  # whole page on one screen
 *
 * Requires react + react-dom as dev dependencies; output lands in dist/preview.html.
 */
import { build } from 'esbuild'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const entryPath = resolve(dist, 'preview-entry.jsx')
const bundlePath = resolve(dist, 'preview.cjs')
const tuned = process.argv.includes('--tuned')

await mkdir(dist, { recursive: true })

const TRANSLATIONS = {
  'page.title': '装修', 'page.enable': '启用装修', 'page.tune': '微调',
  'page.shapeGroup': '形状', 'page.accent': '强调色', 'page.radius': '圆角',
  'page.radius_compact': '紧凑', 'page.radius_default': '标准', 'page.radius_round': '圆润',
  'page.density': '侧栏密度', 'page.density_default': '标准', 'page.density_compact': '紧凑',
  'page.appearance': '明暗', 'page.themeSystem': '跟随系统', 'page.themeLight': '浅色', 'page.themeDark': '深色',
  'page.layoutGroup': '版式', 'page.layoutAllOn': '全开', 'page.layoutAllOff': '全关',
  'page.listGroup': '列表与细节', 'page.list': '任务列表', 'page.listZcode': '分组', 'page.listNative': '官方',
  'page.chip': '项目标签', 'page.underline': '链接下划线',
  'page.brandGroup': '品牌', 'page.name': '名称', 'page.namePlaceholder': '官方品牌', 'page.icon': '图标',
  'page.iconOfficial': '官方', 'page.iconCustom': '自定义', 'page.upload': '上传图片…',
  'page.iconType': '请选择图片文件（PNG / JPEG / SVG / WebP）', 'page.iconTooLarge': '图片不能超过 256 KB',
  'page.maintainGroup': '维护', 'page.reset': '恢复默认', 'page.resetAll': '全部重置',
  'page.import': '导入主题', 'page.export': '导出当前',
  'page.importBad': '无法识别这个文件。', 'page.importDone': '已导入「{name}」',
}

await writeFile(entryPath, `import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { FitoutSettingsPage } from ${JSON.stringify(resolve(root, 'src/client/settings-page.jsx'))}
import { applyPreset, saveTheme, setAccent } from ${JSON.stringify(resolve(root, 'src/client/store.js'))}
import { PRESETS } from ${JSON.stringify(resolve(root, 'src/client/presets.js'))}

const dictionary = ${JSON.stringify(TRANSLATIONS)}
const t = (key) => dictionary[key] ?? key

applyPreset(PRESETS[0])
setAccent('violet')
saveTheme('我的紫调')

process.stdout.write(renderToStaticMarkup(
  React.createElement(FitoutSettingsPage, { t, initialTuning: ${tuned ? 'true' : 'false'} }),
))
`, 'utf8')

await build({
  entryPoints: [entryPath],
  outfile: bundlePath,
  bundle: true,
  format: 'cjs',
  platform: 'node',
  jsx: 'transform',
  external: ['react', 'react-dom/server'],
  absWorkingDir: root,
  logLevel: 'warning',
})

const markup = (await import('node:child_process')) // keep the import list tidy
  .execFileSync(process.execPath, [bundlePath], { encoding: 'utf8' })

const { TOKENS } = await import('file://' + resolve(root, 'src/client/tokens.js'))
const { CSS } = await import('file://' + resolve(root, 'src/client/styles.js'))
const { BASE_CSS } = await import('file://' + resolve(root, 'src/client/sections.js'))

const scheme = process.env.DARK === '1' ? 'dark' : 'light'
const vars = Object.entries(TOKENS).map(([name, pair]) => `  ${name}: ${pair[scheme]};`)
  .concat([
    '  --dsw-font-family: -apple-system, "SF Pro Text", "PingFang SC", sans-serif;',
    '  --dsw-font-mono: ui-monospace, "SF Mono", Menlo, monospace;',
    '  --dsh-content-font-size: 15px;',
    '  --dsh-content-font-size-secondary: 13px;',
    '  --dsw-alias-scrollbar-bg-l1: #e5e5e5;',
    '  --dsw-alias-scrollbar-hover-l1: #d4d4d4;',
    '  --dsw-alias-state-idle-primary: #d4d4d4;',
    '  --dsw-alias-switch-thumb: #ffffff;',
    '  --dsw-alias-label-primary-dimmed: #151517;',
  ]).join('\n')

const zoom = process.env.ZOOM ?? '1'
const html = `<!doctype html>
<html><head><meta charset="utf-8">
<style>
:root {
${vars}
}
html,body{margin:0;padding:0;background:${scheme === 'dark' ? '#0a0a0a' : '#f5f5f5'};font-family:var(--dsw-font-family);color:var(--dsw-alias-label-primary)}
body{padding:20px;zoom:${zoom}}
.card{max-width:720px;background:var(--dsw-alias-bg-layer-1);border-radius:12px;padding:22px 24px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
${CSS}
${BASE_CSS}
</style></head>
<body><div class="card">${markup}</div></body></html>`

const output = resolve(dist, 'preview.html')
await writeFile(output, html, 'utf8')
console.log(`preview -> ${output}`)
