import { ChangeDetectionStrategy, Component, linkedSignal, resource } from '@angular/core';
import { getFeatureFlags, setFeatureFlags } from '../../lib/storage';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-80 p-4' },
  template: `
    <div class="space-y-4">
      <h1 class="text-lg font-bold text-gray-100">x-tension</h1>

      <div class="space-y-3">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            class="w-4 h-4 accent-blue-500"
            [checked]="forceFollowingLatest()"
            (change)="toggleForceFollowingLatest()"
          />
          <span class="text-sm text-gray-200">フォロー中（最新）に固定</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            class="w-4 h-4 accent-blue-500"
            [checked]="hideSidebarSections()"
            (change)="toggleHideSidebarSections()"
          />
          <span class="text-sm text-gray-200">右サイドバーを簡素化</span>
        </label>
      </div>

      <p class="text-xs text-gray-500">
        設定変更後、x.comのページを再読み込みしてください
      </p>
    </div>
  `,
})
export class AppComponent {
  private readonly flagsResource = resource({
    loader: () => getFeatureFlags(),
  });

  readonly forceFollowingLatest = linkedSignal(() => this.flagsResource.value()?.forceFollowingLatest ?? true);
  readonly hideSidebarSections = linkedSignal(() => this.flagsResource.value()?.hideSidebarSections ?? true);

  toggleForceFollowingLatest(): void {
    const newValue = !this.forceFollowingLatest();
    this.forceFollowingLatest.set(newValue);

    setFeatureFlags({ forceFollowingLatest: newValue }).catch((err: unknown) => {
      console.error('Failed to save settings:', err);
      this.forceFollowingLatest.set(!newValue);
    });
  }

  toggleHideSidebarSections(): void {
    const newValue = !this.hideSidebarSections();
    this.hideSidebarSections.set(newValue);

    setFeatureFlags({ hideSidebarSections: newValue }).catch((err: unknown) => {
      console.error('Failed to save settings:', err);
      this.hideSidebarSections.set(!newValue);
    });
  }
}
