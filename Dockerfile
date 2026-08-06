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

# ---- Production runtime ----
FROM base AS runner
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
COPY --from=build /app/prisma ./prisma

EXPOSE 3000

# Applies any pending migrations, then starts the server. Safe to run on every
# deploy — prisma migrate deploy is a no-op if the schema is already current.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist-server/index.js"]
