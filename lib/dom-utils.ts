/**
 * Generic DOM Utilities
 *
 * Platform-agnostic utilities for DOM manipulation.
 */

/**
 * Watch for an element to appear in the DOM using MutationObserver.
 * Calls callback when element appears. With once=true, stops after first match.
 */
export function onElementAppear<T extends HTMLElement>(
  selector: string | (() => T | null),
  callback: (element: T) => void,
  signal: AbortSignal,
  options: { timeout?: number; once?: boolean } = {},
): void {
  const { timeout = 5000, once = false } = options;

  if (signal.aborted) return;

  const find = () => (typeof selector === 'string' ? document.querySelector<T>(selector) : selector());
  // Prevent duplicate notifications for same element instance (defense against race conditions)
  const seen = new WeakSet<T>();
  let done = false;

  function finish() {
    if (done) return;
    done = true;
    if (timerId !== undefined) clearTimeout(timerId);
    observer.disconnect();
    signal.removeEventListener('abort', finish);
  }

  function notify(element: T) {
    if (done || seen.has(element)) return;
    seen.add(element);
    try {
      callback(element);
    } catch (error) {
      console.error('[x-tension] onElementAppear callback failed:', error);
    }
    if (once) finish();
  }

  const observer = new MutationObserver(() => {
    const element = find();
    if (element) notify(element);
  });

  // timeout=0 disables timeout (monitor until abort)
  const timerId = timeout > 0 ? setTimeout(finish, timeout) : undefined;
  signal.addEventListener('abort', finish, { once: true });

  // Order matters: check existing → notify → start observer
  // This ensures we don't miss elements that exist before observer starts,
  // and WeakSet prevents duplicate notifications if observer fires for same element
  const existing = find();
  if (existing) notify(existing);
  observer.observe(document.body, { childList: true, subtree: true });
}

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

