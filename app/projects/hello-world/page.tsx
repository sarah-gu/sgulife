import Link from "next/link";

export const metadata = {
  title: "Hello World — sgu-life",
};

export default function HelloWorldProject() {
  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-28 sm:px-8">
      <Link
        href="/projects"
        className="text-sm text-zinc-400 transition-colors hover:text-zinc-600"
      >
        &larr; Back to Projects
      </Link>

      <article className="mt-8">
        <header>
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-zinc-900">
            Hello World
          </h1>
          <time className="mt-2 block text-sm text-zinc-400">2026-02-16</time>
        </header>

        <div className="prose-custom mt-8 space-y-4 text-base leading-relaxed text-zinc-600">
          <p>
            This is the very first build: the sgu-life site itself. An
            interactive watercolor illustration serves as the homepage, with
            clickable hotspots that lead to Projects, Blog, and About.
          </p>
          <p>
            The stack is Next.js (App Router) + Tailwind CSS. Every day, a new
            project will get its own page right here.
          </p>
        </div>
      </article>
    </main>
  );
}
