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

/* --- frosted glass: expensive, so it is opt-in and never full-strength --- */
html.fto-glass-all [data-slot="sidebar"]{
  background:color-mix(in srgb,var(--dsw-alias-bg-base) 62%,transparent) !important;
  -webkit-backdrop-filter:blur(16px) saturate(1.15);
  backdrop-filter:blur(16px) saturate(1.15)}
html.fto-glass-all [data-composer-card],
html.fto-glass-cards [data-composer-card]{
  background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 74%,transparent) !important;
  -webkit-backdrop-filter:blur(12px) saturate(1.1);
  backdrop-filter:blur(12px) saturate(1.1)}
html.fto-glass-all [role="dialog"],
html.fto-glass-cards [role="dialog"]{
  background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 82%,transparent) !important;
  -webkit-backdrop-filter:blur(20px) saturate(1.1);
  backdrop-filter:blur(20px) saturate(1.1)}
html.fto-glass-all [data-slot="conversation.session.header"]{
  background:color-mix(in srgb,var(--dsw-alias-bg-base) 72%,transparent) !important;
  -webkit-backdrop-filter:blur(12px);
  backdrop-filter:blur(12px)}

/* --- reading line height: the prose layer owns its own rhythm --- */
html.fto-lh-tight [class*="_markdown_"]{line-height:1.5}
html.fto-lh-tight [class*="_markdown_"] :is(p,li,td,blockquote,ul,ol){line-height:1.5}
html.fto-lh-loose [class*="_markdown_"]{line-height:1.85}
html.fto-lh-loose [class*="_markdown_"] :is(p,li,td,blockquote,ul,ol){line-height:1.85}

/* --- wallpaper: one fixed layer behind everything, painted from root vars --- */
html.fto-has-wallpaper body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;
  background-image:var(--fto-wallpaper);background-size:cover;background-position:center;
  opacity:var(--fto-wallpaper-opacity,.55);
  filter:blur(var(--fto-wallpaper-blur,0px))}

/* --- sliders used by the background controls --- */
.fto-slider{display:flex;align-items:center;gap:10px}
.fto-inline{display:flex;align-items:center;gap:10px;flex-wrap:nowrap}
.fto-stack{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
.fto-stack .fto-input{width:220px;height:28px;font-size:12px}

/* --- type: three roles, one row each, plus a sample you can look at --- */
.fto-type{padding:2px 0 0}
.fto-type .fto-inline{flex:0 0 auto}
.fto-type .fto-input{width:300px;height:30px;font-size:12.5px}
.fto-select{height:30px;padding:0 8px;border:1px solid var(--dsw-alias-border-l2);
  border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);
  font-size:12.5px;outline:none;cursor:pointer}
.fto-select:focus{border-color:var(--dsw-alias-link,#0284c7)}
.fto-typeSelect{width:206px;flex:0 0 auto}
.fto-fontPreview{margin-top:6px;padding:11px 13px 12px;border:1px solid var(--dsw-alias-border-l2);
  border-radius:10px;background:var(--dsw-alias-bg-layer-2);display:flex;flex-direction:column;gap:7px}
.fto-fontPreviewTag{font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;
  color:var(--dsw-alias-label-tertiary)}
.fto-fontLine{color:var(--dsw-alias-label-primary);line-height:1.5;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.fto-live{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);
  font-variant-numeric:tabular-nums}
.fto-slider input[type="range"]{-webkit-appearance:none;appearance:none;width:132px;height:4px;
  border-radius:2px;background:var(--dsw-alias-bg-layer-3);outline:none;cursor:pointer}
.fto-slider input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;
  border-radius:50%;background:var(--dsw-alias-label-primary);border:0;cursor:pointer}
.fto-slider input[type="range"]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
  background:var(--dsw-alias-label-primary);border:0;cursor:pointer}
.fto-sliderValue{min-width:34px;text-align:right;font-size:11.5px;
  color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.fto-colorInput{width:26px;height:26px;padding:0;border:1px solid var(--dsw-alias-border-l2);
  border-radius:7px;background:transparent;cursor:pointer}
.fto-colorInput::-webkit-color-swatch-wrapper{padding:2px}
.fto-colorInput::-webkit-color-swatch{border:0;border-radius:5px}

/* --- the theme shelf: a card is a whole look, not a setting --- */
.fto-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 0 18px}
.fto-themes{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px 10px}
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
  background:var(--fto-card-bg,var(--dsw-alias-bg-layer-1));
  border:1px solid var(--dsw-alias-border-l2);
  transition:border-color .14s ease,box-shadow .14s ease}
body[data-ds-dark-theme] .fto-themeArt{background:var(--fto-card-bg-dark,var(--dsw-alias-bg-layer-1))}
.fto-themeArt[data-live="true"],.fto-theme[data-live="true"] .fto-themeArt{
  background:var(--dsw-alias-bg-layer-1)}
.fto-themeSide{position:absolute;left:0;top:0;bottom:0;width:27%;
  background:var(--fto-card-side,var(--dsw-alias-bg-layer-3));
  border-right:1px solid var(--dsw-alias-border-l1)}
body[data-ds-dark-theme] .fto-themeSide{background:var(--fto-card-side-dark,var(--dsw-alias-bg-layer-3))}
.fto-themeSideDash{position:absolute;left:7%;width:13%;height:3px;border-radius:1.5px;
  background:var(--fto-card-ink,var(--dsw-alias-label-tertiary));opacity:.34}
body[data-ds-dark-theme] .fto-themeSideDash{background:var(--fto-card-ink-dark,var(--dsw-alias-label-tertiary))}
.fto-themeLine{position:absolute;left:35%;height:4px;border-radius:2px;
  background:var(--fto-card-ink,var(--dsw-alias-label-tertiary));opacity:.36}
body[data-ds-dark-theme] .fto-themeLine{background:var(--fto-card-ink-dark,var(--dsw-alias-label-tertiary))}
.fto-theme:hover .fto-themeArt{border-color:var(--dsw-alias-border-l3)}
.fto-theme[data-on="true"] .fto-themeArt{
  border-color:var(--dsw-alias-link,#0284c7);
  box-shadow:0 0 0 1px var(--dsw-alias-link,#0284c7)}
.fto-themeDot{position:absolute;right:11px;bottom:11px;width:11px;height:11px;border-radius:50%;
  background:var(--fto-card-accent,var(--dsw-alias-link))}
body[data-ds-dark-theme] .fto-themeDot{background:var(--fto-card-accent-dark,var(--dsw-alias-link))}
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
