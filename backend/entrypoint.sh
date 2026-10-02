#!/bin/sh
set -e

if [ ! -f .env ]; then
    cp .env.example .env
fi

# Laravel loads .env with a mutable dotenv loader, so a blank APP_KEY= in
# .env replaces the key injected by Docker or Render and every request dies
# with MissingAppKeyException. Write a real key before Artisan boots.
if [ -z "$APP_KEY" ] && ! grep -q "^APP_KEY=base64:" .env; then
    APP_KEY=$(php -r "echo 'base64:'.base64_encode(random_bytes(32));")
fi

if [ -n "$APP_KEY" ]; then
    grep -v "^APP_KEY=" .env > .env.tmp || true
    printf 'APP_KEY=%s\n' "$APP_KEY" >> .env.tmp
    mv .env.tmp .env
fi

php artisan migrate --force
php artisan db:seed --force

exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
