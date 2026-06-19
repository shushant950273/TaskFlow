# ─── Stage 1: Build ───────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --production=false

# Copy source and build
COPY . .

# Accept build-time env vars for Vite (VITE_* vars are baked into the bundle)
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GITHUB_CLIENT_ID

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_GITHUB_CLIENT_ID=$VITE_GITHUB_CLIENT_ID

RUN npm run build

# ─── Stage 2: Serve via Nginx ─────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
