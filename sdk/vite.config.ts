import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

/**
 * 三种 build 目标(用 --mode 切换):
 *   - 默认 (production): 输出 ES 双 entry —— sdk.js + widget.js
 *   - --mode iife-sdk:   输出 sdk.iife.js (IIFE 单 entry)
 *   - --mode iife-widget: 输出 widget.iife.js (IIFE 单 entry)
 *
 * 拆成三次 build 是因为 vite lib mode 限制:
 *   "Multiple entry points are not supported when output formats include 'umd' or 'iife'"
 *
 * IIFE 产物给小白用普通 <script src=""> 加载;ES 产物给走 import / type="module" 的项目。
 * package.json scripts 里 build 串行跑三次,emptyOutDir 仅第一次清空。
 */
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const isIifeSdk = mode === 'iife-sdk';
  const isIifeWidget = mode === 'iife-widget';
  const isIife = isIifeSdk || isIifeWidget;

  // 关键:--mode iife-sdk / iife-widget 不会自动加载 .env.production
  //   (vite loadEnv 按 mode 字符串查 .env.{mode},找不到对应文件就回空)
  // 修法:非 dev 的所有 mode 都强制走 production env 文件,跟 vite build 默认行为对齐。
  // 不修这一步 → IIFE 产物拿不到 VITE_EMBED_BASE_URL → SDK 创建的 iframe 指向 localhost:3003。
  const envMode = isDev ? 'development' : 'production';
  const env = loadEnv(envMode, process.cwd(), '');

  // 双保险:即便 .env 没设 VITE_EMBED_BASE_URL,fallback 也按 mode 切换:
  //   dev → localhost:3003(本地 PureJS dev server),非 dev → 生产 iframe 主站。
  // 之前 hardcode "https://localhost:3003" 导致 IIFE build 翻车的根因。
  const EMBED_BASE_URL = env.VITE_EMBED_BASE_URL
    || (isDev ? 'https://localhost:3003' : 'https://avatar.avataraisdk.com');

  // entry 配置:ES 模式双 entry,IIFE 模式各自单 entry
  let libConfig;
  if (isIifeSdk) {
    libConfig = {
      entry: resolve(__dirname, 'src/sdk.ts'),
      formats: ['iife'] as const,
      name: 'AIAvatarSDK',
      fileName: () => 'sdk.iife.js',
    };
  } else if (isIifeWidget) {
    libConfig = {
      entry: resolve(__dirname, 'src/widget.ts'),
      formats: ['iife'] as const,
      name: 'AIAvatarWidget',
      fileName: () => 'widget.iife.js',
    };
  } else {
    libConfig = {
      entry: {
        sdk: resolve(__dirname, 'src/sdk.ts'),
        widget: resolve(__dirname, 'src/widget.ts'),
      },
      formats: ['es'] as const,
      fileName: (_format: string, entryName: string) => `${entryName}.js`,
    };
  }

  return {
    define: {
      // 让 iframe-bridge.ts 里 import.meta.env.VITE_EMBED_BASE_URL 可用
      // 注:在 lib mode 下 Vite 不会默认替换 import.meta.env.*,这里显式注入
      '__EMBED_BASE_URL__': JSON.stringify(EMBED_BASE_URL),
    },
    build: {
      outDir: 'dist',
      // 仅 ES build 清空 dist;IIFE 两次 build 在 ES 产物之上叠加,不能清空
      emptyOutDir: !isIife,
      lib: libConfig as any,
      // 同时复制 embed.html 到 dist/(仅 ES build 时,避免重复复制)
      copyPublicDir: !isIife,
      // IIFE 模式声明 named exports:避免"sdk.ts 同时有 named + default export 时
      // 用户要写 AIAvatarSDK.default.init(...)"的违和警告。SDK 内部已经主动把
      // AIAvatar 挂到 window(sdk.ts L72),IIFE 返回值本来就不用,声明 named 干掉警告。
      rollupOptions: isIife ? {
        output: { exports: 'named' as const },
      } : undefined,
    },
    publicDir: 'public',
  };
});
