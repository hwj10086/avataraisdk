/**
 * SVG → PNG 转换脚本
 *
 * 用法:
 *   cd platforms/wordpress/ai-avatar/assets/source
 *   npm install sharp --no-save
 *   node build-png.mjs
 *
 * 产物会写到 ../  (即 assets/ 根目录):
 *   icon-128x128.png
 *   icon-256x256.png
 *   banner-772x250.png
 *   banner-1544x500.png
 *
 * 重新设计 SVG 后重跑此脚本即可。
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceDir = __dirname;
const outDir = resolve(__dirname, '..');

const jobs = [
  { svg: 'icon.svg',             out: 'icon-128x128.png',   width: 128,  height: 128 },
  { svg: 'icon.svg',             out: 'icon-256x256.png',   width: 256,  height: 256 },
  { svg: 'banner-772x250.svg',   out: 'banner-772x250.png', width: 772,  height: 250 },
  { svg: 'banner-772x250.svg',   out: 'banner-1544x500.png', width: 1544, height: 500 },
];

for (const job of jobs) {
  const svgBuffer = await readFile(resolve(sourceDir, job.svg));
  const png = await sharp(svgBuffer, { density: 384 })
    .resize(job.width, job.height, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(resolve(outDir, job.out), png);
  console.log(`✓ ${job.out}  (${job.width}×${job.height}, ${(png.length / 1024).toFixed(1)} KB)`);
}

console.log('\n所有 PNG 已写到', outDir);
