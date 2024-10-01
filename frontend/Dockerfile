FROM node:20-alpine AS builder
LABEL authors="shiro-kreishi"
ENV NODE_ENV production

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build
#WORKDIR /app/build

# Bundle static assets with nginx
FROM nginx:latest as production
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
