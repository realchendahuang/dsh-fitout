/** The layout layer: twelve switchable CSS groups, plus the shared variables.
 *
 * Each section is one user-facing switch group. BASE_CSS carries the shared
 * --fto-* variables (and the plugin's own settings-row styling) and is always
 * emitted; everything else is emitted only while its group is enabled, in
 * cascade order.
 *
 * `scripts/split-sections.py` produced the first cut of this file from one
 * template literal; the template is gone and the file is edited directly now.
 */
export const BASE_CSS = `
body{
  --fto-fg1:var(--dsw-alias-label-primary,#17181a);
  --fto-fg2:var(--dsw-alias-label-secondary,#5b6070);
  --fto-fg3:var(--dsw-alias-label-tertiary,#8a8f9d);
  --fto-fg4:var(--dsw-alias-label-quaternary,color-mix(in srgb,var(--dsw-alias-label-tertiary,#8a8f9d) 62%,transparent));
  --fto-line:var(--dsw-alias-border-l1,#ebedf1);
  --fto-line2:var(--dsw-alias-border-l2,#e3e5ea);
  --fto-hover:var(--dsw-alias-interactive-bg-hover,#f2f3f6);
  --fto-bg1:var(--dsw-alias-bg-layer-1,#fff);
  --fto-bg2:var(--dsw-alias-bg-layer-2,#fbfbfc);
  --fto-bg3:var(--dsw-alias-bg-layer-3,#f2f3f6);
  --fto-code-bg:var(--dsw-alias-markdown-code-block,#1b1b1c);
  --fto-brand:var(--dsw-alias-brand-primary,#3b6df5);
  --fto-err:var(--dsw-alias-state-error-primary,#d33a3a);
  --fto-ok:var(--dsw-alias-state-success-primary,#2f9e5f);
  --fto-r-xs:4px;
  --fto-r-sm:var(--dsw-radius-sm,6px);
  --fto-r-md:var(--dsw-radius-md,8px);
  --fto-r-lg:var(--dsw-radius-lg,12px);
  /* Mono and the secondary step follow the app's own type settings: the code
     family means what the Appearance page says it means, and secondary text
     stays one pixel under whatever the body size is. */
  --fto-mono:var(--ds-font-family-code,ui-monospace,SFMono-Regular,"SF Mono",Menlo,monospace);
  --fto-fs:var(--dsh-content-font-size,14px);
  --fto-fs2:calc(var(--dsh-content-font-size,14px) - 1px);
  --fto-ease:cubic-bezier(.16,1,.3,1);
  --fto-sparkle:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path d='M8 1.2c.32 3.1 1.98 4.76 5.08 5.08v.04c-3.1.32-4.76 1.98-4.76 5.08h-.04c-.32-3.1-1.98-4.76-5.08-4.76V6.6C6.3 6.28 7.96 4.62 8 1.2z' fill='black'/></svg>");
  --fto-chevron:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path d='M6 3.5L10.5 8L6 12.5' fill='none' stroke='black' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>");
}`

const ALWAYS_TAIL = `/* ═══ 17. 设置 → 通用 里的开关行 ══════════════════════════════════════ */
.zsteps-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:24px;
  padding:16px 0;
  border-bottom:.5px solid var(--fto-line);
}
.zsteps-row:last-child{ border-bottom:0; }
.zsteps-copy{ min-width:0; display:flex; flex-direction:column; gap:2px; }
.zsteps-title{
  font-size:14px;
  line-height:20px;
  font-weight:500;
  color:var(--fto-fg1);
}
.zsteps-desc{
  font-size:12px;
  line-height:18px;
  color:var(--fto-fg3);
}
.zsteps-switch{
  flex:none;
  width:40px; height:24px;
  padding:2px;
  border:0;
  border-radius:999px;
  background:var(--fto-line2);
  cursor:pointer;
  transition:background-color .18s ease;
}
.zsteps-switch[data-on="true"]{ background:var(--fto-brand); }
.zsteps-switch:focus-visible{ outline:2px solid var(--fto-brand); outline-offset:2px; }
.zsteps-knob{
  display:block;
  width:20px; height:20px;
  border-radius:50%;
  background:#fff;
  box-shadow:0 1px 2px rgba(0,0,0,.18);
  transform:translateX(0);
  transition:transform .18s cubic-bezier(.16,1,.3,1);
}
.zsteps-switch[data-on="true"] .zsteps-knob{ transform:translateX(16px); }

/* ═══ 20. 排队消息 Dock（QueueDock）—— 用户要求：保持官方外观，勿改 ═══ */`

export const SECTIONS = Object.freeze([
  {
    id: "tools",
    title: "工具行与步骤",
    desc: "步骤行与工具行的字号、颜色、行尾箭头、入场动效和缩进。",
    css: `/* ═══ 1. 工具行 ═══════════════════════════════════════════════════════ */
/* 不给行设固定高度：官方每个组件按自己的公式定高（思考行是 24px + 字号增量，
   外层还带 contain:size），我们塞一个更大的高度会让文字溢出压到下一行。 */
[data-disclosure-row]{
  margin:0 -6px;
  padding:0 6px;
  border-radius:var(--fto-r-sm);
  transition:background-color .16s ease;
}
[data-disclosure-row]:hover{ background:var(--fto-hover); }
[data-disclosure-row] [class*="_leading"]{ color:var(--fto-fg3); margin-right:8px; }
[data-disclosure-row] [class*="_leading"] svg{ width:15px; height:15px; }
[data-disclosure-row] [class*="_title"]{
  font-size:var(--fto-fs);
  font-weight:500;
  color:var(--fto-fg3);
  letter-spacing:.01em;
}
[data-disclosure-row] [class*="_summary"],
[data-disclosure-row] [class*="_fileLink"]{
  font-size:var(--fto-fs);
  color:var(--fto-fg3);
}
[data-disclosure-row] [class*="_fileLink"]{ color:var(--fto-fg2); }
[data-disclosure-row] [class*="_summary"]:not([data-streaming]){
  -webkit-mask-image:linear-gradient(to right,#000 calc(100% - 18px),transparent);
  mask-image:linear-gradient(to right,#000 calc(100% - 18px),transparent);
}
/* 思考行流式中：标题变「思考中」并扫光（ZCode 的 animated-gradient-text） */
[data-variant="think"]:has([class*="_summary"][data-streaming]) [class*="_title"]{
  background-image:linear-gradient(90deg,currentColor 0%,color-mix(in srgb,currentColor 30%,transparent) 45%,currentColor 90%);
  background-size:220% 100%;
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
  animation:fto-text-sweep 2.2s linear infinite;
}
[data-variant="think"]:has([class*="_summary"][data-streaming]) [class*="_title"]:lang(zh)::after{ content:"中"; }
@keyframes fto-text-sweep{ from{background-position:120% 0;} to{background-position:-120% 0;} }
[data-disclosure-row] [class*="_fileLink"]{
  text-decoration-color:var(--fto-fg4);
  text-underline-offset:3px;
}
[data-disclosure-row] [class*="_fileLink"]:hover{ color:var(--fto-fg2); }
[data-disclosure-row] [class*="_summarySuffix"]{
  font-size:var(--fto-fs2);
  color:var(--fto-fg4);
  margin-left:8px;
  font-variant-numeric:tabular-nums;
}
[data-disclosure-row] [class*="_sep"],
[data-disclosure-row] [class*="_separator"]{
  width:3px; height:3px; margin:0 7px;
  background:var(--fto-fg4); border-radius:50%;
}
/* 行尾箭头取代内置的「图标淡出成箭头」：静止不可见，悬浮/展开才出现 */
[data-disclosure-row] [class*="_chevronHover"]{ display:none; }
[data-disclosure-row][data-expandable="true"]::after{
  content:"";
  flex:none;
  width:14px; height:14px;
  margin-left:6px;
  background-color:var(--fto-fg3);
  -webkit-mask:var(--fto-chevron) center/contain no-repeat;
  mask:var(--fto-chevron) center/contain no-repeat;
  opacity:0;
  transition:opacity .2s ease-out,transform .2s ease-out;
}
[data-disclosure-row][data-expandable="true"]:hover::after{ opacity:.6; }
[data-disclosure-row][aria-expanded="true"]::after{ opacity:.9; transform:rotate(90deg); }

/* 运行中的行：靠内置 data-shimmer 扫光，与 ZCode 的 animated-gradient-text 一致 */
:is([data-tool],[data-variant])[data-state="running"] [class*="_title"]{
  color:var(--fto-fg2);
}

/* 思考行比工具行低一级：它只是过程注脚 */
[data-chat-flow-kind="assistant-step"] [data-disclosure-row] [class*="_title"]{
  color:var(--fto-fg3);
  font-weight:500;
}

/* 失败态只染文字 */
:is([data-tool],[data-variant])[data-state="error"] [class*="_title"],
:is([data-tool],[data-variant])[data-state="error"] [class*="_summary"],
:is([data-tool],[data-variant])[data-state="error"] [class*="_fileLink"]{ color:var(--fto-err); }
:is([data-tool],[data-variant])[data-state="error"] [class*="_leading"]{ color:var(--fto-err); }
:is([data-tool],[data-variant]) [class*="_diffAdded"]{ color:var(--fto-ok); }
:is([data-tool],[data-variant]) [class*="_diffRemoved"]{ color:var(--fto-err); }

/* 入场：淡入 + 2px 上浮，挂载时只播一次 */
@media (prefers-reduced-motion:no-preference){
  :is([data-tool],[data-variant]){
    animation:fto-row-in .9s var(--fto-ease) both;
  }
}
@keyframes fto-row-in{ from{opacity:0;transform:translateY(2px);} to{opacity:1;transform:none;} }

/* 展开体缩进到标题文字下方，而不是顶到图标左边 */
[data-disclosure-row] ~ div [class*="_bodyWrap"],
[data-disclosure-row] ~ div[class*="_bodyWrap"]{
  padding-left:23px;
  padding-top:2px;
}

/* ═══ 2. 嵌套子调用：唯一画竖线的地方 ═════════════════════════════════ */
[data-subcalls]{
  margin:2px 0 2px 8px;
  padding-left:14px;
  border-left:1px solid var(--fto-line);
}`,
  },
  {
    id: "disclosures",
    title: "折叠头",
    desc: "步骤折叠头的图标、状态点和详情小标题。",
    css: `/* ═══ 3. 步骤折叠头 ═══════════════════════════════════════════════════ */
[data-step-process] > div:first-child{
  border-radius:var(--fto-r-sm);
  margin:0 -6px;
  padding:0 6px;
  transition:background-color .16s ease;
}
[data-step-process] > div:first-child:hover{ background:var(--fto-hover); }
[data-step-process] button[data-process-activity]{
  width:100%;
  gap:8px;
  padding:0;
  font-size:var(--fto-fs);
  font-weight:500;
  color:var(--fto-fg2);
}
[data-step-process] button[data-process-activity]:hover{ color:var(--fto-fg1); }
[data-step-process] [data-step-process-icon]{ color:var(--fto-fg3); display:inline-flex; }
[data-step-process] [data-step-process-icon] svg{ width:15px; height:15px; }
[data-step-process] [data-step-process-chevron]{ display:none; }
[data-step-process] button[data-process-activity]::after{
  content:"";
  flex:none;
  width:14px; height:14px;
  margin-left:auto;
  background-color:var(--fto-fg3);
  -webkit-mask:var(--fto-chevron) center/contain no-repeat;
  mask:var(--fto-chevron) center/contain no-repeat;
  opacity:.3;
  transition:opacity .2s ease-out,transform .2s ease-out;
}
[data-step-process] button[data-process-activity]:hover::after{ opacity:.8; }
[data-step-process] button[aria-expanded="true"]::after{ opacity:.65; transform:rotate(90deg); }
[data-step-process] [data-step-process-body]{ padding-top:4px; }
[data-step-process] [data-step-process-content]{ --dsh-chat-flow-gap:4px; }

/* 「思考」的内置图标像一个带叉的方框，换成干净的星芒，两处统一 */
[data-process-activity="thinking"] [data-step-process-icon] svg{ display:none; }
[data-process-activity="thinking"] [data-step-process-icon]::before{
  content:"";
  width:15px; height:15px;
  display:block;
  background-color:currentColor;
  -webkit-mask:var(--fto-sparkle) center/contain no-repeat;
  mask:var(--fto-sparkle) center/contain no-repeat;
}
[data-variant="think"] [class*="_iconIdle"] svg{ display:none; }
[data-variant="think"] [class*="_iconIdle"]::before{
  content:"";
  width:15px; height:15px;
  display:block;
  background-color:currentColor;
  -webkit-mask:var(--fto-sparkle) center/contain no-repeat;
  mask:var(--fto-sparkle) center/contain no-repeat;
}

/* 该步骤里还有工具在跑：图标点一点品牌色，作为「此刻」的唯一彩色信号 */
[data-step-process]:has([data-state="running"]) button[data-process-activity]{ color:var(--fto-fg1); }
[data-step-process]:has([data-state="running"]) [data-step-process-icon]{ color:var(--fto-brand); }
[data-step-process]:has([data-state="running"]) [data-step-process-icon] svg{ animation:fto-live-pulse 2.4s ease-in-out infinite; }
@keyframes fto-live-pulse{ 0%,100%{opacity:1;} 50%{opacity:.55;} }

/* 通用详情视图：小标题、条目、徽标、字段名 */
[data-caption="true"][data-inspect="true"] [class*="_caption"]{
  font-size:11px;
  font-weight:500;
  letter-spacing:.06em;
  color:var(--fto-fg4);
  margin:6px 0 2px;
}
[data-caption="true"][data-inspect="true"] [class*="_item"]{
  padding:10px 0 2px;
  border-top:.5px solid var(--fto-line);
  margin-top:8px;
}
[data-caption="true"][data-inspect="true"] [class*="_item"]:first-child{ border-top:0; margin-top:2px; padding-top:2px; }
[data-caption="true"][data-inspect="true"] [class*="_text"]{
  font-size:13.5px;
  font-weight:500;
  color:var(--fto-fg1);
}
[data-caption="true"][data-inspect="true"] [class*="_badge"]{
  font-size:11px;
  line-height:16px;
  padding:1px 7px;
  border-radius:var(--fto-r-xs);
  background:var(--fto-bg3);
  color:var(--fto-fg2);
}
[data-caption="true"][data-inspect="true"] [class*="_badge"][data-tone="warning"]{ color:var(--dsw-alias-state-warn-primary,#c8860d); }
[data-caption="true"][data-inspect="true"] [class*="_description"]{
  font-size:13px;
  line-height:1.65;
  color:var(--fto-fg2);
  margin:4px 0 0;
}
[data-caption="true"][data-inspect="true"] [class*="_field"]{ font-size:12.5px; color:var(--fto-fg3); }`,
  },
  {
    id: "prose",
    title: "正文排版",
    desc: "答案正文的段落、标题、列表、引用与表格。",
    css: `/* ═══ 5. 正文排版（assistant 答案） ═══════════════════════════════════ */
[class*="_markdown_"]{
  font-size:var(--fto-fs);
  line-height:1.75;
  letter-spacing:.004em;
}
[class*="_markdown_"] p{ margin:0 0 14px; }
[class*="_markdown_"] p:last-child{ margin-bottom:0; }
[class*="_markdown_"] :is(h1,h2,h3,h4,h5,h6){
  font-weight:600;
  letter-spacing:-.012em;
  color:var(--fto-fg1);
}
[class*="_markdown_"] h1{ font-size:calc(var(--fto-fs) + 4px); line-height:1.3; margin:28px 0 12px; }
[class*="_markdown_"] h2{ font-size:calc(var(--fto-fs) + 2px); line-height:1.4; margin:26px 0 10px; }
[class*="_markdown_"] h3{ font-size:var(--fto-fs); line-height:1.5; margin:22px 0 8px; }
[class*="_markdown_"] :is(h4,h5,h6){ font-size:var(--fto-fs); margin:18px 0 6px; }
[class*="_markdown_"] :is(h1,h2,h3,h4,h5,h6):first-child{ margin-top:2px; }
[class*="_markdown_"] :is(ul,ol){ margin:12px 0 14px; }
[class*="_markdown_"] li{ margin:3px 0; }
[class*="_markdown_"] li::marker{ color:var(--fto-fg3); }
[class*="_markdown_"] strong{ font-weight:600; }
[class*="_markdown_"] a{
  color:var(--fto-brand);
  text-decoration:underline;
  text-decoration-style:dotted;
  text-decoration-thickness:1px;
  text-underline-offset:3px;
}
[class*="_markdown_"] a:hover{ text-decoration-style:solid; }
[class*="_markdown_"] :is(p,li,td) code{
  font-family:var(--fto-mono);
  font-size:calc(var(--fto-fs) - 2px);
  background:var(--fto-bg3);
  border-radius:var(--fto-r-xs);
  padding:1px 5px;
  color:var(--fto-fg1);
}
[class*="_markdown_"] blockquote{
  margin:14px 0;
  padding:2px 0 2px 14px;
  border-left:2px solid var(--fto-line2);
  color:var(--fto-fg2);
}
[class*="_markdown_"] hr{
  margin:22px 0;
  border:none;
  height:.5px;
  background:var(--fto-line);
}

/* ═══ 6. 表格 ═════════════════════════════════════════════════════════ */
[class*="_markdown_"] table{ font-size:var(--fto-fs); }
[class*="_markdown_"] th{
  font-size:calc(var(--fto-fs) - 1px);
  font-weight:500;
  color:var(--fto-fg3);
  padding:8px 16px 8px 0;
  border-bottom:.5px solid var(--fto-line2);
  background:transparent;
  white-space:nowrap;
}
[class*="_markdown_"] td{
  font-size:var(--fto-fs);
  padding:9px 16px 9px 0;
  border-bottom:.5px solid var(--fto-line);
  vertical-align:top;
  line-height:1.6;
}
[class*="_markdown_"] tbody tr{ transition:background-color .12s ease; }
[class*="_markdown_"] tbody tr:hover{ background:var(--fto-hover); }`,
  },
  {
    id: "code",
    title: "代码块",
    desc: "代码块的底色、圆角、标题栏和复制按钮。",
    css: `/* ═══ 7. 代码块 ═══════════════════════════════════════════════════════ */
.md-code-block{
  border-radius:12px !important;
  border:.5px solid var(--fto-line) !important;
  background:var(--fto-code-bg) !important;
  margin:16px 0 14px !important;
  overflow:hidden;
}
.md-code-block [data-code-block-banner="true"]{
  background:transparent !important;
  border-bottom:.5px solid rgba(255,255,255,.08) !important;
}
.md-code-block [class*="_bannerWrap_"]{ background:transparent !important; }
.md-code-block [data-code-block-banner="true"]{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:7px 12px 7px 14px;
  border-bottom:.5px solid var(--fto-line);
}
.md-code-block [data-code-block-banner="true"] span[class*="_language"]{
  font-family:var(--fto-mono);
  font-size:11px;
  letter-spacing:.02em;
  color:rgba(255,255,255,.5);
  text-transform:lowercase;
}
.md-code-block [data-code-block-banner="true"] button{
  color:rgba(255,255,255,.55);
  opacity:.7;
  transition:opacity .16s ease,color .16s ease;
}
.md-code-block:hover [data-code-block-banner="true"] button,
.md-code-block [data-code-block-banner="true"] button:focus-visible{ opacity:1; }
.md-code-block [data-code-block-banner="true"] button:hover{ color:var(--fto-fg1); }
.md-code-block pre{
  font-size:calc(var(--fto-fs) - 1px) !important;
  line-height:1.7 !important;
  padding:12px 16px 14px !important;
  background:transparent !important;
}`,
  },
  {
    id: "messages",
    title: "消息与状态",
    desc: "用户气泡、消息操作行、运行与等待状态。",
    css: `/* ═══ 8. 用户气泡 ═════════════════════════════════════════════════════ */
[class*="_bubble"]{
  border-radius:12px !important;
  border-top-right-radius:4px !important;
  padding:10px 14px !important;
  font-size:var(--fto-fs) !important;
  line-height:1.7 !important;
}
[class*="_bubble"] :is(p,li){ margin-bottom:6px; }
[class*="_bubble"] > :last-child{ margin-bottom:0; }

/* ═══ 9. 消息操作行 / 运行状态行 ══════════════════════════════════════ */
[data-chat-flow-kind="turn-tail"] [class*="_actions"] button{
  color:var(--fto-fg3);
  transition:color .16s ease;
}
[data-chat-flow-kind="turn-tail"] [class*="_actions"] button:hover{ color:var(--fto-fg1); }
[data-chat-running]{
  gap:10px;
  font-size:var(--fto-fs2);
  color:var(--fto-fg3);
  font-variant-numeric:tabular-nums;
}
[data-chat-running] [class*="_runningContent"]{ gap:10px; align-items:center; }
[data-chat-running] [class*="_runningDivider"]{ margin:8px 0 10px; }
/* 3×3 像素轨道 loader：8 个暗格 + 1 个绕圈亮格（ZCode chat-loading） */
[data-chat-running] [class*="_runningIcon"]{
  width:13px; height:13px;
  position:relative;
  color:var(--fto-fg2);
  display:inline-flex; align-items:flex-start; justify-content:flex-start;
}
[data-chat-running] [class*="_runningIcon"] > *{ display:none !important; }
[data-chat-running] [class*="_runningIcon"]::before{
  content:"";
  position:absolute; left:0; top:0;
  width:3px; height:3px;
  border-radius:1px;
  background:currentColor;
  opacity:.15;
  box-shadow:
    4.6px 0 0 currentColor,
    9.2px 0 0 currentColor,
    9.2px 4.6px 0 currentColor,
    9.2px 9.2px 0 currentColor,
    4.6px 9.2px 0 currentColor,
    0 9.2px 0 currentColor,
    0 4.6px 0 currentColor,
    4.6px 4.6px 0 color-mix(in srgb,currentColor 40%,transparent);
}
[data-chat-running] [class*="_runningIcon"]::after{
  content:"";
  position:absolute; left:0; top:0;
  width:3px; height:3px;
  border-radius:1px;
  background:currentColor;
  animation:fto-pixel-orbit 1.5s steps(8,end) infinite;
}
@keyframes fto-pixel-orbit{
  0%{ transform:translate(0,0) }
  12.5%{ transform:translate(4.6px,0) }
  25%{ transform:translate(9.2px,0) }
  37.5%{ transform:translate(9.2px,4.6px) }
  50%{ transform:translate(9.2px,9.2px) }
  62.5%{ transform:translate(4.6px,9.2px) }
  75%{ transform:translate(0,9.2px) }
  87.5%{ transform:translate(0,4.6px) }
  100%{ transform:translate(0,0) }
}
@media (prefers-reduced-motion:reduce){
  [data-chat-running] [class*="_runningIcon"]::after{ animation:none; }
  [data-variant="think"]:has([class*="_summary"][data-streaming]) [class*="_title"]{ animation:none; background:none; color:var(--fto-fg3); }
}
/* 重试 / 失败等等待类节点 */
[data-chat-flow-kind="model-retry"]{ font-size:var(--fto-fs2); color:var(--dsw-alias-state-warn-primary,#c8860d); }
[data-chat-flow-kind="turn-error"]{ font-size:var(--fto-fs2); }
[data-chat-flow-kind="turn-error"] [class*="_title"],
[data-chat-flow-kind="turn-error"] [class*="_summary"]{ color:var(--fto-err); }
[class*="_stopped"]{
  font-size:var(--fto-fs2) !important;
  color:var(--fto-fg3) !important;
}`,
  },
  {
    id: "polish",
    title: "全局细节",
    desc: "滚动条与键盘焦点环。",
    css: `/* ═══ 10. 滚动条：细、半透明、悬浮才清晰 ═════════════════════════════ */
[class*="_scrollBody"]{ scrollbar-width:thin; scrollbar-color:transparent transparent; }
[class*="_scrollBody"]:hover{ scrollbar-color:var(--dsw-alias-border-stronger,#c8ccd5) transparent; }
[class*="_scrollBody"]::-webkit-scrollbar{ width:10px; }
[class*="_scrollBody"]::-webkit-scrollbar-thumb{
  background:transparent;
  border-radius:8px;
  border:3px solid transparent;
  background-clip:padding-box;
}
[class*="_scrollBody"]:hover::-webkit-scrollbar-thumb{
  background:color-mix(in srgb,var(--dsw-alias-label-tertiary,#8a8f9d) 45%,transparent);
  background-clip:padding-box;
}

/* ═══ 18. 键盘可达性：整行可点，也要有清楚的焦点环 ════════════════════ */
[data-disclosure-row]:focus-visible,
[data-step-process] button[data-process-activity]:focus-visible,
[data-changed-files] [class*="_header"]:focus-visible{
  outline:none !important;
  box-shadow:0 0 0 2px color-mix(in srgb,var(--fto-brand) 55%,transparent);
  border-radius:var(--fto-r-sm);
}
[data-disclosure-row]:focus-visible,
[data-step-process] button[data-process-activity]:focus-visible{
  background:var(--fto-hover);
}
[data-disclosure-row]:focus-visible::after,
[data-step-process] button[data-process-activity]:focus-visible::after{
  opacity:.9 !important;
}
@media (prefers-reduced-motion:reduce){
  :is([data-tool],[data-variant]){ animation:none !important; }
  [data-step-process]:has([data-state="running"]) [data-step-process-icon] svg{ animation:none !important; }
  .zsteps-knob{ transition:none !important; }
}`,
  },
  {
    id: "composer",
    title: "输入框",
    desc: "输入框的圆角、内边距和底部工具栏。",
    css: `/* ═══ 11. 输入框（composer） ═══════════════════════════════════════════ */
[data-composer-card]{
  border-radius:16px !important;
  border:.5px solid var(--fto-line2) !important;
  box-shadow:0 1px 2px rgba(0,0,0,.03),0 8px 24px -12px rgba(0,0,0,.08) !important;
  transition:border-color .16s ease,box-shadow .16s ease !important;
}
[data-composer-card]:focus-within{
  border-color:color-mix(in srgb,var(--fto-brand) 45%,var(--fto-line2)) !important;
  box-shadow:0 1px 2px rgba(0,0,0,.03),0 8px 28px -14px rgba(0,0,0,.12) !important;
}
[data-composer-placeholder]{ font-size:14px !important; color:var(--fto-fg3) !important; }
[data-composer-input]{ font-size:var(--fto-fs) !important; line-height:1.7 !important; }`,
  },
  {
    id: "sidebar",
    title: "侧栏",
    desc: "侧栏会话行与项目行的高度、字号和选中态。",
    css: `/* ═══ 12. 侧栏：会话行与项目行 ═════════════════════════════════════════ */
[class*="_sessionRow"], [class*="_projectRow"]{
  height:32px;
  border-radius:8px !important;
  transition:background-color .14s ease;
}
[class*="_sessionRow"]:hover, [class*="_projectRow"]:hover{ background:var(--fto-hover) !important; }
[class*="_sessionRow"] [class*="_title"], [class*="_projectRow"] [class*="_title"]{
  font-size:13.5px;
  letter-spacing:.005em;
}
[class*="_sessionRow"][class*="_selected"]{ background:color-mix(in srgb,var(--fto-fg1) 6%,transparent) !important; }
[class*="_sessionRow"][class*="_selected"] [class*="_title"]{ font-weight:500; }`,
  },
  {
    id: "chrome",
    title: "顶部页签",
    desc: "会话页签与「加载更早」区域。",
    css: `/* ═══ 13. 顶部页签 / 加载更早 ══════════════════════════════════════════ */
[role="tab"]{
  font-size:13px;
  font-weight:500;
  color:var(--fto-fg3);
  transition:color .16s ease;
}
[role="tab"]:hover{ color:var(--fto-fg1); }
[role="tab"][aria-selected="true"]{ color:var(--fto-brand); }`,
  },
  {
    id: "detail",
    title: "展开详情",
    desc: "diff / 终端 / 读取 / 搜索等展开块，以及本轮变更汇总卡。",
    css: `/* ═══ 14. 工具展开详情里的各类块（diff / 终端 / 代码 / 读取 / 搜索） ═════ */
:is([data-tool],[data-variant]) [class*="_bodyWrap"] > [class*="_card"]{
  border-radius:12px !important;
  border:.5px solid var(--fto-line) !important;
  background:var(--fto-bg2) !important;
  margin:6px 0 6px 0 !important;
  overflow:hidden;
}
:is([data-tool],[data-variant]) [class*="_bodyWrap"] [data-code-block-banner="true"]{
  background:transparent !important;
  border-bottom:.5px solid var(--fto-line) !important;
  padding:8px 12px 8px 14px !important;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}
:is([data-tool],[data-variant]) [class*="_bodyWrap"] [data-code-block-banner="true"] span[class*="_language"]{
  font-family:var(--fto-mono);
  font-size:11px;
  letter-spacing:.02em;
  color:var(--fto-fg3);
  text-transform:lowercase;
}
:is([data-tool],[data-variant]) [class*="_bodyWrap"] [data-code-block-banner="true"] button{
  color:var(--fto-fg3);
  opacity:.6;
  transition:opacity .16s ease,color .16s ease;
}
:is([data-tool],[data-variant]) [class*="_bodyWrap"] [data-code-block-banner="true"] button:hover{ opacity:1; color:var(--fto-fg1); }

/* 行（diff / 终端 / 代码共用）：等宽 12.5px、行高 1.7，左右 14px */
:is([data-tool],[data-variant]) [class*="_bodyWrap"] [class*="_line"]{
  font-family:var(--fto-mono);
  font-size:calc(var(--fto-fs2) - 0.5px);
  line-height:1.72;
  padding-left:14px;
  padding-right:14px;
}
:is([data-tool],[data-variant]) [class*="_bodyWrap"] [class*="_body_"]{
  font-size:calc(var(--fto-fs2) - 0.5px);
  padding:8px 0 10px !important;
  max-height:280px;
}
:is([data-tool],[data-variant]) [class*="_bodyWrap"] [class*="_path"]{
  color:var(--fto-fg4);
  font-size:11.5px;
  padding:2px 14px 6px !important;
  border-bottom:.5px solid var(--fto-line);
  margin-bottom:4px;
}
:is([data-tool],[data-variant]) [class*="_bodyWrap"] [class*="_add"]{
  background:color-mix(in srgb,var(--fto-ok) 9%,transparent) !important;
  color:var(--fto-ok) !important;
}
:is([data-tool],[data-variant]) [class*="_bodyWrap"] [class*="_remove"]{
  background:color-mix(in srgb,var(--fto-err) 9%,transparent) !important;
  color:var(--fto-err) !important;
}
:is([data-tool],[data-variant]) [class*="_bodyWrap"] [class*="_expand"]{
  font-size:11.5px;
  color:var(--fto-fg3);
  border-radius:999px;
  padding:2px 10px !important;
  background:var(--fto-bg3);
  transition:background-color .16s ease,color .16s ease;
}
:is([data-tool],[data-variant]) [class*="_bodyWrap"] [class*="_expand"]:hover{
  background:var(--fto-hover);
  color:var(--fto-fg1);
}
/* 「查看完整调用」小胶囊：弱化，悬浮整行才出现 */
[class*="_inspectButton"]{
  font-size:11px !important;
  color:var(--fto-fg3) !important;
  background:var(--fto-bg1) !important;
  border:.5px solid var(--fto-line2) !important;
  border-radius:999px !important;
  padding:2px 9px !important;
  transition:opacity .16s ease,color .16s ease,background-color .16s ease;
}
[class*="_inspectButton"]:hover{ color:var(--fto-fg1) !important; background:var(--fto-hover) !important; }

/* ═══ 15. 本轮变更汇总卡（已编辑 N 个文件） ═══════════════════════════ */
[data-changed-files]{
  border-radius:12px !important;
  border:.5px solid var(--fto-line) !important;
  background:var(--fto-bg1) !important;
  overflow:hidden;
  box-shadow:none !important;
}
[data-changed-files] [class*="_header"]{
  padding:9px 14px !important;
  gap:10px;
  transition:background-color .16s ease;
}
[data-changed-files] [class*="_header"]:hover{ background:var(--fto-hover); }
[data-changed-files] [class*="_tile"]{
  width:26px; height:26px;
  border-radius:var(--fto-r-md) !important;
  display:inline-flex; align-items:center; justify-content:center;
  background:color-mix(in srgb,var(--fto-brand) 12%,transparent) !important;
  color:var(--fto-brand) !important;
}
[data-changed-files] [class*="_tile"] svg{ width:14px; height:14px; }
[data-changed-files] [class*="_title"]{
  font-size:var(--fto-fs2) !important;
  font-weight:500 !important;
  color:var(--fto-fg1) !important;
  letter-spacing:.005em;
}
[data-changed-files] [class*="_stat"]{
  font-family:var(--fto-mono);
  font-size:11px !important;
  font-variant-numeric:tabular-nums;
  gap:6px;
}
[data-changed-files] [class*="_previewHint"]{ font-size:10.5px !important; color:var(--fto-fg4) !important; }
[data-changed-files] [class*="_row"]{
  height:30px !important;
  padding:4px 14px !important;
  font-size:calc(var(--fto-fs2) - 1px) !important;
  color:var(--fto-fg3) !important;
  transition:background-color .14s ease;
}
[data-changed-files] [class*="_row"]:hover{ background:var(--fto-hover) !important; }
[data-changed-files] [class*="_path"]{ font-size:calc(var(--fto-fs2) - 0.5px) !important; color:var(--fto-fg2) !important; }
[data-changed-files] li + li{ border-top:.5px solid var(--fto-line); }`,
  },
  {
    id: "actions",
    title: "答案操作行",
    desc: "答案下方的复制、点赞、分享与用量操作行。",
    css: `/* ═══ 16. 答案下方的操作行（复制/点赞/分享/用量） ═════════════════════ */
[data-chat-flow-kind="turn-tail"] [class*="_actions"]{
  gap:2px;
  align-items:center;
}
[data-chat-flow-kind="turn-tail"] [class*="_actions"] button{
  width:26px; height:26px;
  border-radius:999px;
  color:var(--fto-fg3) !important;
  transition:background-color .14s ease,color .14s ease;
}
[data-chat-flow-kind="turn-tail"] [class*="_actions"] button:hover{
  background:var(--fto-hover);
  color:var(--fto-fg1) !important;
}
[data-chat-flow-kind="turn-tail"] [class*="_actions"] span{
  font-size:12px;
  color:var(--fto-fg4);
  font-variant-numeric:tabular-nums;
}`,
  },
  {
    id: "cards",
    title: "清单与目标",
    desc: "任务清单卡与目标条。",
    css: `/* ═══ 19. 任务清单卡（TodoPanel）═════════════════════════════════════ */
[class*="_root"][aria-label="任务"]{
  border-radius:12px !important;
  border:.5px solid var(--fto-line) !important;
  background:var(--fto-bg1) !important;
  box-shadow:0 1px 2px rgba(0,0,0,.03),0 8px 24px -14px rgba(0,0,0,.10) !important;
  padding:2px 2px 3px !important;
}
[class*="_root"][aria-label="任务"] [class*="_header"]{
  height:30px !important;
  padding:0 8px !important;
  gap:8px !important;
  border-radius:8px;
  transition:background-color .14s ease;
}
[class*="_root"][aria-label="任务"] [class*="_header"]:hover{ background:var(--fto-hover); }
[class*="_root"][aria-label="任务"] [class*="_lead"]{ color:var(--fto-fg4); display:inline-flex; }
[class*="_root"][aria-label="任务"] [class*="_title"]{
  font-size:13px !important;
  font-weight:500;
  color:var(--fto-fg1);
}
[class*="_root"][aria-label="任务"] [class*="_progress"]{
  font-size:12px !important;
  color:var(--fto-fg3);
  font-variant-numeric:tabular-nums;
}
[class*="_root"][aria-label="任务"] [class*="_chevron"]{
  color:var(--fto-fg4);
  opacity:.55;
  transition:opacity .2s ease-out,transform .2s ease-out;
}
[class*="_root"][aria-label="任务"] [class*="_header"]:hover [class*="_chevron"]{ opacity:.95; }
[class*="_root"][aria-label="任务"] [class*="_header"][aria-expanded="true"] [class*="_chevron"]{ transform:rotate(90deg); }
[class*="_root"][aria-label="任务"] [class*="_list"]{
  padding:0 4px 4px !important;
  gap:2px !important;
  display:flex !important;
  flex-direction:column;
}
[class*="_root"][aria-label="任务"] [class*="_item"]{
  height:26px;
  padding:2px 6px !important;
  border-radius:6px;
  gap:8px !important;
  transition:background-color .14s ease;
}
[class*="_root"][aria-label="任务"] [class*="_item"]:hover{ background:var(--fto-hover); }
[class*="_root"][aria-label="任务"] [class*="_item"] [class*="_content"]{
  font-size:13px !important;
  line-height:1.5;
  color:var(--fto-fg2);
}
[class*="_root"][aria-label="任务"] [class*="_item"][data-status="in_progress"] [class*="_content"]{ color:var(--fto-fg1); }
[class*="_root"][aria-label="任务"] [class*="_item"][data-status="completed"] [class*="_content"]{
  color:var(--fto-fg3);
  text-decoration:line-through;
  text-decoration-color:var(--fto-fg4);
}
[class*="_root"][aria-label="任务"] [class*="_item"][data-status="completed"] [class*="_glyph"]{ color:var(--fto-ok); }
[class*="_root"][aria-label="任务"] [class*="_item"][data-status="in_progress"] [class*="_glyph"]{ color:var(--fto-fg1); }
[class*="_root"][aria-label="任务"] [class*="_item"][data-status="pending"] [class*="_glyph"]{ color:var(--fto-fg4); }

/* ═══ 21. 目标条（GoalBar）════════════════════════════════════════════ */
[class*="_bar"][class*="B-froG"]{
  border-radius:12px !important;
  border:.5px solid var(--fto-line) !important;
  box-shadow:0 1px 2px rgba(0,0,0,.03),0 8px 24px -14px rgba(0,0,0,.10) !important;
}
[class*="B-froG_label"]{ font-size:12.5px !important; color:var(--fto-fg2) !important; }
[class*="B-froG_objective"]{ font-size:12.5px !important; color:var(--fto-fg3) !important; }
[class*="B-froG_iconBtn"]{ color:var(--fto-fg3) !important; }
[class*="B-froG_iconBtn"]:hover{ background:var(--fto-hover) !important; color:var(--fto-fg1) !important; }`,
  },
])

/** Full stylesheet for a disabled-id set. Unknown ids are harmless. */
export function buildCss(disabled) {
  const off = disabled instanceof Set ? disabled : new Set(disabled ?? [])
  const parts = [BASE_CSS, ALWAYS_TAIL]
  for (const section of SECTIONS) {
    if (!off.has(section.id)) parts.push(section.css)
  }
  return parts.join("\n")
}
