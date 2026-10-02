<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('habits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('frequency', ['daily', 'weekly'])->default('daily');
            $table->integer('target_days_per_week')->default(7);
            $table->string('category')->default('General');
            $table->string('color')->default('#ec4899');
            $table->string('icon')->default('flame');
            $table->integer('current_streak')->default(0);
            $table->integer('best_streak')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('habits');
    }
};
