// scripts/optimize-images.mjs
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC_DIR = "public/img";
const OUT_SIZES = [480, 768, 1080, 1600]; // anchos en px
const INPUT_EXTS = new Set([".jpg", ".jpeg", ".png"]);

const files = await fs.readdir(SRC_DIR);
for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  if (!INPUT_EXTS.has(ext)) continue;

  const name = path.basename(file, ext);
  const input = path.join(SRC_DIR, file);

  // Genera variantes WebP
  for (const width of OUT_SIZES) {
    const out = path.join(SRC_DIR, `${name}-${width}.webp`);
    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(out);
    console.log("✔", out);
  }
}
console.log("Done.");
