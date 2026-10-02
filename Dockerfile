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

RUN composer install --no-dev --optimize-autoloader

RUN cp .env.example .env || true
RUN touch database/database.sqlite
RUN chmod -R 777 storage bootstrap/cache database

ENV APP_ENV=production
ENV APP_DEBUG=true
ENV APP_KEY=base64:99w81uP2p9hZ7/Q8V3B7+X1C2V3B4N5M6L7K8J9H0G1=
ENV DB_CONNECTION=sqlite
ENV DB_DATABASE=/app/database/database.sqlite
ENV PORT=8000

EXPOSE 8000

CMD php artisan key:generate --force && php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
