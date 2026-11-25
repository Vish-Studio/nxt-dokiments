/**
 * Captures the real app screens shown on the marketing homepage from
 * Storybook, then composes the hero's three device scenes from them. Writes
 * everything to `public/images/mockups/app/` as WebP (see `docs/homepage.md`).
 *
 * Run it whenever the dashboard's look changes, so the homepage never shows a
 * stale UI:
 *
 *   npm run storybook            # in another terminal, wait for port 6006
 *   npm run capture:marketing
 *
 * Why Storybook and not the app: the screens use the stories' sample data
 * (`Dashboard/App Shell Pages`), so no account, Firebase or network is needed
 * and the result is reproducible. Storybook does not load `next/font`, so the
 * script loads the same Google font files and defines the CSS variables
 * `globals.css` expects; without that the captures fall back to Arial. The
 * public launch banner is dismissed the way a user would, because it is
 * temporary.
 *
 * The hero scenes reuse the device photos in `public/images/mockups/`
 * (`hero-laptop-rock.webp`, `hero-laptop-cutout.webp`,
 * `hero-mobile-cutout.webp`): each capture is placed on the photo's screen, in
 * perspective for the laptop on the rock.
 */
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mockups = join(root, "public/images/mockups");
const outDir = join(mockups, "app");
const storybook = process.env.STORYBOOK_URL ?? "http://localhost:6006";

const FONT_CSS = `@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@100..900&family=Raleway:wght@400..900&family=Dancing+Script:wght@400..700&display=block');
:root{--font-urbanist:'Urbanist';--font-raleway:'Raleway';--font-dancing-script:'Dancing Script'}
*,*:before,*:after{animation:none!important;transition:none!important}`;

const DESKTOP = { height: 900, width: 1440 };
const PHONE = { height: 852, width: 393 };
const PAGES = "dashboard-app-shell-pages";

/** Clicks through to the editor of a row on the "My documents" or "CVs" tab. */
const openRowAction = (tab, title, action) => async (page) => {
  await page.getByRole("tab", { name: tab }).click();
  await page.getByRole("button", { name: `More actions for ${title}` }).click();
  await page.getByRole("button", { exact: true, name: action }).click();
  await page.waitForTimeout(action === "Download PDF" ? 3_000 : 1_500);
};

/** Starts a new invoice and prefills its recipient from Northline Studio. */
const prefillFromClient = async (page) => {
  await page
    .getByRole("button", { name: /new document/i })
    .first()
    .click();
  await page
    .getByRole("button", { name: /Preview Invoice/ })
    .first()
    .click();
  await page.getByRole("button", { name: "Use document" }).click();
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: /^Client details/ }).click();
  await page
    .getByRole("button", { name: "Prefill from client (optional)" })
    .click();
  await page.getByRole("menuitemradio", { name: /Northline Studio/ }).click();
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
};

/**
 * One screen to capture. `file` saves it under `app/`; screens without a file
 * only feed the hero scenes. `crop` trims the top (in device pixels), used to
 * start a bottom sheet right under the phone's status bar. `steps` drives the
 * story to the state worth showing.
 */
const screens = [
  { file: "dashboard-desktop.webp", id: "dashboard-app-shell--dashboard-home" },
  {
    file: "company-phone.webp",
    id: "dashboard-app-shell--company-sub-page",
    phone: true,
  },
  {
    crop: 250,
    file: "notifications-phone.webp",
    id: "dashboard-notification-bell--visual",
    open: /Notifications/,
    phone: true,
  },
  { file: "marketplace-desktop.webp", id: `${PAGES}--marketplace-page` },
  { file: "documents-desktop.webp", id: `${PAGES}--my-documents-page` },
  { file: "templates-desktop.webp", id: `${PAGES}--my-templates-page` },
  { file: "clients-desktop.webp", id: `${PAGES}--my-clients-page` },
  {
    file: "cv-desktop.webp",
    id: `${PAGES}--my-documents-page`,
    steps: openRowAction(/CVs/, "Financial analyst CV", "Edit"),
  },
  {
    id: `${PAGES}--my-documents-page`,
    key: "invoiceEditor",
    steps: openRowAction(/My documents/, "June retainer invoice", "Edit"),
  },
  { id: `${PAGES}--my-clients-page`, key: "clientsPhone", phone: true },
  {
    id: `${PAGES}--my-documents-page`,
    key: "prefillPhone",
    phone: true,
    steps: prefillFromClient,
  },
  {
    id: `${PAGES}--my-documents-page`,
    key: "pdfPhone",
    phone: true,
    steps: openRowAction(
      /My documents/,
      "June retainer invoice",
      "Download PDF",
    ),
  },
];

/** Captures one screen and returns it as a PNG buffer. */
const capture = async (browser, screen) => {
  const page = await browser.newPage({
    deviceScaleFactor: screen.phone ? 3 : 2,
    viewport: screen.phone ? PHONE : DESKTOP,
  });

  await page.goto(`${storybook}/iframe.html?id=${screen.id}&viewMode=story`, {
    timeout: 90_000,
    waitUntil: "load",
  });
  await page.addStyleTag({ content: FONT_CSS });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(3_000);

  for (const dismiss of await page
    .locator('[aria-label="Dismiss announcement"]')
    .all()) {
    await dismiss.click({ timeout: 1_000 }).catch(() => {});
  }

  if (screen.open) {
    await page.getByRole("button", { name: screen.open }).first().click();
    await page.waitForTimeout(1_500);
  }
  if (screen.steps) await screen.steps(page);
  await page.waitForTimeout(800);

  const png = await page.screenshot();
  await page.close();

  if (!screen.file) return png;

  const image = sharp(png);
  const { height, width } = await image.metadata();
  const top = screen.crop ?? 0;

  await image
    .extract({ height: height - top, left: 0, top, width })
    .webp({ quality: 90 })
    .toFile(join(outDir, screen.file));

  console.log(`wrote ${screen.file} (${width}×${height - top})`);
  return png;
};

const dataUrl = (buffer, type = "png") =>
  `data:image/${type};base64,${buffer.toString("base64")}`;
const photo = (file) => dataUrl(readFileSync(join(mockups, file)), "webp");

/**
 * The CSS `matrix3d` that maps a `width × height` box onto the quad `to`
 * (top-left, top-right, bottom-right, bottom-left), so a flat capture sits on
 * the laptop's screen in perspective.
 */
const perspective = (width, height, to) => {
  const from = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ];
  const a = [];
  const b = [];
  from.forEach(([x, y], i) => {
    const [u, v] = to[i];
    a.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    a.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  });
  // Gaussian elimination with partial pivoting.
  for (let i = 0; i < 8; i++) {
    let max = i;
    for (let r = i + 1; r < 8; r++) {
      if (Math.abs(a[r][i]) > Math.abs(a[max][i])) max = r;
    }
    [a[i], a[max]] = [a[max], a[i]];
    [b[i], b[max]] = [b[max], b[i]];
    for (let r = i + 1; r < 8; r++) {
      const f = a[r][i] / a[i][i];
      for (let c = i; c < 8; c++) a[r][c] -= f * a[i][c];
      b[r] -= f * b[i];
    }
  }
  const h = Array(8).fill(0);
  for (let i = 7; i >= 0; i--) {
    let s = b[i];
    for (let c = i + 1; c < 8; c++) s -= a[i][c] * h[c];
    h[i] = s / a[i][i];
  }
  return [
    h[0],
    h[3],
    0,
    h[6],
    h[1],
    h[4],
    0,
    h[7],
    0,
    0,
    1,
    0,
    h[2],
    h[5],
    0,
    1,
  ];
};

const STATUS_BAR = `<div style="height:50px;display:flex;align-items:center;justify-content:space-between;padding:6px 30px 0 34px;font:600 16px Urbanist;color:#141414;background:#fff"><span>9:41</span><span style="display:flex;gap:6px;align-items:center"><svg width="18" height="12" viewBox="0 0 18 12"><rect y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" width="3" height="12" rx="1"/></svg><svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.5 6.9a6.4 6.4 0 0 1 9 0l-1.4 1.4a4.4 4.4 0 0 0-6.2 0zM1.3 4.7a9.5 9.5 0 0 1 13.4 0l-1.4 1.4a7.5 7.5 0 0 0-10.6 0z"/></svg><svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3.5" fill="none" stroke="#141414" opacity=".4"/><rect x="2" y="2" width="19" height="8" rx="2"/><rect x="24" y="4" width="1.5" height="4" rx=".7" opacity=".4"/></svg></span></div>`;

/** The iPhone photo (640 × 1291) with a phone capture on its screen. */
const phoneFrame = (
  capturePng,
  style,
) => `<div style="position:absolute;width:640px;height:1291px;${style}">
<img src="${photo("hero-mobile-cutout.webp")}" style="position:absolute;inset:0;width:640px;height:1291px">
<div style="position:absolute;left:36px;top:31px;width:568px;height:1228px;border-radius:66px;overflow:hidden;background:#fff">
<div style="width:393px;height:852px;transform:scale(${568 / 393});transform-origin:0 0;overflow:hidden;background:#fff">${STATUS_BAR}<img src="${dataUrl(capturePng)}" style="display:block;width:393px"></div></div>
<div style="position:absolute;left:206px;top:27px;width:228px;height:58px;background:#05070d;border-radius:0 0 32px 32px"></div></div>`;

/** The front-facing laptop photo (1800 × 1098) with a desktop capture on it. */
const laptopFrame = (
  capturePng,
  style,
) => `<div style="position:absolute;width:1800px;height:1098px;${style}">
<img src="${photo("hero-laptop-cutout.webp")}" style="position:absolute;inset:0;width:1800px;height:1098px">
<div style="position:absolute;left:159px;top:34px;width:1472px;height:948px;overflow:hidden;background:#141414"><img src="${dataUrl(capturePng)}" style="display:block;width:100%;height:100%;object-fit:cover;object-position:top"></div>
<div style="position:absolute;left:820px;top:34px;width:160px;height:26px;background:#05070d;border-radius:0 0 12px 12px"></div></div>`;

/** The laptop-on-rock photo (2400 × 1800) with a desktop capture in perspective. */
const rockScene = (capturePng) => {
  const matrix = perspective(1440, 900, [
    [968, 512],
    [1803, 404],
    [1803, 1350],
    [968, 1357],
  ]);
  // The visible screen: inside the bezel and above the keyboard's front edge.
  const clip = "979px 527px,1797px 420px,1797px 1221px,979px 1223px";
  return `<img src="${photo("hero-laptop-rock.webp")}" style="position:absolute;inset:0;width:2400px;height:1800px">
<div style="position:absolute;inset:0;clip-path:polygon(${clip})">
<div style="position:absolute;width:1440px;height:900px;transform-origin:0 0;transform:matrix3d(${matrix.join(",")})">
<img src="${dataUrl(capturePng)}" style="display:block;width:1440px;height:900px">
<div style="position:absolute;left:645px;top:0;width:150px;height:24px;background:#050505;border-radius:0 0 10px 10px"></div>
<div style="position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.07),rgba(255,255,255,0) 40%,rgba(0,0,0,.1))"></div>
</div></div>`;
};

/** Renders one 2400 × 1800 scene and saves it as WebP. */
const compose = async (browser, file, background, body) => {
  const page = await browser.newPage({
    viewport: { height: 1800, width: 2400 },
  });
  await page.setContent(
    `<html><head><link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@600&display=block" rel="stylesheet"></head><body style="margin:0"><div style="position:relative;width:2400px;height:1800px;overflow:hidden;background:${background}">${body}</div></body></html>`,
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1_000);
  const png = await page.screenshot();
  await page.close();
  await sharp(png).webp({ quality: 86 }).toFile(join(outDir, file));
  console.log(`wrote ${file} (2400×1800)`);
};

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();

try {
  const shots = {};
  for (const screen of screens) {
    const png = await capture(browser, screen);
    shots[screen.key ?? screen.file] = png;
  }

  // Hero step 1, "Pick a template": the marketplace on the laptop on the rock.
  await compose(
    browser,
    "hero-template.webp",
    "#141414",
    rockScene(shots["marketplace-desktop.webp"]),
  );
  // Hero step 2, "Add your client": the client book and a prefilled invoice on two phones.
  await compose(
    browser,
    "hero-client.webp",
    "#93cdf6",
    phoneFrame(
      shots.clientsPhone,
      "left:420px;top:330px;transform:rotate(-7deg) scale(1.02);filter:drop-shadow(0 50px 60px rgba(20,20,20,.28))",
    ) +
      phoneFrame(
        shots.prefillPhone,
        "left:1180px;top:230px;transform:rotate(5deg) scale(1.08);filter:drop-shadow(0 60px 70px rgba(20,20,20,.32))",
      ),
  );
  // Hero step 3, "Send the PDF": the finished invoice on a laptop, "Document ready" on a phone.
  await compose(
    browser,
    "hero-send.webp",
    "#c9b6f4",
    laptopFrame(
      shots.invoiceEditor,
      "left:250px;top:300px;transform:scale(.98);transform-origin:0 0;filter:drop-shadow(0 50px 60px rgba(20,20,20,.25))",
    ) +
      phoneFrame(
        shots.pdfPhone,
        "left:1560px;top:640px;transform:scale(.74) rotate(4deg);transform-origin:0 0;filter:drop-shadow(0 40px 50px rgba(20,20,20,.35))",
      ),
  );
} finally {
  await browser.close();
}
