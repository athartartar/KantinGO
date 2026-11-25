<?php

namespace App\Providers;

use App\Contracts\PaymentGateway;
use App\Services\Payment\SimulatorPaymentGateway;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PaymentGateway::class, function () {
            return match (config('payment.driver')) {
                'simulator' => new SimulatorPaymentGateway(),
                default => new SimulatorPaymentGateway(),
            };
        });
    }

    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by((string) ($request->user()?->id ?: $request->ip()));
        });

        RateLimiter::for('auth', function (Request $request) {
            $email = strtolower((string) $request->input('email', ''));

            return Limit::perMinute(5)->by($request->ip().'|'.$email);
        });

        RateLimiter::for('payment-simulate-read', function (Request $request) {
            return Limit::perMinute(20)->by($request->ip());
        });

        RateLimiter::for('payment-simulate-pay', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });
    }
}
