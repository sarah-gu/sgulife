export const metadata = {
  title: "About — sgu-life",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-28 sm:px-8">
      <h1 className="font-sans text-3xl font-semibold tracking-tight text-zinc-900">
        About
      </h1>

      <div className="mt-8 space-y-4 text-base leading-relaxed text-zinc-600">
        <p>
          Hi! I&apos;m building something new every day and sharing it here on
          sgu-life. This site is both a portfolio and a journal — a place to
          show the things I make and write about the process.
        </p>
        <p>
          The illustration on the homepage was made to capture the spirit of
          this project: exploration, curiosity, and a little bit of magic.
          Click around — the tree door leads to my projects, the paper boats
          carry my blog posts, and the constellations brought you here.
        </p>
        <p>
          More coming soon. Check back every day for something new.
        </p>
      </div>
    </main>
  );
}
