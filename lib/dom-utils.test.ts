import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  clickElement,
  waitForElement,
  delay,
  injectTemporaryStyle,
  findElementByText,
  queryAll,
  query,
} from './dom-utils';

describe('dom-utils', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('clickElement', () => {
    it('should call click on the element', async () => {
      const element = document.createElement('button');
      const clickSpy = vi.spyOn(element, 'click');

      await clickElement(element);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should resolve after default delay (100ms)', async () => {
      const element = document.createElement('button');
      const start = Date.now();

      await clickElement(element);

      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90);
    });

    it('should accept custom delay', async () => {
      const element = document.createElement('button');
      const start = Date.now();

      await clickElement(element, 50);

      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(40);
      expect(elapsed).toBeLessThan(100);
    });
  });

  describe('waitForElement', () => {
    it('should resolve immediately if element exists', async () => {
      document.body.innerHTML = '<div id="target">Target</div>';

      const element = await waitForElement('#target');

      expect(element).not.toBeNull();
      expect(element?.textContent).toBe('Target');
    });

    it('should resolve when element appears', async () => {
      setTimeout(() => {
        const div = document.createElement('div');
        div.id = 'delayed';
        div.textContent = 'Delayed';
        document.body.appendChild(div);
      }, 50);

      const element = await waitForElement('#delayed', 1000);

      expect(element).not.toBeNull();
      expect(element?.textContent).toBe('Delayed');
    });

    it('should resolve with null on timeout', async () => {
      const element = await waitForElement('#nonexistent', 100);

      expect(element).toBeNull();
    });

    it('should accept function selector', async () => {
      document.body.innerHTML = '<div class="target">Target</div>';

      const element = await waitForElement(() => document.querySelector<HTMLElement>('.target'));

      expect(element).not.toBeNull();
    });
  });

  describe('delay', () => {
    it('should resolve after specified time', async () => {
      const start = Date.now();

      await delay(50);

      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(45);
    });
  });

  describe('injectTemporaryStyle', () => {
    it('should inject style with given id and css', () => {
      const cleanup = injectTemporaryStyle('test-style', '.test { color: red; }');

      const style = document.getElementById('test-style');
      expect(style).not.toBeNull();
      expect(style?.textContent).toBe('.test { color: red; }');

      cleanup();
    });

    it('should remove style when cleanup is called', () => {
      const cleanup = injectTemporaryStyle('test-style', '.test { color: red; }');

      expect(document.getElementById('test-style')).not.toBeNull();

      cleanup();

      expect(document.getElementById('test-style')).toBeNull();
    });
  });

  describe('findElementByText', () => {
    it('should find element matching selector and text pattern', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="item">Apple</div>
        <div class="item">Banana</div>
        <div class="item">Cherry</div>
      `;

      const element = findElementByText(container, '.item', /banana/i);

      expect(element).not.toBeNull();
      expect(element?.textContent).toBe('Banana');
    });

    it('should return null if no match found', () => {
      const container = document.createElement('div');
      container.innerHTML = '<div class="item">Apple</div>';

      const element = findElementByText(container, '.item', /grape/i);

      expect(element).toBeNull();
    });
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
});
