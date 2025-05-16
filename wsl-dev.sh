#!/bin/bash
# Make sure to be in the right environment - before proceeding with the following steps

# run the harness-deployment to generate the deployment files
kubectl create ns sckanner
kubectl config set-context --current --namespace=sckanner

# TO run the harness deployment command - to generate helm chart files - use the launch json command or 
# as below:
# for local
harness-deployment cloud-harness . -i sckanner -d sckanner.local -n sckanner -u -dtls --no-cd -l -e local
# for remote
harness-deployment cloud-harness . -i sckanner -d sckanner.local -n sckanner -u -dtls --no-cd -l -e dev


# do the skaffold deploy
skaffold dev --cleanup=false

# Do the following if you need to copy the values for the helm to the cloudharness resources locally. 
# cp deployment/helm/values.yaml /opt/cloudharness/resources/allvalues.yaml
