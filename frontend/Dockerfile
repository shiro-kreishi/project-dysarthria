FROM node:20-alpine AS build
LABEL authors="shiro-kreishi"
WORKDIR /app

COPY package.json yarn.lock ./
RUN corepack enable && yarn install
COPY . .
RUN yarn build
WORKDIR /app/build