/**
 * Generic DOM Utilities
 *
 * Platform-agnostic utilities for DOM manipulation.
 * Provides an anti-corruption layer over third-party DOM libraries.
 */

import elementReady from 'element-ready';

// =============================================================================
// Types
// =============================================================================

/**
 * Options for waiting/observing DOM elements.
 */
export interface WaitForElementOptions {
  /** AbortSignal to cancel the operation */
  signal?: AbortSignal;
  /** Predicate to filter elements */
  predicate?: (element: HTMLElement) => boolean;
}

// =============================================================================
// Element Waiting (Anti-corruption layer for element-ready)
// =============================================================================

/**
 * Wait for a single element matching the selector to appear in the DOM.
 * Returns null if aborted or timed out.
 */
export async function waitForElement(
  selector: string,
  options: WaitForElementOptions = {},
): Promise<HTMLElement | null> {
  const element = await elementReady(selector, {
    signal: options.signal,
    stopOnDomReady: false,
    predicate: options.predicate,
  });
  return element ?? null;
}

// =============================================================================
// Style Injection
// =============================================================================

/**
 * Inject a style into the document head.
 * Returns the style element for later removal if needed.
 */
export function injectStyle(id: string, css: string): HTMLStyleElement {
  const existing = document.getElementById(id) as HTMLStyleElement | null;
  if (existing?.isConnected) {
    return existing;
  }
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
  return style;
}

/**
 * Find all elements matching a selector.
 */
export function queryAll(base: ParentNode, selector: string): HTMLElement[] {
  return Array.from(base.querySelectorAll<HTMLElement>(selector));
}

/**
 * Find a single element matching a selector.
 */
export function query(base: ParentNode, selector: string): HTMLElement | null {
  return base.querySelector<HTMLElement>(selector);
}

