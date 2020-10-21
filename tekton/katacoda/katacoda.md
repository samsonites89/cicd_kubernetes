# Katacoda Tutorial

[https://www.katacoda.com/javajon/courses/kubernetes-pipelines/tekton](https://www.katacoda.com/javajon/courses/kubernetes-pipelines/tekton)

## 1. Install Local Container Registry

이미지 보관소 설치  작업. public을 사용할 수 있지만 주로 private한 내용을기반으로 작업을 하게 되면 별도 img registry를
활용하는 것도 유용하며, 외부 registry를 연결할 시 token 관리 필요하다.

```bash
#  add stable repo chart
helm repo add stable https://kubernetes-charts.storage.googleapis.com

# private image registry 설치
helm install registry stable/docker-registry \
  --version 1.9.4 \
  --namespace kube-system \
  --set service.type=NodePort \
  --set service.nodePort=31500
```
Install the chart for a private container registry.

### Registry Proxy 설치

Registry 는 인증서 기반으로 보안체계를 유지한다. 해당 exercise 에서는 proxy 를 daemont-set 으로 뛰어서 SSL
관련 이슈를 1차 bypass 한다. 

```bash
# kube-registry proxy 설정
helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator

# install the proxy daemons.
helm install registry-proxy incubator/kube-registry-proxy \
  --version 0.3.2 \
  --namespace kube-system \
  --set registry.host=registry-docker-registry.kube-system \
  --set registry.port=5000 \
  --set hostPort=5000

```
이제 localhost:5000번을 활용하여 docker pull push가 가능하다 (POD내에서)

Regitry UI도 도움이 될테니 추가로 설치한다.
```bash
kubectl apply -f registry-ui.yaml
```

## 2. Example Nodejs App
이제 Sample로 작성된 nodejs app으로 작업을 해보자 (*katacoda 경로참고*)

pkg 구조는 아래와 같다.
```
controlplane $ tree
.
├── pipeline
│   ├── git-resource.yaml
│   ├── pipeline-run.yaml
│   ├── pipeline.yaml
│   ├── service-account.yaml
│   ├── task-build-src.yaml
│   └── task-deploy.yaml
├── README.md
└── src
    ├── app.js
    ├── deploy.yaml
    ├── Dockerfile
    └── package.json
```
일단 *src* 쪽을 보면 간단한게 node로 구현되어 있는 샘플코드가 있다. *app.js* 라는 소스코드를 `docker` 이미지로 빌드하 수
있게 *Dockerfile* 이 있으며, 해당 파일 기반으로 이미지를 빌드하게 된다. 

## 3. Tekton 설치

설치는 [Tekton README.md](../README.md) 참고 바람.

## 4. Declare Pipeline Resources

제일 먼저 git 에 대한 `Pipeline Resource` 를 생성한다.

```bash
master $ kubectl apply -f pipeline/git-resource.yaml
pipelineresource.tekton.dev/git created
master $ tkn resources list
NAME   TYPE   DETAILS
git    git    url: https://github.com/javajon/node-js-tekton

```
## 5. Defining Tasks

For our pipeline, we have defined two tasks:

- `task-build-src` clones the source, builds the Node.js based container, and pushes the image to a registry.
- `task-deploy` pulls the container image from the private registry and runs it on this Kubernetes cluster.

