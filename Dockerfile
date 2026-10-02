FROM node:22-alpine AS frontend

WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
ENV VITE_API_BASE_URL=/api
RUN npm run build

FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    sqlite3 \
    libsqlite3-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-install pdo pdo_sqlite mbstring gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY backend/ .
COPY --from=frontend /frontend/dist/ /app/public/
COPY entrypoint.sh /app/entrypoint.sh

RUN composer install --no-dev --optimize-autoloader

RUN touch database/database.sqlite
RUN chmod -R 777 storage bootstrap/cache database
RUN chmod +x /app/entrypoint.sh

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV APP_KEY=base64:99w81uP2p9hZ7/Q8V3B7+X1C2V3B4N5M6L7K8J9H0G1=
ENV DB_CONNECTION=sqlite
ENV DB_DATABASE=/app/database/database.sqlite
ENV PORT=8000

RUN cp .env.example .env \
 && php -r "file_put_contents('.env', preg_replace('/^APP_KEY=.*/m', 'APP_KEY='.getenv('APP_KEY'), file_get_contents('.env')));"

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
