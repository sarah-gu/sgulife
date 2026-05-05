"use client";

import { useEffect, useRef } from "react";
import { ICE, type NowContent } from "@/lib/brain";

type Props = {
  now: NowContent;
  onClose: () => void;
  isMobile: boolean;
};

export default function NowReadout({ now, onClose, isMobile }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDocDown = (e: MouseEvent) => {
      const card = cardRef.current;
      if (!card) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (card.contains(target)) return;
      if (target.closest("[data-now-trigger]")) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDocDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDocDown);
    };
  }, [onClose]);

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-label="now"
      style={{
        position: "absolute",
        top: isMobile ? 44 : 60,
        left: isMobile ? 18 : 36,
        zIndex: 6,
        width: isMobile ? "min(280px, calc(100vw - 36px))" : 300,
        padding: "12px 14px",
        background: "rgba(12, 20, 36, 0.65)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        border: `0.5px solid ${ICE.hairline}`,
        borderRadius: 12,
        boxShadow:
          "0 12px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(220,238,255,0.05)",
        animation: "now-in 0.22s ease",
        fontFamily: "var(--font-sans)",
      }}
    >
      <Row
        glyph="♪"
        title={now.music.title}
        sub={now.music.artist}
        tag={now.music.tag}
      />
      <div
        style={{
          height: 1,
          background: ICE.hairline,
          opacity: 0.6,
          margin: "10px 0",
        }}
      />
      <Row
        glyph="✦"
        title={now.reading.title}
        sub={now.reading.author}
        tag={now.reading.tag}
      />
    </div>
  );
}

function Row({
  glyph,
  title,
  sub,
  tag,
}: {
  glyph: string;
  title: string;
  sub: string;
  tag?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: ICE.accent,
          opacity: 0.75,
          flex: "0 0 14px",
          marginTop: 2,
          fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
        }}
      >
        {glyph}
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 14,
            lineHeight: 1.25,
            color: ICE.hi,
            letterSpacing: 0.2,
            fontStyle: "italic",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginTop: 3,
            fontSize: 11,
            color: ICE.mid,
            letterSpacing: 0.2,
          }}
        >
          <span>{sub}</span>
          {tag && (
            <span
              style={{
                color: ICE.low,
                fontSize: 10,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
              }}
            >
              · {tag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
