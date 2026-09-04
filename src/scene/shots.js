// The scroll-driven camera path for the cave scene. Each shot is an
// authored camera position + look-at target in world units, plus the text
// that reads while that shot is on screen. Order here is playback order --
// scroll maps linearly onto this list, shot i sitting at progress i/(N-1),
// eased-interpolated continuously between consecutive shots as you scroll.
//
// A previous version pinned each shot with a hard hold-move-hold structure
// (the camera fully freezing at each shot for a wide DWELL zone before it
// was allowed to move again). That made scrolling feel unresponsive --
// long stretches where scroll input visibly did nothing -- so it's gone;
// motion now tracks scroll directly the whole way, with only the shot-to-
// shot easing (smoothstep in getShotState) softening the very start/end of
// each transition, not a standalone held plateau.

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
  // Chapter 2-3: all five of these shots look at the SAME backdrop
  // "island" (see standaloneRect/CHAPTER23_X in CaveScene.jsx) far out on
  // the world x-axis rather than a slice of the main photo -- a new
  // composition, but ONE new composition shared by both chapters, not
  // two. The wide gap the camera crosses to reach it is empty space by
  // construction (nothing is rendered between islands), which reads as
  // the passage briefly darkening between chambers rather than as a
  // rendering gap, as long as that crossing stays a single continuous
  // pan. Within the island itself this mirrors chapter 1's own five-shot
  // cadence exactly, not just its two bookends: a wide arrival, a pan
  // left, a push in on the light, a pan right, then dollying in closer
  // and lower toward the water for a quieter final beat -- the same
  // "camera moment" chapter 1 has, applied to this photo instead of a
  // new one per shot.
  {
    id: 'waterfall-close',
    position: [32, 0.1, 6.5],
    target: [32, 0, -3],
    heading: 'Where it falls',
    body: 'Water finds rock, and both are shaped by the meeting.',
  },
  {
    id: 'left-bank',
    position: [31.6, 0.15, 5.9],
    target: [30.7, 0.45, -2],
    heading: 'Holding on',
    body: 'Each ledge holds another bloom, further than the light reaches.',
  },
  {
    id: 'light-source',
    position: [32, 0.2, 5.3],
    target: [32, 0.7, -4],
    heading: 'The source',
    body: 'Every ray in this place begins here.',
  },
  {
    id: 'right-bank',
    position: [32.4, 0.15, 5.9],
    target: [33.3, 0.45, -2],
    heading: 'The far bank',
    body: 'The same procession, mirrored on the other side.',
  },
  {
    id: 'surface-reflections',
    position: [32, -0.3, 5.2],
    target: [32, -0.45, -1.5],
    heading: 'Surface',
    body: "Even still water remembers where it's been.",
  },
]
