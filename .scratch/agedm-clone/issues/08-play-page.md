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
- 2026-09-03:播放页对齐 www.agedm.io/play 布局,重写为官方同款全宽堆叠五段式:播放器(右侧悬浮"切换下一集")→ 统计行+封面/元信息/简介卡 → 在线播放(线路 tab + 更改排序 + 选集网格,当前集高亮)→ 评论区 → 相关推荐(6 列网格)。官方评论区依赖其账号体系,按项目本地化惯例(ticket 10)实现本地评论(zustand persist,仅本机浏览器),支持发布/删除/清净模式;官方"用手机观看/反馈"为账号功能,未对齐。浏览器验证:五模块渲染、排序/评论/清净模式/悬浮换集交互正常,切页签修复无回退。
- 2026-09-03:三项细节对齐(实测官方 DOM/main.css 后复刻):①信息面板 10 个元信息字段两列排布(官方为 inline-block min-width:50% 流式,本地用 grid 两列等效,左列 5 个右列 5 个);②相关推荐固定 12 条 6 列×2 行(上游 similar 仅 6 条,官方也是 6 条+随机补位,本地用 AGE_DETAIL_RECOMMENDATIONS 池去重补足);③全局 Backtop 组件挂 RootLayout(官方 side-tools-gototop:滚动>300px 显示,52×52,bottom 116px,位置等价换算为 right:max(12px,calc(50%-622px)),默认/hover 箭头图 base64 与官方逐字节一致),点击平滑回顶。浏览器验证:字段左右列与官方截图一致、推荐 12 条两行、backtop 顶部隐藏/滚动出现/点击回顶。
- 2026-09-03:修复 backtop hover 不生效:误写成 background-image:url(...) no-repeat,值不合法整条声明被浏览器丢弃;改为官方同款 background 简写。Playwright hover 实测 computed background-image 在灰/红两图间切换,截图确认常态灰箭头、悬停红箭头。教训:校验了 base64 字节但没验证 hover 计算样式,以后样式对齐要连伪状态一起断言。
- 2026-09-03:消除 hover 灰色动画并对齐官方瞬时切换。①按钮补 appearance:none(官方是 div,button 在 Windows Chrome 有原生灰色悬停高亮)+transition/animation:none;②修掉重构时手抄损坏的 hover base64(2384/2752 字符,解码异常导致悬停渲染成灰块),改用脚本从官方 CSS 程序化提取替换。验证:悬停前后截图逐字节对比有像素差异且悬停为红箭头、切换瞬时无过渡帧。教训:长 base64 一律程序化搬运、每次改动后立即复验;Playwright 的 hover/click 有 actionability 自动滚动,验证 fixed 元素要用 mouse.move。
