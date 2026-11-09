import { PAYMENT_EXPIRY_MINUTES } from "../config/constants";

export type CreatePaymentInput = {
  orderId: string;
  orderCode: string;
  amount: number;
};

export type CreatePaymentResult = {
  method: string;
  qrString: string;
  expiresAt: Date;
  externalRef: string;
};

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
}

export class MockQrisProvider implements PaymentProvider {
  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const expiresAt = new Date(
      Date.now() + PAYMENT_EXPIRY_MINUTES * 60 * 1000
    );
    const externalRef = `QRIS-${input.orderCode}-${Date.now()}`;
    const qrString = `00020101021226${input.orderCode}52045812530336054${input.amount}5802ID5908KANTINGO6304${input.orderCode.slice(-4)}`;

    return {
      method: "qris",
      qrString,
      expiresAt,
      externalRef,
    };
  }
}

export const defaultPaymentProvider: PaymentProvider = new MockQrisProvider();
