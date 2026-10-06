const { copyFileSync, existsSync, mkdirSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
const publicDir = join(root, "public");
const distDir = join(root, "dist");

if (!existsSync(distDir)) {
  throw new Error("dist directory is missing; run Expo export first");
}

mkdirSync(distDir, { recursive: true });

for (const file of ["privacy.html", "terms.html"]) {
  copyFileSync(join(publicDir, file), join(distDir, file));
}

console.log("Copied legal pages to dist");
