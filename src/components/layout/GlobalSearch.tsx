"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Building2, ListChecks, KeyRound } from "lucide-react";
import Link from "next/link";
import { demoClients } from "@/lib/data/mock-data";
import { demoCredentials } from "@/lib/data/mock-credentials";

interface Result {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  icon: React.ReactNode;
}

function getResults(query: string): Result[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();

  const clients = demoClients
    .filter((c) =>
      c.company_name.toLowerCase().includes(q) ||
      c.owner_name.toLowerCase().includes(q) ||
      c.segment.toLowerCase().includes(q)
    )
    .map((c) => ({
      id: `client-${c.id}`,
      label: c.company_name,
      sublabel: c.segment,
      href: `/clients/${c.id}`,
      icon: <Building2 className="h-4 w-4 text-accent" />,
    }));

  const credentials = demoCredentials
    .filter((cr) =>
      cr.label.toLowerCase().includes(q) ||
      cr.username.toLowerCase().includes(q)
    )
    .map((cr) => ({
      id: `cred-${cr.id}`,
      label: cr.label,
      sublabel: cr.username,
      href: `/clients/${cr.client_id}/credentials`,
      icon: <KeyRound className="h-4 w-4 text-warning" />,
    }));

  return [...clients, ...credentials].slice(0, 8);
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = getResults(query);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 h-9 rounded-lg border border-border-strong bg-surface hover:bg-surface-hover text-text-muted text-sm transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden sm:inline text-[10px] bg-surface-hover border border-border rounded px-1.5 py-0.5 ml-2">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface border border-border-strong rounded-2xl shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar clientes, credenciais..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <div className="flex flex-col py-2 max-h-80 overflow-y-auto">
            {results.map((r) => (
              <Link
                key={r.id}
                href={r.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-hover transition-colors"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover border border-border">
                  {r.icon}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-text-primary truncate">{r.label}</span>
                  <span className="text-[11px] text-text-muted truncate">{r.sublabel}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : query.trim() ? (
          <div className="px-4 py-8 text-center text-sm text-text-muted">
            Nenhum resultado para "{query}"
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-sm text-text-muted">
            Digite para buscar clientes, credenciais...
          </div>
        )}
      </div>
    </div>
  );
}