<?php

return [
    'driver' => env('PAYMENT_DRIVER', 'simulator'),
    'simulator_enabled' => filter_var(env('PAYMENT_SIMULATOR_ENABLED', true), FILTER_VALIDATE_BOOLEAN),
    'frontend_url' => rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/'),
    'expiry_minutes' => 15,
];
