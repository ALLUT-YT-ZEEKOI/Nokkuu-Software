<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('buying_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->decimal('estimated_price', 10, 2);
            $table->string('priority')->default('medium'); // low, medium, high
            $table->string('status')->default('wishlist'); // wishlist, planned, purchased
            $table->string('category')->default('General'); // Office, Personal, Tech, Purchase
            $table->string('store_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('buying_items');
    }
};
