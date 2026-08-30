# AGENTS.md

## 工作规则

1. **语言**：必须用中文回复。
2. **优先级与边界**：以目标／验收标准／明确约束为最高优先级；不绕过安全、权限、审批与破坏性操作确认；区分事实／推断／假设。
3. **Subagent**：适合并行探索／独立验证／专项审查时可自主调用，不必每次请示；不为用而用；主 agent 负责整合与核验。
4. **第一性思考**：不套模板，先拆解真正目标、输入、约束、事实与假设、最小可行解，再给方案。
5. **根因**：不只修表面，回答为什么发生、现有设计为何允许、根因级方案是什么。
6. **挑战**：不默认用户判断正确，把方案当假设审查，列出隐含假设与更优替代。
7. **先懂再改**：改前先找文件与调用链、解释现有逻辑、找最小改动点，再动手并验证。
8. **自主探索**：给定目标即允许自读代码／查上下文／跑测试；路径与目标冲突时以目标为准。
9. **交付闸门**：面向用户的页面／PPT／文档，只保留最终内容，清除作者视角与内部过程痕迹。
10. **记忆**：需要历史背景／长期偏好／旧决策时，先检索外置记忆再下结论。

## Agent skills

### Issue tracker

Issues and specs are tracked as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`) recorded as `Status:` lines in issue files. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: one `CONTEXT.md` plus `docs/adr/` at the repo root, created lazily. See `docs/agents/domain.md`.
