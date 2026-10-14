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

const DRAFT_KEY = 'content_draft';
const PUBLISHED_KEY = 'content_published';
const REVISIONS_KEY = 'content_revisions';
const PREVIEW_KEY = 'hs_preview_mode';
const RECENTLY_DELETED_KEY = 'hs_recently_deleted';

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

export const storage = {
  // Synchronous read of published content (used on initial render, cached in localStorage with seed fallback)
  getPublished(): SiteContent {
    try {
      const saved = localStorage.getItem(PUBLISHED_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return deepMerge(clone(seedContent as SiteContent), parsed);
        }
      }
    } catch (e) {
      console.warn('Storage read of published content failed:', e);
    }

    // If published document is not yet saved, check if a draft exists
    try {
      const draftSaved = localStorage.getItem(DRAFT_KEY);
      if (draftSaved) {
        const parsedDraft = JSON.parse(draftSaved);
        if (parsedDraft && typeof parsedDraft === 'object') {
          return deepMerge(clone(seedContent as SiteContent), parsedDraft);
        }
      }
    } catch (e) {
      console.warn('Storage read of draft fallback failed:', e);
    }

    return clone(seedContent as SiteContent);
  },

  // Asynchronous fetch from Supabase 'content' table (falls back to local cache/seed)
  async fetchPublishedAsync(): Promise<SiteContent> {
    if (supabaseService.isConfigured()) {
      try {
        const remote = await supabaseService.fetchPublishedContent();
        if (remote && typeof remote === 'object') {
          const merged = deepMerge(clone(seedContent as SiteContent), remote);
          try {
            localStorage.setItem(PUBLISHED_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        }
      } catch (e) {
        console.warn('Failed to fetch published content from Supabase:', e);
      }
    }
    return this.getPublished();
  },

  // Read draft content (used by admin editor)
  getDraft(): SiteContent {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
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
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(content));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('hs_draft_saved', { detail: content }));
      }
    } catch (e) {
      console.error('Failed to save draft:', e);
    }
  },

  // Get recently deleted items (kept for 30 days)
  getRecentlyDeleted(): RecentlyDeletedItem[] {
    try {
      const saved = localStorage.getItem(RECENTLY_DELETED_KEY);
      if (saved) {
        const items: RecentlyDeletedItem[] = JSON.parse(saved);
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        return items.filter((item) => new Date(item.deletedAt).getTime() > thirtyDaysAgo);
      }
    } catch {}
    return [];
  },

  addRecentlyDeleted(itemType: string, label: string, itemData: any): void {
    try {
      const current = this.getRecentlyDeleted();
      const newItem: RecentlyDeletedItem = {
        id: `del_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        itemType,
        label,
        itemData: clone(itemData),
        deletedAt: new Date().toISOString(),
      };
      localStorage.setItem(RECENTLY_DELETED_KEY, JSON.stringify([newItem, ...current]));
    } catch (e) {
      console.error('Failed to record deleted item:', e);
    }
  },

  removeRecentlyDeleted(id: string): void {
    try {
      const current = this.getRecentlyDeleted();
      localStorage.setItem(RECENTLY_DELETED_KEY, JSON.stringify(current.filter((c) => c.id !== id)));
    } catch {}
  },

  // Asset usage tracking
  getAssetUsage(assetPath: string, content: SiteContent): string[] {
    const usages: string[] = [];
    if (!assetPath) return usages;

    if (content.hero?.panorama?.file === assetPath) usages.push('Hero Panorama');
    if (content.hero?.portrait?.file === assetPath) usages.push('Hero Portrait');
    if (content.hero?.portraitSecondary?.file === assetPath) usages.push('Hero Secondary Frame');

    content.noBigDeal?.polaroids?.forEach((p, i) => {
      if (p.photo?.file === assetPath) usages.push(`Scrapbook Polaroid #${i + 1}`);
    });

    content.drafts?.entries?.forEach((e, i) => {
      if (e.photo?.file === assetPath) usages.push(`Draft Entry #${i + 1}`);
    });

    content.childhood?.photos?.forEach((c, i) => {
      if (c.photo?.file === assetPath) usages.push(`Childhood Frame #${i + 1}`);
    });

    if (content.interludeBeas?.photo?.file === assetPath) usages.push('Beas Silence Photo');

    content.people?.forEach((p) => {
      if (p.photo?.file === assetPath) usages.push(`Person Node: ${p.name}`);
    });

    content.lucky?.forEach((l) => {
      if (l.photo?.file === assetPath) usages.push(`Lucky Word: ${l.word}`);
    });

    content.proud?.forEach((pr) => {
      if (pr.photo?.file === assetPath) usages.push(`Proud Milestone: ${pr.title}`);
    });

    if (content.notYet?.photo?.file === assetPath) usages.push('Not Yet Photo');

    content.dreams?.forEach((d) => {
      if (d.photo?.file === assetPath) usages.push(`Dream: ${d.place}`);
    });

    if (content.finale?.photo?.file === assetPath) usages.push('Finale Photo');
    if (content.audioTrack?.file === assetPath) usages.push('Ambient Audio Track');

    return usages;
  },

  replaceAssetEverywhere(oldPath: string, newPath: string, content: SiteContent): SiteContent {
    const copy: SiteContent = clone(content);

    const updateFile = (p: any) => {
      if (p && p.file === oldPath) p.file = newPath;
    };

    updateFile(copy.hero?.panorama);
    updateFile(copy.hero?.portrait);
    updateFile(copy.hero?.portraitSecondary);

    copy.noBigDeal?.polaroids?.forEach((pol) => updateFile(pol.photo));
    copy.drafts?.entries?.forEach((entry) => updateFile(entry.photo));
    copy.childhood?.photos?.forEach((ch) => updateFile(ch.photo));
    updateFile(copy.interludeBeas?.photo);
    copy.people?.forEach((person) => updateFile(person.photo));
    copy.lucky?.forEach((lw) => updateFile(lw.photo));
    copy.proud?.forEach((pr) => updateFile(pr.photo));
    updateFile(copy.notYet?.photo);
    copy.dreams?.forEach((dr) => updateFile(dr.photo));
    updateFile(copy.finale?.photo);
    if (copy.audioTrack?.file === oldPath) copy.audioTrack.file = newPath;

    return copy;
  },

  // Calculate field differences between previous published and current draft
  getDiff(prev: SiteContent, curr: SiteContent): FieldDiff[] {
    const diffs: FieldDiff[] = [];

    const compare = (o1: any, o2: any, path: string) => {
      if (o1 === o2) return;
      if (typeof o1 !== typeof o2) {
        diffs.push({ path, oldValue: String(o1), newValue: String(o2) });
        return;
      }
      if (typeof o1 !== 'object' || o1 === null || o2 === null) {
        diffs.push({ path, oldValue: String(o1), newValue: String(o2) });
        return;
      }
      if (Array.isArray(o1) || Array.isArray(o2)) {
        if (!Array.isArray(o1) || !Array.isArray(o2)) {
          diffs.push({
            path,
            oldValue: Array.isArray(o1) ? `Array(${o1.length})` : String(o1),
            newValue: Array.isArray(o2) ? `Array(${o2.length})` : String(o2),
          });
          return;
        }
        if (o1.length !== o2.length) {
          diffs.push({
            path: `${path}.length`,
            oldValue: `${o1.length} items`,
            newValue: `${o2.length} items`,
          });
        }
        const maxLen = Math.max(o1.length, o2.length);
        for (let i = 0; i < maxLen; i++) {
          compare(o1[i], o2[i], `${path}[${i}]`);
        }
      } else if (o1 && o2 && typeof o1 === 'object') {
        const allKeys = Array.from(new Set([...Object.keys(o1), ...Object.keys(o2)]));
        allKeys.forEach((k) => compare(o1[k], o2[k], path ? `${path}.${k}` : k));
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

      // 1. Write to Supabase 'content' table if configured
      let remoteSaved = false;
      let remoteError: string | undefined;

      if (supabaseService.isConfigured()) {
        const remoteRes = await supabaseService.publishContent(content, note);
        if (remoteRes.success) {
          remoteSaved = true;
        } else {
          remoteError = remoteRes.error;
          console.error('Failed to write published content to Supabase:', remoteRes.error);
        }
      }

      // 2. Save revision history locally (keep last 50)
      const existingRevisions = this.getRevisions();
      const updatedRevisions = [newRevision, ...existingRevisions].slice(0, 50);
      try {
        localStorage.setItem(REVISIONS_KEY, JSON.stringify(updatedRevisions));
      } catch {}

      // 3. Update local published cache and draft
      try {
        localStorage.setItem(PUBLISHED_KEY, JSON.stringify(content));
        localStorage.setItem(DRAFT_KEY, JSON.stringify(content));
      } catch {}

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('hs_content_published', { detail: content }));
        window.dispatchEvent(new CustomEvent('hs_content_updated', { detail: content }));
      }

      return {
        success: true,
        revisionId,
        error: remoteError,
        remoteSaved,
      };
    } catch (e: any) {
      console.error('Publish failed:', e);
      return { success: false, revisionId: '', error: e?.message || 'Publish failed', remoteSaved: false };
    }
  },

  // Get revision history
  getRevisions(): ContentRevision[] {
    try {
      const saved = localStorage.getItem(REVISIONS_KEY);
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
        window.dispatchEvent(new CustomEvent('hs_content_updated', { detail: enabled }));
      }
    } catch {}
  },
};
