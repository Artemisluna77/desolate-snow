# 08 — 播放页

**What to build:** 用户从详情页选择某线路某集进入播放页,可观看视频(演示视频源),页面提供:线路切换、上一集/下一集、选集侧栏;切换集数时 URL 同步变化,可直接分享定位。观看行为(番剧/集数/时间)写入本地观看历史,供「观看历史」页展示。

**Blocked by:** 06

**Status:** resolved

- [x] `PlaybackProvider` 接口抽象 + 默认演示视频实现(公共演示片源)
- [x] 线路切换与选集侧栏,状态与 URL 同步
- [x] 上一集/下一集导航,首尾集边界处理
- [x] 播放页内返回详情页入口
- [x] 观看历史写入本地存储(去重、按时间倒序)

## Comments

- 2026-08-30:浏览器验证播放器/线路切换/选集侧栏渲染正常,视频用 gtv-videos-bucket 公共演示片。观看历史按番剧维度去重(保留最新集数),watchedAt 倒序,上限 50 条。
- 2026-09-01:修复切浏览器页签回来后播放器从头重播。根因:AGE 播放 token 每次解析都不同,而 playback 查询 staleTime:0 + 默认 refetchOnWindowFocus,切回页签即 refetch 换新 token,iframe src 变化导致播放器重载。修复:playback 查询关闭 refetchOnWindowFocus/refetchOnReconnect(播放会话内不换源);BFF /play 复用 detail 5 分钟缓存保证解析幂等(兜底任何重取路径)。Playwright 模拟 visibilitychange 回路验证:修复前二次请求+src 变化(红),修复后无请求+src 不变(绿)。
