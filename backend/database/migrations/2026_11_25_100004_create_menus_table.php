<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->foreignId('warung_id')->constrained('warungs')->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->string('name')->index();
            $table->text('description')->nullable();
            $table->unsignedInteger('price');
            $table->string('image_path')->nullable();
            $table->boolean('is_available')->default(true)->index();
            $table->decimal('rating_avg', 3, 2)->default(0.00);
            $table->unsignedInteger('sold_count')->default(0);
            $table->timestamps();

            $table->index('warung_id');
            $table->index('category_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
