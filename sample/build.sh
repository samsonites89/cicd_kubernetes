#!/bin/bash

# 문제 있을시 바로 스크립트 바로 중단
set -eo pipefail

# Image 관련 prefix 및 tag 설정
IMAGE_PREFIX='g1g1'
STABLE_TAG='0.1'

TAG="${STABLE_TAG}.${CIRCLE_BUILD_NUM}"
ROOT_DIR="$(pwd)"
SVC_DIR="${ROOT_DIR}/svc"
cd $SVC_DIR
docker login -u $DOCKERHUB_USERNAME -p $DOCKERHUB_PASSWORD