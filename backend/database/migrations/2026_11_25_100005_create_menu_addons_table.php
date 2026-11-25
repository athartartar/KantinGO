<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_addons', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->foreignId('menu_id')->constrained('menus')->onDelete('cascade');
            $table->string('group_key', 80)->index();
            $table->string('group_title');
            $table->enum('selection_type', ['single', 'multiple'])->default('single');
            $table->boolean('is_required')->default(false);
            $table->string('option_name');
            $table->unsignedInteger('additional_price')->default(0);
            $table->boolean('is_available')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('menu_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_addons');
    }
};
