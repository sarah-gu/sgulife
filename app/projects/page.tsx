import Link from "next/link";
import { projects } from "@/lib/projects";

export const metadata = {
  title: "Projects — sgu-life",
  description: "Things I've been building, one day at a time.",
};

export default function ProjectsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-28 sm:px-8">
      <h1 className="font-sans text-3xl font-semibold tracking-tight text-zinc-900">
        Projects
      </h1>
      <p className="mt-2 text-base text-zinc-500">
        A new build every day. Click any project to see it in action.
      </p>

      <ul className="mt-10 space-y-8">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link
              href={`/projects/${project.slug}`}
              className="group block rounded-lg border border-zinc-200 p-5 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-sans text-lg font-medium text-zinc-900 group-hover:text-zinc-700">
                  {project.title}
                </h2>
                <time className="shrink-0 text-sm text-zinc-400">
                  {project.date}
                </time>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                {project.description}
              </p>
              {project.tags && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600"
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
    </main>
  );
}
