import Image from "next/image";
import Link from "next/link";
import { posts } from "@/lib/blog";

const navItems = [
  { href: "/projects", label: "Projects" },
  { href: "#blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function Home() {
  return (
    <main className="relative">
      {/* Hero section — full viewport */}
      <section className="relative mt-8 h-[calc(100vh-32px)] w-screen overflow-hidden">
        <Image
          src="/sgu-life.png"
          alt="sgu-life: a watercolor illustration of a girl walking beside a river with paper boats, a tree with a small door, and constellations in the night sky"
          fill
          priority
          className="object-contain object-center"
          draggable={false}
        />

        {/* Centered nav buttons */}
        <div className="relative z-10 flex h-full items-center justify-center">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white px-8 py-2.5 text-center font-sans text-sm font-light tracking-wide text-zinc-900 shadow-sm transition-all duration-200 hover:bg-zinc-50 hover:shadow-md sm:px-10 sm:py-3 sm:text-base"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* Blog section — scrolls into view */}
      <section id="blog" className="mx-auto max-w-2xl px-6 py-24 sm:px-8">
        <h2 className="font-sans text-3xl font-semibold tracking-tight text-zinc-900">
          Blog
        </h2>
        <p className="mt-2 text-base text-zinc-500">
          Notes, reflections, and write-ups from each day&apos;s build.
        </p>

        <ul className="mt-10 space-y-8">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block border border-zinc-200 p-5 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-sans text-lg font-medium text-zinc-900 group-hover:text-zinc-700">
                    {post.title}
                  </h3>
                  <time className="shrink-0 text-sm text-zinc-400">
                    {post.date}
                  </time>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                  {post.excerpt}
                </p>
                {post.tags && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
