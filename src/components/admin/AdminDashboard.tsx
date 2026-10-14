import React, { useState, useEffect, useMemo } from 'react';
import { SiteContent, Photo } from '../../types/content';
import { storage, ContentRevision, FieldDiff, RecentlyDeletedItem } from '../../lib/storage';
import { adminAuth } from '../../lib/adminAuth';
import {
  validateContentForPublish,
  auditPlaceholders,
  calculateRandomPoolCount,
  extractAllPhotos,
  hasEmoji,
} from '../../lib/validation';
import {
  LayoutDashboard,
  Sparkles,
  Camera,
  History,
  Settings,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Send,
  Save,
  RotateCcw,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Upload,
  Lock,
  Layers,
  FileText,
  AlertTriangle,
  Music,
  RefreshCw,
  FolderOpen,
  Monitor,
  Smartphone,
  ExternalLink,
  Database,
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { AdminChapterEditors } from './AdminChapterEditors';
import { supabaseService } from '../../lib/supabase';

export const AdminDashboard: React.FC<{ onExitAdmin: () => void }> = ({ onExitAdmin }) => {
  const {
    isPreviewMode: contextPreviewMode,
    setIsPreviewMode: setContextPreviewMode,
    reloadContent,
    applyPublishedContent,
  } = useContent();

  const [draft, setDraft] = useState<SiteContent>(() => storage.getDraft());
  const [published, setPublished] = useState<SiteContent>(() => storage.getPublished());
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [publishNote, setPublishNote] = useState('');
  const [revisions, setRevisions] = useState<ContentRevision[]>(() => storage.getRevisions());
  const [recentlyDeleted, setRecentlyDeleted] = useState<RecentlyDeletedItem[]>(() => storage.getRecentlyDeleted());
  const [isPreview, setIsPreview] = useState<boolean>(() => storage.isPreviewMode());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<string | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    try {
      const res = await supabaseService.checkConnection();
      setSupabaseStatusMsg(res.message);
      triggerToast(res.connected ? 'Supabase connection verified!' : 'Supabase check complete.');
    } catch (e: any) {
      setSupabaseStatusMsg(e?.message || 'Error testing Supabase');
      triggerToast('Error testing Supabase connection.');
    } finally {
      setIsTestingSupabase(false);
    }
  };

  // Media Library state
  const [mediaFilter, setMediaFilter] = useState<'all' | 'in-use' | 'unused'>('all');
  const [replaceModal, setReplaceModal] = useState<{ open: boolean; oldPath: string; newPath: string } | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auto-save draft changes every few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      storage.saveDraft(draft);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1200);
    return () => clearTimeout(timer);
  }, [draft]);

  // Calculations
  const diffsSincePublish = useMemo(() => {
    return storage.getDiff(published, draft);
  }, [published, draft]);

  const validation = useMemo(() => {
    return validateContentForPublish(draft);
  }, [draft]);

  const placeholderAudit = useMemo(() => {
    return auditPlaceholders(draft);
  }, [draft]);

  const randomPoolCount = useMemo(() => {
    return calculateRandomPoolCount(draft);
  }, [draft]);

  const allPhotos = useMemo(() => {
    return extractAllPhotos(draft);
  }, [draft]);

  // Deep update helper
  const updateDraft = (updater: (prev: SiteContent) => SiteContent) => {
    setDraft((prev) => {
      const next = updater(JSON.parse(JSON.stringify(prev)));
      storage.saveDraft(next);
      if (isPreview) {
        reloadContent();
      }
      return next;
    });
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    storage.saveDraft(draft);
    const result = await storage.publish(draft, publishNote || 'Published via Owner Portal');
    if (result.success) {
      setPublished(JSON.parse(JSON.stringify(draft)));
      setRevisions(storage.getRevisions());
      setShowPublishModal(false);
      setPublishNote('');
      applyPublishedContent(draft);
      reloadContent();
      if (result.remoteSaved) {
        triggerToast('Published successfully to Supabase! Live site is updated.');
      } else if (result.error) {
        triggerToast(`Published locally, but Supabase write failed: ${result.error}`);
      } else {
        triggerToast('Published successfully! (Local storage cache updated; configure Supabase to sync remotely)');
      }
    } else {
      triggerToast(`Publish failed: ${result.error || 'Unknown error'}`);
    }
    setIsPublishing(false);
  };

  const handleExitToSite = async () => {
    storage.saveDraft(draft);
    // Synchronize to published content so changes immediately reflect on the live website
    await storage.publish(draft, 'Synchronized on exit to site');
    applyPublishedContent(draft);
    reloadContent();
    onExitAdmin();
  };

  const handleRestoreRevision = (rev: ContentRevision) => {
    const restored = storage.restoreRevision(rev.id);
    if (restored) {
      setDraft(restored);
      if (isPreview) {
        reloadContent();
      }
      triggerToast(`Draft restored to revision from ${new Date(rev.created_at).toLocaleTimeString()}`);
    }
  };

  const togglePreview = () => {
    const next = !isPreview;
    setIsPreview(next);
    storage.setPreviewMode(next);
    setContextPreviewMode(next);
    reloadContent();
    triggerToast(next ? 'Preview mode ON: Public site will render draft' : 'Preview mode OFF: Public site renders published version');
  };

  const handlePhotoUpload = async (photoRef: Photo, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Slot-specific validation (Hero portrait must be a transparent PNG)
    if (photoRef.id === 'hero-portrait' && !file.type.includes('png')) {
      triggerToast('Hero Portrait recommended to be transparent PNG for best display.');
    }

    if (supabaseService.isConfigured()) {
      triggerToast(`Uploading ${file.name} to Supabase Storage...`);
      try {
        const { url, error } = await supabaseService.uploadPhoto(file, photoRef.id);
        if (url) {
          photoRef.file = url;
          setDraft((prev) => {
            const next = { ...prev };
            storage.saveDraft(next);
            if (isPreview) reloadContent();
            return next;
          });
          triggerToast('Photo uploaded to Supabase Storage!');
        } else {
          triggerToast(`Upload to Supabase Storage failed: ${error || 'Unknown error'}`);
        }
      } catch (err: any) {
        triggerToast(`Upload error: ${err?.message || err}`);
      } finally {
        e.target.value = '';
      }
    } else {
      triggerToast('Supabase Storage not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to store photos in Supabase Storage.');
      e.target.value = '';
    }
  };

  // Audio track handler (max 10MB, mp3 only)
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.mp3') && !file.type.includes('audio/mpeg') && !file.type.includes('audio/mp3')) {
      triggerToast('Ambient track must be an MP3 file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      triggerToast('Audio file size exceeds 10 MB limit.');
      return;
    }

    if (supabaseService.isConfigured()) {
      triggerToast('Uploading audio to Supabase Storage...');
      try {
        const { url, error } = await supabaseService.uploadAudio(file);
        if (url) {
          updateDraft((prev) => {
            prev.audioTrack = { file: url, title: file.name };
            return prev;
          });
          triggerToast('Ambient audio track uploaded to Supabase Storage!');
        } else {
          triggerToast(`Audio upload failed: ${error || 'Unknown error'}`);
        }
      } catch (err: any) {
        triggerToast(`Audio upload error: ${err?.message || err}`);
      } finally {
        e.target.value = '';
      }
    } else {
      triggerToast('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      e.target.value = '';
    }
  };

  // Item deletion helper with 30-day retention
  const deleteWithHistory = (itemType: string, label: string, itemData: any, executeDelete: () => void) => {
    storage.addRecentlyDeleted(itemType, label, itemData);
    setRecentlyDeleted(storage.getRecentlyDeleted());
    executeDelete();
    triggerToast(`"${label}" moved to recently deleted (kept for 30 days).`);
  };

  // Restore deleted item helper
  const restoreItem = (item: RecentlyDeletedItem) => {
    updateDraft((prev) => {
      if (item.itemType === 'drafts') {
        prev.drafts.entries.push(item.itemData);
      } else if (item.itemType === 'polaroids') {
        prev.noBigDeal.polaroids.push(item.itemData);
      } else if (item.itemType === 'childhood') {
        prev.childhood.photos.push(item.itemData);
      } else if (item.itemType === 'people') {
        prev.people.push(item.itemData);
      } else if (item.itemType === 'lucky') {
        prev.lucky.push(item.itemData);
      } else if (item.itemType === 'proud') {
        prev.proud.push(item.itemData);
      } else if (item.itemType === 'dreams') {
        prev.dreams.push(item.itemData);
      } else if (item.itemType === 'letters') {
        prev.letters.push(item.itemData);
      }
      return prev;
    });
    storage.removeRecentlyDeleted(item.id);
    setRecentlyDeleted(storage.getRecentlyDeleted());
    triggerToast(`Restored "${item.label}" back to draft.`);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'hero', label: '0. hello, stranger.', icon: FileText },
    { id: 'noBigDeal', label: '1. no big deal.', icon: FileText },
    { id: 'drafts', label: '2. from the drafts.', icon: FileText },
    { id: 'childhood', label: '3. before i knew.', icon: FileText },
    { id: 'beas', label: 'A. the silence (beas).', icon: FileText },
    { id: 'people', label: '4. people i carry.', icon: FileText },
    { id: 'lucky', label: '5. lucky, actually.', icon: FileText },
    { id: 'proud', label: '6. look how far.', icon: FileText },
    { id: 'wonder', label: '7. i wonder.', icon: FileText },
    { id: 'notYet', label: '8. not yet.', icon: FileText },
    { id: 'dreams', label: '9. one day.', icon: FileText },
    { id: 'letters', label: '10. to whoever i become.', icon: FileText },
    { id: 'finale', label: '11. still becoming.', icon: FileText },
    { id: 'media', label: 'Media Library & Audio', icon: Camera },
    { id: 'deleted', label: 'Recently Deleted (30 Days)', icon: RotateCcw },
    { id: 'history', label: 'Revision History', icon: History },
    { id: 'settings', label: 'Settings & Interludes', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827] font-sans flex flex-col antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#111827] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Bar */}
      <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
                Vanshika Chawla · Owner Portal
              </h1>
              {diffsSincePublish.length > 0 ? (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                  {diffsSincePublish.length} Unpublished Changes
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  All Changes Published
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 hidden sm:block">
              Auto-saved draft at {lastSavedTime}
            </p>
          </div>
        </div>

        {/* Top Actions: Preview & Publish */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              storage.saveDraft(draft);
              storage.setPreviewMode(true);
              setContextPreviewMode(true);
              reloadContent();
              setShowLivePreviewModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer shadow-xs"
            title="Preview draft in desktop and mobile viewports"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Draft</span>
          </button>

          <button
            onClick={togglePreview}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              isPreview
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            title="When ON, live site renders your draft content"
          >
            <span className="hidden sm:inline">Preview Mode:</span>
            <span>{isPreview ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleExitToSite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Save changes and return to the public site"
          >
            <span>Exit to Site</span>
          </button>

          <button
            onClick={() => setShowPublishModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#111827] text-white hover:bg-black transition-colors shadow-sm cursor-pointer"
            title="Publish draft changes immediately to live website"
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            <span>Publish Live</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-200 lg:translate-x-0 flex flex-col justify-between ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-3 overflow-y-auto max-h-[calc(100vh-4rem)]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2">
              Site Order Navigation
            </div>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Sign-out footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
            <div className="truncate">
              <span className="text-[10px] text-gray-500 block">Logged in as</span>
              <span className="font-semibold text-gray-900 truncate block">
                {adminAuth.getAdminEmail()}
              </span>
            </div>
            <button
              onClick={() => {
                adminAuth.logout();
                onExitAdmin();
              }}
              className="p-1.5 text-gray-500 hover:text-red-600 rounded"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F9FAFB]">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* 1. OVERVIEW SECTION */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
                  <h2 className="text-lg font-bold text-gray-900">Archive Health & Completeness</h2>
                  <p className="text-xs text-gray-600">
                    Live audit of placeholder fields, validation rules, approvals, and photo metadata.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <span className="text-xs text-gray-500">Unpublished Changes</span>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {diffsSincePublish.length} fields
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <span className="text-xs text-gray-500">Placeholders Filled</span>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {placeholderAudit.total - placeholderAudit.placeholderFields.length} / {placeholderAudit.total}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <span className="text-xs text-gray-500">Random Me Pool</span>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {randomPoolCount} items
                      </p>
                      <span className="text-[10px] text-gray-400">Min 2 required</span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <span className="text-xs text-gray-500">Validation Status</span>
                      <p className={`text-base font-bold mt-2 ${validation.isValid ? 'text-emerald-600' : 'text-red-600'}`}>
                        {validation.isValid ? '✓ Ready to Publish' : '⚠ Action Required'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Validation Warnings / Errors */}
                {validation.errors.length > 0 && (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-3">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Validation Audit Findings ({validation.errors.length})</span>
                    </h3>
                    <div className="space-y-2">
                      {validation.errors.map((err, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                            err.severity === 'error'
                              ? 'bg-red-50 text-red-800 border border-red-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          <span className="font-bold uppercase tracking-wider text-[10px]">
                            [{err.severity} · {err.field}]
                          </span>
                          <span>{err.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approvals Queue */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-gray-900">
                    Approvals Queue (Letters & Beas Lines)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Personal letters and Beas lines only go live when approved: true. Unapproved items stay private.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <span className="text-xs font-semibold text-gray-900">Beas Interlude Silence Lines</span>
                        <p className="text-[11px] text-gray-500">{draft.interludeBeas.lines.length} lines total</p>
                      </div>
                      <button
                        onClick={() =>
                          updateDraft((prev) => {
                            prev.interludeBeas.approved = !prev.interludeBeas.approved;
                            return prev;
                          })
                        }
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                          draft.interludeBeas.approved
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {draft.interludeBeas.approved ? 'Approved Live' : 'Held as Draft'}
                      </button>
                    </div>

                    {draft.letters.map((letItem, idx) => (
                      <div
                        key={letItem.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div>
                          <span className="text-xs font-semibold text-gray-900">{letItem.title}</span>
                          <p className="text-[11px] text-gray-500 italic">"{letItem.notes}"</p>
                        </div>
                        <button
                          onClick={() =>
                            updateDraft((prev) => {
                              prev.letters[idx].approved = !prev.letters[idx].approved;
                              return prev;
                            })
                          }
                          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                            letItem.approved
                              ? 'bg-emerald-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {letItem.approved ? 'Approved Live' : 'Held as Draft'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Constitutional Help Note on Guestbook / Visitor Letters */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                  <span className="font-bold block">Privacy Constitution Note</span>
                  <p>
                    Visitor notes live exclusively in each visitor's own browser local storage (<code className="bg-blue-100 px-1 py-0.5 rounded">hs:letters:v1</code>). No server-side collection exists, and visitor letters are never stored or viewed in the admin portal.
                  </p>
                </div>
              </div>
            )}

            {/* 2. HERO SECTION */}
            {activeSection === 'hero' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Page 0: hello, stranger.</h2>
                  <p className="text-xs text-gray-500">Edit hero notes, stamps, subline, and four-word meanings.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Hero Subline (Character guide: ~30-45 chars)
                    </label>
                    <input
                      type="text"
                      value={draft.identity.subline}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!hasEmoji(val)) {
                          updateDraft((prev) => {
                            prev.identity.subline = val;
                            return prev;
                          });
                        }
                      }}
                      className="w-full text-xs p-2.5 rounded-lg border border-gray-300"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-700">
                        Hero Handwritten Notes (Spec rule: exactly 3 notes)
                      </label>
                      <span className="text-[10px] text-gray-500">{draft.hero.notes.length} of 3</span>
                    </div>
                    <div className="space-y-2">
                      {draft.hero.notes.map((note, idx) => (
                        <input
                          key={idx}
                          type="text"
                          value={note}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!hasEmoji(val)) {
                              updateDraft((prev) => {
                                prev.hero.notes[idx] = val;
                                return prev;
                              });
                            }
                          }}
                          className="w-full text-xs p-2 rounded border border-gray-300"
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-700">
                        Hero Date Stamps (Spec rule: exactly 2 stamps)
                      </label>
                      <span className="text-[10px] text-gray-500">{draft.hero.stamps.length} of 2</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {draft.hero.stamps.map((stamp, idx) => (
                        <input
                          key={idx}
                          type="text"
                          value={stamp}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!hasEmoji(val)) {
                              updateDraft((prev) => {
                                prev.hero.stamps[idx] = val;
                                return prev;
                              });
                            }
                          }}
                          className="w-full text-xs p-2 rounded border border-gray-300 font-mono"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-xs font-bold text-gray-700 block mb-2">
                      The Four Touchstone Words (Meanings only editable; words are locked by design)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {draft.identity.fourWords.map((fw, idx) => (
                        <div key={fw.word} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-gray-900">{fw.word}</span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Locked Word
                            </span>
                          </div>
                          <input
                            type="text"
                            value={fw.meaning}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!hasEmoji(val)) {
                                updateDraft((prev) => {
                                  prev.identity.fourWords[idx].meaning = val;
                                  return prev;
                                });
                              }
                            }}
                            className="w-full text-xs p-2 bg-white rounded border border-gray-300"
                            placeholder="Meaning..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. NO BIG DEAL SECTION */}
            {activeSection === 'noBigDeal' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Page 1: NO BIG DEAL</h2>
                  <p className="text-xs text-gray-500">Edit ribbon copy, marquee inside jokes, and tear transition line.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Red Gingham Ribbon Handwritten Line
                    </label>
                    <input
                      type="text"
                      value={draft.noBigDeal.ribbonLine}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!hasEmoji(val)) {
                          updateDraft((prev) => {
                            prev.noBigDeal.ribbonLine = val;
                            return prev;
                          });
                        }
                      }}
                      className="w-full text-xs p-2.5 rounded-lg border border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      The Tear Transition Line (turns outward into inward)
                    </label>
                    <input
                      type="text"
                      value={draft.noBigDeal.tearLine}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!hasEmoji(val)) {
                          updateDraft((prev) => {
                            prev.noBigDeal.tearLine = val;
                            return prev;
                          });
                        }
                      }}
                      className="w-full text-xs p-2.5 rounded-lg border border-gray-300"
                    />
                  </div>

                  {/* Polaroids Item Management */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs font-bold text-gray-800">
                          Scrapbook Polaroids ({draft.noBigDeal.polaroids.length})
                        </span>
                        <p className="text-[11px] text-gray-500">Mobile layout capped at max 14 elements total</p>
                      </div>
                      <button
                        onClick={() =>
                          updateDraft((prev) => {
                            prev.noBigDeal.polaroids.push({
                              id: `pol_${Date.now()}`,
                              photo: {
                                id: `photo_${Date.now()}`,
                                file: prev.hero.panorama.file,
                                alt: 'New Polaroid snapshot',
                                orientation: 'square',
                              },
                              caption: 'New Memory Caption',
                              tilt: -2,
                            });
                            return prev;
                          })
                        }
                        className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Polaroid
                      </button>
                    </div>

                    <div className="space-y-3">
                      {draft.noBigDeal.polaroids.map((pol, idx) => (
                        <div key={pol.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden shrink-0 border">
                              <img src={pol.photo.file} alt={pol.photo.alt} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-900">{pol.caption}</span>
                                {pol.hidden && (
                                  <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Hidden</span>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-500">{pol.photo.alt || 'No alt text'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                updateDraft((prev) => {
                                  prev.noBigDeal.polaroids[idx].hidden = !prev.noBigDeal.polaroids[idx].hidden;
                                  return prev;
                                })
                              }
                              className="p-1.5 text-gray-500 hover:text-gray-900 rounded"
                              title={pol.hidden ? 'Restore to view' : 'Hide from public'}
                            >
                              {pol.hidden ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() =>
                                updateDraft((prev) => {
                                  const clonePol = JSON.parse(JSON.stringify(prev.noBigDeal.polaroids[idx]));
                                  clonePol.id = `pol_${Date.now()}`;
                                  clonePol.caption += ' (Copy)';
                                  prev.noBigDeal.polaroids.splice(idx + 1, 0, clonePol);
                                  return prev;
                                })
                              }
                              className="p-1.5 text-gray-500 hover:text-gray-900 rounded"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() =>
                                updateDraft((prev) => {
                                  if (idx > 0) {
                                    const temp = prev.noBigDeal.polaroids[idx];
                                    prev.noBigDeal.polaroids[idx] = prev.noBigDeal.polaroids[idx - 1];
                                    prev.noBigDeal.polaroids[idx - 1] = temp;
                                  }
                                  return prev;
                                })
                              }
                              className="p-1.5 text-gray-500 hover:text-gray-900 rounded"
                              title="Move Up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() =>
                                updateDraft((prev) => {
                                  if (idx < prev.noBigDeal.polaroids.length - 1) {
                                    const temp = prev.noBigDeal.polaroids[idx];
                                    prev.noBigDeal.polaroids[idx] = prev.noBigDeal.polaroids[idx + 1];
                                    prev.noBigDeal.polaroids[idx + 1] = temp;
                                  }
                                  return prev;
                                })
                              }
                              className="p-1.5 text-gray-500 hover:text-gray-900 rounded"
                              title="Move Down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() =>
                                deleteWithHistory('polaroids', pol.caption, pol, () =>
                                  updateDraft((prev) => {
                                    prev.noBigDeal.polaroids.splice(idx, 1);
                                    return prev;
                                  })
                                )
                              }
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                              title="Delete (Kept 30 days)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. DRAFTS SECTION */}
            {activeSection === 'drafts' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Page 2: FROM THE DRAFTS</h2>
                    <p className="text-xs text-gray-500">
                      Essay entries ({draft.drafts.entries.length} items · Spec rule: 5 to 8 entries required).
                    </p>
                    {(draft.drafts.entries.length < 5 || draft.drafts.entries.length > 8) && (
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-1 font-semibold">
                        ⚠ Outside 5 to 8 range ({draft.drafts.entries.length} items)
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      updateDraft((prev) => {
                        prev.drafts.entries.push({
                          id: `draft_${Date.now()}`,
                          date: 'New Date',
                          title: 'New Essay Title',
                          text: 'Write essay contents here...',
                          pullQuote: 'A quiet pull quote...',
                        });
                        return prev;
                      })
                    }
                    className="px-3 py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Entry
                  </button>
                </div>

                <div className="space-y-6">
                  {draft.drafts.entries.map((entry, idx) => (
                    <div key={entry.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-700">Entry #{idx + 1}</span>
                          {entry.hidden && (
                            <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.2 rounded">Hidden</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              updateDraft((prev) => {
                                prev.drafts.entries[idx].hidden = !prev.drafts.entries[idx].hidden;
                                return prev;
                              })
                            }
                            className="p-1 text-gray-500 hover:text-gray-900"
                            title={entry.hidden ? 'Unhide' : 'Hide from public'}
                          >
                            {entry.hidden ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() =>
                              updateDraft((prev) => {
                                const cloneEntry = JSON.parse(JSON.stringify(prev.drafts.entries[idx]));
                                cloneEntry.id = `draft_${Date.now()}`;
                                cloneEntry.title = (cloneEntry.title || 'Draft') + ' (Copy)';
                                prev.drafts.entries.splice(idx + 1, 0, cloneEntry);
                                return prev;
                              })
                            }
                            className="p-1 text-gray-500 hover:text-gray-900"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              updateDraft((prev) => {
                                if (idx > 0) {
                                  const temp = prev.drafts.entries[idx];
                                  prev.drafts.entries[idx] = prev.drafts.entries[idx - 1];
                                  prev.drafts.entries[idx - 1] = temp;
                                }
                                return prev;
                              })
                            }
                            className="p-1 text-gray-400 hover:text-gray-900"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              updateDraft((prev) => {
                                if (idx < prev.drafts.entries.length - 1) {
                                  const temp = prev.drafts.entries[idx];
                                  prev.drafts.entries[idx] = prev.drafts.entries[idx + 1];
                                  prev.drafts.entries[idx + 1] = temp;
                                }
                                return prev;
                              })
                            }
                            className="p-1 text-gray-400 hover:text-gray-900"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              deleteWithHistory('drafts', entry.title || entry.date, entry, () =>
                                updateDraft((prev) => {
                                  prev.drafts.entries.splice(idx, 1);
                                  return prev;
                                })
                              )
                            }
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Date</label>
                          <input
                            type="text"
                            value={entry.date}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft((prev) => {
                                prev.drafts.entries[idx].date = val;
                                return prev;
                              });
                            }}
                            className="w-full text-xs p-2 bg-white rounded border border-gray-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Title</label>
                          <input
                            type="text"
                            value={entry.title || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft((prev) => {
                                prev.drafts.entries[idx].title = val;
                                return prev;
                              });
                            }}
                            className="w-full text-xs p-2 bg-white rounded border border-gray-300 font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Essay Prose</label>
                        <textarea
                          rows={3}
                          value={entry.text}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              prev.drafts.entries[idx].text = val;
                              return prev;
                            });
                          }}
                          className="w-full text-xs p-2 bg-white rounded border border-gray-300 leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Illuminated Pull Quote</label>
                        <input
                          type="text"
                          value={entry.pullQuote || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              prev.drafts.entries[idx].pullQuote = val;
                              return prev;
                            });
                          }}
                          className="w-full text-xs p-2 bg-white rounded border border-gray-300 italic"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chapters 3 to 11 Dedicated Editors */}
            <AdminChapterEditors
              activeSection={activeSection}
              draft={draft}
              updateDraft={updateDraft}
              deleteWithHistory={deleteWithHistory}
              handlePhotoUpload={handlePhotoUpload}
            />

            {/* 5. MEDIA LIBRARY & AUDIO (Section 1.2 & Section 3) */}
            {activeSection === 'media' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Media Library & Audio Pipeline</h2>
                  <p className="text-xs text-gray-500">
                    Manage photography slots, crop ratios, ambient soundtrack, and asset in-use protections.
                  </p>
                </div>

                {/* Ambient Audio Track Management */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-gray-800" />
                      <span className="text-xs font-bold text-gray-900">
                        Ambient Audio Track (/public/audio/ambient.mp3)
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">Max 10 MB · MP3</span>
                  </div>

                  <p className="text-[11px] text-gray-600">
                    The single ambient track for the website sound control. Respects persistent mute; never autoplays.
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <label className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-semibold cursor-pointer hover:bg-gray-100 flex items-center gap-1.5 shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New MP3 Track</span>
                      <input
                        type="file"
                        accept=".mp3,audio/mpeg"
                        onChange={handleAudioUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-gray-500 truncate">
                      Current track: {draft.audioTrack?.title || 'ambient.mp3 (built-in)'}
                    </span>
                  </div>
                </div>

                {/* Image Assets Grid with "Used By" Inspection */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-800">
                      Active Photographic Slots & Ratio Rules ({allPhotos.length})
                    </h3>
                    <div className="flex gap-1 text-[11px]">
                      <button
                        onClick={() => setMediaFilter('all')}
                        className={`px-2.5 py-1 rounded ${mediaFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setMediaFilter('in-use')}
                        className={`px-2.5 py-1 rounded ${mediaFilter === 'in-use' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}
                      >
                        In Use
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {allPhotos.map(({ location, photo }) => {
                      const usages = storage.getAssetUsage(photo.file, draft);
                      return (
                        <div key={photo.id + location} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900">{location}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                              {photo.orientation}
                            </span>
                          </div>

                          {/* Photo Thumbnail */}
                          <div className={`relative h-44 rounded-lg overflow-hidden border border-gray-300 ${
                            photo.id === 'hero-portrait' ? 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]' : 'bg-gray-100'
                          }`}>
                            <img
                              src={photo.file}
                              alt={photo.alt}
                              className="w-full h-full object-cover"
                            />
                            {photo.id === 'hero-portrait' && (
                              <div className="absolute top-2 right-2 text-[9px] bg-black/70 text-white px-2 py-0.5 rounded font-mono">
                                Transparent PNG Only
                              </div>
                            )}
                          </div>

                          {/* Usage Breakdown */}
                          <div className="text-[11px] text-gray-600 bg-white p-2.5 rounded border border-gray-200">
                            <span className="font-semibold block text-[10px] uppercase text-gray-400">Used In:</span>
                            <span>{usages.join(', ') || location}</span>
                          </div>

                          {/* Photo inputs: Alt text & Caption side-by-side */}
                          <div className="space-y-2 text-xs">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                Alt Text Description <span className="text-red-500">*Required</span>
                              </label>
                              <input
                                type="text"
                                value={photo.alt}
                                onChange={(e) => {
                                  photo.alt = e.target.value;
                                  setDraft((prev) => ({ ...prev }));
                                }}
                                className={`w-full p-2 bg-white rounded border ${
                                  !photo.alt?.trim() ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'
                                }`}
                                placeholder="Required descriptive alt text..."
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                                Caption
                              </label>
                              <input
                                type="text"
                                value={photo.caption || ''}
                                onChange={(e) => {
                                  photo.caption = e.target.value;
                                  setDraft((prev) => ({ ...prev }));
                                }}
                                className="w-full p-2 bg-white rounded border border-gray-300"
                                placeholder="Optional caption..."
                              />
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                              <label className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium cursor-pointer hover:bg-gray-50 flex items-center gap-1">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Replace Photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handlePhotoUpload(photo, e)}
                                  className="hidden"
                                />
                              </label>
                              <span className="text-[10px] text-gray-500 font-mono">
                                {photo.file.startsWith('http')
                                  ? 'Cloud Storage'
                                  : photo.file.startsWith('data:')
                                  ? 'Local Upload'
                                  : 'Built-in asset'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 6. RECENTLY DELETED (30 Days Retention) */}
            {activeSection === 'deleted' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Recently Deleted Items (30-Day Retention)</h2>
                  <p className="text-xs text-gray-500">
                    Deleted items are held safely for 30 days and can be restored back into your draft at any time.
                  </p>
                </div>

                {recentlyDeleted.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-400">
                    Trash is empty. No recently deleted items.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentlyDeleted.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900">{item.label}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                              {item.itemType}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-500 block mt-0.5">
                            Deleted on: {new Date(item.deletedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => restoreItem(item)}
                            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 hover:bg-gray-100 flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore to Draft</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 7. REVISION HISTORY (Section 4) */}
            {activeSection === 'history' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Revision History (Last 50 Snapshots)</h2>
                  <p className="text-xs text-gray-500">
                    Every publish action creates a permanent snapshot with field-level diffs and one-click restore.
                  </p>
                </div>

                {revisions.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-500">
                    No historical publish snapshots yet. Publish your first revision to record history.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {revisions.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900">{rev.note}</span>
                            <span className="text-[10px] text-gray-400 font-mono">[{rev.id}]</span>
                          </div>
                          <span className="text-[11px] text-gray-500 block mt-0.5">
                            {new Date(rev.created_at).toLocaleString()}
                          </span>
                          {rev.changesSummary && rev.changesSummary.length > 0 && (
                            <p className="text-[11px] text-gray-600 mt-1">
                              Summary: {rev.changesSummary.join(', ')}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRestoreRevision(rev)}
                            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore to Draft</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 8. SETTINGS & INTERLUDES (Section 1.3) */}
            {activeSection === 'settings' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Admin Settings & Interlude Toggles</h2>
                  <p className="text-xs text-gray-500">Optional interludes and system constitution parameters.</p>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Interlude B Toggle */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">Interlude B (The Wave Horizon)</span>
                      <p className="text-gray-500 text-[11px]">
                        Controllable wave section between Not Yet and One Day
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        updateDraft((prev) => {
                          prev.interludeB = { enabled: !(prev.interludeB?.enabled !== false) };
                          return prev;
                        })
                      }
                      className={`px-3 py-1.5 rounded-md font-semibold ${
                        draft.interludeB?.enabled !== false
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {draft.interludeB?.enabled !== false ? 'Shown' : 'Hidden'}
                    </button>
                  </div>

                  {/* River Thread Toggle */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">Beas River Thread Line</span>
                      <p className="text-gray-500 text-[11px]">
                        Continuous meandering gold river SVG across the site gutter
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        updateDraft((prev) => {
                          prev.thread = { enabled: !(prev.thread?.enabled !== false) };
                          return prev;
                        })
                      }
                      className={`px-3 py-1.5 rounded-md font-semibold ${
                        draft.thread?.enabled !== false
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {draft.thread?.enabled !== false ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  {/* Constitutional Read-only Parameters */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">SHOW_PLACEHOLDERS Flag</span>
                      <p className="text-gray-500 text-[11px]">Controls whether unfilled slots render dashed placeholder frames</p>
                    </div>
                    <span className="font-mono bg-white px-2 py-1 border rounded text-gray-800">true (read-only)</span>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">Target Anniversary Date</span>
                      <p className="text-gray-500 text-[11px]">Fixed by design constitution</p>
                    </div>
                    <span className="font-mono bg-white px-2 py-1 border rounded text-gray-800">19 October 2026</span>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">Admin Email Guard</span>
                      <p className="text-gray-500 text-[11px]">Authorized owner credential</p>
                    </div>
                    <span className="font-mono bg-white px-2 py-1 border rounded text-gray-800">{adminAuth.getAdminEmail()}</span>
                  </div>

                  {/* Supabase Hosted Backend & Storage Status */}
                  <div className="p-5 bg-white rounded-xl border border-gray-300 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                          Supabase Backend & Storage
                        </h4>
                      </div>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                          supabaseService.isConfigured()
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {supabaseService.isConfigured() ? 'Configured' : 'Missing Env Vars'}
                      </span>
                    </div>

                    <p className="text-gray-500 text-[11px] leading-relaxed">
                      Published edits and uploaded photos sync directly to Supabase so changes are immediately visible to all visitors. Public visitors read the published JSON row on load with automatic fallback to built-in seed content. Uploaded photos are stored in the <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800 font-mono">images</code> bucket with HTTPS URLs.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-400 block font-semibold uppercase text-[10px]">Project URL</span>
                        <span className="font-mono text-gray-800 truncate block">
                          {supabaseService.getProjectUrl() || 'VITE_SUPABASE_URL not set'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-400 block font-semibold uppercase text-[10px]">Content Table & Storage</span>
                        <span className="font-mono text-gray-800 block">
                          Table: <strong className="text-gray-900">content</strong> · Bucket: <strong className="text-gray-900">images</strong>
                        </span>
                      </div>
                    </div>

                    {supabaseStatusMsg && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-700">
                        {supabaseStatusMsg}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={handleTestSupabase}
                        disabled={isTestingSupabase}
                        className="px-3 py-1.5 bg-gray-900 text-white rounded text-xs font-medium hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3 h-3 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                        <span>{isTestingSupabase ? 'Testing...' : 'Test Connection & Table'}</span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`-- 1. Create content table
create table if not exists public.content (
  id text primary key default 'published',
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
alter table public.content enable row level security;

-- 3. Public read policy
create policy "Public can read published content"
  on public.content for select to anon, authenticated using (true);

-- 4. Authenticated admin write policy
create policy "Authenticated admin can update content"
  on public.content for all to authenticated using (true) with check (true);

-- 5. Images storage bucket
insert into storage.buckets (id, name, public) values ('images', 'images', true) on conflict (id) do update set public = true;

create policy "Public can view images" on storage.objects for select to anon, authenticated using (bucket_id = 'images');
create policy "Authenticated admin can upload images" on storage.objects for insert to authenticated with check (bucket_id = 'images');
create policy "Authenticated admin can update images" on storage.objects for update to authenticated using (bucket_id = 'images');
create policy "Authenticated admin can delete images" on storage.objects for delete to authenticated using (bucket_id = 'images');`);
                          triggerToast('Supabase setup SQL copied to clipboard!');
                        }}
                        className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-gray-700"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Supabase Setup SQL</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* PUBLISH CONFIRMATION MODAL WITH FIELD DIFF */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">Confirm Live Publication</h3>
              <button onClick={() => setShowPublishModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Field Diff Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700">
                Pending Changes Since Last Publish ({diffsSincePublish.length}):
              </span>
              <div className="max-h-48 overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs space-y-1">
                {diffsSincePublish.length === 0 ? (
                  <p className="text-gray-500">No field modifications detected.</p>
                ) : (
                  diffsSincePublish.map((d, i) => (
                    <div key={i} className="text-gray-700 font-mono text-[11px]">
                      <span className="text-blue-600 font-bold">{d.path}</span>: updated
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Validation Pre-flight check */}
            <div className={`p-3 rounded-lg text-xs ${validation.isValid ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
              {validation.isValid
                ? '✓ All validation rules satisfied (alt text, emoji check, count bounds).'
                : '⚠ Validation errors present. Cannot publish.'}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Revision Note
              </label>
              <input
                type="text"
                value={publishNote}
                onChange={(e) => setPublishNote(e.target.value)}
                placeholder="e.g. Added new essay draft and updated captions..."
                className="w-full text-xs p-2.5 rounded-lg border border-gray-300"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-5 py-2 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50 cursor-pointer"
              >
                {isPublishing ? 'Publishing...' : 'Confirm & Publish Live'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE PREVIEW MODAL (Desktop 1440px / Mobile 390px / Open in new tab) */}
      {showLivePreviewModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-sm animate-fadeIn">
          {/* Top Control Bar */}
          <div className="bg-[#111827] text-white px-4 py-3 flex items-center justify-between border-b border-gray-800 shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold font-mono tracking-wider text-amber-400">
                [LIVE DRAFT PREVIEW]
              </span>
              <span className="text-xs text-gray-400 hidden sm:inline">
                Rendering current draft state · Owner only
              </span>
            </div>

            {/* Viewport Toggles */}
            <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-lg border border-gray-700">
              <button
                onClick={() => setPreviewViewport('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  previewViewport === 'desktop'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (1440px)</span>
              </button>
              <button
                onClick={() => setPreviewViewport('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  previewViewport === 'mobile'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (390px)</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  storage.setPreviewMode(true);
                  setContextPreviewMode(true);
                  reloadContent();
                  setShowLivePreviewModal(false);
                  onExitAdmin();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                title="View preview directly on website"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View On Site</span>
              </button>

              <button
                onClick={() => {
                  setShowLivePreviewModal(false);
                  setShowPublishModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Live</span>
              </button>

              <button
                onClick={() => setShowLivePreviewModal(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                title="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preview Canvas Area */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-gray-900/60">
            <div
              className={`bg-[#EFE8DA] shadow-2xl transition-all duration-300 overflow-hidden flex flex-col ${
                previewViewport === 'desktop'
                  ? 'w-[1440px] max-w-full h-[88vh] rounded-xl border border-gray-700'
                  : 'w-[390px] h-[844px] max-h-[88vh] rounded-[40px] border-[10px] border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.6)]'
              }`}
            >
              <iframe
                src="/?preview=true"
                title="Live Draft Preview"
                className="w-full h-full border-0 bg-[#EFE8DA]"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
