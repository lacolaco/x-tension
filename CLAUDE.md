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

### Minimal Change Principle
**Apply when**: ANY code change
- Ask: "Is this change necessary? Was it working before?"
- Prefer keeping what works over adding what might break
- "Small change" is never an excuse for skipping validation or process

### Pre-commit Validation
**Apply when**: Before ANY commit
- Run platform-specific validation tools locally (e.g., `web-ext lint` for browser extensions)
- Verify target environment before build/test commands
- Build + validate as atomic operation; never push untested artifacts
- Always use feature branch → PR → merge (no direct commits to main)

### External API Integration
**Apply when**: Using or wrapping external libraries/APIs
- Verify wrapper behavior matches original usage at call sites
- For async/iterator APIs: test existing items vs new items handling
- If documentation unclear, write test code to verify actual behavior
- Never assume pass-through is safe

### DOM Manipulation
**Apply when**: Working with DOM elements (selectors, observation, visibility)
- Selectors: Ask "Could this match unintended elements?" Prefer narrow over broad + filter
- Observation: Ask "Can this recur?" Use appropriate once/timeout settings
- Visibility: CSS first (instant), JS as supplement (for dynamic changes)
