import { getFeatureFlags, watchFeatureFlags } from '../lib/storage';
import { initForceFollowingTab } from '../lib/features/force-following-tab';

export default defineContentScript({
  matches: ['*://x.com/*', '*://twitter.com/*'],
  async main() {
    const flags = await getFeatureFlags();

    if (flags.forceFollowingLatest) {
      initForceFollowingTab();
    }

    watchFeatureFlags((newFlags, oldFlags) => {
      if (newFlags.forceFollowingLatest !== oldFlags.forceFollowingLatest) {
        location.reload();
      }
    });
  },
});
