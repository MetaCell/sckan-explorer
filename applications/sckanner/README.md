# Sckanner

## Table of Contents
- [Overview](#overview)
- [Dependencies](#dependencies)
- [Install Cloud-Harness](#install-cloud-harness)
- [Development](#development)
- [Run the Application Deployment Locally](#run-the-application-deployment-locally)
- [Run the Frontend](#run-the-frontend)
- [Prepare Backend](#prepare-backend)
- [Build Frontend](#build-frontend)
- [Ingestion](#ingestion)
- [VS Code Configuration to Run the Application](#vs-code-configuration-to-run-the-application)
- [More Information About the Application](#more-information-about-the-application)
- [Running Local with Port Forwardings to a Kubernetes Cluster](#running-local-with-port-forwardings-to-a-kubernetes-cluster)
- [Run Cloudharness Deployment for Sckanner Locally](#run-cloudharness-deployment-for-sckanner-locally)

## Overview

Django-Ninja/React-based web application.
This application is designed to be deployed inside a Cloud-Harness Kubernetes environment.
It can also be run locally for development and testing purposes.


## Dependencies

You must have the following dependencies installed:
- python 3.12.9
- docker (minikube)
- kubectl
- skaffold
- cloud-harness (https://github.com/metacell/cloud-harness)

## Install Cloud-Harness

```
git clone https://github.com/metacell/cloud-harness.git
cd cloud-harness
```

Create a new virtual environment and install the dependencies - you can use - pyenv, conda, virtualenv, etc.
With Conda:
```
conda create -n sckanner python=3.12.9
conda activate sckanner
```

Now, install all Cloud-Harness and other dependencies by running the following command:

```
bash dev-setup.sh
```

Inside the `sckanner/backend` directory run the following command:
```
pip install -r requirements.txt
```


## Development

Backend code is inside the *backend* directory.
See [backend/README.md#Develop]

Frontend code is inside the *frontend* directory.


## Run the Application Deployment Locally

Run the harness deployment command:
```
harness-deployment cloud-harness . -i sckanner -d sckanner.local -n sckanner -u -dtls --no-cd -l -e local
```
For detailed and other options for `harness-deployment` and k8 namespace settings check - [`k8-script.sh`](../../k8-script.sh)



Make sure to add the following to the host file of your machine:
```
############ ESCKAN - PROJECT HOST ###########
127.0.0.1       sckanner.local workflows.sckanner.local argo.sckanner.local accounts.sckanner.local www.sckanner.local
127.0.0.1       sckanner-db 
127.0.0.1       workflows.sckanner argo-server.sckanner sckanner.sckanner accounts.sckanner
```

Please verify the above entries with the logs after running the harness-deployment command. 

Now run the skaffold dev command:
```
skaffold dev --cleanup=false
```

You should be able to access the application (frontend) at `https://sckanner.local`
To access the django admin interface (to run the ingestion) - you need to create a superuser account and access it at `https://sckanner.local/admin`

The argo workflow is running on `https://argo.sckanner.local` (to be able to see the argo UI - one must be an admin - and hence if you use your credentials - make sure you are an admin - ask the admin to add you as an admin)
The keycloak is running on `https://accounts.sckanner.local`



## Run the Frontend
To run the application locally, 
Frontend with remote backend (sckanner.dev.metacell.us)
use yarn dev - and Add `VITE_API_URL=https://sckanner.dev.metacell.us` to the .env file.

To run the application with local backend (localhost:8000 or http://sckanner.local)
use yarn dev - and Add `VITE_API_URL=http://localhost:8000` or `VITE_API_URL=http://sckanner.local` to the .env file.



## Prepare Backend

Create a Django local superuser account, this you only need to do on initial setup.
```bash
cd backend
python3 manage.py migrate # to sync the database with the Django models
python3 manage.py collectstatic --noinput # to copy all assets to the static folder
python3 manage.py createsuperuser
# link the frontend dist to the django static folder, this is only needed once, frontend updates will automatically be applied
cd static/www
ln -s ../../../frontend/dist dist
```

## Build Frontend

Compile the frontend
```bash
cd frontend
yarn install
yarn build
```


## Ingestion

Ingestion uses Argo Workflows to run the ingestion scripts. The flow goes like this:
```
Django Admin (Create Snapshot) -> Argo Workflow (Trigger) -> Django Command (Ingestion) -> Connectivity Statement Service -> Connectivity Statement Adapter -> DB. 
```



## VS Code Configuration to Run the Application

```
{
  "configurations": [
    {
      "args": [
        "createsuperuser"
      ],
      "autoStartBrowser": false,
      "django": true,
      "env": {
        "CH_CURRENT_APP_NAME": "sckanner",
        "CH_VALUES_PATH": "${workspaceFolder}/deployment/helm/values.yaml"
      },
      "name": "Django createsuperuser",
      "program": "${workspaceFolder}/applications/sckanner/backend/manage.py",
      "request": "launch",
      "type": "debugpy"
    },
    {
      "args": [
        "makemigrations"
      ],
      "autoStartBrowser": false,
      "django": true,
      "env": {
        "CH_CURRENT_APP_NAME": "sckanner",
        "CH_VALUES_PATH": "${workspaceFolder}/deployment/helm/values.yaml"
      },
      "name": "Run makemigrations to Django",
      "program": "${workspaceFolder}/applications/sckanner/backend/manage.py",
      "request": "launch",
      "type": "debugpy"
    },
    {
      "args": [
        "migrate"
      ],
      "autoStartBrowser": false,
      "django": true,
      "env": {
        "CH_CURRENT_APP_NAME": "sckanner",
        "CH_VALUES_PATH": "${workspaceFolder}/deployment/helm/values.yaml"
      },
      "name": "Run migration to Django DB",
      "program": "${workspaceFolder}/applications/sckanner/backend/manage.py",
      "request": "launch",
      "type": "debugpy"
    },
    {
      "args": [
        "runserver",
        "0.0.0.0:8000"
      ],
      "env": {
        "CH_CURRENT_APP_NAME": "sckanner",
        "CH_VALUES_PATH": "${workspaceFolder}/deployment/helm/values.yaml"
      },
      "name": "Django runserver",
      "program": "${workspaceFolder}/applications/sckanner/backend/manage.py",
      "request": "launch",
      "type": "debugpy"
    },
    {
      "cleanUp": false,
      "debug": [
        {
          "image": "cloudharness/sckanner",
          "sourceFileMap": {
            "${workspaceFolder}/applications/sckanner/backend": "/usr/src/app",
            "justMyCode": false
          }
        }
      ],
      "imageRegistry": "localhost:5000",
      "name": "CloudHarness: Run/Debug",
      "portForward": true,
      "request": "launch",
      "skaffoldConfig": "${workspaceFolder}/skaffold.yaml",
      "type": "cloudcode.kubernetes",
      "watch": true
    },
    {
      "args": [
        "shell"
      ],
      "env": {
        "CH_CURRENT_APP_NAME": "sckanner",
        "CH_VALUES_PATH": "${workspaceFolder}/deployment/helm/values.yaml"
      },
      "name": "Django shell",
      "program": "${workspaceFolder}/applications/sckanner/backend/manage.py",
      "request": "launch",
      "type": "debugpy"
    }
  ],
  "version": "0.2.0"
}
```


-----


## More Information About the Application

We are using keycloak - for authenticating the argo - so if you go to `argo.sckanner.dev.metacell.us` - then you will be redirected to the keycloak login page.
For accessing django admin - we are using django's authentication system. (Not connected to keycloak)



## Running Local with Port Forwardings to a Kubernetes Cluster
When you create port forwards to microservices in your k8s cluster you want to force your local backend server to initialize
the AuthService and EventService services.
This can be done by setting the `KUBERNETES_SERVICE_HOST` environment variable to a dummy or correct k8s service host.
The `KUBERNETES_SERVICE_HOST` switch will activate the creation of the keycloak client and client roles of this microservice.



## Run Cloudharness Deployment for Sckanner Locally
Depends on: CloudHarness CLI, Skaffold, Docker, kubectl. To run the deployment locally, follow the wsl-dev.sh script (It shows an example of how to run the deployment for the local environment in Windows WSL, however - it is same for mac and linux - check the kubectl commands for respective OS).


