<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// A blank APP_KEY= in .env overrides Docker/Render and makes Laravel throw
// MissingAppKeyException. Fill it before the framework loads the env file.
$appKey = getenv('APP_KEY');
if (! is_string($appKey) || ! str_starts_with($appKey, 'base64:')) {
    $appKey = 'base64:99w81uP2p9hZ7/Q8V3B7+X1C2V3B4N5M6L7K8J9H0G1=';
}
putenv('APP_KEY='.$appKey);
$_ENV['APP_KEY'] = $appKey;
$_SERVER['APP_KEY'] = $appKey;

$envFile = __DIR__.'/../.env';
if (is_file($envFile) && is_writable($envFile)) {
    $contents = file_get_contents($envFile);
    if (is_string($contents) && ! preg_match('/^APP_KEY=base64:/m', $contents)) {
        $contents = preg_match('/^APP_KEY=.*/m', $contents)
            ? preg_replace('/^APP_KEY=.*/m', 'APP_KEY='.$appKey, $contents)
            : $contents.PHP_EOL.'APP_KEY='.$appKey;
        file_put_contents($envFile, $contents);
    }
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
