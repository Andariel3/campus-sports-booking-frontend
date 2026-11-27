# ---------- Etapa 1: build Vite ----------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# API-ul este servit de nginx pe aceeași origine (/api -> backend), deci URL relativ:
# funcționează identic pe localhost, în rețeaua Docker și printr-un tunel public.
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL \
    VITE_API_BASE_URL=$VITE_API_URL
RUN npm run build

# ---------- Etapa 2: servire statică ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
