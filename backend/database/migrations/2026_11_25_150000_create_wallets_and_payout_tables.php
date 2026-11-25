<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->enum('type', ['platform', 'partner'])->index();
            $table->foreignId('user_id')->nullable()->unique()->constrained('users')->onDelete('cascade');
            $table->bigInteger('pending_balance')->default(0);
            $table->bigInteger('available_balance')->default(0);
            $table->timestamps();
        });

        DB::statement('ALTER TABLE wallets ADD CONSTRAINT chk_wallets_pending_non_negative CHECK (pending_balance >= 0)');
        DB::statement('ALTER TABLE wallets ADD CONSTRAINT chk_wallets_available_non_negative CHECK (available_balance >= 0)');

        Schema::create('partner_bank_accounts', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->string('bank_name', 100);
            $table->string('account_holder', 150);
            $table->text('account_number');
            $table->timestamps();
        });

        Schema::create('withdrawals', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('amount');
            $table->enum('status', ['success', 'failed'])->default('success')->index();
            $table->string('reference', 64)->unique();
            $table->string('idempotency_key', 100)->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->unique(['user_id', 'idempotency_key'], 'withdrawals_user_idempotency_unique');
        });

        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->foreignId('wallet_id')->constrained('wallets')->onDelete('restrict');
            $table->enum('type', ['payment_in', 'hold', 'release', 'refund', 'withdrawal', 'fee'])->index();
            $table->bigInteger('amount');
            $table->bigInteger('balance_after');
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');
            $table->foreignId('withdrawal_id')->nullable()->constrained('withdrawals')->onDelete('set null');
            $table->string('reference', 80)->unique();
            $table->timestamp('created_at')->useCurrent();

            $table->index('wallet_id');
            $table->index('order_id');
            $table->index('withdrawal_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('withdrawals');
        Schema::dropIfExists('partner_bank_accounts');
        Schema::dropIfExists('wallets');
    }
};
