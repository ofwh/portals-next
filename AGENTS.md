# AGENTS.md

本文件规定在本仓库中工作的编码代理应遵守的规则。

## 类型

- 使用明确类型；存在多个确定形态时使用联合类型。
- 禁止 `any`；无法确定类型时才使用 `unknown`，使用前先收窄。

## 注释

- 极度精简：只在关键业务转折与关键参数处写，其余一律不写。
- 显而易见、复述代码的注释不写；不保留过程痕迹。

## 文档

- 文档内容应客观、准确、无歧义；仅保留设计约束、实现边界与可执行的开发规范。
- 同一规则只在一处完整定义，其他文档通过链接引用，避免重复维护。
- 通用规范不绑定具体业务模块或实现示例；模块文档仅保留该模块必要的差异与协议约束。
- 不记录历史过程、任务进度、完成记录、修改流水或无关信息。
- 可从源码直接查询的定义、常量和文件清单不在文档重复维护。

## 测试

- 未要求时，不考虑或实现测试用例相关内容。

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
