/** Font choices, and a mirror of the app's live type settings.
 *
 * Two jobs, both of them about not guessing:
 *
 *   1. Offer fonts by name. A bare text box asks people to recall a CSS list
 *      from memory and to spell it right; a list of stacks does not.
 *   2. Hold the *live* font settings, mirrored from `theme/change`, so the panel
 *      can show what is actually in effect right now and tell a preset from a
 *      hand edit made in the app's own Appearance page.
 *
 * Every stack ends in a generic family, so an uninstalled name degrades to
 * something sensible instead of falling off the end of the list.
 */
import { TYPE_DEFAULTS, normalizeFont } from './store.js'

/** Role-agnostic font list. `kind` says which role may use the entry.
 *
 * Every stack is normalized on the way in, so it can be compared with what the
 * app stores and echo back as a selected `<option>` value.
 */
const RAW_CHOICES = [
  // --- text faces -----------------------------------------------------------
  // Shipping macOS families first; the ones a user has to install are marked so
  // the list never pretends to offer something the machine cannot render.
  { id: 'app', kind: 'text', label: '系统默认', stack: '' },
  { id: 'pingfang', kind: 'text', label: '苹方', stack: '"PingFang SC", "Helvetica Neue", sans-serif' },
  { id: 'hiragino', kind: 'text', label: '冬青黑体', stack: '"Hiragino Sans GB", "PingFang SC", sans-serif' },
  { id: 'songti', kind: 'text', label: '宋体', stack: '"Songti SC", "Source Han Serif SC", "Georgia", serif' },
  { id: 'kaiti', kind: 'text', label: '楷体', stack: '"Kaiti SC", "STKaiti", serif' },
  { id: 'yuanti', kind: 'text', label: '圆体', stack: '"Yuanti SC", "Hiragino Maru Gothic ProN", sans-serif' },
  { id: 'helvetica', kind: 'text', label: 'Helvetica Neue', stack: '"Helvetica Neue", "Helvetica", "Arial", sans-serif' },
  { id: 'avenir', kind: 'text', label: 'Avenir Next', stack: '"Avenir Next", "Helvetica Neue", sans-serif' },
  { id: 'seravek', kind: 'text', label: 'Seravek', stack: '"Seravek", "Helvetica Neue", sans-serif' },
  { id: 'ptsans', kind: 'text', label: 'PT Sans', stack: '"PT Sans", "Helvetica Neue", sans-serif' },
  { id: 'charter', kind: 'text', label: 'Charter', stack: '"Charter", "Georgia", serif' },
  { id: 'iowan', kind: 'text', label: 'Iowan Old Style', stack: '"Iowan Old Style", "Georgia", serif' },
  { id: 'hoefler', kind: 'text', label: 'Hoefler Text', stack: '"Hoefler Text", "Georgia", serif' },
  { id: 'georgia', kind: 'text', label: 'Georgia', stack: '"Georgia", "Times New Roman", serif' },
  { id: 'sourcehan', kind: 'text', label: '思源黑体（需安装）', stack: '"Source Han Sans SC", "Noto Sans CJK SC", "PingFang SC", sans-serif' },
  { id: 'notoserif', kind: 'text', label: '思源宋体（需安装）', stack: '"Noto Serif CJK SC", "Songti SC", "Georgia", serif' },
  { id: 'lxgw', kind: 'text', label: '霞鹜文楷（需安装）', stack: '"LXGW WenKai", "Kaiti SC", "STKaiti", serif' },

  // --- monospace faces ------------------------------------------------------
  { id: 'app-mono', kind: 'mono', label: '系统等宽', stack: '' },
  { id: 'systemmono', kind: 'mono', label: '系统 UI 等宽', stack: 'ui-monospace, "Menlo", monospace' },
  { id: 'menlo', kind: 'mono', label: 'Menlo', stack: '"Menlo", "Monaco", monospace' },
  { id: 'monaco', kind: 'mono', label: 'Monaco', stack: '"Monaco", "Menlo", monospace' },
  { id: 'courier', kind: 'mono', label: 'Courier New', stack: '"Courier New", "Courier", monospace' },
  { id: 'ptmono', kind: 'mono', label: 'PT Mono', stack: '"PT Mono", "Menlo", monospace' },
  { id: 'andale', kind: 'mono', label: 'Andale Mono', stack: '"Andale Mono", "Menlo", monospace' },
  // Installed as the Nerd Font patch on this machine; the stock name stays as a
  // fallback for anyone who has the plain release.
  { id: 'jetbrains', kind: 'mono', label: 'JetBrains Mono', stack: '"JetBrainsMono Nerd Font", "JetBrains Mono", "Menlo", monospace' },
  { id: 'firacode', kind: 'mono', label: 'Fira Code（需安装）', stack: '"Fira Code", "Menlo", monospace' },
  { id: 'maple', kind: 'mono', label: 'Maple Mono（需安装）', stack: '"Maple Mono", "Menlo", monospace' },
  { id: 'cascadia', kind: 'mono', label: 'Cascadia Code（需安装）', stack: '"Cascadia Code", "Consolas", monospace' },
  { id: 'consolas', kind: 'mono', label: 'Consolas（需安装）', stack: '"Consolas", "Menlo", monospace' },
]

export const FONT_CHOICES = Object.freeze(RAW_CHOICES.map((choice) => Object.freeze({
  ...choice,
  stack: normalizeFont(choice.stack),
})))

/** The stack behind one catalogue id; '' for the app default. */
export function fontStack(id) {
  const choice = FONT_CHOICES.find((entry) => entry.id === id)
  return choice === undefined ? '' : choice.stack
}

/** The choices that make sense for one role. */
export function choicesFor(role) {
  return FONT_CHOICES.filter((choice) => (role === 'text' ? choice.kind === 'text' : choice.kind === 'mono'))
}

/** A short label for a stack: its catalogue name, or its first family. */
export function fontLabel(stack) {
  const list = normalizeFont(stack)
  if (list === '') return '跟随 App'
  const known = FONT_CHOICES.find((choice) => choice.stack !== '' && choice.stack === list)
  if (known !== undefined) return known.label
  const first = list.split(',')[0]?.trim().replace(/^["']|["']$/gu, '') ?? ''
  return first === '' ? '自定义' : first
}

/** Sample lines for the preview strip, one per role. */
export const SAMPLES = Object.freeze({
  text: '装修一次装到位：底色、强调色、圆角、疏密、字体，只需选定一次。Aa 0123',
  code: "theme.setFontFamily('text', stack)",
  terminal: '$ npm run preview -- --tuned',
})

/* --- live mirror ----------------------------------------------------------- */

const EMPTY = Object.freeze({
  families: Object.freeze({ text: '', code: '', terminal: '' }),
  sizes: Object.freeze({ ...TYPE_DEFAULTS }),
  ready: false,
})

let live = EMPTY
const listeners = new Set()

/** Push the snapshot the app just published. */
export function pushLiveFonts(families, sizes) {
  if (families === undefined || families === null || sizes === undefined || sizes === null) return
  const next = {
    families: {
      text: String(families.text ?? ''),
      code: String(families.code ?? ''),
      terminal: String(families.terminal ?? ''),
    },
    sizes: {
      text: Number(sizes.text) || TYPE_DEFAULTS.text,
      code: Number(sizes.code) || TYPE_DEFAULTS.code,
      terminal: Number(sizes.terminal) || TYPE_DEFAULTS.terminal,
    },
    ready: true,
  }
  const same = live.ready === next.ready
    && Object.keys(next.families).every((role) => live.families[role] === next.families[role])
    && Object.keys(next.sizes).every((role) => live.sizes[role] === next.sizes[role])
  if (same) return
  live = Object.freeze(next)
  for (const listener of [...listeners]) listener()
}

export function getLiveFonts() {
  return live
}

export function subscribeLiveFonts(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
