/** Stylesheet injected once per page. Three groups:
 *
 *  - the General-settings row, which mirrors the shipped `.row` anatomy;
 *  - the plugin's own Settings page (segmented icon picker, inputs, preview);
 *  - three global polish rules that the token layer cannot express.
 *
 * Every color comes from a theme token, so light/dark (and the skin's own
 * palette overrides) flow through without a second palette here.
 */
export const CSS = `
.fto-row{border-bottom:.5px solid var(--dsw-alias-border-l2);display:flex;align-items:center;justify-content:space-between;gap:24px;padding:16px 0}
.fto-copy{min-width:0}
.fto-title{font-size:14px;line-height:20px;color:var(--dsw-alias-label-primary)}
.fto-desc{color:var(--dsw-alias-label-secondary);margin-top:4px;font-size:12px;line-height:18px}
.fto-switch{position:relative;flex:0 0 auto;width:40px;height:24px;padding:0;border:0;border-radius:999px;
  background:var(--dsw-alias-state-idle-primary,#d4d4d4);cursor:pointer;transition:background .16s ease}
.fto-switch[data-on="true"]{background:var(--dsw-alias-link,#0284c7)}
.fto-switch:focus-visible{outline:2px solid var(--dsw-alias-link,#0284c7);outline-offset:2px}
.fto-knob{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;
  background:var(--dsw-alias-switch-thumb,#ffffff);transition:transform .16s ease;
  box-shadow:0 1px 2px rgba(0,0,0,.18)}
.fto-switch[data-on="true"] .fto-knob{transform:translateX(16px)}

.fto-page{max-width:720px;padding:2px 0 48px;color:var(--dsw-alias-label-primary)}
.fto-pageHead{margin:0 0 4px}
.fto-pageTitle{margin:0 0 6px;font-size:19px;font-weight:650;letter-spacing:-.01em;line-height:1.3}
.fto-pageDesc{margin:0;max-width:560px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.fto-input{width:200px;height:32px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;
  background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:13px;outline:none}
.fto-input:focus{border-color:var(--dsw-alias-link,#0284c7)}
.fto-icons{display:flex;flex-direction:column;align-items:flex-end;gap:10px;min-width:0}
.fto-seg{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end}
.fto-segBtn{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 10px;border-radius:8px;
  border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);
  color:var(--dsw-alias-label-secondary);font-size:12px;cursor:pointer}
.fto-segBtn:hover{background:var(--dsw-alias-interactive-bg-hover)}
.fto-segBtn[data-on="true"]{border-color:var(--dsw-alias-link,#0284c7);color:var(--dsw-alias-label-primary);
  background:var(--dsw-alias-interactive-bg-hover)}
.fto-officialDot{width:22px;height:22px;border-radius:6px;background:var(--dsw-alias-bg-layer-3);
  border:1px dashed var(--dsw-alias-border-l3,#d4d4d4)}
.fto-uploadRow{display:flex;align-items:center;gap:10px}
.fto-btn{height:30px;padding:0 12px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);
  background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;cursor:pointer}
.fto-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}
.fto-error{color:var(--dsw-alias-state-error-primary,#dc2626);font-size:12px}
.fto-previewRow{display:flex;align-items:center;gap:16px;padding:20px 0;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.fto-previewLabel{font-size:14px;line-height:20px}
.fto-preview{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;
  background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l2)}
.fto-previewName{font-size:15px;font-weight:600;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fto-previewFallback{font-size:12px;color:var(--dsw-alias-label-tertiary)}
.fto-pageFoot{display:flex;justify-content:flex-end;padding-top:16px}

/* --- ZCode chrome alignment (stable data-slot / data-row-key hooks) --- */
/* Each optional polish rule is gated on an html class the entry keeps in sync. */
/* Scrollbars: none. The product draws its own permanent gutters on every
   scroller; on a ZCode-style surface those bars are the loudest grit on screen.
   Hiding the gutter leaves wheel, trackpad and keyboard scrolling untouched. */
::-webkit-scrollbar{width:0;height:0;background:transparent}
*{scrollbar-width:none}

[data-slot="sidebar"]{font-size:13px;--fto-row-h:30px;--fto-row-fs:13px;--fto-time-fs:11px}
html.fto-dense-sidebar [data-slot="sidebar"]{--fto-row-h:26px;--fto-row-fs:12px;--fto-time-fs:10px}
[data-slot="sidebar"] [data-row-key^="workspace:"]{height:var(--fto-row-h);border-radius:6px;font-size:var(--fto-row-fs)}
[data-slot="sidebar"] [data-row-key^="session:"]{height:var(--fto-row-h);border-radius:6px;font-size:var(--fto-row-fs)}
[data-slot="sidebar"] [data-row-key^="session:"] [class*="_time"],
[data-slot="sidebar"] [data-row-key^="workspace:"] [class*="_time"]{font-size:var(--fto-time-fs);line-height:14px}
[data-slot="sidebar"] [data-row-key^="session:"] [class*="_rowActions"]{opacity:0;transition:opacity .12s ease}
[data-slot="sidebar"] [data-row-key^="session:"]:hover [class*="_rowActions"],
[data-slot="sidebar"] [data-row-key^="session:"]:focus-within [class*="_rowActions"]{opacity:1}

[data-slot="conversation.session.header"]{min-height:40px}
[data-slot="conversation.session.header"] [class*="_title"]{font-size:13px;font-weight:600}
[data-slot="conversation.session.header"] button{height:24px;border-radius:6px;font-size:12px}
[data-slot="conversation.view"] button{font-size:13px}

[data-slot="conversation.composer"] [class*="_box"],
[data-slot="conversation.composer"] [class*="_composer"]{border-radius:16px}
a{text-underline-offset:2px}

/* --- ZCode link language: underlined foreground instead of a coloured link --- */
html.fto-underline-links [data-chat-node-key] a{color:inherit;text-decoration:underline;text-underline-offset:2px;text-decoration-color:color-mix(in srgb, var(--dsw-alias-label-tertiary,#737373) 65%, transparent)}
html.fto-underline-links [data-chat-node-key] a:hover{text-decoration-color:var(--dsw-alias-label-primary,#0a0a0a)}

/* --- ZCode header additions --- */
.fto-chip-chip{display:inline-flex;align-items:center;gap:5px;height:24px;max-width:220px;padding:0 8px;border-radius:6px;color:var(--dsw-alias-label-tertiary);font-size:12px}
.fto-chip-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
[data-slot="conversation.session.header"] [class*="crumbCurrent"]{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}

/* --- auto-prefetch: hide the manual "load earlier" row when the watcher runs --- */
html.fto-auto-older [data-chat-flow] [class*="_older"]:has(> button){display:none}

/* --- queue dock exemption: keep the official look (user request) --- */
[data-queue-dock]{
  --dsw-radius-xs:4px;--dsw-radius-sm:8px;--dsw-radius-md:12px;--dsw-radius-lg:16px;
  --dsw-alias-bg-base:#fff;
  --dsw-alias-border-l1:#0000000a;
  --dsw-alias-label-primary:#0f1115;
  --dsw-alias-label-primary-dimmed:#151517;
  --dsw-alias-label-tertiary:#81858c;
  --dsw-alias-interactive-bg-hover:#2631480f;
  --dsw-alias-state-business-primary:#4176e6;
  --dsw-specific-menu:#f8f9faf0;
  --dsw-alias-scrollbar-bg-l2:#e5e5e5;
  --dsw-alias-scrollbar-hover-l2:#d4d4d4;
}
body[data-ds-dark-theme] [data-queue-dock]{
  --dsw-alias-bg-base:#151517;
  --dsw-alias-border-l1:#ffffff0f;
  --dsw-alias-label-primary:#f9fafb;
  --dsw-alias-label-primary-dimmed:#ebeef2;
  --dsw-alias-label-tertiary:#adb2b8;
  --dsw-alias-interactive-bg-hover:#ffffff14;
  --dsw-alias-state-business-primary:#7aaaff;
  --dsw-specific-menu:#303136f0;
  --dsw-alias-scrollbar-bg-l2:#545557;
  --dsw-alias-scrollbar-hover-l2:#65676b;
}

/* --- ZCode task list (sidebar.workspaces replacement) --- */
.fto-list-root{display:flex;flex-direction:column;min-height:0;font-size:13px;color:var(--dsw-alias-label-primary);padding:2px 6px 8px}
.fto-list-head{display:flex;flex-direction:column;gap:6px;padding:2px 2px 6px}
.fto-list-headLine{display:flex;align-items:center;gap:6px;height:22px;color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:600;letter-spacing:.02em;text-transform:uppercase}
.fto-list-count{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-tertiary);font-size:10px}
.fto-list-headGap{flex:1}
.fto-list-iconBtn{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);border-radius:6px;cursor:pointer;opacity:0;transition:opacity .12s ease}
.fto-list-head .fto-list-iconBtn{opacity:.55}
.fto-list-head:hover .fto-list-iconBtn,.fto-list-groupRow:hover .fto-list-iconBtn,.fto-list-iconBtn[data-on="true"]{opacity:1}
.fto-list-iconBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.fto-list-search{height:26px;padding:0 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;outline:none}
.fto-list-search:focus{border-color:var(--dsw-alias-link,#0284c7)}
.fto-list-seg{display:inline-flex;gap:2px;padding:2px;border-radius:7px;background:var(--dsw-alias-bg-layer-3);width:max-content}
.fto-list-segBtn{height:20px;padding:0 8px;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:11px;cursor:pointer}
.fto-list-segBtn[data-on="true"]{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgba(0,0,0,.06)}
.fto-list-scroll{overflow:auto;min-height:0;padding-right:2px}
.fto-list-group{margin-bottom:2px}
.fto-list-groupRow{display:flex;align-items:center;gap:6px;height:28px;padding:0 6px;border-radius:6px;cursor:pointer;color:var(--dsw-alias-label-secondary)}
.fto-list-groupRow:hover{background:var(--dsw-alias-interactive-bg-hover)}
.fto-list-groupIcon{display:inline-flex;color:var(--dsw-alias-label-tertiary)}
.fto-list-groupTitle{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fto-list-chevron{display:inline-flex;color:var(--dsw-alias-label-tertiary);opacity:0}
.fto-list-groupRow:hover .fto-list-chevron{opacity:1}
.fto-list-rows{display:flex;flex-direction:column;gap:1px;padding-left:8px}
.fto-list-row{position:relative;display:flex;align-items:center;gap:6px;height:28px;padding:0 6px;border-radius:6px;cursor:default;color:var(--dsw-alias-label-secondary)}
.fto-list-row:hover{background:var(--dsw-alias-interactive-bg-hover)}
.fto-list-row[data-active="true"]{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}
.fto-list-state{width:6px;height:6px;border-radius:50%;background:transparent;flex:0 0 auto}
.fto-list-state[data-running="true"]{background:var(--dsw-alias-state-success-primary)}
.fto-list-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}
.fto-list-row[data-active="true"] .fto-list-title{font-weight:500}
.fto-list-time{flex:0 0 auto;color:var(--dsw-alias-label-tertiary);font-size:11px}
.fto-list-time{transition:opacity .12s ease}
.fto-list-row:hover .fto-list-time,.fto-list-row:focus-within .fto-list-time{opacity:0}
.fto-list-more{position:absolute;right:4px;top:50%;transform:translateY(-50%);display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border:0;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-tertiary);border-radius:5px;cursor:pointer;opacity:0;transition:opacity .12s ease}
.fto-list-row:hover .fto-list-more,.fto-list-row:focus-within .fto-list-more{opacity:1}
.fto-list-more:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.fto-list-empty{color:var(--dsw-alias-label-tertiary);font-size:11px;padding:6px 8px}
.fto-list-emptyAll{padding:18px 10px;text-align:center}
.fto-list-backdrop{position:fixed;inset:0;z-index:80}
.fto-list-menu{position:fixed;z-index:81;min-width:168px;padding:4px;border-radius:8px;background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l2);box-shadow:var(--dsw-elevation-panel);font-size:12px}
.fto-list-menuItem{display:flex;align-items:center;height:28px;padding:0 8px;border-radius:5px;color:var(--dsw-alias-label-primary);cursor:pointer}
.fto-list-menuItem:hover{background:var(--dsw-alias-interactive-bg-hover)}

/* --- density for the self-drawn task list (it has no data-row-key rows) --- */
html.fto-dense-sidebar .fto-list-row,
html.fto-dense-sidebar .fto-list-groupRow{height:24px}
html.fto-dense-sidebar .fto-list-row{font-size:12px}
html.fto-dense-sidebar .fto-list-title{font-size:12px}
html.fto-dense-sidebar .fto-list-time{font-size:10px}
html.fto-dense-sidebar .fto-list-group{margin-bottom:1px}

/* --- the theme shelf: a card is a whole look, not a setting --- */
.fto-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 0 18px}
.fto-themes{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px 10px}
.fto-theme{position:relative}
.fto-themePick,.fto-theme.fto-themeAdd{display:flex;flex-direction:column;gap:7px;width:100%;
  padding:0;border:0;background:transparent;cursor:pointer;text-align:left;font:inherit}
.fto-theme[data-static="true"] .fto-themePick{cursor:default}
.fto-themeDel{position:absolute;top:-5px;right:-5px;width:18px;height:18px;padding:0;
  border:1px solid var(--dsw-alias-border-l2);border-radius:50%;
  background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-tertiary);
  font-size:11px;line-height:1;cursor:pointer;opacity:0;transition:opacity .12s ease}
.fto-theme:hover .fto-themeDel{opacity:1}
.fto-themeDel:hover{color:var(--dsw-alias-state-error-primary,#dc2626);border-color:currentColor}
.fto-themeAdd{cursor:pointer}
.fto-themeArt.fto-addArt{display:flex;align-items:center;justify-content:center;height:58px;
  border-style:dashed;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:17px;line-height:1}
.fto-themeAdd:hover .fto-addArt{border-color:var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary)}
.fto-addInput{width:100%;height:54px;padding:0 10px;border:1px solid var(--dsw-alias-link,#0284c7);
  border-radius:10px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);
  font-size:12px;outline:none}
.fto-themeArt{position:relative;display:block;height:58px;overflow:hidden;
  background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);
  transition:border-color .14s ease,box-shadow .14s ease}
.fto-themeSide{position:absolute;left:0;top:0;bottom:0;width:27%;
  background:var(--dsw-alias-bg-layer-3);border-right:1px solid var(--dsw-alias-border-l1)}
.fto-themeSideDash{position:absolute;left:7%;width:13%;height:3px;border-radius:1.5px;
  background:var(--dsw-alias-label-tertiary);opacity:.3}
.fto-themeLine{position:absolute;left:35%;height:4px;border-radius:2px;
  background:var(--dsw-alias-label-tertiary);opacity:.32}
.fto-theme:hover .fto-themeArt{border-color:var(--dsw-alias-border-l3)}
.fto-theme[data-on="true"] .fto-themeArt{
  border-color:var(--dsw-alias-link,#0284c7);
  box-shadow:0 0 0 1px var(--dsw-alias-link,#0284c7)}
.fto-themeDot{position:absolute;right:11px;bottom:11px;width:11px;height:11px;border-radius:50%}
.fto-themeName{padding-left:2px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.fto-theme[data-on="true"] .fto-themeName{color:var(--dsw-alias-label-primary);font-weight:500}

.fto-tuneBtn{display:flex;align-items:center;justify-content:space-between;width:100%;
  margin-top:22px;padding:11px 0;border:0;border-top:1px solid var(--dsw-alias-border-l2);
  background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;cursor:pointer}
.fto-tuneBtn:hover{color:var(--dsw-alias-label-primary)}
.fto-tuneChevron{display:block;width:12px;height:12px;background:currentColor;
  transform:rotate(90deg);transition:transform .16s ease;
  -webkit-mask:var(--fto-chevron) center/contain no-repeat;
  mask:var(--fto-chevron) center/contain no-repeat}
.fto-tuneBtn[data-open="true"] .fto-tuneChevron{transform:rotate(-90deg)}

.fto-cells{display:grid;grid-template-columns:1fr 1fr;gap:0 20px;padding:8px 0 2px}
.fto-cell{display:flex;align-items:center;gap:8px;min-height:32px;
  font-size:12px;color:var(--dsw-alias-label-secondary)}

body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
::selection{background:color-mix(in srgb, var(--dsw-alias-link,#0284c7) 28%, transparent)}
body,textarea,pre,code{-webkit-font-smoothing:antialiased}

/* --- settings page: grouped sections --- */
.fto-group{margin-top:26px}
.fto-groupHead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 0 6px;border-bottom:1px solid var(--dsw-alias-border-l2)}
.fto-groupTitle{margin:0;font-size:11px;font-weight:650;letter-spacing:.06em;text-transform:uppercase;color:var(--dsw-alias-label-tertiary)}
.fto-groupTools{display:flex;align-items:center;gap:6px}
.fto-linkBtn{height:24px;padding:0 8px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:11.5px;cursor:pointer}
.fto-linkBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.fto-linkBtn:disabled{opacity:.38;cursor:default}
.fto-linkBtn:disabled:hover{background:transparent;color:var(--dsw-alias-label-tertiary)}
.fto-groupNote{margin:0;padding:8px 0 0;color:var(--dsw-alias-label-tertiary);font-size:11.5px;line-height:17px}
.fto-feature{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:11px 0;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.fto-feature:last-child{border-bottom:0}
.fto-featureCopy{min-width:0}
.fto-featureTitle{font-size:13px;line-height:19px;color:var(--dsw-alias-label-primary)}
.fto-featureDesc{margin-top:2px;font-size:11.5px;line-height:17px;color:var(--dsw-alias-label-tertiary)}
.fto-switch[data-size="sm"]{width:32px;height:18px}
.fto-switch[data-size="sm"] .fto-knob{top:2px;left:2px;width:14px;height:14px}
.fto-switch[data-size="sm"][data-on="true"] .fto-knob{transform:translateX(14px)}
.fto-static{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 9px;border-radius:999px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-secondary);font-size:11.5px;white-space:nowrap}
.fto-static[data-tone="on"]{background:color-mix(in srgb, var(--dsw-alias-link,#0284c7) 14%, transparent);color:var(--dsw-alias-link,#0284c7)}
.fto-staticDot{width:6px;height:6px;border-radius:50%;background:currentColor}
.fto-swatches{display:flex;gap:8px}
.fto-swatch{position:relative;width:24px;height:24px;padding:0;border:0;border-radius:7px;cursor:pointer;transition:transform .12s ease}
.fto-swatch:hover{transform:scale(1.08)}
.fto-swatch[data-on="true"]{box-shadow:0 0 0 2px var(--dsw-alias-bg-base),0 0 0 4px var(--dsw-alias-label-primary)}
.fto-seg[data-align="start"]{justify-content:flex-start}
.fto-row>.fto-seg,.fto-feature>.fto-seg{flex:0 0 auto;flex-wrap:nowrap}
.fto-row>.fto-swatches,.fto-feature>.fto-swatches{flex:0 0 auto}
.fto-segBtn[data-on="true"]:hover{background:var(--dsw-alias-interactive-bg-hover)}
.fto-btnRow{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding-top:14px}
.fto-btnGap{flex:1}
.fto-note{margin-top:10px;color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:17px}
.fto-btn[data-tone="primary"]{border-color:transparent;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-base)}
.fto-btn[data-tone="primary"]:hover{background:var(--dsw-alias-label-primary-dimmed,var(--dsw-alias-label-primary))}
.fto-btn[data-tone="danger"]{color:var(--dsw-alias-state-error-primary,#dc2626)}
.fto-note{margin-top:10px;padding:10px 12px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:17px}
.fto-note code{font-family:var(--dsw-font-mono,ui-monospace,Menlo,monospace);font-size:11px;padding:1px 5px;border-radius:4px;background:var(--dsw-alias-bg-layer-3)}
`

const STYLE_ID = 'dsh-fitout'

/** Idempotently adopt the stylesheet; returns a disposer that removes it. */
export function adoptStyles(css) {
  if (typeof document === 'undefined') return () => {}
  const existing = document.getElementById(STYLE_ID)
  if (existing !== null) {
    existing.textContent = css
    return () => {}
  }
  const tag = document.createElement('style')
  tag.id = STYLE_ID
  tag.dataset.plugin = 'dsh-fitout'
  tag.textContent = css
  document.head.appendChild(tag)
  return () => {
    tag.remove()
  }
}
