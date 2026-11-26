// Składa aplikację do katalogu www: opakowuje index.html w pełny dokument i dokłada biblioteki.
import { build } from "esbuild";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

rmSync("www", { recursive: true, force: true });
mkdirSync("www/vendor", { recursive: true });
const libs = ["firebase-app-compat.js", "firebase-auth-compat.js", "firebase-firestore-compat.js"];
for (const f of libs) cpSync(`node_modules/firebase/${f}`, `www/vendor/${f}`);
cpSync("firebase-config.js", "www/firebase-config.js");
await build({ entryPoints: ["src/ai.js"], bundle: true, minify: true, format: "iife", target: "es2020", outfile: "www/vendor/ai.js" });

const scripts = [...libs.map((f) => `vendor/${f}`), "firebase-config.js", "vendor/ai.js"].map((s) => `<script src="${s}"></script>`).join("");
const head =
  '<!doctype html><html lang="pl"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
  "<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}img{max-width:100%}[hidden]{display:none!important}</style>" +
  scripts + "</head><body>";
writeFileSync("www/index.html", head + readFileSync("index.html", "utf8") + "</body></html>");
console.log("www gotowe");
