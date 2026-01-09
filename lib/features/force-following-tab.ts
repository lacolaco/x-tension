/**
 * Force Following Tab (Latest) Feature
 *
 * Automatically switches x.com home timeline to "Following" tab with "Latest" sort.
 * Also hides the "For You" tab to prevent accidental switching.
 */

import type { Observable } from 'rxjs';
import { injectStyle, queryAll, waitForElement } from '../dom-utils';
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

/**
 * Click Following tab and select "Latest" from the dropdown menu.
 * Menu hidden only during operation to avoid affecting search autocomplete.
 */
async function selectLatestFromMenu(followingTab: HTMLElement, signal: AbortSignal): Promise<void> {
  // Scope to primaryColumn to avoid sidebar menus; remove after operation to avoid autocomplete issues
  const styleEl = injectStyle(
    'x-tension-hide-menu',
    `${Selectors.primaryColumn} ${Selectors.menu} { opacity: 0 !important; pointer-events: none !important; }`,
  );

  try {
    followingTab.click();

    const menu = await waitForElement(Selectors.menu, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(Timing.MENU_TIMEOUT)]),
    });
    if (!menu) return;

    const menuItems = queryAll(menu, Selectors.menuItem);
    const latestOption = menuItems.find((item) => TextPatterns.latest.test(item.textContent || ''));
    if (!latestOption) {
      console.warn('[x-tension] Latest option not found in menu');
      return;
    }
    latestOption.click();
  } finally {
    styleEl.remove();
  }
}

async function activateFollowingTab(signal: AbortSignal): Promise<void> {
  const followingTab = await waitForElement(Selectors.tab, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(Timing.TAB_TIMEOUT)]),
    predicate: (el) => isFollowingTab(el),
  });
  if (!followingTab) return;

  await selectLatestFromMenu(followingTab, signal);
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

    // Start new operations for /home (fire-and-forget, abort handles cleanup)
    abortController = new AbortController();

    // Hide For You tab via CSS (always first tab on /home)
    injectStyle(
      'x-tension-hide-foryou-tab',
      `${Selectors.tabList} > ${Selectors.tabWrapper}:first-child { display: none !important; }`,
    );

    // One-shot activation (errors handled by abort, intentionally ignored)
    activateFollowingTab(abortController.signal).catch(() => {
      // Abort errors are expected and intentionally swallowed
    });
  });

  return () => {
    abortController?.abort();
    subscription.unsubscribe();
  };
}
