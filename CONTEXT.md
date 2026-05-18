# Rudder Domain Context

Rudder 是面向 AI 智能体团队的**编排与控制平台**，是自治 AI 组织的操作系统层。它将目标、任务、知识和工作流组织成可执行结构，使智能体能够在清晰的边界内工作、协作并推进工作。

## 核心组织概念

**Organization**:
一个自治 AI 组织，是 Rudder 中的第一级实体。一个 Rudder 实例可以运行多个 Organization，所有业务数据都按 Organization 隔离。
_Avoid_: 公司、团队

**Instance**:
一个 Rudder 部署运行实例，对应一个数据库和一组服务进程。一个 Instance 可以包含多个 Organization。
_Avoid_: 部署、服务

**Board**:
人类管理员/操作者，拥有整个 Instance 的完全控制权限。V1 设计：每个 Instance 只有一个人类 Board Operator。Board 负责创建组织、审批请求、干预工作流、调整预算。
_Avoid_: 人类、管理员、用户

**Goal**:
目标。所有层级的目标都叫 Goal，用 `level` 区分：`organization` | `team` | `agent` | `task`。所有工作必须可追溯到 Organization 顶级 Goal。
_Avoid_: 目标、目的、objective（ Objectives 是 Goal 的子集，统一使用 Goal）

**Project**:
项目。聚合一组相关的 Issue，有名称、描述、关联 Goal、截止日期。一个 Project 包含多个 Issue。
_Avoid_: 集合、分组

## 核心工作概念

**Issue**:
核心工作项实体，持久化存储。一个 Issue 就是一个需要完成的具体工作项。Issue 可以有父 Issue，形成层级结构。
_Avoid_: task（task 是 Issue 分解出的子工作单元，不同于 Issue）

**Task**:
从 Issue 分解出的子工作单元。当前边界待进一步明确。
_Avoid_: work、item

**Atomic Checkout**:
原子任务检出。当 Agent 要开始处理一个 Issue 时，必须先执行检出操作。使用乐观并发控制，如果 Issue 已被其他 Agent 检出，返回 `409 Conflict` 防止竞态。
_Avoid_: 锁定、抢占

**Approval**:
审批请求。需要人类 Board 批准的操作，由 Agent 发起，人类批准或拒绝。V1 支持两种类型：`hire_agent`（雇佣新 Agent）和 `approve_ceo_strategy`（批准 CEO 战略）。
_Avoid_: review、检查

**Activity Log**:
审计活动日志。所有变更操作都必须写入 Activity Log，记录操作者、时间、实体、操作，用于完整审计追踪。
_Avoid_: 日志、审计

## 智能体运行

**Agent**:
AI 智能体。强调运行时执行能力。每个 Agent 都是 Organization 的 Employee，存在于组织层级树中。
_Avoid_: 雇员、worker

**Employee**:
Agent 在组织层级中的身份。每个 Agent 都是 Employee，有汇报上级，属于某个 Organization。
_Avoid_: 成员、worker

**Agent Runtime / Adapter**:
运行时适配器。知道如何调用不同环境中的 Agent。Rudder 内置两种：`process`（派生本地进程执行）和 `http`（调用远程 HTTP webhook）。Agent Runtime 和 Adapter 是同一个概念的不同说法。
_Avoid_: 运行器、执行器

**Heartbeat**:
定时唤醒机制。Agent 按配置的时间间隔自动触发执行。
_Avoid_: 调度、定时任务

**HeartbeatRun**:
一次具体的心跳执行实例，记录执行状态和结果。
_Avoid_: run、execution

**Run**:
泛指任何一次 Agent 执行，包括定时心跳触发和手动触发。
_Avoid_: execution、调用

## 通信

**Messenger**:
统一看板通信外壳。聚合聊天、收件箱、审批等各种注意力流，是 Board 上的统一通信入口。
_Avoid_: 通信、聊天、收件箱

**Chat**:
对话会话。位于 Messenger 中，用于澄清需求。一个 Chat 最多可以转换为一个 primary Issue。Chat 是需求澄清入口，持久化执行仍然在 Issue 中。
_Avoid_: 对话、会话

## 成本预算

**Cost Event**:
单次消费记录。记录一次 AI 调用消耗的成本（美分），关联到 Agent 和 Issue。
_Avoid_: spend、expense

**Budget**:
月度消费限额。可以在 Organization 层和 Agent 层设置。当累计消费超过硬限制时，自动暂停 Agent 阻止新调用。
_Avoid_: 限额、配额

## 存储资产

**Asset**:
通用文件资产。存储任意文件的元数据（图片、输出文件、二进制等），实际内容存储在 `local_disk` 或 S3。
_Avoid_: file、storage

**Document**:
可编辑文本文档（markdown）。保留完整版本历史，支持编辑和追溯。
_Avoid_: doc、text、note

**Attachment**:
关联连接。将 Asset 连接到 Issue 或 Comment，显示在 Issue 的附件列表中。
_Avoid_: link、connection

## 架构原则

**Control Plane**:
控制平面。Rudder 本身提供的能力：组织管理、目标拆解、任务编排、心跳调度、成本跟踪、预算控制、审计日志。Rudder 只做控制平面。
_Avoid_: 控制层、核心层

**Execution Plane**:
执行平面。Agent 实际执行任务的地方，可以是本地进程、外部 HTTP 服务或任何其他运行环境。Rudder 不运行 Agent 业务代码，只负责触发和收集结果。
_Avoid_: 执行层、运行层

## Relationships

- 一个 **Instance** 包含多个 **Organization**
- 每个 **Organization** 有一个顶级 **Goal**，Goal 可以分解为子 Goal
- 每个 **Agent** 是 **Organization** 的 **Employee**，存在于组织汇报树
- 一个 **Project** 聚合多个 **Issue**
- 一个 **Issue** 可以有多个子 **Task**
- 每个 **Agent** 使用一个 **Adapter** 连接到运行环境
- 一次 **Heartbeat** 唤醒产生一个 **HeartbeatRun**
- 每个 **Cost Event** 关联到一个 **Agent** 和一个 **Issue**
- **Chat** 在 **Messenger** 中，一个 **Chat** 最多转换为一个 **Issue**
- **Asset** 通过 **Attachment** 关联到 **Issue** 或 **Comment**
- 所有数据都属于一个 **Organization**，严格隔离

## Example dialogue

> **Dev**: "When a **Board** creates an **Organization**, does it need to create the root **Goal** immediately?"
> **Domain Expert**: "Yes — every Organization must have at least one root Goal at the organization level. That's an invariant."

> **Dev**: "Can an **Issue** be converted from a **Chat** and still belong to a **Project**?"
> **Domain Expert**: "Yes — the conversion preserves the Project linkage if the Chat was already project-linked."

## Flagged ambiguities

- `issue` vs `task` — 用户确认是两个不同概念，但具体边界待后续澄清
- `Agent Runtime` vs `Adapter` — 用户表示暂时不确定是否需要区分，统一处理为同一概念
