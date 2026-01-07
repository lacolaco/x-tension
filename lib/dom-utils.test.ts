import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  onElementAppear,
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

  describe('onElementAppear', () => {
    it('should call callback immediately if element exists', () => {
      document.body.innerHTML = '<div id="target">Target</div>';
      const callback = vi.fn();
      const controller = new AbortController();

      onElementAppear('#target', callback, controller.signal);

      expect(callback).toHaveBeenCalledTimes(1);
      expect((callback.mock.calls[0][0] as HTMLElement).textContent).toBe('Target');
    });

    it('should call callback when element appears', async () => {
      const callback = vi.fn();
      const controller = new AbortController();

      onElementAppear('#delayed', callback, controller.signal, { timeout: 1000 });

      expect(callback).not.toHaveBeenCalled();

      const div = document.createElement('div');
      div.id = 'delayed';
      div.textContent = 'Delayed';
      document.body.appendChild(div);

      await new Promise((r) => setTimeout(r, 50));

      expect(callback).toHaveBeenCalledTimes(1);
      expect((callback.mock.calls[0][0] as HTMLElement).textContent).toBe('Delayed');
    });

    it('should not call callback on timeout', async () => {
      const callback = vi.fn();
      const controller = new AbortController();

      onElementAppear('#nonexistent', callback, controller.signal, { timeout: 50 });

      await new Promise((r) => setTimeout(r, 100));

      expect(callback).not.toHaveBeenCalled();
    });

    it('should not call callback if signal is aborted before element appears', async () => {
      const callback = vi.fn();
      const controller = new AbortController();

      onElementAppear('#delayed', callback, controller.signal, { timeout: 1000 });
      controller.abort();

      const div = document.createElement('div');
      div.id = 'delayed';
      document.body.appendChild(div);

      await new Promise((r) => setTimeout(r, 50));

      expect(callback).not.toHaveBeenCalled();
    });

    it('should accept function selector', () => {
      document.body.innerHTML = '<div class="target">Target</div>';
      const callback = vi.fn();
      const controller = new AbortController();

      onElementAppear(() => document.querySelector<HTMLElement>('.target'), callback, controller.signal);

      expect(callback).toHaveBeenCalledTimes(1);
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
