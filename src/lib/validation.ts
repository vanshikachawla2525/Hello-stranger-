import { SiteContentZodSchema } from '../content/schema';
import { SiteContent, Photo } from '../types/content';

// Unicode regex to detect emoji (except standard punctuation or the allowed star glyph)
const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

export type ValidationError = {
  field: string;
  message: string;
  severity: 'error' | 'warning';
};

export const hasEmoji = (text: string): boolean => {
  if (!text) return false;
  // Allow "✦" (white four pointed star glyph)
  const cleaned = text.replace(/✦/g, '');
  return EMOJI_REGEX.test(cleaned);
};

export const checkSongLyrics = (songText: string): string | null => {
  if (!songText) return null;
  if (songText.includes('\n') || songText.length > 70) {
    return 'Song field must be a title only (e.g. "Dil Mein Ik Lehar Si Uthi Hai Abhi"). Do not paste lyrics.';
  }
  return null;
};

// Find all photos currently active in the site
export const extractAllPhotos = (content: SiteContent): { location: string; photo: Photo }[] => {
  const result: { location: string; photo: Photo }[] = [];

  if (content.hero?.panorama) result.push({ location: 'Hero Panorama', photo: content.hero.panorama });
  if (content.hero?.portrait) result.push({ location: 'Hero Portrait', photo: content.hero.portrait });
  if (content.hero?.portraitSecondary) result.push({ location: 'Hero Secondary Frame', photo: content.hero.portraitSecondary });

  content.noBigDeal?.polaroids?.forEach((p, idx) => {
    if (p.photo) result.push({ location: `Scrapbook Polaroid #${idx + 1}`, photo: p.photo });
  });

  content.drafts?.entries?.forEach((e, idx) => {
    if (e.photo) result.push({ location: `Drafts Entry #${idx + 1}`, photo: e.photo });
  });

  content.childhood?.photos?.forEach((c, idx) => {
    if (c.photo) result.push({ location: `Childhood Frame #${idx + 1}`, photo: c.photo });
  });

  if (content.interludeBeas?.photo) {
    result.push({ location: 'Beas River Silence', photo: content.interludeBeas.photo });
  }

  content.people?.forEach((p) => {
    if (p.photo) result.push({ location: `Constellation Star: ${p.name}`, photo: p.photo });
  });

  content.lucky?.forEach((l) => {
    if (l.photo) result.push({ location: `Lucky Word: ${l.word}`, photo: l.photo });
  });

  content.proud?.forEach((pr) => {
    if (pr.photo) result.push({ location: `Proud Milestone: ${pr.title}`, photo: pr.photo });
  });

  if (content.notYet?.photo) {
    result.push({ location: 'Not Yet Horizon Frame', photo: content.notYet.photo });
  }

  content.dreams?.forEach((d) => {
    if (d.photo) result.push({ location: `Dream: ${d.place}`, photo: d.photo });
  });

  if (content.finale?.photo) {
    result.push({ location: 'Finale Still Becoming', photo: content.finale.photo });
  }

  return result;
};

// Scan all text in content recursively for emojis
export const findEmojisInContent = (obj: any, path = ''): string[] => {
  const findings: string[] = [];

  if (typeof obj === 'string') {
    if (hasEmoji(obj)) {
      findings.push(`Emoji found in ${path || 'text'}: "${obj.slice(0, 30)}..."`);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      findings.push(...findEmojisInContent(item, `${path}[${index}]`));
    });
  } else if (obj !== null && typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      // Don't flag IDs or internal asset files
      if (key !== 'id' && key !== 'file') {
        findings.push(...findEmojisInContent(obj[key], path ? `${path}.${key}` : key));
      }
    });
  }

  return findings;
};

// Compute runtime random-me pool count
export const calculateRandomPoolCount = (content: SiteContent): number => {
  let count = 0;
  count += content.identity?.fourWords?.length || 0;
  count += content.noBigDeal?.polaroids?.length || 0;
  count += content.drafts?.entries?.length || 0;
  count += content.noBigDeal?.insideJokes?.length || 0;
  count += content.proud?.length || 0;
  count += content.dreams?.length || 0;
  count += content.childhood?.photos?.length || 0;
  return count;
};

// Comprehensive validation before Publish
export const validateContentForPublish = (content: SiteContent): { isValid: boolean; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];

  // 1. Zod Schema Check
  const zodResult = SiteContentZodSchema.safeParse(content);
  if (!zodResult.success) {
    zodResult.error.issues.forEach((issue) => {
      errors.push({
        field: issue.path.join('.'),
        message: issue.message,
        severity: 'error',
      });
    });
  }

  // 2. Alt text enforcement
  const allPhotos = extractAllPhotos(content);
  allPhotos.forEach(({ location, photo }) => {
    if (!photo.alt || !photo.alt.trim()) {
      errors.push({
        field: location,
        message: `Missing required alt text description in ${location}.`,
        severity: 'error',
      });
    }
  });

  // 3. No Emoji rule
  const emojiViolations = findEmojisInContent(content);
  emojiViolations.forEach((violation) => {
    errors.push({
      field: 'Emoji Rule',
      message: violation,
      severity: 'error',
    });
  });

  // 4. Song lyrics rule
  const songWarning = checkSongLyrics(content.touchstones?.song || '');
  if (songWarning) {
    errors.push({
      field: 'touchstones.song',
      message: songWarning,
      severity: 'warning',
    });
  }

  // 5. Count rules
  const draftsCount = content.drafts?.entries?.length || 0;
  if (draftsCount < 5 || draftsCount > 8) {
    errors.push({
      field: 'drafts.entries',
      message: `Drafts section should have 5 to 8 entries (currently has ${draftsCount}).`,
      severity: draftsCount < 3 ? 'error' : 'warning',
    });
  }

  const beasLinesCount = content.interludeBeas?.lines?.length || 0;
  if (beasLinesCount > 5) {
    errors.push({
      field: 'interludeBeas.lines',
      message: `Beas interlude allows up to 5 lines maximum (currently has ${beasLinesCount}).`,
      severity: 'error',
    });
  }

  const randomPoolCount = calculateRandomPoolCount(content);
  if (randomPoolCount < 2) {
    errors.push({
      field: 'randomPool',
      message: `The "random me" pool needs at least 2 items (currently has ${randomPoolCount}).`,
      severity: 'error',
    });
  }

  // 6. Approval check
  const unapprovedLetters = content.letters?.filter((l) => !l.approved) || [];
  if (unapprovedLetters.length > 0) {
    errors.push({
      field: 'letters',
      message: `${unapprovedLetters.length} letter(s) are currently marked unapproved. Only approved letters appear on the live site.`,
      severity: 'warning',
    });
  }

  const hasBlockingErrors = errors.some((e) => e.severity === 'error');
  return {
    isValid: !hasBlockingErrors,
    errors,
  };
};

// Count placeholders in content
export const auditPlaceholders = (obj: any): { total: number; placeholderFields: string[] } => {
  const placeholderFields: string[] = [];
  let total = 0;

  const traverse = (item: any, path: string) => {
    if (typeof item === 'string') {
      total++;
      if (item.includes('[PLACEHOLDER:')) {
        placeholderFields.push(path);
      }
    } else if (Array.isArray(item)) {
      item.forEach((sub, i) => traverse(sub, `${path}[${i}]`));
    } else if (item !== null && typeof item === 'object') {
      Object.keys(item).forEach((k) => traverse(item[k], path ? `${path}.${k}` : k));
    }
  };

  traverse(obj, '');

  return {
    total,
    placeholderFields,
  };
};
