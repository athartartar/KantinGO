import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowDownCircle,
  Banknote,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Wallet,
} from "lucide-react";
import { partnerApi, type PaginationMeta } from "../../lib/api";
import { formatRupiah } from "../../lib/format";

const PAYOUT_MIN_AMOUNT = 10000;

function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `wd-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function PartnerWallet() {
  const [pendingBalance, setPendingBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [bankAccount, setBankAccount] = useState<{
    bank_name: string;
    account_holder: string;
    account_number_masked: string;
  } | null>(null);

  // Form rekening
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [savingBank, setSavingBank] = useState(false);

  // Form tarik saldo
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const withdrawLockRef = useRef(false);
  const idempotencyKeyRef = useRef<string>(generateIdempotencyKey());

  // Riwayat transaksi & pencairan
  const [historyTab, setHistoryTab] = useState<"transactions" | "withdrawals">("transactions");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txMeta, setTxMeta] = useState<PaginationMeta | null>(null);
  const [txPage, setTxPage] = useState(1);

  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [wdMeta, setWdMeta] = useState<PaginationMeta | null>(null);
  const [wdPage, setWdPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadWallet = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const data = await partnerApi.getWallet(page);
      setPendingBalance(data.pending_balance ?? 0);
      setAvailableBalance(data.available_balance ?? 0);
      setBankAccount(data.bank_account ?? null);
      if (data.bank_account) {
        setBankName((prev) => prev || data.bank_account!.bank_name);
        setAccountHolder((prev) => prev || data.bank_account!.account_holder);
      }
      setTransactions(data.transactions || []);
      setTxMeta(data.meta || null);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat data dompet.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWithdrawals = useCallback(async (page = 1) => {
    try {
      const res = await partnerApi.getWithdrawals(page);
      setWithdrawals(res.items || []);
      setWdMeta(res.meta || null);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat riwayat pencairan.");
    }
  }, []);

  useEffect(() => {
    loadWallet(txPage);
  }, [loadWallet, txPage]);

  useEffect(() => {
    loadWithdrawals(wdPage);
  }, [loadWithdrawals, wdPage]);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!bankName.trim() || !accountHolder.trim() || !accountNumber.trim()) {
      setError("Nama bank, nama pemilik, dan nomor rekening wajib diisi.");
      return;
    }

    setSavingBank(true);
    try {
      const saved = await partnerApi.updateBankAccount({
        bank_name: bankName.trim(),
        account_holder: accountHolder.trim(),
        account_number: accountNumber.trim(),
      });
      setBankAccount(saved);
      setAccountNumber("");
      setSuccessMsg("Rekening bank berhasil disimpan.");
    } catch (err: any) {
      setError(err?.message || "Gagal menyimpan rekening bank.");
    } finally {
      setSavingBank(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawLockRef.current || withdrawing) return;

    setError("");
    setSuccessMsg("");

    if (!bankAccount) {
      setError("Simpan rekening bank terlebih dahulu sebelum menarik saldo.");
      return;
    }

    const amount = Number(withdrawAmount);
    if (!Number.isInteger(amount) || amount < PAYOUT_MIN_AMOUNT) {
      setError(`Minimal penarikan saldo adalah ${formatRupiah(PAYOUT_MIN_AMOUNT)}.`);
      return;
    }
    if (amount > availableBalance) {
      setError("Nominal penarikan tidak boleh melebihi saldo tersedia.");
      return;
    }

    withdrawLockRef.current = true;
    setWithdrawing(true);
    try {
      await partnerApi.withdraw(amount, idempotencyKeyRef.current);
      idempotencyKeyRef.current = generateIdempotencyKey();
      setWithdrawAmount("");
      setSuccessMsg("Permintaan tarik saldo berhasil diproses.");
      await Promise.all([loadWallet(1), loadWithdrawals(1)]);
      setTxPage(1);
      setWdPage(1);
    } catch (err: any) {
      setError(err?.message || "Gagal memproses penarikan saldo.");
    } finally {
      withdrawLockRef.current = false;
      setWithdrawing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-5 md:py-8 space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-navy tracking-tight">
          Dompet & Pencairan
        </h1>
        <p className="text-xs text-navy/60">
          Pantau saldo masuk, atur rekening tujuan, dan tarik saldo warung.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Kartu Saldo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy/60 font-medium">Saldo Tertahan</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">
              {formatRupiah(pendingBalance)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-navy/60 font-medium">Saldo Tersedia</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">
              {formatRupiah(availableBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Rekening & Tarik Saldo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Form Rekening Bank */}
        <form
          onSubmit={handleSaveBank}
          className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-3.5"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-navy">Rekening Pencairan</h2>
          </div>

          {bankAccount && (
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs space-y-0.5">
              <p className="font-bold text-navy">
                {bankAccount.bank_name} • {bankAccount.account_number_masked}
              </p>
              <p className="text-navy/70">a.n. {bankAccount.account_holder}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Nama Bank / E-Wallet
            </label>
            <input
              type="text"
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Contoh: BCA / BRI / Mandiri"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Nama Pemilik Rekening
            </label>
            <input
              type="text"
              required
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="Sesuai buku tabungan"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Nomor Rekening Baru
            </label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder={
                bankAccount
                  ? `Saat ini: ${bankAccount.account_number_masked}`
                  : "Masukkan nomor rekening"
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={savingBank}
            className="w-full py-3 rounded-xl border border-primary text-primary hover:bg-blue-50 disabled:opacity-50 text-xs font-bold cursor-pointer"
          >
            {savingBank ? "Menyimpan..." : "Simpan Rekening"}
          </button>
        </form>

        {/* Form Tarik Saldo */}
        <form
          onSubmit={handleWithdraw}
          className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-3.5 flex flex-col justify-between"
        >
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-navy">Tarik Saldo</h2>
            </div>

            <p className="text-xs text-navy/60">
              Minimal penarikan {formatRupiah(PAYOUT_MIN_AMOUNT)}. Maksimal{" "}
              {formatRupiah(availableBalance)}.
            </p>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">
                Nominal Penarikan (Rp)
              </label>
              <input
                type="number"
                min={PAYOUT_MIN_AMOUNT}
                max={availableBalance > 0 ? availableBalance : undefined}
                required
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="10000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={withdrawing || availableBalance < PAYOUT_MIN_AMOUNT}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            {withdrawing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowDownCircle className="w-4 h-4" />
            )}
            <span>{withdrawing ? "Memproses..." : "Tarik saldo"}</span>
          </button>
        </form>
      </div>

      {/* Riwayat Transaksi & Pencairan */}
      <section className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-4">
        <div className="grid grid-cols-2 gap-2 bg-surface p-1 rounded-xl max-w-sm">
          <button
            type="button"
            onClick={() => setHistoryTab("transactions")}
            className={`py-2 px-3 rounded-lg text-xs font-bold cursor-pointer ${
              historyTab === "transactions"
                ? "bg-white text-primary shadow-xs"
                : "text-navy/65"
            }`}
          >
            Riwayat Transaksi
          </button>
          <button
            type="button"
            onClick={() => setHistoryTab("withdrawals")}
            className={`py-2 px-3 rounded-lg text-xs font-bold cursor-pointer ${
              historyTab === "withdrawals"
                ? "bg-white text-primary shadow-xs"
                : "text-navy/65"
            }`}
          >
            Riwayat Pencairan
          </button>
        </div>

        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : historyTab === "transactions" ? (
          transactions.length === 0 ? (
            <p className="text-xs text-navy/60 py-6 text-center">
              Belum ada riwayat transaksi dompet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="border border-slate-100 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-navy">{tx.description || tx.type}</p>
                    <p className="text-[11px] text-navy/55">{tx.created_at}</p>
                  </div>
                  <span
                    className={`font-black ${
                      tx.direction === "credit" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {tx.direction === "credit" ? "+" : "-"}
                    {formatRupiah(Math.abs(Number(tx.amount ?? 0)))}
                  </span>
                </div>
              ))}

              {txMeta && txMeta.last_page > 1 && (
                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    disabled={txPage <= 1}
                    onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Sebelumnya
                  </button>
                  <span className="text-navy/65">
                    Halaman {txMeta.current_page} dari {txMeta.last_page}
                  </span>
                  <button
                    type="button"
                    disabled={txPage >= txMeta.last_page}
                    onClick={() => setTxPage((p) => p + 1)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
                  >
                    Berikutnya
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )
        ) : withdrawals.length === 0 ? (
          <p className="text-xs text-navy/60 py-6 text-center">
            Belum ada riwayat pencairan dana.
          </p>
        ) : (
          <div className="space-y-2.5">
            {withdrawals.map((wd) => (
              <div
                key={wd.id}
                className="border border-slate-100 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-bold text-navy">{wd.reference || `WD-${wd.id}`}</p>
                  <p className="text-[11px] text-navy/55">
                    Status: <span className="font-semibold">{wd.status}</span> •{" "}
                    {wd.created_at}
                  </p>
                </div>
                <span className="font-black text-navy">
                  {formatRupiah(wd.amount ?? 0)}
                </span>
              </div>
            ))}

            {wdMeta && wdMeta.last_page > 1 && (
              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  disabled={wdPage <= 1}
                  onClick={() => setWdPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Sebelumnya
                </button>
                <span className="text-navy/65">
                  Halaman {wdMeta.current_page} dari {wdMeta.last_page}
                </span>
                <button
                  type="button"
                  disabled={wdPage >= wdMeta.last_page}
                  onClick={() => setWdPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  Berikutnya
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
