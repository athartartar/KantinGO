import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Save,
  Store,
} from "lucide-react";
import { partnerApi } from "../../lib/api";
import { getAuthUser } from "../../lib/auth";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export default function PartnerWarung() {
  const authUser = getAuthUser();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [location, setLocation] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("10");
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoFileName, setPhotoFileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadWarung = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const w = await partnerApi.getWarung();
      setName(w.name || "");
      setDescription(w.description || "");
      setOpeningHours(w.opening_hours || "");
      setLocation(w.location || "");
      setEstimatedMinutes(String(w.estimated_minutes ?? 10));
      setPhotoPreview(w.logo_path || "");
    } catch (err: any) {
      setError(err?.message || "Gagal memuat profil warung.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWarung();
  }, [loadWarung]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError("");
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Format foto warung harus JPEG, PNG, atau WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Ukuran foto warung maksimal 2MB.");
      return;
    }
    setPhotoFileName(file.name);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!name.trim()) {
      setError("Nama warung wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      await partnerApi.updateWarung({
        name: name.trim(),
        description: description.trim() || null,
        opening_hours: openingHours.trim() || null,
        location: location.trim() || null,
        estimated_minutes: Math.max(1, Number(estimatedMinutes) || 10),
      });
      setSuccessMsg("Profil warung berhasil diperbarui.");
    } catch (err: any) {
      setError(err?.message || "Gagal memperbarui profil warung.");
    } finally {
      setSaving(false);
    }
  };

  const approvalStatus = authUser?.warung?.status || "approved";

  return (
    <div className="w-full max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-5 md:py-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-navy tracking-tight">
            Profil Warung
          </h1>
          <p className="text-xs text-navy/60">
            Kelola informasi warung yang dilihat oleh pembeli.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Status: {approvalStatus === "approved" ? "Disetujui" : approvalStatus}</span>
        </span>
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

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-5 md:p-7 shadow-xs border border-slate-100 space-y-4"
        >
          {/* Foto Warung */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt={name || "Foto Warung"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-primary text-xs font-bold text-navy cursor-pointer">
              <ImagePlus className="w-4 h-4 text-primary" />
              <span>{photoFileName || "Pilih Foto Warung"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Nama Warung
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Deskripsi Warung
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan menu andalan atau keunggulan warung Anda..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">
                Jam Buka
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="08:00 - 17:00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">
                Estimasi Siap (Menit)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Lokasi / Nomor Kios
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: Kios No. 3, Kantin Teknik"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white text-xs font-bold shadow-sm cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Simpan Profil Warung</span>
          </button>
        </form>
      )}
    </div>
  );
}
