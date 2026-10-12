# Cinnabar talk

A click-through presenter for a ten-minute talk on CKB / Nervos, built with [Remotion](https://www.remotion.dev) and React. The talk is 19 pages. Each page plays once when you advance, then holds on its last frame. Nothing moves on hover.

## Controls

- Click, Right arrow, Space, or mouse wheel down: next step or page. The animation plays, then holds.
- Left arrow, Backspace, or mouse wheel up: previous step, already settled, with no replay.
- F, or the Full screen button: enter or leave full screen.

One wheel gesture moves one step. A trackpad's inertial tail is ignored, and a new gesture needs a short pause (about a quarter of a second). Horizontal scrolls and pinch-zoom are not treated as navigation.

A small pennant flag sits in the bottom-right corner, just under the page number. While a step plays (step 0 of a page includes the camera glide) its pole and then its cloth fill with cinnabar red from the bottom up, in proportion to how far the player is through that step. When the step reaches its hold the flag is full and pulses with a red glow: the talk is ready for the next click. It resets to empty the moment you navigate, and it is hidden on the last step of the last page. It lives in the presenter chrome (`src/present/main.tsx`), outside the Remotion composition, takes no pointer events, and does not affect wheel, keyboard or full-screen use.

## Run locally

```bash
npm install
npm run present      # presenter at http://127.0.0.1:4173
npm run dev          # Remotion Studio, to inspect the CinnabarTalk composition and each Beat01 to Beat19
npm run lint         # eslint src && tsc
```

Studio does not click through the talk. Use `npm run present` for that.

## Static build and deploy

```bash
npm run build:static                                   # writes dist-static/
python3 -m http.server 4173 --directory dist-static    # preview
```

`dist-static/` is a self-contained site (`index.html`, `main.js`, fonts embedded, relative paths). It needs no Node at runtime and also opens from `file://`. It is not committed.

On Vercel, `vercel.json` runs `npm install`, then `node present/build-static.mjs`, and serves `dist-static`.

## Project layout

| Path | Role |
| --- | --- |
| `src/talk/Talk.tsx` | The scenes for every page |
| `src/talk/timing.ts` | Steps and frame timing per page |
| `src/talk/stage.ts` | Camera positions and headline copy |
| `src/talk/motion.ts` | Shared animation helpers |
| `src/present/` | Presenter entry (`@remotion/player`) and HTML |
| `present/serve.mjs` | Local presenter server |
| `present/build-static.mjs` | Static build script |
| `present/fonts/` | Subsetted fonts embedded in the static build |
