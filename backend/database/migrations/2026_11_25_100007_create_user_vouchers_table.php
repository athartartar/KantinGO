<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_vouchers', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('voucher_id')->constrained('vouchers')->onDelete('cascade');
            $table->enum('status', ['active', 'used', 'expired'])->default('active')->index();
            $table->timestamp('claimed_at')->nullable();
            $table->timestamp('used_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'voucher_id']);
            $table->index('user_id');
            $table->index('voucher_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_vouchers');
    }
};
