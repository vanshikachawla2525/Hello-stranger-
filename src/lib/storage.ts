import { content as seedContent } from '../content/content';
import { SiteContent } from '../types/content';
import { SiteContentZodSchema } from '../content/schema';
import { supabaseService } from './supabase';

export type ContentRevision = {
  id: string;
  created_at: string;
  note: string;
  snapshot: SiteContent;
  changesSummary?: string[];
};

export type FieldDiff = {
  path: string;
  oldValue: string;
  newValue: string;
};

const DRAFT_KEY = 'hs_content_draft';
const PUBLISHED_KEY = 'hs_content_published_v1';
const REVISIONS_KEY = 'hs_content_revisions_v1';
const PREVIEW_KEY = 'hs_preview_mode';
const RECENTLY_DELETED_KEY = 'hs_recently_deleted_v1';

export type RecentlyDeletedItem = {
  id: string;
  itemType: string;
  label: string;
  itemData: any;
  deletedAt: string;
};

// Deep clone helper
const clone = <T>(val: T): T => JSON.parse(JSON.stringify(val));

function deepMerge<T extends Record<string, any>>(target: T, source: any): T {
  if (!source || typeof source !== 'object') return target;
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      key in target &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      (output as any)[key] = deepMerge((target as any)[key], source[key]);
    } else if (source[key] !== undefined) {
      (output as any)[key] = source[key];
    }
  }
  return output;
}

// Safe localStorage setter that intercepts QuotaExceededError and notifies UI
function safeSetLocalStorage(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e: any) {
    if (
      e?.name === 'QuotaExceededError' ||
      e?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      e?.code === 22 ||
      e?.code === 1014
    ) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('hs_storage_toast', {
            detail: 'Local storage is full — publish to Supabase or clear revision history',
          })
        );
      }
    }
    return false;
  }
}

export const storage = {
  // Synchronous read of published content (used on initial render, cached in localStorage with seed fallback)
  getPublished(): SiteContent {
    try {
      const saved = localStorage.getItem(PUBLISHED_KEY) || localStorage.getItem('content_published');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const merged = deepMerge(clone(seedContent as SiteContent), parsed);
          const validationResult = SiteContentZodSchema.safeParse(merged);
          if (validationResult.success) {
            return merged;
          }
          console.warn('Local cached published content failed schema validation, falling back to initial content:', validationResult.error);
        }
      }
    } catch (_) {}

    // If published document is not yet saved, check if a draft exists
    try {
      const draftSaved = localStorage.getItem(DRAFT_KEY) || localStorage.getItem('content_draft');
      if (draftSaved) {
        const parsedDraft = JSON.parse(draftSaved);
        if (parsedDraft && typeof parsedDraft === 'object') {
          const merged = deepMerge(clone(seedContent as SiteContent), parsedDraft);
          const validationResult = SiteContentZodSchema.safeParse(merged);
          if (validationResult.success) {
            return merged;
          }
        }
      }
    } catch (_) {}

    return clone(seedContent as SiteContent);
  },

  // Asynchronous fetch from Supabase 'content' table (falls back to local cache/seed)
  async fetchPublishedAsync(): Promise<SiteContent> {
    if (supabaseService.isConfigured()) {
      try {
        const remote = await supabaseService.fetchPublishedContent();
        if (remote && typeof remote === 'object' && Object.keys(remote).length > 0) {
          const merged = deepMerge(clone(seedContent as SiteContent), remote);
          const validationResult = SiteContentZodSchema.safeParse(merged);
          if (validationResult.success) {
            safeSetLocalStorage(PUBLISHED_KEY, JSON.stringify(merged));
            return merged;
          }
          console.warn('Fetched remote published content failed schema validation, falling back to initial content:', validationResult.error);
        }
      } catch (_) {
        // Fall back to local published cache silently
      }
    }
    return this.getPublished();
  },

  // Read draft content (used by admin editor)
  getDraft(): SiteContent {
    try {
      const saved = localStorage.getItem(DRAFT_KEY) || localStorage.getItem('content_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        return deepMerge(clone(seedContent as SiteContent), parsed);
      }
    } catch (e) {}
    // If no draft exists, start from published
    return this.getPublished();
  },

  // Save in-progress draft
  saveDraft(content: SiteContent): void {
    safeSetLocalStorage(DRAFT_KEY, JSON.stringify(content));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hs_draft_saved', { detail: content }));
    }
  },

  // Get recently deleted items (kept for 30 days)
  getRecentlyDeleted(): RecentlyDeletedItem[] {
    try {
      const saved = localStorage.getItem(RECENTLY_DELETED_KEY) || localStorage.getItem('hs_recently_deleted');
      if (saved) {
        const items: RecentlyDeletedItem[] = JSON.parse(saved);
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        return items.filter((item) => new Date(item.deletedAt).getTime() > thirtyDaysAgo);
      }
    } catch {}
    return [];
  },

  addRecentlyDeleted(itemType: string, label: string, itemData: any): void {
    const current = this.getRecentlyDeleted();
    const newItem: RecentlyDeletedItem = {
      id: `del_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      itemType,
      label,
      itemData: clone(itemData),
      deletedAt: new Date().toISOString(),
    };
    safeSetLocalStorage(RECENTLY_DELETED_KEY, JSON.stringify([newItem, ...current]));
  },

  removeRecentlyDeleted(id: string): void {
    const current = this.getRecentlyDeleted();
    safeSetLocalStorage(RECENTLY_DELETED_KEY, JSON.stringify(current.filter((c) => c.id !== id)));
  },

  clearAllRecentlyDeleted(): void {
    try {
      localStorage.removeItem(RECENTLY_DELETED_KEY);
      localStorage.removeItem('hs_recently_deleted');
    } catch {}
  },

  // Preview mode toggle
  isPreviewMode(): boolean {
    try {
      return localStorage.getItem(PREVIEW_KEY) === 'true';
    } catch {
      return false;
    }
  },

  setPreviewMode(enabled: boolean): void {
    try {
      localStorage.setItem(PREVIEW_KEY, String(enabled));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('hs_preview_mode_changed', { detail: enabled }));
      }
    } catch {}
  },

  // Difference calculator for change auditing
  getDiff(prev: SiteContent, curr: SiteContent): FieldDiff[] {
    const diffs: FieldDiff[] = [];

    const formatVal = (v: any): string => {
      if (v === null || v === undefined) return '';
      if (typeof v === 'string') return v;
      if (typeof v === 'number' || typeof v === 'boolean') return String(v);
      return JSON.stringify(v);
    };

    const compare = (a: any, b: any, currentPath: string) => {
      if (a === b) return;

      if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
        diffs.push({
          path: currentPath,
          oldValue: formatVal(a),
          newValue: formatVal(b),
        });
        return;
      }

      if (Array.isArray(a) || Array.isArray(b)) {
        if (JSON.stringify(a) !== JSON.stringify(b)) {
          diffs.push({
            path: currentPath,
            oldValue: `${Array.isArray(a) ? a.length : 0} items`,
            newValue: `${Array.isArray(b) ? b.length : 0} items`,
          });
        }
        return;
      }

      const allKeys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)]));
      for (const k of allKeys) {
        // Skip comparing raw asset data or IDs
        if (k === 'blurDataURL') continue;
        const subPath = currentPath ? `${currentPath}.${k}` : k;
        compare(a[k], b[k], subPath);
      }
    };

    compare(prev, curr, '');
    return diffs;
  },

  // Publish draft: writes to Supabase 'content' table (with fallback to local storage) and records revision
  async publish(
    content: SiteContent,
    note = 'Published update'
  ): Promise<{ success: boolean; revisionId: string; error?: string; remoteSaved: boolean }> {
    try {
      const currentPublished = this.getPublished();
      const diffs = this.getDiff(currentPublished, content);
      const changesSummary = diffs.slice(0, 10).map((d) => `${d.path}: updated`);

      const revisionId = `rev_${Date.now()}`;
      const newRevision: ContentRevision = {
        id: revisionId,
        created_at: new Date().toISOString(),
        note,
        snapshot: clone(content),
        changesSummary: changesSummary.length > 0 ? changesSummary : ['Minor adjustments'],
      };

      // 1. Commit to local storage and revision history first (with QuotaExceededError protection)
      const existingRevisions = this.getRevisions();
      const updatedRevisions = [newRevision, ...existingRevisions].slice(0, 50);
      safeSetLocalStorage(REVISIONS_KEY, JSON.stringify(updatedRevisions));
      safeSetLocalStorage(PUBLISHED_KEY, JSON.stringify(content));
      safeSetLocalStorage(DRAFT_KEY, JSON.stringify(content));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('hs_content_published', { detail: content }));
        window.dispatchEvent(new CustomEvent('hs_content_updated', { detail: content }));
      }

      // 2. Write to Supabase 'content' table if configured
      let remoteSaved = false;
      let remoteError: string | undefined;

      if (supabaseService.isConfigured()) {
        try {
          const remoteRes = await supabaseService.publishContent(content, note);
          if (remoteRes.success) {
            remoteSaved = true;
          } else {
            remoteError = remoteRes.error;
          }
        } catch (syncErr: any) {
          remoteError = syncErr?.message || 'Remote sync failed';
        }
      }

      return {
        success: true,
        revisionId,
        error: remoteError,
        remoteSaved,
      };
    } catch (e: any) {
      return { success: false, revisionId: '', error: e?.message || 'Publish failed', remoteSaved: false };
    }
  },

  // Get revision history
  getRevisions(): ContentRevision[] {
    try {
      const saved = localStorage.getItem(REVISIONS_KEY) || localStorage.getItem('content_revisions');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [];
  },

  // Restore previous revision into draft
  restoreRevision(revisionId: string): SiteContent | null {
    const revisions = this.getRevisions();
    const target = revisions.find((r) => r.id === revisionId);
    if (target) {
      const restored = clone(target.snapshot);
      this.saveDraft(restored);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('hs_draft_saved', { detail: restored }));
      }
      return restored;
    }
    return null;
  },

  // Clear revision history
  clearRevisions(): void {
    try {
      localStorage.removeItem(REVISIONS_KEY);
      localStorage.removeItem('content_revisions');
    } catch {}
  },
};
