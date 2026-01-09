import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initHideSidebarSections } from './hide-sidebar-sections';

describe('hide-sidebar-sections', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('initHideSidebarSections', () => {
    describe('style injection', () => {
      it('should inject style element on initialization', () => {
        initHideSidebarSections();

        const styleElement = document.getElementById('x-tension-hide-sidebar-sections');
        expect(styleElement).not.toBeNull();
        expect(styleElement?.tagName).toBe('STYLE');
      });
    });

    describe('generated CSS', () => {
      it('should generate valid CSS with display:none', () => {
        initHideSidebarSections();

        const styleElement = document.getElementById('x-tension-hide-sidebar-sections');
        const css = styleElement?.textContent ?? '';

        expect(css).toContain('display: none !important');
      });

      it('should include Premium selectors', () => {
        initHideSidebarSections();

        const styleElement = document.getElementById('x-tension-hide-sidebar-sections');
        const css = styleElement?.textContent ?? '';

        expect(css).toContain('プレミアムにサブスクライブ');
        expect(css).toContain('Subscribe to Premium');
      });

      it('should include WhoToFollow selectors', () => {
        initHideSidebarSections();

        const styleElement = document.getElementById('x-tension-hide-sidebar-sections');
        const css = styleElement?.textContent ?? '';

        expect(css).toContain('おすすめユーザー');
        expect(css).toContain('Who to follow');
      });

      it('should include Trends selectors', () => {
        initHideSidebarSections();

        const styleElement = document.getElementById('x-tension-hide-sidebar-sections');
        const css = styleElement?.textContent ?? '';

        expect(css).toContain('タイムライン: 速報');
        expect(css).toContain('Timeline: Trending now');
      });

      it('should include News selector with data-testid', () => {
        initHideSidebarSections();

        const styleElement = document.getElementById('x-tension-hide-sidebar-sections');
        const css = styleElement?.textContent ?? '';

        expect(css).toContain('data-testid="news_sidebar"');
      });

      it('should exclude search input from News selector', () => {
        initHideSidebarSections();

        const styleElement = document.getElementById('x-tension-hide-sidebar-sections');
        const css = styleElement?.textContent ?? '';

        expect(css).toContain(':not(:has([data-testid="SearchBox_Search_Input"]))');
      });

      it('should use escapeCSSValue for labels without syntax errors', () => {
        initHideSidebarSections();

        const styleElement = document.getElementById('x-tension-hide-sidebar-sections');
        const css = styleElement?.textContent ?? '';

        expect(css).not.toContain('undefined');
        expect(css).not.toContain('null');
      });
    });

    describe('selector effectiveness against DOM structure', () => {
      it('should match Premium section in typical x.com DOM structure', () => {
        document.body.innerHTML = `
          <div data-testid="sidebarColumn">
            <div class="premium-wrapper">
              <aside aria-label="プレミアムにサブスクライブ">
                <h2>Premium</h2>
              </aside>
            </div>
          </div>
        `;

        initHideSidebarSections();

        const selector = '[data-testid="sidebarColumn"] div:has(aside[aria-label="プレミアムにサブスクライブ"])';
        const matchedElement = document.querySelector(selector);

        expect(matchedElement).not.toBeNull();
        expect(matchedElement?.classList.contains('premium-wrapper')).toBe(true);
      });

      it('should match WhoToFollow section in typical x.com DOM structure', () => {
        document.body.innerHTML = `
          <div data-testid="sidebarColumn">
            <div class="who-to-follow-wrapper">
              <aside aria-label="おすすめユーザー">
                <h2>Who to follow</h2>
              </aside>
            </div>
          </div>
        `;

        initHideSidebarSections();

        const selector = '[data-testid="sidebarColumn"] div:has(aside[aria-label="おすすめユーザー"])';
        const matchedElement = document.querySelector(selector);

        expect(matchedElement).not.toBeNull();
        expect(matchedElement?.classList.contains('who-to-follow-wrapper')).toBe(true);
      });

      it('should match News section using data-testid', () => {
        document.body.innerHTML = `
          <div data-testid="sidebarColumn">
            <div class="news-wrapper">
              <div data-testid="news_sidebar">
                <h2>Today's News</h2>
              </div>
            </div>
          </div>
        `;

        initHideSidebarSections();

        const selector = '[data-testid="sidebarColumn"] div:has([data-testid="news_sidebar"])';
        const matchedElement = document.querySelector(selector);

        expect(matchedElement).not.toBeNull();
        expect(matchedElement?.classList.contains('news-wrapper')).toBe(true);
      });

      it('should NOT match News section when search input is present in same ancestor', () => {
        document.body.innerHTML = `
          <div data-testid="sidebarColumn">
            <div class="search-and-news-container">
              <input data-testid="SearchBox_Search_Input" type="text" />
              <div data-testid="news_sidebar">
                <h2>Today's News</h2>
              </div>
            </div>
          </div>
        `;

        initHideSidebarSections();

        const selector = '[data-testid="sidebarColumn"] div:has([data-testid="news_sidebar"]):not(:has([data-testid="SearchBox_Search_Input"]))';
        const matchedElement = document.querySelector(selector);

        expect(matchedElement).toBeNull();
      });

      it('should match Trends section wrapped in section element', () => {
        document.body.innerHTML = `
          <div data-testid="sidebarColumn">
            <section class="trends-section">
              <div aria-label="タイムライン: 速報">
                <h2>Trends</h2>
              </div>
            </section>
          </div>
        `;

        initHideSidebarSections();

        const selector = '[data-testid="sidebarColumn"] section:has([aria-label="タイムライン: 速報"])';
        const matchedElement = document.querySelector(selector);

        expect(matchedElement).not.toBeNull();
        expect(matchedElement?.classList.contains('trends-section')).toBe(true);
      });
    });
  });
});
