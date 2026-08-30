# 03 — 布局与公共组件

**What to build:** 站点具备统一外观:所有页面共享顶部导航(首页/目录/一周更新/排行榜 + 搜索框 + 品牌区)与页脚(友链区、免责声明位);番剧卡片(封面/标题/集数徽标/评分)、分页器、骨架屏加载态、空态等公共组件在演示页齐全可用,后续页面票直接复用。

**Blocked by:** 01, 02

**Status:** resolved

- [x] Header:主导航 + 搜索框(可输入提交,历史下拉留接口),移动端折叠可用
- [x] Footer:友情链接与声明区
- [x] AnimeCard:封面、标题、最新集数徽标、评分展示
- [x] 分页器、筛选栏基础控件、骨架屏、空态/错误态组件
- [x] 组件演示路由集中展示以上组件的各状态

## Comments

- 2026-08-30:演示页 `/dev/components` 已浏览器截图验证,全部组件状态渲染正常。新增 ui 组件:input/skeleton/pagination;anime 组件:anime-card/anime-card-skeleton/filter-group;common:empty-state/error-state(带重试)。搜索历史在工单 07 接入 Header。
