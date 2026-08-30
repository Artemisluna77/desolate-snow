# AGE BFF 接入说明

当前项目已经通过 Node.js BFF 接入 AGE 的公开实时接口。BFF 位于 server/index.mjs，前端只访问同源的 /api/agedm/*，不直接暴露 AGE API 的跨域细节。

## 本地启动

```bash
pnpm install
```

终端 A：

```bash
pnpm bff
```

终端 B：

```bash
pnpm dev
```

开发服务器默认运行在 5173，BFF 默认运行在 127.0.0.1:8787。Vite 会把 /api/agedm 转发到 BFF。生产环境先执行 pnpm build，再执行 pnpm start，BFF 会同时提供 dist 静态文件和 API。

可通过环境变量调整 BFF：

- BFF_HOST：监听地址，默认 127.0.0.1
- BFF_PORT：监听端口，默认 8787
- AGEDM_API_ORIGIN：上游 API 地址，默认 https://api.agedm.io

## 已接入接口

| BFF 路由                             | 用途                                 |
| ------------------------------------ | ------------------------------------ |
| /api/agedm/health                    | 服务健康检查                         |
| /api/agedm/home                      | 首页最近更新、推荐、放送表           |
| /api/agedm/catalog                   | 目录筛选、排序、分页                 |
| /api/agedm/update                    | 一周更新                             |
| /api/agedm/rank                      | 年份排行榜                           |
| /api/agedm/search                    | 关键词搜索                           |
| /api/agedm/detail/:id                | 动漫详情、系列、相关推荐、线路和选集 |
| /api/agedm/play/:id/:source/:episode | 获取当前选集的动态播放器入口         |

列表、首页和详情数据使用短时内存缓存；播放入口不缓存。上游失败时，列表和详情会优先返回本次进程内的过期缓存，前端没有缓存时再回退到原有静态快照。

## 播放边界

AGE 详情接口返回的是带时效参数的第三方播放器入口，而不是原始媒体文件。播放页因此嵌入 AGE 当前公开的播放器入口，由入口内的 ArtPlayer 负责实际播放；项目同时安装并封装了 artplayer@5.4.0，以后接入自有或已授权的 MP4/HLS 直链时，可通过 ArtPlayerVideo 播放。

BFF 不会提取、代理、重签名或改写第三方 CDN 媒体地址，也不会转发客户端 Cookie。若第三方播放器校验来源导致本地 iframe 无法播放，页面会提供对应 AGE 原站播放页链接；要在本站使用纯本地 ArtPlayer 播放，需要合法授权的直链或自有媒体服务。
