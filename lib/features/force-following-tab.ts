/**
 * Force Following Tab (Latest) Feature
 *
 * Automatically switches x.com home timeline to "Following" tab with "Latest" sort.
 * Also hides the "For You" tab to prevent accidental switching.
 */

import type { Observable } from 'rxjs';
import { onElementAppear, injectStyle, queryAll } from '../dom-utils';
import { Selectors, TextPatterns } from '../x-com/selectors';

// =============================================================================
// Constants
// =============================================================================

const Timing = {
  // Tabs appear within 5s on average; 10s covers slow networks
  TAB_TIMEOUT: 10000,
  // Menus appear within 100ms typically; 2s is generous buffer
  MENU_TIMEOUT: 2000,
} as const;

// =============================================================================
// Tab Identification (exported for tests)
// =============================================================================

export function isFollowingTab(tab: HTMLElement): boolean {
  return TextPatterns.following.test(tab.textContent || '');
}

export function isForYouTab(tab: HTMLElement): boolean {
  return TextPatterns.forYou.test(tab.textContent || '');
}

// =============================================================================
// Core Logic
// =============================================================================

function findFollowingTab(): HTMLElement | null {
  const tabs = queryAll(document, Selectors.tab);
  return tabs.find(isFollowingTab) ?? null;
}

function findForYouTab(): HTMLElement | null {
  const tabs = queryAll(document, Selectors.tab);
  return tabs.find(isForYouTab) ?? null;
}

/**
 * Click Following tab and select "Latest" from the dropdown menu.
 * Menu stays hidden permanently (user won't manually change sort order).
 */
function selectLatestFromMenu(followingTab: HTMLElement, signal: AbortSignal): void {
  // Hide menu permanently - no cleanup needed
  injectStyle(
    'x-tension-hide-menu',
    `${Selectors.menu} { opacity: 0 !important; pointer-events: none !important; }`,
  );

  followingTab.click();

  // MutationObserver catches newly appeared menu (scoped by timing after click)
  onElementAppear(
    Selectors.menu,
    (menu) => {
      const menuItems = queryAll(menu, Selectors.menuItem);
      const latestOption = menuItems.find((item) => TextPatterns.latest.test(item.textContent || ''));
      if (!latestOption) {
        console.warn('[x-tension] Latest option not found in menu');
        return;
      }
      latestOption.click();
    },
    signal,
    { timeout: Timing.MENU_TIMEOUT, once: true },
  );
}

function activateFollowingTab(signal: AbortSignal): void {
  onElementAppear(
    findFollowingTab,
    (followingTab) => {
      selectLatestFromMenu(followingTab, signal);
    },
    signal,
    { timeout: Timing.TAB_TIMEOUT, once: true },
  );
}

/**
 * Continuously hide "For You" tab.
 * Uses timeout: 0 for indefinite monitoring because tab can be re-rendered by SPA.
 */
function hideForYouTab(signal: AbortSignal): void {
  onElementAppear(
    findForYouTab,
    (forYouTab) => {
      // Hide the wrapper element (not just tab) to avoid empty space
      const wrapper = forYouTab.parentElement?.closest<HTMLElement>(Selectors.tabWrapper);
      const target = wrapper ?? forYouTab;
      target.style.display = 'none';
    },
    signal,
    { timeout: 0 },
  );
}

// =============================================================================
// Entry Point
// =============================================================================

/**
 * Initialize force-following-tab feature.
 * Subscribes to navigation events and applies the feature on /home.
 */
export function initForceFollowingTab(navigation$: Observable<string>): () => void {
  let abortController: AbortController | null = null;

  const subscription = navigation$.subscribe((pathname) => {
    // Abort previous operations on any navigation
    abortController?.abort();

    if (pathname !== '/home') {
      abortController = null;
      return;
    }

    // Start new operations for /home
    abortController = new AbortController();
    hideForYouTab(abortController.signal); // Continuous monitoring
    activateFollowingTab(abortController.signal); // One-shot activation
  });

  return () => {
    abortController?.abort();
    subscription.unsubscribe();
  };
}
