# 01 — 项目脚手架与路由骨架

**What to build:** 开发者克隆仓库后执行 `pnpm install && pnpm dev`,即可看到带顶部导航的站点空壳;首页/目录/详情/播放/搜索/一周更新/排行榜 7 条路由均可切换到占位页面,构建与代码检查工具链就绪。

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] pnpm 工程初始化:Vite + React 18 + TypeScript(strict)、路径别名、ESLint/Prettier,`pnpm build` 通过
- [ ] TailwindCSS v4 与 shadcn/ui 初始化完成,含暗色模式主题变量基础
- [ ] react-router 配置 7 条路由,每条渲染占位页,导航可点击切换
- [ ] 目录结构与计划中的分层(api/types/stores/hooks/components/pages)一致
