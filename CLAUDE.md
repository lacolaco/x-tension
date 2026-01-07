# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WXT + Angularを使用したブラウザ拡張機能プロジェクト。Chrome/Firefoxの両方をサポート。
- **WXT**: ブラウザ拡張フレームワーク
- **Angular 21**: UIフレームワーク（Zoneless、Standalone）
- **@analogjs/vite-plugin-angular**: ViteでAngularをビルドするためのプラグイン

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

## WXT Conventions

- `defineBackground()`, `defineContentScript()` はWXTが自動インポートするグローバル関数
- `browser` APIはWXTが提供するクロスブラウザ互換ラッパー
- パスエイリアス: `@/` = プロジェクトルート
