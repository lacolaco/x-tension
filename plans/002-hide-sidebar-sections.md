# 機能計画書: 右サイドバーセクション非表示

## 概要

x.comの右サイドバーにある以下の要素を自動的に非表示にする機能：
- 本日のニュース（Today's News）
- 「いま」を見つけよう / What's happening（トレンド）
- プレミアムにサブスクライブ（Subscribe to Premium）
- おすすめユーザー（Who to follow）

## 背景調査

### 実測データ（2026-01-08）

ユーザーがDevToolsで実行したスクリプトにより取得：

#### aria-label を持つ要素

| セクション | 要素 | aria-label (日本語) | aria-label (英語) |
|-----------|------|---------------------|-------------------|
| プレミアム購読 | `ASIDE` | "プレミアムにサブスクライブ" | "Subscribe to Premium" |
| おすすめユーザー | `ASIDE` | "おすすめユーザー" | "Who to follow" |
| トレンド | `DIV` | "トレンド" | "Trending" |
| ニュース | `DIV` | "タイムライン: 速報" | "Timeline: Trending now" |

#### 見出し要素
- "本日のニュース" / "Today's News"
- "「いま」を見つけよう" / "What's happening"
- "おすすめユーザー" / "Who to follow"

#### サイドバー構造
```
[data-testid="sidebarColumn"]
  └─ [data-testid="Search"] (検索ボックス - 非表示対象外)
  └─ aside[aria-label="..."] または div[aria-label="..."]
```

### ゴール
1. 上記4セクションを非表示
2. 検索ボックスは表示を維持
3. 日英両言語に対応

## 実装案

### 案A: CSS-First（aria-label完全一致）【採用】

**概要**: aria-label属性を使ったCSSセレクタで即時非表示

**実装方法**:
```css
[data-testid="sidebarColumn"] aside[aria-label="プレミアムにサブスクライブ"],
[data-testid="sidebarColumn"] aside[aria-label="Subscribe to Premium"],
[data-testid="sidebarColumn"] aside[aria-label="おすすめユーザー"],
[data-testid="sidebarColumn"] aside[aria-label="Who to follow"],
[data-testid="sidebarColumn"] div[aria-label="トレンド"],
[data-testid="sidebarColumn"] div[aria-label="Trending"],
[data-testid="sidebarColumn"] div[aria-label="タイムライン: 速報"],
[data-testid="sidebarColumn"] div[aria-label="Timeline: Trending now"] {
  display: none !important;
}
```

**長所**:
- CSS即時適用でFOUCなし
- JS観測不要（シンプル）
- 実測データに基づく確実な識別

**短所**:
- aria-label変更時に壊れる
- 新言語追加時に更新必要

**リスク**: 低（aria-labelはアクセシビリティ要件で安定）

## 採用案

**案A: CSS-First（aria-label完全一致）**

### 設計方針

| 項目 | 決定 | 理由 |
|-----|------|------|
| セレクタ | aria-label完全一致 | 実測データに基づく確実な識別 |
| 非表示方法 | CSS-Firstのみ | aria-labelで完全識別可能なためJS不要 |
| 機能フラグ | 単一 `hideSidebarSections` | YAGNI、シンプル優先 |
| 適用範囲 | 全ページ | サイドバーは複数ページで表示される |

## 技術設計

### ファイル構成
```
lib/
├── x-com/
│   └── selectors.ts          # セレクタ追加
├── features/
│   └── hide-sidebar-sections.ts  # 新規作成
└── storage.ts                    # フラグ追加

entrypoints/
├── content.ts                    # 初期化追加
└── popup/
    └── app.component.ts          # UI追加
```

### 変更1: `lib/x-com/selectors.ts`

```typescript
// === Selectors に追加 ===
export const Selectors = {
  // ... 既存 ...
  primaryColumn: '[data-testid="primaryColumn"]',
  sidebarColumn: '[data-testid="sidebarColumn"]',  // 追加
  header: 'header[role="banner"]',
} as const;

// === 新規追加（TextPatterns の後） ===
/**
 * Sidebar section aria-labels (Japanese and English)
 */
export const SidebarAriaLabels = {
  premium: ['プレミアムにサブスクライブ', 'Subscribe to Premium'],
  whoToFollow: ['おすすめユーザー', 'Who to follow'],
  trends: ['トレンド', 'Trending'],
  news: ['タイムライン: 速報', 'Timeline: Trending now'],
} as const;
```

### 変更2: `lib/features/hide-sidebar-sections.ts`（新規作成）

```typescript
/**
 * Hide Sidebar Sections Feature
 *
 * Hides promotional and distracting sections from x.com sidebar.
 * Uses CSS-First approach with aria-label selectors.
 */

import { injectStyle } from '../dom-utils';
import { Selectors, SidebarAriaLabels } from '../x-com/selectors';

const STYLE_ID = 'x-tension-hide-sidebar-sections';

function generateHideCSS(): string {
  const sb = Selectors.sidebarColumn;
  const selectors: string[] = [];

  // Premium (ASIDE)
  for (const label of SidebarAriaLabels.premium) {
    selectors.push(`${sb} aside[aria-label="${label}"]`);
  }
  // Who to follow (ASIDE)
  for (const label of SidebarAriaLabels.whoToFollow) {
    selectors.push(`${sb} aside[aria-label="${label}"]`);
  }
  // Trends (DIV)
  for (const label of SidebarAriaLabels.trends) {
    selectors.push(`${sb} div[aria-label="${label}"]`);
  }
  // News (DIV)
  for (const label of SidebarAriaLabels.news) {
    selectors.push(`${sb} div[aria-label="${label}"]`);
  }

  return `${selectors.join(',\n')} {\n  display: none !important;\n}`;
}

export function initHideSidebarSections(): () => void {
  injectStyle(STYLE_ID, generateHideCSS());
  return () => {};
}
```

### 変更3: `lib/storage.ts`

```typescript
// === FeatureFlags インターフェース ===
export interface FeatureFlags {
  forceFollowingLatest: boolean;
  hideSidebarSections: boolean;  // 追加
}

// === defaultFlags ===
const defaultFlags: FeatureFlags = {
  forceFollowingLatest: true,
  hideSidebarSections: true,  // デフォルトON
};

// === isFeatureFlags 関数に追加 ===
function isFeatureFlags(value: unknown): value is FeatureFlags {
  return (
    typeof value === 'object' &&
    value !== null &&
    'forceFollowingLatest' in value &&
    typeof (value as Record<string, unknown>).forceFollowingLatest === 'boolean' &&
    'hideSidebarSections' in value &&
    typeof (value as Record<string, unknown>).hideSidebarSections === 'boolean'
  );
}
```

### 変更4: `entrypoints/content.ts`

```typescript
// === import追加 ===
import { initHideSidebarSections } from '../lib/features/hide-sidebar-sections';

// === main関数内に追加 ===
if (flags.hideSidebarSections) {
  initHideSidebarSections();
}

// === watchFeatureFlagsの条件に追加 ===
if (
  newFlags.forceFollowingLatest !== oldFlags.forceFollowingLatest ||
  newFlags.hideSidebarSections !== oldFlags.hideSidebarSections
) {
  location.reload();
}
```

### 変更5: `entrypoints/popup/app.component.ts`

```typescript
// === linkedSignal追加 ===
readonly hideSidebarSections = linkedSignal(() =>
  this.flagsResource.value()?.hideSidebarSections ?? true
);

// === トグルメソッド追加 ===
toggleHideSidebarSections(): void {
  const newValue = !this.hideSidebarSections();
  this.hideSidebarSections.set(newValue);
  setFeatureFlags({ hideSidebarSections: newValue }).catch((err: unknown) => {
    console.error('Failed to save settings:', err);
    this.hideSidebarSections.set(!newValue);
  });
}

// === テンプレートに追加 ===
<label class="flex items-center gap-3 cursor-pointer">
  <input
    type="checkbox"
    class="w-4 h-4 accent-blue-500"
    [checked]="hideSidebarSections()"
    (change)="toggleHideSidebarSections()"
  />
  <span class="text-sm text-gray-200">右サイドバーを簡素化</span>
</label>
```

## 検証方法

1. `pnpm dev` で開発サーバー起動
2. Chromeで拡張機能をリロード
3. x.comにアクセス
4. **確認項目**:
   - [ ] 右サイドバーの4セクションが非表示
   - [ ] 検索ボックスは表示されたまま
   - [ ] Popupの「サイドバーを整理」チェックボックスが表示
   - [ ] OFFにしてリロード→セクションが表示
5. `pnpm compile` で型チェック通過

## 決定事項

- [x] 採用する実装案: **案A: CSS-First（aria-label完全一致）**
- [x] DOM構造検証: **2026-01-08 実機確認済み**
