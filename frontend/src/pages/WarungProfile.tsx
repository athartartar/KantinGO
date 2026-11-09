import { useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { getWarungById } from "../lib/mock/warung";

export default function WarungProfile() {
  const { warungId } = useParams<{ warungId: string }>();
  const warung = warungId ? getWarungById(warungId) : undefined;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8 space-y-6">
      <PageHeader
        title={warung ? `Profil ${warung.nama}` : "Profil Warung"}
        backTo={warungId ? `/warung/${warungId}` : "/warung"}
      />
      <div className="bg-white border border-blue-100 rounded-3xl p-8 text-center space-y-3 shadow-soft max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-surface text-primary flex items-center justify-center mx-auto text-2xl font-black">
          {warung?.nama?.charAt(0) || "W"}
        </div>
        <h2 className="text-xl font-bold text-navy">
          {warung?.nama || "Warung Kantin"}
        </h2>
        <p className="text-xs text-navy/60">
          Halaman profil warung & ulasan (siap diimplementasikan pada batch berikutnya)
        </p>
      </div>
    </div>
  );
}
