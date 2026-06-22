import Link from "next/link";
import { config } from "../lib/config";

/** Layout minimalista para el checkout: sin nav ni distracciones. */
export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <header className="flex items-center justify-between border-b border-ink/8 px-6 py-5 sm:px-10 lg:px-16">
        <Link
          href="/"
          className="font-display text-xl tracking-[0.18em] text-ink transition-colors hover:text-rose-deep"
        >
          {config.site.name}
        </Link>
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink/45">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 018 0v3" strokeLinecap="round" />
          </svg>
          Pago seguro
        </span>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
