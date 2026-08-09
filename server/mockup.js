const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const FRAME_SRC = path.join(__dirname, "assets/laptop-mockup.png");
const FRAME_CACHE = path.join(__dirname, "assets/laptop-frame.png");
const SCREEN_META = path.join(__dirname, "assets/laptop-screen.json");

/** Calibrated for server/assets/laptop-mockup.png (1024×667 MacBook photo). */
const SCREEN = {
  left: 91,
  top: 56,
  width: 842,
  height: 520,
  rx: 16,
};
const NOTCH = {
  width: 148,
  height: 26,
  rx: 9,
};

/**
 * Flood-fill near-black studio background from the edges → alpha 0.
 * Keeps dark pixels inside the laptop (bezels, screen) intact.
 */
function keyStudioBackground(data, width, height) {
  const ch = 4;
  const visited = new Uint8Array(width * height);
  const queue = [];
  const isBg = (i) => {
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    return lum <= 16;
  };
  const push = (x, y) => {
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * ch;
    if (!isBg(i)) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  let qi = 0;
  while (qi < queue.length) {
    const idx = queue[qi++];
    const x = idx % width;
    const y = (idx / width) | 0;
    if (x > 0) push(x - 1, y);
    if (x < width - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < height - 1) push(x, y + 1);
  }

  for (let idx = 0; idx < visited.length; idx++) {
    if (!visited[idx]) continue;
    const i = idx * ch;
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    // Soft edge so the laptop silhouette isn't harsh
    data[i + 3] = lum <= 6 ? 0 : Math.min(data[i + 3], Math.round(((lum - 6) / 10) * 255));
  }
}

function screenPunchSvg(width, height, screen, notch) {
  const nx = (width - notch.width) / 2;
  const ny = screen.top;
  // evenodd: outer screen hole minus notch so camera island stays in the frame
  return Buffer.from(`
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" fill="black" d="
    M ${screen.left + screen.rx},${screen.top}
    H ${screen.left + screen.width - screen.rx}
    A ${screen.rx},${screen.rx} 0 0 1 ${screen.left + screen.width},${screen.top + screen.rx}
    V ${screen.top + screen.height - screen.rx}
    A ${screen.rx},${screen.rx} 0 0 1 ${screen.left + screen.width - screen.rx},${screen.top + screen.height}
    H ${screen.left + screen.rx}
    A ${screen.rx},${screen.rx} 0 0 1 ${screen.left},${screen.top + screen.height - screen.rx}
    V ${screen.top + screen.rx}
    A ${screen.rx},${screen.rx} 0 0 1 ${screen.left + screen.rx},${screen.top}
    Z
    M ${nx + notch.rx},${ny}
    H ${nx + notch.width - notch.rx}
    A ${notch.rx},${notch.rx} 0 0 1 ${nx + notch.width},${ny + notch.rx}
    V ${ny + notch.height - notch.rx}
    A ${notch.rx},${notch.rx} 0 0 1 ${nx + notch.width - notch.rx},${ny + notch.height}
    H ${nx + notch.rx}
    A ${notch.rx},${notch.rx} 0 0 1 ${nx},${ny + notch.height - notch.rx}
    V ${ny + notch.rx}
    A ${notch.rx},${notch.rx} 0 0 1 ${nx + notch.rx},${ny}
    Z
  "/>
</svg>`);
}

async function buildLaptopFrame() {
  if (fs.existsSync(FRAME_CACHE) && fs.existsSync(SCREEN_META)) {
    const meta = JSON.parse(fs.readFileSync(SCREEN_META, "utf8"));
    const buffer = await fs.promises.readFile(FRAME_CACHE);
    return { buffer, ...meta };
  }

  const { data, info } = await sharp(FRAME_SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  keyStudioBackground(data, width, height);

  let frame = await sharp(data, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer();

  const hole = await sharp(screenPunchSvg(width, height, SCREEN, NOTCH))
    .ensureAlpha()
    .png()
    .toBuffer();

  // dest-out: opaque black in the punch removes screen pixels (Sharp blend)
  frame = await sharp(frame)
    .composite([{ input: hole, blend: "dest-out" }])
    .png()
    .toBuffer();

  const meta = { width, height, screen: { ...SCREEN }, notch: { ...NOTCH } };
  await fs.promises.writeFile(FRAME_CACHE, frame);
  await fs.promises.writeFile(SCREEN_META, JSON.stringify(meta, null, 2));

  return { buffer: frame, ...meta };
}

/**
 * Transparent PNG: photo MacBook + wallpaper on screen, no studio backdrop.
 * @param {Buffer} thumbnailBuffer
 * @returns {Promise<Buffer>}
 */
async function generateMockupCard(thumbnailBuffer) {
  const frame = await buildLaptopFrame();
  const { width, height, screen, buffer: frameBuffer } = frame;

  const pad = 2;
  const wallpaper = await sharp(thumbnailBuffer)
    .rotate()
    .resize(screen.width + pad * 2, screen.height + pad * 2, {
      fit: "cover",
      position: "centre",
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: wallpaper,
        left: screen.left - pad,
        top: screen.top - pad,
      },
      { input: frameBuffer, left: 0, top: 0 },
    ])
    .png()
    .toBuffer();
}

/** Force rebuild of cached transparent frame (dev / calibration). */
async function rebuildLaptopFrame() {
  for (const p of [FRAME_CACHE, SCREEN_META]) {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  return buildLaptopFrame();
}

module.exports = { generateMockupCard, buildLaptopFrame, rebuildLaptopFrame };
