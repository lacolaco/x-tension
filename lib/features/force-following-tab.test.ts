import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  findTabs,
  findActiveTab,
  findFollowingTab,
  findSortMenu,
  findMenuItems,
  findLatestOption,
  isFollowingTab,
  isForYouTab,
  hideForYouTab,
  closeMenu,
  hideMenuTemporarily,
} from './force-following-tab';

describe('force-following-tab', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('findTabs', () => {
    it('should find all elements with role="tab"', () => {
      document.body.innerHTML = `
        <div role="tablist">
          <div role="tab">Tab 1</div>
          <div role="tab">Tab 2</div>
          <div role="tab">Tab 3</div>
        </div>
      `;
      const tabs = findTabs();
      expect(tabs).toHaveLength(3);
    });

    it('should return empty array when no tabs exist', () => {
      document.body.innerHTML = '<div>No tabs</div>';
      const tabs = findTabs();
      expect(tabs).toHaveLength(0);
    });
  });

  describe('findActiveTab', () => {
    it('should find the tab with aria-selected="true"', () => {
      document.body.innerHTML = `
        <div role="tablist">
          <div role="tab" aria-selected="false">Tab 1</div>
          <div role="tab" aria-selected="true">Tab 2</div>
          <div role="tab" aria-selected="false">Tab 3</div>
        </div>
      `;
      const activeTab = findActiveTab();
      expect(activeTab).not.toBeNull();
      expect(activeTab?.textContent).toBe('Tab 2');
    });

    it('should return null when no tab is selected', () => {
      document.body.innerHTML = `
        <div role="tablist">
          <div role="tab" aria-selected="false">Tab 1</div>
        </div>
      `;
      const activeTab = findActiveTab();
      expect(activeTab).toBeNull();
    });
  });

  describe('findFollowingTab', () => {
    it('should find tab with aria-haspopup="menu"', () => {
      document.body.innerHTML = `
        <div role="tablist">
          <div role="tab">For you</div>
          <div role="tab" aria-haspopup="menu">Following</div>
        </div>
      `;
      const followingTab = findFollowingTab();
      expect(followingTab).not.toBeNull();
      expect(followingTab?.textContent).toBe('Following');
    });

    it('should return null when no Following tab exists', () => {
      document.body.innerHTML = `
        <div role="tablist">
          <div role="tab">Tab 1</div>
        </div>
      `;
      const followingTab = findFollowingTab();
      expect(followingTab).toBeNull();
    });
  });

  describe('findSortMenu', () => {
    it('should find element with role="menu"', () => {
      document.body.innerHTML = `
        <div role="menu">
          <div role="menuitem">Popular</div>
          <div role="menuitem">Latest</div>
        </div>
      `;
      const menu = findSortMenu();
      expect(menu).not.toBeNull();
    });

    it('should return null when no menu exists', () => {
      document.body.innerHTML = '<div>No menu</div>';
      const menu = findSortMenu();
      expect(menu).toBeNull();
    });
  });

  describe('findMenuItems', () => {
    it('should find all menu items', () => {
      document.body.innerHTML = `
        <div role="menu" id="menu">
          <div role="menuitem">Item 1</div>
          <div role="menuitem">Item 2</div>
        </div>
      `;
      const menu = document.getElementById('menu')!;
      const items = findMenuItems(menu);
      expect(items).toHaveLength(2);
    });
  });

  describe('findLatestOption', () => {
    it('should find Latest option by English text', () => {
      document.body.innerHTML = `
        <div role="menu" id="menu">
          <div role="menuitem">Popular</div>
          <div role="menuitem">Latest</div>
        </div>
      `;
      const menu = document.getElementById('menu')!;
      const latestItem = findLatestOption(menu);
      expect(latestItem).not.toBeNull();
      expect(latestItem?.textContent).toBe('Latest');
    });

    it('should find Latest option by Japanese text', () => {
      document.body.innerHTML = `
        <div role="menu" id="menu">
          <div role="menuitem">人気</div>
          <div role="menuitem">最新</div>
        </div>
      `;
      const menu = document.getElementById('menu')!;
      const latestItem = findLatestOption(menu);
      expect(latestItem).not.toBeNull();
      expect(latestItem?.textContent).toBe('最新');
    });

    it('should return null when Latest option not found', () => {
      document.body.innerHTML = `
        <div role="menu" id="menu">
          <div role="menuitem">Option 1</div>
        </div>
      `;
      const menu = document.getElementById('menu')!;
      const latestItem = findLatestOption(menu);
      expect(latestItem).toBeNull();
    });
  });

  describe('isFollowingTab', () => {
    it('should return true for English "Following"', () => {
      const tab = document.createElement('div');
      tab.textContent = 'Following';
      expect(isFollowingTab(tab)).toBe(true);
    });

    it('should return true for Japanese "フォロー中"', () => {
      const tab = document.createElement('div');
      tab.textContent = 'フォロー中';
      expect(isFollowingTab(tab)).toBe(true);
    });

    it('should return false for other text', () => {
      const tab = document.createElement('div');
      tab.textContent = 'For you';
      expect(isFollowingTab(tab)).toBe(false);
    });
  });

  describe('isForYouTab', () => {
    it('should return true for English "For you"', () => {
      const tab = document.createElement('div');
      tab.textContent = 'For you';
      expect(isForYouTab(tab)).toBe(true);
    });

    it('should return true for Japanese "おすすめ"', () => {
      const tab = document.createElement('div');
      tab.textContent = 'おすすめ';
      expect(isForYouTab(tab)).toBe(true);
    });

    it('should return false for other text', () => {
      const tab = document.createElement('div');
      tab.textContent = 'Following';
      expect(isForYouTab(tab)).toBe(false);
    });
  });

  describe('hideForYouTab', () => {
    it('should hide the For You tab by setting display: none', () => {
      document.body.innerHTML = `
        <div role="tablist">
          <div role="tab" id="for-you">For you</div>
          <div role="tab" aria-haspopup="menu">Following</div>
        </div>
      `;
      hideForYouTab();
      const forYouTab = document.getElementById('for-you')!;
      expect(forYouTab.style.display).toBe('none');
    });

    it('should do nothing when For You tab not found', () => {
      document.body.innerHTML = `
        <div role="tablist">
          <div role="tab">Other Tab</div>
        </div>
      `;
      expect(() => { hideForYouTab(); }).not.toThrow();
    });
  });

  describe('closeMenu', () => {
    it('should click on primaryColumn to close menu', () => {
      document.body.innerHTML = `
        <div data-testid="primaryColumn">Timeline</div>
      `;
      const timeline = document.querySelector<HTMLElement>('[data-testid="primaryColumn"]')!;
      const clickSpy = vi.spyOn(timeline, 'click');

      closeMenu();

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should fallback to header if primaryColumn not found', () => {
      document.body.innerHTML = `
        <header role="banner">Header</header>
      `;
      const header = document.querySelector<HTMLElement>('header[role="banner"]')!;
      const clickSpy = vi.spyOn(header, 'click');

      closeMenu();

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should do nothing if no target found', () => {
      document.body.innerHTML = '<div>No target</div>';
      expect(() => { closeMenu(); }).not.toThrow();
    });
  });

  describe('hideMenuTemporarily', () => {
    it('should inject style to hide menu', () => {
      const cleanup = hideMenuTemporarily();

      const style = document.getElementById('x-tension-hide-menu');
      expect(style).not.toBeNull();
      expect(style?.textContent).toContain('opacity: 0');

      cleanup();
    });

    it('should remove style when cleanup is called', () => {
      const cleanup = hideMenuTemporarily();

      expect(document.getElementById('x-tension-hide-menu')).not.toBeNull();

      cleanup();

      expect(document.getElementById('x-tension-hide-menu')).toBeNull();
    });
  });

});
