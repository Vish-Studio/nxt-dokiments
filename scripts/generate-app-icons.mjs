/**
 * Regenerates the installed-app icons: the black Dokiments mark on the brand
 * yellow (`golden-harvest`, #ffd066), from `public/images/svg/icon-black.svg`.
 *
 * Run after the logo or brand colour changes:
 *
 *   node scripts/generate-app-icons.mjs
 *
 * Writes:
 * - `public/icons/icon-192.png`, `icon-512.png`: `purpose: "any"` in the
 *   manifest. A rounded yellow square, so desktop installs (which show the
 *   icon as is) look like an app tile.
 * - `public/icons/icon-maskable-512.png`: `purpose: "maskable"`. Full-bleed
 *   yellow, mark inside the 80% safe zone, so Android can crop it to any shape.
 * - `src/app/apple-icon.png` (180px): full-bleed, since iOS rounds it itself.
 */
import fs from "node:fs";
import path from "node:path";

import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const yellow = "#ffd066";
const markSvg = fs.readFileSync(
  path.join(root, "public/images/svg/icon-black.svg"),
);

/** The mark alone, trimmed to its own bounds, at roughly `size` px. */
const renderMark = async (size) =>
  sharp(markSvg)
    .resize(size * 2, size * 2, { fit: "inside" })
    .trim()
    .resize(size, size, {
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      fit: "contain",
    })
    .png()
    .toBuffer();

/**
 * @param size - Output width and height in px.
 * @param markRatio - The mark's size as a share of the icon.
 * @param radiusRatio - Corner radius as a share of the icon; 0 is full-bleed.
 */
const renderIcon = async (size, markRatio, radiusRatio) => {
  const radius = Math.round(size * radiusRatio);
  const tile = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${yellow}"/></svg>`,
  );
  const markSize = Math.round(size * markRatio);
  const mark = await renderMark(markSize);
  const offset = Math.round((size - markSize) / 2);

  return sharp(tile)
    .composite([{ input: mark, left: offset, top: offset }])
    .png()
    .toBuffer();
};

const outputs = [
  ["public/icons/icon-192.png", 192, 0.56, 0.22],
  ["public/icons/icon-512.png", 512, 0.56, 0.22],
  ["public/icons/icon-maskable-512.png", 512, 0.46, 0],
  ["src/app/apple-icon.png", 180, 0.58, 0],
];

for (const [file, size, markRatio, radiusRatio] of outputs) {
  fs.writeFileSync(
    path.join(root, file),
    await renderIcon(size, markRatio, radiusRatio),
  );
  console.log(`wrote ${file}`);
}
