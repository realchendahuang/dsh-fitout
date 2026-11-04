#!/usr/bin/env python3
"""Generate src/client/tokens.js — the ZCode-aligned token override layer.

Values are authored here (one table, easy to re-tune) and emitted as a JS object
of `{ light, dark }` pairs, which is what `ctx.theme.overrideTokens()` requires.
The token names come from the installed 0.2.1-rc.5 theme bundle; every alias
token that another alias references (button-primary-fill, settings-card-fill,
settings-card-stroke, tooltip-key-bg, turn-trigger-*) is listed explicitly so
the layer does not leak the stock palette through a var() chain.
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "src", "client", "tokens.js")

# Tailwind neutral (ZCode's palette) and its accent/state colors.
N = {
    "0": "#ffffff", "50": "#fafafa", "100": "#f5f5f5", "200": "#e5e5e5",
    "300": "#d4d4d4", "400": "#a3a3a3", "500": "#737373", "600": "#525252",
    "700": "#404040", "800": "#262626", "900": "#171717", "950": "#0f0f0f",
    "1000": "#0a0a0a",
}
SKY = {"700": "#0369a1", "600": "#0284c7", "500": "#0ea5e9", "400": "#38bdf8", "300": "#7dd3fc"}
GREEN = {"600": "#16a34a", "500": "#22c55e", "400": "#4ade80"}
RED = {"600": "#dc2626", "500": "#ef4444", "400": "#f87171"}
AMBER = {"600": "#d97706", "500": "#f59e0b", "400": "#fbbf24"}

# (light, dark)
ALIAS = {
    # surfaces
    "--dsw-alias-bg-base": (N["50"], N["900"]),
    "--dsw-alias-bg-document-preview": (N["100"], N["800"]),
    "--dsw-alias-bg-document-selection": (
        f"color-mix(in srgb, {SKY['600']} 40%, transparent)",
        f"color-mix(in srgb, {SKY['400']} 40%, transparent)",
    ),
    "--dsw-alias-bg-layer-1": (N["0"], "#1f1f1f"),
    "--dsw-alias-bg-layer-2": (N["0"], N["800"]),
    "--dsw-alias-bg-layer-3": (N["100"], "#2e2e2e"),
    "--dsw-alias-bg-mask-1": ("#0000003d", "#00000080"),
    "--dsw-alias-bg-mask-2": ("#0000001f", "#0003"),
    "--dsw-alias-bg-mask-3": ("#0000007a", "#0000007a"),
    "--dsw-alias-bg-mask-drop": ("#ffffffb3", "#0a0a0ab3"),
    "--dsw-alias-bg-mask-photo": ("#000000e0", "#000000e0"),
    "--dsw-alias-bg-module-platform": (N["100"], "#2e2e2e"),
    "--dsw-alias-bg-multi-select": (N["100"], N["800"]),
    "--dsw-alias-bg-overlay": (N["200"], N["600"]),
    "--dsw-alias-bg-skeleton": ("#0a0a0a0a", "#ffffff14"),
    # borders
    "--dsw-alias-border-inverted": ("#0000", "#ffffff0f"),
    "--dsw-alias-border-inverted2": ("#0000", "#ffffff14"),
    "--dsw-alias-border-l1": ("#0a0a0a0d", "#ffffff0f"),
    "--dsw-alias-border-l2": ("#0a0a0a1a", "#ffffff1a"),
    "--dsw-alias-border-l2-darkmode-thin": ("#0a0a0a1a", "#ffffff0f"),
    "--dsw-alias-border-l3": ("#0a0a0a24", "#ffffff24"),
    "--dsw-alias-border-l4": ("#0a0a0a33", "#ffffff2e"),
    # brand (ZCode primary buttons are monochrome; accent lives on link/focus)
    "--dsw-alias-brand-primary": (N["1000"], N["50"]),
    "--dsw-alias-brand-primary-invert": (N["1000"], N["50"]),
    "--dsw-alias-brand-primary-new-colorprimary-new-color": (SKY["600"], SKY["400"]),
    "--dsw-alias-brand-text": (N["1000"], N["50"]),
    # buttons
    "--dsw-alias-button-contrast-fill": (N["700"], N["50"]),
    "--dsw-alias-button-elevated-fill": (N["0"], "#2e2e2e"),
    "--dsw-alias-button-floating-fill": (N["0"], N["800"]),
    "--dsw-alias-button-floating-hover": (N["100"], "#2e2e2e"),
    "--dsw-alias-button-ghost-active-border": (N["500"], N["400"]),
    "--dsw-alias-button-ghost-active-fill": (N["100"], N["700"]),
    "--dsw-alias-button-ghost-active-hover": (N["200"], N["600"]),
    "--dsw-alias-button-info-fill": (SKY["600"], SKY["400"]),
    "--dsw-alias-button-info-hover": (SKY["700"], SKY["300"]),
    "--dsw-alias-button-primary-dimmed": (N["100"], N["700"]),
    "--dsw-alias-button-primary-fill": (N["1000"], N["50"]),
    "--dsw-alias-button-primary-hover": (N["800"], N["200"]),
    "--dsw-alias-button-tool-bar-fill": ("#52525280", "#52525280"),
    "--dsw-alias-button-tool-bar-fill-invisible": ("#1f1f1f5c", "#1f1f1f5c"),
    "--dsw-alias-button-tool-bar-hover": ("#52525299", "#52525299"),
    # diffs
    "--dsw-alias-code-diff-added": (f"{GREEN['500']}14", f"{GREEN['500']}1f"),
    "--dsw-alias-code-diff-deleted": (f"{RED['600']}14", f"{RED['400']}1f"),
    "--dsw-alias-file-diff-added-bg": ("#e9f8ee", "#16281c"),
    "--dsw-alias-file-diff-added-gutter": ("#f2fcf5", "#101d15"),
    "--dsw-alias-file-diff-added-marker": (GREEN["600"], GREEN["400"]),
    "--dsw-alias-file-diff-deleted-bg": ("#fdecea", "#2c1a19"),
    "--dsw-alias-file-diff-deleted-gutter": ("#fef3f1", "#22120f"),
    "--dsw-alias-file-diff-deleted-marker": (RED["600"], RED["400"]),
    # interaction
    "--dsw-alias-interactive-bg-active": ("#0a0a0a1a", "#ffffff24"),
    "--dsw-alias-interactive-bg-hover": ("#0a0a0a0f", "#ffffff14"),
    "--dsw-alias-interactive-bg-hover-accent": (f"{SKY['600']}24", f"{SKY['400']}3d"),
    "--dsw-alias-interactive-bg-hover-danger": (f"{RED['600']}0d", f"{RED['400']}26"),
    "--dsw-alias-interactive-bg-hover-solid": (N["100"], "#2e2e2e"),
    # labels
    "--dsw-alias-label-caption": (N["400"], N["500"]),
    "--dsw-alias-label-deep-diving": (
        f"color-mix(in srgb, {SKY['600']} 70%, {N['1000']})",
        f"color-mix(in srgb, {SKY['400']} 55%, {N['400']})",
    ),
    "--dsw-alias-label-deep-diving-shimmer": (
        f"color-mix(in srgb, {SKY['600']} 30%, {N['1000']})",
        f"color-mix(in srgb, {SKY['300']} 65%, {SKY['400']})",
    ),
    "--dsw-alias-label-dimmed": (N["200"], N["700"]),
    "--dsw-alias-label-document-preview": (N["600"], N["300"]),
    "--dsw-alias-label-primary": (N["1000"], N["100"]),
    "--dsw-alias-label-primary-bluish": (N["1000"], N["100"]),
    "--dsw-alias-label-primary-dimmed": (N["800"], "#ededed"),
    "--dsw-alias-label-primary-foreground": (N["0"], N["1000"]),
    "--dsw-alias-label-primary-inverted": (N["0"], N["800"]),
    "--dsw-alias-label-secondary": (N["600"], N["400"]),
    "--dsw-alias-label-shimmer": ("color-mix(in srgb, #0a0a0a 30%, transparent)", "color-mix(in srgb, #ffffff 45%, transparent)"),
    "--dsw-alias-label-tertiary": (N["500"], N["500"]),
    "--dsw-alias-link": (SKY["600"], SKY["400"]),
    # markdown
    "--dsw-alias-markdown-citation": (N["100"], "#2e2e2e"),
    "--dsw-alias-markdown-code-block": (N["50"], "#111111"),
    "--dsw-alias-markdown-code-block-banner": (N["100"], "#1a1a1a"),
    "--dsw-alias-markdown-code-segment-selected": (N["0"], N["800"]),
    "--dsw-alias-markdown-code-segment-unselected": (N["100"], N["900"]),
    "--dsw-alias-markdown-inline-code": (N["100"], N["800"]),
    "--dsw-alias-markdown-placeholder": (N["100"], N["800"]),
    "--dsw-alias-markdown-tag": (N["100"], N["800"]),
    # menus
    "--dsw-alias-menu-group-header-fill": ("#fafafaf0", "#171717f0"),
    "--dsw-alias-menu-icon": (N["700"], "#ededed"),
    # onboarding
    "--dsw-alias-onboarding-accent": (SKY["600"], SKY["400"]),
    "--dsw-alias-onboarding-card-fill": ("color-mix(in srgb, #ffffff 80%, transparent)", "color-mix(in srgb, #262626 80%, transparent)"),
    "--dsw-alias-onboarding-checkbox-border": ("color-mix(in srgb, #0a0a0a 20%, transparent)", "#ffffff1a"),
    "--dsw-alias-onboarding-secondary-fill": (N["0"], N["700"]),
    # scrollbars
    "--dsw-alias-scrollbar-bg-l1": (N["200"], "#333333"),
    "--dsw-alias-scrollbar-bg-l2": (N["200"], N["700"]),
    "--dsw-alias-scrollbar-hover-l1": (N["300"], N["700"]),
    "--dsw-alias-scrollbar-hover-l2": (N["300"], N["600"]),
    # settings cards
    "--dsw-alias-settings-card-fill": (N["50"], N["800"]),
    "--dsw-alias-settings-card-stroke": ("#0a0a0a33", "#ffffff2e"),
    # states
    "--dsw-alias-state-business-primary": (SKY["600"], SKY["400"]),
    "--dsw-alias-state-business-tertiary": (f"color-mix(in srgb, {SKY['600']} 12%, transparent)", f"color-mix(in srgb, {SKY['400']} 16%, transparent)"),
    "--dsw-alias-state-error-primary": (RED["600"], RED["400"]),
    "--dsw-alias-state-error-secondary": (RED["400"], RED["400"]),
    "--dsw-alias-state-idle-primary": (N["300"], N["600"]),
    "--dsw-alias-state-success-primary": (GREEN["500"], GREEN["400"]),
    "--dsw-alias-state-success-secondary": (GREEN["400"], GREEN["400"]),
    "--dsw-alias-state-success-tertiary": ("#e9f9ef", "#16301f"),
    "--dsw-alias-state-warn-label": ("#b45309", AMBER["400"]),
    "--dsw-alias-state-warn-primary": (AMBER["500"], AMBER["500"]),
    "--dsw-alias-state-warn-secondary": (AMBER["400"], AMBER["400"]),
    "--dsw-alias-state-warn-tertiary": ("#fef3c7", "#2a2213"),
    "--dsw-alias-switch-thumb": (N["0"], N["400"]),
    "--dsw-alias-toast-bg": (N["800"], N["700"]),
    "--dsw-alias-toast-label": (N["50"], N["50"]),
    "--dsw-alias-tooltip-bg": (N["800"], N["700"]),
    "--dsw-alias-tooltip-key-bg": ("color-mix(in srgb, #262626, white 18%)", "color-mix(in srgb, #404040, white 18%)"),
    "--dsw-alias-turn-trigger-bg": (N["50"], "#ffffff14"),
    "--dsw-alias-turn-trigger-bg-hover": ("#0a0a0a0f", "#ffffff24"),
}

SPECIFIC = {
    "--dsw-specific-bubble": (N["100"], N["800"]),
    "--dsw-specific-bubble-highlight": (N["200"], "#2e2e2e"),
    "--dsw-specific-input-major": (N["0"], "#1f1f1f"),
    "--dsw-specific-login-input": (N["50"], N["900"]),
    "--dsw-specific-menu": ("#fafafaf5", "#171717f5"),
    "--dsw-specific-selector": (N["100"], "#1f1f1f"),
    "--dsw-specific-sidebar-fill": (N["50"], N["950"]),
    "--dsw-specific-sidebar-nav-item-active": (N["200"], N["800"]),
    "--dsw-specific-sidebar-nav-item-active-accent": (f"color-mix(in srgb, {SKY['600']} 10%, transparent)", f"color-mix(in srgb, {SKY['400']} 10%, transparent)"),
    "--dsw-specific-sidebar-nav-item-hover": (N["100"], N["800"]),
    "--dsw-specific-tip": (N["100"], N["800"]),
}

# ZCode's corner language: 4 / 6 / 8 / 12 / 16 and circular corners.
SCALE = {
    "--dsw-radius-xs": ("4px", "4px"),
    "--dsw-radius-sm": ("6px", "6px"),
    "--dsw-radius-md": ("8px", "8px"),
    "--dsw-radius-lg": ("12px", "12px"),
    "--dsw-radius-xl": ("16px", "16px"),
    "--dsw-radius-panel": ("16px", "16px"),
    "--dsw-corner-shape": ("round", "round"),
    # ZCode runs titles a little heavier than the stock scale.
    "--dsw-font-l-20-font-weight": ("600", "600"),
    "--dsw-font-m-18-font-weight": ("600", "600"),
    "--dsw-font-base-strong-16-font-weight": ("600", "600"),
    "--dsw-font-markdown-h1-font-weight": ("600", "600"),
    "--dsw-font-markdown-h2-font-weight": ("600", "600"),
    "--dsw-font-markdown-h3-font-weight": ("600", "600"),
    "--dsw-font-markdown-h4-font-weight": ("600", "600"),
    # ZCode has no custom brand face: drop Montserrat from the wordmark.
    "--dsw-font-family-brand": ("var(--dsw-font-family)", "var(--dsw-font-family)"),
    # Softer, tighter elevation than the stock 0.5px-stroke + 16px-blur recipe.
    "--dsw-elevation-stroke": ("0 0 0 .5px var(--dsw-elevation-stroke-color)", "0 0 0 .5px var(--dsw-elevation-stroke-color)"),
    "--dsw-elevation-stroke-color": ("#0a0a0a14", "#ffffff14"),
    "--dsw-elevation-panel": (
        "var(--dsw-elevation-stroke), 0 2px 6px 0 #0a0a0a0a, 0 0 12px 0 #0a0a0a05",
        "var(--dsw-elevation-stroke), 0 2px 6px 0 #00000040, 0 0 12px 0 #00000026",
    ),
    "--dsw-elevation-prominent": (
        "var(--dsw-elevation-stroke), 0 2px 6px 0 #0a0a0a0a, 0 0 16px 0 #0a0a0a0f",
        "var(--dsw-elevation-stroke), 0 2px 6px 0 #0000004d, 0 0 16px 0 #00000033",
    ),
    "--dsw-elevation-soft": (
        "var(--dsw-elevation-stroke), 0 3px 12px 0 #0a0a0a0a, 0 0 18px 0 #0a0a0a0a",
        "var(--dsw-elevation-stroke), 0 3px 12px 0 #00000040, 0 0 18px 0 #00000033",
    ),
}

ALL = {}
for table in (ALIAS, SPECIFIC, SCALE):
    for token, (light, dark) in table.items():
        if light == dark:
            # overrideTokens still wants a pair; identical values are allowed.
            pass
        ALL[token] = {"light": light, "dark": dark}

lines = [
    "/** Generated by scripts/gen-tokens.py — do not edit by hand.",
    " *",
    " * ZCode-aligned override layer for the installed Harness theme. Every key is",
    " * a CSS custom property; every value is a { light, dark } pair, which is the",
    " * shape ctx.theme.overrideTokens() validates.",
    " */",
    "export const TOKENS = Object.freeze({",
]
for token in sorted(ALL):
    pair = ALL[token]
    lines.append("  %s: { light: %s, dark: %s }," % (
        json.dumps(token), json.dumps(pair["light"]), json.dumps(pair["dark"])))
lines.append("})")
lines.append("")
lines.append("export const TOKEN_COUNT = %d" % len(ALL))
lines.append("")

with open(OUT, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print("wrote", OUT, len(ALL), "tokens")
