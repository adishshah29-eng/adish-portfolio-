// The scroll-driven camera path for the cave scene. Each shot is an
// authored camera position + look-at target in world units, plus the text
// that reads while that shot is on screen. Order here is playback order --
// scroll maps linearly onto this list, shot i sitting at progress i/(N-1).
//
// This is a portfolio, not a demo reel -- a reader has to actually be able
// to read each line before the camera moves on, and a fast scroll (a
// single mobile swipe especially) must not be able to blow straight past
// a shot without ever landing on it. So the mapping isn't a continuous
// pan across the whole gap between shots: each shot gets a DWELL zone
// (camera fully holds at its exact position, text fully visible -- real
// reading time, guaranteed by scroll distance rather than scroll speed)
// bracketing a shorter TRANSITION zone where the camera actually moves.
// See getShotState in CaveScene.jsx and the matching window in
// StoryText.jsx (both read this same constant so camera holds and text
// visibility line up exactly).
//
// Fraction of each inter-shot segment held at the FROM shot before the
// transition starts (and, symmetrically, at the TO shot after it ends).
// Interior shots get this held on both sides (from the tail of the
// incoming segment and the head of the outgoing one), so they read for
// roughly 2x this fraction of a segment; the two end shots (nothing
// before shot 0, nothing after the last one) only get it once, at the
// scroll extremes where the page can't scroll further anyway.
export const DWELL_FRACTION = 0.38

// The page opens on a locked intro: "Adish Portfolio" wipes in
// letter-by-letter as the very first bit of scroll (see AdishName.jsx),
// camera pinned at shot 0 the entire time -- getShotState's raw progress
// stays clamped to exactly shot 0 until this fraction of the page is
// behind you, so the shot-to-shot camera sequence genuinely cannot begin
// until the name has fully revealed. remapAfterIntro turns the remaining
// (1 - INTRO_FRACTION) of the page back into a clean 0..1 for the shot
// sequence, so the shot pacing tuned elsewhere doesn't need to know this
// exists.
export const INTRO_FRACTION = 0.15

function clamp01(v) {
  return Math.min(1, Math.max(0, v))
}

export function remapAfterIntro(progress) {
  return clamp01((progress - INTRO_FRACTION) / (1 - INTRO_FRACTION))
}

// These are flat photo planes, not a wraparound panorama -- there is no
// real content past the edge of the source photo. A wide swing of the
// look-at target (rotating the camera far off-axis) points the frustum
// somewhere the plane's finite rectangle can't cover, no matter how much
// overhang it has, and exposes empty canvas as a black void; that failed
// in an earlier pass here. So each shot's "move to examine this feature"
// feeling comes mostly from the dolly (z) zooming in, with only a small,
// geometrically safe amount of pan/tilt (position and target both stay
// within about 1.5 world units of center) -- enough to read as the camera
// settling on a different part of the cave, never enough to rotate past
// what the photo actually contains.
export const SHOTS = [
  {
    id: 'start-left',
    position: [-0.35, 0.04, 9.2],
    target: [-1.0, 0.05, 0],
    heading: 'The Hollow',
    body: 'An entrance carved by water and time.',
  },
  {
    id: 'top-left',
    position: [-0.4, 0.16, 6.4],
    target: [-1.3, 0.55, 0],
    heading: 'Bloom in the dark',
    body: 'Life finds the narrowest ledge to hold onto.',
  },
  {
    id: 'top-center',
    position: [0, 0.18, 6.1],
    target: [0, 0.9, 0],
    heading: 'Light finds a way',
    body: 'A single opening, and everything below answers to it.',
  },
  {
    id: 'right',
    position: [0.4, 0.16, 6.4],
    target: [1.3, 0.55, 0],
    heading: 'Mirror bloom',
    body: 'The same story, told again on the other wall.',
  },
  {
    id: 'middle',
    position: [0, -0.04, 7.6],
    target: [0, -0.4, 0],
    heading: 'Still water',
    body: 'Where the fall settles, and the story rests.',
  },
  // Chapter 2-3: these two shots jump to entirely separate backdrop
  // "islands" far out on the world x-axis (see standaloneRect in
  // CaveScene.jsx) rather than continuing to reframe the same photo --
  // new compositions, not new crops of the original. The wide gap the
  // camera crosses to reach them is empty space by construction (nothing
  // is rendered between islands), which reads as the passage briefly
  // darkening between chambers rather than as a rendering gap, as long as
  // that crossing stays a single continuous pan.
  {
    id: 'waterfall-close',
    position: [32, 0.1, 6.5],
    target: [32, 0, -3],
    heading: 'Where it falls',
    body: 'Water finds rock, and both are shaped by the meeting.',
  },
  {
    id: 'surface-reflections',
    position: [64, -0.25, 6.3],
    target: [64, -0.3, -3],
    heading: 'Surface',
    body: "Even still water remembers where it's been.",
  },
]
