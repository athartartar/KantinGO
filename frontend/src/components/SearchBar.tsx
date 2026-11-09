import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  debounceMs?: number;
  className?: string;
}

export default function SearchBar({
  placeholder = "Cari menu atau warung...",
  onSearch,
  debounceMs = 250,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  // Debounce otomatis saat pengguna mengetik kata kunci pencarian
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(query);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [query, debounceMs, onSearch]);

  const handleClear = () => {
    setQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Pencarian menu makanan dan warung kantin"
      className={`relative flex items-center bg-white rounded-full border border-blue-100 shadow-soft hover:shadow-card focus-within:shadow-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all px-4 md:px-5 py-3 md:py-3.5 ${className}`}
    >
      <Search
        className="w-5 h-5 text-navy/40 shrink-0 stroke-[2.5] mr-3"
        aria-hidden="true"
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Cari menu makanan, minuman, atau warung kantin"
        className="w-full bg-transparent text-sm md:text-base text-navy placeholder:text-navy/40 focus:outline-hidden"
      />
      {query.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="p-1 rounded-full text-navy/40 hover:text-navy hover:bg-slate-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary transition-colors ml-2 cursor-pointer"
          aria-label="Hapus kata kunci pencarian"
        >
          <X className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
