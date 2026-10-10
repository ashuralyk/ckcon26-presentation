# Cinnabar talk

A click-through presenter for a ten-minute talk on CKB / Nervos, built with [Remotion](https://www.remotion.dev) and React. The talk is 17 pages. Each page plays once when you advance, then holds on its last frame. Nothing moves on hover.

## Controls

- Click, Right arrow, Space, or mouse wheel down: next step or page. The animation plays, then holds.
- Left arrow, Backspace, or mouse wheel up: previous step, already settled, with no replay.
- F, or the Full screen button: enter or leave full screen.

One wheel gesture moves one step. A trackpad's inertial tail is ignored, and a new gesture needs a short pause (about a quarter of a second). Horizontal scrolls and pinch-zoom are not treated as navigation.

Once a step has finished playing and the talk is waiting for you, a faint red dot fades in under the page number. It disappears the moment you navigate, and it is not shown on the last step of the last page. It lives in the presenter chrome, outside the Remotion composition.

## Run locally

```bash
npm install
npm run present      # presenter at http://127.0.0.1:4173
npm run dev          # Remotion Studio, to inspect the CinnabarTalk composition and each Beat01 to Beat17
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
