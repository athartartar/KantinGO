import React, { createContext, useContext, useState } from "react";
import type { VoucherItem } from "../lib/mock";
import { getLocalVouchers, redeemVoucher as redeemVoucherApi } from "../lib/api";

export interface RedeemResult {
  success: boolean;
  message: string;
  voucher?: VoucherItem;
}

export interface VoucherContextType {
  userVouchers: VoucherItem[];
  voucherCount: number;
  redeemedCodes: string[];
  redeemVoucher: (code: string) => Promise<RedeemResult>;
}

const VoucherContext = createContext<VoucherContextType | undefined>(undefined);

export function VoucherProvider({ children }: { children: React.ReactNode }) {
  const [userVouchers, setUserVouchers] = useState<VoucherItem[]>(() => {
    return getLocalVouchers();
  });
  const [redeemedCodes, setRedeemedCodes] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("kantingo_redeemed_codes_v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const redeemVoucher = async (rawCode: string): Promise<RedeemResult> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const result = await redeemVoucherApi(rawCode);
    if (result.success && result.voucher) {
      setUserVouchers(getLocalVouchers());
      try {
        const raw = localStorage.getItem("kantingo_redeemed_codes_v1");
        setRedeemedCodes(raw ? JSON.parse(raw) : []);
      } catch {}
    }
    return result;
  };

  return (
    <VoucherContext.Provider
      value={{
        userVouchers,
        voucherCount: userVouchers.length,
        redeemedCodes,
        redeemVoucher,
      }}
    >
      {children}
    </VoucherContext.Provider>
  );
}

export function useVoucher(): VoucherContextType {
  const context = useContext(VoucherContext);
  if (!context) {
    throw new Error("useVoucher must be used within a VoucherProvider");
  }
  return context;
}
