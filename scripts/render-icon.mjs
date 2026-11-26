import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
const root = new URL("..", import.meta.url).pathname;
const img = `data:image/webp;base64,${readFileSync(`${root}/public/art/mac.webp`).toString("base64")}`;
const S = { x: 0.1239, y: 0.1182, w: 0.7549, h: 0.4486 }; // the screen, from lib/art.json
const FONT = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,600,0..100,0..1&display=block">`;
// The hero's computer, scaled to fit a square, with "faber" on a white screen.
const mac = (size) => {
  const h = size, w = (size * 1419) / 1825;
  return `<div style="position:relative;width:${w}px;height:${h}px">
    <img src="${img}" style="position:absolute;inset:0;width:100%;height:100%">
    <div style="position:absolute;left:${S.x * 100}%;top:${S.y * 100}%;width:${S.w * 100}%;height:${S.h * 100}%;background:#fff;border-radius:4.6% / 6.2%;box-shadow:inset 0 0 ${size * 0.012}px rgba(30,30,30,0.18);display:grid;place-items:center">
      <span style="font:600 ${w * 0.215}px/1 Fraunces,Georgia,serif;font-variation-settings:'SOFT' 100,'WONK' 1;letter-spacing:-0.02em;color:#141210;translate:0 -4%">faber</span>
    </div></div>`;
};
const tile = (size, bg) => `<div style="width:${size}px;height:${size}px;display:grid;place-items:center;background:${bg}">${mac(size * (bg === "transparent" ? 1 : 0.8))}</div>`;
const b = await chromium.launch({ channel: "chrome" });
const go = async (w, h, body, out, omit) => {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent(`${FONT}<style>html,body{margin:0;background:transparent}</style>${body}`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: out, omitBackground: omit, clip: { x: 0, y: 0, width: w, height: h } });
  await p.close();
};
if (process.argv[2] === "final") {
  await go(512, 512, tile(512, "transparent"), `${root}/app/icon.png`, true);
  await go(180, 180, tile(180, "#eebf12"), `${root}/app/apple-icon.png`, false);
} else {
  await go(560, 300, `<div style="display:flex;gap:16px;align-items:end;padding:16px;background:#fff">${tile(256, "transparent")}${tile(64, "transparent")}${tile(32, "transparent")}<div style="background:#202124;padding:8px;display:flex;gap:8px;align-items:end">${tile(64, "transparent")}${tile(32, "transparent")}</div></div>`, "heromac.png", false);
}
await b.close();
