// The scroll-driven camera path for the cave scene. Each shot is an
// authored camera position + look-at target in world units, plus the text
// that reads while that shot is on screen. Order here is playback order --
// scroll maps linearly onto this list, shot i sitting at progress i/(N-1),
// with a smoothstep-eased pan between consecutive shots in between.
//
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
