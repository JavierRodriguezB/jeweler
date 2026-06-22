import Link from "next/link";
import { config } from "../lib/config";

/** Layout minimalista y centrado para login y registro. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <header className="px-6 py-6 sm:px-10">
        <Link
          href="/"
          className="font-display text-xl tracking-[0.18em] text-ink transition-colors hover:text-rose-deep"
        >
          {config.site.name}
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
