<?php

return [
    'platform_fee_percent' => (float) env('PLATFORM_FEE_PERCENT', 0),
    'payout_min_amount' => (int) env('PAYOUT_MIN_AMOUNT', 10000),
];
