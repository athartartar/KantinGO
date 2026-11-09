import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import TopNav from "./TopNav";

export default function AppLayout() {
  return (
    <div className="min-h-dvh bg-surface text-navy font-sans antialiased flex flex-col overflow-x-hidden">
      {/* TopNav hanya tampil di breakpoint desktop (md ke atas) */}
      <TopNav />

      {/* Main content: full-bleed container agar header hero dapat selebar layar */}
      <main className="flex-1 w-full pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-12">
        <Outlet />
      </main>

      {/* BottomNav hanya tampil di bawah md */}
      <BottomNav />
    </div>
  );
}
