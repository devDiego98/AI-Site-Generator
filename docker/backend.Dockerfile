FROM node:22-alpine AS build
WORKDIR /app

COPY package.json ./
COPY packages/types ./packages/types
COPY backend/package.json ./backend/

RUN npm install --workspace=backend --workspace=packages/types

COPY backend ./backend

WORKDIR /app/backend
RUN npm run build

FROM node:22-alpine
WORKDIR /app/backend
ENV NODE_ENV=production

COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/package.json ./
COPY --from=build /app/node_modules/@ai-ui-builder ./node_modules/@ai-ui-builder

EXPOSE 3000
CMD ["node", "dist/main.js"]
