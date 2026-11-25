<?php

namespace App\Contracts;

use App\Models\Order;
use App\Models\Payment;

interface PaymentGateway
{
    public function createPayment(Order $order): Payment;
}
