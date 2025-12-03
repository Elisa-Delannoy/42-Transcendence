# ----------------------------
# 1) BASE STAGE – Tools + Dependencies
# ----------------------------
FROM node:20-alpine AS base
WORKDIR /app

# Install Python + SQLite
RUN apk add --no-cache python3 sqlite sqlite-dev build-base

# Install dependencies first (cache optimization)
COPY package*.json ./
RUN npm install

# Add project files (for build stage)
COPY . .

# ----------------------------
# 2) BUILD STAGE – CSS, Frontend, Backend TS build
# ----------------------------
FROM base AS build

# 1) Build CSS
RUN npm run css

# 2) Build frontend bundle
RUN npm run front

# 3) Build backend (but tsx only runs server.ts, so we must compile TS)
# Create dist/ for production: use tsc
RUN npx tsc -p tsconfig.json

# ----------------------------
# 3) PRODUCTION STAGE – Only runtime dependencies
# ----------------------------
FROM node:20-alpine AS production
WORKDIR /app

# Install SQLite + Python (runtime if needed)
RUN apk add --no-cache python3 sqlite

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy build output and public files
COPY --from=build /app/dist ./
COPY --from=build /app/front/public ./front/public

# Copy all key, images, db, etc
COPY . /app/

# Expose backend port
EXPOSE 3000

# Start backend from compiled JS
CMD ["node", "./back/server.js"]
