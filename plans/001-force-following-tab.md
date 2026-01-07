# 機能計画書: ホームタブを「フォロー中（最新）」に固定

## 概要

x.comのホーム画面において、ページ読み込み時にタブ選択を常に「フォロー中（Following）」の「最新（Latest）」モードに固定する機能。

## 背景調査

### x.comの現状（2025年）
- ホーム画面には「おすすめ（For you）」と「フォロー中（Following）」の2つのタブが存在
- **デフォルトでは「おすすめ」タブが選択される**
- **「フォロー中」タブ内にも「人気（Popular）」と「最新（Latest）」の2つのソートオプションがある**
- **「フォロー中」タブもデフォルトで「人気」（Grokアルゴリズムによるランキング）が選択される**
- ReactベースのSPAで、`data-testid`属性がDOM要素の識別に使用されている

### ゴール
1. 「おすすめ」→「フォロー中」タブへの切り替え
2. 「フォロー中」タブ内で「人気」→「最新」への切り替え

この2段階の操作を自動化する必要がある。

### 既存の類似拡張機能
[Control Panel for Twitter](https://github.com/insin/control-panel-for-twitter) が同様の機能を提供：
- Reactの内部状態（`__reactProps`）を読み取りタブ状態を検出
- `data-testid="AppTabBar_Home_Link"` でナビゲーション要素を特定
- DOM変更が頻繁にあり、v4.17.1でタブ関連の修正が行われた

## 実装案

### 案A: DOM監視 + クリックシミュレーション（推奨）

**概要**: MutationObserverでUI要素の出現を監視し、2段階のクリック操作を自動実行

**実装方法**:
1. Content Scriptで `/home` ページを検出
2. MutationObserverでタブコンテナの出現を監視
3. **Step 1**: 「フォロー中」タブをクリック（`[role="tab"]` または `data-testid` で特定）
4. **Step 2**: ソートオプションUI（ドロップダウンまたはメニュー）から「最新」を選択
5. 状態が既に正しい場合はスキップ

**長所**:
- 実装がシンプル
- WXT/Angularスタックと自然に統合可能
- デバッグが容易
- 2段階の操作を順次実行可能

**短所**:
- DOM構造変更に対する脆弱性
- 一瞬「おすすめ」や「人気」が表示される可能性（フラッシュ）
- ソートオプションUIの出現タイミング調整が必要

**リスク**: 中（DOM構造変更への対応が必要）

---

### 案B: React内部状態の操作

**概要**: Reactの内部状態を直接操作してタブ選択とソートモードを変更

**実装方法**:
1. `__reactProps` または `__reactFiber` を介してReactコンポーネントにアクセス
2. 内部storeからタブ状態・ソートモードを読み取り・書き換え
3. 必要に応じてre-renderをトリガー

**長所**:
- より深いレベルでの制御
- UIフラッシュを回避できる可能性
- 2段階を一度に処理できる可能性

**短所**:
- 実装が非常に複雑
- Reactのバージョン・内部構造の変更に脆弱
- デバッグが困難
- セキュリティ制限（CSP）に抵触する可能性

**リスク**: 高（メンテナンスコストが高い）

---

### 案C: CSSによる不要UI隠蔽 + 自動ナビゲーション

**概要**: 「おすすめ」タブと「人気」オプションをCSSで非表示にし、選択肢を限定

**実装方法**:
1. Content Scriptで「おすすめ」タブにCSSを適用して非表示
2. 「人気」ソートオプションも非表示
3. 初回ロード時に「フォロー中」→「最新」を順次クリック
4. ユーザーには「フォロー中（最新）」のみが見える状態を維持

**長所**:
- UIの一貫性が高い
- ユーザーが誤って他のモードを選択することを防止

**短所**:
- ユーザーが意図的に「おすすめ」や「人気」を見たい場合に対応できない
- 機能のオン/オフ切り替え時のUI更新が複雑

**リスク**: 中（UXの制限）

## 採用案

**案A（DOM監視 + クリックシミュレーション）+ おすすめタブ非表示**

追加仕様:
- 「おすすめ」タブはCSSで非表示にする
- ユーザーには「フォロー中」タブのみが見える状態

### DOM要素参照の方針

**セマンティック/アクセシビリティ属性を優先**し、DOM構造変更への耐性を高める:

1. **最優先**: WAI-ARIA属性（`role`, `aria-selected`, `aria-label`）
2. **次点**: セマンティックHTML要素（`nav`, `button`, `menu`）
3. **フォールバック**: `data-testid`（実装詳細だが安定性が高い場合）
4. **最終手段**: テキストコンテンツによるマッチング

```typescript
// 良い例: アクセシビリティ属性ベース
const tabs = document.querySelectorAll('[role="tab"]');
const activeTab = document.querySelector('[role="tab"][aria-selected="true"]');

// 避けるべき例: クラス名や構造依存
const tabs = document.querySelectorAll('.css-1234 > div > span');
```

## 技術設計（案A採用時）

### ファイル構成
```
entrypoints/
  content.ts              # Content Script エントリーポイント
lib/
  features/
    force-following-tab.ts  # 機能実装
  storage.ts              # フラグ永続化（browser.storage.local）
  feature-flags.ts        # 機能フラグ管理
```

### Content Script マッチパターン
```typescript
export default defineContentScript({
  matches: ['*://x.com/*', '*://twitter.com/*'],
  main() {
    // 機能初期化
  },
});
```

### フラグ管理
```typescript
interface FeatureFlags {
  forceFollowingLatest: boolean;  // フォロー中（最新）に固定
  // 将来の機能フラグ
}
```

### 処理フロー
```
1. /home ページ検出
2. MutationObserver でタブUI出現を監視
3. Step 0: 「おすすめ」タブをCSSで非表示
4. Step 1: 「フォロー中」タブがアクティブか確認
   - No → クリックして切り替え、Step 2へ
   - Yes → Step 2へ
5. Step 2: ソートオプションUIを探索
   - 「最新」が選択されているか確認
   - No → ソートメニューを開いて「最新」を選択
   - Yes → 完了
6. ページ内ナビゲーション時は再実行
```

### DOM セレクタ戦略（実機検証済み: 2025-01）

#### タブ構造
```
[role="tab"] × 3
├── [0] おすすめ (aria-selected, aria-haspopup=null)
├── [1] フォロー中 (aria-selected, aria-haspopup="menu") ← ソートメニュー付き
└── [2] コミュニティ (aria-selected, aria-haspopup=null)
```

#### ソートメニュー構造
```
[role="menu"]
├── [role="menuitem"] 人気 (SVGなし = 未選択)
└── [role="menuitem"] 最新 (SVGあり = 選択中)
```

#### 実装コード
```typescript
// タブの特定
function findTabs(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="tab"]'));
}

function findActiveTab(): HTMLElement | null {
  return document.querySelector('[role="tab"][aria-selected="true"]');
}

// タブの識別: textContent で判定（aria-label は null）
function isFollowingTab(tab: HTMLElement): boolean {
  const text = tab.textContent || '';
  return /following|フォロー中/i.test(text);
}

function isForYouTab(tab: HTMLElement): boolean {
  const text = tab.textContent || '';
  return /for you|おすすめ/i.test(text);
}

// フォロー中タブは aria-haspopup="menu" を持つ
function findFollowingTab(): HTMLElement | null {
  return document.querySelector('[role="tab"][aria-haspopup="menu"]');
}

// ソートメニュー
function findSortMenu(): HTMLElement | null {
  return document.querySelector('[role="menu"]');
}

function findMenuItems(menu: HTMLElement): HTMLElement[] {
  return Array.from(menu.querySelectorAll('[role="menuitem"]'));
}

// 選択状態: SVG要素の有無で判定
function isMenuItemSelected(item: HTMLElement): boolean {
  return item.querySelector('svg') !== null;
}

function findLatestOption(menu: HTMLElement): HTMLElement | null {
  const items = findMenuItems(menu);
  return items.find(item => {
    const text = item.textContent || '';
    return /latest|最新/i.test(text);
  }) || null;
}

function isLatestSelected(menu: HTMLElement): boolean {
  const latest = findLatestOption(menu);
  return latest ? isMenuItemSelected(latest) : false;
}
```

### CSS注入（おすすめタブ非表示）
```typescript
function injectStyles(): void {
  const style = document.createElement('style');
  style.id = 'x-tension-styles';
  style.textContent = `
    /* おすすめタブを非表示（textContentベースなのでCSS単独では不可、JSで対応） */
  `;
  document.head.appendChild(style);
}

// JSでおすすめタブを非表示
function hideForYouTab(): void {
  const tabs = findTabs();
  const forYouTab = tabs.find(isForYouTab);
  if (forYouTab) {
    forYouTab.style.display = 'none';
  }
}
```

### 注意点
- `aria-label` は全タブで `null` → `textContent` で識別
- フォロー中タブのみ `aria-haspopup="menu"` を持つ（識別に利用可能）
- ソートメニューの選択状態は **SVG要素（チェックマーク）の有無** で判定
- メニューを開くにはフォロー中タブをクリック（`aria-expanded` が切り替わる）
- 多言語対応（英語/日本語）を考慮したパターンマッチング

## 次のステップ

1. ~~実機でx.comのDOM構造を検証し、セレクタの動作確認~~ ✅ 完了
2. 実装開始

## 決定事項

- [x] 採用する実装案: **案A + おすすめタブ非表示**
- [x] DOM参照方針: **セマンティック/アクセシビリティ属性優先**
- [x] DOM構造検証: **2025-01 実機確認済み**
  - タブ識別: `textContent` ベース（`aria-label` は null）
  - フォロー中タブ: `aria-haspopup="menu"` で識別可能
  - ソート選択状態: `svg` 要素の有無で判定
