// neuron-panel.jsx
// The glassmorphic panel that expands "in place" when you click a hub neuron.
// Lives over the brain canvas, anchored near the clicked neuron, growing into
// a luxurious card with AI-summary content for that data category.

const NEURON_CONTENT = {
  journal: {
    headline:
      "You've been writing about loneliness, but the shape is changing.",
    summary:
      "Across 31 entries this month, the word 'tired' appears 24× - but it's no longer paired with 'work'. It's paired with 'people'. You've started preferring quiet over company, and that's new.",
    threads: [
      {
        label: "Recurring theme",
        text: "The Tuesday-evening dread is gone since you stopped therapy with M.",
      },
      {
        label: "Mood arc",
        text: "Energy peaks Sundays at 9pm - when you write longest entries.",
      },
      {
        label: "Signal",
        text: 'You wrote "I don\'t know" 11× this week. You wrote it 2× last month.',
      },
    ],
    metric: {
      value: "127",
      unit: "entries",
      sub: "14-day streak · 38,210 words this month",
    },
  },
  ideas: {
    headline: "Three ideas keep returning. They might be the same idea.",
    summary:
      "'Quiet software', 'tools for thought', and 'a journal that listens' have all surfaced this month - separated by weeks, framed differently, but converging on a single hypothesis: you want to build a calmer interface to your own mind.",
    threads: [
      {
        label: "Hot idea",
        text: '"A reading app that hides the next-up queue" - mentioned 4× since April 9.',
      },
      {
        label: "Stalled",
        text: "The newsletter has not been touched in 23 days.",
      },
      {
        label: "Connection",
        text: 'Your "ideas" cluster overlaps 62% with your "journal" cluster on the word "slow".',
      },
    ],
    metric: {
      value: "34",
      unit: "active",
      sub: "7 in motion · 12 archived this quarter",
    },
  },
  health: {
    headline: "Your sleep is leading. Your training is following.",
    summary:
      "Resting HR dropped 4 bpm over 6 weeks - and the cleanest predictor isn't workout volume, it's sleep regularity. Nights you're in bed before 11pm correlate with next-day HRV +18%.",
    threads: [
      {
        label: "Trend",
        text: "Resting HR: 58 → 54 bpm. VO₂ max stable at 51.",
      },
      {
        label: "Anomaly",
        text: "HRV dipped 22% on Apr 18. You also wrote about a hard call that day.",
      },
      {
        label: "Streak",
        text: "12 days of >7h sleep. Longest streak this year.",
      },
    ],
    metric: { value: "54", unit: "bpm", sub: "Resting HR · ↓ 4 from 6wk avg" },
  },
  people: {
    headline: "You're seeing fewer people, more deeply.",
    summary:
      "Conversation count is down 31% from last quarter, but average duration is up 84%. The names that appear most are also the ones tagged 'energizing'. You're tightening your circle without losing depth.",
    threads: [
      {
        label: "Closest",
        text: "M., A., J. - 47 mentions combined this month.",
      },
      {
        label: "Drifting",
        text: 'You haven\'t mentioned R. in 41 days. Last note: "feels far".',
      },
      {
        label: "New",
        text: "3 names entered the graph this month, all from the climbing gym.",
      },
    ],
    metric: {
      value: "218",
      unit: "people",
      sub: "11 active · 47 dormant · 3 new",
    },
  },
  travel: {
    headline: "You travel best when you stay longer.",
    summary:
      "Trips under 4 days score 6.2/10 in retrospect. Trips of 7+ days score 8.9. The pattern holds across solo, partnered, and work travel - duration matters more than destination.",
    threads: [
      { label: "Last trip", text: 'Lisbon · 9 days · "the best one in years"' },
      {
        label: "Pattern",
        text: "You always feel worse on day 2. You always feel best on day 6.",
      },
      {
        label: "Wishlist",
        text: "14 places saved. The top 3: Naoshima, Faroe, Oaxaca.",
      },
    ],
    metric: {
      value: "14",
      unit: "places",
      sub: "4 visited this year · 10 dreamt of",
    },
  },
};

function NeuronPanel({ catIdx, onClose, onOpenDetail, anchor }) {
  const cat = BRAIN_CATEGORIES[catIdx];
  const content = NEURON_CONTENT[cat.id];
  const [phase, setPhase] = React.useState("enter"); // enter -> shown
  React.useEffect(() => {
    const t = setTimeout(() => setPhase("shown"), 20);
    return () => clearTimeout(t);
  }, []);

  // Anchor - the panel grows from where the neuron was clicked.
  const ax = anchor?.x ?? 0.5;
  const ay = anchor?.y ?? 0.5;

  return (
    <>
      {/* Soft backdrop - barely there, just enough to dim distractions */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at ${ax * 100}% ${ay * 100}%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 60%)`,
          opacity: phase === "shown" ? 1 : 0,
          transition: "opacity 0.5s ease",
          pointerEvents: phase === "shown" ? "auto" : "none",
        }}
      />

      {/* The panel itself - glassmorphic, scales in from the neuron */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform:
            phase === "shown"
              ? "translate(-50%, -50%) scale(1)"
              : `translate(-50%, -50%) scale(0.04) translate(${(ax - 0.5) * 800}px, ${(ay - 0.5) * 500}px)`,
          width: "min(640px, 86vw)",
          maxHeight: "76vh",
          opacity: phase === "shown" ? 1 : 0,
          transition:
            "transform 0.7s cubic-bezier(.2,.85,.25,1), opacity 0.5s ease",
          background:
            "linear-gradient(150deg, rgba(38, 28, 16, 0.72) 0%, rgba(20, 14, 8, 0.78) 100%)",
          backdropFilter: "blur(28px) saturate(140%)",
          WebkitBackdropFilter: "blur(28px) saturate(140%)",
          border: "0.5px solid rgba(156, 213, 255, 0.22)",
          borderRadius: 18,
          boxShadow:
            "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,220,150,0.04), inset 0 1px 0 rgba(255,220,150,0.08)",
          overflow: "hidden",
          color: "rgba(190, 220, 255, 0.92)",
          fontFamily: "Inter, system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Inner light streak - gives the glass that "polished" feel */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "20%",
            right: "20%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,220,150,0.4), transparent)",
          }}
        />

        {/* Header */}
        <div
          style={{
            padding: "28px 32px 20px",
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 30%, #e6f4ff 0%, #9cd5ff 40%, #6eaae6 100%)",
              boxShadow:
                "0 0 32px rgba(190, 230, 255, 0.5), 0 0 0 1px rgba(255,220,150,0.3)",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                border: "0.5px solid rgba(255,220,150,0.18)",
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 10,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: "rgba(156, 213, 255, 0.55)",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              {cat.label} · synthesis
            </div>
            <div
              style={{
                fontFamily: '"Cormorant Garamond", "Cormorant", serif',
                fontSize: 28,
                lineHeight: 1.18,
                fontWeight: 400,
                color: "#e6f4ff",
                letterSpacing: -0.2,
                textWrap: "balance",
              }}
            >
              {content.headline}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              border: "0.5px solid rgba(244,200,122,0.2)",
              background: "rgba(0,0,0,0.2)",
              color: "rgba(244,220,180,0.6)",
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
              padding: 0,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "0 32px 24px", overflowY: "auto", flex: 1 }}>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: "rgba(190, 220, 255, 0.78)",
              margin: "0 0 28px",
              textWrap: "pretty",
            }}
          >
            {content.summary}
          </p>

          {/* Metric chip */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 14,
              padding: "16px 18px",
              background: "rgba(156, 213, 255, 0.05)",
              border: "0.5px solid rgba(156, 213, 255, 0.14)",
              borderRadius: 10,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 38,
                fontWeight: 400,
                color: "#e6f4ff",
                lineHeight: 1,
                letterSpacing: -0.5,
              }}
            >
              {content.metric.value}
            </div>
            <div
              style={{
                fontSize: 12,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: "rgba(244,200,122,0.7)",
              }}
            >
              {content.metric.unit}
            </div>
            <div style={{ flex: 1 }} />
            <div
              style={{
                fontSize: 12,
                color: "rgba(244,220,180,0.55)",
                textAlign: "right",
              }}
            >
              {content.metric.sub}
            </div>
          </div>

          {/* Threads - the AI-found patterns */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginBottom: 8,
            }}
          >
            {content.threads.map((th, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr",
                  gap: 18,
                  alignItems: "baseline",
                  paddingBottom: 14,
                  borderBottom:
                    i < content.threads.length - 1
                      ? "0.5px solid rgba(244,200,122,0.08)"
                      : "none",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    color: "rgba(156, 213, 255, 0.55)",
                    fontWeight: 500,
                  }}
                >
                  {th.label}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: "rgba(244,220,180,0.85)",
                    textWrap: "pretty",
                  }}
                >
                  {th.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: "16px 32px 22px",
            borderTop: "0.5px solid rgba(244,200,122,0.1)",
            display: "flex",
            gap: 12,
            alignItems: "center",
            background: "rgba(0,0,0,0.15)",
          }}
        >
          <button
            onClick={() => onOpenDetail && onOpenDetail(cat.id)}
            style={{
              padding: "10px 18px",
              background:
                "linear-gradient(180deg, rgba(244,200,122,0.18), rgba(212,162,86,0.12))",
              border: "0.5px solid rgba(244,200,122,0.35)",
              borderRadius: 8,
              color: "#e6f4ff",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: 0.3,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Enter neuron →
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "10px 18px",
              background: "transparent",
              border: "none",
              color: "rgba(244,220,180,0.55)",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: 0.3,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Back to brain
          </button>
          <div style={{ flex: 1 }} />
          <div
            style={{
              fontSize: 11,
              color: "rgba(244,220,180,0.35)",
              fontStyle: "italic",
            }}
          >
            synthesized just now
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { NeuronPanel, NEURON_CONTENT });
