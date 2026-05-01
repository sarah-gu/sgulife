"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import {
  ICE,
  type BrainData,
  type Hub,
  type HubId,
} from "@/lib/brain";
import FloatingThoughts from "./FloatingThoughts";
import HealthDetail from "./HealthDetail";
import NeuronPanel from "./NeuronPanel";

const Brain3D = dynamic(() => import("./Brain3D"), { ssr: false });

export default function BrainPage({ data }: { data: BrainData }) {
  const [hover, setHover] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [anchor, setAnchor] = useState({ x: 0.5, y: 0.5 });
  const [route, setRoute] = useState<"brain" | "health">("brain");
  const [askValue, setAskValue] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  const onHubClick = (idx: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    const labelEl = wrap.querySelector(`[data-hub-idx="${idx}"]`);
    if (labelEl) {
      const lr = (labelEl as HTMLElement).getBoundingClientRect();
      setAnchor({
        x: (lr.left + lr.width / 2 - r.left) / r.width,
        y: (lr.top + lr.height / 2 - r.top) / r.height,
      });
    }
    setExpanded(idx);
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      ref={wrapRef}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: `radial-gradient(ellipse at 50% 45%, #0d1830 0%, ${ICE.bg1} 65%, #02040a 100%)`,
        color: ICE.mid,
        fontFamily: "var(--font-sans)",
      }}
    >
      {route === "brain" ? (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)",
              zIndex: 2,
            }}
          />
          <Grain />

          <Brain3D
            hubs={data.hubs}
            onHubHover={setHover}
            onHubClick={onHubClick}
            activeHub={hover}
            expandedHub={expanded}
          />

          <div
            style={{
              position: "absolute",
              top: 28,
              left: 36,
              zIndex: 5,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: ICE.accent,
                boxShadow: `0 0 12px ${ICE.accent}`,
              }}
            />
            <div
              style={{
                fontSize: 11,
                letterSpacing: 2.6,
                textTransform: "lowercase",
                color: ICE.low,
                fontWeight: 400,
                fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
              }}
            >
              brain
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: 28,
              right: 36,
              zIndex: 5,
              textAlign: "right",
              fontSize: 10,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: ICE.low,
            }}
          >
            <div>{today}</div>
            <div style={{ marginTop: 4, opacity: 0.65 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  background: ICE.accent,
                  marginRight: 6,
                  verticalAlign: "middle",
                  boxShadow: `0 0 8px ${ICE.accent}`,
                }}
              />
              all sources synced
            </div>
          </div>

          {expanded === null && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 64,
                transform: "translateX(-50%)",
                zIndex: 4,
                textAlign: "center",
                pointerEvents: "none",
                opacity: hover === null ? 1 : 0.4,
                transition: "opacity 0.4s ease",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 26,
                  lineHeight: 1.15,
                  fontWeight: 300,
                  color: ICE.hi,
                  letterSpacing: 0.3,
                  fontStyle: "italic",
                  textWrap: "balance",
                  maxWidth: 540,
                  margin: "0 auto",
                }}
              >
                your second mind
              </div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: 2.4,
                  textTransform: "uppercase",
                  color: ICE.low,
                  marginTop: 10,
                  fontWeight: 400,
                }}
              >
                traverse a region · ask anything
              </div>
            </div>
          )}

          {expanded === null && hover === null && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: 134,
                transform: "translateX(-50%)",
                zIndex: 3,
                pointerEvents: "none",
                fontSize: 10,
                letterSpacing: 2.4,
                textTransform: "uppercase",
                color: ICE.low,
                fontWeight: 400,
                display: "flex",
                alignItems: "center",
                gap: 12,
                animation: "caption-fade 0.6s ease",
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 0.5,
                  background: ICE.hairline,
                }}
              />
              drag to rotate · click a hub
              <span
                style={{
                  width: 30,
                  height: 0.5,
                  background: ICE.hairline,
                }}
              />
            </div>
          )}

          {hover !== null && expanded === null && (
            <HoverChip hub={data.hubs[hover]} />
          )}

          {expanded === null && <FloatingThoughts thoughts={data.thoughts} />}

          {expanded !== null && (
            <NeuronPanel
              hub={data.hubs[expanded]}
              content={data.neurons[data.hubs[expanded].id as HubId]}
              anchor={anchor}
              onClose={() => setExpanded(null)}
              onOpenDetail={(id) => {
                if (id === "health") setRoute("health");
              }}
            />
          )}

          <AskBar
            value={askValue}
            onChange={setAskValue}
            disabled={expanded !== null}
          />
        </>
      ) : (
        <HealthDetail
          health={data.health}
          onBack={() => {
            setRoute("brain");
            setExpanded(null);
          }}
        />
      )}
    </div>
  );
}

function HoverChip({ hub }: { hub: Hub }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 112,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 4,
        pointerEvents: "none",
        padding: "10px 18px",
        background: "rgba(12, 20, 36, 0.65)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        border: `0.5px solid ${ICE.hairline}`,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        gap: 14,
        animation: "chip-in 0.3s ease",
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          background: ICE.accent,
          boxShadow: `0 0 10px ${ICE.accent}`,
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 16,
          color: ICE.hi,
          letterSpacing: 0.3,
        }}
      >
        {hub.label}
      </span>
      <span
        style={{
          fontSize: 10,
          color: ICE.accent,
          opacity: 0.65,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          fontFamily: "ui-monospace, monospace",
        }}
      >
        {hub.region}
      </span>
      <span
        style={{
          fontSize: 11,
          color: ICE.accent,
          opacity: 0.85,
          letterSpacing: 0.8,
        }}
      >
        {hub.stat}
      </span>
      <span style={{ fontSize: 11, color: ICE.low, fontStyle: "italic" }}>
        · {hub.recent}
      </span>
    </div>
  );
}

function AskBar({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 5,
        width: "min(560px, 80%)",
        opacity: disabled ? 0 : 1,
        transition: "opacity 0.4s ease",
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 20px",
          background: focused ? "rgba(16, 24, 44, 0.82)" : "rgba(12, 20, 36, 0.62)",
          backdropFilter: "blur(24px) saturate(140%)",
          WebkitBackdropFilter: "blur(24px) saturate(140%)",
          border: focused ? `0.5px solid ${ICE.accent}` : `0.5px solid ${ICE.hairline}`,
          borderRadius: 999,
          boxShadow: focused
            ? `0 16px 40px rgba(0,0,0,0.6), 0 0 30px rgba(156,213,255,0.18), inset 0 1px 0 rgba(220,238,255,0.08)`
            : "0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(220,238,255,0.05)",
          transition: "all 0.3s ease",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke={ICE.accent} strokeWidth="1" opacity="0.8" />
          <circle cx="7" cy="7" r="1.5" fill={ICE.accent} />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Ask your brain anything…"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: ICE.hi,
            fontFamily: "inherit",
            fontSize: 14,
            letterSpacing: 0.2,
            fontStyle: value ? "normal" : "italic",
          }}
        />
        <span
          style={{
            padding: "2px 6px",
            borderRadius: 3,
            background: "rgba(156,213,255,0.1)",
            fontFamily: "ui-monospace, monospace",
            fontSize: 10,
            letterSpacing: 0.4,
            color: ICE.accent,
            opacity: 0.8,
          }}
        >
          ⌘K
        </span>
      </div>
    </div>
  );
}

function Grain() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        mixBlendMode: "overlay",
        opacity: 0.12,
        zIndex: 3,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
      }}
    />
  );
}
