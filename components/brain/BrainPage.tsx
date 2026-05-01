"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { ICE, type BrainData, type Hub, type HubId } from "@/lib/brain";
import FloatingThoughts from "./FloatingThoughts";
import NeuronDetail from "./NeuronDetail";
import NeuronPanel from "./NeuronPanel";
import { useIsMobile } from "./use-mobile";

const Brain3D = dynamic(() => import("./Brain3D"), { ssr: false });

export default function BrainPage({ data }: { data: BrainData }) {
  const [hover, setHover] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [anchor, setAnchor] = useState({ x: 0.5, y: 0.5 });
  const [route, setRoute] = useState<"brain" | HubId>("brain");
  const wrapRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

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
              top: isMobile ? 16 : 28,
              left: isMobile ? 18 : 36,
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
              sgu-brain
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: isMobile ? 16 : 28,
              right: isMobile ? 18 : 36,
              zIndex: 5,
              textAlign: "right",
              fontSize: isMobile ? 9 : 10,
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
                top: isMobile ? 52 : 64,
                transform: "translateX(-50%)",
                zIndex: 4,
                textAlign: "center",
                pointerEvents: "none",
                opacity: hover === null ? 1 : 0.4,
                transition: "opacity 0.4s ease",
                width: "min(640px, calc(100vw - 32px))",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: isMobile ? 26 : 38,
                  lineHeight: 1.05,
                  fontWeight: 300,
                  color: ICE.hi,
                  letterSpacing: -0.4,
                  fontStyle: "italic",
                  textWrap: "balance",
                  maxWidth: 640,
                  margin: "0 auto",
                }}
              >
                hi, I&rsquo;m sarah gu
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: isMobile ? 12 : 13,
                  lineHeight: 1.5,
                  color: ICE.mid,
                  marginTop: 12,
                  fontWeight: 300,
                  letterSpacing: 0.2,
                  maxWidth: 520,
                  margin: isMobile ? "8px auto 0" : "12px auto 0",
                  textWrap: "balance",
                }}
              >
                software engineer + builder. currently obsessed with the idea of
                a digital brain.
              </div>
              <div
                style={{
                  fontSize: isMobile ? 9 : 10,
                  letterSpacing: 2.4,
                  textTransform: "uppercase",
                  color: ICE.low,
                  marginTop: isMobile ? 10 : 14,
                  fontWeight: 400,
                }}
              >
                {isMobile
                  ? "tap a glowing region"
                  : "click a glowing region to explore"}
              </div>
            </div>
          )}

          {expanded === null && hover === null && !isMobile && (
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
            <HoverChip hub={data.hubs[hover]} compact={isMobile} />
          )}

          {expanded === null && !isMobile && (
            <FloatingThoughts thoughts={data.thoughts} />
          )}

          {expanded !== null && (
            <NeuronPanel
              hub={data.hubs[expanded]}
              content={data.neurons[data.hubs[expanded].id as HubId]}
              anchor={anchor}
              onClose={() => setExpanded(null)}
              onOpenDetail={(id) => setRoute(id)}
            />
          )}

          <HubNav
            hubs={data.hubs}
            hovered={hover}
            onHoverHub={setHover}
            onPickHub={(idx) => onHubClick(idx)}
            disabled={expanded !== null}
            compact={isMobile}
          />
        </>
      ) : (
        <NeuronDetail
          hubId={route}
          hubLabel={data.hubs.find((h) => h.id === route)?.label ?? route}
          hubRegion={data.hubs.find((h) => h.id === route)?.region ?? ""}
          details={data.details}
          onBack={() => {
            setRoute("brain");
            setExpanded(null);
          }}
        />
      )}
    </div>
  );
}

function HoverChip({ hub, compact = false }: { hub: Hub; compact?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: compact ? 96 : 112,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 4,
        pointerEvents: "none",
        padding: compact ? "8px 14px" : "10px 18px",
        background: "rgba(12, 20, 36, 0.65)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        border: `0.5px solid ${ICE.hairline}`,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        gap: compact ? 10 : 14,
        maxWidth: "calc(100vw - 32px)",
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
      {!compact && (
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
      )}
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
      {!compact && (
        <span style={{ fontSize: 11, color: ICE.low, fontStyle: "italic" }}>
          · {hub.recent}
        </span>
      )}
    </div>
  );
}

function HubNav({
  hubs,
  hovered,
  onHoverHub,
  onPickHub,
  disabled,
  compact = false,
}: {
  hubs: Hub[];
  hovered: number | null;
  onHoverHub: (idx: number | null) => void;
  onPickHub: (idx: number) => void;
  disabled: boolean;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: compact ? 20 : 32,
        left: compact ? 8 : "50%",
        right: compact ? 8 : undefined,
        transform: compact ? undefined : "translateX(-50%)",
        zIndex: 5,
        opacity: disabled ? 0 : 1,
        transition: "opacity 0.4s ease",
        pointerEvents: disabled ? "none" : "auto",
        display: "flex",
        alignItems: "stretch",
        gap: compact ? 2 : 6,
        padding: compact ? 4 : "8px 10px",
        background: "rgba(12, 20, 36, 0.62)",
        backdropFilter: "blur(24px) saturate(140%)",
        WebkitBackdropFilter: "blur(24px) saturate(140%)",
        border: `0.5px solid ${ICE.hairline}`,
        borderRadius: 999,
        boxShadow:
          "0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(220,238,255,0.05)",
        maxWidth: compact ? undefined : "calc(100vw - 32px)",
        flexWrap: compact ? "nowrap" : "wrap",
        justifyContent: "center",
      }}
    >
      {hubs.map((h, i) => {
        const active = i === hovered;
        return (
          <button
            key={h.id}
            data-hub-idx={i}
            onMouseEnter={() => onHoverHub(i)}
            onMouseLeave={() => onHoverHub(null)}
            onFocus={() => onHoverHub(i)}
            onBlur={() => onHoverHub(null)}
            onClick={() => onPickHub(i)}
            style={{
              padding: compact ? "8px 4px" : "8px 14px",
              flex: compact ? 1 : undefined,
              minWidth: 0,
              borderRadius: 999,
              border: active
                ? `0.5px solid ${ICE.accent}`
                : "0.5px solid transparent",
              background: active ? "rgba(156, 213, 255, 0.16)" : "transparent",
              color: active ? ICE.hi : ICE.mid,
              fontSize: compact ? 11 : 12.5,
              fontFamily: "inherit",
              letterSpacing: compact ? 0.1 : 0.2,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: active
                ? "inset 0 0 12px rgba(156,213,255,0.08), 0 0 16px rgba(156,213,255,0.18)"
                : "none",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textAlign: "center",
            }}
          >
            {h.label.toLowerCase()}
          </button>
        );
      })}
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
