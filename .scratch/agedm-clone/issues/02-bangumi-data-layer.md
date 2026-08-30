# 02 — Bangumi 数据层

**What to build:** 应用具备从 Bangumi 官方 API 取真实数据的能力:条目搜索、条目详情、每日放送日历三类接口经适配器映射为统一领域模型(番剧/分集/放送/筛选查询),上层页面不感知外部字段差异;离线或接口异常时回退到本地 mock 数据,页面仍有内容可演示。

**Blocked by:** 01

**Status:** resolved

- [x] 领域模型类型定义:番剧、分集、放送表条目、目录筛选查询(8 维 + 排序)
- [x] Bangumi 适配器:搜索/详情/每日放送三接口,外部字段到领域模型的映射集中收口
- [x] TanStack Query 查询封装,含加载/错误态
- [x] Vite 代理配置解决开发期跨域
- [x] mock 数据源可切换,接口失败时兜底
- [x] 演示路由或脚本可验证取到真实数据并渲染为领域模型

## Comments

- 2026-08-30:经真实 API 探测校准字段(v0 subject 用 `date`/`rating.rank`/`infobox`,calendar 条目字段较少需兼容映射;episodes 端点对无分集条目返回 404,已容错)。dev server 验证:首页 200、`/api/bgm/calendar` 与 `/v0/search/subjects` 代理均返回真实数据。`VITE_DATA_SOURCE=mock` 可强制 mock;直连失败自动回退 mock。8 维筛选中地区/版本/状态/首字母在 Bangumi 无过滤能力,模型中保留字段并在目录页 UI 标注。
