/**
 * x.com DOM Selectors and Patterns
 *
 * x.com-specific constants for DOM queries.
 */

export const Selectors = {
  tab: '[role="tab"]',
  activeTab: '[role="tab"][aria-selected="true"]',
  tabList: '[role="tablist"]',
  tabWrapper: '[role="presentation"]',
  menu: '[role="menu"]',
  menuItem: '[role="menuitem"]',
  primaryColumn: '[data-testid="primaryColumn"]',
  header: 'header[role="banner"]',
} as const;

export const TextPatterns = {
  following: /following|フォロー中/i,
  forYou: /for you|おすすめ/i,
  latest: /latest|最新/i,
} as const;
