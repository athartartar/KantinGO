<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warungs', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->foreignId('owner_id')->unique()->constrained('users')->onDelete('cascade');
            $table->foreignId('canteen_id')->nullable()->constrained('canteens')->onDelete('set null');
            $table->string('name')->index();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->string('opening_hours', 50)->nullable();
            $table->string('logo_path')->nullable();
            $table->unsignedSmallInteger('estimated_minutes')->default(10);
            $table->decimal('rating_avg', 3, 2)->default(0.00);
            $table->unsignedInteger('review_count')->default(0);
            $table->enum('status', ['pending', 'approved', 'rejected', 'suspended'])->default('pending')->index();
            $table->text('rejection_reason')->nullable();
            $table->boolean('is_open')->default(false)->index();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index('canteen_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warungs');
    }
};
