# Portals

Portals 是一个基于 Next.js 的自托管门户，用于管理路由、订阅、标签和工作流，并向客户端提供配置内容。支持的配置语法与编译规则见[命名参数配置](docs/subscription.md)。

## 功能

- 管理原始内容、代理、重定向和缓存路由。
- 管理订阅及其工作流，查看分析数据。
- 提供账户、主题、语言、时间格式等设置。
- 使用 SQLite 保存应用数据，可选用 Redis 缓存路由结果。

## 本地开发

### 环境要求

- Node.js 24
- pnpm 12.11.2（可通过 Corepack 启用）

### 安装与启动

```sh
corepack enable
pnpm install
cp .env.example .env
```

设置 `.env` 中的 `BETTER_AUTH_URL` 和 `BETTER_AUTH_SECRET`。可使用 `openssl rand -base64 32` 生成认证密钥。默认数据库路径为 `./data/portals.db`。

```sh
pnpm db:migrate
pnpm dev
```

开发服务器默认地址为 <http://localhost:3000>。首次启动后可通过注册页面创建账户。

## 常用命令

| 命令                | 用途                          |
| ------------------- | ----------------------------- |
| `pnpm dev`          | 启动开发服务器                |
| `pnpm build`        | 构建生产版本                  |
| `pnpm start`        | 启动生产服务器                |
| `pnpm lint`         | 运行 ESLint                   |
| `pnpm format:check` | 检查 Prettier 格式            |
| `pnpm type-check`   | 运行 TypeScript 类型检查      |
| `pnpm db:generate`  | 根据 Schema 生成 Drizzle 迁移 |
| `pnpm db:migrate`   | 应用待执行的 Drizzle 迁移     |

## 部署

Docker 镜像构建、迁移和容器运行说明见 [Docker 部署指南](docs/docker.md)。环境变量说明见 [`.env.example`](.env.example)。

## 开发文档

- [API 规范](docs/api.md)
- [编码规范](docs/coding.md)
- [页面与组件设计规范](docs/design.md)
- [国际化规范](docs/i18n.md)
