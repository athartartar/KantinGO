/**
 * Format angka menjadi representasi Rupiah sesuai panduan UI KantinGO: "Rp 18.000"
 */
export function formatRupiah(amount: number): string {
  const formatted = Math.round(amount).toLocaleString("id-ID");
  return `Rp ${formatted}`;
}
