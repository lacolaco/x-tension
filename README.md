# x-tension

x.com の体験を向上させるブラウザ拡張機能。

## 機能

### Force Following Tab
ホームタイムラインを自動的に「Following」タブ（Latest順）に切り替える。「For You」タブを非表示にして誤クリックを防止。

### Hide Sidebar Sections
右サイドバーの邪魔なセクションを非表示にする:
- プレミアムにサブスクライブ
- おすすめユーザー
- 本日のニュース
- トレンド（「いま」を見つけよう）

検索ボックスは維持される。

**対応言語**: 日本語・英語のみ。x.comのaria-label属性に依存しているため、他の言語では動作しない可能性がある。

## インストール

### Chrome
1. [Releases](https://github.com/lacolaco/x-tension/releases) から `x-tension-*-chrome.zip` をダウンロード
2. 解凍する
3. `chrome://extensions` を開く
4. 「デベロッパーモード」を有効化
5. 「パッケージ化されていない拡張機能を読み込む」でフォルダを選択

### Firefox
1. [Releases](https://github.com/lacolaco/x-tension/releases) から `x-tension-*-firefox.xpi` をダウンロード
2. `about:addons` を開く
3. 歯車アイコン → 「ファイルからアドオンをインストール」

## 開発

```bash
# 依存関係インストール
pnpm install

# 開発サーバー
pnpm dev:chrome
pnpm dev:firefox

# ビルド
pnpm build:chrome
pnpm build:firefox

# テスト
pnpm test:run

# Lint
pnpm lint
```

## ライセンス

MIT
