/**
 * x.com DOM Selectors and Patterns
 *
 * x.com-specific constants for DOM queries.
 * Single source of truth for all x.com element identification.
 *
 * @module x-com/selectors
 */

/**
 * CSS selectors for x.com structural elements.
 * These target stable attributes like data-testid and ARIA roles.
 *
 * Used by: force-following-tab, hide-sidebar-sections
 */
export const Selectors = {
  tab: '[role="tab"]',
  activeTab: '[role="tab"][aria-selected="true"]',
  tabList: '[role="tablist"]',
  tabWrapper: '[role="presentation"]',
  menu: '[role="menu"]',
  menuItem: '[role="menuitem"]',
  primaryColumn: '[data-testid="primaryColumn"]',
  sidebarColumn: '[data-testid="sidebarColumn"]',
  header: 'header[role="banner"]',
  /** Search input inside sidebar - used to avoid hiding search box */
  searchInput: '[data-testid="SearchBox_Search_Input"]',
} as const;

/**
 * Text patterns for matching tab/menu labels.
 * Uses regex for case-insensitive, locale-aware matching.
 *
 * Used by: force-following-tab
 */
export const TextPatterns = {
  following: /following|フォロー中/i,
  forYou: /for you|おすすめ/i,
  latest: /latest|最新/i,
} as const;

/**
 * Sidebar section aria-labels for Japanese and English locales.
 *
 * **Implementation Limitation**: Only Japanese (ja) and English (en) locales
 * are supported. Other locales will cause silent selector failures because
 * x.com serves different aria-label values based on user locale settings.
 *
 * To add support for additional locales:
 * 1. Visit x.com with that locale
 * 2. Inspect sidebar sections for aria-label values
 * 3. Add labels to appropriate arrays below
 *
 * Used by: hide-sidebar-sections
 */
export const SidebarAriaLabels = {
  /** "Subscribe to Premium" section */
  premium: ['プレミアムにサブスクライブ', 'Subscribe to Premium'],
  /** "Who to follow" recommendations section */
  whoToFollow: ['おすすめユーザー', 'Who to follow'],
  /** "Trending now" / "What's happening" section */
  trends: ['タイムライン: 速報', 'Timeline: Trending now'],
} as const;

/**
 * Stable data-testid attributes for sidebar sections.
 * Preferred over aria-labels when available (locale-independent).
 *
 * Used by: hide-sidebar-sections
 */
export const SidebarTestIds = {
  /** News/Today's news section */
  news: 'news_sidebar',
} as const;

/**
 * Navigation item hrefs (locale-independent).
 * Used by: hide-nav-items
 */
export const NavItemHrefs = {
  grok: '/i/grok',
  premium: '/i/premium_sign_up',
} as const;
