# 阿里云 Linux：Jenkins + Docker + Nginx 部署

本项目不需要在阿里云 Linux 宿主机安装 Nginx。前端镜像以 `nginx:1.27-alpine` 为运行环境：Jenkins 构建镜像后，会启动一个名为 `super-web` 的 Nginx 容器。

部署后的访问关系如下：

```text
浏览器
  │
  ├── 阿里云安全组 / 服务器 80 端口  → 301 重定向到 HTTPS
  └── 阿里云安全组 / 服务器 443 端口
        │
        └── super-web（Nginx 容器）
              ├── /              → Vue 静态文件
              └── /api/*         → super-server:3000（NestJS 容器）
```

`super-web` 和 `super-server` 位于同一个 Docker 网络 `super-network`。后端不需要向公网暴露 `3000` 端口。

## 项目中的 Nginx 配置在哪里

仓库内的源配置是 [nginx/default.conf.template](nginx/default.conf.template)。Docker 构建时，它会被复制到容器的：

```text
/etc/nginx/templates/default.conf.template
```

官方 Nginx 镜像在容器启动时会用环境变量生成实际生效的文件：

```text
/etc/nginx/conf.d/default.conf
```

其中 `API_UPSTREAM` 默认值为 `super-server:3000`，定义在 [Dockerfile](Dockerfile)。Nginx 对 `/api/` 的代理会保留 `/api` 前缀，与后端的 `app.setGlobalPrefix('api')` 一致。

## 首次部署：准备服务器

以下命令在阿里云 ECS 的终端执行。先确认 Docker 已启动：

```bash
sudo systemctl enable --now docker
docker --version
```

创建前后端共用的 Docker 网络（只需一次）：

```bash
docker network inspect super-network >/dev/null 2>&1 || docker network create super-network
```

在阿里云控制台的 **安全组入方向** 放行 TCP `80`；如果服务器启用了 firewalld，也放行本机端口：

```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

不要在安全组或防火墙开放 `3000`、MySQL `3306`、Redis `6379`，除非有明确的公网访问需求。

## 配置 SSL / HTTPS

### 1. 上传证书到服务器

将阿里云下载的证书文件上传到服务器的 `/etc/nginx/ssl/` 目录：

```bash
# 在服务器上创建目录
sudo mkdir -p /etc/nginx/ssl

# 在本地上传（替换为你的服务器 IP）
scp www.shxvoid.top.pem root@你的服务器IP:/etc/nginx/ssl/fullchain.pem
scp www.shxvoid.top.key root@你的服务器IP:/etc/nginx/ssl/privkey.pem

# 设置权限
sudo chmod 644 /etc/nginx/ssl/fullchain.pem
sudo chmod 600 /etc/nginx/ssl/privkey.pem
```

### 2. 放行 443 端口

阿里云控制台安全组入方向放行 TCP `443`；服务器防火墙：

```bash
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. Jenkinsfile 已配置的域名

Jenkinsfile 中 `SERVER_NAME = 'www.shxvoid.top'` 已设置，无需修改。

### 4. 证书续期提醒

阿里云证书有效期为 1 年，到期前需重新下载并替换 `/etc/nginx/ssl/` 下的文件，然后执行：

```bash
docker exec super-web nginx -s reload
```

## 首次部署后端

先将后端容器加入 `super-network`。假设后端代码目录为 `/opt/super-server`，并且该目录中已有仅供服务器使用的 `.env`：

```bash
cd /opt/super-server

docker build -t super-server:latest .
docker rm -f super-server 2>/dev/null || true
docker run -d \
  --name super-server \
  --network super-network \
  --env-file .env \
  --restart=always \
  super-server:latest
```

检查后端：

```bash
docker ps --filter name=super-server
docker logs --tail 100 super-server
docker exec super-server wget -qO- http://127.0.0.1:3000/api/
```

后端 `.env` 包含数据库、Redis 与密钥，不能提交到 Git，也不能粘贴到 Jenkins 控制台或文档中。如这些凭据曾被提交、截图或公开，应立即在对应服务中轮换。

## 配置 Jenkins 前端任务

1. Jenkins 新建 Pipeline 任务，例如 `super-web-deploy`。
2. Pipeline 定义选择 `Pipeline script from SCM`，SCM 选择 Git。
3. 仓库填写 `git@github.com:HaoXuanAce/super-web.git`，分支填写 `*/main`。
4. 凭据选择 `github-ssh`，脚本路径填写 `Jenkinsfile`。
5. 确保运行 Jenkins 的系统用户有 Docker 权限，例如执行 `docker ps` 不会报权限错误。

Jenkins 会自动创建 `super-network`（若不存在）、构建镜像、替换旧的 `super-web` 容器，并将服务器 `80` 映射到容器 `80`。

前端与部署文件首次提交：

```bash
git add Dockerfile .dockerignore nginx Jenkinsfile DEPLOYMENT.md
git commit -m "chore: configure Docker Nginx deployment"
git push origin main
```

## 验证与排查

部署完成后访问：

```text
http://服务器公网IP/
```

在服务器上执行：

```bash
docker ps --filter name=super-web
docker logs --tail 100 super-web
docker exec super-web nginx -t
docker exec super-web cat /etc/nginx/conf.d/default.conf
curl -I http://127.0.0.1/
curl http://127.0.0.1/api/
```

若前端能访问而接口返回 `502 Bad Gateway`，按顺序检查：

```bash
docker ps --filter name=super-server
docker network inspect super-network
docker logs --tail 100 super-server
docker exec super-web wget -qO- http://super-server:3000/api/
```

确认两个容器都在 `super-network`，且后端容器名称确实为 `super-server`。如果后端容器使用其他名称，修改 Dockerfile 中的 `API_UPSTREAM`，例如 `ENV API_UPSTREAM=你的容器名:3000`，再由 Jenkins 重新部署前端。

## 更新后端时

后端更新后使用同一网络和容器名重建。前端 Nginx 无需修改：

```bash
cd /opt/super-server
docker build -t super-server:latest .
docker rm -f super-server
docker run -d \
  --name super-server \
  --network super-network \
  --env-file .env \
  --restart=always \
  super-server:latest
```

如果服务器 `80` 已被其他服务占用，将 `Jenkinsfile` 的 `WEB_PORT = '80'` 改为未占用端口，例如 `8088`，并在安全组放行该端口；访问地址随之变为 `http://服务器公网IP:8088/`。
