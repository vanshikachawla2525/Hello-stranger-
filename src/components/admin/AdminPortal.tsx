import React, { useState, useMemo } from 'react';
import { useContent } from '../../context/ContentContext';
import { Photo } from '../../types/content';
import {
  X,
  Camera,
  Type,
  Palette,
  Upload,
  Download,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Check,
  Search,
  Filter,
  Eye,
  Sliders,
  FileJson
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    content,
    updateContent,
    updatePhoto,
    updateText,
    resetContent,
    exportContent,
    importContent,
    isAdminOpen,
    setIsAdminOpen,
    activeTheme,
    setActiveTheme,
    marginaliaEnabled,
    setMarginaliaEnabled,
    soundEnabled,
    setSoundEnabled
  } = useContent();

  const [activeTab, setActiveTab] = useState<'photos' | 'text' | 'theme' | 'backup'>('photos');
  const [photoSectionFilter, setPhotoSectionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2500);
  };

  // Compile flat list of all photos for easy searching and editing
  const allPhotos = useMemo(() => {
    const list: { section: string; label: string; photo: Photo; scrollTarget: string }[] = [];

    // Hero
    if (content.hero.panorama) {
      list.push({ section: 'Hero', label: 'Panorama Horizon', photo: content.hero.panorama, scrollTarget: 'page-0' });
    }
    if (content.hero.portrait) {
      list.push({ section: 'Hero', label: 'Primary Portrait', photo: content.hero.portrait, scrollTarget: 'page-0' });
    }
    if (content.hero.portraitSecondary) {
      list.push({ section: 'Hero', label: 'Secondary Sunset Frame', photo: content.hero.portraitSecondary, scrollTarget: 'page-0' });
    }

    // No Big Deal (Polaroids)
    content.noBigDeal.polaroids.forEach((pol, idx) => {
      list.push({ section: 'Scrapbook', label: `Polaroid #${idx + 1} (${pol.caption})`, photo: pol.photo, scrollTarget: 'page-1' });
    });

    // Drafts
    content.drafts.entries.forEach((entry, idx) => {
      if (entry.photo) {
        list.push({ section: 'Drafts', label: `Draft Entry "${entry.title || entry.date}"`, photo: entry.photo, scrollTarget: 'page-2' });
      }
    });

    // Childhood
    content.childhood.photos.forEach((cp, idx) => {
      list.push({ section: 'Before I Knew', label: `Film Frame #${idx + 1} (${cp.year})`, photo: cp.photo, scrollTarget: 'page-3' });
    });

    // Beas
    if (content.interludeBeas.photo) {
      list.push({ section: 'Beas Silence', label: 'Beas River Landscape', photo: content.interludeBeas.photo, scrollTarget: 'page-beas' });
    }

    // People
    content.people.forEach((p) => {
      list.push({ section: 'People I Carry', label: `Star Node: ${p.name}`, photo: p.photo, scrollTarget: 'page-4' });
    });

    // Lucky
    content.lucky.forEach((l) => {
      if (l.photo) {
        list.push({ section: 'Lucky, Actually', label: `Word: ${l.word}`, photo: l.photo, scrollTarget: 'page-5' });
      }
    });

    // Proud
    content.proud.forEach((pr, idx) => {
      list.push({ section: 'Look How Far', label: `Proud: ${pr.title}`, photo: pr.photo, scrollTarget: 'page-6' });
    });

    // Not Yet
    if (content.notYet.photo) {
      list.push({ section: 'Not Yet', label: 'Cinematic Becoming Frame', photo: content.notYet.photo, scrollTarget: 'page-8' });
    }

    // Dreams
    content.dreams.forEach((d) => {
      list.push({ section: 'One Day', label: `Dream: ${d.place}`, photo: d.photo, scrollTarget: 'page-9' });
    });

    // Finale
    if (content.finale.photo) {
      list.push({ section: 'Still Becoming', label: 'Finale Portrait', photo: content.finale.photo, scrollTarget: 'page-11' });
    }

    return list;
  }, [content]);

  const filteredPhotos = useMemo(() => {
    return allPhotos.filter((item) => {
      const matchSection = photoSectionFilter === 'all' || item.section === photoSectionFilter;
      const matchSearch =
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.photo.caption || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.photo.alt || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchSection && matchSearch;
    });
  }, [allPhotos, photoSectionFilter, searchQuery]);

  const handleFileUpload = (photoId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (result) {
          updatePhoto(photoId, { file: result });
          triggerToast('Photo updated from upload!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const scrollToTarget = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsAdminOpen(false);
    }
  };

  if (!isAdminOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[900px] flex flex-col bg-[#FBF9F5] text-[#1B1713] rounded-2xl shadow-2xl border border-[#1B1713]/15 overflow-hidden font-sans">
        
        {/* Toast Alert */}
        {saveToast && (
          <div className="absolute top-4 right-20 z-50 flex items-center gap-2 bg-[#2F3F2A] text-[#F5F0DF] px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-bounce">
            <Check className="w-4 h-4 text-[#F0CF65]" />
            <span>{saveToast}</span>
          </div>
        )}

        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1B1713]/10 bg-[#EFE8DA]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#B3342B] flex items-center justify-center text-white font-serif text-lg shadow-sm">
              ✦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">Admin & Editorial Studio</h2>
                <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#1B1713]/10 text-[#7A7064] font-medium">
                  Real-Time Sync Active
                </span>
              </div>
              <p className="text-xs text-[#7A7064]">
                Edit photos, adjust captions, and rewrite copy with live instant updates across all pages.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportContent}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#1B1713]/20 rounded-md hover:bg-[#1B1713]/5 transition-colors"
              title="Download backup JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (re) => {
                      const text = re.target?.result as string;
                      if (importContent(text)) {
                        triggerToast('Content imported successfully!');
                      } else {
                        triggerToast('Invalid JSON file format.');
                      }
                    };
                    reader.readAsText(file);
                  }
                };
                input.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#1B1713]/20 rounded-md hover:bg-[#1B1713]/5 transition-colors"
              title="Import JSON backup"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>

            <button
              onClick={resetContent}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#B3342B] border border-[#B3342B]/30 rounded-md hover:bg-[#B3342B]/10 transition-colors"
              title="Reset to default curated content"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={() => setIsAdminOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#1B1713]/10 transition-colors ml-2"
              aria-label="Close Admin Portal"
            >
              <X className="w-5 h-5 text-[#1B1713]" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-[#1B1713]/10 bg-[#F4EBD6]/60">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'photos'
                ? 'border-[#B3342B] text-[#B3342B]'
                : 'border-transparent text-[#7A7064] hover:text-[#1B1713]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Photos & Captions ({allPhotos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'text'
                ? 'border-[#B3342B] text-[#B3342B]'
                : 'border-transparent text-[#7A7064] hover:text-[#1B1713]'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Text & Storylines</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'theme'
                ? 'border-[#B3342B] text-[#B3342B]'
                : 'border-transparent text-[#7A7064] hover:text-[#1B1713]'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Themes & Atmosphere</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FBF9F5]">

          {/* TAB 1: PHOTOS & CAPTIONS */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3 rounded-xl border border-[#1B1713]/10 shadow-sm">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="w-4 h-4 text-[#7A7064]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search photo by section, caption, or label..."
                    className="w-full text-sm bg-transparent border-none focus:outline-none placeholder:text-[#7A7064]/60"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-xs text-[#7A7064] hover:text-[#1B1713]">
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-[#1B1713]/10 pt-2 sm:pt-0 sm:pl-3">
                  <Filter className="w-3.5 h-3.5 text-[#7A7064]" />
                  <select
                    value={photoSectionFilter}
                    onChange={(e) => setPhotoSectionFilter(e.target.value)}
                    className="text-xs font-medium bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Sections ({allPhotos.length})</option>
                    <option value="Hero">Hero (3)</option>
                    <option value="Scrapbook">Scrapbook / Polaroids (4)</option>
                    <option value="Drafts">Drafts (2)</option>
                    <option value="Before I Knew">Before I Knew (4)</option>
                    <option value="Beas Silence">Beas Silence (1)</option>
                    <option value="People I Carry">People I Carry (5)</option>
                    <option value="Lucky, Actually">Lucky, Actually</option>
                    <option value="Look How Far">Look How Far (3)</option>
                    <option value="Not Yet">Not Yet (1)</option>
                    <option value="One Day">One Day (4)</option>
                    <option value="Still Becoming">Still Becoming (1)</option>
                  </select>
                </div>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPhotos.map((item) => {
                  const { photo } = item;
                  return (
                    <div
                      key={photo.id + item.label}
                      className="bg-white rounded-xl border border-[#1B1713]/10 p-4 shadow-sm hover:shadow transition-shadow flex flex-col justify-between gap-4"
                    >
                      {/* Top Meta info */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#EFE8DA] text-[#1B1713]">
                              {item.section}
                            </span>
                            <h4 className="text-sm font-semibold text-[#1B1713]">{item.label}</h4>
                          </div>
                          {photo.year && (
                            <span className="text-xs text-[#7A7064] mt-0.5 block">Year / Tag: {photo.year}</span>
                          )}
                        </div>

                        <button
                          onClick={() => scrollToTarget(item.scrollTarget)}
                          className="flex items-center gap-1 text-[11px] text-[#B3342B] hover:underline"
                          title="Jump directly to this section on website"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View on page</span>
                        </button>
                      </div>

                      {/* Photo Preview & Media Controls */}
                      <div className="flex gap-4 items-start">
                        {/* Thumbnail */}
                        <div className="relative w-28 h-28 shrink-0 rounded-lg overflow-hidden border border-[#1B1713]/15 bg-[#EFE8DA] shadow-inner group">
                          <img
                            src={photo.file}
                            alt={photo.alt || 'Thumbnail'}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="text-[10px] text-white font-medium">Active</span>
                          </div>
                        </div>

                        {/* Image URL & File Upload */}
                        <div className="flex-1 space-y-2 text-xs">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-[#7A7064] font-medium mb-1">
                              Image URL / Path
                            </label>
                            <input
                              type="text"
                              value={photo.file.startsWith('data:') ? '[Uploaded Custom Image File]' : photo.file}
                              onChange={(e) => {
                                updatePhoto(photo.id, { file: e.target.value });
                                triggerToast('Image path updated in real-time');
                              }}
                              className="w-full px-2.5 py-1.5 rounded border border-[#1B1713]/15 text-xs bg-[#FBF9F5] focus:outline-none focus:border-[#B3342B]"
                              placeholder="https://... or /src/assets/..."
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <label className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-[#EFE8DA] hover:bg-[#D9CFBC] border border-[#1B1713]/20 rounded cursor-pointer transition-colors">
                              <Upload className="w-3 h-3" />
                              <span>Upload Photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(photo.id, e)}
                                className="hidden"
                              />
                            </label>

                            <select
                              value={photo.orientation || 'landscape'}
                              onChange={(e) => {
                                updatePhoto(photo.id, { orientation: e.target.value as any });
                                triggerToast('Orientation updated');
                              }}
                              className="text-[11px] px-2 py-1 bg-white border border-[#1B1713]/15 rounded focus:outline-none"
                            >
                              <option value="landscape">Landscape</option>
                              <option value="portrait">Portrait</option>
                              <option value="square">Square</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Caption & Alt Text */}
                      <div className="space-y-2 pt-2 border-t border-[#1B1713]/10 text-xs">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-[#7A7064] font-medium mb-0.5">
                            Caption Information
                          </label>
                          <input
                            type="text"
                            value={photo.caption || ''}
                            onChange={(e) => {
                              updatePhoto(photo.id, { caption: e.target.value });
                            }}
                            className="w-full px-2.5 py-1.5 rounded border border-[#1B1713]/15 text-xs bg-white focus:outline-none focus:border-[#B3342B]"
                            placeholder="Enter caption for this image..."
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-[#7A7064] font-medium mb-0.5">
                            Alt Description (Accessibility & Hover)
                          </label>
                          <input
                            type="text"
                            value={photo.alt || ''}
                            onChange={(e) => {
                              updatePhoto(photo.id, { alt: e.target.value });
                            }}
                            className="w-full px-2.5 py-1.5 rounded border border-[#1B1713]/15 text-xs bg-white focus:outline-none focus:border-[#B3342B]"
                            placeholder="Describe what appears in this image..."
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredPhotos.length === 0 && (
                <div className="text-center py-12 text-[#7A7064]">
                  <p>No photos found matching your search.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TEXT & STORYLINES */}
          {activeTab === 'text' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Section 1: Identity & 4 Words */}
              <div className="bg-white p-5 rounded-xl border border-[#1B1713]/10 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#1B1713]/10 pb-3">
                  <h3 className="font-serif text-lg font-bold">Hero Identity & Four Words</h3>
                  <span className="text-xs text-[#7A7064]">Page 0 & Finale</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#7A7064] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={content.identity.name}
                      onChange={(e) => updateText('identity.name', e.target.value)}
                      className="w-full px-3 py-2 border border-[#1B1713]/15 rounded-md text-sm font-serif text-lg bg-[#FBF9F5]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#7A7064] mb-1">Subline</label>
                    <input
                      type="text"
                      value={content.identity.subline}
                      onChange={(e) => updateText('identity.subline', e.target.value)}
                      className="w-full px-3 py-2 border border-[#1B1713]/15 rounded-md text-sm bg-[#FBF9F5]"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7064]">
                    The Four Words & Their Meanings
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {content.identity.fourWords.map((fw, idx) => (
                      <div key={fw.word} className="p-3 bg-[#EFE8DA]/40 rounded-lg border border-[#1B1713]/10 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-serif italic font-semibold text-sm">{fw.word}</span>
                          <span className="text-[10px] text-[#7A7064]">Word #{idx + 1}</span>
                        </div>
                        <input
                          type="text"
                          value={fw.meaning}
                          onChange={(e) => {
                            const newWords = [...content.identity.fourWords];
                            newWords[idx].meaning = e.target.value;
                            updateText('identity.fourWords', newWords);
                          }}
                          className="w-full px-2 py-1 text-xs border border-[#1B1713]/15 rounded bg-white"
                          placeholder="Meaning..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 2: Scrapbook Ribbon & Inside Jokes */}
              <div className="bg-white p-5 rounded-xl border border-[#1B1713]/10 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#1B1713]/10 pb-3">
                  <h3 className="font-serif text-lg font-bold">Scrapbook Notes (NO BIG DEAL)</h3>
                  <span className="text-xs text-[#7A7064]">Page 1</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7A7064] mb-1">
                    Red Gingham Ribbon Handwritten Line
                  </label>
                  <input
                    type="text"
                    value={content.noBigDeal.ribbonLine}
                    onChange={(e) => updateText('noBigDeal.ribbonLine', e.target.value)}
                    className="w-full px-3 py-2 border border-[#1B1713]/15 rounded-md text-sm font-handwriting text-lg bg-[#FBF9F5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7A7064] mb-1">
                    The Tear Transition Line
                  </label>
                  <input
                    type="text"
                    value={content.noBigDeal.tearLine}
                    onChange={(e) => updateText('noBigDeal.tearLine', e.target.value)}
                    className="w-full px-3 py-2 border border-[#1B1713]/15 rounded-md text-sm bg-[#FBF9F5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7A7064] mb-1">
                    Inside Jokes Marquee (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={content.noBigDeal.marquee.join(', ')}
                    onChange={(e) => {
                      const items = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                      updateText('noBigDeal.marquee', items);
                    }}
                    className="w-full px-3 py-2 border border-[#1B1713]/15 rounded-md text-sm bg-[#FBF9F5]"
                  />
                </div>
              </div>

              {/* Section 3: Drafts Entries */}
              <div className="bg-white p-5 rounded-xl border border-[#1B1713]/10 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#1B1713]/10 pb-3">
                  <h3 className="font-serif text-lg font-bold">FROM THE DRAFTS — Essays & Reflections</h3>
                  <span className="text-xs text-[#7A7064]">Page 2</span>
                </div>

                <div className="space-y-4">
                  {content.drafts.entries.map((entry, idx) => (
                    <div key={entry.id} className="p-4 bg-[#F6F0E4]/60 rounded-lg border border-[#1B1713]/10 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#7A7064] mb-0.5">
                            Date
                          </label>
                          <input
                            type="text"
                            value={entry.date}
                            onChange={(e) => {
                              const newEntries = [...content.drafts.entries];
                              newEntries[idx].date = e.target.value;
                              updateText('drafts.entries', newEntries);
                            }}
                            className="w-full px-2.5 py-1.5 text-xs border border-[#1B1713]/15 rounded bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#7A7064] mb-0.5">
                            Title
                          </label>
                          <input
                            type="text"
                            value={entry.title || ''}
                            onChange={(e) => {
                              const newEntries = [...content.drafts.entries];
                              newEntries[idx].title = e.target.value;
                              updateText('drafts.entries', newEntries);
                            }}
                            className="w-full px-2.5 py-1.5 text-xs font-serif font-bold border border-[#1B1713]/15 rounded bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#7A7064] mb-0.5">
                          Essay Text
                        </label>
                        <textarea
                          rows={3}
                          value={entry.text}
                          onChange={(e) => {
                            const newEntries = [...content.drafts.entries];
                            newEntries[idx].text = e.target.value;
                            updateText('drafts.entries', newEntries);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs border border-[#1B1713]/15 rounded bg-white leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#7A7064] mb-0.5">
                          Pull Quote (Illuminated)
                        </label>
                        <input
                          type="text"
                          value={entry.pullQuote || ''}
                          onChange={(e) => {
                            const newEntries = [...content.drafts.entries];
                            newEntries[idx].pullQuote = e.target.value;
                            updateText('drafts.entries', newEntries);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs font-serif italic border border-[#1B1713]/15 rounded bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Letters Across Time */}
              <div className="bg-white p-5 rounded-xl border border-[#1B1713]/10 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#1B1713]/10 pb-3">
                  <h3 className="font-serif text-lg font-bold">Letters Across Time (Wax Sealed)</h3>
                  <span className="text-xs text-[#7A7064]">Page 10</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {content.letters.map((letItem, idx) => (
                    <div key={letItem.id} className="p-3 bg-[#2A1812]/5 rounded-lg border border-[#7A2230]/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-sm text-[#7A2230]">{letItem.title}</span>
                      </div>
                      <input
                        type="text"
                        value={letItem.notes}
                        onChange={(e) => {
                          const newLetters = [...content.letters];
                          newLetters[idx].notes = e.target.value;
                          updateText('letters', newLetters);
                        }}
                        className="w-full px-2 py-1 text-xs border border-[#1B1713]/15 rounded bg-white"
                        placeholder="Envelope inscription..."
                      />
                      <textarea
                        rows={4}
                        value={letItem.body}
                        onChange={(e) => {
                          const newLetters = [...content.letters];
                          newLetters[idx].body = e.target.value;
                          updateText('letters', newLetters);
                        }}
                        className="w-full px-2 py-1.5 text-xs font-handwriting text-base border border-[#1B1713]/15 rounded bg-white"
                        placeholder="Letter contents..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THEMES & ATMOSPHERE */}
          {activeTab === 'theme' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Palette Switcher */}
              <div className="bg-white p-5 rounded-xl border border-[#1B1713]/10 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#1B1713]/10 pb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold">The 12 Curated Palettes</h3>
                    <p className="text-xs text-[#7A7064]">
                      Click any theme to test live palette rendering across the site immediately.
                    </p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#B3342B]">
                    Active: {activeTheme}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[
                    { id: 'hero', name: '0. Hero (Cream)', bg: '#EFE8DA', ink: '#1B1713' },
                    { id: 'scrap', name: '1. Scrapbook', bg: '#F4EBD6', ink: '#2A1E18' },
                    { id: 'drafts', name: '2. Drafts (Ivory)', bg: '#F6F0E4', ink: '#3A3834' },
                    { id: 'archive', name: '3. Film Archive', bg: '#F3E6D0', ink: '#4A3527' },
                    { id: 'beas', name: 'A. Beas Silence', bg: '#0E1A33', ink: '#F2EAD8' },
                    { id: 'orbit', name: '4. Constellation', bg: '#0E1A33', ink: '#F2EAD8' },
                    { id: 'sage', name: '5. Lucky (Sage)', bg: '#A9B89A', ink: '#2F3F2A' },
                    { id: 'proud', name: '6. Proud (Night)', bg: '#0D0C0C', ink: '#EFEBE3' },
                    { id: 'observatory', name: '7. Observatory', bg: '#060C24', ink: '#F4F6FB' },
                    { id: 'terracotta', name: '8. Terracotta', bg: '#C0643F', ink: '#F6EADB' },
                    { id: 'sky', name: '9. Sky Blue', bg: '#8FC4E8', ink: '#1F3A52' },
                    { id: 'letters', name: '10. Chocolate', bg: '#2A1812', ink: '#E9D9B8' },
                    { id: 'rest', name: '11. Rest Finale', bg: '#F7F2E9', ink: '#2A2622' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTheme(t.id);
                        triggerToast(`Switched theme to ${t.name}`);
                      }}
                      className={`p-3 rounded-lg border text-left flex flex-col justify-between h-20 transition-all ${
                        activeTheme === t.id
                          ? 'border-[#B3342B] ring-2 ring-[#B3342B]/30 scale-[1.02]'
                          : 'border-[#1B1713]/15 hover:border-[#1B1713]/40'
                      }`}
                      style={{ backgroundColor: t.bg, color: t.ink }}
                    >
                      <span className="text-xs font-semibold">{t.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">{t.bg}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Atmosphere Toggles */}
              <div className="bg-white p-5 rounded-xl border border-[#1B1713]/10 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold border-b border-[#1B1713]/10 pb-3">
                  Atmospheric Controls
                </h3>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[#FBF9F5] border border-[#1B1713]/10">
                  <div>
                    <h4 className="text-sm font-semibold text-[#1B1713]">Marginalia Developer Annotations</h4>
                    <p className="text-xs text-[#7A7064]">
                      Shows contact sheet labels (`hero.panorama`, `--t-hero`, `Page 0`) and hand-drawn curved arrows.
                    </p>
                  </div>
                  <button
                    onClick={() => setMarginaliaEnabled((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-colors ${
                      marginaliaEnabled ? 'bg-[#2F3F2A] text-[#F5F0DF]' : 'bg-[#1B1713]/10 text-[#7A7064]'
                    }`}
                  >
                    {marginaliaEnabled ? 'ENABLED' : 'OFF'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[#FBF9F5] border border-[#1B1713]/10">
                  <div>
                    <h4 className="text-sm font-semibold text-[#1B1713]">Ambient Sound Simulation</h4>
                    <p className="text-xs text-[#7A7064]">
                      Toggles ambient sound status and visual sound wave equalizer icon in left rail and mobile badge.
                    </p>
                  </div>
                  <button
                    onClick={() => setSoundEnabled((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-colors ${
                      soundEnabled ? 'bg-[#2F3F2A] text-[#F5F0DF]' : 'bg-[#1B1713]/10 text-[#7A7064]'
                    }`}
                  >
                    {soundEnabled ? 'ACTIVE' : 'MUTED'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-[#1B1713]/10 bg-[#EFE8DA] flex items-center justify-between text-xs text-[#7A7064]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>All edits are automatically saved to browser storage.</span>
          </div>
          <button
            onClick={() => setIsAdminOpen(false)}
            className="px-4 py-1.5 bg-[#1B1713] text-white rounded-md text-xs font-medium hover:bg-[#1B1713]/80 transition-colors"
          >
            Done Editing
          </button>
        </div>

      </div>
    </div>
  );
};
