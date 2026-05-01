"use client";

import { useEffect, useState } from "react";
import {
  ICE,
  THOUGHT_KIND_LABELS,
  type Thought,
} from "@/lib/brain";

const SLOTS = [
  { x: 0.13, y: 0.32, align: "left" as const },
  { x: 0.87, y: 0.7, align: "right" as const },
];

type SlotState = {
  thoughtIdx: number;
  key: number;
  startMs: number;
  lifeMs: number;
};

export default function FloatingThoughts({
  thoughts,
}: {
  thoughts: Thought[];
}) {
  const pool = thoughts.length > 0 ? thoughts : [];
  const [slotState, setSlotState] = useState<SlotState[]>(() =>
    SLOTS.map((_, i) => ({
      thoughtIdx: pool.length ? i % pool.length : 0,
      key: i,
      startMs:
        (typeof performance !== "undefined" ? performance.now() : 0) -
        i * 1500,
      lifeMs: 9000 + Math.random() * 4000,
    }))
  );

  useEffect(() => {
    if (pool.length === 0) return;
    let raf = 0;
    const tick = () => {
      const now = performance.now();
      setSlotState((prev) => {
        let next = prev;
        let dirty = false;
        const inUse = new Set(prev.map((s) => s.thoughtIdx));
        for (let i = 0; i < prev.length; i++) {
          const s = prev[i];
          if (now - s.startMs > s.lifeMs) {
            inUse.delete(s.thoughtIdx);
            let nextIdx = Math.floor(Math.random() * pool.length);
            let tries = 0;
            while (inUse.has(nextIdx) && tries++ < 20) {
              nextIdx = Math.floor(Math.random() * pool.length);
            }
            inUse.add(nextIdx);
            if (!dirty) {
              next = prev.slice();
              dirty = true;
            }
            next[i] = {
              thoughtIdx: nextIdx,
              key: s.key + SLOTS.length,
              startMs: now + 200,
              lifeMs: 8000 + Math.random() * 5000,
            };
          }
        }
        return dirty ? next : prev;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pool.length]);

  if (pool.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 4,
      }}
    >
      {slotState.map((s, i) => (
        <ThoughtBubble
          key={s.key}
          slot={SLOTS[i]}
          thought={pool[s.thoughtIdx]}
          startMs={s.startMs}
          lifeMs={s.lifeMs}
        />
      ))}
    </div>
  );
}

function ThoughtBubble({
  slot,
  thought,
  startMs,
  lifeMs,
}: {
  slot: { x: number; y: number; align: "left" | "right" };
  thought: Thought;
  startMs: number;
  lifeMs: number;
}) {
  const [opacity, setOpacity] = useState(0);
  const [drift, setDrift] = useState(0);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const now = performance.now();
      const t = (now - startMs) / lifeMs;
      let op: number;
      if (t < 0) op = 0;
      else if (t < 0.18) op = t / 0.18;
      else if (t > 0.78) op = Math.max(0, (1 - t) / 0.22);
      else op = 1;
      op = op * op * (3 - 2 * op);
      setOpacity(op);
      setDrift((now - startMs) * 0.004);
      if (t < 1.05) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [startMs, lifeMs]);

  const isRight = slot.align === "right";

  return (
    <div
      style={{
        position: "absolute",
        left: `${slot.x * 100}%`,
        top: `${slot.y * 100}%`,
        transform: `translate(${
          isRight ? "-100%" : "0"
        }, calc(-50% + ${-drift}px))`,
        opacity,
        maxWidth: 220,
        textAlign: isRight ? "right" : "left",
        fontFamily: "var(--font-sans)",
        transition: "opacity 0.4s ease",
      }}
    >
      <div
        style={{
          fontSize: 8.5,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: ICE.accent,
          opacity: 0.6,
          fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
          marginBottom: 6,
          display: "flex",
          alignItems: "center",
          gap: 8,
          justifyContent: isRight ? "flex-end" : "flex-start",
        }}
      >
        {!isRight && (
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              background: ICE.accent,
              boxShadow: `0 0 6px ${ICE.accent}`,
            }}
          />
        )}
        {THOUGHT_KIND_LABELS[thought.kind]}
        {isRight && (
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              background: ICE.accent,
              boxShadow: `0 0 6px ${ICE.accent}`,
            }}
          />
        )}
      </div>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 17,
          lineHeight: 1.3,
          fontWeight: 300,
          color: ICE.hi,
          letterSpacing: 0.2,
          fontStyle: thought.kind === "question" ? "italic" : "normal",
          textWrap: "pretty",
        }}
      >
        {thought.text}
      </div>
    </div>
  );
}
