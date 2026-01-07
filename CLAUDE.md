# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WXT + Angularを使用したブラウザ拡張機能プロジェクト。Chrome/Firefoxの両方をサポート。
- **WXT**: ブラウザ拡張フレームワーク
- **Angular 21**: UIフレームワーク（Zoneless、Standalone）
- **@analogjs/vite-plugin-angular**: ViteでAngularをビルドするためのプラグイン
- **Tailwind CSS v4**: ユーティリティファーストCSS（@tailwindcss/vite）

## Commands

```bash
# 開発サーバー起動（Chrome）
pnpm dev

# 開発サーバー起動（Firefox）
pnpm dev:firefox

# 本番ビルド
pnpm build
pnpm build:firefox

# 配布用zip作成
pnpm zip
pnpm zip:firefox

# TypeScript型チェック
pnpm compile
```

## Architecture

WXTのファイルベースルーティング + Angularコンポーネント。

- **entrypoints/**: 拡張機能のエントリーポイント
  - `background.ts`: Service Worker（`defineBackground()`）
  - `content.ts`: Content Script（`defineContentScript()`）
  - `popup/`: ポップアップUI（Angularアプリ）
    - `main.ts`: bootstrapApplication()でAppComponentをブートストラップ
    - `app.component.ts`: ルートコンポーネント
- **public/**: そのままコピーされる静的ファイル（`/`でインポート）

## Angular Configuration

- **Zoneless**: `provideZonelessChangeDetection()` を使用。zone.jsなし。
- **Standalone**: NgModuleなし、すべてStandaloneコンポーネント（Angular 19以降デフォルト、明示不要）。
- **Signals**: 状態管理にAngular Signalsを使用。
- **tsconfig.app.json**: Angular用コンパイラ設定（wxt.config.tsで参照）

## Angular Best Practices

Angularコードを書く際は **angular-cli MCP** を参照してベストプラクティスを確認すること。
MCPが利用可能な場合は必ずそちらを優先し、ハードコードされたルールに依存しない。

## Styling

- **Tailwind CSS v4**: ユーティリティクラスでスタイリング
- インラインスタイル（`styles`）は使わず、Tailwindクラスを使用
- コンポーネントのホスト要素は `host: { class: '...' }` でスタイル適用
- グローバルスタイルは `style.css` で `@import 'tailwindcss'` のみ

## WXT Conventions

- `defineBackground()`, `defineContentScript()` はWXTが自動インポートするグローバル関数
- `browser` APIはWXTが提供するクロスブラウザ互換ラッパー
- パスエイリアス: `@/` = プロジェクトルート

## Implementation Principles

### Order-Dependent Code Verification
**Apply when**: Writing initialization, resource acquisition, or async code with order dependencies
- Write intended order as comments FIRST
- After implementation, verify comments match actual execution order
- If you cannot explain WHY "A→B→C" order is required, reconsider the design

### Selector Scope Minimization
**Apply when**: Designing DOM selectors or pattern matching
- Ask: "Could this selector match unintended elements?"
- Prefer narrow selectors over broad selector + filtering
- When using MutationObserver, leverage detection timing to narrow scope

### Continuous vs One-shot Observation
**Apply when**: Designing DOM observation or event subscriptions
- Ask: "Can this element/event recur?"
- If recurring: disable timeout (or set very long), use once: false
- If one-shot: use once: true with appropriate timeout
- Verify cleanup can undo ALL side effects that occurred during observation

### Explicit Environment Tracking
**Apply when**: User mentions target environment (browser, OS, runtime)
- Record target environment explicitly in todo or notes
- Verify environment before running build/test commands
- Never rely on "default environment" assumptions

### Anti-corruption Layer Protocol
**Apply when**: Wrapping external libraries to create anti-corruption layers
- After creating wrapper functions, verify behavior matches original usage
- For iterator/generator APIs: explicitly test handling of existing items vs new items
- Never assume pass-through is safe; verify expected behavior at call sites

### CSS-First Visibility Control
**Apply when**: Controlling element visibility via JavaScript DOM manipulation
- CSS provides instant effect; JS always has latency (FOUC risk)
- For immediate visibility needs: CSS first, JS as supplement
- Defense in depth: CSS (instant) + JS observation (for dynamic changes)

### AsyncIterable/Observer API Verification
**Apply when**: Using AsyncIterable, AsyncGenerator, or MutationObserver-based APIs
- Verify: Does it yield existing items immediately, or only new items?
- Verify: What happens on initialization timing edge cases?
- If documentation is unclear, write test code to verify actual behavior
