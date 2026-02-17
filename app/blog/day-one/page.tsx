import Link from "next/link";

export const metadata = {
  title: "Day One — sgu-life",
};

export default function DayOnePost() {
  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-28 sm:px-8">
      <Link
        href="/"
        className="text-sm text-zinc-400 transition-colors hover:text-zinc-600"
      >
        &larr; Back to Blog
      </Link>

      <article className="mt-8">
        <header>
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-zinc-900">
            Day One
          </h1>
          <time className="mt-2 block text-sm text-zinc-400">2026-02-16</time>
        </header>

        <div className="mt-8 space-y-4 text-base leading-relaxed text-zinc-600">
          <p>
            Starting today, I&apos;m committing to building something new every
            single day and documenting it here. Some days it&apos;ll be a small
            tool, other days a full feature — but there will always be something.
          </p>
          <p>
            The first build is this very site: sgu-life. A watercolor
            illustration as the homepage, with clickable elements that guide you
            through my work, writing, and a bit about me.
          </p>
          <p>
            Let&apos;s see where this goes.
          </p>
        </div>
      </article>
    </main>
  );
}
