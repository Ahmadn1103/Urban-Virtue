# Urban Virtue — Project Documentation

**Urban Virtue** is a bespoke haute parfumerie e-commerce platform and interactive fragrance design atelier based in Washington, DC. Built with Next.js (App Router), React 19, Three.js, and custom luxury styling, the experience allows patrons to formulate, visualize, and personalize signature extrait de parfum flacons in real time.

---

## 1. Project Overview

- **Brand Identity**: Haute Parfumerie & Custom Formulation Atelier (Washington, DC).
- **Core Value Proposition**: Redefining niche luxury perfumery by bridging Middle Eastern oud traditions with French perfumery elegance. Patrons select custom aromatic notes across three tiers (Top, Heart, Base) and watch a real-time 3D glass flacon fill, uncap, blend, and seal.
- **Design Aesthetic**: Warm Cashmere, Alabaster, and Gilded Bronze design system featuring glassmorphism, gold foil accents, and ambient glow. The flacon label uses the navy-and-gold Urban Virtue emblem (`public/logo.jpeg`).
- **Site Map**:

  | Route | What it is | Rendering |
  | --- | --- | --- |
  | `/` and `/custom-studio` | The 3D blend studio (same page at both addresses) | Static |
  | `/shop` | The 3D studio on top, then the collection browser | Static |
  | `/shop/[slug]` | Product page for each of the 41 ready-made fragrances | Static (pre-built) |
  | `/about` | The house story: architecture, cabinet, editions, craftsmanship, DC atelier | Static |
  | `/bag` | The Atelier Bag | Dynamic (reads the bag cookie) |
  | `/api/bag` | Bag API | Route handlers |

---

## 2. Tech Stack & Dependencies

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **3D Graphics Engine**: [Three.js](https://threejs.org/) (`^0.186.1`) for real-time WebGL rendering of the perfume flacon, liquid tiers, cap and label.
- **Typography**: Google Fonts via `next/font` — *Playfair Display* (editorial serif headings) and *Manrope* (sans-serif labels and body). The same fonts are read from CSS variables to print the 3D label.
- **Sound Design**: Native Web Audio API procedural synthesis for acoustic feedback (liquid droplets, glass clinks, clicks, harmonic resonance).
- **Backend**: Next.js Route Handlers (`app/api/bag`) for the Atelier Bag. No database: each patron's bag is kept in an httpOnly cookie and re-priced from the shared catalog on every read.
- **Product Data**: `assests/products.csv` (41 ready-made fragrances), read at build time by `lib/products.ts`. Product photos are served from `public/images` through `next/image`, which resizes the 2880 px originals per screen.
- **Styling**: Vanilla CSS3 design system using CSS Custom Properties: `app/hero.css` (tokens, header, footer, studio, skeletons, scrollbar), `app/shop/shop.css`, `app/bag/bag.css` and `app/about/about.css`, plus Tailwind CSS v4 (`app/globals.css`).
- **Testing & Verification**: Playwright MCP automated visual and interactive testing.

---

## 3. Architecture & Codebase Map

```
urban_virtue/
├── app/
│   ├── api/
│   │   └── bag/
│   │       ├── route.ts          # GET bag · POST add a blend · DELETE empty the bag
│   │       └── [itemId]/route.ts # PATCH quantity · DELETE remove one item
│   ├── about/
│   │   ├── page.tsx             # About page (house story, no 3D)
│   │   └── about.css            # About intro styles
│   ├── bag/
│   │   ├── page.tsx             # Atelier Bag page (server-rendered from the bag cookie)
│   │   ├── loading.tsx          # Bag skeleton shown instantly while the server responds
│   │   └── bag.css              # Bag page styles (builds on hero.css tokens)
│   ├── custom-studio/
│   │   └── page.tsx             # The 3D studio at /custom-studio
│   ├── shop/
│   │   ├── layout.tsx           # Shop header + footer (no cookies, so every shop page is static)
│   │   ├── page.tsx             # 3D studio on top, then the collection browser
│   │   ├── loading.tsx          # Collection skeleton
│   │   ├── shop.css             # Collection, cards, product page, spinner styles
│   │   └── [slug]/
│   │       ├── page.tsx         # Product page (pre-built for all 41 products)
│   │       └── loading.tsx      # Product page skeleton
│   ├── favicon.ico
│   ├── globals.css              # Global styles and Tailwind v4 setup
│   ├── hero.css                 # Design system: tokens, header, footer, studio, skeletons, scrollbar
│   ├── layout.tsx               # Root layout, Google Fonts integration, metadata
│   └── page.tsx                 # Home: the 3D studio (static)
├── components/
│   ├── SiteHeader.tsx           # Shared header: Shop · Custom Studio · About, bag button
│   ├── SiteFooter.tsx           # Shared footer (client component: the newsletter form)
│   ├── BagBadge.tsx             # Bag count shared by every page's header
│   ├── PendingBar.tsx           # Top-of-window progress bar while a link's page loads
│   ├── bag/
│   │   ├── BagView.tsx          # Bag page UI: items, quantity, remove, summary
│   │   └── BagFlacon.tsx        # Bag item bottle: still image, skeleton, or no-WebGL stand-in
│   ├── hero/
│   │   ├── CustomBlend.tsx      # The studio (markup, consoles, organ, skeletons); "home" or "shop" variant
│   │   ├── blend.js             # Studio state machine and events; startCustomBlend() returns stop()
│   │   └── flacon3d.js          # Three.js flacon renderer: glass, liquid, cap, label, size carousel
│   ├── house/
│   │   ├── HouseSections.tsx    # About page sections (server-rendered)
│   │   └── ArchitectureSection.tsx # Top / heart / base tabs (the only About JavaScript)
│   └── shop/
│       ├── ShopBrowser.tsx      # Collection: filters, search, sort, URL sync
│       ├── shopQuery.ts         # Shop URL query parsing and sort options
│       ├── ProductCard.tsx      # Product tile (image, byline, notes preview, price)
│       ├── CustomBlendCard.tsx  # First tile: opens /custom-studio
│       ├── CardPending.tsx      # Spinner over a card while its page opens
│       ├── ProductPurchase.tsx  # Size picker + Add to Bag (no sizes yet)
│       └── StudioFlacon.tsx     # Still image of a sample sealed flacon
├── lib/
│   ├── catalog.ts               # Notes, sizes, prices and formula helpers shared by client and server
│   ├── products.ts              # Reads assests/products.csv into typed products and categories
│   ├── bag.ts                   # Server-side bag store: cookie encoding, validation, pricing
│   └── flaconStills.ts          # Renders and caches still images of the 3D flacon (bag, shop card)
├── assests/
│   ├── products.csv             # Product catalog (name, categories, price range, notes, image file)
│   └── images/                  # Originals of the product photos (git-ignored; copies live in public/images)
├── public/
│   ├── hero/                    # Note thumbnails and the still flacon used as the no-WebGL fallback
│   ├── images/                  # High-resolution botanical extracts and permanent editions
│   └── logo.jpeg                # Atelier seal & logo (printed on the 3D label)
├── tools/
│   └── bottle-render/           # Blender Python scripts for offline pre-rendered asset generation
├── vercel.json                  # Vercel deploy settings: install flag, asset caching, security headers
├── package.json                 # Project dependencies and npm scripts
├── project.md                   # Complete architectural and project documentation
└── README.md                    # Quickstart guide
```

---

## 4. Key Systems & Modules

### 4.1. Three.js 3D Flacon (`components/hero/flacon3d.js`)
- **Modelled on the boutique flacon**: rectangular glass body with a thick glass base, short glass neck, gold crimp collar, gold sprayer with nozzle, dip tube, and a tall gold cap. Built from `RoundedBoxGeometry`, cylinders and a lathed cap; lit by a `RoomEnvironment` reflection map.
- **Three Flacon Sizes**: 30 ml, 50 ml and 100 ml, each with its own real-world proportions (in cm) defined in `FLACONS`. The camera eases its framing per size, so larger flacons read larger while the 30 ml still fills the stage.
- **Half-Circle Size Carousel**: The three flacons ride a turntable behind the stage. On a size change the current flacon swings out along the arc and around the back while the next swings in from the opposite side, turning and scaling with depth (`SWAP_TIME` = 1.15 s). Larger sizes enter from the right, smaller from the left.
- **Glass Shading**: Edge-weighted glass via a small `onBeforeCompile` patch: nearly clear face-on, softly denser at grazing angles, with specular highlights kept bright regardless of opacity. Edges are tuned to stay soft rather than outlined.
- **Liquid Tiers**: Up to three stacked tiers, one per poured note, each filling a third of the cavity. Tiers rise, drain and colour-blend smoothly; after **Harmonize** all tiers ease to the mixed colour.
- **Cap & Pour**: The cap lifts aside and bobs while notes are being poured, a liquid stream falls into the neck on each pour, and the cap reseats when the blend is sealed or reset.
- **Printed Emblem Label**: A canvas texture with the Urban Virtue emblem medallion over a navy plate with gold border, showing the blend name (or the patron's inscription), the chosen notes (wrapping to two lines when long), `EXTRAIT DE PARFUM` and the volume. Rendered unlit and outside tone mapping so the text stays crisp and high-contrast over any liquid colour.
- **Soft Contact Shadow**: A radial shadow under the base plus a colour-tinted glow from the liquid. Their textures leave a transparent margin and skip mipmaps, so the shadow never ends on a hard line at low camera angles.
- **Interaction**: Gentle idle sway, pointer-follow tilt on desktop, drag-to-spin with inertia that springs back to the front, a shake when mixing, and a light sweep across the glass once sealed.
- **Camera Headroom**: The camera frames each size with room above the floating cap (`viewH = frameH / 0.86`, aimed at `0.45 × frameH`), so the cap never touches the top edge during a pour, even with bob and pointer tilt on the 100 ml flacon.
- **API** (driven by `blend.js`): `setSize`, `setLiquid`, `setBlended`, `setCapOpen`, `setLabel`, `pour`, `shake`, `ping`, `shine`, `pointer` / `pointerLeave`, `neckPoint` (screen position of the neck, used by the droplet flight) and `reset()` (empties the liquid and reseats the cap instantly).
- **Still Mode** (used by `lib/flaconStills.ts`): `createFlacon3D({ ..., still: true })` starts no render loop and renders at 2× pixel ratio. `settle()` jumps every animation (carousel, fill, cap, colours) to its resting state, `labelsReady` resolves once the label's fonts and emblem have loaded, and `snapshot()` renders once and returns a WebP data URL. `dispose()` stops rendering and frees the WebGL context.
- **First Frame Signal**: After its first rendered frame the canvas gets the `is-drawn` class, which fades out the studio's bottle skeleton.
- **Fallback**: If WebGL is unavailable, `blend.js` adds `.no-webgl` to the bottle and a still flacon image is shown instead.
- **Lazy Loading**: `blend.js` imports this module (and with it three.js) dynamically and builds the scene in an idle callback, so the page and the studio controls are usable before the 3D arrives.

### 4.2. Formulation Engine & State Machine (`components/hero/blend.js`)
- **Noble Essences Registry** (defined in `lib/catalog.ts` and imported here): 9 ethically sourced botanical notes categorized into three olfactory tiers:
  - **Top**: *Calabrian Bergamot* (Citrus), *Highland Lavender* (Aromatic), *Atlantic Sea Salt* (Fresh).
  - **Heart**: *Taifi Rose* (Floral), *Gilded Amber* (Oriental), *Haitian Vetiver* (Earthy).
  - **Base**: *Cambodian Oud* (Woody), *Bourbon Vanilla* (Gourmand), *Sudanese Sandalwood* (Woody).
- **Parabolic Droplet Animation**: Droplet arcs fly from the Fragrance Organ tile into the 3D flacon's neck.
- **Olfactory Accord Spectrum**: Real-time Floral, Woody, Fresh, Gourmand and Oriental percentages. All read 0% until a note is picked.
- **Botanical Raw Ingredients Aura**: Floating botanical medallions in soft focus behind the flacon's shoulders when notes are active, with a colour-matched ambient back-glow that clears on reset.
- **Surprise Me & Reset**: Procedural signature blend (`✦ Surprise Me`) and a full studio reset (`✦ Reset`) that cancels in-flight droplets, clears slots, accords and inscription, and empties the flacon.
- **Add to Bag**: Posts the sealed blend (note ids, size, inscription) to `/api/bag`, updates the header badge with the bag's total quantity, and turns the button into `✓ Added · View Your Bag`. Errors show under the button. Changing the size or inscription, or adjusting or resetting the formula, lets the blend be added again. After a successful add it pre-renders that bottle's still image in the background, so the bag page opens with it ready.
- **Viewport Measurement**: Measures the announcement bar and header height into the `--chrome-h` CSS variable (on load and resize) so the desktop studio is sized to exactly one screen.
- **Start & Stop**: `startCustomBlend()` returns `stop()`, which removes its window/document listeners, ends its animation loops, clears timers and disposes the WebGL flacon. `CustomBlend` calls it on unmount, and starting again stops any previous run, so the studio survives client-side navigation, Back/Forward and React StrictMode.
- **Bag Badge Event**: After a successful add it dispatches `uv:bag-count` with the new total, which every header badge listens to.

### 4.3. Atelier Interface & Consoles (`components/hero/CustomBlend.tsx`)
- **Variants**: `<CustomBlend />` (home and `/custom-studio`: header, studio, footer) and `<CustomBlend variant="shop" />` (top of `/shop`: just the studio, under the shop layout). The studio section's anchor is `#custom-studio`.
- **Header** (`components/SiteHeader.tsx`, shared by every page): the logo opens `/shop`; navigation is `Shop`, `Custom Studio` and `About`; the bag button shows the shared count (`BagBadge`). The page `<h1>` is visually hidden (`.sr-only`) for accessibility and SEO.
- **Left Formulation Console**:
  - Formulation steps (`1 Pick`, `2 Blend`, `3 Seal`).
  - Tier counter (`0 / 3`) with the **✦ Reset** button.
  - Three formula slot cards (`1/3 · Top`, `2/3 · Heart`, `3/3 · Base · Optional`) with colour-coded bars and removal actions.
  - Status narrative giving real-time perfumer guidance.
  - Live scent accord spectrum.
  - Price with volume pills (30 ml, 50 ml, 100 ml).
  - Flacon inscription input, updating the 3D label as you type.
  - Primary action (`✦ Harmonize My Blend`), then after sealing: signature formula card, `Add to Bag`, `Adjust Formula` and `New Formulation`. The console stays visible after blending so patrons can keep creating.
- **Center Stage**: The 3D flacon with its soft contact shadow, the floating botanical aura and an ambient radial glow. The canvas spans the full centre column and fades out at its left, right and bottom edges, so nothing (including flacons leaving the size carousel) is ever clipped with a hard line.
- **Right Fragrance Organ Console**: 3×3 grid of the 9 noble essences with tier badges and harvest origins, topped with `✦ Surprise Me`. All tiles are identical in size (equal rows, names reserve two lines) and origins show in full without truncation.
- **Editorial sections** moved to the About page (section 4.10), so the 3D studio is the only thing on the studio pages.

### 4.4. Atelier Bag Backend (`lib/bag.ts`, `app/api/bag`)
- **Storage**: The bag is a base64url JSON list in the `uv_bag` cookie (httpOnly, SameSite=Lax, Secure in production, 30 days). Only the patron's choices are stored (`id`, `notes`, `size`, `inscription`, `qty`), never names or prices.
- **Pricing & Validation**: Every read re-validates each item against `lib/catalog.ts` and works out names, formula numbers and prices on the server, so an edited cookie or request can't change what a blend costs. Unknown notes or sizes are dropped, and inscriptions are cleaned and capped at 24 characters.
- **Rules**: 2–3 distinct notes per blend, up to 12 different formulas and a quantity of 1–10 each. Adding the same notes, size and inscription again raises its quantity instead of adding a new line.
- **Endpoints**:

  | Method & path | Body | Result |
  | --- | --- | --- |
  | `GET /api/bag` | | The bag |
  | `POST /api/bag` | `{ notes, size, inscription? }` | `201` with the bag and the new `itemId`; `400` invalid; `409` bag full |
  | `DELETE /api/bag` | | Empty bag |
  | `PATCH /api/bag/:itemId` | `{ qty }` | The bag; `400` bad quantity; `404` unknown item |
  | `DELETE /api/bag/:itemId` | | The bag; `404` unknown item |

  A bag response is `{ items, count, subtotal, subtotalLabel }`. Each item carries its `name`, `formulaNo`, `notes`, `size`, `inscription`, `qty`, unit and line prices, and formatted price labels.
- **Reading in pages**: The bag page's server component calls `getBag()` for its first render. Only route handlers write the cookie.
- **Count Cookie**: Every write also sets `uv_bag_count` (not httpOnly, holds only the total quantity), and `GET /api/bag` refreshes it. Static pages read it in the browser to show the header badge without a server render.

### 4.5. Atelier Bag Page (`app/bag`, `components/bag`)
- **Contents**: Each formula shows its bottle, formula number, name, flacon size and volume, note chips (thumbnail, tier, family), inscription, quantity buttons, `Remove` and the line price. A sticky summary lists each line with the subtotal. Checkout is a disabled `Checkout · Coming Soon` button until payments are added. An empty bag links back to the studio.
- **Bottles** (`lib/flaconStills.ts`): One offscreen still-mode flacon renders every bag bottle in turn (sealed, blended, in its size, with its own label) and snapshots each one as an image. The glass shaders compile once instead of once per item. Images are cached in memory and in `sessionStorage` (keys `uv_still:*`), and the studio pre-renders on `Add to Bag`. Bump `VERSION` in `flaconStills.ts` whenever the flacon's look or framing changes, so cached images are redrawn.
- **Loading & Fallback**: A bottle-shaped shimmer skeleton shows until an image is ready, then the image fades in. Without WebGL, a simple drawing with one band per note is shown instead.

### 4.6. Loading Skeletons (`app/hero.css`)
- The studio's slots, size pills, action button and note organ are filled in by `blend.js` after the page loads. Each container is followed by a static skeleton (`.skel-after`) that CSS hides as soon as the real container has content (`:not(:empty) + .skel-after`), so React never has to touch markup that `blend.js` owns.
- The bottle skeleton (`.flacon-skeleton`) fades out once the 3D canvas has the `is-drawn` class, or when the `.no-webgl` fallback is active. The bag page uses the same silhouette.
- Shimmer animations stop under `prefers-reduced-motion`.

### 4.7. Desktop One-Screen Layout (`app/hero.css`)
- Above 1100 px wide, the studio fills exactly one screen below the header: `.hero` height is `100vh − var(--chrome-h)` with no scrolling inside the consoles.
- The desktop overrides live in the **`DESKTOP ONE-SCREEN STUDIO`** block at the **end** of `hero.css`. They must stay after the base hero rules: earlier in the file, the base rules (same specificity) silently override them.
- To keep everything above the fold, secondary content is trimmed on desktop: the accord footer, price caption, inscription hint and the long formula sentence on the sealed-blend card are removed or hidden, and note mood lines are hidden in the organ.

### 4.8. Shop (`app/shop`, `components/shop`, `lib/products.ts`)
- **Catalog**: `lib/products.ts` parses `assests/products.csv` (quoted fields, commas inside notes). Each row's image filename, minus its `NN_` order prefix, becomes the URL slug. Names are title-cased, `(IMPORTED)` becomes a badge, `By …` becomes the house, emoji are stripped from categories, and the description is split into intro, Top / Heart / Base notes (Middle is treated as Heart) or, for single notes, a scent profile and mood. Trailing photo credits are removed from the notes.
- **Collection**: Category chips with counts, search (each word must start a word, so "oud" finds Black Oud but not Ahoud), and sort by featured, price or name. Filters live in the URL (`/shop?category=body-musk&q=rose&sort=price-asc`); the page is static, so they are applied on the client, and the unfiltered grid is the prerendered fallback.
- **Custom Blend Card**: The first tile opens `/custom-studio` and shows a still of a sample sealed flacon.
- **Routes**: All 41 product pages are pre-built from `generateStaticParams`, and `dynamicParams = false` makes any other slug a 404, so the CSV is never read at request time.
- **Product Page**: Image, house byline, collections, price range, a size picker (`Select an option`, currently `No options yet`) with a disabled `Add to Bag`, the description, the olfactory pyramid or scent profile, links to the studio and the collection, and four related products. On desktop it fits one screen. Related products share the most collections.
- **Sizes & Pricing**: `products.csv` only has price ranges, so ready-made products can't be added to the bag yet. `ProductPurchase` takes an `options` list; once real sizes and prices exist they can be added to the CSV, and the bag API will need to accept products as well as custom blends.
- **Categories**: Fall Collection, Gourmand / Oriental & Amber, Earthy & Woody, Body Musk, The Liquid Grail, Floral & Citrus, Aqua and Single Notes. *Single Notes* are 14 imported oils of one ingredient each (Cedarwood, French Jasmine, Taifi Rose, Leather, Coffee…), $30–$50, as opposed to the blended parfums. Chip labels drop the trailing "Parfum" from the CSV names.
- **Data notes**: Egyptian Vanilla, Rose Water, Orange Blossoms and Come Closer use the same photo in the source data.

### 4.9. Navigation & Speed
- **Static pages**: Everything except `/bag` is pre-built HTML. The shop layout reads no cookies, so all 41 product pages are static too.
- **Client-side links**: Every internal link is a `next/link`, so pages are prefetched and open without a reload. Links that `blend.js` renders as plain `<a>` (such as `View Your Bag`) are routed client-side by `CustomBlend`.
- **Feedback**: `PendingBar` (inside each link) sets `<html data-navigating>` while a page loads, which shows a progress bar along the top of the window; product cards also show a spinner (`CardPending`, via `useLinkStatus`). Both are skipped when a page was prefetched and opens instantly.
- **Skeletons**: The studio (section 4.6), the collection (`app/shop/loading.tsx`), product pages (`app/shop/[slug]/loading.tsx`) and the bag (`app/bag/loading.tsx`).
- **Studio loading order**: page HTML and skeletons → studio controls (`blend.js`, ~11 KB) → 3D flacon (three.js, downloaded in parallel and built when the browser is idle). Notes picked before the bottle exists are kept; when it arrives it catches up with the current picks, size, label and blend state.
- **Images**: Product photos go through `next/image` at card size. The product page first paints the card-sized file the browser already has, then the sharp version covers it.
- **Bag badge**: `BagBadge` keeps one count for the tab, so it never resets when moving between pages. It changes only on the `uv:bag-count` event, sent by the studio on add and by the bag page on quantity or remove.
- **Measured** (production build, local, headless Chrome):

  | | Time |
  | --- | --- |
  | First response | 10–60 ms |
  | First paint | 0.15–0.5 s |
  | Studio controls ready (cold load) | 0.17–0.6 s |
  | Click to shop, product, related product or About | 70–190 ms |
  | Click to a studio page (skeleton shows at once) | ~360 ms until the organ is filled |
  | Click to the bag (server-rendered, skeleton first) | ~400 ms |
  | Back / Forward | 60–310 ms |

  After a long run of navigation the studio pages hold exactly one WebGL canvas (no leaked contexts).

### 4.10. About Page (`app/about`, `components/house`)
- Intro with chapter links, then *The Olfactory Architecture* (top / heart / base tabs), *The Botanical Cabinet*, *The Urban Virtue Editions*, *Craftsmanship* and *Visit the DC Atelier*, then the footer. No 3D studio.
- Only `ArchitectureSection` (the tabs) is a client component; the rest is server-rendered, so the page ships almost no JavaScript.

### 4.11. Footer & Scrollbar
- `components/SiteFooter.tsx` appears on the studio pages, the shop, product pages and About. Its collection links open the matching shop filter (`/shop?category=…`).
- The scrollbar is styled site-wide in `hero.css`: a slim gold-gradient thumb with a soft highlight, floating over the page (transparent track, no arrow buttons), deepening to bronze on hover and press. `scrollbar-gutter: stable` keeps its space reserved, so pages don't shift sideways between ones that scroll and ones that don't. Firefox uses the standard `scrollbar-width` / `scrollbar-color`. The mobile collection chip row hides its own scrollbar.

---

## 5. Recent Changelog & Key Enhancements

1. **Real-Time 3D Flacon**:
   - Replaced the stacked 2D image bottle with a Three.js flacon modelled on the boutique bottle, in 30 / 50 / 100 ml.
   - Added the half-circle size carousel for switching volumes.
2. **Readable Emblem Label**:
   - Label redesigned as a navy plate with cream and gold lettering, large type, notes wrapping to two lines, and the batch line dropped for space.
   - Rendered unlit for full contrast; the camera zooms closer on small flacons so the 30 ml label stays legible.
3. **Interactive Reset System (`✦ Reset`)**:
   - Wired up the Reset button (it previously had no click handler).
   - Clears all slots, accords and inscription, cancels in-flight droplets, empties the flacon and reseats the cap, and clears the leftover stage glow tint.
4. **Sealed-Blend Console Fix**:
   - Removed a leftover line that hid the entire left console once a blend was sealed. Result card, `Add to Bag`, `Adjust Formula` and `New Formulation` now stay visible.
5. **Above-The-Fold Viewport Fit**:
   - Moved the desktop overrides to the end of `hero.css` (they were being overridden by later base rules).
   - Sized the hero from the measured header height (`--chrome-h`) instead of a hard-coded 56 px.
   - Removed non-essential console content so every state (empty, picking, sealed) fits without scrolling at 1366×768, 1536×690 and 1920×960.
6. **Seamless Stage Edges & Shadow**:
   - Canvas widened to the full centre column with soft edge fades.
   - Contact shadow textures rebuilt with a transparent margin and no mipmaps to remove the hard cut-off line.
   - Glass edge darkening softened; the CSS pedestal ellipse (which never aligned with the 3D bottle) was removed.
7. **Fragrance Organ Refresh**:
   - Larger tiles, images and type, with more spacing.
   - All tiles are equal in size, and origins show in full instead of being cut off with "…".
8. **Bug Fixes**:
   - Accord spectrum now reads 0% (not 20%) before any note is picked.
   - Fixed slot rendering that skipped the middle slot and left stale notes (live `HTMLCollection` iteration).
   - Removed a stray `}` in `blend.js` that broke the page build.
9. **Atelier Refinements**:
   - Removed the hero heading, the promo announcement banner and the header audio toggle for a cleaner luxury feel.
   - Renamed "Master Accord" to `✦ Surprise Me`.
10. **Atelier Bag Backend & Page**:
    - `Add to Bag` previously only set the badge to "1" and saved nothing, and the bag icon linked back to the studio. Blends are now saved server-side through `/api/bag` and listed on the new `/bag` page with quantity, remove and subtotal.
    - Moved the note and size catalog out of `blend.js` into `lib/catalog.ts` so the server can validate and price blends.
    - Extracted the header into `components/SiteHeader.tsx`; the bag badge now shows the real item count on every page load.
11. **Bag Bottles & Loading Performance**:
    - Bag items show the studio's 3D flacon as still images rendered by a single shared renderer and cached for the session, instead of one live WebGL renderer per item.
    - Added loading skeletons to the studio and the bag page.
12. **Floating Cap Clipping Fix**:
    - Added camera headroom so the floating cap of the 100 ml flacon is no longer cut off under the header during a pour (checked at 1920×1080, 1440×900, 1366×768 and 1280×720).
13. **Shop & Product Pages**:
    - New `/shop` built from `assests/products.csv`: collection filters, search, sort, product pages with olfactory pyramids, and related products.
    - The 3D studio opens the shop page; a Custom Blend tile leads the collection.
    - Product pages have a size picker and Add to Bag, waiting on real sizes and prices.
14. **Site Structure**:
    - The home page's editorial sections moved to a new `/about` page; the studio pages now contain only the studio.
    - The studio got its own address, `/custom-studio` (the `#mix` anchor became `#custom-studio`).
    - Header simplified to `Shop · Custom Studio · About`; the logo opens the shop. Shared footer added to every page except the bag.
15. **Speed & Seamless Navigation**:
    - All pages except the bag are static; all links are client-side and prefetched.
    - `blend.js` became restartable (`stop()`), and it and three.js load lazily behind the skeletons.
    - Progress bar and card spinners for any page that still has to load; skeletons for the shop, product and bag pages.
    - The bag count persists across pages.
16. **Fixes**:
    - `/shop` returned a 500 error after the footer (with its form handler) was added to the server-rendered shop layout; the footer is now a client component.
    - Removed photo credits from product pages, and the broken chevron from the old About dropdown.
17. **Polish**:
    - Product pages fit one screen on desktop, with the size picker and Add to Bag above the fold.
    - Brand scrollbar refined (floating gold thumb, stable gutter).
    - About page hydrates only its tabs; the 3D scene builds in an idle callback so early clicks on the organ stay instant.
18. **Deployment Setup**:
    - Added `vercel.json` (install with `--legacy-peer-deps`, photo caching, security headers).
    - Unknown product slugs now 404 at the edge (`dynamicParams = false`).
    - `.gitignore` now skips the duplicate photo originals (`assests/images`, `assests/images.zip`) and browser-test output.

---

## 6. Development & Deployment

### Local Development
```bash
# Install dependencies
# (--legacy-peer-deps is currently needed: eslint-config-next is pinned to 14.x,
#  which declares a peer dependency on eslint 8 while the project uses eslint 9)
npm install --legacy-peer-deps

# Run development server (Turbopack)
npm run dev

# Run ESLint validation
# (currently fails: eslint.config.mjs imports "eslint-config-next/core-web-vitals",
#  which the pinned 14.x package doesn't export; type-check with npx tsc --noEmit meanwhile)
npm run lint

# Build production bundle
npm run build
```

### Deploying to Vercel
- Push the repo and import it in Vercel; `vercel.json` supplies the rest:
  - `installCommand: npm install --legacy-peer-deps`, needed because `eslint-config-next` is pinned to 14.x (peer dependency on eslint 8) while the project uses eslint 9. Without it the install fails with `ERESOLVE`.
  - `buildCommand: npm run build` (`next build`; Next 16 doesn't run ESLint during the build, so the broken lint config doesn't block deploys).
  - `Cache-Control: public, max-age=604800, stale-while-revalidate=86400` for `/images/*` and `/hero/*`: these filenames aren't content-hashed, so they're cached for a week rather than marked immutable. Rename a file when its image changes.
  - `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: SAMEORIGIN` and a `Permissions-Policy` that turns off camera, microphone and geolocation on every route.
- No environment variables or database are required. The bag lives in cookies, which are `Secure` in production (HTTPS only, as Vercel serves).
- Product photos are resized by Vercel's image optimization (`next/image`), which counts toward the project's image-optimization usage.
- `assests/products.csv` must be committed: the build reads it to generate the shop.

### Environment Notes
- Runs on Next.js 16 App Router on `http://localhost:3000`.
- Supports WebGL-enabled modern desktop and mobile browsers, with a still-image fallback for devices without WebGL.
- To reset a test bag, clear the `uv_bag` cookie or call `DELETE /api/bag`. Bag bottle images are cached in `sessionStorage` and clear when the tab closes.
- Page loads under `npm run dev` are noticeably slower than a production build, because routes and the Three.js bundle are compiled on demand.
- After large changes to `flacon3d.js` or `blend.js`, do a hard refresh (Ctrl+Shift+R). Hot reload may keep the old studio code running in an open tab.
- To check real speed, use a production build (`npm run build && npm start`): the dev server compiles pages on first visit and doesn't prefetch links.
- `next build` can run while `next dev` is running (dev output lives in `.next/dev`). Restart any running `next start` after a rebuild: an old server keeps the previous build's manifests and serves broken pages.
- The build warns that `metadataBase` isn't set. Add it to `app/layout.tsx` once the live domain is known, so social preview images resolve to absolute URLs.
