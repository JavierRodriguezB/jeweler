"use client";

import { useCart } from "./CartContext";

/** Disparador de la bolsa en el header, con contador en vivo. */
export default function CartButton() {
  const { count, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Abrir bolsa${count > 0 ? `, ${count} artículos` : ""}`}
      className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm tracking-wide text-ink/70 transition-colors hover:border-rose/50 hover:text-rose-deep"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-4 w-4"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          d="M6 8h12l-1 12H7L6 8z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9 8a3 3 0 016 0" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Bolsa
      <span
        className={`ml-0.5 min-w-[1.25rem] rounded-full px-1.5 text-center text-xs tabular-nums transition-colors ${
          count > 0 ? "bg-rose text-white" : "bg-rose/15 text-rose-deep"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
