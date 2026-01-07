/**
 * Force Following Tab (Latest) Feature
 *
 * Automatically switches x.com home timeline to "Following" tab with "Latest" sort.
 * Also hides the "For You" tab to prevent accidental switching.
 */

import type { Observable } from 'rxjs';
import { injectStyle, observeElements, queryAll, waitForElement } from '../dom-utils';
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
 * Menu stays hidden permanently (user won't manually change sort order).
 */
async function selectLatestFromMenu(followingTab: HTMLElement, signal: AbortSignal): Promise<void> {
  // Hide menu permanently - no cleanup needed
  injectStyle(
    'x-tension-hide-menu',
    `${Selectors.menu} { opacity: 0 !important; pointer-events: none !important; }`,
  );

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
}

async function activateFollowingTab(signal: AbortSignal): Promise<void> {
  const followingTab = await waitForElement(Selectors.tab, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(Timing.TAB_TIMEOUT)]),
    predicate: (el) => isFollowingTab(el),
  });
  if (!followingTab) return;

  await selectLatestFromMenu(followingTab, signal);
}

/**
 * Continuously hide "For You" tab.
 * Monitors indefinitely because tab can be re-rendered by SPA.
 */
async function hideForYouTab(signal: AbortSignal): Promise<void> {
  for await (const forYouTab of observeElements(Selectors.tab, {
    signal,
    predicate: (el) => isForYouTab(el),
  })) {
    // Hide the wrapper element (not just tab) to avoid empty space
    const wrapper = forYouTab.parentElement?.closest<HTMLElement>(Selectors.tabWrapper);
    const target = wrapper ?? forYouTab;
    target.style.display = 'none';
  }
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

    // Immediately hide first tab via CSS (For You tab is always first on /home)
    // This prevents flash of unstyled content before JS runs
    injectStyle(
      'x-tension-hide-foryou-tab',
      `${Selectors.tabList} > ${Selectors.tabWrapper}:first-child { display: none !important; }`,
    );

    // Continuous monitoring (errors handled by abort, intentionally ignored)
    hideForYouTab(abortController.signal).catch(() => {
      // Abort errors are expected and intentionally swallowed
    });
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
