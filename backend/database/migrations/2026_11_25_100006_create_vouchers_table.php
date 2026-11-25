<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->string('code', 50)->unique();
            $table->string('title');
            $table->enum('type', ['persen', 'nominal'])->default('nominal');
            $table->unsignedInteger('value');
            $table->unsignedInteger('min_spend')->default(0);
            $table->unsignedInteger('max_discount')->nullable();
            $table->unsignedInteger('quota')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable()->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
