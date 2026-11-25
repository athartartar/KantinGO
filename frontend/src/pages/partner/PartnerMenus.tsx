import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Edit3,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { categoriesApi, partnerApi } from "../../lib/api";
import { formatRupiah } from "../../lib/format";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

interface PendingAddon {
  tempId: string;
  group_title: string;
  selection_type: "single" | "multiple";
  option_name: string;
  additional_price: number;
}

export default function PartnerMenus() {
  const [menus, setMenus] = useState<any[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<number | string | null>(null);

  // Modal Tambah/Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Add-ons state
  const [existingAddons, setExistingAddons] = useState<any[]>([]);
  const [pendingAddons, setPendingAddons] = useState<PendingAddon[]>([]);
  const [addonGroupTitle, setAddonGroupTitle] = useState("Tambahan");
  const [addonType, setAddonType] = useState<"single" | "multiple">("multiple");
  const [addonOptionName, setAddonOptionName] = useState("");
  const [addonPrice, setAddonPrice] = useState("0");
  const [addonBusy, setAddonBusy] = useState(false);

  // Konfirmasi hapus
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [menusRes, catRes] = await Promise.all([
        partnerApi.getMenus(1),
        categoriesApi.list(),
      ]);
      setMenus(menusRes.items || []);
      setCategories(catRes);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat daftar menu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingMenu(null);
    setName("");
    setPrice("");
    setCategoryId(categories[0] ? String(categories[0].id) : "");
    setDescription("");
    setImageFile(null);
    setImagePreview("");
    setExistingAddons([]);
    setPendingAddons([]);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = async (menu: any) => {
    setEditingMenu(menu);
    setName(menu.name || "");
    setPrice(String(menu.price ?? ""));
    setCategoryId(String(menu.category_id || categories[0]?.id || ""));
    setDescription(menu.description || "");
    setImageFile(null);
    setImagePreview(menu.image_path || "");
    setPendingAddons([]);
    setFormError("");
    setModalOpen(true);

    try {
      const addons = await partnerApi.getMenuAddons(menu.id);
      setExistingAddons(addons);
    } catch {
      setExistingAddons([]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormError("");
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFormError("Format foto harus JPEG, PNG, atau WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFormError("Ukuran foto maksimal 2MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAddAddon = async () => {
    if (!addonOptionName.trim()) return;
    const addPrice = Math.max(0, Number(addonPrice) || 0);
    const title = addonGroupTitle.trim() || "Tambahan";
    const groupKey = title.toLowerCase().replace(/[^a-z0-9]+/g, "_");

    if (editingMenu) {
      setAddonBusy(true);
      try {
        const created = await partnerApi.createMenuAddon(editingMenu.id, {
          group_key: groupKey,
          group_title: title,
          selection_type: addonType,
          option_name: addonOptionName.trim(),
          additional_price: addPrice,
        });
        setExistingAddons((prev) => [...prev, created]);
        setAddonOptionName("");
        setAddonPrice("0");
      } catch (err: any) {
        setFormError(err?.message || "Gagal menambah add-on.");
      } finally {
        setAddonBusy(false);
      }
    } else {
      setPendingAddons((prev) => [
        ...prev,
        {
          tempId: `${Date.now()}-${Math.random()}`,
          group_title: title,
          selection_type: addonType,
          option_name: addonOptionName.trim(),
          additional_price: addPrice,
        },
      ]);
      setAddonOptionName("");
      setAddonPrice("0");
    }
  };

  const handleDeleteExistingAddon = async (addonId: number) => {
    if (!editingMenu) return;
    setAddonBusy(true);
    try {
      await partnerApi.deleteMenuAddon(editingMenu.id, addonId);
      setExistingAddons((prev) => prev.filter((a) => a.id !== addonId));
    } catch (err: any) {
      setFormError(err?.message || "Gagal menghapus add-on.");
    } finally {
      setAddonBusy(false);
    }
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const numericPrice = Number(price);
    if (!name.trim()) {
      setFormError("Nama menu wajib diisi.");
      return;
    }
    if (!categoryId) {
      setFormError("Kategori menu wajib dipilih.");
      return;
    }
    if (!Number.isInteger(numericPrice) || numericPrice < 1000) {
      setFormError("Harga menu minimal Rp 1.000 (bilangan bulat).");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("price", String(numericPrice));
      formData.append("category_id", categoryId);
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingMenu) {
        await partnerApi.updateMenu(editingMenu.id, formData);
      } else {
        const created = await partnerApi.createMenu(formData);
        for (const addon of pendingAddons) {
          const groupKey = addon.group_title.toLowerCase().replace(/[^a-z0-9]+/g, "_");
          await partnerApi.createMenuAddon(created.id, {
            group_key: groupKey,
            group_title: addon.group_title,
            selection_type: addon.selection_type,
            option_name: addon.option_name,
            additional_price: addon.additional_price,
          });
        }
      }

      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err?.message || "Gagal menyimpan menu.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (menu: any) => {
    setTogglingId(menu.id);
    setError("");
    try {
      await partnerApi.updateMenu(menu.id, { is_available: !menu.is_available });
      setMenus((prev) =>
        prev.map((m) =>
          m.id === menu.id ? { ...m, is_available: !menu.is_available } : m
        )
      );
    } catch (err: any) {
      setError(err?.message || "Gagal mengubah ketersediaan menu.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await partnerApi.deleteMenu(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Gagal menghapus menu.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-5 md:py-8 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-navy tracking-tight">
            Kelola Menu
          </h1>
          <p className="text-xs text-navy/60">
            Atur ketersediaan, harga, foto, dan add-on menu warung Anda.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Menu</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : menus.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-xs border border-slate-100 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-navy">Belum ada menu di warung Anda</p>
          <p className="text-xs text-navy/55">
            Tambahkan menu pertama agar pembeli bisa mulai memesan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 flex gap-3.5 items-start"
            >
              <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                {menu.image_path ? (
                  <img
                    src={menu.image_path}
                    alt={menu.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UtensilsCrossed className="w-6 h-6 text-slate-400" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-navy truncate">{menu.name}</h2>
                    <p className="text-[11px] text-navy/55">
                      {menu.category?.name || "Menu"}
                    </p>
                  </div>
                  <span className="text-sm font-black text-primary shrink-0">
                    {formatRupiah(menu.price ?? 0)}
                  </span>
                </div>

                {menu.description && (
                  <p className="text-xs text-navy/60 line-clamp-2">{menu.description}</p>
                )}

                <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={togglingId === menu.id}
                    onClick={() => handleToggleAvailability(menu)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                      menu.is_available
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {togglingId === menu.id
                      ? "Menyimpan..."
                      : menu.is_available
                      ? "Tersedia"
                      : "Habis"}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(menu)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-navy hover:bg-slate-50 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(menu)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah / Edit Menu */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90dvh] overflow-y-auto p-5 md:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-navy">
                {editingMenu ? "Edit Menu" : "Tambah Menu Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-navy/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveMenu} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">
                  Nama Menu
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Nasi Goreng Spesial"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="15000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">
                    Kategori
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi singkat menu..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1">
                  Foto Menu (JPEG/PNG/WebP, maks. 2MB)
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-300 hover:border-primary cursor-pointer bg-slate-50/70">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <ImagePlus className="w-5 h-5 text-navy/40" />
                    </div>
                  )}
                  <div className="text-xs text-navy/70">
                    <p className="font-bold text-primary">Pilih gambar dari perangkat</p>
                    <p className="text-[11px] text-navy/50">
                      {imageFile ? imageFile.name : "Format JPEG, PNG, atau WebP (maks 2MB)"}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Add-on Section */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <p className="text-xs font-bold text-navy">Add-on / Pilihan Tambahan</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={addonGroupTitle}
                    onChange={(e) => setAddonGroupTitle(e.target.value)}
                    placeholder="Grup (mis: Topping)"
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                  <select
                    value={addonType}
                    onChange={(e) =>
                      setAddonType(e.target.value as "single" | "multiple")
                    }
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
                  >
                    <option value="multiple">Pilih Banyak</option>
                    <option value="single">Pilih Satu</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={addonOptionName}
                    onChange={(e) => setAddonOptionName(e.target.value)}
                    placeholder="Nama opsi (mis: Telur Ceplok)"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                  <input
                    type="number"
                    min={0}
                    value={addonPrice}
                    onChange={(e) => setAddonPrice(e.target.value)}
                    placeholder="Harga"
                    className="w-24 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                  <button
                    type="button"
                    disabled={addonBusy || !addonOptionName.trim()}
                    onClick={handleAddAddon}
                    className="px-3 py-2 rounded-lg bg-navy text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {(editingMenu ? existingAddons : pendingAddons).length > 0 && (
                  <ul className="space-y-1.5 pt-1">
                    {editingMenu
                      ? existingAddons.map((a) => (
                          <li
                            key={a.id}
                            className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                          >
                            <span>
                              <strong>{a.group_title}:</strong> {a.option_name} (+
                              {formatRupiah(a.additional_price ?? 0)})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteExistingAddon(a.id)}
                              className="text-rose-600 font-bold cursor-pointer"
                            >
                              Hapus
                            </button>
                          </li>
                        ))
                      : pendingAddons.map((a) => (
                          <li
                            key={a.tempId}
                            className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                          >
                            <span>
                              <strong>{a.group_title}:</strong> {a.option_name} (+
                              {formatRupiah(a.additional_price)})
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setPendingAddons((prev) =>
                                  prev.filter((x) => x.tempId !== a.tempId)
                                )
                              }
                              className="text-rose-600 font-bold cursor-pointer"
                            >
                              Hapus
                            </button>
                          </li>
                        ))}
                  </ul>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-navy hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{editingMenu ? "Simpan Perubahan" : "Simpan Menu"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl text-center">
            <h3 className="text-lg font-bold text-navy">Hapus Menu?</h3>
            <p className="text-xs text-navy/70">
              Menu <strong>"{deleteTarget.name}"</strong> akan dihapus permanen dari daftar
              warung Anda.
            </p>
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-navy cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-xs font-bold cursor-pointer"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
