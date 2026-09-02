# Build a Website with `pro-skill`

> **You are an AI coding agent.** This file is your operating manual for building a
> website using the [`devinilabs/pro-skill`](https://github.com/devinilabs/pro-skill)
> collection. Do **not** guess what the user wants — follow the interview flow
> below, then pick only the skills that match their answers.

---

## 0. Setup (do this first, silently)

1. Clone the skill collection:
   ```bash
   git clone --depth 1 https://github.com/devinilabs/pro-skill.git .pro-skill
   ```
2. Skill files live under `.pro-skill/agent-skills/`. Each skill is a folder
   containing a `SKILL.md` (and usually `REFERENCES.md`). **Read a skill's
   `SKILL.md` before you use it** — never invent behavior for a skill.
3. **Ignore `agent-skills/game-development/` entirely.** This flow is for
   websites, not games. Do not read, mention, or use any skill from that folder.
4. The `agent-skills/codex/` folder is meta-tooling (skill authoring, capture,
   publishing). Only touch it if the user explicitly asks about creating or
   auditing skills — never for a normal website build.

The usable skill pools for a website build are:

- `agent-skills/web-design/` — visuals, motion, 3D, layout, styling
- `agent-skills/ui/` — UI prompting patterns
- `agent-skills/media/` — image sourcing

---

## 1. Interview the user (do NOT skip)

Ask these questions **one small group at a time**, wait for answers, and let
earlier answers narrow later questions. Do not dump the whole list at once. If
the user answers vaguely, offer 2–3 concrete options rather than re-asking.

### Round 1 — Purpose & scope

1. **What is this site for?** (portfolio, landing page, agency, SaaS product,
   editorial/blog, pricing page, event, personal brand, other)
2. **How many pages / sections?** (single landing page, 3–5 sections, multi-page)
3. **Who is the audience?** (recruiters, customers, investors, general public)
4. **Any brand assets to respect?** (logo, existing colors, fonts) — if none,
   you'll propose a palette in Round 3.

### Round 2 — Visual direction

5. **Mood:** clean & minimal, editorial/serif, brutalist/technical, glassy/dark,
   playful/funky, cinematic/immersive, corporate/enterprise?
6. **Light or dark mode** (or both)?
7. **Density:** airy whitespace, or information-dense (data, specs, numbers)?

### Round 3 — Motion & interactivity budget

8. **How much motion do you want?**
   - **None** — static, fast, accessible.
   - **Subtle** — reveals on scroll, hover states, marquee.
   - **Rich** — scroll-scrubbed sequences, timelines, pinned sections.
   - **Immersive** — 3D scenes, WebGL, shaders, physics.
9. **Performance ceiling:** is this expected to run on low-end mobile?
   (If yes, cap at "Subtle" and avoid the WebGL/3D pool.)

### Round 4 — Special ingredients (only ask what's relevant)

10. Any of these needed? (globe, 3D landscape/objects, particle background,
    shader cursor trail, physics playground, animated gradient background,
    weather/atmosphere scene, marquee of logos, pricing table)
11. Any content the user will supply now? (copy, images, links) — otherwise
    plan placeholders and note where the user must fill in.

**After the interview, echo back a short brief** ("Here's what I'll build: X,
in Y style, using Z skills") and get a yes before writing code.

---

## 2. Skill selection map

Pick the **smallest set** that satisfies the brief. Every added skill is more
JS, more surface area, and more places to break. If a plain CSS/HTML solution
covers it, don't add a skill.

Skill paths below are relative to `.pro-skill/agent-skills/`.

### Foundation (almost always used)

| Need | Skill |
|---|---|
| Utility CSS | `web-design/tailwindcss` |
| Base landing layout | `web-design/landing-page` |
| Pricing section | `web-design/pricing-page` |
| Company logo row | `web-design/company-logos` |
| UI prompting scaffolding | `ui/design-first-ui-prompting` |
| Placeholder imagery | `media/unsplash-asset-images` or `media/aura-asset-images` |

### Style / mood (pick **one** primary, optionally one accent)

| Mood the user picked | Primary skill |
|---|---|
| Clean minimal, light | `web-design/clean-minimal-beige-light-mode` |
| Blue clean modern | `web-design/blue-cloudy-clean-modern` |
| Blue laser glass | `web-design/blue-laser-clean-glass-layout` |
| Dark contrasting clean | `web-design/dark-blue-contrasting-clean` |
| Glass dark UI | `web-design/dark-glass-clean-layout` or `web-design/glass-dark-ui` |
| Bright green tech (WebGL) | `web-design/bright-green-tech-system-webgl` |
| Green dark modern | `web-design/tech-green-dark-mode-modern` |
| Funky purple tech | `web-design/funky-purple-container-tech` |
| Orange clean SaaS/paper | `web-design/orange-clean-paper-saas` |
| Solar duotone bold | `web-design/solar-duotone-bold` |
| Editorial / serif | `web-design/book-serif-index`, `web-design/editorial-portfolio-chapters`, `web-design/editorial-tech`, `web-design/editorial-service-booking` |
| Brutalist / documentary | `web-design/documentary-brutalist-agency` |
| Skeuomorphic | `web-design/skeuomorphic-ui`, `web-design/high-contrast-skeuomorphic-clean` |
| Paper / technical light | `web-design/light-mode-paper-technical` |
| Mesh gradient dark | `web-design/mesh-gradient-dark-blue-clean` |
| Framed tech border-gradient | `web-design/framed-tech-dark-border-gradient` |
| Enterprise / operational | `web-design/operational-enterprise-ai` |
| SaaS product-proof | `web-design/product-proof-saas` |
| Dither aesthetic | `web-design/dither-background`, `web-design/dither-laser-dark-mode` |
| Agency grid | `web-design/agency-grid-layout-minimal`, `web-design/nested-container-clean-agency` |

### Layout building blocks (add à la carte)

`framed-grid-layout`, `image-first-grid-layout`, `nested-container-frames`,
`container-lines`, `corner-diagonals`, `corner-lasers`, `split-layout-technical`,
`technical-wireframe-info-layout`, `number-details`.

### Motion budget → skills

- **None:** skip every skill in this section.
- **Subtle:** `animation-on-scroll`, `marquee-loop`, `reveal-hover-effect`,
  `staggered-word-reveal`, `masked-reveal`, `beam-glow-states`,
  `beautiful-shadows`, `css-alpha-masking`, `css-border-gradient`,
  `progressive-blur`, `liquid-metal-border`.
- **Rich:** add `gsap`, `gsap-scrolltrigger-storytelling`,
  `cinematic-gsap-lenis-motion-system`, `scroll-progress-timeline`,
  `scroll-scrubbed-visual-sequence`, `scroll-scrubbed-word-reveal`,
  `cinematic-scroll-storytelling`, `animation-systems`,
  `optimize-web-animations` (from `codex/`).
- **Immersive:** add from the **WebGL / 3D** pool below.

### WebGL / 3D / shader pool (only when user said "immersive")

`add-shader-cursor-trail`, `background-grid-webgl`, `cobejs`, `globe-gl`,
`globe-particles`, `matterjs`, `threejs`, `threejs-landscape`, `threejs-towers`,
`threejs-weather`, `unicorn-studio`, `vantajs`, `webgl-3d-object`,
`webgl-laser`, `webgl-landing-steering`, `shaders-cursor-ripples`,
`build-threejs-scroll-worlds`, `scroll-world-storytelling`,
`ambient-section-particles`, `atmosphere-background`, `pointer-trail-emitter`,
`thinking-orbs`, `gooey-blob-system`, `falling-leaves`.

Rules for this pool:
- Pick **at most one** hero WebGL element (globe **or** landscape **or**
  shader background — not all three).
- Add supporting effects (cursor trail, particles, blur) only if they fit the
  mood skill.
- If the user said "runs on low-end mobile", **do not use this pool at all.**

### Special-purpose

- Loading atmosphere → `atmosphere-background`, `thinking-orbs`.
- Marketing marquee of logos → `marquee-loop` + `company-logos`.
- Live clock / dashboard vibe → `glass-dark-mode-clock`.

### Quality bar (optional, but recommended for a portfolio)

Layer `build-awwwards-quality-sites` on top of the chosen mood skill — it's a
quality checklist, not a visual style.

---

## 3. Build order

1. Scaffold with `tailwindcss` + the chosen **mood** skill + `landing-page`.
2. Drop in **layout** blocks for each section the user asked for.
3. Add **motion** skills matching the budget.
4. Add the **one** hero WebGL/3D element last (it's the most likely to break
   the build and the easiest to remove if performance tanks).
5. Fill copy and images. Use a `media/` skill for placeholders; never invent
   client logos or testimonials.
6. Test on a real page load. If FPS drops or the page jank scrolls, drop the
   heaviest skill first (usually the WebGL one).

---

## 4. Rules the agent must obey

- **Read `SKILL.md` before using any skill.** Do not paste code from memory.
- **Never use `game-development/` skills.**
- **Never load a skill you didn't justify in the brief you echoed back.**
- **Cap the immersive pool at one hero element** unless the user overrides.
- If the user's answer conflicts with performance (e.g. "immersive" + "must
  run on 3G phones"), surface the tradeoff and let them pick — don't silently
  strip features.
- When multiple mood skills fit, pick one and say why. Do not stack two full
  mood systems.
- If a requested effect isn't in the collection, say so — don't fake it with
  a lookalike skill.

---

## 5. Worked example

> **User:** "Portfolio site, dark, feels premium, some WebGL, desktop-first."

**Agent's brief back:**
Portfolio landing (1 page, 5 sections) in a dark glassy mood with rich scroll
motion and one WebGL hero. Skills:
- `tailwindcss`, `landing-page` (foundation)
- `dark-glass-clean-layout` (mood)
- `nested-container-frames`, `container-lines` (layout)
- `gsap`, `scroll-progress-timeline`, `staggered-word-reveal`,
  `reveal-hover-effect`, `marquee-loop` (motion — rich budget)
- `webgl-3d-object` (single WebGL hero)
- `progressive-blur`, `beautiful-shadows` (polish)
- `unsplash-asset-images` (placeholder imagery)
- `build-awwwards-quality-sites` (quality checklist)

Explicitly **not used**: any `game-development/*`, other WebGL skills
(`globe-gl`, `threejs-landscape`, etc.), any light-mode mood skill.

---

## 6. When you're done

- List every skill you actually used, with a one-line reason each.
- List skills you considered and rejected, with the reason.
- Note anything the user still needs to supply (copy, logo, real images).
