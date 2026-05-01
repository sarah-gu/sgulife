// Strip Obsidian wikilinks. [[slug]] → slug, [[slug|alias]] → alias, [[slug#anchor]] → slug.
export function stripWikilinks(s: string): string {
  return s.replace(/\[\[([^\]]+)\]\]/g, (_, inner: string) => {
    const piped = inner.split("|");
    if (piped.length > 1) return piped[1];
    return inner.split("#")[0];
  });
}

// Lightly format inline markdown: **bold** and *italic* → spans.
// Returns string array of plain text and JSX-friendly tokens (callers can map).
export function inlineParts(s: string): { text: string; bold?: boolean; italic?: boolean }[] {
  const out: { text: string; bold?: boolean; italic?: boolean }[] = [];
  const tokens = s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  for (const t of tokens) {
    if (!t) continue;
    if (t.startsWith("**") && t.endsWith("**")) {
      out.push({ text: t.slice(2, -2), bold: true });
    } else if (t.startsWith("*") && t.endsWith("*")) {
      out.push({ text: t.slice(1, -1), italic: true });
    } else {
      out.push({ text: t });
    }
  }
  return out;
}

export function daysUntil(targetISO: string, fromISO?: string): number {
  const target = new Date(targetISO + "T00:00:00").getTime();
  const from = fromISO
    ? new Date(fromISO + "T00:00:00").getTime()
    : new Date().getTime();
  return Math.ceil((target - from) / (1000 * 60 * 60 * 24));
}

export function formatLongDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
