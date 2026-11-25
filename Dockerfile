# Stage 1: Build the Vite React bundle
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Pass VITE_* values at build time so Vite embeds them into the bundle
ARG VITE_APP_NAME=React Docker Lab
ARG VITE_API_URL=http://localhost:8080
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
