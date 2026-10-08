# Cinnabar talk

Click-through presenter for the ten-minute Cinnabar talk. Each beat plays once, then holds. Nothing moves on hover. The pointer never changes the picture.

## Present

```bash
cd ~/Freelancer/remotion
npm run present
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173).

Controls:

- Click, Right arrow, or Space: advance. The beat animates, then holds on the last frame.
- Left arrow or Backspace: previous beat, already settled, with no replay.
- F, or the Full screen button: enter or leave full screen.

There are no hover effects. No color change, scale, or cursor change on the button, and the video does not restart or scrub when the pointer moves. The only interaction is a click (or the keys above).

`npm run dev` opens Remotion Studio so you can inspect `CinnabarTalk` and `Beat01` through `Beat19`. Studio does not click through the talk. Use `npm run present` on the day.

---

# Remotion explainer scaffold

Code-driven motion graphics starter (corkboard + sticky notes) for YouTube-style explainers.

## Quick start

```bash
cd ~/Freelancer/remotion
npm run dev
```

Opens Remotion Studio. Pick the **Explainer** composition in the sidebar.

Render an MP4:

```bash
npx remotion render Explainer out/explainer.mp4
```

## Layout

| Path | Role |
| --- | --- |
| `src/Root.tsx` | Registers compositions (add more `<Composition />` here) |
| `src/scenes/StickyBoard.tsx` | Your first scene — edit copy, timing, layout |
| `src/components/StickyNote.tsx` | Reusable spring-in sticky note |
| `src/components/Corkboard.tsx` | Background / board texture |
| `src/compositions/Explainer.tsx` | Optional composition wrapper |

## How to extend

1. Duplicate a `<StickyNote />` in `StickyBoard.tsx` and change `title` / `body` / `delay`.
2. Wrap beats in `<Sequence from={frame}>` for chapter timing.
3. Add a new scene file under `src/scenes/`, then register another `<Composition />` in `Root.tsx`.
4. Optional Remotion agent skills: `npx skills add remotion-dev/skills`

Docs: https://www.remotion.dev/docs · Prompt pack: https://www.remotion.dev/prompts
