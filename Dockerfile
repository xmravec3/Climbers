FROM node:20-slim as node

WORKDIR /usr/src/app

COPY package*.json tsconfig*.json angular.json ./
COPY src ./src

RUN npm install
RUN npm run build:docker

FROM nginx:1.25-alpine

RUN apk add bash

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=node /usr/src/app/dist/climber /usr/share/nginx/html

EXPOSE 80
