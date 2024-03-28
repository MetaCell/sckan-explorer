#!/bin/bash

export CLUSTER_NAME=minikube
export NAMESPACE=sckanner
export CF_BUILD_ID=latest
export REGISTRY=
export DOMAIN=sckanner.local

source ./deploy.sh
