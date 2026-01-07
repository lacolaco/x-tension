/**
 * Generic DOM Utilities
 *
 * Platform-agnostic utilities for DOM manipulation.
 */

/**
 * Simulate a click on an element with a small delay.
 */
export function clickElement(element: HTMLElement, delayMs = 100): Promise<void> {
  return new Promise((resolve) => {
    element.click();
    setTimeout(resolve, delayMs);
  });
}

/**
 * Wait for an element to appear in the DOM.
 */
export function waitForElement<T extends HTMLElement>(
  selector: string | (() => T | null),
  timeout = 5000,
): Promise<T | null> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const check = () => {
      const element = typeof selector === 'string' ? document.querySelector<T>(selector) : selector();
      if (element) {
        resolve(element);
        return;
      }
      if (Date.now() - startTime > timeout) {
        resolve(null);
        return;
      }
      requestAnimationFrame(check);
    };
    check();
  });
}

/**
 * Create a promise that resolves after a delay.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Temporarily inject a style and return a cleanup function.
 */
export function injectTemporaryStyle(id: string, css: string): () => void {
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
  return () => { style.remove(); };
}

/**
 * Find elements matching a selector and filter by text content.
 */
export function findElementByText(
  base: ParentNode,
  selector: string,
  pattern: RegExp,
): HTMLElement | null {
  const elements = Array.from(base.querySelectorAll<HTMLElement>(selector));
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- textContent can be null for some node types
  return elements.find((el) => pattern.test(el.textContent ?? '')) ?? null;
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
