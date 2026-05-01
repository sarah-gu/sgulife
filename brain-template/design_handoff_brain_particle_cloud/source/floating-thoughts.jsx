// floating-thoughts.jsx
// Ambient "top of mind" prompts that surface in dark space around the brain
// - each one fades in, lingers, fades out, then a new one takes its slot.
// Reads like the brain's own surfacing thoughts and reminders.

const THOUGHTS = [
  { kind: "question", text: "what was I working on last spring?" },
  { kind: "question", text: "have I been sleeping well?" },
  { kind: "reminder", text: "you haven't mentioned R. in 41 days" },
  { kind: "question", text: "who haven\u2019t I talked to in a while?" },
  { kind: "pattern", text: "sleep regularity is leading your HRV" },
  { kind: "reminder", text: "the newsletter has not been touched in 23 days" },
  { kind: "question", text: "when was I last in flow?" },
  { kind: "pattern", text: '"tired" now pairs with "people"' },
  { kind: "reminder", text: "Lisbon trip notes \u2014 still 3 days unwritten" },
  { kind: "question", text: "what did I think about Naoshima?" },
  { kind: "pattern", text: "energy peaks Sundays at 9pm" },
  { kind: "reminder", text: "12-day sleep streak \u2014 longest this year" },
  { kind: "question", text: "what idea keeps coming back?" },
  { kind: "pattern", text: 'ideas + journal cluster overlap on "slow"' },
  { kind: "question", text: "what am I avoiding?" },
];

// Pre-defined slot zones in normalized coords (0..1 of viewport).
// Avoid the central brain (~0.32..0.68 horizontal, 0.25..0.75 vertical).
// Slots positioned in corners/edges where they don't compete with hubs.
const SLOTS = [
  { x: 0.12, y: 0.18, align: "left" },
  { x: 0.88, y: 0.2, align: "right" },
  { x: 0.1, y: 0.78, align: "left" },
  { x: 0.88, y: 0.8, align: "right" },
  { x: 0.18, y: 0.5, align: "left" },
  { x: 0.82, y: 0.5, align: "right" },
];

const KIND_LABELS = {
  question: "asking",
  reminder: "noticing",
  pattern: "pattern",
};

function FloatingThoughts() {
  // Each slot holds {thoughtIdx, key, startMs, lifeMs}.
  // When a thought's life is up, replace with a fresh one (different from
  // currently-shown ones).
  const [slotState, setSlotState] = React.useState(() =>
    SLOTS.map((_, i) => ({
      thoughtIdx: i % THOUGHTS.length,
      key: i,
      startMs: performance.now() - i * 1500, // stagger initial appearances
      lifeMs: 9000 + Math.random() * 4000,
    })),
  );

  React.useEffect(() => {
    let raf;
    const tick = () => {
      const now = performance.now();
      setSlotState((prev) => {
        let next = prev;
        let dirty = false;
        const inUse = new Set(prev.map((s) => s.thoughtIdx));
        for (let i = 0; i < prev.length; i++) {
          const s = prev[i];
          if (now - s.startMs > s.lifeMs) {
            // Pick a thought not currently in use
            inUse.delete(s.thoughtIdx);
            let nextIdx = Math.floor(Math.random() * THOUGHTS.length);
            let tries = 0;
            while (inUse.has(nextIdx) && tries++ < 20) {
              nextIdx = Math.floor(Math.random() * THOUGHTS.length);
            }
            inUse.add(nextIdx);
            if (!dirty) {
              next = prev.slice();
              dirty = true;
            }
            next[i] = {
              thoughtIdx: nextIdx,
              key: s.key + SLOTS.length,
              startMs: now + 200, // small gap before next
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
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 4,
      }}
    >
      {slotState.map((s, i) => {
        const slot = SLOTS[i];
        const t = THOUGHTS[s.thoughtIdx];
        return (
          <ThoughtBubble
            key={s.key}
            slot={slot}
            thought={t}
            startMs={s.startMs}
            lifeMs={s.lifeMs}
          />
        );
      })}
    </div>
  );
}

function ThoughtBubble({ slot, thought, startMs, lifeMs }) {
  const [opacity, setOpacity] = React.useState(0);
  const [drift, setDrift] = React.useState(0);

  React.useEffect(() => {
    let raf;
    const tick = () => {
      const now = performance.now();
      const t = (now - startMs) / lifeMs;
      // Fade curve: ease in over first 18%, hold, ease out over last 22%.
      let op;
      if (t < 0) op = 0;
      else if (t < 0.18) op = t / 0.18;
      else if (t > 0.78) op = Math.max(0, (1 - t) / 0.22);
      else op = 1;
      // Smoothstep
      op = op * op * (3 - 2 * op);
      setOpacity(op);
      setDrift((now - startMs) * 0.004);
      if (t < 1.05) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [startMs, lifeMs]);

  const ICE_ACCENT = "#9cd5ff";
  const isRight = slot.align === "right";

  return (
    <div
      style={{
        position: "absolute",
        left: `${slot.x * 100}%`,
        top: `${slot.y * 100}%`,
        transform: `translate(${isRight ? "-100%" : "0"}, calc(-50% + ${-drift}px))`,
        opacity,
        maxWidth: 220,
        textAlign: isRight ? "right" : "left",
        fontFamily: "Inter, system-ui, sans-serif",
        transition: "opacity 0.4s ease",
      }}
    >
      <div
        style={{
          fontSize: 8.5,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: ICE_ACCENT,
          opacity: 0.6,
          fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
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
              background: ICE_ACCENT,
              boxShadow: `0 0 6px ${ICE_ACCENT}`,
            }}
          />
        )}
        {KIND_LABELS[thought.kind]}
        {isRight && (
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              background: ICE_ACCENT,
              boxShadow: `0 0 6px ${ICE_ACCENT}`,
            }}
          />
        )}
      </div>
      <div
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 17,
          lineHeight: 1.3,
          fontWeight: 300,
          color: "#e6f4ff",
          letterSpacing: 0.2,
          fontStyle: thought.kind === "question" ? "italic" : "normal",
          textWrap: "pretty",
        }}
      >
        {thought.kind === "question" ? thought.text : thought.text}
      </div>
    </div>
  );
}

Object.assign(window, { FloatingThoughts });
