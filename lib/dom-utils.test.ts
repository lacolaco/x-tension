import { describe, it, expect, beforeEach } from 'vitest';
import { queryAll, query, waitForElement, observeElements } from './dom-utils';

describe('dom-utils', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  describe('queryAll', () => {
    it('should return all matching elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
      `;

      const elements = queryAll(container, '.item');

      expect(elements).toHaveLength(3);
    });

    it('should return empty array if no matches', () => {
      const container = document.createElement('div');
      container.innerHTML = '<div>No match</div>';

      const elements = queryAll(container, '.nonexistent');

      expect(elements).toHaveLength(0);
    });
  });

  describe('query', () => {
    it('should return first matching element', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="item">First</div>
        <div class="item">Second</div>
      `;

      const element = query(container, '.item');

      expect(element).not.toBeNull();
      expect(element?.textContent).toBe('First');
    });

    it('should return null if no match', () => {
      const container = document.createElement('div');
      container.innerHTML = '<div>No match</div>';

      const element = query(container, '.nonexistent');

      expect(element).toBeNull();
    });
  });

  describe('waitForElement', () => {
    it('should find existing element immediately', async () => {
      document.body.innerHTML = '<div class="target">Found</div>';

      const element = await waitForElement('.target');

      expect(element).not.toBeNull();
      expect(element?.textContent).toBe('Found');
    });

    it('should return null when aborted', async () => {
      const controller = new AbortController();
      controller.abort();

      const element = await waitForElement('.nonexistent', {
        signal: controller.signal,
      });

      expect(element).toBeNull();
    });

    it('should filter with predicate', async () => {
      document.body.innerHTML = `
        <div class="item">First</div>
        <div class="item">Second</div>
      `;

      const element = await waitForElement('.item', {
        predicate: (el) => el.textContent === 'Second',
      });

      expect(element?.textContent).toBe('Second');
    });
  });

  describe('observeElements', () => {
    it('should be an async iterable', () => {
      const iterable = observeElements('.target');

      expect(Symbol.asyncIterator in iterable).toBe(true);
    });
  });
});
