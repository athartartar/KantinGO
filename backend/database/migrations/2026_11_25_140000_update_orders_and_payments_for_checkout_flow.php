<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('menunggu_pembayaran', 'diproses', 'siap', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'menunggu_pembayaran'");

        Schema::table('orders', function (Blueprint $table) {
            $table->string('idempotency_key', 100)->nullable()->after('notes');
            $table->unique(['user_id', 'idempotency_key'], 'orders_user_idempotency_unique');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropUnique('payments_order_id_unique');
            $table->index('order_id', 'payments_order_id_index');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');

            $table->renameColumn('payment_code', 'code');
            $table->renameColumn('provider_reference', 'reference');
        });

        DB::statement('ALTER TABLE payments MODIFY COLUMN code VARCHAR(40) NOT NULL');
        DB::statement("ALTER TABLE payments MODIFY COLUMN status ENUM('pending', 'paid', 'expired', 'refunded') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE payments MODIFY COLUMN status ENUM('pending', 'paid', 'expired', 'failed') NOT NULL DEFAULT 'pending'");
        DB::statement('ALTER TABLE payments MODIFY COLUMN code VARCHAR(64) NOT NULL');

        Schema::table('payments', function (Blueprint $table) {
            $table->renameColumn('code', 'payment_code');
            $table->renameColumn('reference', 'provider_reference');

            $table->dropForeign(['order_id']);
            $table->dropIndex('payments_order_id_index');
            $table->unique('order_id', 'payments_order_id_unique');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique('orders_user_idempotency_unique');
            $table->dropColumn('idempotency_key');
        });

        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('diproses', 'siap', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'diproses'");
    }
};
