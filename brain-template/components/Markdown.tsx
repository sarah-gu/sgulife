import { inlineParts, stripWikilinks } from "@/lib/text";

export function Inline({ children }: { children: string }) {
  const parts = inlineParts(stripWikilinks(children));
  return (
    <>
      {parts.map((p, i) => {
        if (p.bold) return <strong key={i} className="font-semibold">{p.text}</strong>;
        if (p.italic) return <em key={i} className="italic">{p.text}</em>;
        return <span key={i}>{p.text}</span>;
      })}
    </>
  );
}
