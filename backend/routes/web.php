<?php

use Illuminate\Support\Facades\Route;

Route::get('/{path?}', function () {
    $index = public_path('index.html');

    if (! is_file($index)) {
        return view('welcome');
    }

    return response()->file($index);
})->where('path', '^(?!api(?:/|$)|up$|storage(?:/|$)).*$');
