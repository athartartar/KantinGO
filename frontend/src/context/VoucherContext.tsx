import React, { createContext, useContext, useState } from "react";
import type { VoucherItem } from "../lib/mock";
import { mockInitialUserVouchers, mockRedeemableVouchers } from "../lib/mock";

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
  const [userVouchers, setUserVouchers] = useState<VoucherItem[]>(
    mockInitialUserVouchers
  );
  const [redeemedCodes, setRedeemedCodes] = useState<string[]>([]);

  const redeemVoucher = async (rawCode: string): Promise<RedeemResult> => {
    // Simulasi jeda pemrosesan singkat
    await new Promise((resolve) => setTimeout(resolve, 350));

    const normalizedCode = rawCode.trim().toUpperCase();
    if (!normalizedCode) {
      return {
        success: false,
        message: "Silakan masukkan kode voucher terlebih dahulu.",
      };
    }

    // Cek apakah kode sudah pernah ditukarkan sebelumnya
    if (redeemedCodes.includes(normalizedCode)) {
      return {
        success: false,
        message: `Kode "${normalizedCode}" sudah pernah kamu tukarkan sebelumnya.`,
      };
    }

    // Validasi terhadap daftar kode mock (tidak sensitif huruf besar/kecil)
    const matched = mockRedeemableVouchers.find(
      (v) => v.code.toUpperCase() === normalizedCode
    );

    if (!matched) {
      return {
        success: false,
        message: "Kode voucher tidak ditemukan atau sudah kedaluwarsa.",
      };
    }

    // Sukses: Buat item voucher baru dan tambahkan ke koleksi pengguna
    const newVoucher: VoucherItem = {
      ...matched,
      id: `redeemed-${Date.now()}-${matched.id}`,
      status: "active",
    };

    setUserVouchers((prev) => [newVoucher, ...prev]);
    setRedeemedCodes((prev) => [...prev, normalizedCode]);

    return {
      success: true,
      message: `Voucher ${matched.code} berhasil ditukarkan! Diskon Rp${new Intl.NumberFormat(
        "id-ID"
      ).format(matched.discount)} ditambahkan ke Voucher Saya.`,
      voucher: newVoucher,
    };
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
