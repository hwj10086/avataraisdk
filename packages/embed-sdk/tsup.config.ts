import { defineConfig } from 'tsup';

// 局部声明 process 避免引入 @types/node 全家桶(只在此构建脚本里用)
declare const process: { env: Record<string, string | undefined> };

/**
 * 多入口 npm 包构建配置
 *  - index: 原生 JS 入口(转发 sdk/src/sdk.ts)
 *  - react: React 组件封装
 *  - vue:   Vue 3 组件封装
 *  - types: 共享类型(供宿主项目类型引用)
 *
 * 产物同时输出 ESM + CJS + .d.ts,覆盖现代/老式打包器。
 *
 * 关键: iframe-bridge.ts 引用 __EMBED_BASE_URL__ 全局常量,如果不在 define 里注入
 * 真实的生产 URL,会 fallback 到 'https://localhost:3003' —— npm 包装到任何用户
 * 项目里都会创建一个指向 localhost:3003 的 iframe,直接报跨域错误。
 * 这是 0.1.0 的 P0 bug,0.1.1 修复。
 *
 * 注意 baseUrl 指向的是 PureJS app(avatar.avataraisdk.com),不是 SDK bundle 站
 * (embed.avataraisdk.com)。后者只服务 sdk.js / widget.js / 零 JS 嵌入用的 embed.html。
 */
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    react: 'src/react.tsx',
    vue: 'src/vue.ts',
    types: 'src/types.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  clean: true,
  sourcemap: true,
  // react / vue 是宿主项目提供,不要打进包里
  external: ['react', 'react-dom', 'react/jsx-runtime', 'vue'],
  target: 'es2020',
  // 关掉压缩 —— 库代码留可读性,宿主项目自己的打包器再 minify
  minify: false,
  define: {
    __EMBED_BASE_URL__: JSON.stringify(
      process.env.EMBED_BASE_URL ?? 'https://avatar.avataraisdk.com',
    ),
  },
});
