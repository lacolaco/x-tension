import { describe, it, expect, beforeEach } from 'vitest';
import { isFollowingTab, isForYouTab } from './force-following-tab';

describe('force-following-tab', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
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
});
