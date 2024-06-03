ARG NODE_PARENT=node:18
ARG VITE_COMPOSER_API_URL

FROM  ${NODE_PARENT} as frontend

ENV BUILDDIR=/app

WORKDIR ${BUILDDIR}
COPY package.json ${BUILDDIR}
COPY yarn.lock ${BUILDDIR}
COPY nginx/default.conf ${BUILDDIR}

RUN yarn install
COPY . ${BUILDDIR}

# Generate the .env file with ARG values
RUN echo "VITE_COMPOSER_API_URL=${VITE_COMPOSER_API_URL}" > .env

RUN yarn build

FROM nginx:1.19.3-alpine

RUN cat /etc/nginx/conf.d/default.conf

COPY --from=frontend /app/default.conf  /etc/nginx/conf.d/default.conf

COPY --from=frontend /app/dist /usr/share/nginx/html/

EXPOSE 80
