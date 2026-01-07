import { Observable } from 'rxjs';
import { getFeatureFlags, watchFeatureFlags } from '../lib/storage';
import { initForceFollowingTab } from '../lib/features/force-following-tab';

const navigation$ = new Observable<string>((subscriber) => {
  subscriber.next(location.pathname);

  const listener = (message: unknown) => {
    if (typeof message === 'object' && message !== null) {
      const msg = message as Record<string, unknown>;
      if (msg.type === 'navigate' && typeof msg.pathname === 'string') {
        subscriber.next(msg.pathname);
      }
    }
  };

  browser.runtime.onMessage.addListener(listener);
  return () => {
    browser.runtime.onMessage.removeListener(listener);
  };
});

export default defineContentScript({
  matches: ['*://x.com/*', '*://twitter.com/*'],
  async main() {
    const flags = await getFeatureFlags();

    if (flags.forceFollowingLatest) {
      initForceFollowingTab(navigation$);
    }

    watchFeatureFlags((newFlags, oldFlags) => {
      if (newFlags.forceFollowingLatest !== oldFlags.forceFollowingLatest) {
        location.reload();
      }
    });
  },
});
