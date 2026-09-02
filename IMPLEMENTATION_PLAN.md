# The Hollow → Kage-fidelity Implementation Plan

Diagnosis of the current build, ordered plan to close the gap to Kage's quality bar, and a decision you need to make before I write any more code. Based on a full read of the `build-threejs-scroll-worlds` skill and the Kage anatomy reference (`build-threejs-scroll-worlds/references/kage-anatomy.md`).

---

## 0. Why the current build doesn't feel like Kage

I did what I promised in the previous rounds (Kage's scroll pattern + forest palette + shader upgrades) but I skipped the things that actually make Kage look Kage. The `kage-anatomy.md` reference is explicit — Kage's presence comes from **six coordinated systems**, and my build has three of them.

| System | Kage has | The Hollow v2 has | Gap |
|---|---|---|---|
| Palette & key ratio | Near-black base, single warm hero light, cold shadow fill | Bright forest green, high ambient | **Critical** |
| Fog | Dense exponential fog that swallows the horizon | Thin exponential fog; you see everything | **Critical** |
| Foreground alpha cut-outs | 10 WebP silhouettes (grass, sakura, pine, stones, walls, ruins…) pinned to a fixed `#foreground-sky` host, re-parented per chapter | None | **Critical — biggest single visual gap** |
| Background silhouette layers | Procedural `CanvasTexture` sky + separate silhouette ridge layers, with/without fog | Single sphere sky dome | Big |
| Tone mapping & bloom | ACES filmic exposure + restrained UnrealBloom, coordinated with emissive geometry (moon, lantern, halo) | No tone mapping, no bloom, only additive glow sprites | Big |
| Editorial image cards | Generated painterly stills (WebP) laid over the world as chapter media | Text-only | Medium |
| Word split & 72ms cadence | Yes (split, keep aria-label, presentational spans) | Yes ✓ | — |
| Damped scroll conductor (exact vs smooth) | Yes | Yes ✓ | — |
| Six `[data-cam]` chapters + Catmull–Rom | Yes | Yes ✓ | — |
| Custom cursor (fine pointers only) | Yes | Yes ✓ | — |
| Nav rail + chapter chips wired to progress | Yes | Yes ✓ | — |

Fixing the four rows marked **Critical/Big** is what "looks like Kage" means. Fixing the shader trees & water (last round) was necessary but insufficient — the reason my last render still reads as "bright cartoon jungle" is palette, fog, and the missing foreground silhouettes.

---

## 1. Direction decision — you pick before I code

Your original brief said "**not** night-and-moon like the reference — daylight-through-canopy, Ghibli-forest-spirit atmosphere." Your latest message says "**exact replica of his**." These are two different destinations. Pick one:

### Option A — Ghibli-forest at Kage fidelity  *(my recommendation)*
Keep the forest sanctuary theme + your palette (deep forest green, warm gold sunbeam, jade bioluminescent glow, bone mist white, dusty pink lotus accent). Apply **every** Kage cinema technique on top of it:
- Low-key palette: shift the greens 40% darker, raise contrast, drop ambient to 15%
- Dense exponential fog (`density ≈ 0.055` at chapter 0, varying per chapter)
- Single warm sunbeam key light coming from **behind** the sanctuary, so columns and trees silhouette forward (this is the "Ghibli forest-spirit" reading — warm rim + dark forms)
- Foreground alpha cutouts of ferns, moss stones, hanging vines, lotus pads, broken columns
- Two silhouette ridge/canopy layers behind trees for depth
- ACES tone mapping + restrained bloom on the relic glow and god-rays
- Editorial painterly stills (SVG stand-ins first) laid over chapters 01–04

This honors both briefs at once: your theme with Kage's polish.

### Option B — Kage's exact aesthetic with your content
Adopt Kage's palette wholesale: near-black `#05070a`, blue-charcoal shadows, warm amber lanterns, bone white, vermilion `#e0231c` accent. Replace forest with a temple-adjacent world (or a night grove — still your metaphor, still your words, but in Kage's palette).

This looks *most* like Kage but abandons the Ghibli-forest brief.

### Option C — Hybrid
Kage's palette + fog + tone-map, but keep some forest identity (jade glow, moss). Feels like Kage's cousin that lives in a forest at night.

**Default I'll build if you don't specify: Option A.** It's the only one that reconciles both your briefs.

---

## 2. Implementation plan (ordered by impact-per-hour)

Each step is a concrete change to `index.html` and, in Step 5, new files under `assets/`. I'll do them in this order, commit after each, and screenshot every stage so you can veto or redirect early.

### Step 1 — Rewrite the palette + lighting + fog  *(single biggest visual win)*

**Files:** `index.html` only.

- Bump `scene.fog` to `FogExp2(hexOf(base), 0.055–0.09)`, and vary `density` per chapter via the world-state interpolation pattern from the skill (`fog: 0.06` → `fog: 0.032` etc. in the CAM table).
- Rewrite palette tokens:
  - Option A: `--ink #04080a`, `--canopy #14261a`, `--moss #223a1e`, deepen ground color from `#a8b590` → `#4a5a3a`.
- Renderer config:
  ```js
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  ```
- Lighting collapse:
  - HemisphereLight `.55` → `.15` (drop ambient hard)
  - Add a single warm rim `DirectionalLight` **behind** the sanctuary (`position: [0, 14, -30]`, intensity `1.5`, color `0xffd68a`) — this is the sunbeam-through-canopy effect
  - Keep only one interior jade fill near the relic
- Ground: darker mossy tint, and a subtle vignette dome (large sphere with vertical dark-to-mid gradient) so the horizon reads as fog, not "bottom of a sphere"

**Verification:** screenshot desktop hero + chapter 03 (sanctuary). Should read low-key with the columns rim-lit from behind.

### Step 2 — Foreground alpha cutouts *(the "collage depth" Kage has and I don't)*

**Files:** `index.html`, plus 8 new files in `assets/foreground/*.svg`.

Implement the skill's `#foreground-sky` pattern exactly:
- Fixed host div `#foreground-sky` sits above the canvas at `z-index: 20`, `pointer-events: none`, `position: fixed; inset: 0`.
- Each `<section>` owns a `<div class="fg-stage">` with 1–3 alpha SVG cutouts positioned at the viewport bottom.
- `IntersectionObserver` promotes the active stage into `#foreground-sky` via `appendChild` (re-parent, not clone). Prior stage gets a `.retiring` class for 820ms (fade + blur), then returns to its source section.
- Cutouts I'll generate as SVG stand-ins now (swap for real WebP later):
  - `fern-frond.svg` — layered fern silhouette
  - `moss-stones.svg` — 3–5 mossy stones clustered
  - `hanging-vines.svg` — vines falling from top edge
  - `lotus-pads.svg` — floating pads for chapter 03
  - `broken-column.svg` — corner stone fragment
  - `tall-grass.svg` — soft grass tuft
  - `dead-leaves.svg` — small pile at bottom-left
  - `canopy-branch.svg` — top-corner branch reaching in

Per skill rule: cutouts arrive at full opacity, stay opaque while active, then fade+blur on handoff. Key by stable `data-foreground` attribute (they no longer live in their source section while active).

**Verification:** scroll slowly through all five chapters, confirm each cutout enters from its designed edge, is fully opaque while active, and fades+blurs on transition. Verify at 390×844.

### Step 3 — Background silhouette layers

**Files:** `index.html` only.

Per the anatomy: "Separate distant planes and control whether each participates in fog."

- Sky dome → generated `CanvasTexture` (already done) but darker, with a warm sunbeam gradient behind the sanctuary
- Add two silhouette layers between the sky and the trees:
  - `ridge-far`: a low-poly ridge silhouette plane at `z = -55`, fog-enabled so it fades into haze
  - `canopy-mid`: a broken canopy silhouette (foliage shapes) at `z = -35`, fog-enabled
- This is what gives Kage that layered "matte painting" depth — three atmospheric planes plus the live geometry.

**Verification:** hero shot should now show a distant ridge fading into fog behind the closer trees.

### Step 4 — Post-processing: bloom + film grain (real)

**Files:** `index.html` only. Vendor 3 more Three.js example files (they're MIT, ship with the r149 tarball).

- Add `EffectComposer` + `RenderPass` + `UnrealBloomPass` (threshold `0.82`, strength `0.55`, radius `0.4`). Wire it so the relic core, halo, fireflies, and god-rays bloom convincingly — the anatomy explicitly says "coordinate visible emitter, glow, and nearby light instead of asking bloom to create the lamp," so I'll match emissive intensities to bloom threshold.
- Current CSS grain overlay works but shift it under bloom's contribution so it doesn't get bloomed itself.

**Verification:** the relic should glow softly rather than sit as a flat sphere; fireflies should have a warm halo without turning the frame white.

### Step 5 — Editorial image cards

**Files:** `index.html` + 4 files under `assets/generated/*.svg`.

Per Kage's pattern — generated painterly stills laid over the world as chapter media:
- Chapter 01 (grove): one card, 320×420, floats at right side
- Chapter 02 (ruins): four-card grid already exists — replace text-only cards with cards that carry a small painterly still on top
- Chapter 03 (sanctuary): one hero card
- Chapter 04 (afterlight): one closing card

For now I'll build them as procedural SVG compositions (silhouettes + gradients matching the palette). They're clearly stand-ins with a TODO comment; when you have real generated art (GPT Image / Midjourney / Grok Imagine), drop the WebP in and remove the SVG.

**Verification:** cards read as belonging to the world, not floating overlays. Depth via correct scale + drop shadow tuned to the palette.

### Step 6 — Motion polish + reduce/lose the last cartoon bits

**Files:** `index.html` only.

- Instance the trees (currently 26 separate groups → one InstancedMesh per component). Frees enough budget to double tree count without cost.
- Add a subtle wind sway to the canopy (uniform-driven per-instance rotation).
- Fine-tune the CAM waypoints so each chapter is a distinct camera composition (currently a couple are too similar — the anatomy is explicit: "Six dolly-ins aimed at the same center are not six scenes").
- Pointer parallax down from `0.5, 0.28` → `0.28, 0.14` (currently too aggressive on mobile touch).
- Confirm reduced-motion path snaps camera to nearest chapter, halts ambient loops, keeps DOM order intact.

**Verification:** frame time under 16.7ms desktop / 25ms mobile per skill budget. `document.hidden` pauses the loop. `webglcontextlost` shows the fallback poster.

### Step 7 — Verification pass (per `references/quality-and-qa.md`)

- 1440×900, 768×1024, 390×844 — every chapter, every direction
- Slow scroll, fast flick, scrollbar drag, anchor URL at depth
- Reduced motion, WebGL disabled fallback
- Console clean, no failed requests, DPR sane, tab-hidden pause verified
- Screenshot every chapter at every viewport, send to you as a proof sheet

---

## 3. What I will *not* do

Being explicit, since the last round added things you didn't ask for and I want to avoid that:

- **Not** adding GSAP or Lenis. Kage doesn't use them; vanilla is honest.
- **Not** vendoring custom fonts unless you say so. System serif/sans stack is fine for a first-class result.
- **Not** generating real WebP art assets. That needs an image generator (GPT Image / Midjourney / Grok Imagine) with a signed-in account. I'll ship SVG stand-ins with clear TODOs.
- **Not** touching `BUILD_WITH_PRO_SKILLS.md` — that router MD stands.
- **Not** rewriting the whole file. Everything above is targeted diff.
- **Not** pushing to `main`. Everything stays on `claude/ai-agent-skill-selector-d2letc` until you review.

---

## 4. Performance budget (from the skill)

I'll hold these targets and profile before claiming done:

| Budget | Mobile target | Desktop target |
|---|---:|---:|
| DPR cap | 1.35 | 1.75 |
| Visible triangles | 150k–300k | 500k–1.2m |
| Draw calls | 50–90 | 90–160 |
| Steady frame time | ≤25ms | ≤16.7ms |
| Total transfer | ≤6MB | ≤10MB |

Current build: ~40 draw calls, well under the ceiling. Adding bloom + foreground + silhouette layers will bump it toward ~80–110 desktop draw calls, still comfortable.

---

## 5. Time & sequencing

I'll commit after each step and screenshot before/after so you can redirect early. Rough shape of the sequence:

1. **Step 1 (palette + lighting + fog)** — largest visual delta, do first
2. **Step 2 (foreground cutouts)** — largest "feels like Kage" delta
3. **Step 3 (silhouette layers)** — depth
4. **Step 4 (bloom + tone map)** — polish
5. **Step 5 (editorial cards)** — content richness
6. **Step 6 (motion polish + instancing)** — perf + finish
7. **Step 7 (verification pass)** — proof

If you want a subset, tell me which steps to skip. If you want to invert priority (e.g., "cards first because I have art"), tell me that too.

---

## 6. Decision request

Please answer three things and I'll start:

1. **Option A, B, or C** from Section 1?
2. **Run all 7 steps** or only some (name which)?
3. **Anything to change in the CAM waypoints** — specifically, do you want each chapter to be a very different composition (recommended, per the anatomy), or preserve the current path?

Say the word and I begin at Step 1.
