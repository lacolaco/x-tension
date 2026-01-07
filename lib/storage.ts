export interface FeatureFlags {
  forceFollowingLatest: boolean;
}

const defaultFlags: FeatureFlags = {
  forceFollowingLatest: true,
};

const STORAGE_KEY = 'featureFlags';

function isFeatureFlags(value: unknown): value is FeatureFlags {
  return (
    typeof value === 'object' &&
    value !== null &&
    'forceFollowingLatest' in value &&
    typeof (value as Record<string, unknown>).forceFollowingLatest === 'boolean'
  );
}

function parseFeatureFlags(value: unknown): FeatureFlags {
  if (isFeatureFlags(value)) {
    return value;
  }
  return defaultFlags;
}

export async function getFeatureFlags(): Promise<FeatureFlags> {
  const result: Record<string, unknown> = await browser.storage.local.get(STORAGE_KEY);
  return parseFeatureFlags(result[STORAGE_KEY]);
}

export async function setFeatureFlags(flags: Partial<FeatureFlags>): Promise<void> {
  const current = await getFeatureFlags();
  await browser.storage.local.set({ [STORAGE_KEY]: { ...current, ...flags } });
}

export function watchFeatureFlags(
  callback: (newFlags: FeatureFlags, oldFlags: FeatureFlags) => void,
): () => void {
  const listener = (
    changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
    areaName: string,
  ) => {
    if (areaName === 'local' && STORAGE_KEY in changes) {
      const change = changes[STORAGE_KEY];
      callback(parseFeatureFlags(change.newValue), parseFeatureFlags(change.oldValue));
    }
  };
  browser.storage.onChanged.addListener(listener);
  return () => { browser.storage.onChanged.removeListener(listener); };
}
