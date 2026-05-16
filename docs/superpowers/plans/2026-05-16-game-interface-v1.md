# Who is AI 对局界面 v1.0 实施计划

> 设计源头：`docs/superpowers/specs/2026-05-16-game-interface-v1-design.md`

## 目标

把现有三栏对局界面升级到 v1.0：左侧完整用户状态板，中间四个差异化阶段主卡，右侧常驻用户档案。保持 Next.js/React/shadcn/ui 体系，不引入 Phaser 或 canvas 游戏引擎。GSAP 只用于关键反馈，且必须 cleanup。

## 非目标

- 不改游戏规则、Colyseus 命令、角色分配或结算逻辑。
- 不引入圆桌 2.5D、暖色桌游皮肤或后台管理风格。
- 不在左侧/中间/右侧重复同一组用户候选卡。
- 不做大规模自定义 CSS 动画系统。

## 技术路线

- 浏览器游戏分类：React/Next DOM UI + 游戏 HUD，不切换引擎。
- 视觉实现：shadcn primitives + Tailwind layout utilities + existing semantic tokens。
- 动效实现：CSS transition 优先；GSAP 仅用于 reveal、message、vote confirmation。
- 验证：typecheck、lint、web unit tests、full-game e2e、Playwright visual smoke。

## Task 1：扩展 View Model

文件：

- `apps/web/src/components/game/gameViewModel.ts`
- `apps/web/src/components/game/gameViewModel.test.ts`

新增 helpers：

- `getPlayerSpeechCount(snapshot, playerId)`
- `getPlayerMentionCount(snapshot, player)`
- `getPlayerVoteCount(snapshot, playerId)`
- `getPlayerStatusSummary(snapshot, player, currentSessionPlayer, selectedTargetId)`
- `getDefaultDossierTab(snapshot.phase)`
- `getVoteGraphNodes(players, currentSessionPlayer, selectedTargetId)`
- `getVoteGraphEdges(snapshot)`

验收：

- 单测覆盖提交、发言、提及、票数、debug AI 名称遮蔽、投票节点/箭头。

## Task 2：左侧 PlayerStatusPanel

文件：

- `PlayerColumns.tsx` 可改名/扩展为 `PlayerStatusPanel.tsx`
- `PlayerStatusCard.tsx`
- locale messages

功能：

- 左侧显示所有玩家。
- 卡片展示编号、公开昵称、你、阶段状态、发言次数、被提及/被疑次数、票数、当前选择。
- 状态点使用 green/yellow/red/gray 语义。
- 左栏底部图例。
- 点击只更新 `selectedPlayerId`，不改变 phase。

验收：

- 桌面 E2E 确认左栏包含所有 debug players。
- 点击玩家后右侧档案内容更新。

## Task 3：右侧 InvestigationPanel 强化

文件：

- `InvestigationPanel.tsx`
- locale messages

功能：

- 常驻右栏，不再使用 Sheet 作为桌面默认。
- Tabs：玩家、答案、发言、投票、历史。
- 答题准备阶段展示本轮任务/回答提示/轮次信息。
- 其他阶段跟随 `selectedPlayerId` 或投票目标。
- 默认 tab 由 phase 派生：答题=历史/玩家，揭晓=答案，讨论=发言，投票=投票。

验收：

- 右栏高度与左栏/中栏一致。
- 内容内部滚动，不推动页面高度。

## Task 4：AnswerPrepCard

文件：

- `AnswerPanel.tsx` 或新建 `AnswerPrepCard.tsx`

功能：

- 问题卡 + 回答纸。
- 参考维度 chips：具体经历、取舍理由、真实情绪、细节补充。
- 字数计数 `0 / 500`。
- 提交按钮白底黑字；提交后显示已提交和修改/撤回。
- 提交统计 `N/M`。

验收：

- 保留 `answer-input` 和 `submit-answer` test IDs。
- 输入/提交流程不变。

## Task 5：AnswerRevealCard

文件：

- `RevealPanel.tsx` 或新建 `AnswerRevealCard.tsx`

功能：

- 答案卡墙。
- 当前选中答案详情。
- 可疑标签 chips。
- 上一条/下一条。
- 点击答案卡更新 selected player/right panel。

动效：

- 答案卡 stagger reveal。
- 选中卡亮边。

验收：

- 不暴露 AI 身份。
- 右侧档案跟随选中答案用户。

## Task 6：DiscussionCard

文件：

- `DiscussionPanel.tsx` 或新建 `DiscussionCard.tsx`

功能：

- 焦点用户摘要。
- 相关发言优先，fallback 为近期讨论。
- 发言输入。
- 快捷回应：同意、质疑、追问、举例，点击填入输入框前缀或短句。

动效：

- 新消息轻微 fade/up。

验收：

- 保留 `chat-input` 和 `send-chat` test IDs。
- 发送消息流程不变。

## Task 7：VotingDecisionCard

文件：

- `VotePanel.tsx` 或新建 `VotingDecisionCard.tsx`
- 可新增 `VoteRelationGraph.tsx`

功能：

- 中间使用投票关系图，不重复候选卡列表。
- 用户节点按玩家数量环形/多边形排列。
- 当前用户白色外圈，当前选择红色外圈，已投显示勾。
- 已投 ballot 画箭头；未投显示等待点。
- 当前选择摘要和二步确认按钮。

动效：

- 选择目标 scale 1.02。
- 确认投票后箭头从当前用户指向目标。
- 票数弹跳一次。

验收：

- 保留 `vote-option-N` test IDs，可挂在节点按钮上。
- 保留 `cast-vote` test ID。
- 完整 E2E 仍能投给 4 号。

## Task 8：TopBar 阶段轨道细化

文件：

- `TopStatusBar.tsx`

功能：

- 阶段显示符号：已完成 `✓`，当前 `●`，未开始 `○`。
- 最后 10 秒可加克制 pulse，但需 respect reduced motion。

验收：

- `phase-name` 保留。

## Task 9：动效边界

文件：

- `usePhaseTransition.ts`
- `useRevealTimeline.ts`
- 可新增 `useMessageReveal.ts`
- 可新增 `useVoteConfirmationMotion.ts`

规则：

- GSAP 使用 `autoAlpha`、`x/y`、`scale`。
- 使用 `gsap.context()`。
- cleanup 时 `context.revert()`。
- `clearProps` 清除 inline transform/opacity/visibility。
- reduced motion 直接跳过。

## Task 10：测试与浏览器验证

测试：

- `npm.cmd run typecheck -w apps/web`
- `npm.cmd run lint -w apps/web`
- `npm.cmd run test -w apps/web`
- `npm.cmd run test:e2e -- tests/e2e/full-game.spec.ts`

浏览器验证：

- 1440x900 desktop：左/中/右三列同高，右侧档案常驻。
- 900x780 tablet-ish：玩家横条可用，右侧档案不挤压主任务。
- 投票阶段：中间是关系图，非候选卡列表。
- 检查 console errors/warnings。

## 提交边界

1. docs: `docs: specify game interface v1`
2. view-model/status panel: `feat(web): enrich game player status model`
3. investigation/stage shell: `feat(web): refine game three-column shell`
4. phase cards: `feat(web): differentiate game stage cards`
5. voting graph/motion: `feat(web): add voting relation graph`
6. tests/polish: `test(e2e): cover game interface v1`
