import { z } from 'zod';

export type Photo = {
  id: string;
  file: string; // URL, asset path, or data URL
  alt: string;
  year?: number | string;
  orientation: "portrait" | "landscape" | "square";
  caption?: string;
  description?: string;
  width?: number;
  height?: number;
  dominantColor?: string;
  blurDataURL?: string;
};

export type Placeholder = `[PLACEHOLDER: ${string}]`;

export const PhotoZodSchema = z.object({
  id: z.string(),
  file: z.string().min(1, 'Photo path or URL is required'),
  alt: z.string().min(1, 'Alt text is strictly required for every photo'),
  year: z.union([z.number(), z.string()]).optional(),
  orientation: z.enum(['portrait', 'landscape', 'square']),
  caption: z.string().optional(),
  description: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  dominantColor: z.string().optional(),
  blurDataURL: z.string().optional(),
});

export const FourWordZodSchema = z.object({
  word: z.string(), // locked word (Lens, Muse, Doer, Bold)
  meaning: z.string().min(1, 'Meaning is required'),
});

export const PolaroidItemZodSchema = z.object({
  id: z.string(),
  photo: PhotoZodSchema,
  caption: z.string().min(1, 'Caption is required'),
  tilt: z.number().optional(),
  note: z.string().optional(),
});

export const DraftEntryZodSchema = z.object({
  id: z.string(),
  date: z.string().min(1, 'Date is required'),
  title: z.string().optional(),
  text: z.string().min(1, 'Draft body text is required'),
  pullQuote: z.string().optional(),
  photo: PhotoZodSchema.optional(),
  marginNote: z.string().optional(),
});

export const ChildhoodPhotoZodSchema = z.object({
  id: z.string(),
  photo: PhotoZodSchema,
  year: z.union([z.number(), z.string()]),
  caption: z.string().min(1, 'Caption is required'),
  timecode: z.string().optional(),
});

export const PersonNodeZodSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  photo: PhotoZodSchema,
  note: z.string().min(1, 'Note is required'),
  moment: z.string().min(1, 'Shared moment is required'),
  x: z.number(),
  y: z.number(),
});

export const LuckyWordZodSchema = z.object({
  id: z.string(),
  word: z.string(),
  memory: z.string().min(1, 'Memory text is required'),
  photo: PhotoZodSchema.optional(),
});

export const ProudItemZodSchema = z.object({
  id: z.string(),
  number: z
    .object({
      value: z.number(),
      unit: z.string().optional(),
      label: z.string().optional(),
    })
    .optional(),
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  story: z.string().min(1, 'Story is required'),
  photo: PhotoZodSchema,
});

export const WonderCategoryZodSchema = z.object({
  id: z.string(),
  name: z.string(),
  ring: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  explores: z.string().min(1, 'Exploration text is required'),
  why: z.string().min(1, 'Why text is required'),
});

export const DreamItemZodSchema = z.object({
  id: z.string(),
  place: z.string().min(1, 'Place name is required'),
  why: z.string().min(1, 'Why text is required'),
  photo: PhotoZodSchema,
  year: z.string().optional(),
});

export const LetterItemZodSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  notes: z.string().min(1, 'Envelope note is required'),
  body: z.string().min(1, 'Letter body is required'),
  date: z.string().optional(),
  approved: z.boolean(),
});

export const SiteContentZodSchema = z.object({
  identity: z.object({
    name: z.string(),
    birthday: z.string(),
    siteDate: z.string(),
    subline: z.string(),
    about: z.string().optional(),
    whatIDo: z.string().optional(),
    location: z.string().optional(),
    quirks: z.string().optional(),
    knownFor: z.string().optional(),
    fourWords: z.array(FourWordZodSchema).length(4, 'Must have exactly 4 touchstone words'),
  }),
  touchstones: z.object({
    film: z.string(),
    place: z.string(),
    placeNote: z.string(),
    song: z.string(),
    songLine: z.string(),
  }),
  hero: z.object({
    panorama: PhotoZodSchema,
    portrait: PhotoZodSchema,
    portraitSecondary: PhotoZodSchema.optional(),
    notes: z.array(z.string()).length(3, 'Hero must have exactly 3 notes'),
    stamps: z.array(z.string()).length(2, 'Hero must have exactly 2 stamps'),
  }),
  noBigDeal: z.object({
    ribbonLine: z.string().min(1, 'Gingham ribbon line is required'),
    marquee: z.array(z.string()).min(2, 'Marquee must have at least 2 items'),
    insideJokes: z.array(z.string()),
    randomFacts: z.array(z.string()),
    polaroids: z.array(PolaroidItemZodSchema).min(1, 'At least 1 Polaroid is required'),
    tearLine: z.string().min(1, 'The Tear transition line is required'),
  }),
  drafts: z.object({
    entries: z.array(DraftEntryZodSchema).min(5, 'Drafts requires 5 to 8 entries').max(8, 'Drafts requires 5 to 8 entries'),
  }),
  childhood: z.object({
    photos: z.array(ChildhoodPhotoZodSchema).min(1),
    memories: z.array(z.string()),
    quote: z.string(),
  }),
  interludeBeas: z.object({
    lines: z.array(z.string()).min(1).max(5, 'Beas interlude allows up to 5 lines maximum'),
    photo: PhotoZodSchema.optional(),
    approved: z.boolean(),
    hidden: z.boolean().optional(),
  }),
  people: z.array(PersonNodeZodSchema).min(1),
  lucky: z.array(LuckyWordZodSchema).min(7),
  proud: z.array(ProudItemZodSchema).min(1),
  wonder: z.array(WonderCategoryZodSchema).length(9),
  notYet: z.object({
    photo: PhotoZodSchema,
    ambitions: z.record(z.string(), z.string()),
    improve: z.string().min(1),
    goals: z.array(z.string()),
  }),
  dreams: z.array(DreamItemZodSchema).min(1),
  letters: z.array(LetterItemZodSchema).min(4),
  finale: z.object({
    heading: z.string(),
    text: z.string(),
    line: z.string(),
    photo: PhotoZodSchema,
    links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
  }),
  footer: z.object({
    line: z.string(),
  }).optional(),
  interludeB: z.object({ enabled: z.boolean() }).optional(),
  thread: z.object({ enabled: z.boolean() }).optional(),
  audioTrack: PhotoZodSchema.optional(),
});
