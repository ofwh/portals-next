# Docker 部署

## 环境变量

按[访问地址](#访问地址)设置 `BETTER_AUTH_URL`，用 `openssl rand -base64 32` 生成 `BETTER_AUTH_SECRET`，并替换启动示例中的密钥占位值。使用 Docker Compose 时，将 [`.env.example`](../.env.example) 复制为 `.env` 并填写配置。以下启动示例为缓存路由配置了 `REDIS_URL`。

以下示例将宿主机的 `./data` 挂载到容器的 `/app/data`。使用默认 `DATABASE_URL` 时，请准备已初始化的 `./data/portals.db`，并确保容器用户可写入数据库及其所在目录。

### 访问地址

- `BETTER_AUTH_URL` 设置主访问地址。使用浏览器访问的协议、主机和非默认端口。（本地建议使用 `http://localhost:3000`。反向代理部署时填写浏览器实际访问的 HTTPS 地址，如 `https://portals.example.com`。）
- `BETTER_AUTH_TRUSTED_ORIGINS` 添加其他受信任来源。每项填写协议、主机和非默认端口，多个来源使用逗号分隔，逗号两侧不加空格。（只有主入口时可省略。另有内网域名或备用入口时，逐一填写实际使用的来源。）
- 主访问地址使用 HTTPS 时，Better Auth 使用 `Secure` 会话 Cookie。其他入口也应使用 HTTPS，确保浏览器能在这些入口维持登录。

## 使用 `docker run` 启动 Redis

使用本地镜像或 GHCR 镜像前，执行一次以下命令。

```sh
docker network create portals

docker run -d \
  --name portals-redis \
  --network portals \
  redis:7-alpine
```

## 本地构建与启动

在仓库根目录执行：

```sh
docker build -t portals-next .

docker run -d \
  --name portals-next \
  --network portals \
  --publish 3000:3000 \
  -e BETTER_AUTH_URL=http://localhost:3000 \
  -e BETTER_AUTH_SECRET='<填入生成的密钥>' \
  -e BETTER_AUTH_TRUSTED_ORIGINS=http://127.0.0.1:3000 \
  -e REDIS_URL=redis://portals-redis:6379/0 \
  --volume "$(pwd)/data:/app/data" \
  portals-next
```

## 使用 GHCR 镜像启动

在存放 `data` 的目录执行。镜像为私有时，先执行 `docker login ghcr.io`。

```sh
docker pull ghcr.io/larify/portals-next:latest

docker run -d \
  --name portals-next \
  --network portals \
  --publish 3000:3000 \
  -e BETTER_AUTH_URL=http://localhost:3000 \
  -e BETTER_AUTH_SECRET='<填入生成的密钥>' \
  -e BETTER_AUTH_TRUSTED_ORIGINS=http://127.0.0.1:3000 \
  -e REDIS_URL=redis://portals-redis:6379/0 \
  --volume "$(pwd)/data:/app/data" \
  ghcr.io/larify/portals-next:latest
```

## 使用 Docker Compose 启动

在 `.env` 同级目录保存 `docker-compose.yaml`：

```yaml
services:
  portals:
    image: ghcr.io/larify/portals-next:latest
    env_file: .env
    environment:
      REDIS_URL: redis://redis:6379/0
    depends_on:
      redis:
        condition: service_healthy
    ports:
      - '3000:3000'
    volumes:
      - ./data:/app/data

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 3s
      retries: 5
```

```sh
docker compose up -d
```

## GitHub Actions

流水线为 `linux/amd64` 和 `linux/arm64` 构建应用与迁移镜像，默认发布到 `ghcr.io/<owner>/<repo>`。

配置 `DOCKERHUB_USERNAME`（变量或密钥）和 `DOCKERHUB_TOKEN`（密钥）后，同步发布到该账号的 `portals-next` 仓库。

| 触发方式                       | 应用标签                   | 迁移标签                                   |
| ------------------------------ | -------------------------- | ------------------------------------------ |
| 推送到 `main`                  | `latest`、`年.月.运行编号` | `migrate-latest`、`migrate-年.月.运行编号` |
| 推送到 `release`               | `unstable`                 | `migrate-unstable`                         |
| 手动选择 Git ref               | `dev`                      | `migrate-dev`                              |
| 向 `main` 或 `release` 提交 PR | 仅校验构建                 | 仅校验构建                                 |

版本标签的年月取自提交时间（UTC）。`main` 的两种镜像均发布成功后，流水线创建对应版本的 GitHub Release。
