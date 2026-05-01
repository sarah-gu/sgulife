"use client";

import { useEffect, useState } from "react";
import { ICE, type Hub, type HubId, type NeuronContent } from "@/lib/brain";
import { useIsMobile } from "./use-mobile";

type Props = {
  hub: Hub;
  content: NeuronContent;
  anchor: { x: number; y: number };
  onClose: () => void;
  onOpenDetail: (id: HubId) => void;
};

export default function NeuronPanel({
  hub,
  content,
  anchor,
  onClose,
  onOpenDetail,
}: Props) {
  const cat = hub;
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<"enter" | "shown">("enter");
  useEffect(() => {
    const t = setTimeout(() => setPhase("shown"), 20);
    return () => clearTimeout(t);
  }, []);

  const ax = anchor?.x ?? 0.5;
  const ay = anchor?.y ?? 0.5;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at ${ax * 100}% ${
            ay * 100
          }%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 60%)`,
          opacity: phase === "shown" ? 1 : 0,
          transition: "opacity 0.5s ease",
          pointerEvents: phase === "shown" ? "auto" : "none",
          zIndex: 10,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform:
            phase === "shown"
              ? "translate(-50%, -50%) scale(1)"
              : `translate(-50%, -50%) scale(0.04) translate(${
                  (ax - 0.5) * 800
                }px, ${(ay - 0.5) * 500}px)`,
          width: isMobile ? "calc(100vw - 24px)" : "min(640px, 86vw)",
          maxHeight: isMobile ? "84vh" : "76vh",
          opacity: phase === "shown" ? 1 : 0,
          transition:
            "transform 0.7s cubic-bezier(.2,.85,.25,1), opacity 0.5s ease",
          background:
            "linear-gradient(150deg, rgba(20, 30, 52, 0.72) 0%, rgba(8, 14, 28, 0.78) 100%)",
          backdropFilter: "blur(28px) saturate(140%)",
          WebkitBackdropFilter: "blur(28px) saturate(140%)",
          border: "0.5px solid rgba(156, 213, 255, 0.22)",
          borderRadius: 18,
          boxShadow:
            "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(156,213,255,0.04), inset 0 1px 0 rgba(220,238,255,0.08)",
          overflow: "hidden",
          color: "rgba(190, 220, 255, 0.92)",
          fontFamily: "var(--font-sans)",
          display: "flex",
          flexDirection: "column",
          zIndex: 11,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "20%",
            right: "20%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(220,238,255,0.4), transparent)",
          }}
        />

        <div
          style={{
            padding: isMobile ? "20px 18px 14px" : "28px 32px 20px",
            display: "flex",
            alignItems: "flex-start",
            gap: isMobile ? 12 : 16,
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
                "0 0 32px rgba(190, 230, 255, 0.5), 0 0 0 1px rgba(156,213,255,0.3)",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                border: "0.5px solid rgba(156,213,255,0.18)",
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
              {cat.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: isMobile ? 22 : 28,
                lineHeight: 1.18,
                fontWeight: 400,
                color: ICE.hi,
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
              border: "0.5px solid rgba(156,213,255,0.2)",
              background: "rgba(0,0,0,0.2)",
              color: "rgba(190,220,255,0.6)",
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

        <div
          style={{
            padding: isMobile ? "0 18px 18px" : "0 32px 24px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {!isMobile && (
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
          )}

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
                fontFamily: "var(--font-serif)",
                fontSize: 38,
                fontWeight: 400,
                color: ICE.hi,
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
                color: "rgba(156,213,255,0.7)",
              }}
            >
              {content.metric.unit}
            </div>
            <div style={{ flex: 1 }} />
            <div
              style={{
                fontSize: 12,
                color: "rgba(190,220,255,0.55)",
                textAlign: "right",
              }}
            >
              {content.metric.sub}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? 8 : 14,
              marginBottom: 8,
            }}
          >
            {content.threads.map((th, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "120px 1fr",
                  gap: isMobile ? 4 : 18,
                  alignItems: "baseline",
                  paddingBottom: isMobile ? 8 : 14,
                  borderBottom:
                    i < content.threads.length - 1
                      ? "0.5px solid rgba(156,213,255,0.08)"
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
                    fontSize: isMobile ? 12.5 : 14,
                    lineHeight: isMobile ? 1.45 : 1.55,
                    color: "rgba(220,238,255,0.85)",
                    textWrap: "pretty",
                  }}
                >
                  {th.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: isMobile ? "14px 18px 18px" : "16px 32px 22px",
            borderTop: "0.5px solid rgba(156,213,255,0.1)",
            display: "flex",
            gap: isMobile ? 8 : 12,
            alignItems: "center",
            flexWrap: "wrap",
            background: "rgba(0,0,0,0.15)",
          }}
        >
          <button
            onClick={() => onOpenDetail(cat.id)}
            style={{
              padding: "10px 18px",
              background:
                "linear-gradient(180deg, rgba(156,213,255,0.18), rgba(110,170,230,0.12))",
              border: "0.5px solid rgba(156,213,255,0.35)",
              borderRadius: 8,
              color: ICE.hi,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: 0.3,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Read more →
          </button>
        </div>
      </div>
    </>
  );
}
