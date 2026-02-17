export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags?: string[];
}

/**
 * Add new posts to the top of this array.
 * Each entry should have a matching route at app/blog/[slug]/page.tsx.
 */
export const posts: BlogPost[] = [
  {
    slug: "day-one",
    title: "Day One",
    excerpt:
      "Why I'm committing to building something new every single day, and what sgu-life is all about.",
    date: "2026-02-16",
    tags: ["personal", "meta"],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
