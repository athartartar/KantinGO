<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('menu_id')->nullable()->constrained('menus')->onDelete('set null');
            $table->string('menu_name');
            $table->string('menu_image')->nullable();
            $table->unsignedSmallInteger('quantity');
            $table->unsignedInteger('unit_price');
            $table->json('addons_snapshot')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedInteger('subtotal');
            $table->timestamps();

            $table->index('order_id');
            $table->index('menu_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
