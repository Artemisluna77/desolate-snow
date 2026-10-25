# GLOSSARY

项目领域词汇。深模块命名与讨论一律使用这里的词。

## AGE 数据域

- **线路（Source）**：一部番剧的播放来源（如 xigua/ffm3u8），由服务端从上游解析，包含 key、label、是否 VIP、分集列表。**契约：`AgeDetailData.sources` 恒非空（live 与降级快照同一契约），客户端不得自行虚构线路域。**降级快照中的线路使用中性命名「线路 N」，不冒充真实品牌。
- **选集（Episode）**：某条线路下的分集，number 从 1 起，与 URL `/play/:id/:source/:episode` 中的 source（1 基线路序号）/episode 对应。
- **降级快照（Fallback snapshot）**：BFF 不可达时使用的本地数据（`src/data/age-page-data.ts`、`home-data.ts`），常量全站仅 `use-agedm.ts` 一处引用。页面的降级信号只有一个：hooks 返回的 `isDegraded`（即 `meta.source !== 'live'`），渲染为 `DegradedNotice`。
- **数据访问 seam（use-agedm）**：`useAgedmQuery` 包装器持有「pending 占位快照 / 失败兜底 / 溯源信号」三件事，页面只消费 `{ data, meta, isDegraded, refetch }`。playback 与 search 是该 seam 的显式「不兜底」选项（失败即错误态）。
- **推荐补位（Recommendation backfill）**：上游 `recommended` 优先、本地推荐池去重补足 12 条的统一策略（`getAgeRecommendations`），detail/play 两页共用。

## 展示域

- **番剧展示域**：`src/components/anime/` 下由 play/detail 两页共用的展示模块集合（AnimeStats、AnimeInfoList、EpisodePanel、RecommendCard）。页面负责组合与页面级差异，字段顺序等官方对齐知识内置在模块内（`variant: 'detail' | 'play'`）。
- **选集面板（EpisodePanel）**：线路页签 + 选集宫格 + 排序 + 「正在播放」指示的一体化有状态模块。页签浏览状态（当前看哪条线路的列表）属于面板内部；播放地址的切换（导航/跳转）通过 `onSelectEpisode` / `hrefOf` 回调留给页面。

## 播放会话

- **播放会话（Playback session）**：URL `/play/:id/:source/:episode` 所代表的"正在播放的线路与集数"。播放会话存活期内不重新解析播放地址（token 每次解析不同，重取即换源重载）；只有导航到新的会话才重新解析。客户端保证：playback 查询不因 focus/reconnect 重取；服务端保证：同一集数在缓存窗口内解析幂等。
- **正在播放指示**：当前播放会话在选集面板中的标记——半透明遮罩 + 三竖条 loader 动画（官方 `loader_play` 同款）。

## 本地持久化

- **有界本地列表（Bounded list）**：`src/stores/bounded-list.ts` 的 `createBoundedListStore` 惯用法——zustand persist + 条数上限 + 可选去重 + 写入装饰（生成 id/时间戳）。watch-history / search-history / play-comments / collections 四个 store 只声明差异（cap、keyOf、dedupe、decorate）。

## 服务端

- **normalize 层**：`server/normalize.mjs` 的纯函数集合，把上游双命名（AID/id、Title/name、PicSmall/cover）防御性归一为 `src/types/agedm.ts` 的 wire contract；fixture 单测见 `server/normalize.test.ts`。
- **上游适配层（upstream）**：`server/upstream.mjs` 的 `fetchUpstream`（超时/伪装头/错误归一）+ `fromCache`（TTL + stale-while-error），是换源与录制 fixture 的 seam。
