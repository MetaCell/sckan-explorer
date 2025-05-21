#!/bin/bash
# Make sure to be in the right environment - before proceeding with the following steps

# run the harness-deployment to generate the deployment files
kubectl create ns sckanner
kubectl config set-context --current --namespace=sckanner

# TO run the harness deployment command - to generate helm chart files - use the launch json command or 
# as below:
harness-deployment cloud-harness . -i sckanner -d sckanner.local -n sckanner -u -dtls --no-cd -l

# to run for the local environment - use the -e local flag
harness-deployment cloud-harness . -i sckanner -d sckanner.local -n sckanner -u -dtls --no-cd -l -e local

# to run for the dev environment - use the -e dev flag
harness-deployment cloud-harness . -i sckanner -d sckanner.local -n sckanner -u -dtls --no-cd -l -e dev

# run without -u to disable the gatekeeper check and without --no-cd to disable re-generating codefresh-dev.yaml
harness-deployment cloud-harness . -i sckanner -d sckanner.local -n sckanner -l -e local



# do the skaffold deploy
skaffold dev --cleanup=false

# Do the following if you need to copy the values for the helm to the cloudharness resources locally. 
# cp deployment/helm/values.yaml /opt/cloudharness/resources/allvalues.yaml
