<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('warung_id')->constrained('warungs')->onDelete('cascade');
            $table->foreignId('order_id')->unique()->constrained('orders')->onDelete('cascade');
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('warung_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
