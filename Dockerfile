# Storybook static site for Railway.
#
# This image is ONLY for hosting the component-library Storybook. It is
# unrelated to the npm package (which ships from `dist/` via the publish
# workflow). Railway injects $PORT at runtime; `serve` binds to it.
#
# Node 20 (alpine) matches the project's tested toolchain (CI uses 20 LTS).

# ---- Build stage --------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Install deps first so this layer caches unless the lockfile changes.
# `npm ci` keeps devDependencies — Storybook + its builder live there and
# are required by `build-storybook`.
COPY package.json package-lock.json ./
RUN npm ci

# Source needed by the Storybook build: src/ (stories, fonts referenced
# by .storybook/fonts.css), .storybook/ config, public/ (staticDirs),
# tsconfig, postcss config. `.dockerignore` trims the rest.
COPY . .
RUN npm run build-storybook

# ---- Runtime stage ------------------------------------------------------
FROM node:20-alpine AS runtime
WORKDIR /app

# `serve` (pinned major) is a tiny, battle-tested static file server.
RUN npm install -g serve@14

COPY --from=build /app/storybook-static ./storybook-static

# Local-run fallback; Railway overrides PORT.
ENV PORT=3000
EXPOSE 3000

# No `-s` (SPA rewrite): Storybook has multiple real HTML entrypoints
# (index.html, iframe.html) and routes via `?path=` query params, so
# plain static serving is correct.
CMD ["sh", "-c", "serve storybook-static -l ${PORT}"]
