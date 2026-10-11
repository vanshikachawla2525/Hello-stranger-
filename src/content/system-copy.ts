export const systemCopy = {
  loader: {
    lines: [
      { max: 25, text: "developing the photographs" },
      { max: 50, text: "finding the good light" },
      { max: 75, text: "putting things back in order" },
      { max: 100, text: "almost ready to be looked at" },
    ],
    skip: "skip [esc]",
    framePrefix: "frame",
  },
  gate: {
    title: "this is a private room. say the word.",
    error: "not quite. try the one only you would say.",
    submit: "enter",
    honestyNote: "This gate is a light personal threshold.",
  },
  pills: {
    explore: "✦ explore",
    random: "✦ random me",
    close: "put it back",
  },
  delight: {
    console: "hello, stranger. you looked.",
    tabBlur: "come back, stranger.",
  },
  error: {
    notFoundTitle: "this page wasn't saved.",
    notFoundButton: "go back to the beginning.",
    offline: "you've lost the signal. the memories will still be here.",
  },
  admin: {
    portalTitle: "Admin Portal · hello, stranger.",
    lockedNote: "fixed by the design constitution",
    noLyricsWarning: "Song field must be a title only. Do not paste song lyrics.",
    altTextRequired: "Every photo must have descriptive alt text before publishing.",
    emojiBlocked: "No emoji allowed anywhere in text fields. Glyph ✦ is reserved for nav pills.",
    approvalRequired: "Unapproved draft items (letters, Beas lines) are held from public view.",
    guestbookNote: "Visitor notes live exclusively in each visitor's browser localStorage and are never stored or viewed in the admin portal.",
  },
};
