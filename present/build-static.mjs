// Builds the click-through presenter as a self-contained static site (no Node needed to run it).
//   node present/build-static.mjs   ->   dist-static/{index.html, main.js, README.md}
import esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist-static");
fs.rmSync(out, {recursive: true, force: true});
fs.mkdirSync(out, {recursive: true});

await esbuild.build({
  absWorkingDir: root,
  entryPoints: [path.join(root, "src/present/main.tsx")],
  bundle: true,
  minify: true,
  outfile: path.join(out, "main.js"),
  // A classic IIFE script (not an ES module) so it also opens straight from file://.
  format: "iife",
  platform: "browser",
  target: "es2020",
  jsx: "automatic",
  define: {"process.env.NODE_ENV": '"production"'},
  logLevel: "info",
});

// Fonts are embedded in index.html (base64), so there is nothing to fetch and no CDN is needed.
const b64 = (f) => fs.readFileSync(path.join(root, "present/fonts", f)).toString("base64");
const faces = `
      @font-face { font-family: "Playfair Display"; font-style: normal; font-weight: 400 900; src: url(data:font/woff;base64,${b64("Playfair.woff")}) format("woff"); }
      @font-face { font-family: "Playfair Display"; font-style: italic; font-weight: 400 900; src: url(data:font/woff;base64,${b64("PlayfairItalic.woff")}) format("woff"); }
      @font-face { font-family: "Comic Neue"; font-style: normal; font-weight: 400 900; src: url(data:font/ttf;base64,${b64("ComicNeue-Bold.ttf")}) format("truetype"); }
      @font-face { font-family: "Noto Serif SC"; font-style: normal; font-weight: 700; src: url(data:font/ttf;base64,${b64("NotoSerifSC-zhusha.ttf")}) format("truetype"); }`;

let html = fs.readFileSync(path.join(root, "src/present/index.html"), "utf8");
html = html.replace(/\s*<link rel="preconnect"[^>]*>/g, "").replace(/\s*<link\s+href="https:\/\/fonts\.googleapis[^>]*>/s, "");
html = html.replace("<head>", `<head>
    <link rel="icon" href="data:,">`);
html = html.replace("<style>", `<style>${faces}`);
html = html.replace('<script type="module" src="/main.js"></script>', '<script defer src="./main.js"></script>');
if (html.includes("googleapis") || html.includes('src="/main.js"')) throw new Error("html rewrite failed");
fs.writeFileSync(path.join(out, "index.html"), html);

fs.writeFileSync(
  path.join(out, "README.md"),
  `# Cinnabar talk (static build)

A click-through presenter. No Node, no network, no build step needed to run it.

## Run

Any static file server works. From this folder:

    python3 -m http.server 4173      # then open http://localhost:4173
    # or
    npx serve -l 4173 .

Opening index.html directly (file://) also works in Chrome, Edge, Safari and Firefox.

## Controls

- Click, Right arrow or Space: next step (the step plays once, then holds).
- Left arrow or Backspace: previous step, already settled.
- F or the Full screen button: full screen.
- Nothing reacts to hover.

## Notes

- All paths are relative, so the folder can be hosted in a sub-path or copied anywhere.
- Fonts (Playfair Display, Comic Neue, the two glyphs in Noto Serif SC) are embedded in index.html.
- Sticky-note handwriting uses "Marker Felt" when installed (macOS); on other systems it falls back to Chalkboard SE, Bradley Hand, then the bundled Comic Neue.
- Full screen needs a click or key press first (browser rule), and is not available when a page is embedded without permission.
`,
);
console.log("built", out);
