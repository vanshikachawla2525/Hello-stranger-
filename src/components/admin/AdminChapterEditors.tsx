import React from 'react';
import { SiteContent, Photo } from '../../types/content';
import {
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Upload,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface AdminChapterEditorsProps {
  activeSection: string;
  draft: SiteContent;
  updateDraft: (updater: (prev: SiteContent) => SiteContent) => void;
  deleteWithHistory: (itemType: string, label: string, itemData: any, executeDelete: () => void) => void;
  handlePhotoUpload: (photoRef: Photo, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AdminChapterEditors: React.FC<AdminChapterEditorsProps> = ({
  activeSection,
  draft,
  updateDraft,
  deleteWithHistory,
  handlePhotoUpload,
}) => {
  // Page 3: BEFORE I KNEW
  if (activeSection === 'childhood') {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Page 3: BEFORE I KNEW</h2>
            <p className="text-xs text-gray-500">
              Childhood film negative frames, archival memories, and overarching quote.
            </p>
          </div>
          <button
            onClick={() =>
              updateDraft((prev) => {
                prev.childhood.photos.push({
                  id: `childhood_${Date.now()}`,
                  year: '2005',
                  timecode: '00:00',
                  caption: 'New childhood memory caption...',
                  photo: {
                    id: `cp_${Date.now()}`,
                    file: prev.hero.panorama.file,
                    alt: 'Childhood photo description',
                    orientation: 'landscape',
                    caption: '',
                  },
                });
                return prev;
              })
            }
            className="px-3 py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-lg flex items-center gap-1 hover:bg-black transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Film Frame
          </button>
        </div>

        {/* Archival Quote */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
          <label className="block text-[11px] font-semibold text-gray-600">Archival Quote</label>
          <input
            type="text"
            value={draft.childhood.quote || ''}
            onChange={(e) => {
              const val = e.target.value;
              updateDraft((prev) => {
                prev.childhood.quote = val;
                return prev;
              });
            }}
            className="w-full text-xs p-2.5 bg-white rounded-lg border border-gray-300 italic"
          />
        </div>

        {/* Film Frames List */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Film Frames ({draft.childhood.photos.length} frames · Ratio 4:3)
          </h3>
          {draft.childhood.photos.map((cp, idx) => (
            <div key={cp.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-xs font-bold text-gray-700">Frame #{idx + 1} (Year {cp.year})</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      updateDraft((prev) => {
                        const cloneFrame = JSON.parse(JSON.stringify(prev.childhood.photos[idx]));
                        cloneFrame.id = `childhood_${Date.now()}`;
                        prev.childhood.photos.splice(idx + 1, 0, cloneFrame);
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
                          const temp = prev.childhood.photos[idx];
                          prev.childhood.photos[idx] = prev.childhood.photos[idx - 1];
                          prev.childhood.photos[idx - 1] = temp;
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
                        if (idx < prev.childhood.photos.length - 1) {
                          const temp = prev.childhood.photos[idx];
                          prev.childhood.photos[idx] = prev.childhood.photos[idx + 1];
                          prev.childhood.photos[idx + 1] = temp;
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
                      deleteWithHistory('childhood', `Frame ${cp.year}`, cp, () =>
                        updateDraft((prev) => {
                          prev.childhood.photos.splice(idx, 1);
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Year</label>
                  <input
                    type="text"
                    value={cp.year}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => {
                        prev.childhood.photos[idx].year = val;
                        return prev;
                      });
                    }}
                    className="w-full text-xs p-2 bg-white rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Timecode</label>
                  <input
                    type="text"
                    value={cp.timecode || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => {
                        prev.childhood.photos[idx].timecode = val;
                        return prev;
                      });
                    }}
                    className="w-full text-xs p-2 bg-white rounded border border-gray-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Photo Alt Text (Required)</label>
                  <input
                    type="text"
                    value={cp.photo.alt || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => {
                        prev.childhood.photos[idx].photo.alt = val;
                        return prev;
                      });
                    }}
                    className="w-full text-xs p-2 bg-white rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Handwritten Caption</label>
                <input
                  type="text"
                  value={cp.caption}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft((prev) => {
                      prev.childhood.photos[idx].caption = val;
                      return prev;
                    });
                  }}
                  className="w-full text-xs p-2 bg-white rounded border border-gray-300 font-serif"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="w-16 h-12 rounded bg-gray-200 overflow-hidden shrink-0 border border-gray-300">
                  <img src={cp.photo.file} alt={cp.photo.alt} className="w-full h-full object-cover" />
                </div>
                <label className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> Replace Photo (4:3)
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(draft.childhood.photos[idx].photo, e)}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Archival Memories List */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Archival Memories ({draft.childhood.memories.length} notes)
            </span>
            <button
              onClick={() =>
                updateDraft((prev) => {
                  prev.childhood.memories.push('New archival memory note...');
                  return prev;
                })
              }
              className="text-xs text-gray-700 hover:text-black font-semibold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Note
            </button>
          </div>
          {draft.childhood.memories.map((mem, memIdx) => (
            <div key={memIdx} className="flex items-center gap-2">
              <input
                type="text"
                value={mem}
                onChange={(e) => {
                  const val = e.target.value;
                  updateDraft((prev) => {
                    prev.childhood.memories[memIdx] = val;
                    return prev;
                  });
                }}
                className="flex-1 text-xs p-2 bg-white rounded border border-gray-300"
              />
              <button
                onClick={() =>
                  updateDraft((prev) => {
                    prev.childhood.memories.splice(memIdx, 1);
                    return prev;
                  })
                }
                className="p-1.5 text-gray-400 hover:text-red-600"
                title="Delete memory"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Interlude A: THE SILENCE (BEAS)
  if (activeSection === 'beas') {
    const isApproved = draft.interludeBeas.approved;
    const isHidden = draft.interludeBeas.hidden;

    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Interlude: THE SILENCE (BEAS)</h2>
            <p className="text-xs text-gray-500">
              Contemplative river silence interlude with dusk photography and quiet prose (max 5 lines).
            </p>
          </div>
        </div>

        {/* Toggles Banner: Approval and Visibility */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Approval Toggle */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">Owner Approval</span>
              <button
                onClick={() =>
                  updateDraft((prev) => {
                    prev.interludeBeas.approved = !prev.interludeBeas.approved;
                    return prev;
                  })
                }
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  isApproved ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {isApproved ? 'Approved Live' : 'Held as Draft'}
              </button>
            </div>
            <p className="text-[11px] text-gray-500">
              {isApproved
                ? 'Lines are approved to render publicly.'
                : 'Lines are held in draft; public site displays placeholder.'}
            </p>
          </div>

          {/* Visibility / Hide Toggle */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">Chapter Visibility</span>
              <button
                onClick={() =>
                  updateDraft((prev) => {
                    prev.interludeBeas.hidden = !prev.interludeBeas.hidden;
                    return prev;
                  })
                }
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  !isHidden ? 'bg-blue-600 text-white' : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {!isHidden ? 'Visible on Site' : 'Hidden from Site'}
              </button>
            </div>
            <p className="text-[11px] text-gray-500">
              {!isHidden
                ? 'Included in chapter swatches and scroll transitions.'
                : 'Hidden cleanly: Page 3 connects seamlessly to Page 4 with no broken next link.'}
            </p>
          </div>
        </div>

        {/* Lines Editor */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Silence Lines ({draft.interludeBeas.lines.length} / 5 max)
              </span>
              {draft.interludeBeas.lines.length > 5 && (
                <span className="text-[11px] text-red-600 block">Exceeds 5-line limit</span>
              )}
            </div>
            {draft.interludeBeas.lines.length < 5 && (
              <button
                onClick={() =>
                  updateDraft((prev) => {
                    prev.interludeBeas.lines.push('where the noise outside finally turns quiet.');
                    return prev;
                  })
                }
                className="text-xs text-gray-700 hover:text-black font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Line
              </button>
            )}
          </div>

          {draft.interludeBeas.lines.map((line, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={line}
                onChange={(e) => {
                  const val = e.target.value;
                  updateDraft((prev) => {
                    prev.interludeBeas.lines[idx] = val;
                    return prev;
                  });
                }}
                className="flex-1 text-xs p-2 bg-white rounded border border-gray-300 font-serif italic"
              />
              <button
                onClick={() =>
                  updateDraft((prev) => {
                    prev.interludeBeas.lines.splice(idx, 1);
                    return prev;
                  })
                }
                className="p-1.5 text-gray-400 hover:text-red-600"
                title="Delete line"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* River Sunset Photography Slot */}
        {draft.interludeBeas.photo && (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              River Photography Slot (Landscape Full-Bleed)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Alt Text (Required)</label>
                <input
                  type="text"
                  value={draft.interludeBeas.photo.alt || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft((prev) => {
                      if (prev.interludeBeas.photo) prev.interludeBeas.photo.alt = val;
                      return prev;
                    });
                  }}
                  className="w-full text-xs p-2 bg-white rounded border border-gray-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Caption</label>
                <input
                  type="text"
                  value={draft.interludeBeas.photo.caption || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft((prev) => {
                      if (prev.interludeBeas.photo) prev.interludeBeas.photo.caption = val;
                      return prev;
                    });
                  }}
                  className="w-full text-xs p-2 bg-white rounded border border-gray-300 font-serif"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="w-24 h-14 rounded bg-gray-200 overflow-hidden shrink-0 border border-gray-300">
                <img
                  src={draft.interludeBeas.photo.file}
                  alt={draft.interludeBeas.photo.alt}
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Replace River Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(draft.interludeBeas.photo!, e)}
                />
              </label>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Page 4: PEOPLE I CARRY
  if (activeSection === 'people') {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Page 4: PEOPLE I CARRY</h2>
            <p className="text-xs text-gray-500">
              Constellation star nodes of beloved anchors, mentors, and loved ones.
            </p>
          </div>
          <button
            onClick={() =>
              updateDraft((prev) => {
                prev.people.push({
                  id: `person_${Date.now()}`,
                  name: 'New Person',
                  relationship: 'Friend & Confidant',
                  note: 'A tender note about them...',
                  moment: 'A specific shared moment in time...',
                  x: 50,
                  y: 50,
                  photo: {
                    id: `p_${Date.now()}`,
                    file: prev.hero.portrait.file,
                    alt: 'Portrait of person',
                    orientation: 'portrait',
                  },
                });
                return prev;
              })
            }
            className="px-3 py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-lg flex items-center gap-1 hover:bg-black transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Person Node
          </button>
        </div>

        <div className="space-y-4">
          {draft.people.map((person, idx) => (
            <div key={person.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-xs font-bold text-gray-800">
                  Person #{idx + 1}: {person.name} ({person.relationship})
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      updateDraft((prev) => {
                        const clonePerson = JSON.parse(JSON.stringify(prev.people[idx]));
                        clonePerson.id = `person_${Date.now()}`;
                        clonePerson.name = `${clonePerson.name} (Copy)`;
                        prev.people.splice(idx + 1, 0, clonePerson);
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
                          const temp = prev.people[idx];
                          prev.people[idx] = prev.people[idx - 1];
                          prev.people[idx - 1] = temp;
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
                        if (idx < prev.people.length - 1) {
                          const temp = prev.people[idx];
                          prev.people[idx] = prev.people[idx + 1];
                          prev.people[idx + 1] = temp;
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
                      deleteWithHistory('people', person.name, person, () =>
                        updateDraft((prev) => {
                          prev.people.splice(idx, 1);
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
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={person.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => {
                        prev.people[idx].name = val;
                        return prev;
                      });
                    }}
                    className="w-full text-xs p-2 bg-white rounded border border-gray-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Relationship / Anchor</label>
                  <input
                    type="text"
                    value={person.relationship}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => {
                        prev.people[idx].relationship = val;
                        return prev;
                      });
                    }}
                    className="w-full text-xs p-2 bg-white rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Tender Note</label>
                <input
                  type="text"
                  value={person.note}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft((prev) => {
                      prev.people[idx].note = val;
                      return prev;
                    });
                  }}
                  className="w-full text-xs p-2 bg-white rounded border border-gray-300 italic"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Shared Moment in Time</label>
                <textarea
                  rows={2}
                  value={person.moment}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft((prev) => {
                      prev.people[idx].moment = val;
                      return prev;
                    });
                  }}
                  className="w-full text-xs p-2 bg-white rounded border border-gray-300"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-300">
                  <img src={person.photo.file} alt={person.photo.alt} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Photo Alt Text</label>
                  <input
                    type="text"
                    value={person.photo.alt || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => {
                        prev.people[idx].photo.alt = val;
                        return prev;
                      });
                    }}
                    className="w-full text-xs p-1.5 bg-white rounded border border-gray-300"
                  />
                </div>
                <label className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-1.5 shrink-0">
                  <Upload className="w-3.5 h-3.5" /> Avatar Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(draft.people[idx].photo, e)}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Page 5: LUCKY, ACTUALLY
  if (activeSection === 'lucky') {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Page 5: LUCKY, ACTUALLY</h2>
          <p className="text-xs text-gray-500">
            The 7 locked words of gratitude, memory per word, and small badge photography slots.
          </p>
        </div>

        <div className="space-y-4">
          {draft.lucky.map((item, idx) => (
            <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-xs font-bold text-gray-800">
                  Word #{idx + 1}: <span className="uppercase text-emerald-700">{item.word}</span>
                </span>
                <span className="text-[10px] font-mono text-gray-400">Locked Word Motif</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Memory Prose</label>
                <textarea
                  rows={2}
                  value={item.memory}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft((prev) => {
                      prev.lucky[idx].memory = val;
                      return prev;
                    });
                  }}
                  className="w-full text-xs p-2 bg-white rounded border border-gray-300 font-serif"
                />
              </div>

              {item.photo && (
                <div className="flex items-center gap-4 pt-1">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0 border border-gray-300">
                    <img src={item.photo.file} alt={item.photo.alt} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Photo Alt Text</label>
                    <input
                      type="text"
                      value={item.photo.alt || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft((prev) => {
                          if (prev.lucky[idx].photo) prev.lucky[idx].photo!.alt = val;
                          return prev;
                        });
                      }}
                      className="w-full text-xs p-1.5 bg-white rounded border border-gray-300"
                    />
                  </div>
                  <label className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" /> Badge Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(draft.lucky[idx].photo!, e)}
                    />
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Page 6: LOOK HOW FAR
  if (activeSection === 'proud') {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Page 6: LOOK HOW FAR</h2>
            <p className="text-xs text-gray-500">
              Personal pride milestones, creative leaps, and measurable triumphs.
            </p>
          </div>
          <button
            onClick={() =>
              updateDraft((prev) => {
                prev.proud.push({
                  id: `proud_${Date.now()}`,
                  title: 'New Milestone',
                  date: '2024',
                  story: 'How this milestone took shape...',
                  number: { value: 1, unit: 'milestone' },
                  photo: {
                    id: `pr_${Date.now()}`,
                    file: prev.hero.panorama.file,
                    alt: 'Milestone photograph',
                    orientation: 'landscape',
                  },
                });
                return prev;
              })
            }
            className="px-3 py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-lg flex items-center gap-1 hover:bg-black transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Milestone
          </button>
        </div>

        <div className="space-y-4">
          {draft.proud.map((item, idx) => (
            <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-xs font-bold text-gray-800">
                  Milestone #{idx + 1}: {item.title} ({item.date})
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      updateDraft((prev) => {
                        const cloneItem = JSON.parse(JSON.stringify(prev.proud[idx]));
                        cloneItem.id = `proud_${Date.now()}`;
                        cloneItem.title = `${cloneItem.title} (Copy)`;
                        prev.proud.splice(idx + 1, 0, cloneItem);
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
                          const temp = prev.proud[idx];
                          prev.proud[idx] = prev.proud[idx - 1];
                          prev.proud[idx - 1] = temp;
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
                        if (idx < prev.proud.length - 1) {
                          const temp = prev.proud[idx];
                          prev.proud[idx] = prev.proud[idx + 1];
                          prev.proud[idx + 1] = temp;
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
                      deleteWithHistory('proud', item.title, item, () =>
                        updateDraft((prev) => {
                          prev.proud.splice(idx, 1);
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => {
                        prev.proud[idx].title = val;
                        return prev;
                      });
                    }}
                    className="w-full text-xs p-2 bg-white rounded border border-gray-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Date</label>
                  <input
                    type="text"
                    value={item.date}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => {
                        prev.proud[idx].date = val;
                        return prev;
                      });
                    }}
                    className="w-full text-xs p-2 bg-white rounded border border-gray-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Metric #</label>
                    <input
                      type="number"
                      value={item.number?.value ?? 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateDraft((prev) => {
                          prev.proud[idx].number = {
                            value: val,
                            unit: prev.proud[idx].number?.unit || 'milestone',
                          };
                          return prev;
                        });
                      }}
                      className="w-full text-xs p-2 bg-white rounded border border-gray-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Unit</label>
                    <input
                      type="text"
                      value={item.number?.unit || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft((prev) => {
                          prev.proud[idx].number = {
                            value: prev.proud[idx].number?.value ?? 0,
                            unit: val,
                          };
                          return prev;
                        });
                      }}
                      className="w-full text-xs p-2 bg-white rounded border border-gray-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Story & Memory</label>
                <textarea
                  rows={2}
                  value={item.story}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft((prev) => {
                      prev.proud[idx].story = val;
                      return prev;
                    });
                  }}
                  className="w-full text-xs p-2 bg-white rounded border border-gray-300 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <div className="w-16 h-12 rounded bg-gray-200 overflow-hidden shrink-0 border border-gray-300">
                  <img src={item.photo.file} alt={item.photo.alt} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Photo Alt Text</label>
                  <input
                    type="text"
                    value={item.photo.alt || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => {
                        prev.proud[idx].photo.alt = val;
                        return prev;
                      });
                    }}
                    className="w-full text-xs p-1.5 bg-white rounded border border-gray-300"
                  />
                </div>
                <label className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-1.5 shrink-0">
                  <Upload className="w-3.5 h-3.5" /> Milestone Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(draft.proud[idx].photo, e)}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Page 7: I WONDER
  if (activeSection === 'wonder') {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Page 7: I WONDER</h2>
          <p className="text-xs text-gray-500">
            9 concentric curiosity orbits: intellectual wonders, creative questions, and why they matter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {draft.wonder.map((wItem, idx) => (
            <div key={wItem.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-xs font-bold text-gray-800">
                  Orbit #{idx + 1}: Ring {wItem.ring}
                </span>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                  {wItem.name}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Category Title</label>
                <input
                  type="text"
                  value={wItem.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft((prev) => {
                      prev.wonder[idx].name = val;
                      return prev;
                    });
                  }}
                  className="w-full text-xs p-2 bg-white rounded border border-gray-300 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Exploration Prompt</label>
                <input
                  type="text"
                  value={wItem.explores}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft((prev) => {
                      prev.wonder[idx].explores = val;
                      return prev;
                    });
                  }}
                  className="w-full text-xs p-2 bg-white rounded border border-gray-300 italic"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Why It Matters</label>
                <textarea
                  rows={2}
                  value={wItem.why}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft((prev) => {
                      prev.wonder[idx].why = val;
                      return prev;
                    });
                  }}
                  className="w-full text-xs p-2 bg-white rounded border border-gray-300 leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Page 8: NOT YET
  if (activeSection === 'notYet') {
    const ambitionKeys = Object.keys(draft.notYet.ambitions || {});

    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Page 8: NOT YET</h2>
          <p className="text-xs text-gray-500">
            Unfinished ambitions, areas for intentional improvement, and future trajectories.
          </p>
        </div>

        {/* Improvement Line */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
          <label className="block text-[11px] font-semibold text-gray-700">What I Want to Improve</label>
          <textarea
            rows={2}
            value={draft.notYet.improve}
            onChange={(e) => {
              const val = e.target.value;
              updateDraft((prev) => {
                prev.notYet.improve = val;
                return prev;
              });
            }}
            className="w-full text-xs p-2.5 bg-white rounded-lg border border-gray-300 font-serif italic"
          />
        </div>

        {/* Ambitions Record */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Ambitions Dictionary ({ambitionKeys.length} categories)
            </span>
            <button
              onClick={() => {
                const newKey = prompt('Enter new ambition category title:');
                if (newKey && newKey.trim()) {
                  updateDraft((prev) => {
                    prev.notYet.ambitions[newKey.trim()] = 'Describe goal here...';
                    return prev;
                  });
                }
              }}
              className="text-xs text-gray-700 hover:text-black font-semibold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Category
            </button>
          </div>

          <div className="space-y-3">
            {ambitionKeys.map((key) => (
              <div key={key} className="p-3 bg-white rounded-lg border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800">{key}</span>
                  <button
                    onClick={() =>
                      updateDraft((prev) => {
                        delete prev.notYet.ambitions[key];
                        return prev;
                      })
                    }
                    className="text-gray-400 hover:text-red-600 p-1"
                    title="Remove ambition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={draft.notYet.ambitions[key]}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft((prev) => {
                      prev.notYet.ambitions[key] = val;
                      return prev;
                    });
                  }}
                  className="w-full text-xs p-2 bg-gray-50 rounded border border-gray-200"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Goals List */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Goals List ({draft.notYet.goals.length} goals)
            </span>
            <button
              onClick={() =>
                updateDraft((prev) => {
                  prev.notYet.goals.push('New aspiring goal...');
                  return prev;
                })
              }
              className="text-xs text-gray-700 hover:text-black font-semibold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Goal
            </button>
          </div>
          {draft.notYet.goals.map((goal, gIdx) => (
            <div key={gIdx} className="flex items-center gap-2">
              <input
                type="text"
                value={goal}
                onChange={(e) => {
                  const val = e.target.value;
                  updateDraft((prev) => {
                    prev.notYet.goals[gIdx] = val;
                    return prev;
                  });
                }}
                className="flex-1 text-xs p-2 bg-white rounded border border-gray-300"
              />
              <button
                onClick={() =>
                  updateDraft((prev) => {
                    prev.notYet.goals.splice(gIdx, 1);
                    return prev;
                  })
                }
                className="p-1.5 text-gray-400 hover:text-red-600"
                title="Delete goal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Not Yet Photo (Slot 5:4) */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Photography Slot (Ratio 5:4)</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-14 rounded bg-gray-200 overflow-hidden shrink-0 border border-gray-300">
              <img
                src={draft.notYet.photo.file}
                alt={draft.notYet.photo.alt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Alt Text (Required)</label>
                <input
                  type="text"
                  value={draft.notYet.photo.alt || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft((prev) => {
                      prev.notYet.photo.alt = val;
                      return prev;
                    });
                  }}
                  className="w-full text-xs p-1.5 bg-white rounded border border-gray-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Caption</label>
                <input
                  type="text"
                  value={draft.notYet.photo.caption || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft((prev) => {
                      prev.notYet.photo.caption = val;
                      return prev;
                    });
                  }}
                  className="w-full text-xs p-1.5 bg-white rounded border border-gray-300 font-serif"
                />
              </div>
            </div>
            <label className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-1.5 shrink-0">
              <Upload className="w-3.5 h-3.5" /> Replace Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoUpload(draft.notYet.photo, e)}
              />
            </label>
          </div>
        </div>
      </div>
    );
  }

  // Page 9: ONE DAY
  if (activeSection === 'dreams') {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Page 9: ONE DAY</h2>
            <p className="text-xs text-gray-500">
              Geography of longing: places of future reverence, horizons, and why they call.
            </p>
          </div>
          <button
            onClick={() =>
              updateDraft((prev) => {
                prev.dreams.push({
                  id: `dream_${Date.now()}`,
                  place: 'New Destination',
                  why: 'Why this place calls...',
                  year: 'Future',
                  photo: {
                    id: `dr_${Date.now()}`,
                    file: prev.hero.panorama.file,
                    alt: 'Photograph of destination',
                    orientation: 'landscape',
                  },
                });
                return prev;
              })
            }
            className="px-3 py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-lg flex items-center gap-1 hover:bg-black transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Dream Destination
          </button>
        </div>

        <div className="space-y-4">
          {draft.dreams.map((dream, idx) => (
            <div key={dream.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-xs font-bold text-gray-800">
                  Destination #{idx + 1}: {dream.place}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      updateDraft((prev) => {
                        const cloneDream = JSON.parse(JSON.stringify(prev.dreams[idx]));
                        cloneDream.id = `dream_${Date.now()}`;
                        cloneDream.place = `${cloneDream.place} (Copy)`;
                        prev.dreams.splice(idx + 1, 0, cloneDream);
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
                          const temp = prev.dreams[idx];
                          prev.dreams[idx] = prev.dreams[idx - 1];
                          prev.dreams[idx - 1] = temp;
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
                        if (idx < prev.dreams.length - 1) {
                          const temp = prev.dreams[idx];
                          prev.dreams[idx] = prev.dreams[idx + 1];
                          prev.dreams[idx + 1] = temp;
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
                      deleteWithHistory('dreams', dream.place, dream, () =>
                        updateDraft((prev) => {
                          prev.dreams.splice(idx, 1);
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
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Place / City</label>
                  <input
                    type="text"
                    value={dream.place}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => {
                        prev.dreams[idx].place = val;
                        return prev;
                      });
                    }}
                    className="w-full text-xs p-2 bg-white rounded border border-gray-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Expected Year</label>
                  <input
                    type="text"
                    value={dream.year || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => {
                        prev.dreams[idx].year = val;
                        return prev;
                      });
                    }}
                    className="w-full text-xs p-2 bg-white rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Why This Calls</label>
                <textarea
                  rows={2}
                  value={dream.why}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft((prev) => {
                      prev.dreams[idx].why = val;
                      return prev;
                    });
                  }}
                  className="w-full text-xs p-2 bg-white rounded border border-gray-300 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <div className="w-20 h-12 rounded bg-gray-200 overflow-hidden shrink-0 border border-gray-300">
                  <img src={dream.photo.file} alt={dream.photo.alt} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
                    Photo Alt Text (16:9 Slot)
                  </label>
                  <input
                    type="text"
                    value={dream.photo.alt || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => {
                        prev.dreams[idx].photo.alt = val;
                        return prev;
                      });
                    }}
                    className="w-full text-xs p-1.5 bg-white rounded border border-gray-300"
                  />
                </div>
                <label className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-1.5 shrink-0">
                  <Upload className="w-3.5 h-3.5" /> 16:9 Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(draft.dreams[idx].photo, e)}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Page 10: TO WHOEVER I BECOME
  if (activeSection === 'letters') {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Page 10: TO WHOEVER I BECOME</h2>
            <p className="text-xs text-gray-500">
              Future self letters with wax seals and folded envelopes (min 4 letters required).
            </p>
          </div>
          <button
            onClick={() =>
              updateDraft((prev) => {
                prev.letters.push({
                  id: `letter_${Date.now()}`,
                  title: 'Letter to Vanshika at Thirty',
                  notes: 'To be read when the sky clears',
                  body: 'Dearest future self...',
                  date: new Date().getFullYear().toString(),
                  approved: false,
                });
                return prev;
              })
            }
            className="px-3 py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-lg flex items-center gap-1 hover:bg-black transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Letter
          </button>
        </div>

        {/* Mandatory Constitutional Visitor Notice */}
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 space-y-1">
            <span className="font-bold">Constitutional Privacy Guarantee:</span>
            <p>
              Visitor letters live exclusively in each visitor's own browser storage (localStorage). They are never
              transmitted to, aggregated in, or viewable from the server or admin portal.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {draft.letters.map((letter, idx) => (
            <div key={letter.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800">
                    Letter #{idx + 1}: {letter.title}
                  </span>
                  <button
                    onClick={() =>
                      updateDraft((prev) => {
                        prev.letters[idx].approved = !prev.letters[idx].approved;
                        return prev;
                      })
                    }
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      letter.approved
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {letter.approved ? 'Approved Live' : 'Held as Draft'}
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      updateDraft((prev) => {
                        const cloneLetter = JSON.parse(JSON.stringify(prev.letters[idx]));
                        cloneLetter.id = `letter_${Date.now()}`;
                        cloneLetter.title = `${cloneLetter.title} (Copy)`;
                        cloneLetter.approved = false;
                        prev.letters.splice(idx + 1, 0, cloneLetter);
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
                          const temp = prev.letters[idx];
                          prev.letters[idx] = prev.letters[idx - 1];
                          prev.letters[idx - 1] = temp;
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
                        if (idx < prev.letters.length - 1) {
                          const temp = prev.letters[idx];
                          prev.letters[idx] = prev.letters[idx + 1];
                          prev.letters[idx + 1] = temp;
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
                      deleteWithHistory('letters', letter.title, letter, () =>
                        updateDraft((prev) => {
                          prev.letters.splice(idx, 1);
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
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={letter.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => {
                        prev.letters[idx].title = val;
                        return prev;
                      });
                    }}
                    className="w-full text-xs p-2 bg-white rounded border border-gray-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Envelope Inscription</label>
                  <input
                    type="text"
                    value={letter.notes}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => {
                        prev.letters[idx].notes = val;
                        return prev;
                      });
                    }}
                    className="w-full text-xs p-2 bg-white rounded border border-gray-300 italic"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Letter Body</label>
                <textarea
                  rows={4}
                  value={letter.body}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft((prev) => {
                      prev.letters[idx].body = val;
                      return prev;
                    });
                  }}
                  className="w-full text-xs p-2.5 bg-white rounded border border-gray-300 leading-relaxed font-serif"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Page 11: STILL BECOMING
  if (activeSection === 'finale') {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Page 11: STILL BECOMING (FINALE)</h2>
          <p className="text-xs text-gray-500">
            Closing reflections, portrait of present stillness, contact links, and footer mark.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">Heading</label>
            <input
              type="text"
              value={draft.finale.heading}
              onChange={(e) => {
                const val = e.target.value;
                updateDraft((prev) => {
                  prev.finale.heading = val;
                  return prev;
                });
              }}
              className="w-full text-xs p-2 bg-gray-50 rounded border border-gray-300 font-serif"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">Closing Whisper Line</label>
            <input
              type="text"
              value={draft.finale.line}
              onChange={(e) => {
                const val = e.target.value;
                updateDraft((prev) => {
                  prev.finale.line = val;
                  return prev;
                });
              }}
              className="w-full text-xs p-2 bg-gray-50 rounded border border-gray-300 italic"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Finale Prose</label>
          <textarea
            rows={3}
            value={draft.finale.text}
            onChange={(e) => {
              const val = e.target.value;
              updateDraft((prev) => {
                prev.finale.text = val;
                return prev;
              });
            }}
            className="w-full text-xs p-2.5 bg-gray-50 rounded border border-gray-300 leading-relaxed font-serif"
          />
        </div>

        {/* Footer Mark Line */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
          <label className="block text-[11px] font-semibold text-gray-700">Footer Line</label>
          <input
            type="text"
            value={draft.footer?.line || ''}
            onChange={(e) => {
              const val = e.target.value;
              updateDraft((prev) => {
                prev.footer = { line: val };
                return prev;
              });
            }}
            className="w-full text-xs p-2 bg-white rounded border border-gray-300 font-mono"
          />
        </div>

        {/* Finale Portrait Photo */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Finale Quiet Portrait (3:4 Slot)
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-18 rounded bg-gray-200 overflow-hidden shrink-0 border border-gray-300">
              <img
                src={draft.finale.photo.file}
                alt={draft.finale.photo.alt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Alt Text (Required)</label>
                <input
                  type="text"
                  value={draft.finale.photo.alt || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft((prev) => {
                      prev.finale.photo.alt = val;
                      return prev;
                    });
                  }}
                  className="w-full text-xs p-1.5 bg-white rounded border border-gray-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Caption</label>
                <input
                  type="text"
                  value={draft.finale.photo.caption || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft((prev) => {
                      prev.finale.photo.caption = val;
                      return prev;
                    });
                  }}
                  className="w-full text-xs p-1.5 bg-white rounded border border-gray-300 font-serif"
                />
              </div>
            </div>
            <label className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-1.5 shrink-0">
              <Upload className="w-3.5 h-3.5" /> Replace Portrait
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoUpload(draft.finale.photo, e)}
              />
            </label>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
