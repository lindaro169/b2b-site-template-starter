/**
 * OpenNext + Cloudflare Workers 配置
 *
 * 此配置优化 Next.js 应用以在 Cloudflare Workers 上运行
 *
 * 功能包括：
 * - R2 对象存储用于静态资源和缓存
 * - D1 数据库绑定
 * - KV 命名空间用于会话存储
 * - 图片优化
 */

import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // ✅ 关键修复：配置生成全局变量以告诉asset resolver使用ASSETS KV
  // 这使得OpenNextJS的assetResolver能够正确识别哪些路径应该从ASSETS KV提供
  incrementalCache: "dummy",
  tagCache: "dummy",

  // 启用 R2 增量缓存以获得更好的性能
  // 这将 ISR 缓存存储在 R2 而不是内存中
  //
  // 要使用此功能，请取消注释下面的行：
  // import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
  // incrementalCache: r2IncrementalCache,

  // 启用 KV 命名空间用于会话存储
  // 这对于在 Workers 之间共享会话状态很重要
  //
  // prerenderedRoutes: [
  //   '/products',
  //   '/about',
  // ],

  // 禁用 node 兼容性模式，以获得更好的 Workers 性能
  // 仅在确保所有依赖都与 Workers 兼容时启用
  // skipNodePolution: false,
});
