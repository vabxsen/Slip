# Builds and runs @slip/server (the signaling server) for Cloud Run.
# Build context is the repo root (needed for the npm workspace: server
# depends on @slip/shared, which tsup bundles into a single dist file).

FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/package.json
COPY server/package.json server/package.json
COPY client/package.json client/package.json
RUN npm ci
COPY shared shared
COPY server server
RUN npm run build -w @slip/server

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/server/package.json ./package.json
# @slip/shared is a workspace-only reference (already bundled into dist by
# tsup) — strip it before installing, or npm 404s looking for it on the
# public registry.
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json'));delete p.dependencies['@slip/shared'];fs.writeFileSync('package.json',JSON.stringify(p));" \
  && npm install --omit=dev --ignore-scripts
COPY --from=build /app/server/dist ./dist
EXPOSE 8080
CMD ["node", "dist/index.js"]
