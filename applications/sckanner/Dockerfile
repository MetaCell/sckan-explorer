ARG CLOUDHARNESS_FRONTEND_BUILD
ARG CLOUDHARNESS_DJANGO

FROM $CLOUDHARNESS_FRONTEND_BUILD AS frontend

ARG APP_DIR=/app
ARG VITE_REACT_APP_GA4_ID

ENV VITE_REACT_APP_GA4_ID=${VITE_REACT_APP_GA4_ID}
RUN echo "VITE_REACT_APP_GA4_ID=${VITE_REACT_APP_GA4_ID}" > .env

WORKDIR ${APP_DIR}
COPY frontend/package.json .
COPY frontend/yarn.lock .
RUN yarn install --timeout 60000

COPY frontend .
# TODO: these 2 run below should be removed and the issue should be fixed within the codebase
RUN cp ./src/components/assets/svg/maximize_icon.png ./node_modules/@metacell/geppetto-meta-ui/flex-layout/images/maximize.png
RUN cp ./src/components/assets/svg/minimize_icon.png ./node_modules/@metacell/geppetto-meta-ui/flex-layout/images/restore.png
RUN yarn build

#####

FROM $CLOUDHARNESS_DJANGO

WORKDIR ${APP_DIR}
RUN mkdir -p ${APP_DIR}/static/www

# Update system packages to fix:
# CVE-2023-45853 (zlib), CVE-2024-38428 (wget), CVE-2023-52425 (libexpat), CVE-2021-3575 (openjpeg),
# CVE-2024-25062 (libxml2), and CVE-2023-52355 (libtiff)
RUN apt-get update && \
    apt-get upgrade -y zlib1g wget libexpat1 libopenjp2-7 libxml2 libtiff5 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ${APP_DIR}
RUN --mount=type=cache,target=/root/.cache python -m pip install --upgrade pip &&\
    pip3 install --no-cache-dir -r requirements.txt --prefer-binary

COPY backend/requirements.txt backend/setup.py ${APP_DIR}
RUN python3 -m pip install -e .

COPY backend ${APP_DIR}
RUN python3 manage.py collectstatic --noinput

COPY --from=frontend /app/dist ${APP_DIR}/static/www

ENTRYPOINT uvicorn --workers ${WORKERS} --host 0.0.0.0 --port ${PORT} django_baseapp.asgi:application
