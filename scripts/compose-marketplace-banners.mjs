/**
 * Builds the Marketplace promo banner images from the real app screens in
 * `public/images/mockups/app/` (made by `npm run capture:marketing`), so the
 * banner shows the product as it is, like the homepage mockups.
 *
 *   npm run compose:banners
 *
 * Each image is transparent, so the slide's own colour shows behind it: a
 * browser window bleeding off the right and bottom edges, optionally with an
 * iPhone in front. `MarketplacePromoSlide` anchors it bottom-right
 * (`object-contain object-right-bottom`). Writes
 * `public/images/marketplace/promo-<name>.webp`.
 *
 * Renders with Playwright, so run `npx playwright install chromium` once.
 */
import fs from "node:fs";
import path from "node:path";

import { chromium } from "playwright";

const root = path.resolve(import.meta.dirname, "..");
const screens = path.join(root, "public/images/mockups/app");
const outDir = path.join(root, "public/images/marketplace");

const width = 1400;
const height = 1080;

/** Each banner: the desktop screen and an optional phone screen. */
const banners = [
  { name: "documents", desktop: "documents-desktop", phone: "company-phone" },
  { name: "clients", desktop: "clients-desktop" },
  // The dashboard shows the plan and the free template slots left.
  {
    name: "templates-offer",
    desktop: "dashboard-desktop",
    phone: "notifications-phone",
  },
  { name: "templates", desktop: "templates-desktop" },
  { name: "cv", desktop: "cv-desktop" },
];

const dataUrl = (file) =>
  `data:image/webp;base64,${fs.readFileSync(path.join(screens, `${file}.webp`)).toString("base64")}`;

const html = ({ desktop, phone }) => {
  // The left third stays empty: the slide's copy runs past the halfway mark,
  // and the devices must never sit under it. The window starts further right
  // when a phone stands in front of it.
  const windowLeft = phone ? 650 : 500;
  return `<!doctype html><html><body style="margin:0;background:transparent">
<div style="position:relative;width:${width}px;height:${height}px;overflow:hidden">
  <div style="position:absolute;left:${windowLeft}px;top:250px;width:1500px;height:1100px;
    border-radius:28px 0 0 0;background:#141414;padding:0 0 0 12px;
    box-shadow:0 30px 80px rgba(20,20,20,.28)">
    <div style="height:46px;display:flex;align-items:center;gap:10px;padding-left:16px">
      <span style="width:13px;height:13px;border-radius:50%;background:#ff6159"></span>
      <span style="width:13px;height:13px;border-radius:50%;background:#ffbd2e"></span>
      <span style="width:13px;height:13px;border-radius:50%;background:#28c941"></span>
    </div>
    <div style="height:100%;border-radius:14px 0 0 0;overflow:hidden;background:#141414">
      <img src="${dataUrl(desktop)}" style="display:block;width:1680px;height:auto">
    </div>
  </div>
  ${
    phone
      ? `<div style="position:absolute;left:420px;top:420px;width:300px;height:650px;
    border-radius:52px;background:#141414;padding:11px;box-sizing:border-box;
    box-shadow:0 30px 70px rgba(20,20,20,.35)">
    <div style="width:100%;height:100%;border-radius:42px;overflow:hidden;background:#fff">
      <img src="${dataUrl(phone)}" style="display:block;width:100%;height:auto">
    </div>
  </div>`
      : ""
  }
</div></body></html>`;
};

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { height, width } });

for (const banner of banners) {
  await page.setContent(html(banner));
  await page.waitForTimeout(300);
  const png = await page.screenshot({ omitBackground: true });
  const { default: sharp } = await import("sharp");
  const file = path.join(outDir, `promo-${banner.name}.webp`);
  await sharp(png).webp({ alphaQuality: 90, quality: 82 }).toFile(file);
  console.log(`wrote ${path.relative(root, file)}`);
}

await browser.close();
