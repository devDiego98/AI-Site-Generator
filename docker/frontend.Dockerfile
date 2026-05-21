FROM node:22-alpine AS build
WORKDIR /app

ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

COPY package.json ./
COPY packages/types ./packages/types
COPY frontend/package.json ./frontend/

RUN npm install --workspace=frontend --workspace=packages/types

COPY frontend ./frontend

WORKDIR /app/frontend
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY docker/nginx-frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
