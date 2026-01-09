/**
 * Hide Sidebar Sections Feature
 *
 * Hides promotional and distracting sections from x.com sidebar:
 * - Subscribe to Premium
 * - Who to follow
 * - Today's News
 * - Trending now
 *
 * Uses CSS-First approach for instant hiding (prevents FOUC).
 *
 * ## Implementation Limitations
 *
 * - **Locale Support**: Only Japanese (ja) and English (en) locales are supported.
 *   Other locales may not work due to aria-label selectors being locale-dependent.
 *   To add support: See `x-com/selectors.ts:SidebarAriaLabels`.
 *
 * - **Browser Support**: Requires CSS `:has()` pseudo-class support.
 *   Chrome 105+, Firefox 121+, Safari 15.4+.
 *
 * - **DOM Assumptions**: Assumes sidebar exists in document's main DOM tree
 *   (not Shadow DOM). If x.com adopts Shadow DOM, this approach will require
 *   refactoring to inject styles into shadow roots.
 *
 * - **Style Priority**: Uses `!important` to override x.com styles.
 *   If x.com uses inline styles or higher specificity, hiding may fail.
 *
 * @module features/hide-sidebar-sections
 * @see {@link initHideSidebarSections} for entry point
 */

import { injectStyle } from '../dom-utils';
import { Selectors, SidebarAriaLabels, SidebarTestIds } from '../x-com/selectors';

// =============================================================================
// Constants
// =============================================================================

/** Style element ID for deduplication */
const HIDE_SIDEBAR_STYLE_ID = 'x-tension-hide-sidebar-sections';

// =============================================================================
// Public API
// =============================================================================

/**
 * Initialize hide-sidebar-sections feature.
 * Injects CSS to hide sidebar sections. No cleanup needed (page reload on settings change).
 *
 * Called by: `entrypoints/content.ts` during page load
 */
export function initHideSidebarSections(): void {
  injectStyle(HIDE_SIDEBAR_STYLE_ID, generateHideCSS());
}

// =============================================================================
// CSS Utilities
// =============================================================================

/**
 * Escape a string for use in CSS attribute selectors.
 * Uses native CSS.escape when available (browsers), falls back to manual escape (JSDOM/tests).
 */
function escapeCSSValue(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  // Fallback for JSDOM: Only escapes backslashes and quotes.
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// =============================================================================
// CSS Generation - Per-Section Builders
// =============================================================================

/**
 * Generate selector to hide Premium subscription section.
 * Target parent div to remove border/frame.
 * Excludes elements containing search input to avoid hiding search box.
 */
function generatePremiumSelectors(sidebarSelector: string): string[] {
  return SidebarAriaLabels.premium.map(
    (label) =>
      `${sidebarSelector} div:has(aside[aria-label="${escapeCSSValue(label)}"]):not(:has(${Selectors.searchInput}))`,
  );
}

/**
 * Generate selector to hide Who-to-follow section.
 * Same pattern as Premium.
 */
function generateWhoToFollowSelectors(sidebarSelector: string): string[] {
  return SidebarAriaLabels.whoToFollow.map(
    (label) =>
      `${sidebarSelector} div:has(aside[aria-label="${escapeCSSValue(label)}"]):not(:has(${Selectors.searchInput}))`,
  );
}

/**
 * Generate selector to hide News section.
 * Uses data-testid (locale-independent).
 * Excludes search box via :not(:has(searchInput)).
 */
function generateNewsSelectors(sidebarSelector: string): string[] {
  return [
    `${sidebarSelector} div:has([data-testid="${SidebarTestIds.news}"]):not(:has(${Selectors.searchInput}))`,
  ];
}

/**
 * Generate selector to hide Trends section.
 * Wrapped in section element, not aside.
 */
function generateTrendsSelectors(sidebarSelector: string): string[] {
  return SidebarAriaLabels.trends.map(
    (label) =>
      `${sidebarSelector} section:has([aria-label="${escapeCSSValue(label)}"]):not(:has(${Selectors.searchInput}))`,
  );
}

/**
 * Generate complete CSS to hide all sidebar sections.
 */
function generateHideCSS(): string {
  const sb = Selectors.sidebarColumn;

  const allSelectors = [
    ...generatePremiumSelectors(sb),
    ...generateWhoToFollowSelectors(sb),
    ...generateNewsSelectors(sb),
    ...generateTrendsSelectors(sb),
  ];

  return `${allSelectors.join(',\n')} {\n  display: none !important;\n}`;
}
