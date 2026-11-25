<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->string('order_code', 40)->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('warung_id')->constrained('warungs')->onDelete('restrict');
            $table->foreignId('voucher_id')->nullable()->constrained('vouchers')->onDelete('set null');
            $table->string('pickup_time', 50);
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('discount')->default(0);
            $table->unsignedInteger('service_fee')->default(0);
            $table->unsignedInteger('total');
            $table->enum('status', ['diproses', 'siap', 'selesai', 'dibatalkan'])->default('diproses')->index();
            $table->text('notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('warung_id');
            $table->index('voucher_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
