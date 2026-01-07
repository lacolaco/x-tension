/**
 * Force Following Tab (Latest) Feature
 *
 * Automatically switches x.com home timeline to "Following" tab with "Latest" sort.
 * Also hides the "For You" tab to prevent accidental switching.
 */

import { clickElement, waitForElement, delay, injectTemporaryStyle, query, queryAll } from '../dom-utils';
import { Selectors, TextPatterns } from '../x-com/selectors';

// =============================================================================
// Constants
// =============================================================================

/**
 * Timing constants for UI interactions.
 * These values are empirically determined based on x.com's React rendering behavior.
 */
const Timing = {
  /** Wait for tab switch animation to complete */
  TAB_SWITCH_DELAY: 300,
  /** Wait for tablist to appear on initial load */
  TABLIST_TIMEOUT: 10000,
  /** Wait for sort menu to appear after click */
  MENU_TIMEOUT: 2000,
  /** Initial delay to ensure tabs are fully rendered */
  INITIAL_RENDER_DELAY: 500,
} as const;

// =============================================================================
// DOM Query Functions (x.com-specific)
// =============================================================================

export function findTabs(): HTMLElement[] {
  return queryAll(document, Selectors.tab);
}

export function findActiveTab(): HTMLElement | null {
  return query(document, Selectors.activeTab);
}

export function findFollowingTab(): HTMLElement | null {
  return query(document, Selectors.followingTab);
}

export function findSortMenu(): HTMLElement | null {
  return query(document, Selectors.menu);
}

export function findMenuItems(menu: HTMLElement): HTMLElement[] {
  return queryAll(menu, Selectors.menuItem);
}

export function findLatestOption(menu: HTMLElement): HTMLElement | null {
  return findMenuItems(menu).find((item) => TextPatterns.latest.test(item.textContent || '')) ?? null;
}

// =============================================================================
// Tab Identification
// =============================================================================

export function isFollowingTab(tab: HTMLElement): boolean {
  return TextPatterns.following.test(tab.textContent || '');
}

export function isForYouTab(tab: HTMLElement): boolean {
  return TextPatterns.forYou.test(tab.textContent || '');
}

// =============================================================================
// DOM Manipulation (x.com-specific)
// =============================================================================

export function hideForYouTab(): void {
  const forYouTab = findTabs().find(isForYouTab);
  if (forYouTab) {
    forYouTab.style.display = 'none';
  }
}

export function closeMenu(): void {
  const target = query(document, Selectors.primaryColumn) ?? query(document, Selectors.header);
  target?.click();
}

export function hideMenuTemporarily(): () => void {
  return injectTemporaryStyle(
    'x-tension-hide-menu',
    `${Selectors.menu} { opacity: 0 !important; pointer-events: none !important; }`,
  );
}

// =============================================================================
// Core Logic
// =============================================================================

async function switchToFollowingTab(): Promise<boolean> {
  const activeTab = findActiveTab();
  if (activeTab && isFollowingTab(activeTab)) {
    return true;
  }

  const followingTab = findFollowingTab();
  if (!followingTab) {
    return false;
  }

  await clickElement(followingTab);
  await delay(Timing.TAB_SWITCH_DELAY);
  return true;
}

async function openSortMenu(followingTab: HTMLElement): Promise<HTMLElement | null> {
  const existing = findSortMenu();
  if (existing) {
    return existing;
  }
  await clickElement(followingTab);
  return waitForElement(Selectors.menu, Timing.MENU_TIMEOUT);
}

async function selectLatestSort(): Promise<void> {
  const followingTab = findFollowingTab();
  if (!followingTab) return;

  const showMenu = hideMenuTemporarily();

  try {
    const sortMenu = await openSortMenu(followingTab);
    if (!sortMenu) {
      return;
    }

    const latestOption = findLatestOption(sortMenu);
    if (latestOption) {
      await clickElement(latestOption);
    } else {
      closeMenu();
    }
  } finally {
    showMenu();
  }
}

async function ensureFollowingLatest(): Promise<void> {
  hideForYouTab();

  const switched = await switchToFollowingTab();
  if (!switched) return;

  await selectLatestSort();
}

// =============================================================================
// Tab Change Observer
// =============================================================================

function watchTabChanges(tabList: HTMLElement, callback: () => Promise<void>): () => void {
  const observer = new MutationObserver((mutations) => {
    const hasTabChange = mutations.some(
      (m) => m.attributeName === 'aria-selected' && (m.target as HTMLElement).getAttribute('role') === 'tab',
    );
    if (hasTabChange) {
      callback().catch((err: unknown) => {
        console.error('Tab change handler failed:', err);
      });
    }
  });

  observer.observe(tabList, {
    attributes: true,
    attributeFilter: ['aria-selected'],
    subtree: true,
  });

  return () => { observer.disconnect(); };
}

// =============================================================================
// Entry Point
// =============================================================================

async function applyForceFollowingLatest(): Promise<(() => void) | null> {
  const tabList = await waitForElement(Selectors.tabList, Timing.TABLIST_TIMEOUT);
  if (!tabList) {
    return null;
  }

  await delay(Timing.INITIAL_RENDER_DELAY);
  await ensureFollowingLatest();

  return watchTabChanges(tabList, () => ensureFollowingLatest());
}

const MARKER_ATTR = 'data-x-tension-force-following';

/**
 * Initialize the force-following-tab feature.
 * Uses DOM marker to prevent duplicate initialization.
 * Cleanup is handled by page reload when settings change.
 */
export function initForceFollowingTab(): void {
  const setup = () => {
    if (document.body.hasAttribute(MARKER_ATTR)) {
      return;
    }
    document.body.setAttribute(MARKER_ATTR, '');

    applyForceFollowingLatest().catch((err: unknown) => {
      console.error('Failed to apply force following:', err);
    });
  };

  if (location.pathname === '/home') {
    setup();
  }

  window.addEventListener('popstate', () => {
    if (location.pathname === '/home') {
      setup();
    }
  });
}
