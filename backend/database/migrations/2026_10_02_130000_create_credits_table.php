<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->decimal('amount', 10, 2);
            $table->string('received_from')->nullable(); // Who gave the cash / credit
            $table->string('payment_method')->default('Cash'); // Cash, UPI, Bank Transfer, Cheque
            $table->string('category')->default('Personal'); // Office, Personal, Friend, Salary, Freelance
            $table->date('date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credits');
    }
};
