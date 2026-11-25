import React, { createContext, useContext, useEffect, useState } from "react";
import type { VoucherItem } from "../lib/mock";
import { getLocalVouchers, getVouchers, redeemVoucher as redeemVoucherApi } from "../lib/api";
import { isAuthenticated, isMockMode } from "../lib/auth";

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
  clearVouchers: () => void;
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

  useEffect(() => {
    if (!isMockMode() && isAuthenticated()) {
      getVouchers()
        .then((list) => setUserVouchers(list))
        .catch(() => {});
    }
  }, []);

  const redeemVoucher = async (rawCode: string): Promise<RedeemResult> => {
    const result = await redeemVoucherApi(rawCode);
    if (result.success && result.voucher) {
      if (!isMockMode() && isAuthenticated()) {
        getVouchers().then(setUserVouchers).catch(() => {});
      } else {
        setUserVouchers(getLocalVouchers());
      }
      try {
        const raw = localStorage.getItem("kantingo_redeemed_codes_v1");
        setRedeemedCodes(raw ? JSON.parse(raw) : []);
      } catch {}
    }
    return result;
  };

  const clearVouchers = () => {
    setUserVouchers([]);
    setRedeemedCodes([]);
    try {
      localStorage.removeItem("kantingo_redeemed_codes_v1");
      localStorage.removeItem("kantingo_user_vouchers_v1");
    } catch {}
  };

  return (
    <VoucherContext.Provider
      value={{
        userVouchers,
        voucherCount: userVouchers.length,
        redeemedCodes,
        redeemVoucher,
        clearVouchers,
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
