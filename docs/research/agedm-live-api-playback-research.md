# AGE动漫公开 API / 播放链路可行性研究

## 结论摘要

核验结论是“桌面端服务端 HTML + 移动端公开 JSON API 并存”。桌面端页面本身已经包含首页、目录、更新、排行榜、详情和播放页的可见数据或链接；移动端 `m.agedm.io` 的一手前端脚本则配置并调用公开的 `https://api.agedm.io/v2/` JSON 接口，覆盖首页、目录、更新、排行榜、详情和评论。

播放链路不是页面内直接暴露的裸 `m3u8`：详情 API 返回各播放源、剧集和 `age_...` 形式的不透明参数；播放页把该参数拼到 `https://jx.wuzhoupai.com:8443/vip/?url=...` 或 `/m3u8/?url=...` 的跨域 iframe。播放器页面源码可见 `Vurl`、Base64 编码的来源页 `Ref` 和数字 `Time`，但本次只读核验未继续追踪或请求底层媒体 URL，因此不能据此断言实际媒体 CDN、清单 URL 或有效期的精确规则。

明显的访问控制迹象包括：播放器对错误来源 Referer 返回“请勿错误调用!!!”；播放器参数每次播放页请求会变化；播放器页面存在时间字段和不透明参数；AGE API 的 CORS 只对 `https://m.agedm.io` 返回允许来源并带 credentials。未观察到主站响应下发 Cookie，也未进行登录、验证码、绕过或批量抓取。

## 核验范围与时间

- 核验时间：2026-08-31 00:36:11（北京时间，UTC+08:00；个别播放页请求在此时刻前后完成）。
- 核验方式：公开 GET 请求、公开 HTML/JavaScript 源码阅读、响应头观察和少量参数化页面验证；未使用登录态，未提交表单，未绕过验证码或访问控制。
- 取样详情页：<https://www.agedm.io/detail/20260218>；对应播放页：<https://www.agedm.io/play/20260218/1/1>。
- 说明：页面内容、版本号、剧集数量和签名参数会变化；以下是该核验时刻的现场结果。

## 1. 页面形态与公开 JSON/API

### 桌面端

以下 URL 均直接返回 `200 text/html; charset=UTF-8`，并带有页面标题和服务端渲染内容/链接：

| 页面 | URL | 现场观察 |
| --- | --- | --- |
| 首页 | <https://www.agedm.io/> | 返回约 127 KB HTML；源码含首页内容、`/catalog/...`、`/update`、`/rank` 和大量 `/detail/{AID}` 链接。 |
| 目录 | <https://www.agedm.io/catalog/all-all-all-all-all-time-1> | 标题“全部动漫”；源码含动漫卡片、详情链接和播放链接，例如 `/play/20260218/1/1`；未见页面内 JSON 数据块或 `m3u8` 媒体地址。 |
| 更新 | <https://www.agedm.io/update> | 标题“一周更新”；源码含更新列表详情链接；未见页面内 JSON 数据块或 `m3u8` 媒体地址。 |
| 排行榜 | <https://www.agedm.io/rank> | 标题“排行榜”；源码含排名条目详情链接；未见页面内 JSON 数据块或 `m3u8` 媒体地址。 |
| 详情 | <https://www.agedm.io/detail/20260218> | 标题为该动漫名称；源码含结构化 JSON-LD、多个播放源标签和每集 `/play/{AID}/{source}/{episode}` 链接。 |
| 播放 | <https://www.agedm.io/play/20260218/1/1> | 返回 HTML 播放壳；源码含一个跨域 `<iframe id="iframeForVideo" ...>`，而非主站 `<video src="...m3u8">`。 |

桌面端 HTML 中存在 `https://www.agedm.io/api/comment/20260218`、`https://www.agedm.io/api/feedback` 等辅助接口引用；它们不是首页、目录、更新、排行榜或详情主数据接口。`/api/feedback` 在无表单数据 GET 下返回 JSON `{"code":0,"message":"操作失败：","data":[]}`，说明该接口可公开到达，但不代表允许匿名写入。

### 移动端公开 API

一手前端入口：<https://m.agedm.io/>；入口源码加载 <https://xcdn.aiqingyu1314.com:8443/agem/js/app.5863df3f.js>。该脚本明文配置 `baseURL: "https://api.agedm.io/v2/"`，并通过公开懒加载 chunk 调用下列路径：

| 功能 | 公开 API | 现场结果 |
| --- | --- | --- |
| 首页 | <https://api.agedm.io/v2/home-list> | `200 application/json`；顶层 `latest`、`recommend`、`week_list`，本次分别为 12、12 和 7 个星期键。 |
| 目录 | <https://api.agedm.io/v2/catalog?page=1&size=20> | `200 application/json`；顶层 `total`、`videos`，本次 `total=5572`、返回 20 条。 |
| 更新 | <https://api.agedm.io/v2/update?page=1&size=20> | `200 application/json`；顶层 `total`、`videos`，本次 `total=5572`、返回 20 条。 |
| 排行榜 | <https://api.agedm.io/v2/rank?year=2026> | `200 application/json`；顶层 `total`、`rank`、`year`，本次 3 个榜组、`total=50`。 |
| 详情 | <https://api.agedm.io/v2/detail/20260218> | `200 application/json`；顶层 `video`、`series`、`similar`、`player_label_arr`、`player_vip`、`player_jx`。 |
| 评论（辅助） | <https://api.agedm.io/v2/comment/20260218/?page=1> | `200 application/json`；本次返回分页评论数据。 |

因此，对“是否存在公开 JSON/API”的回答是：桌面端主页面表现为服务端 HTML，但移动端存在可直接 GET 的公开 JSON API；不能将桌面端的 HTML 形态推断为整个站点没有 API。

## 2. 详情页与播放器的真实结构

详情页现场源码包含 5 个播放源分组：`xigua`、`ffm3u8`、`bfzym3u8`、`wjm3u8`、`lzm3u8`；每组是主站自己的播放路由，例如：

```text
/play/20260218/1/1
/play/20260218/2/1
/play/20260218/3/1
/play/20260218/4/1
/play/20260218/5/1
```

详情 API 的 `video.playlists` 同样返回上述源键，每集值形如：

```text
["第01集", "age_<不透明参数>"]
```

为避免把可能短时有效的播放参数固化进研究文档，以上只保留结构，不保留完整签名值。详情 API 同时返回：

```json
{
  "player_jx": {
    "vip": "https://jx.wuzhoupai.com:8443/vip/?url=",
    "zj": "https://jx.wuzhoupai.com:8443/m3u8/?url="
  }
}
```

桌面播放页实际输出的 iframe 结构为：

```html
<iframe id="iframeForVideo" src="https://jx.wuzhoupai.com:8443/vip/?url=age_<不透明参数>" allowfullscreen="allowfullscreen"></iframe>
```

切换到非 VIP 播放源时，路径现场为 `https://jx.wuzhoupai.com:8443/m3u8/?url=age_<不透明参数>`；播放器入口基址为 <https://jx.wuzhoupai.com:8443/vip/>，实际查询参数因动态且可能短时有效而脱敏。该页面返回 `200 text/html; charset=utf-8`，标题“云播放器”，并加载一手播放器脚本：

- <https://xcdn.aiqingyu1314.com:8443/jx/20230723ver/Play/global.min.js?v=20260512>
- <https://xcdn.aiqingyu1314.com:8443/jx/20230723ver/Play/play.min.js?v=20260512>

播放器 HTML 可见的字段包括：`Ref`（Base64 后的 AGE 播放页 URL）、`Time`（数字时间字段）、`Vurl`（长十六进制样式不透明值）、`PlayConfig.Url=Vurl`，以及广告用的 `adposter.mp4`。在该播放器 HTML 中没有发现直接可用的 `video` 标签媒体 URL 或字面量 `.m3u8` 清单；`m3u8` 主要体现在主站源标签、主站 `/m3u8/` 播放器路径和 API 的播放源键中。

移动端播放 chunk <https://xcdn.aiqingyu1314.com:8443/agem/js/chunk-c59e3cd2.eecd4df7.js> 的一手逻辑进一步表明：先请求 `detail/{AID}`，再按源索引取得 `video.playlists` 中的 opaque 值；若源属于 `player_vip`，拼接 `player_jx.vip`，否则拼接 `player_jx.zj`，随后把结果设置为 `playerIFrame` 的播放 URL。这是对调用链的源码核验，不是对底层视频资源的解密或提取。

## 3. 跨域、Referer、Cookie、短时签名与防盗链迹象

### 跨域 / CORS

- `https://api.agedm.io/v2/home-list`、目录、更新、排行榜和详情 API 在带 `Origin: https://m.agedm.io` 请求下均返回 `Access-Control-Allow-Origin: https://m.agedm.io` 和 `Access-Control-Allow-Credentials: true`。
- 同一 API 在带 `Origin: https://example.com` 或不带 Origin 时仍可由命令行直接 GET 返回 `200`，但不返回 `Access-Control-Allow-Origin`；这意味着“资源可被直接 HTTP 请求”与“可被任意浏览器页面跨域读取”不同，浏览器跨域读取受到限制。
- 主站播放页响应带 `X-Frame-Options: SAMEORIGIN`；但实际嵌入的播放器是 `jx.wuzhoupai.com`，该播放器响应本次未返回 `X-Frame-Options`，并在测试响应中返回 `Access-Control-Allow-Origin: *`。这只说明 iframe 页面响应头现状，不等于底层媒体资源也允许任意跨域。

### Referer / 防盗链

使用同一个刚由公开播放页生成的 iframe URL进行只读对比：

- 不带 Referer：播放器返回 `200`，约 5 KB HTML。
- Referer 为真实 AGE 播放页：播放器返回 `200`，约 5 KB HTML。
- Referer 为 `https://example.com/`：播放器返回 `200`，正文为 `请勿错误调用!!!`，仅 21 字节。

这是明显的来源校验/防盗链迹象。它至少保护播放器入口不被任意外站 Referer 调用；由于无 Referer 在本次测试仍可返回播放器 HTML，不能推断其是“必须有 Referer”的严格策略。

### Cookie、签名与时间字段

- 主站首页、详情页、播放页本次响应均未观察到 `Set-Cookie`；移动 API 和播放器测试响应也未观察到 `Set-Cookie`。主站公开 JavaScript 仍包含客户端 Cookie/localStorage 逻辑，用于登录、历史或清净模式，这不等于匿名播放依赖 Cookie。
- 同一播放页连续请求得到的 iframe `url=age_...` 值不同，表明播放参数至少具有动态生成特征；详情 API 中各集的 `age_...` 值也是长的不透明参数，而不是裸 URL。
- 播放器 HTML 的 `Time` 字段在现场为数字 Unix 时间样式，且与 `Ref`、`Vurl` 一起参与播放器配置。它强烈提示存在时间/签名校验，但本次没有等待失效、篡改参数或请求底层媒体来证明具体 TTL、签名算法或绑定维度，因此这些属于推断，不是已证明的有效期结论。

## 不确定性与可行性判断

1. 若目标是“读取首页、目录、更新、排行榜和详情元数据”，公开移动 API 已足够形成可行性基础；接口路径、返回 JSON 和关键字段均现场确认。
2. 若目标是“稳定取得可播放媒体 URL”，当前公开证据只能确认到 `AGE API -> age_opaque -> jx iframe`；没有在不绕过访问控制的前提下确认最终 `.m3u8`、媒体域名、签名 TTL、Referer 传递方式或分片级鉴权。
3. 播放参数和页面内容明显是动态的，且播放器有来源校验；任何长期缓存、跨站前端直连或脱离原播放页复用的方案都应视为高风险假设，需另行获得授权并在合规范围内验证。
4. 本文不构成对版权、服务条款或内容授权的判断；研究仅记录公开技术表面和现场响应。
