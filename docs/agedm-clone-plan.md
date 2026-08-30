# AGE动漫网站复刻开发计划

> 创建日期:2026-08-30 | 状态:待启动
> 目标:使用 React + TypeScript + shadcn/ui + TailwindCSS + Vite + pnpm 一比一复刻 [agedm.io](https://www.agedm.io/) 的全部页面与交互模块(登录注册暂缓)

## 一、可行性分析结论

### 网站结构调研(已实际抓取确认)

原站为服务端渲染聚合站(非 SPA),共 5 类页面:

| 页面 | 路由 | 核心内容 |
|---|---|---|
| 首页 | `/` | 最近更新、今日推荐、周一~周日放送表、友情链接 |
| 目录 | `/catalog/all-all-all-all-1-1` | 8 维筛选(地区/版本/首字母/年份/季度/状态/类型/资源)+ 排序 + 分页(约 5572 条) |
| 详情 | `/detail/{id}` | 信息卡、系列作品、简介、播放线路 × 分集、相关推荐 |
| 播放 | `/play/{id}/{线路}/{集数}` | iframe 嵌入第三方源 |
| 搜索/排行/周更 | `/search` 等 | 关键词搜索(带历史)、排行榜 |

### 视频源分析:不可行,不采用

1. **技术层面**:播放页为 iframe 嵌第三方源(西瓜、非凡、暴风、无尽、计算云等),视频托管在第三方 CDN,普遍存在防盗链、Referer 校验、token 时效,地址不稳定且频繁失效。
2. **法律层面**:原站自述"不存储影片、资源收集自各视频网站",属盗版聚合站。抓取其视频源自建分发站侵犯信息网络传播权,存在实际法律风险,不纳入本方案。

### 替代方案(采用)

- **数据层**:使用 Bangumi 官方开放 API(`api.bgm.tv`,公开免费),提供条目搜索、条目详情、每日放送、评分排行,覆盖全部展示字段。
- **播放层**:播放页交互完整实现(线路切换、选集、播放器),视频内容用公共演示视频填充;预留 `PlaybackProvider` 接口,后续可接入自有合法授权源。
- **UI**:一比一复刻,完全可行。

## 二、技术栈

- Vite + React 18 + TypeScript(strict)
- TailwindCSS v4 + shadcn/ui(含暗色模式)
- Zustand(客户端状态)、TanStack Query(服务端状态)、react-router v7
- pnpm 包管理
- 开发期用 Vite proxy 转发 `api.bgm.tv` 规避 CORS

> 决策说明:原拟用 Pinia,但 Pinia 属 Vue 生态、在 React 中不可用,故选用 API 理念最接近的 Zustand。

## 三、总体架构

```
src/
  api/          # Bangumi 适配器:外部字段 → 领域模型
  types/        # Anime, Episode, Schedule, FilterQuery 等
  stores/       # zustand:收藏、观看历史、搜索历史、筛选器
  hooks/        # TanStack Query 查询封装
  components/
    ui/         # shadcn 组件
    layout/     # Header(导航+搜索)/ Footer
    anime/      # AnimeCard, EpisodeBadge, FilterBar, Pagination, WeeklyTable
  pages/        # Home, Catalog, Detail, Play, Search, Ranking, Weekly
```

- 筛选状态映射原站 8 维筛选,以 URL 查询参数编码(`?region=...&year=...`),刷新后状态可保留。
- `PlaybackProvider` 接口默认返回公共演示视频;线路列表演示为 3 条虚拟线路。

## 四、页面清单(一比一对照)

1. **首页**:最近更新、今日推荐、周一~周日放送表(Bangumi `/calendar`)、底部更新、友链区
2. **目录页**:8 维筛选 + 排序 + 分页 + 条目列表(封面/集数徽标/标题/元信息/简介)
3. **详情页**:标题 + 统计(评分/排名)、信息卡、系列作品、简介、线路 × 选集、相关推荐
4. **播放页**:播放器(演示视频)+ 线路切换 + 上下集 + 选集侧栏 + 观看历史
5. **搜索页**:结果列表 + 搜索历史(localStorage 持久化)
6. **一周更新页 / 排行榜页**:放送时间表;按 Bangumi rating/rank 排行(页面注明「按评分」)
7. **登录/注册**:入口隐藏;「我的收藏/观看历史」以 localStorage 本地实现(独立页面)

## 五、分阶段执行计划

| 阶段 | 内容 | 验收标准 |
|---|---|---|
| 0 脚手架 | Vite + Tailwind v4 + shadcn/ui 初始化、路由骨架、ESLint/Prettier、路径别名 | 7 条路由空壳可导航、构建通过 |
| 1 数据层 | 领域模型、Bangumi 适配器、Vite proxy、查询封装、mock 数据源兜底 | 可取到真实数据并映射为领域模型 |
| 2 公共组件 | Header/Footer、AnimeCard、徽标、分页、筛选栏、骨架屏 | 组件演示页齐全 |
| 3 首页 | 五大板块按原站布局实现 | 板块与原站一一对应 |
| 4 目录页 | 8 维筛选 + URL 同步 + 分页 | 筛选/翻页刷新后状态保留 |
| 5 详情页 | 信息卡 + 选集 + 相关推荐 | 字段完整、布局对照原站 |
| 6 播放页 | PlaybackProvider + 演示视频 + 线路/选集交互 + 历史记录 | 播放交互完整 |
| 7 搜索/周更/排行 | 三页面实现 | 与原站功能对应 |
| 8 本地收藏/历史 | localStorage 持久化 + 独立页面 | 增删查可用 |
| 9 打磨 | 响应式、暗色模式、404、SEO meta、Lighthouse | 移动端可用、性能达标 |

每阶段以「页面效果对照原站结构 + 构建通过」为验收闸门,阶段间相互独立、可暂停。

## 六、风险与边界

- Bangumi 无「点击量」字段,排行榜以评分替代并在页面注明;「资源版本」等筛选无对应数据,保留 UI 但标注数据源能力。
- 演示视频仅用于验证播放器交互,非番剧正片;真实内容需接入自有合法授权源。
- 后续若做登录注册,预留的 store 与 API 层已按可扩展方式设计。
