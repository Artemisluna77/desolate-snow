# 12 — 架构深化（走查候选 3-8）

**What to build:** 落地 2026-10-25 架构走查报告（HTML 报告见临时目录）中的候选 3-8：兜底收敛、server 拆分、wire 类型独立、死链删除、播放器分支收敛、store 惯用法收敛。候选 1+2 已在 08/06 工单完成。

**Status:** resolved

- [x] 候选3:兜底收敛——agedm-client 变纯数据访问层(失败即抛);`useAgedmQuery` seam 持有 pending 占位快照/失败兜底/溯源三件事;页面只消费 {data, meta, isDegraded};快照常量全站仅 use-agedm 一处;DegradedNotice 组件消费 meta.source(此前零消费);recommend-page 从纯静态页改为消费实时数据(离群点修复)
- [x] 候选4:server 拆分——index.mjs 741 行 → index(355,路由+静态) + normalize.mjs(321,纯函数) + upstream.mjs(86,fetch适配+TTL缓存);调用点签名不变;normalize 10 条 fixture 单测(双命名归一/线路域/搜索解包/stale-while-error 语义锚点)
- [x] 候选5:wire 类型独立——src/types/agedm.ts(Age* + Home* + AgeAnimeSummary/AgePagedResult/AgedmHomeData),页面与组件不再为类型 import 快照文件
- [x] 候选6:删除 Bangumi/mock 链——data-source/mock-source/bangumi-adapter/bangumi-client/api/index/use-anime(4/5 死 hook)/types/anime.ts 共 ~450 行;collections 条目脱离 AnimeSummary 降维转换;dev demo 改用 AGE 快照;vite /api/bgm 代理移除;搜索改 useAgedmSearch(AGE 单源,失败显式错误态)
- [x] 候选7:播放器分支收敛——删除 art-player.tsx 与 directVideoUrl 死分支及 artplayer 依赖;AgedmPlayer 单一 iframe 形态;形态决策唯一表述为 wire 的 playback.kind(服务端白名单是唯一判据)
- [x] 候选8:store 惯用法——createBoundedListStore(双泛型 TInput/TStored,cap/keyOf/dedupe/decorate);watch-history/search-history/play-comments/collections 四店收敛;collections 补上此前缺失的上限(200);收藏动词 has/toggle 收敛为组件侧派生 + add/remove

## Comments

- 2026-10-25:全量验证 vitest 16/16、eslint 0 错误、tsc+vite build 通过;BFF 八接口冒烟 200;浏览器回归:播放页切页签零请求/iframe 不重载、悬浮换集、搜索出结果、收藏增删、观看历史写入。GLOSSARY 新增 有界本地列表/数据访问 seam/normalize 层/上游适配层 词条。
