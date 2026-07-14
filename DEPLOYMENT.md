# Jenkins 前端自动部署

## 前提

- Docker 已安装。
- Jenkins 已安装，并且可以调用 Docker。
- 后端 `super-server` 已部署在同一台服务器，并暴露宿主机 `3000` 端口。
- 服务器 `80` 端口未被占用。
- Jenkins 已配置可以读取 GitHub 仓库的 `github-ssh` SSH 凭据。

无需在服务器安装 Nginx。Dockerfile 会在构建前端镜像时自动拉取 `nginx:1.27-alpine`，并在容器中运行 Nginx。

## 部署架构

```text
浏览器 -> super-web Nginx 容器 :80 -> 前端静态文件
                                       -> /api/* -> 宿主机 :3000 -> super-server
```

前端请求 `/api/auth/login/password` 时，Nginx 会移除 `/api` 前缀并转发为后端接口 `/auth/login/password`。

## 第一次提交部署文件

在本地前端项目中提交并推送部署文件：

```bash
git add Dockerfile .dockerignore nginx Jenkinsfile DEPLOYMENT.md
git commit -m "chore: add jenkins nginx deployment"
git push origin main
```

## 创建 Jenkins 任务

1. Jenkins 中新建一个 Pipeline 任务，例如 `super-web-deploy`。
2. Pipeline 定义选择 `Pipeline script from SCM`。
3. SCM 选择 Git。
4. Repository URL 填写 `git@github.com:HaoXuanAce/super-web.git`。
5. Branch Specifier 填写 `*/main`。
6. Credentials 选择 `github-ssh`。
7. Script Path 填写 `Jenkinsfile`。
8. 保存。

## 点击部署后会自动执行

1. 清理 Jenkins 工作区。
2. 拉取最新 `main` 代码，失败时重试 3 次。
3. 使用 Docker 构建 `super-web:latest`：内部执行 `pnpm install --frozen-lockfile` 与 `pnpm run build`。
4. 构建阶段自动拉取 Nginx 镜像，复制前端 `dist` 文件和 Nginx 配置。
5. 停止并删除旧的 `super-web` 容器。
6. 启动新的 Nginx 前端容器，映射服务器 `80` 端口。
7. 检查前端首页和 `/api/` 后端代理是否正常。

部署成功后访问：

```text
http://服务器IP/
```

## 第一次手动验证（可选）

如果想在点击 Jenkins 前先验证一次，可在服务器上执行：

```bash
git clone git@github.com:HaoXuanAce/super-web.git
cd super-web

docker build -t super-web:latest .
docker run -d \
  --name super-web \
  --add-host host.docker.internal:host-gateway \
  -p 80:80 \
  --restart=always \
  super-web:latest

curl -I http://127.0.0.1/
curl http://127.0.0.1/api/
```

首次手动验证完成后，删除手动容器即可交由 Jenkins 管理：

```bash
docker stop super-web
docker rm super-web
```

## 常用检查命令

```bash
docker ps --filter name=super-web
docker logs --tail 100 super-web
docker exec super-web nginx -t
curl -I http://127.0.0.1/
curl http://127.0.0.1/api/
```

若 `80` 端口已被占用，将 Jenkinsfile 中的 `WEB_PORT = '80'` 改为其他端口，例如 `8088`；随后访问 `http://服务器IP:8088/`。
