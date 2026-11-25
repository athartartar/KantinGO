<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->foreignId('order_id')->unique()->constrained('orders')->onDelete('cascade');
            $table->string('payment_code', 64)->unique();
            $table->string('method', 30)->default('qris');
            $table->unsignedInteger('amount');
            $table->enum('status', ['pending', 'paid', 'expired', 'failed'])->default('pending')->index();
            $table->text('qris_payload')->nullable();
            $table->string('provider_reference')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
