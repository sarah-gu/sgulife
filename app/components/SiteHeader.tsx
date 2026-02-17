import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 z-50 px-4 py-3">
      <Link href="/" className="glass-bubble group relative block">
        {/* Animated shimmer border */}
        <span className="glass-border absolute -inset-px rounded-full opacity-60" />

        {/* Glass pill */}
        <span className="relative block rounded-full border border-white/40 bg-white/25 px-5 py-1.5 font-sans text-xl font-semibold tracking-tight text-zinc-900 backdrop-blur-xl transition-all duration-300 group-hover:bg-white/35 group-hover:shadow-lg group-hover:shadow-white/20">
          sgu-life
        </span>
      </Link>
    </header>
  );
}
