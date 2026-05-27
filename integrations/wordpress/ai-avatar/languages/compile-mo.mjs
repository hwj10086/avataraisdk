/**
 * 编译 .po → .mo
 *
 * 用法:
 *   cd platforms/wordpress/ai-avatar/languages
 *   npm install gettext-parser --no-save
 *   node compile-mo.mjs
 *
 * WordPress 实际只读 .mo (二进制),.po 是源 (文本)。
 * 翻译改完 .po 后重跑此脚本即可。
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, basename } from 'node:path';
import gettextParser from 'gettext-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const files = await readdir(__dirname);
const poFiles = files.filter((f) => f.endsWith('.po'));

if (poFiles.length === 0) {
  console.log('没找到 .po 文件,跳过。');
  process.exit(0);
}

for (const po of poFiles) {
  const source = await readFile(resolve(__dirname, po));
  const parsed = gettextParser.po.parse(source);
  const moBuffer = gettextParser.mo.compile(parsed);
  const moName = basename(po, '.po') + '.mo';
  await writeFile(resolve(__dirname, moName), moBuffer);
  console.log(`✓ ${po} → ${moName} (${moBuffer.length} bytes)`);
}
