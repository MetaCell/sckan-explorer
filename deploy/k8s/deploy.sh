#!/bin/bash

# set to the correct cluster context and namespace
kubectl config use-context $CLUSTER_NAME
kubectl config set-context $CLUSTER_NAME --namespace=$NAMESPACE

# prep the yamls
cp sckanner_tpl.yaml sckanner.yaml
cp ingress_tpl.yaml ingress.yaml

# sckanner service and deployment
sed -ie 's/{{TAG}}/'$CF_BUILD_ID'/i' sckanner.yaml
sed -ie 's|{{REGISTRY}}|'$REGISTRY'|i' sckanner.yaml
kubectl apply -f sckanner.yaml

# ingress
sed -ie 's|{{DOMAIN}}|'$DOMAIN'|i' ingress.yaml
kubectl apply -f ingress.yaml

# cleanup
rm -rf sckanner.yaml* ingress.yaml*
