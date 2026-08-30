# agedm-clone — AGE动漫复刻

Feature slug: `agedm-clone`

## Spec

完整开发计划见 `docs/agedm-clone-plan.md`(可行性分析、技术栈、架构、页面清单、风险边界)。要点:

- 一比一复刻 agedm.io 的全部页面与交互,登录注册暂缓(入口隐藏,收藏/历史本地化)。
- 数据层:Bangumi 官方 API(`api.bgm.tv`)+ mock 兜底;不抓取原站视频源(法律与技术双重不可行),播放内容用公共演示视频,预留 `PlaybackProvider` 接口。
- 技术栈:Vite + React 18 + TS(strict)+ TailwindCSS v4 + shadcn/ui + Zustand + TanStack Query + react-router v7 + pnpm(Pinia 属 Vue 生态,与 React 不兼容,故用 Zustand)。

## Tickets

| # | 标题 | Blocked by |
|---|---|---|
| 01 | 项目脚手架与路由骨架 | — |
| 02 | Bangumi 数据层 | 01 |
| 03 | 布局与公共组件 | 01, 02 |
| 04 | 首页 | 03 |
| 05 | 目录页 | 03 |
| 06 | 详情页 | 03 |
| 07 | 搜索页 | 03 |
| 08 | 播放页 | 06 |
| 09 | 一周更新与排行榜 | 03 |
| 10 | 本地收藏与观看历史 | 06, 08 |
| 11 | 整体打磨 | 04, 05, 06, 07, 08, 09, 10 |
