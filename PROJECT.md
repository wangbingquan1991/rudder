# Rudder: 自治 AI 组织操作系统

> Collaborate with agents the way humans work together.

## 1. 🚀 项目简介

**Rudder** 是面向 **AI 智能体团队**的**编排与控制平台**，是**自治 AI 组织的操作系统层**。

项目核心愿景：**成为自治经济的支柱**，让由 AI 智能体组成的自治组织能够规模化运作，产生真实的经济产出。

一句话核心价值：用人类公司的组织逻辑管理 AI 协作，替代单一巨型共享 prompt。当 AI 协作从单次对话进化到长期团队协作时，Rudder 提供了必要的结构化框架。

## 2. ❓ 为什么需要 Rudder？

### 当前 AI 协作的痛点

当 AI 智能体工作从"单次对话"变成"持续团队协作"，三个问题很快变得突出：

1. **上下文爆炸**：所有工作挤在一个共享对话里，上下文窗口很快耗尽，难以维护
2. **缺乏分工协作**：没有明确的角色分工和责任边界，多个 AI 同时修改同一份代码容易产生冲突
3. **没有质量控制**：缺乏审批流程，低质量输出直接进入下一环节
4. **成本不可见**：token 消耗去哪里了无法追踪，难以控制预算
5. **难以规模化**：扩展到几十个 AI 智能体协作时，乱作一团

### Rudder 的解决方案

Rudder 借鉴了**成熟的人类公司组织模式**，为 AI 智能体协作提供结构化框架——就像人类公司通过组织层级、角色分工、审批流程来规模化协作一样，AI 团队也需要同样的管理模式。

## 3. 💡 核心设计思想

### 核心哲学

AI 智能体就像公司雇员，需要**明确的角色、目标和任务**，而不是所有人挤在一个会议室里共享同一个对话。

### 设计原则

| 原则 | 说明 |
|------|------|
| **分层目标** | 从公司顶级目标拆解到每个任务的具体交付物，所有任务可追溯来源 |
| **角色分工** | 不同 AI 智能体承担不同角色，专业化分工提高产出质量 |
| **明确边界** | 每个任务有明确的输入输出和验收标准，避免模糊 |
| **流程控制** | 必要的审批环节保证质量，不合格输出打回重写 |
| **可审计可追溯** | 所有操作都留下审计日志，支持回溯和问题定位 |
| **预算约束** | 在组织/雇员/任务多个层级强制成本上限，不超支 |
| **运行时中立** | 不绑定特定 AI 模型或运行环境，支持多种本地/云运行时 |

## 4. 📚 核心概念

Rudder 使用一套源自人类组织的词汇体系来描述 AI 协作：

| 概念 | 定义 |
|------|------|
| **组织 (Organization)** | 顶级隔离单元，对应一个自治 AI 组织或团队。一个 Rudder 实例可以运行多个组织，**所有数据按组织完全隔离**。 |
| **雇员 (Agent Employee)** | 加入组织的 AI 智能体，每个雇员有特定角色、系统提示词、能力权限和运行时配置。 |
| **角色 (Role)** | 定义雇员的职责范围、系统提示词模板、能力权限。 |
| **目标 (Goal)** | 组织要达成的高阶目标，可以向下拆解为子目标，形成目标树。所有任务必须可追溯到顶层目标。 |
| **任务/问题 (Issue)** | 可执行的最小工作单元，由特定雇员认领完成。对应人类公司中的"工作项"。 |
| **心跳调度 (Heartbeat)** | 自动调度机制，按配置间隔定期唤醒智能体检查待办任务并推进工作，保持工作流持续流动。 |
| **原子检出 (Checkout)** | 同一时间只允许一个雇员处理一个任务，使用乐观并发控制防止竞态。 |
| **预算 (Budget)** | 在组织/雇员/任务多个层级设定 token 成本上限，达到上限后自动暂停，强制控制不超支。 |
| **审批流 (Approval)** | 任务完成后需要上级审批才能关闭，保证交付质量。 |
| **审计日志 (Audit Log)** | 完整记录所有操作和决策，支持追溯和分析。 |
| **运行时 (Runtime)** | AI 智能体的执行环境适配器，支持 process（本地进程）和 http（外部 webhook）两种模式。 |

### 人类组织 vs Rudder 映射表

| 人类公司模式 | Rudder 等价物 |
|-------------|---------------|
| 公司使命 | 组织目标 |
| 雇员 | AI 智能体 |
| 组织结构图 | 智能体汇报结构 |
| 工作所有权 | Issue 和分配 |
| 团队工作流 | 工作流定义和执行路径 |
| 运营记忆 | 知识、评论、日志和活动历史 |
| 经理检查 | 智能体心跳 |
| 高管评审 | 董事会审批 |
| 预算纪律 | 消费跟踪和硬停止 |

## 5. 🏗️ 技术架构总览

### 5.1 整体架构图

```mermaid
graph TB
    subgraph "用户接入层"
        UI[React 看板 UI<br/>http://localhost:3100]
        CLI[CLI 命令行工具]
        Desktop[Electron 桌面应用]
    end

    subgraph "服务层"
        Server[Express API 服务]
        Orchestrator[核心编排引擎]
        Scheduler[心跳调度器]
        Budget[预算控制器]
        Audit[审计日志]
    end

    subgraph "数据层"
        DB[(PostgreSQL<br/>/ 嵌入式 PG)]
        Drizzle[Drizzle ORM]
    end

    subgraph "AI 运行时层"
        RT1[Claude Code 本地]
        RT2[Cursor 本地]
        RT3[Gemini 本地]
        RT4[OpenAI / Codex]
        RT5[OpenClaw 网关]
        RT6[OpenCode 本地]
        RT7[PI 本地]
    end

    subgraph "插件扩展层"
        Plugin[插件 SDK]
        Custom[自定义插件]
    end

    UI --> Server
    CLI --> Server
    Desktop --> Server
    Server --> Orchestrator
    Orchestrator --> Drizzle
    Drizzle --> DB
    Orchestrator --> Scheduler
    Orchestrator --> Budget
    Orchestrator --> Audit
    Orchestrator --> RT1 & RT2 & RT3 & RT4 & RT5 & RT6 & RT7
    Orchestrator --> Plugin
    Plugin --> Custom
```

### 5.2 技术栈说明

| 层级 | 技术栈 |
|------|--------|
| **语言** | TypeScript 5.9 (全栈 TypeScript) |
| **包管理** | pnpm 9.15.4 (pnpm workspace monorepo) |
| **后端** | Node.js >= 20 + Express 5.2.1 |
| **ORM** | Drizzle ORM 0.38.4 |
| **数据库** | PostgreSQL，支持**嵌入式 PostgreSQL**（开发/桌面无需外部数据库） |
| **验证** | Zod 3.25 |
| **前端** | React 19.2 + Vite 6.4 + TailwindCSS 4.2 |
| **桌面端** | Electron 37 + electron-builder |
| **认证** | better-auth |
| **实时** | WebSocket (ws 8.20) |
| **测试** | Vitest 3.2 + Playwright (E2E) |
| **授权** | Apache 2.0 |

## 6. 📁 项目目录结构

Rudder 使用 **pnpm workspace monorepo** 结构：

```
rudder/
├── cli/                    # CLI 命令行工具
│   └── src/
│       ├── commands/       # 各种 CLI 命令（onboard, configure, doctor, heartbeat 等）
│       ├── agent-runtimes/ # CLI 运行时注册表
│       └── prompts/        # 交互式提示
├── server/                 # Express API 和核心编排服务
│   └── src/
│       ├── routes/         # 31 个 API 路由模块
│       ├── services/       # 80+ 业务服务模块（核心逻辑）
│       ├── agent-runtimes/ # 服务端运行时集成
│       ├── middleware/    # Express 中间件
│       ├── bootstrap/      # 启动初始化
│       └── resources/      # 内置技能
├── ui/                     # React + Vite 看板 UI
│   └── src/
│       ├── components/     # 150+ 可复用组件
│       ├── pages/          # 70+ 页面组件
│       ├── api/            # API 客户端
│       ├── lib/            # 工具函数
│       ├── context/        # React 上下文
│       └── hooks/          # 自定义 Hooks
├── desktop/                # Electron 桌面应用包装
│   ├── src/
│   │   ├── main.ts         # Electron 主进程入口
│   │   ├── boot-screen.ts  # 启动页面
│   │   ├── cli-link.ts     # CLI 链接管理
│   │   └── ide-opener.ts   # IDE 集成（打开工作区/文件）
│   └── build/              # 构建配置
├── packages/
│   ├── shared/             # 共享类型、常量、验证器、API 路径常量
│   ├── db/                 # Drizzle ORM 数据模型和数据库迁移
│   ├── agent-runtime-utils/ # 智能体运行时工具库（计费、模型降级、会话压缩
│   ├── agent-runtimes/     # 各种智能体运行时适配器
│   │   ├── claude-local    # Claude Code 本地运行时
│   │   ├── cursor-local    # Cursor 编辑器本地运行时
│   │   ├── codex-local      # OpenAI Codex 本地
│   │   ├── gemini-local     # Google Gemini 本地
│   │   ├── openclaw-gateway # OpenClaw 网关
│   │   ├── opencode-local  # OpenCode 本地
│   │   └── pi-local         # Perplexity PI 本地
│   ├── run-intelligence-core/ # 执行追踪分析、诊断、基准测试
│   └── plugins/            # 插件系统
│       ├── sdk/            # 插件开发 SDK
│       ├── create-rudder-plugin # 插件脚手架工具
│       └── examples/        # 插件示例
├── services/               # 独立后台服务
│   └── run-intelligence/   # 运行智能服务
├── doc/                    # 内部开发文档（贡献者）
├── docs/                   # 公开用户文档（网站）
├── tests/
│   ├── e2e/               # Playwright E2E 测试
│   └── release-smoke/      # 发布冒烟测试
├── scripts/               # 构建、发布、开发辅助脚本
├── pnpm-workspace.yaml     # pnpm workspace 配置
└── package.json           # 根目录配置和脚本
```

## 7. ✨ 核心功能模块

| 模块 | 功能描述 |
|------|----------|
| **组织隔离** | 一个实例可运行多个组织，所有数据按组织完全隔离，互不干扰 |
| **智能体雇员管理** | 添加/管理 AI 雇员，分配角色、汇报关系、配置运行时 |
| **目标层级追溯** | 支持从顶级组织目标层层拆解到具体任务，任何任务都可向上追溯来源 |
| **心跳自动调度** | 后台自动定期唤醒待推进任务，保持工作流持续推进，无需人工干预 |
| **原子任务检出** | 使用乐观并发控制，同一时间只允许一个雇员处理一个任务，避免冲突 |
| **预算强制控制** | 在组织/雇员/任务多个层级设置 token 成本上限，超支自动暂停执行 |
| **完整审计日志** | 所有操作全记录，包括谁在什么时候做了什么修改，支持回溯和分析 |
| **审批流程** | 任务完成后需要上级审批才能关闭，保证输出质量，不合格打回重写 |
| **运行时中立** | 不绑定特定 AI 供应商，支持 process/http 两种适配器，可接入任何 AI |
| **可视化看板** | React 看板直观展示所有组织、目标、项目、任务、进度状态 |
| **文档知识管理** | 内置组织知识库管理，支持版本化文档，供 AI 雇员检索参考 |
| **插件系统** | 开放插件 SDK，支持第三方扩展自定义能力和外部系统集成 |

## 8. 🚀 开发者快速入门

### 前置要求

- Node.js >= 20
- pnpm >= 9.0
-（可选）外部 PostgreSQL 如果不使用嵌入式

### 克隆与安装

```bash
git clone https://github.com/Undertone0809/rudder.git
cd rudder
pnpm install
```

### 环境配置

复制 `.env.example` 到 `.env`：

```bash
cp .env.example .env
```

关键环境变量：
- `DATABASE_URL` - PostgreSQL 连接字符串（留空自动使用嵌入式 PostgreSQL）
- `NODE_ENV` - `development` 或 `production`
- `HOST` - 监听地址，默认 `0.0.0.0`
- `PORT` - 端口，默认 `3100`
- `ANTHROPIC_API_KEY` - Claude API 密钥（使用 claude-local 运行时需要）
- `OPENAI_API_KEY` - OpenAI API 密钥（使用 codex-local 需要）
- `GOOGLE_API_KEY` - Google API 密钥（使用 gemini-local 需要）

### 数据库初始化

如果修改了数据模型 schema，需要生成并执行迁移：

```bash
# 生成 Drizzle 迁移（修改 schema 后运行）
pnpm db:generate

# 执行迁移
pnpm db:migrate
```

开发模式下，如果留空 `DATABASE_URL`，Rudder 会自动启动**嵌入式 PostgreSQL**，不需要你手动安装。

### 启动开发模式

```bash
# 启动完整开发环境（后端 + 前端）
pnpm dev
```

开发启动后访问：http://localhost:3100

如果你只想单独启动：

```bash
# 仅启动后端服务
pnpm dev:server

# 仅启动前端 UI
pnpm dev:ui
```

### 重置本地开发实例

如果你想清空本地开发数据重新开始：

```bash
pnpm dev:reset
```

### 类型检查和测试

```bash
# 全项目类型检查
pnpm typecheck

# 运行测试
pnpm test:run

# 构建所有包
pnpm build
```

## 9. 📦 部署与运行选项

### 选项一：本地桌面应用（推荐个人使用）

**特点：**
- 本地优先，数据完全存储在你的机器上
- 内置嵌入式 PostgreSQL，**不需要单独安装 PostgreSQL**
- 自包含应用，所有依赖打包在一起
- 通过系统托盘快速访问
- CLI 集成，终端命令可与桌面实例交互

**快速启动：**
```bash
npx @rudderhq/cli@latest start
```

这会下载最新版本的 Rudder Desktop，配置好 CLI 链接，然后启动应用。

**从源码构建桌面应用：**
```bash
pnpm desktop:build
pnpm desktop:dist
pnpm desktop:verify  # 冒烟测试验证构建
```

### 选项二：云端服务器部署（团队使用）

**特点：**
- 多成员通过网页访问
- 数据集中存储在云端 PostgreSQL
- 支持团队协作

**部署步骤：**

1. 准备环境：
   - 服务器（VPS 或云服务器）
   - 外部 PostgreSQL 数据库
   - Node.js >= 20

2. 克隆构建：
```bash
git clone https://github.com/Undertone0809/rudder.git
cd rudder
pnpm install
pnpm build
```

3. 配置环境变量 `.env`：
```
DATABASE_URL=postgresql://user:password@host:port/dbname
NODE_ENV=production
```

4. 运行迁移：
```bash
pnpm db:migrate
```

5. 创建首个管理员邀请：
```bash
pnpm rudder auth bootstrap-ceo
```
这会输出一个一次性邀请 URL，用它创建第一个 CEO 账户。

6. 启动服务：
```bash
node server/dist/index.js
```

7. 配置 Nginx 反向代理（示例）：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

8. 配置 SSL 证书（Let's Encrypt），使用 HTTPS 访问。

## 10. 🔌 插件系统

Rudder 设计了开放的插件系统，允许第三方扩展核心功能。

### 插件设计目标

- 能力可扩展：不把所有功能耦合到核心，核心保持简洁
- 生态开放：任何人都可以开发插件分享给社区
- 隔离性：插件运行在独立进程，不影响核心稳定性

### 插件 SDK 位置

- SDK 源码：`packages/plugins/sdk/`
- 插件示例：`packages/plugins/examples/`

### 插件核心概念

| 概念 | 说明 |
|------|------|
| **Worker** | 插件后端，运行在独立进程，通过 JSON-RPC 与主机通信 |
| **UI** | 插件前端，React 组件注入到主机 UI 的不同插槽 |
| **事件订阅** | 插件可以订阅核心领域事件（issue.created, project.updated 等）|
| **定时任务** | 支持 cron 表达式调度定时任务 |
| **Webhook** | 接收外部 HTTP webhook |
| **工具注册** | 注册可被 AI 调用的工具 |

### 插件开发快速开始

使用脚手架创建新插件：

```bash
npx create-rudder-plugin my-plugin
```

这会创建一个完整的插件项目结构，包含：
- Worker 入口
- UI 组件示例
- 打包配置
- TypeScript 配置

### 现有插件示例

- `plugin-authoring-smoke-example` - 插件开发冒烟测试示例
- `plugin-file-browser-example` - 文件浏览器插件示例
- `plugin-kitchen-sink-example` - 所有插件能力演示
- `plugin-linear` - Linear 集成示例

## 11. ❓ 常见问题 FAQ

### Q: 它和其他 AI 编排框架（如 LangGraph）有什么区别？

**A:** LangGraph 偏重于**单任务内的工作流编排**，帮助单个 AI 任务分解成多步骤调用。Rudder 偏重于**组织级别的多智能体长期协作**，关注角色分工、目标拆解、审批流程、预算控制——更像一个"操作系统"而不是一个"任务编排库"。

### Q: 支持哪些 AI 运行时？

**A:** 当前支持：
- Claude Code 本地（claude-local）
- Cursor 本地（cursor-local）
- OpenAI / Codex（codex-local）
- Google Gemini（gemini-local）
- OpenClaw 网关（openclaw-gateway）
- OpenCode（opencode-local）
- Perplexity PI（pi-local）

你也可以很方便地添加新的运行时适配器。

### Q: 数据存储在哪里？隐私如何保证？

**A:** 如果你使用**本地桌面模式**，所有数据都存储在你的本地机器上，Rudder 不会上传任何数据到外部服务器。如果你使用**云端部署**，数据存储在你自己配置的 PostgreSQL 中，由你自己掌控。

### Q: 成本如何计算？

**A:** Rudder 会追踪每个 AI 调用的 token 使用量（输入 + 输出），根据你配置的单价计算美元成本，可以在组织/雇员/任务多个层级设置月度预算上限，达到上限后自动暂停执行，防止超支。

## 12. 🤝 贡献指南

欢迎贡献！

- 小的、聚焦的 Pull Request 最容易审查和合并
- 较大的变更，开始实现前请先开 Issue 讨论
- 提交前请运行验证：

```bash
pnpm -r typecheck
pnpm test:run
pnpm build
```

如果你修改了桌面启动、打包、迁移相关代码，还需要运行：

```bash
pnpm desktop:verify
```

## 13. 📄 许可证

Rudder 在项目级别以 **Apache 2.0** 许可开放源代码。

详见 [LICENSE](./LICENSE)。

---

> 生成于：2026-05-18 · 由 claude-code-expert 深度解析
