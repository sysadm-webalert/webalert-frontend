FROM node:20.18.1 AS build
WORKDIR /app
COPY src/ /app/src/
COPY public/ /app/public/
COPY package*.json ./
COPY index.html ./
COPY vite.config.js ./
RUN npm install --ignore-scripts
RUN mv /app/src/api/api.js.docker /app/src/api/api.js
ARG VITE_VUE_APP_API_BASE_URL
ENV VITE_VUE_APP_API_BASE_URL=$VITE_VUE_APP_API_BASE_URL
RUN npm run build

FROM nginx:1.27.3
WORKDIR /app
COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /var/run/
USER nginx