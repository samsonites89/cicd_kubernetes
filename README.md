# cicd_kubernetes
쿠버 클러스터 상 CI/CD 배포 practice.

해당 repo는 *Microservices with Kubernetes* 문서 내용을 참고합니다.

## Chapter 4 :  CI/CD Pipeline

### ToC

- [**CI/CD** 파이프라인 이해](#cicd_intro)
- [K8S **CI/CD** 파이프라인 옵션](#pipeline_options)
- [GitOps(?)](#gitops)
- [자동화된 **CI/CD**](#automation)
- [`CircleCI`로 이미지 생성](#circleci)
- [지속적인 배포 설정](#argocd)


<a name="cicd_intro"></a>
### CI/CD 파이프라인의 이해

SW의 개발 라이프사이클은 **코드부터 테스트, 아티팩드 생성, 프로덕션 환경 배포**까지다.
개발자가 소스제어 시스쳄(예: github)에 커밋을 할때마다 이런 변경 사항이 CI로 감지돼
테스트와 생성 단계를 밟고,
이후 CD 시스템이 생성된 artifact에 변경사항을 감지하여 환경에 신규모듈을 배포하게끔 되어 있다.

여기서 CI와 CD는 :
- CI : Continuous Integration
- CD : Continuous Delivery

제일 심플한 pipeline의 구조는 아래와 같다:

1. Developer makes a `commit` in _Github_ (source control)
2. CI server runs tests, creates `Docker image` and pushes it to a repository
(i.e. `DockerHub`)
3. CD notices that there is a new image and pushes it to the `kubernetes cluster`

<a name="pipeline_options"></a>
### K8S CI/CD 파이프라인 옵션

현재 CI/CD를 구축할때 사용할 수 있는 옵션은 다양하다.

- **젠킨스 X**
  + 자동화된 CI/CD
  + 풀 요청 미리보기
  + 커밋과 충 요청에 대한 자동 피드백

  복잡하지만 성숙된 젠킨스를 활용하며 이를 숨기고, 쿠버네티스 고유의 간소화된 워크플로 제공

  다만 slack channel이 활발하지는 않음.

- **Spinnaker** (Netflix에 오픈소스 CI/CD 솔루션)
  + 많은 기업들이 채택함
  + 사례 많음
  + 다른 제품들과 많이 통합되어 있음

  다만 복잡하며, 쿠버네티스 전용이 아니라는 점 등

- **CircleCI & Travis CI**
  + 오픈소스
  CI랑 CD, 즉 클러스터 상 배포할 방안은 별도 고려할 필요가 있음

- **Tekton** (요즘 핫하며 유망주임)
  + 쿠버네티스 네이티브이며, step, tasks, run, pipeline 의 추상화가 뛰어남.


<a name="gitops"></a>
### GitOps

새로운 유행어이지만 개념을 새롭지 않으먀. IoC랑 유사함.
**모든 코드, 구성, 필요한 리소스를 소스로 제어하는 소스REPO에 작성하는 개념**.

<a name="circleci"></a>
### `CircleCI`로 이미지 생성

#### 파이프라인 구성관련

해당 문서에서는 CircleCI를 활용한 CI 작업 및 Argo 를 사용하여 CD를 다룬다.

- Argo CD
- GitOps (CoI)


#### circleci 설정관련

참고사이트
[Circle CI: Getting Started](https://circleci.com/docs/2.0/getting-started/#section=getting-started)

아래는 delinkcious 라는 artifact 와 연관된 `Circle CI` 관련 설정 정보를 보유하고 있는 yaml
파일이다. 해당 파일은 소스코드상에도 존재한다 (예: *$root/.circleci/config.yaml*)

```yaml

version: 2
jobs:
  # Build 관련 작업
  build:
    docker: #어떤 이미지를 사용할건지 지정
    - image: circleci/golang:1.11
    - image: circleci/postgres:9.6-alpine
      environment: # environment variables for primary container
        POSTGRES_USER: postgres
    working_directory: /go/src/github.com/the-gigi/delinkcious
---
    steps:
    - checkout
    - run:
        name: Get all dependencies
        command: |
          go get -v ./...
          go get -u github.com/onsi/ginkgo/ginkgo
          go get -u github.com/onsi/gomega/...
    - run:
        name: Test everything
        command: ginkgo -r -race -failFast -progress
    - setup_remote_docker:
        docker_layer_caching: true
    - run:
        name: build and push Docker images
        shell: /bin/bash
        command: |
          chmod +x ./build.sh
          ./build.sh
```

###### 1. pre-build 작업 지정

1 단계에서는 build 작업을 지정하고 이에 필룡한 `docker` 이미지 및 관련 환경을 지정한다. 그 다음
어떤 경로(*working_directory*)에서 해당 작업을 실행할지 지정한다.

###### 2. build 단계

2 단계인 build 단계에서는 `checkout`로 제일 최신 소스코드를 repo에서 가지고 온다. `checkout`
을 원할하게 하기 위해서는 *github* 저장소와 `Circle CI`와 연동이 되어 있어야하고, 저장소가
외부에 있을 시 , 액세스 토큰을 별도 제공해야한다.
그 이후 `go get` *cmd* 를  통해서 종속되어 있는 pkg를 가져온다.

###### [WIP] 3. test 단계

3 단계인 test 단계에서는 모듈 테스트 관련 코드를 수행한다.
