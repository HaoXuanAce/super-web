pipeline {
    agent any

    environment {
        IMAGE_NAME = 'super-web'
        IMAGE_TAG = 'latest'
        WEB_CONTAINER_NAME = 'super-web'
        WEB_PORT = '80'
        SSL_PORT = '443'
        SERVER_NAME = 'www.shxvoid.top'
        SSL_HOST_PATH = '/etc/nginx/ssl'
        NETWORK_NAME = 'super-network'
    }

    stages {
        stage('清理工作区') {
            steps {
                cleanWs()
            }
        }

        stage('检查部署环境') {
            steps {
                sh '''
                    docker info > /dev/null
                    docker network inspect ${NETWORK_NAME} > /dev/null 2>&1 || \
                      docker network create ${NETWORK_NAME}
                '''
            }
        }

        stage('拉取代码') {
            steps {
                script {
                    retry(3) {
                        timeout(time: 10, unit: 'MINUTES') {
                            git(
                                branch: 'main',
                                changelog: false,
                                poll: false,
                                credentialsId: 'github-ssh',
                                url: 'git@github.com:HaoXuanAce/super-web.git'
                            )
                        }
                    }

                    echo '✅ 代码拉取成功'
                }
            }
        }

        stage('构建 Docker 镜像') {
            steps {
                sh '''
                    echo "🚀 开始构建前端镜像..."
                    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                '''
            }
        }

        stage('停止旧容器') {
            steps {
                sh '''
                    echo "🛑 停止旧前端容器..."
                    docker stop ${WEB_CONTAINER_NAME} || true
                    docker rm ${WEB_CONTAINER_NAME} || true
                '''
            }
        }

        stage('启动前端容器') {
            steps {
                sh '''
                    echo "🚀 启动 Nginx 前端容器..."
                    docker run -d \
                      --name ${WEB_CONTAINER_NAME} \
                      --network ${NETWORK_NAME} \
                      -p ${WEB_PORT}:80 \
                      -p ${SSL_PORT}:443 \
                      -v ${SSL_HOST_PATH}/fullchain.pem:/etc/nginx/ssl/fullchain.pem:ro \
                      -v ${SSL_HOST_PATH}/privkey.pem:/etc/nginx/ssl/privkey.pem:ro \
                      -e SERVER_NAME=${SERVER_NAME} \
                      --restart=always \
                      ${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('部署验证') {
            steps {
                sh '''
                    echo "等待 Nginx 启动..."
                    for attempt in $(seq 1 15); do
                      if docker exec ${WEB_CONTAINER_NAME} wget -qO- http://127.0.0.1/ > /dev/null; then
                        echo "✅ 部署验证通过"
                        exit 0
                      fi

                      echo "第 ${attempt} 次检查未通过，2 秒后重试..."
                      sleep 2
                    done

                    echo "❌ 部署验证失败，Nginx 容器日志："
                    docker logs --tail 100 ${WEB_CONTAINER_NAME} || true
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo '✅ 前端部署成功'
        }

        failure {
            echo '❌ 前端部署失败，请查看 Jenkins 日志'
        }
    }
}
