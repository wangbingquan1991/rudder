# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Rudder 是一个面向 AI 智能体团队的**编排与控制平台**，是自治 AI 组织的操作系统层。它将目标、任务、知识和工作流组织成可执行结构，使智能体能够在清晰的边界内工作、协作并推进工作。

**核心愿景**：成为自治经济的支柱，让由 AI 智能体组成的自治组织能够规模化运作，产生真实的经济产出。

## 常用命令

### 安装依赖
```bash
pnpm install
```

### 开发启动
```bash
pnpm dev                  # 启动完整开发环境（API + UI）
pnpm dev:server           # 仅启动服务端
pnpm dev:ui               # 仅启动前端
pnpm dev:reset            # 重置本地开发实例数据
```

### 类型检查
```bash
pnpm typecheck           # 全项目类型检查
pnpm -r typecheck        # 递归所有包类型检查
```

### 测试
```bash
pnpm test                # 交互模式运行测试
pnpm test:run            # 一次性运行所有测试
pnpm test:e2e            # 运行 Playwright E2E 测试
pnpm test:release-smoke  # 运行发布冒烟测试
```

### 构建
```bash
pnpm build               # 构建所有包
```

### 数据库
```bash
pnpm db:generate         # 生成 Drizzle 迁移（修改 schema 后运行）
pnpm db:migrate          # 执行迁移
pnpm db:backup           # 备份数据库
```

### 桌面应用验证
```bash
pnpm desktop:verify      # 完整桌面打包验证（修改桌面启动/迁移后必须运行）
```

### 单个测试运行
```bash
pnpm test -- <test-file>
```

### E2E 测试
```bash
pnpm test:e2e            # 运行 Playwright E2E 测试（无头模式）
pnpm test:e2e:headed     # 运行 Playwright E2E 测试（有头模式）
pnpm test:release-smoke  # 运行发布冒烟测试
pnpm test:release-smoke:headed # 运行发布冒烟测试（有头模式）
```

### 文档开发
```bash
pnpm docs:dev      # 启动公开文档网站本地开发
pnpm docs:validate # 验证公开文档
```

### 发布相关
```bash
pnpm release           # 发布版本
pnpm release:canary    # 发布 canary 版本
pnpm release:stable    # 发布 stable 版本
pnpm release:github    # 创建 GitHub 发布
```

### Run Intelligence 开发
```bash
pnpm run-intelligence:dev       # 启动 run-intelligence 开发
pnpm run-intelligence:build     # 构建 run-intelligence
pnpm run-intelligence:typecheck # 类型检查 run-intelligence
```

### 生产桌面构建
```bash
pnpm prod # 完整生产桌面构建验证
```

## 代码架构

### 工作区结构（pnpm workspace）

```
rudder/
├── server/                 # Express REST API 和核心编排服务
│   └── src/
│       ├── api/            # API 路由定义
│       ├── services/       # 业务逻辑服务
│       └── resources/      # 内置技能
├── ui/                     # React + Vite 看板 UI
│   └── src/
│       ├── components/     # 共享组件
│       ├── pages/          # 页面组件
│       ├── api/            # API 客户端
│       └── lib/            # 工具函数
├── cli/                    # CLI 命令行工具
├── desktop/                # 桌面应用包装
├── packages/
│   ├── db/                 # Drizzle ORM 数据模型和迁移
│   ├── shared/             # 共享类型、常量、验证器、API 路径常量
│   ├── agent-runtime-utils/ # 智能体运行时工具
│   ├── run-intelligence-core/ # 运行智能核心
│   ├── agent-runtimes/    # 各种智能体运行时适配器
│   │   ├── claude-local
│   │   ├── openclaw-gateway
│   │   ├── cursor-local
│   │   └── ...
│   └── plugins/           # 插件系统
│       ├── sdk/           # 插件开发 SDK
│       └── examples/      # 插件示例
├── services/              # 后台服务
├── doc/                   # 内部开发文档
└── docs/                  # 公开网站文档
```

### 核心数据模型（V1）

所有核心实体都**组织作用域隔离**（每个记录都属于一个组织）：

- `organizations` - 组织
- `agents` - AI 智能体（雇员），带运行时适配器配置
- `goals` - 目标层级结构（组织 → 团队 → 智能体 → 任务）
- `projects` - 项目
- `issues` - 核心任务实体
- `issueComments` - 任务评论
- `heartbeatRuns` - 心跳运行记录
- `costEvents` - 成本消费事件
- `approvals` - 审批流程
- `activityLog` - 审计活动日志（所有变更都记录）
- `assets` - 文件资产存储
- `documents` + `documentRevisions` - 可编辑文档
- `chatConversations` + `chatMessages` - 聊天会话

### 核心设计原则

1. **控制平面 vs 执行平面**：Rudder 只负责编排，智能体在外部运行并回报
2. **组织是第一单元**：一个实例可运行多个组织，所有记录都组织作用域隔离
3. **运行时中立**：不规定智能体如何构建，支持 process/http 适配器
4. **目标可追溯**：所有任务必须可追溯到组织目标
5. **完整审计**：所有变更都写入 `activityLog`

### 执行模型

- **心跳调度**：智能体按配置的间隔自动唤醒执行
- **原子任务检出**：使用乐观并发控制，冲突返回 409 防止竞态
- **预算强制**：达到月度预算硬限制自动暂停智能体，阻止新调用
- **两种运行时适配器**：
  - `process` - 本地派生进程执行
  - `http` - 外部 HTTP webhook 调用

## 开发快速开始

1. 开发环境无需外部 PostgreSQL，留空 `DATABASE_URL` 自动使用嵌入式 PostgreSQL
2. `pnpm install && pnpm dev` 启动后 API 和 UI 都在 `http://localhost:3100`
3. 重置本地开发实例：`pnpm dev:reset`
4. 健康检查：`curl http://localhost:3100/api/health`

## 文档导航

文档按受众分层：
- `docs/` - 公开网站文档，面向用户，基于使用场景
- `doc/` - 内部开发文档，面向项目贡献者

**开始新任务前按此顺序阅读：**
1. `doc/GOAL.md` - 项目目标和愿景
2. `doc/PRODUCT.md` - 产品定义和核心概念
3. `doc/SPEC-implementation.md` - V1 实现契约（必读）

**按工作类型选择文档：**
- 桌面应用、打包、安装器：`doc/DESKTOP.md` + `doc/DEVELOPING.md`
- 服务端/运行时/数据库：`doc/DEVELOPING.md` + `doc/DATABASE.md`
- CLI/任务接口：`doc/CLI.md` + `doc/TASKS.md` + `doc/TASKS-mcp.md`
- UI 交互设计：`doc/DESIGN.md`
- 插件开发：`doc/plugins/PLUGIN_AUTHORING_GUIDE.md` + `doc/plugins/PLUGIN_SPEC.md`
- 发布：`doc/RELEASING.md` + `doc/PUBLISHING.md`

**公开用户文档**在 `docs/` 目录。

## 核心工程规则

### 基本准则
- 保持组织作用域隔离：所有领域实体必须组织隔离，路由/服务中必须强制执行组织边界
- 保持契约同步：修改 schema/API 行为后，必须更新所有受影响层：`packages/db` → `packages/shared` → `server` → `ui`
- 保持控制平面不变量：单任务分配模型、原子任务检出语义、审批gate、预算硬停止自动暂停、所有变更活动日志
- 附加功能工作必须添加 E2E 测试覆盖
- 计划文档必须集中在 `doc/plans/`，使用 `YYYY-MM-DD-slug.md` 命名格式

### 数据库修改流程
1. 编辑 `packages/db/src/schema/*.ts`
2. 确保新表从 `packages/db/src/schema/index.ts` 导出
3. 生成迁移：`pnpm db:generate`
4. 验证编译：`pnpm -r typecheck`

### 提交前验证

必须运行以下检查后才能交付：
```bash
pnpm -r typecheck && pnpm test:run && pnpm build
```

任务特定附加检查：
- 桌面或打包应用变更：`pnpm desktop:verify`
- 功能或工作流变更：添加/更新相关 E2E 测试覆盖
- 可见 UI 变更：在浏览器/桌面 shell 中验证渲染结果

### API 和认证期望
- 基础路径：`/api`
- 代理键使用 `agent_api_keys`，存储哈希值
- 代理键必须不能跨组织访问
- 添加端点时必须：应用组织访问检查、强制执行角色权限、写入变更活动日志、返回一致的 HTTP 错误码

### UI 期望
When working on frontend or UI tasks, read DESIGN.md first and follow its design system.
- 路由和导航必须与可用 API 对齐
- 组织作用域页面必须使用组织选择上下文
- 错误必须清晰展示，不能静默忽略 API 错误
- 可见 UI 变更必须在交付前通过视觉验证

## Definition of Done

变更完成需要满足所有条件：
1. 行为符合 `doc/SPEC-implementation.md` 定义
2. 类型检查、测试和构建全部通过
3. 契约在 db/shared/server/ui 各层同步更新
4. 行为或命令变更时更新文档
5. 提交信息遵循约定式提交格式

## Agent skills

### Issue tracker

Issues are tracked as local markdown files in `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the five canonical label names directly. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout with one `CONTEXT.md` at root and `docs/adr/` for architectural decisions. See `docs/agents/domain.md`.
