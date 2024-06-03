ARG NODE_PARENT=node:18

FROM  ${NODE_PARENT} as frontend
ARG VITE_COMPOSER_API_URL
ENV VITE_COMPOSER_API_URL=$VITE_COMPOSER_API_URL
ENV BUILDDIR=/app

WORKDIR ${BUILDDIR}
COPY package.json ${BUILDDIR}
COPY yarn.lock ${BUILDDIR}
COPY nginx/default.conf ${BUILDDIR}
COPY replace_env_vars.sh ${BUILDDIR}

RUN yarn install
COPY . ${BUILDDIR}
RUN yarn build
RUN /bin/sh replace_env_vars.sh './dist/*.js'


FROM nginx:1.19.3-alpine

RUN cat /etc/nginx/conf.d/default.conf

COPY --from=frontend /app/default.conf  /etc/nginx/conf.d/default.conf

COPY --from=frontend /app/dist /usr/share/nginx/html/

EXPOSE 80
