import esbuild from "esbuild";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outdir = path.join(root, "present", "dist");
const port = Number(process.env.PORT || 4173);

fs.mkdirSync(outdir, {recursive: true});

const ctx = await esbuild.context({
  absWorkingDir: root,
  entryPoints: [path.join(root, "src/present/main.tsx")],
  bundle: true,
  outfile: path.join(outdir, "main.js"),
  format: "esm",
  platform: "browser",
  target: "es2020",
  jsx: "automatic",
  sourcemap: true,
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  logLevel: "info",
});

await ctx.watch();

const html = fs.readFileSync(path.join(root, "src/present/index.html"));

const types = {
  ".js": "text/javascript; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".html": "text/html; charset=utf-8",
};

const server = http.createServer((req, res) => {
  const url = (req.url || "/").split("?")[0];
  if (url === "/" || url === "/index.html") {
    res.writeHead(200, {
      "content-type": types[".html"],
      "cache-control": "no-store",
    });
    res.end(html);
    return;
  }
  const file = path.join(outdir, path.basename(url));
  if (!file.startsWith(outdir) || !fs.existsSync(file)) {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  const ext = path.extname(file);
  res.writeHead(200, {
    "content-type": types[ext] || "application/octet-stream",
    "cache-control": "no-store",
  });
  res.end(fs.readFileSync(file));
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Cinnabar presenter: http://127.0.0.1:${port}`);
});
