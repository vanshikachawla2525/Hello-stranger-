export type Photo = {
  id: string;
  file: string; // URL or asset path
  alt: string;
  year?: number | string;
  orientation: "portrait" | "landscape" | "square";
  caption?: string;
  description?: string;
  location?: string;
};

export type FourWord = {
  word: string;
  meaning: string;
};

export type PolaroidItem = {
  id: string;
  photo: Photo;
  caption: string;
  tilt?: number;
  tapeColor?: string;
  note?: string;
  hidden?: boolean;
};

export type DraftEntry = {
  id: string;
  date: string;
  title?: string;
  text: string;
  pullQuote?: string;
  photo?: Photo;
  marginNote?: string;
  hidden?: boolean;
};

export type ChildhoodPhoto = {
  id: string;
  photo: Photo;
  year: number | string;
  caption: string;
  timecode?: string;
  hidden?: boolean;
};

export type PersonNode = {
  id: string;
  name: string;
  relationship: string;
  photo: Photo;
  note: string;
  moment: string;
  x: number; // percentage in constellation (0-100)
  y: number; // percentage in constellation (0-100)
  hidden?: boolean;
};

export type LuckyWord = {
  id: string;
  word: string;
  memory: string;
  photo?: Photo;
  hidden?: boolean;
};

export type ProudItem = {
  id: string;
  number?: { value: number; unit?: string; label?: string };
  title: string;
  date: string;
  story: string;
  photo: Photo;
  hidden?: boolean;
};

export type WonderCategory = {
  id: string;
  name: string;
  ring: 1 | 2 | 3;
  explores: string;
  why: string;
};

export type DreamItem = {
  id: string;
  place: string;
  why: string;
  photo: Photo;
  year?: string;
  hidden?: boolean;
};

export type LetterItem = {
  id: string;
  title: string;
  notes: string;
  body: string;
  date?: string;
  approved?: boolean;
  hidden?: boolean;
};

export type VisitorLetter = {
  id: string;
  author: string;
  message: string;
  timestamp: string;
};

export type SiteContent = {
  identity: {
    name: string;
    birthday: string;
    siteDate: string;
    subline: string;
    fourWords: FourWord[];
  };
  touchstones: {
    film: string;
    place: string;
    placeNote: string;
    song: string;
    songLine: string;
  };
  hero: {
    panorama: Photo;
    portrait: Photo;
    portraitSecondary?: Photo;
    notes: string[];
    stamps: string[];
  };
  noBigDeal: {
    ribbonLine: string;
    marquee: string[];
    insideJokes: string[];
    randomFacts: string[];
    polaroids: PolaroidItem[];
    tearLine: string;
  };
  drafts: {
    entries: DraftEntry[];
  };
  childhood: {
    photos: ChildhoodPhoto[];
    memories: string[];
    quote: string;
  };
  interludeBeas: {
    lines: string[];
    photo?: Photo;
    approved?: boolean;
    hidden?: boolean;
  };
  people: PersonNode[];
  lucky: LuckyWord[];
  proud: ProudItem[];
  wonder: WonderCategory[];
  notYet: {
    photo: Photo;
    ambitions: Record<string, string>;
    improve: string;
    goals: string[];
  };
  dreams: DreamItem[];
  letters: LetterItem[];
  finale: {
    heading: string;
    text: string;
    line: string;
    photo: Photo;
  };
  thread?: { enabled: boolean };
  interludeB?: { enabled: boolean };
  audioTrack?: { file: string; title: string };
  footer?: { line: string };
};
