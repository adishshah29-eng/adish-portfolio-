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
// Chapter 1 -- "about us." Headings are unchanged (they already fit
// what's on screen); only the bodies changed, from pure atmosphere to
// the real arc underneath it: an AI/ML student in Mumbai (start-left),
// the first thing he ever shipped (top-left, the 2025 Parmar Properties
// stint -- Callnex + a voice bot), the main role running now (top-center,
// Resunova), the second one running alongside it (right, "mirror" being
// literal here -- two concurrent internships), and the unpaid one he
// still built anyway (middle, DJS ASTRA). One resume fact per shot, kept
// to a single plain sentence so it reads as continuous with the shots
// around it, not a bio dropped into the middle of one.
export const SHOTS = [
  {
    id: 'start-left',
    position: [-0.35, 0.04, 9.2],
    target: [-1.0, 0.05, 0],
    heading: 'The Hollow',
    body: 'An AI and Machine Learning student, in Mumbai, who builds.',
  },
  {
    id: 'top-left',
    position: [-0.4, 0.16, 6.4],
    target: [-1.3, 0.55, 0],
    heading: 'Bloom in the dark',
    body: 'A telecalling app, a voice bot: the first thing shipped.',
  },
  {
    id: 'top-center',
    position: [0, 0.18, 6.1],
    target: [0, 0.9, 0],
    heading: 'Light finds a way',
    body: 'Now building inside an AI platform, for a team abroad.',
  },
  {
    id: 'right',
    position: [0.4, 0.16, 6.4],
    target: [1.3, 0.55, 0],
    heading: 'Mirror bloom',
    body: 'The same drive, running two internships at once.',
  },
  {
    id: 'middle',
    position: [0, -0.04, 7.6],
    target: [0, -0.4, 0],
    heading: 'Still water',
    body: 'And a robotics team’s website, built for no pay, just because.',
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
  // Chapter 2-3 -- "toolkit and skills." Five shots, five skill
  // categories straight from the resume's own grouping (Languages /
  // Frontend / Backend & Databases / AI & Automation / Tools), one per
  // shot, in that order. The named-items-plus-consequence shape ("X, Y,
  // Z: <what they do>") is deliberately more itemized than chapter 1's
  // plain prose -- a toolkit is a list by nature, and the shift in
  // cadence marks these as a different kind of content without breaking
  // from the water/light/structure imagery the rest of the scene uses.
  {
    id: 'waterfall-close',
    position: [32, 0.1, 6.5],
    target: [32, 0, -3],
    heading: 'Where it falls',
    body: 'Python, Java, JavaScript: the water finds its rock.',
  },
  {
    id: 'left-bank',
    position: [31.6, 0.15, 5.9],
    target: [30.7, 0.45, -2],
    heading: 'Holding on',
    body: 'React, Next.js, GSAP: each ledge holding up the interface.',
  },
  {
    id: 'light-source',
    position: [32, 0.2, 5.3],
    target: [32, 0.7, -4],
    heading: 'The source',
    body: 'Node, Firebase, Supabase: where every request begins.',
  },
  {
    id: 'right-bank',
    position: [32.4, 0.15, 5.9],
    target: [33.3, 0.45, -2],
    heading: 'The far bank',
    body: 'n8n, Vapi, Claude: the same work, newer hands.',
  },
  {
    id: 'surface-reflections',
    position: [32, -0.3, 5.2],
    target: [32, -0.45, -1.5],
    heading: 'Surface',
    body: 'Git remembers every version. Vercel ships the one that matters.',
  },
  // Final beat: the camera pushes further in and centers on the archway's
  // light source, deeper than any shot before it, while FogOverlay (see
  // fogOpacityFor below) rises to fully cover the screen over this same
  // segment -- "the camera goes into the middle" and "mist covers the
  // screen" are one continuous motion, not two separately-timed effects.
  // No heading/body: this shot exists to transition out, not to add
  // another line to read, and text would just be fogged over anyway.
  {
    id: 'into-the-mist',
    position: [32, 0.0, 3.4],
    target: [32, 0.3, -4.5],
    heading: '',
    body: '',
  },
]

function smoothstep(t) {
  const c = clamp01(t)
  return c * c * (3 - 2 * c)
}

// Fog ramps across the LAST shot-to-shot segment only (from
// "surface-reflections" into "into-the-mist"), reusing that segment's
// existing scroll budget rather than adding a new one -- so the dolly-in
// and the mist rising are driven by the exact same stretch of scroll.
const FOG_RAMP_START = (SHOTS.length - 2) / (SHOTS.length - 1)

export function fogOpacityFor(shotProgress) {
  return smoothstep((shotProgress - FOG_RAMP_START) / (1 - FOG_RAMP_START))
}
