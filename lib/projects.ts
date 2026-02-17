export interface Project {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
}

/**
 * Add new projects to the top of this array.
 * Each entry should have a matching route at app/projects/[slug]/page.tsx.
 */
export const projects: Project[] = [
  {
    slug: "hello-world",
    title: "Hello World",
    description:
      "The first build — setting up the sgu-life site itself with an interactive illustrated homepage.",
    date: "2026-02-16",
    tags: ["next.js", "tailwind", "personal"],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
