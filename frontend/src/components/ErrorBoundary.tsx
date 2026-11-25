import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh bg-surface flex items-center justify-center p-4 md:p-8 text-navy">
          <div className="bg-white border border-blue-100 rounded-3xl p-8 md:p-10 max-w-md w-full text-center space-y-5 shadow-soft">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 stroke-[2]" aria-hidden="true" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl font-black text-navy tracking-tight">
                Terjadi Kesalahan Tampilan
              </h1>
              <p className="text-sm text-navy/60 leading-relaxed">
                Maaf, halaman mengalami kendala tak terduga. Silakan muat ulang halaman atau kembali ke beranda.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary hover:bg-blue-bright text-white text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Muat Ulang</span>
              </button>
              <a
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-blue-200 bg-surface hover:bg-blue-50 text-navy text-sm font-bold transition-all active:scale-95"
              >
                <Home className="w-4 h-4 text-primary" />
                <span>Ke Beranda</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
