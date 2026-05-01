// health-detail.jsx
// Detail page reached by clicking "Enter neuron →" on the Health hub.
// Stays in the dark/glass/gold language - but now we're "inside" that neuron.
// Shows: AI-synthesized summary, longitudinal charts, anomalies, and connections
// back to other neurons (sleep ↔ HRV ↔ journal).

function HealthDetail({ onBack }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 30% 20%, #0f1a32 0%, #050810 55%)",
        color: "rgba(190, 220, 255, 0.92)",
        fontFamily: "Inter, system-ui, sans-serif",
        overflow: "auto",
        animation: "hd-fade 0.6s ease",
      }}
    >
      <style>{`
        @keyframes hd-fade { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: scale(1); } }
        .hd-card { background: linear-gradient(160deg, rgba(38,28,16,0.55) 0%, rgba(20,14,8,0.65) 100%);
                   backdrop-filter: blur(20px) saturate(140%);
                   -webkit-backdrop-filter: blur(20px) saturate(140%);
                   border: 0.5px solid rgba(244,200,122,0.16);
                   border-radius: 14px;
                   box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,220,150,0.05); }
        .hd-eyebrow { font-size: 10px; letter-spacing: 1.6px; text-transform: uppercase;
                      color: rgba(156, 213, 255, 0.55); font-weight: 500; }
        .hd-num { font-family: "Cormorant Garamond", serif; font-weight: 400;
                  color: #e6f4ff; letter-spacing: -0.5px; line-height: 1; }
      `}</style>

      {/* Faint neural-network watermark behind everything */}
      <BrainBackdrop />

      {/* Top nav */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "20px 56px",
          background:
            "linear-gradient(180deg, rgba(10,8,7,0.85) 0%, rgba(10,8,7,0) 100%)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "0.5px solid rgba(244,200,122,0.2)",
            borderRadius: 18,
            color: "rgba(244,220,180,0.75)",
            padding: "7px 14px 7px 10px",
            fontSize: 12,
            letterSpacing: 0.5,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 14 }}>←</span> brain
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: "#9cd5ff",
              boxShadow: "0 0 10px rgba(244,200,122,0.7)",
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: "rgba(244,220,180,0.55)",
              letterSpacing: 1,
            }}
          >
            syncing · oura, whoop, journal
          </span>
        </div>
      </div>

      {/* Hero */}
      <div
        style={{ padding: "24px 56px 48px", position: "relative", zIndex: 1 }}
      >
        <div className="hd-eyebrow" style={{ marginBottom: 14 }}>
          Neuron · Health metrics · 6 streams
        </div>
        <h1
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 400,
            fontSize: 60,
            lineHeight: 1.04,
            letterSpacing: -0.8,
            color: "#e6f4ff",
            margin: "0 0 18px",
            maxWidth: 880,
            textWrap: "balance",
          }}
        >
          Your sleep is leading. Your training is following.
        </h1>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.55,
            color: "rgba(244,220,180,0.7)",
            maxWidth: 720,
            margin: 0,
            textWrap: "pretty",
          }}
        >
          Resting HR has dropped 4 bpm over the past six weeks. The cleanest
          predictor isn't workout volume - it's sleep regularity. Nights you're
          in bed before 11 correlate with next-day HRV up 18%, and with the
          words "clear" and "calm" appearing in your journal.
        </p>
      </div>

      {/* Stat strip */}
      <div
        style={{
          padding: "0 56px 36px",
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(4, 1fr)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <StatTile
          label="Resting HR"
          value="54"
          unit="bpm"
          delta="↓ 4 from 6wk avg"
          tone="good"
        />
        <StatTile
          label="HRV (7d avg)"
          value="71"
          unit="ms"
          delta="↑ 9 from baseline"
          tone="good"
        />
        <StatTile
          label="Sleep"
          value="7.4"
          unit="hrs"
          delta="12-day streak >7h"
          tone="good"
        />
        <StatTile
          label="VO₂ max"
          value="51"
          unit="ml/kg"
          delta="stable · 90th %ile"
          tone="neutral"
        />
      </div>

      {/* Charts row */}
      <div
        style={{
          padding: "0 56px 36px",
          display: "grid",
          gap: 20,
          gridTemplateColumns: "2fr 1fr",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="hd-card" style={{ padding: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div>
              <div className="hd-eyebrow" style={{ marginBottom: 6 }}>
                Resting heart rate · 90 days
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span className="hd-num" style={{ fontSize: 44 }}>
                  54
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: "rgba(244,200,122,0.7)",
                    letterSpacing: 1,
                  }}
                >
                  BPM
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "rgba(244,220,180,0.5)",
                    marginLeft: 10,
                  }}
                >
                  trending downward
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["30d", "90d", "1y"].map((p, i) => (
                <button
                  key={p}
                  style={{
                    padding: "6px 10px",
                    fontSize: 11,
                    letterSpacing: 0.6,
                    background:
                      i === 1 ? "rgba(244,200,122,0.14)" : "transparent",
                    border: "0.5px solid rgba(244,200,122,0.2)",
                    borderRadius: 6,
                    color: "rgba(244,220,180,0.8)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <HRChart />
        </div>

        <div className="hd-card" style={{ padding: 28 }}>
          <div className="hd-eyebrow" style={{ marginBottom: 14 }}>
            Sleep · last 14 nights
          </div>
          <SleepGrid />
          <div
            style={{
              marginTop: 18,
              fontSize: 12,
              color: "rgba(244,220,180,0.6)",
              lineHeight: 1.5,
            }}
          >
            Bed-before-11 nights tend to push HRV up the next day.
            <span style={{ color: "rgba(244,200,122,0.85)" }}>
              {" "}
              See connection ↘
            </span>
          </div>
        </div>
      </div>

      {/* Patterns + connections */}
      <div
        style={{
          padding: "0 56px 36px",
          display: "grid",
          gap: 20,
          gridTemplateColumns: "1fr 1fr",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="hd-card" style={{ padding: 28 }}>
          <div className="hd-eyebrow" style={{ marginBottom: 18 }}>
            Patterns the brain noticed
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Pattern
              k="01"
              title="Sunday-night sleep predicts the week"
              body="When Sunday's sleep score is &gt; 85, Mon-Wed HRV averages 14% higher. The effect doesn't survive into Friday."
              conf="92%"
            />
            <Pattern
              k="02"
              title="Hard calls drop HRV the next morning"
              body="On 7 of 9 days you tagged a journal entry &lsquo;hard conversation&rsquo;, your next-day HRV was below your 7-day average."
              conf="78%"
            />
            <Pattern
              k="03"
              title="Climbing days don't tax recovery"
              body="Bouldering sessions show a smaller HRV dip than runs of equivalent strain. Worth weighting."
              conf="71%"
            />
          </div>
        </div>

        <div className="hd-card" style={{ padding: 28 }}>
          <div className="hd-eyebrow" style={{ marginBottom: 18 }}>
            Connections to other neurons
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Connection
              from="Health"
              to="Daily journal"
              note="Days you wrote &gt; 400 words have HRV +11% vs days you wrote &lt; 100."
            />
            <Connection
              from="Health"
              to="People"
              note="HRV is highest the day after seeing M., A., or J. (your &lsquo;energizing&rsquo; tag)."
            />
            <Connection
              from="Health"
              to="Travel"
              note="Sleep regularity collapses on travel day 1, recovers by day 3."
            />
            <Connection
              from="Health"
              to="Ideas & projects"
              note="You write your most-edited ideas on mornings after &gt; 7.5h of sleep."
            />
          </div>
        </div>
      </div>

      {/* Recent entries */}
      <div style={{ padding: "0 56px 100px", position: "relative", zIndex: 1 }}>
        <div className="hd-card" style={{ padding: 28 }}>
          <div className="hd-eyebrow" style={{ marginBottom: 18 }}>
            Recent signals
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "110px 1fr 110px 90px",
              rowGap: 0,
              fontSize: 13,
            }}
          >
            <Row
              when="Apr 28 · 06:42"
              what="Resting HR"
              v="54 bpm"
              tag="↓ low"
            />
            <Row when="Apr 27 · 23:18" what="In bed" v="22:54" tag="early" />
            <Row when="Apr 27 · 07:30" what="HRV" v="78 ms" tag="↑ high" />
            <Row
              when="Apr 26 · 18:04"
              what="Climb · Lead"
              v="62 min"
              tag="moderate"
            />
            <Row
              when="Apr 25 · 22:50"
              what="Journal: &lsquo;hard call w/ R&rsquo;"
              v="-"
              tag="flagged"
            />
            <Row when="Apr 25 · 07:12" what="HRV" v="51 ms" tag="↓ dip" />
            <Row when="Apr 24 · 06:55" what="Run · easy" v="42 min" tag="z2" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tiles & primitives ─────────────────────────────────────────────────────

function StatTile({ label, value, unit, delta, tone }) {
  const toneColor =
    tone === "good"
      ? "rgba(150, 230, 200, 0.8)"
      : tone === "bad"
        ? "rgba(220, 140, 160, 0.8)"
        : "rgba(190, 220, 255, 0.5)";
  return (
    <div className="hd-card" style={{ padding: "20px 22px" }}>
      <div className="hd-eyebrow" style={{ marginBottom: 10 }}>
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span className="hd-num" style={{ fontSize: 38 }}>
          {value}
        </span>
        <span
          style={{
            fontSize: 12,
            color: "rgba(244,200,122,0.7)",
            letterSpacing: 1,
          }}
        >
          {unit}
        </span>
      </div>
      <div style={{ fontSize: 11, color: toneColor, letterSpacing: 0.3 }}>
        {delta}
      </div>
    </div>
  );
}

function HRChart() {
  // Synthetic 90-day RHR series - declining trend, weekly wobble.
  const N = 90;
  const data = React.useMemo(() => {
    const rng = (() => {
      let s = 99;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    })();
    const arr = [];
    for (let i = 0; i < N; i++) {
      const trend = 58 - (i / N) * 4;
      const wobble = Math.sin(i / 5) * 0.8 + Math.sin(i / 11) * 0.6;
      const noise = (rng() - 0.5) * 1.6;
      arr.push(trend + wobble + noise);
    }
    return arr;
  }, []);
  const W = 720,
    H = 220,
    pad = { l: 8, r: 8, t: 12, b: 24 };
  const ymin = 49,
    ymax = 64;
  const xs = (i) => pad.l + (i / (N - 1)) * (W - pad.l - pad.r);
  const ys = (v) =>
    pad.t + (1 - (v - ymin) / (ymax - ymin)) * (H - pad.t - pad.b);
  const path = data
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"} ${xs(i).toFixed(1)} ${ys(v).toFixed(1)}`,
    )
    .join(" ");
  const fill = `${path} L ${xs(N - 1).toFixed(1)} ${ys(ymin).toFixed(1)} L ${xs(0).toFixed(1)} ${ys(ymin).toFixed(1)} Z`;

  // Trend line (linear regression, hand-rolled)
  let sx = 0,
    sy = 0,
    sxy = 0,
    sxx = 0;
  data.forEach((v, i) => {
    sx += i;
    sy += v;
    sxy += i * v;
    sxx += i * i;
  });
  const m = (N * sxy - sx * sy) / (N * sxx - sx * sx);
  const b = (sy - m * sx) / N;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: 220, display: "block" }}
    >
      <defs>
        <linearGradient id="hr-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9cd5ff" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#9cd5ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hr-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6eaae6" />
          <stop offset="100%" stopColor="#e6f4ff" />
        </linearGradient>
      </defs>

      {/* gridlines */}
      {[52, 56, 60].map((g) => (
        <g key={g}>
          <line
            x1={pad.l}
            x2={W - pad.r}
            y1={ys(g)}
            y2={ys(g)}
            stroke="rgba(244,200,122,0.08)"
            strokeDasharray="2 4"
          />
          <text
            x={W - pad.r}
            y={ys(g) - 4}
            fontSize="9"
            fill="rgba(244,220,180,0.4)"
            textAnchor="end"
          >
            {g}
          </text>
        </g>
      ))}

      <path d={fill} fill="url(#hr-fill)" />
      <path d={path} fill="none" stroke="url(#hr-line)" strokeWidth="1.6" />

      {/* trend */}
      <line
        x1={xs(0)}
        y1={ys(b)}
        x2={xs(N - 1)}
        y2={ys(m * (N - 1) + b)}
        stroke="rgba(255,245,216,0.5)"
        strokeWidth="0.8"
        strokeDasharray="3 4"
      />

      {/* anomaly point */}
      <circle
        cx={xs(72)}
        cy={ys(data[72])}
        r="4"
        fill="#e6f4ff"
        stroke="#050810"
        strokeWidth="1.5"
      />
      <circle
        cx={xs(72)}
        cy={ys(data[72])}
        r="9"
        fill="none"
        stroke="rgba(255,245,216,0.4)"
      />
    </svg>
  );
}

function SleepGrid() {
  // 14 nights - most clean, two short.
  const nights = [
    7.4, 7.8, 6.5, 7.9, 8.1, 7.2, 7.5, 8.4, 5.2, 7.0, 7.6, 8.0, 7.3, 7.7,
  ];
  const max = 9,
    min = 4;
  return (
    <div
      style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100 }}
    >
      {nights.map((h, i) => {
        const pct = (h - min) / (max - min);
        const isShort = h < 6.5;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                width: "100%",
                height: `${pct * 100}%`,
                background: isShort
                  ? "linear-gradient(180deg, rgba(220,140,120,0.55), rgba(220,140,120,0.15))"
                  : "linear-gradient(180deg, rgba(244,200,122,0.7), rgba(244,200,122,0.15))",
                borderRadius: "3px 3px 0 0",
                borderTop: isShort
                  ? "0.5px solid rgba(220,140,120,0.7)"
                  : "0.5px solid rgba(255,220,150,0.6)",
              }}
            />
            <div
              style={{
                fontSize: 9,
                color: "rgba(244,220,180,0.4)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {h.toFixed(1)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Pattern({ k, title, body, conf }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "32px 1fr 56px",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 22,
          color: "rgba(244,200,122,0.55)",
          letterSpacing: -0.5,
        }}
      >
        {k}
      </div>
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#e6f4ff",
            marginBottom: 5,
            letterSpacing: 0.1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.55,
            color: "rgba(244,220,180,0.7)",
            textWrap: "pretty",
          }}
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "rgba(244,200,122,0.7)",
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {conf}
        <br />
        <span style={{ fontSize: 9, opacity: 0.5 }}>conf.</span>
      </div>
    </div>
  );
}

function Connection({ from, to, note }) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 9,
        background: "rgba(244,200,122,0.04)",
        border: "0.5px solid rgba(244,200,122,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
          fontSize: 11,
          letterSpacing: 0.6,
        }}
      >
        <span style={{ color: "rgba(244,220,180,0.55)" }}>{from}</span>
        <svg width="22" height="6" viewBox="0 0 22 6">
          <line
            x1="0"
            y1="3"
            x2="22"
            y2="3"
            stroke="rgba(244,200,122,0.6)"
            strokeDasharray="1 2"
          />
          <circle cx="3" cy="3" r="1.5" fill="#9cd5ff" />
          <circle cx="19" cy="3" r="1.5" fill="#9cd5ff" />
        </svg>
        <span style={{ color: "#e6f4ff", fontWeight: 500 }}>{to}</span>
      </div>
      <div
        style={{
          fontSize: 12.5,
          lineHeight: 1.5,
          color: "rgba(244,220,180,0.78)",
          textWrap: "pretty",
        }}
      >
        {note}
      </div>
    </div>
  );
}

function Row({ when, what, v, tag }) {
  return (
    <>
      <div
        style={{
          padding: "12px 0",
          color: "rgba(244,220,180,0.5)",
          fontSize: 11,
          letterSpacing: 0.4,
          borderTop: "0.5px solid rgba(244,200,122,0.07)",
        }}
      >
        {when}
      </div>
      <div
        style={{
          padding: "12px 0",
          color: "rgba(244,220,180,0.9)",
          borderTop: "0.5px solid rgba(244,200,122,0.07)",
        }}
        dangerouslySetInnerHTML={{ __html: what }}
      />
      <div
        style={{
          padding: "12px 0",
          color: "#e6f4ff",
          fontVariantNumeric: "tabular-nums",
          textAlign: "right",
          borderTop: "0.5px solid rgba(244,200,122,0.07)",
        }}
      >
        {v}
      </div>
      <div
        style={{
          padding: "12px 0",
          color: "rgba(244,200,122,0.7)",
          fontSize: 10,
          letterSpacing: 1,
          textTransform: "uppercase",
          textAlign: "right",
          borderTop: "0.5px solid rgba(244,200,122,0.07)",
        }}
      >
        {tag}
      </div>
    </>
  );
}

// Faint animated network in the page background - same vocabulary as the brain
// landing, just dimmer. Hints at "you're inside one neuron of the bigger graph".
function BrainBackdrop() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf;
    const fit = () => {
      const r = c.parentElement.getBoundingClientRect();
      c.width = r.width * dpr;
      c.height = r.height * dpr;
      c.style.width = r.width + "px";
      c.style.height = r.height + "px";
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c.parentElement);

    const N = 26;
    const nodes = Array.from({ length: N }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0001,
      vy: (Math.random() - 0.5) * 0.0001,
      r: 0.8 + Math.random() * 1.4,
    }));
    const draw = (now) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = c.width / dpr,
        h = c.height / dpr;
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;
      }
      // edges
      ctx.strokeStyle = "rgba(212,162,86,0.05)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = nodes[i],
            b = nodes[j];
          const dx = (a.x - b.x) * w,
            dy = (a.y - b.y) * h;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 220) {
            ctx.globalAlpha = (1 - d / 220) * 0.4;
            ctx.beginPath();
            ctx.moveTo(a.x * w, a.y * h);
            ctx.lineTo(b.x * w, b.y * h);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      // nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x * w, n.y * h, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(244,200,122,0.18)";
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.45,
      }}
    >
      <canvas ref={ref} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}

Object.assign(window, { HealthDetail });
