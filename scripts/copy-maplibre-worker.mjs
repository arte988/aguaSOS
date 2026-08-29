import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const dist = path.join(
  path.dirname(createRequire(import.meta.url).resolve("maplibre-gl/package.json")),
  "dist"
);
const dest = path.join(process.cwd(), "public", "maplibre");

mkdirSync(dest, { recursive: true });
let copied = 0;
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  const source = path.join(dist, file);
  if (existsSync(source)) {
    copyFileSync(source, path.join(dest, file));
    copied += 1;
  }
}
if (copied === 0) {
  // maplibre-gl 6+ embebe el worker en el bundle (blob URL). Los archivos
  // maplibre-gl-worker.mjs / maplibre-gl-shared.mjs solo existían en 5.x.
  console.log("maplibre-gl bundles its worker inline; skipping worker copy");
}