# Docker 部署

## 构建镜像

```sh
docker build -t portals-next:local .
docker build --target migrate -t portals-next:migrate-local .
```

## 运行容器

根据 [`.env.example`](../.env.example) 配置运行环境，认证入口见[访问地址](#访问地址)。用 `openssl rand -base64 32` 生成 `BETTER_AUTH_SECRET`。启用缓存路由时，将 `REDIS_URL` 指向容器可访问的 Redis。使用默认 `DATABASE_URL` 时，应用与迁移容器共用挂载到 `/app/data` 的卷。

```sh
docker volume create portals-data
docker run --rm --env-file .env -v portals-data:/app/data ghcr.io/ofwh/portals-next:migrate-latest
docker run -d --name portals-next -p 3000:3000 --env-file .env \
  -v portals-data:/app/data ghcr.io/ofwh/portals-next:latest
```

本地构建时使用 `portals-next:migrate-local` 和 `portals-next:local`。使用私有镜像时，先登录镜像仓库。先运行对应版本的迁移镜像，再启动或升级应用。基线迁移适用于空数据库。已有表且缺少 Drizzle 迁移记录的 SQLite 数据库需要先核对 schema 并建立对应的迁移记录。

### 访问地址

- `BETTER_AUTH_URL` 设置主访问地址。使用浏览器访问的协议、主机和非默认端口。
- `BETTER_AUTH_TRUSTED_ORIGINS` 添加其他受信任来源。每项填写协议、主机和非默认端口，多个来源使用逗号分隔，逗号两侧不加空格。
- 主访问地址使用 HTTPS 时，Better Auth 使用 `Secure` 会话 Cookie。其他入口也应使用 HTTPS，确保浏览器能在这些入口维持登录。

## GitHub Actions

流水线为 `linux/amd64` 和 `linux/arm64` 构建应用与迁移镜像，默认发布到 `ghcr.io/<owner>/<repo>`。配置 `DOCKERHUB_USERNAME`（变量或密钥）和 `DOCKERHUB_TOKEN`（密钥）后，同步发布到该账号的 `portals-next` 仓库。

| 触发方式                       | 应用标签                   | 迁移标签                                   |
| ------------------------------ | -------------------------- | ------------------------------------------ |
| 推送到 `main`                  | `latest`、`年.月.运行编号` | `migrate-latest`、`migrate-年.月.运行编号` |
| 推送到 `release`               | `unstable`                 | `migrate-unstable`                         |
| 手动选择 Git ref               | `dev`                      | `migrate-dev`                              |
| 向 `main` 或 `release` 提交 PR | 仅校验构建                 | 仅校验构建                                 |

版本标签的年月取自提交时间（UTC）。`main` 的两种镜像均发布成功后，流水线创建对应版本的 GitHub Release。
