/**
 * Hide Navigation Items Feature
 *
 * Hides promotional navigation items from x.com left sidebar:
 * - Grok
 * - Premium
 *
 * Uses CSS-First approach with href selectors (locale-independent).
 *
 * @module features/hide-nav-items
 */

import { injectStyle } from '../dom-utils';
import { NavItemHrefs } from '../x-com/selectors';

const STYLE_ID = 'x-tension-hide-nav-items';

/**
 * Generate CSS to hide navigation items.
 */
function generateHideCSS(): string {
  const selectors = [
    `nav[role="navigation"] a[href="${NavItemHrefs.grok}"]`,
    `nav[role="navigation"] a[href="${NavItemHrefs.premium}"]`,
  ];
  return `${selectors.join(',\n')} {\n  display: none !important;\n}`;
}

/**
 * Initialize hide-nav-items feature.
 * Called by: `entrypoints/content.ts` during page load
 */
export function initHideNavItems(): void {
  injectStyle(STYLE_ID, generateHideCSS());
}
