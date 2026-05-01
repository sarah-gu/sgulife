"use client";

import { useMemo, useRef, useState } from "react";
import {
  COUNTRY_PATHS,
  WORLD_VIEWBOX,
  type CountryPath,
} from "@/lib/world-paths.generated";
import { ICE, type VisitedCountry } from "@/lib/brain";
import { useIsMobile } from "./use-mobile";

type Props = {
  home: string;
  visited: VisitedCountry[];
};

// Year → swatch. Tuned to feel like the rest of the ice/aurora theme:
// muted, low-saturation, with newer years brighter and cooler.
const YEAR_PALETTE: Record<string, { fill: string; stroke: string; label: string }> = {
  "<2021": { fill: "#3a4a6e", stroke: "#5a6e96", label: "before 2021" },
  "2022":  { fill: "#4a6494", stroke: "#7a9bd4", label: "2022" },
  "2023":  { fill: "#5680b8", stroke: "#8fb6df", label: "2023" },
  "2024":  { fill: "#62a0c8", stroke: "#9fdcef", label: "2024" },
  "2025":  { fill: "#7cc1de", stroke: "#bfe2f4", label: "2025" },
  "2026":  { fill: "#9cd5ff", stroke: "#d6ecff", label: "2026" },
};

const YEAR_ORDER = ["<2021", "2022", "2023", "2024", "2025", "2026"] as const;

const HOME_FILL = "rgba(220, 240, 255, 0.92)";
const HOME_STROKE = "#ffffff";
const UNVISITED_FILL = "rgba(64, 86, 124, 0.28)";
const UNVISITED_STROKE = "rgba(140, 180, 230, 0.18)";

// City-states / micro-territories too small to render as paths at 110m
// resolution. Coordinates are pre-projected via the same geoNaturalEarth1
// projection used for the country paths (980x480 viewBox).
const POINT_MARKERS: Record<string, { x: number; y: number }> = {
  Singapore: { x: 760.3, y: 232.2 },
  "Hong Kong": { x: 780.4, y: 168.9 },
};

function yearKey(y: VisitedCountry["year"]): string {
  return typeof y === "number" ? String(y) : y;
}

export default function TravelMap({ home, visited }: Props) {
  const visitedByName = useMemo(() => {
    const map = new Map<string, VisitedCountry>();
    for (const v of visited) map.set(v.name, v);
    return map;
  }, [visited]);

  const [hovered, setHovered] = useState<CountryPath | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const homeIndex = useMemo(
    () => COUNTRY_PATHS.findIndex((c) => c.name === home),
    [home]
  );

  const summary = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of visited) {
      const k = yearKey(v.year);
      counts[k] = (counts[k] ?? 0) + 1;
    }
    return counts;
  }, [visited]);

  const onMove = (e: React.MouseEvent) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    setTooltipPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const onPathEnter = (c: CountryPath) => setHovered(c);
  const onPathLeave = () => setHovered(null);

  const hoveredVisit = hovered ? visitedByName.get(hovered.name) : undefined;
  const hoveredIsHome = hovered?.name === home;

  return (
    <>
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      style={{
        position: "relative",
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
        background:
          "radial-gradient(ellipse at 50% 35%, rgba(20,32,58,0.85) 0%, rgba(8,12,24,0.92) 65%, rgba(4,7,14,0.96) 100%)",
        border: `0.5px solid ${ICE.hairline}`,
        boxShadow:
          "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(220,238,255,0.05)",
      }}
    >
      <MapBackdrop />

      <svg
        viewBox={`0 0 ${WORLD_VIEWBOX.width} ${WORLD_VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="World map highlighting countries Sarah has visited"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <defs>
          <pattern
            id="home-stripes"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <rect width="6" height="6" fill="rgba(220,240,255,0.18)" />
            <rect width="3" height="6" fill="rgba(220,240,255,0.55)" />
          </pattern>
          <filter id="visited-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {COUNTRY_PATHS.map((c, i) => {
          if (i === homeIndex) return null;
          const visit = visitedByName.get(c.name);
          const palette = visit ? YEAR_PALETTE[yearKey(visit.year)] : null;
          const isHover = hovered?.id === c.id;
          const fill = palette ? palette.fill : UNVISITED_FILL;
          const stroke = palette ? palette.stroke : UNVISITED_STROKE;
          return (
            <path
              key={c.id}
              d={c.d}
              fill={fill}
              stroke={stroke}
              strokeWidth={isHover ? 0.8 : 0.4}
              strokeLinejoin="round"
              filter={palette ? "url(#visited-glow)" : undefined}
              onMouseEnter={() => onPathEnter(c)}
              onMouseLeave={onPathLeave}
              onFocus={() => onPathEnter(c)}
              onBlur={onPathLeave}
              tabIndex={visit ? 0 : -1}
              style={{
                transition: "fill 0.2s ease, stroke 0.2s ease, filter 0.25s ease",
                cursor: visit ? "pointer" : "default",
                outline: "none",
              }}
            />
          );
        })}

        {homeIndex >= 0 && (
          <>
            <path
              d={COUNTRY_PATHS[homeIndex].d}
              fill={HOME_FILL}
              stroke={HOME_STROKE}
              strokeWidth={0.6}
              strokeLinejoin="round"
              opacity={0.18}
              onMouseEnter={() => onPathEnter(COUNTRY_PATHS[homeIndex])}
              onMouseLeave={onPathLeave}
            />
            <path
              d={COUNTRY_PATHS[homeIndex].d}
              fill="url(#home-stripes)"
              stroke={HOME_STROKE}
              strokeWidth={0.6}
              strokeLinejoin="round"
              filter="url(#visited-glow)"
              onMouseEnter={() => onPathEnter(COUNTRY_PATHS[homeIndex])}
              onMouseLeave={onPathLeave}
              style={{ cursor: "pointer", outline: "none" }}
              tabIndex={0}
            />
          </>
        )}

        {Object.entries(POINT_MARKERS).map(([name, pt]) => {
          const visit = visitedByName.get(name);
          if (!visit) return null;
          const palette = YEAR_PALETTE[yearKey(visit.year)];
          const isHover = hovered?.id === `marker-${name}`;
          const synthetic: CountryPath = { id: `marker-${name}`, name, d: "" };
          return (
            <g
              key={name}
              onMouseEnter={() => onPathEnter(synthetic)}
              onMouseLeave={onPathLeave}
              onFocus={() => onPathEnter(synthetic)}
              onBlur={onPathLeave}
              tabIndex={0}
              style={{ cursor: "pointer", outline: "none" }}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHover ? 5.5 : 4}
                fill={palette.fill}
                stroke={palette.stroke}
                strokeWidth={1}
                filter="url(#visited-glow)"
                style={{ transition: "r 0.2s ease" }}
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={9}
                fill="transparent"
                pointerEvents="all"
              />
            </g>
          );
        })}
      </svg>

      {!isMobile && <Legend summary={summary} compact={false} />}

      {hovered && !isMobile && (
        <Tooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          name={hovered.name}
          isHome={hoveredIsHome}
          visit={hoveredVisit}
        />
      )}

      <Caption visitedCount={visited.length} compact={isMobile} />
    </div>
    {isMobile && <Legend summary={summary} compact={true} />}
    </>
  );
}

function Legend({
  summary,
  compact = false,
}: {
  summary: Record<string, number>;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div
        style={{
          marginTop: 8,
          padding: "8px 10px",
          background: "rgba(8, 14, 28, 0.78)",
          border: `0.5px solid ${ICE.hairline}`,
          borderRadius: 10,
          fontSize: 10,
          color: "rgba(220,238,255,0.78)",
          letterSpacing: 0.2,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 9.5,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: "rgba(156, 213, 255, 0.55)",
          }}
        >
          when
        </span>
        {YEAR_ORDER.map((k) => {
          const p = YEAR_PALETTE[k];
          const count = summary[k];
          return (
            <span
              key={k}
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <span
                aria-hidden
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: p.fill,
                  border: `0.5px solid ${p.stroke}`,
                  flexShrink: 0,
                }}
              />
              <span>
                {p.label}
                {count ? (
                  <span
                    style={{
                      color: "rgba(220,238,255,0.4)",
                      marginLeft: 3,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    · {count}
                  </span>
                ) : null}
              </span>
            </span>
          );
        })}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span
            aria-hidden
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              border: "0.5px solid rgba(220,240,255,0.6)",
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(220,240,255,0.55) 0 1.5px, rgba(220,240,255,0.18) 1.5px 4px)",
              flexShrink: 0,
            }}
          />
          <span>home</span>
        </span>
      </div>
    );
  }
  return (
    <div
      style={{
        position: "absolute",
        left: 18,
        bottom: 18,
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "12px 14px",
        background: "rgba(8, 14, 28, 0.78)",
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        border: `0.5px solid ${ICE.hairline}`,
        borderRadius: 10,
        fontSize: 11,
        color: "rgba(220,238,255,0.78)",
        letterSpacing: 0.2,
      }}
    >
      <div
        style={{
          fontSize: 9.5,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          color: "rgba(156, 213, 255, 0.55)",
          marginBottom: 2,
        }}
      >
        when
      </div>
      {YEAR_ORDER.map((k) => {
        const p = YEAR_PALETTE[k];
        const count = summary[k];
        return (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              aria-hidden
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: p.fill,
                border: `0.5px solid ${p.stroke}`,
                boxShadow: `0 0 8px ${p.stroke}66`,
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1 }}>{p.label}</span>
            <span style={{ color: "rgba(220,238,255,0.4)", fontVariantNumeric: "tabular-nums" }}>
              {count ? `${count}` : "—"}
            </span>
          </div>
        );
      })}
      <div
        style={{
          marginTop: 4,
          paddingTop: 8,
          borderTop: "0.5px solid rgba(156,213,255,0.14)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            border: "0.5px solid rgba(220,240,255,0.6)",
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(220,240,255,0.55) 0 1.5px, rgba(220,240,255,0.18) 1.5px 4px)",
            flexShrink: 0,
          }}
        />
        <span>home</span>
      </div>
    </div>
  );
}

function Tooltip({
  x,
  y,
  name,
  isHome,
  visit,
}: {
  x: number;
  y: number;
  name: string;
  isHome: boolean;
  visit?: VisitedCountry;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x + 14,
        top: y + 14,
        zIndex: 3,
        pointerEvents: "none",
        padding: "8px 12px",
        background: "rgba(8, 14, 28, 0.92)",
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        border: `0.5px solid ${ICE.hairline}`,
        borderRadius: 8,
        fontSize: 12,
        color: ICE.hi,
        letterSpacing: 0.2,
        whiteSpace: "nowrap",
        boxShadow: "0 12px 28px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 14,
          fontWeight: 400,
          letterSpacing: 0,
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: "rgba(156, 213, 255, 0.65)",
          marginTop: 2,
        }}
      >
        {isHome
          ? "home"
          : visit
          ? `visited · ${YEAR_PALETTE[yearKey(visit.year)]?.label ?? visit.year}`
          : "not yet"}
      </div>
    </div>
  );
}

function Caption({
  visitedCount,
  compact = false,
}: {
  visitedCount: number;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        right: compact ? 8 : 18,
        top: compact ? 8 : 18,
        zIndex: 2,
        textAlign: "right",
        fontSize: compact ? 9 : 10,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        color: "rgba(156, 213, 255, 0.55)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: compact ? 16 : 22,
          letterSpacing: -0.2,
          textTransform: "none",
          color: ICE.hi,
        }}
      >
        {visitedCount}{" "}
        <span
          style={{
            fontSize: compact ? 10 : 12,
            color: "rgba(220,238,255,0.55)",
          }}
        >
          countries
        </span>
      </div>
      {!compact && <div style={{ marginTop: 4 }}>and counting</div>}
    </div>
  );
}

function MapBackdrop() {
  // Subtle starfield / grid behind the map — keeps the panel from feeling flat.
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(156,213,255,0.06) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(156,213,255,0.05) 0, transparent 45%)",
      }}
    />
  );
}
