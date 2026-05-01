"use client";

import { useEffect, useMemo, useRef } from "react";
import { ICE, type HealthData, type WorkoutRecord } from "@/lib/brain";

export default function HealthDetail({
  health,
  onBack,
}: {
  health: HealthData;
  onBack: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 30% 20%, #0f1a32 0%, #050810 55%)",
        color: "rgba(190, 220, 255, 0.92)",
        fontFamily: "var(--font-sans)",
        overflow: "auto",
        animation: "hd-fade 0.6s ease",
      }}
    >
      <style>{`
        @keyframes hd-fade { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: scale(1); } }
        .hd-card { background: linear-gradient(160deg, rgba(20,30,52,0.55) 0%, rgba(8,14,28,0.65) 100%);
                   backdrop-filter: blur(20px) saturate(140%);
                   -webkit-backdrop-filter: blur(20px) saturate(140%);
                   border: 0.5px solid rgba(156,213,255,0.16);
                   border-radius: 14px;
                   box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(220,238,255,0.05); }
        .hd-eyebrow { font-size: 10px; letter-spacing: 1.6px; text-transform: uppercase;
                      color: rgba(156, 213, 255, 0.55); font-weight: 500; }
        .hd-num { font-family: var(--font-serif); font-weight: 400;
                  color: #e6f4ff; letter-spacing: -0.5px; line-height: 1; }
      `}</style>

      <BrainBackdrop />

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "20px 56px",
          background:
            "linear-gradient(180deg, rgba(5,8,16,0.85) 0%, rgba(5,8,16,0) 100%)",
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
            border: "0.5px solid rgba(156,213,255,0.2)",
            borderRadius: 18,
            color: "rgba(220,238,255,0.75)",
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
              background: ICE.accent,
              boxShadow: `0 0 10px ${ICE.accent}`,
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: "rgba(220,238,255,0.55)",
              letterSpacing: 1,
            }}
          >
            hevy · strava · {health.totalSessions} sessions on file
          </span>
        </div>
      </div>

      <div style={{ padding: "24px 56px 48px", position: "relative", zIndex: 1 }}>
        <div className="hd-eyebrow" style={{ marginBottom: 14 }}>
          Neuron · Health metrics · {health.totalSessions} sessions
        </div>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: 60,
            lineHeight: 1.04,
            letterSpacing: -0.8,
            color: ICE.hi,
            margin: "0 0 18px",
            maxWidth: 880,
            textWrap: "balance",
          }}
        >
          {health.headline}
        </h1>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.55,
            color: "rgba(220,238,255,0.7)",
            maxWidth: 720,
            margin: 0,
            textWrap: "pretty",
          }}
        >
          {health.summary}
        </p>
      </div>

      <StatStrip health={health} />

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
                Avg HR per run · {health.hrSeries.length} runs in window
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span className="hd-num" style={{ fontSize: 44 }}>
                  {avgOf(health.hrSeries.map((p) => p.avgHR)) || "—"}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: "rgba(156,213,255,0.7)",
                    letterSpacing: 1,
                  }}
                >
                  BPM AVG
                </span>
              </div>
            </div>
          </div>
          <HRChart points={health.hrSeries} />
        </div>

        <div className="hd-card" style={{ padding: 28 }}>
          <div className="hd-eyebrow" style={{ marginBottom: 14 }}>
            Last 14 sessions · all activities
          </div>
          <ActivityGrid records={health.recent} />
          <div
            style={{
              marginTop: 18,
              fontSize: 12,
              color: "rgba(220,238,255,0.6)",
              lineHeight: 1.5,
            }}
          >
            {health.chartFootnote}
          </div>
        </div>
      </div>

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
            HR zone breakdown
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {health.zoneStats.map((z) => (
              <ZoneRow key={z.zone} zone={z} />
            ))}
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 12,
              color: "rgba(220,238,255,0.55)",
              lineHeight: 1.5,
            }}
          >
            {health.zoneFootnote}
          </div>
        </div>

        <div className="hd-card" style={{ padding: 28 }}>
          <div className="hd-eyebrow" style={{ marginBottom: 18 }}>
            Connections to other neurons
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {health.connections.map((c, i) => (
              <Connection key={i} from={c.from} to={c.to} note={c.note} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 56px 100px", position: "relative", zIndex: 1 }}>
        <div className="hd-card" style={{ padding: 28 }}>
          <div className="hd-eyebrow" style={{ marginBottom: 18 }}>
            Recent signals · raw/health/daily
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr 110px 90px",
              rowGap: 0,
              fontSize: 13,
            }}
          >
            {health.recent.map((r, i) => (
              <SignalRow key={i} record={r} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatStrip({ health }: { health: HealthData }) {
  const lastRun = health.recent.find((r) => r.type === "run");
  const last14HR = health.hrSeries.slice(-14);
  const avgHR14 = avgOf(last14HR.map((p) => p.avgHR));
  return (
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
        label="Total sessions"
        value={String(health.totalSessions)}
        unit="logged"
        delta={`${health.thisYearSessions} this year`}
        tone="good"
      />
      <StatTile
        label={health.spotlight.label}
        value={health.spotlight.value}
        unit={health.spotlight.unit}
        delta={health.spotlight.delta}
        tone="good"
      />
      <StatTile
        label="Last run pace"
        value={lastRun?.pace?.split("/")[0] ?? "—"}
        unit="/mi"
        delta={
          lastRun
            ? `${lastRun.title.length > 24 ? lastRun.title.slice(0, 22) + "…" : lastRun.title} · ${lastRun.date.slice(5)}`
            : "no recent run"
        }
        tone="neutral"
      />
      <StatTile
        label="Avg HR · 14 runs"
        value={avgHR14 ? String(avgHR14) : "—"}
        unit="bpm"
        delta=""
        tone="neutral"
      />
    </div>
  );
}

function StatTile({
  label,
  value,
  unit,
  delta,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  delta: string;
  tone: "good" | "bad" | "neutral";
}) {
  const toneColor =
    tone === "good"
      ? "rgba(150, 230, 200, 0.8)"
      : tone === "bad"
      ? "rgba(220, 180, 140, 0.8)"
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
            color: "rgba(156,213,255,0.7)",
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

function HRChart({
  points,
}: {
  points: { date: string; avgHR: number; distanceMi?: number }[];
}) {
  const W = 720,
    H = 220,
    pad = { l: 8, r: 8, t: 12, b: 24 };
  const data = points;
  if (data.length === 0) {
    return (
      <div
        style={{
          height: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(220,238,255,0.4)",
          fontStyle: "italic",
          fontSize: 12,
        }}
      >
        no enriched runs in the recent window
      </div>
    );
  }
  const hrs = data.map((d) => d.avgHR);
  const ymin = Math.min(...hrs) - 4;
  const ymax = Math.max(...hrs) + 4;
  const xs = (i: number) =>
    pad.l + (i / Math.max(1, data.length - 1)) * (W - pad.l - pad.r);
  const ys = (v: number) =>
    pad.t + (1 - (v - ymin) / (ymax - ymin)) * (H - pad.t - pad.b);
  const path = data
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xs(i).toFixed(1)} ${ys(p.avgHR).toFixed(1)}`)
    .join(" ");
  const fill = `${path} L ${xs(data.length - 1).toFixed(1)} ${ys(ymin).toFixed(1)} L ${xs(0).toFixed(1)} ${ys(ymin).toFixed(1)} Z`;

  // Trend (linear regression)
  let sx = 0,
    sy = 0,
    sxy = 0,
    sxx = 0;
  data.forEach((d, i) => {
    sx += i;
    sy += d.avgHR;
    sxy += i * d.avgHR;
    sxx += i * i;
  });
  const N = data.length;
  const m = N > 1 ? (N * sxy - sx * sy) / (N * sxx - sx * sx) : 0;
  const b = N > 1 ? (sy - m * sx) / N : data[0]?.avgHR ?? 0;

  // Highlight the highest-avgHR run in the window.
  const halfIdx = data
    .map((d, i) => ({ d, i }))
    .reduce(
      (best, cur) => (cur.d.avgHR > best.d.avgHR ? cur : best),
      { d: data[0], i: 0 }
    );

  // Gridlines at z2/z3/z4 boundaries.
  const zoneLines = [
    { v: 147, label: "z2/3" },
    { v: 161, label: "z3/4" },
    { v: 172, label: "z4/5" },
  ].filter((g) => g.v >= ymin && g.v <= ymax);

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
      {zoneLines.map((g) => (
        <g key={g.label}>
          <line
            x1={pad.l}
            x2={W - pad.r}
            y1={ys(g.v)}
            y2={ys(g.v)}
            stroke="rgba(156,213,255,0.1)"
            strokeDasharray="2 4"
          />
          <text
            x={W - pad.r}
            y={ys(g.v) - 4}
            fontSize="9"
            fill="rgba(220,238,255,0.4)"
            textAnchor="end"
          >
            {g.label}
          </text>
        </g>
      ))}
      <path d={fill} fill="url(#hr-fill)" />
      <path d={path} fill="none" stroke="url(#hr-line)" strokeWidth="1.6" />
      {N > 1 && (
        <line
          x1={xs(0)}
          y1={ys(b)}
          x2={xs(N - 1)}
          y2={ys(m * (N - 1) + b)}
          stroke="rgba(220,238,255,0.5)"
          strokeWidth="0.8"
          strokeDasharray="3 4"
        />
      )}
      {data.map((p, i) => (
        <circle
          key={i}
          cx={xs(i)}
          cy={ys(p.avgHR)}
          r="2"
          fill="rgba(220,238,255,0.7)"
        />
      ))}
      <circle
        cx={xs(halfIdx.i)}
        cy={ys(halfIdx.d.avgHR)}
        r="4"
        fill="#e6f4ff"
        stroke="#050810"
        strokeWidth="1.5"
      />
      <circle
        cx={xs(halfIdx.i)}
        cy={ys(halfIdx.d.avgHR)}
        r="9"
        fill="none"
        stroke="rgba(220,238,255,0.4)"
      />
    </svg>
  );
}

function ActivityGrid({ records }: { records: WorkoutRecord[] }) {
  const recent14 = records.slice(0, 14).reverse();
  const max = Math.max(60, ...recent14.map((r) => r.durationMin || 0));
  const colorFor = (r: WorkoutRecord) => {
    if (r.type === "run")
      return "linear-gradient(180deg, rgba(156,213,255,0.85), rgba(156,213,255,0.2))";
    if (r.type === "studio")
      return "linear-gradient(180deg, rgba(180,230,200,0.7), rgba(180,230,200,0.15))";
    if (r.type === "strength")
      return "linear-gradient(180deg, rgba(220,180,140,0.7), rgba(220,180,140,0.15))";
    if (r.type === "ride")
      return "linear-gradient(180deg, rgba(200,180,255,0.7), rgba(200,180,255,0.15))";
    if (r.type === "hike")
      return "linear-gradient(180deg, rgba(150,230,200,0.7), rgba(150,230,200,0.15))";
    return "linear-gradient(180deg, rgba(190,220,255,0.4), rgba(190,220,255,0.1))";
  };
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100 }}>
      {recent14.map((r, i) => {
        const dur = r.durationMin || 30;
        const pct = Math.max(0.12, dur / max);
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
            title={`${r.date} · ${r.title}`}
          >
            <div
              style={{
                width: "100%",
                height: `${pct * 100}%`,
                background: colorFor(r),
                borderRadius: "3px 3px 0 0",
                borderTop: "0.5px solid rgba(220,238,255,0.45)",
              }}
            />
            <div
              style={{
                fontSize: 9,
                color: "rgba(220,238,255,0.4)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {r.date.slice(5)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ZoneRow({
  zone,
}: {
  zone: { zone: string; pct: number; count: number; meaning: string };
}) {
  const bar = Math.min(100, zone.pct);
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: ICE.hi,
            fontWeight: 500,
            letterSpacing: 0.2,
          }}
        >
          {zone.zone}
        </span>
        <span
          style={{
            fontSize: 12,
            color: "rgba(220,238,255,0.55)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {zone.count} runs · {zone.pct}%
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: "rgba(156,213,255,0.08)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${bar}%`,
            height: "100%",
            background:
              zone.pct >= 50
                ? "linear-gradient(90deg, rgba(220,180,140,0.85), rgba(220,180,140,0.5))"
                : "linear-gradient(90deg, rgba(156,213,255,0.85), rgba(156,213,255,0.5))",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 11,
          color: "rgba(220,238,255,0.55)",
          marginTop: 4,
          letterSpacing: 0.2,
        }}
      >
        {zone.meaning}
      </div>
    </div>
  );
}

function Connection({
  from,
  to,
  note,
}: {
  from: string;
  to: string;
  note: string;
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 9,
        background: "rgba(156,213,255,0.04)",
        border: "0.5px solid rgba(156,213,255,0.1)",
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
        <span style={{ color: "rgba(220,238,255,0.55)" }}>{from}</span>
        <svg width="22" height="6" viewBox="0 0 22 6">
          <line
            x1="0"
            y1="3"
            x2="22"
            y2="3"
            stroke="rgba(156,213,255,0.6)"
            strokeDasharray="1 2"
          />
          <circle cx="3" cy="3" r="1.5" fill={ICE.accent} />
          <circle cx="19" cy="3" r="1.5" fill={ICE.accent} />
        </svg>
        <span style={{ color: ICE.hi, fontWeight: 500 }}>{to}</span>
      </div>
      <div
        style={{
          fontSize: 12.5,
          lineHeight: 1.5,
          color: "rgba(220,238,255,0.78)",
          textWrap: "pretty",
        }}
        dangerouslySetInnerHTML={{ __html: note }}
      />
    </div>
  );
}

function SignalRow({ record }: { record: WorkoutRecord }) {
  const cellTop = "0.5px solid rgba(156,213,255,0.07)";
  const cell = (extra: React.CSSProperties = {}) => ({
    padding: "12px 0",
    borderTop: cellTop,
    ...extra,
  });
  const tag =
    record.type === "run"
      ? hrTag(record.avgHR)
      : record.type === "studio"
      ? "studio"
      : record.type === "strength"
      ? "strength"
      : record.type === "ride"
      ? "ride"
      : record.type === "hike"
      ? "hike"
      : "log";
  const value = (() => {
    if (record.distanceMi && record.pace) {
      return `${record.distanceMi.toFixed(2)} mi`;
    }
    if (record.durationMin) {
      const h = Math.floor(record.durationMin / 60);
      const m = Math.round(record.durationMin % 60);
      return h > 0 ? `${h}h ${m}m` : `${m} min`;
    }
    return record.distanceMi ? `${record.distanceMi.toFixed(2)} mi` : "—";
  })();
  return (
    <>
      <div
        style={cell({
          color: "rgba(220,238,255,0.5)",
          fontSize: 11,
          letterSpacing: 0.4,
        })}
      >
        {prettyDate(record.date)}
      </div>
      <div style={cell({ color: "rgba(220,238,255,0.9)" })}>
        {record.title}
        {record.pace ? (
          <span
            style={{
              color: "rgba(220,238,255,0.45)",
              fontSize: 11,
              marginLeft: 8,
            }}
          >
            · {record.pace}
          </span>
        ) : null}
      </div>
      <div
        style={cell({
          color: ICE.hi,
          fontVariantNumeric: "tabular-nums",
          textAlign: "right",
        })}
      >
        {value}
      </div>
      <div
        style={cell({
          color: "rgba(156,213,255,0.7)",
          fontSize: 10,
          letterSpacing: 1,
          textTransform: "uppercase",
          textAlign: "right",
        })}
      >
        {tag}
      </div>
    </>
  );
}

function hrTag(avgHR: number | undefined): string {
  if (!avgHR) return "run";
  if (avgHR >= 172) return "↑ z5";
  if (avgHR >= 161) return "z4 tempo";
  if (avgHR >= 147) return "z3 gray";
  if (avgHR >= 133) return "z2 easy";
  return "z1";
}

function prettyDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function avgOf(arr: number[]): number {
  if (arr.length === 0) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

function BrainBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    const fit = () => {
      const parent = c.parentElement;
      if (!parent) return;
      const r = parent.getBoundingClientRect();
      c.width = r.width * dpr;
      c.height = r.height * dpr;
      c.style.width = r.width + "px";
      c.style.height = r.height + "px";
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (c.parentElement) ro.observe(c.parentElement);

    const N = 26;
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0001,
      vy: (Math.random() - 0.5) * 0.0001,
      r: 0.8 + Math.random() * 1.4,
    }));
    const draw = () => {
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
      ctx.strokeStyle = "rgba(156,213,255,0.05)";
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
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x * w, n.y * h, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(156,213,255,0.18)";
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
