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
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('email');
            $table->string('bio')->nullable()->after('avatar');
            $table->integer('streak_count')->default(0)->after('bio');
            $table->integer('highest_streak')->default(0)->after('streak_count');
            $table->integer('tasks_completed')->default(0)->after('highest_streak');
            $table->integer('total_points')->default(0)->after('tasks_completed');
            $table->integer('level')->default(1)->after('total_points');
            $table->string('title')->default('Growth Novice')->after('level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar', 'bio', 'streak_count', 'highest_streak', 'tasks_completed', 'total_points', 'level', 'title']);
        });
    }
};
