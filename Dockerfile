# syntax=docker/dockerfile:1

# ---- Base ----
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# ---- Dependencies (cached layer) ----
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install

# ---- Build (frontend + backend) ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Baked into the frontend bundle at build time — safe to expose (it's the PUBLIC site key).
ARG VITE_TURNSTILE_SITE_KEY
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY
RUN npx prisma generate
RUN npm run build:all
# Strip devDependencies from the ALREADY-installed, already-verified tree instead of
# doing a second fresh `npm install --omit=dev` in the runner stage. A second fresh
# install triggers a known npm/esbuild bug: with two esbuild versions in the tree
# (vite's ~0.25.x and tsx's nested ~0.28.x), a second independent install run can
# mis-link the platform binaries between them ("Expected X but got Y"). Pruning an
# already-correct tree just deletes folders — it doesn't re-run install scripts or
# re-resolve platform binaries, so it can't hit that bug.
RUN npm prune --omit=dev

# ---- Production runtime ----
FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
COPY --from=build /app/prisma ./prisma

EXPOSE 3000

# Applies any pending migrations, then starts the server. Safe to run on every
# deploy — prisma migrate deploy is a no-op if the schema is already current.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist-server/index.js"]
