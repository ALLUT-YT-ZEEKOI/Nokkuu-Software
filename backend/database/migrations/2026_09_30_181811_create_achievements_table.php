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
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g. first_goal, streak_7, tasks_100, first_challenge, helped_friend
            $table->string('name');
            $table->text('description');
            $table->string('icon')->default('trophy');
            $table->string('badge_color')->default('#f59e0b');
            $table->integer('points')->default(100);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('achievements');
    }
};
