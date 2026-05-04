"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  ICE,
  type BrainData,
  type Hub,
  type HubId,
  type SubDot,
} from "@/lib/brain";
import NeuronDetail from "./NeuronDetail";
import { useIsMobile } from "./use-mobile";

const Brain3D = dynamic(() => import("./Brain3D"), { ssr: false });

type SubScreenPos = { id: string; x: number; y: number; z: number };

export default function BrainPage({
  data,
  initialRoute,
}: {
  data: BrainData;
  initialRoute: "brain" | HubId;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [hoveredSubId, setHoveredSubId] = useState<string | null>(null);
  const [subScreenPositions, setSubScreenPositions] = useState<SubScreenPos[]>(
    [],
  );
  const route = initialRoute;
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const onHubClick = (idx: number) => {
    router.push(`/${data.hubs[idx].id}`);
  };

  const onSubClick = (info: {
    id: string;
    slug: string;
    parentId: string;
    parentIdx: number;
  }) => {
    if (info.parentId === "about") {
      const link = data.details.about.links.find(
        (l) => l.label.toLowerCase() === info.slug.toLowerCase(),
      );
      if (link?.href) {
        window.open(link.href, "_blank", "noopener,noreferrer");
        return;
      }
    }
    router.push(`/${info.parentId}#${info.slug}`);
  };

  const hoveredSub: SubDot | null = hoveredSubId
    ? (data.subDots.find((s) => s.id === hoveredSubId) ?? null)
    : null;
  const hoveredSubScreen = hoveredSubId
    ? (subScreenPositions.find((p) => p.id === hoveredSubId) ?? null)
    : null;

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
            subDots={data.subDots}
            onHubHover={setHover}
            onHubClick={onHubClick}
            onSubHover={setHoveredSubId}
            onSubClick={onSubClick}
            onSubScreenUpdate={setSubScreenPositions}
            activeHub={hover}
            expandedHub={null}
            hoveredSubId={hoveredSubId}
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
            <div
              style={{
                marginTop: 6,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 6,
              }}
            >
              {data.details.about.links.map((link, i) => (
                <span
                  key={link.label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {i > 0 && <span style={{ opacity: 0.4 }}>·</span>}
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                      opacity: 0.7,
                      letterSpacing: 1.4,
                    }}
                  >
                    {link.label.toLowerCase()}
                  </a>
                </span>
              ))}
            </div>
          </div>

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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: isMobile ? 10 : 14,
                  fontFamily: "var(--font-serif)",
                  fontSize: isMobile ? 26 : 38,
                  lineHeight: 1.05,
                  fontWeight: 300,
                  color: ICE.hi,
                  letterSpacing: -0.4,
                  fontStyle: "italic",
                }}
              >
                <span>hi, I&rsquo;m sarah gu</span>
                <Image
                  src="/sgu/sarahgu.jpg"
                  alt="Sarah Gu"
                  width={isMobile ? 38 : 52}
                  height={isMobile ? 38 : 52}
                  sizes="52px"
                  style={{
                    width: isMobile ? 38 : 52,
                    height: isMobile ? 38 : 52,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "0.5px solid rgba(156, 213, 255, 0.3)",
                    boxShadow:
                      "0 0 24px rgba(156, 213, 255, 0.2), inset 0 0 0 1px rgba(220, 238, 255, 0.08)",
                    flexShrink: 0,
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: isMobile ? 12 : 13,
                  lineHeight: 1.5,
                  color: ICE.mid,
                  fontWeight: 300,
                  letterSpacing: 0.2,
                  maxWidth: 560,
                  margin: isMobile ? "8px auto 0" : "12px auto 0",
                  textWrap: "balance",
                }}
              >
                software engineer in nyc. building something new.
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: isMobile ? 11 : 12,
                  lineHeight: 1.5,
                  color: ICE.low,
                  fontWeight: 300,
                  fontStyle: "italic",
                  letterSpacing: 0.2,
                  maxWidth: 480,
                  margin: "6px auto 0",
                  textWrap: "balance",
                }}
              >
                currently obsessed with the idea of a digital brain.
              </div>
              {!isMobile && (
                <div
                  style={{
                    marginTop: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    opacity: 0.55,
                  }}
                >
                  {[
                    { src: "/sgu/columbia.svg", alt: "Columbia", h: 30, w: 39 },
                    { src: "/sgu/neo.png", alt: "Neo", h: 18, w: 43 },
                    { src: "/sgu/citadel-strip.png", alt: "Citadel Securities", h: 24, w: 49 },
                    { src: "/sgu/microsoft.svg", alt: "Microsoft", h: 18, w: 84 },
                    { src: "/sgu/meta.svg", alt: "Meta", h: 16, w: 79 },
                    { src: "/sgu/mitre.svg", alt: "MITRE", h: 14, w: 49 },
                  ].map((logo, i, arr) => (
                    <span
                      key={logo.alt}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 16,
                      }}
                    >
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={logo.w}
                        height={logo.h}
                        style={{
                          height: logo.h,
                          width: "auto",
                          objectFit: "contain",
                          filter: "brightness(0) invert(1)",
                        }}
                      />
                      {i < arr.length - 1 && (
                        <span
                          style={{
                            color: ICE.low,
                            opacity: 0.5,
                            fontSize: 10,
                          }}
                        >
                          ·
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}
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

          {hover === null && !isMobile && (
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

          {hover !== null && (
            <HoverChip hub={data.hubs[hover]} compact={isMobile} />
          )}

          {hoveredSub && hoveredSubScreen && (
            <SubHoverChip
              sub={hoveredSub}
              details={data.details}
              x={hoveredSubScreen.x}
              y={hoveredSubScreen.y}
            />
          )}

          <HubNav
            hubs={data.hubs}
            hovered={hover}
            onHoverHub={setHover}
            onPickHub={(idx) => router.push(`/${data.hubs[idx].id}`)}
            compact={isMobile}
          />
        </>
      ) : (
        <NeuronDetail
          hubId={route}
          hubLabel={data.hubs.find((h) => h.id === route)?.label ?? route}
          hubRegion={data.hubs.find((h) => h.id === route)?.region ?? ""}
          details={data.details}
          hubs={data.hubs}
          onBack={() => router.push("/")}
          onNavigate={(id) => router.push(`/${id}`)}
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

function SubHoverChip({
  sub,
  details,
  x,
  y,
}: {
  sub: SubDot;
  details: BrainData["details"];
  x: number;
  y: number;
}) {
  let thumb: string | null = null;
  let title = sub.label;
  let subtitle = "";

  if (sub.kind === "project") {
    const p = details.projects.find((pr) => pr.slug === sub.slug);
    if (p) {
      thumb = p.image;
      title = p.name;
      subtitle = p.description;
    }
  } else if (sub.kind === "experience") {
    const e = details.experience.find((ex) => ex.slug === sub.slug);
    if (e) {
      thumb = e.logo;
      title = e.company;
      subtitle = `${e.role} · ${e.dates}`;
    }
  } else if (sub.kind === "trip") {
    const photos = details.travel.photos.filter((p) => p.trip === sub.label);
    thumb = photos[0]?.src ?? null;
    title = sub.label;
    const wheres = Array.from(new Set(photos.map((p) => p.where)));
    subtitle = wheres.join(" · ");
  } else if (sub.kind === "link") {
    const link = details.about.links.find(
      (l) => l.label.toLowerCase() === sub.slug.toLowerCase(),
    );
    title = sub.label;
    if (link?.href) {
      try {
        const u = new URL(link.href);
        subtitle = `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}`;
      } catch {
        subtitle = link.href;
      }
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, calc(-100% - 18px))",
        zIndex: 6,
        pointerEvents: "none",
        padding: "10px 14px 10px 12px",
        background: "rgba(12, 20, 36, 0.78)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        border: `0.5px solid ${ICE.hairline}`,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        gap: 12,
        maxWidth: 320,
        boxShadow:
          "0 12px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(220,238,255,0.05)",
        animation: "sub-chip-in 0.18s ease",
      }}
    >
      {thumb && (
        <div
          style={{
            position: "relative",
            width: 36,
            height: 36,
            flex: "0 0 36px",
            borderRadius: 8,
            overflow: "hidden",
            border: "0.5px solid rgba(156,213,255,0.18)",
            background: "rgba(0,0,0,0.3)",
          }}
        >
          <Image
            src={thumb}
            alt={title}
            fill
            sizes="36px"
            style={{ objectFit: "cover" }}
          />
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 14,
            color: ICE.hi,
            letterSpacing: 0.2,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: 11,
              color: ICE.low,
              marginTop: 2,
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

function HubNav({
  hubs,
  hovered,
  onHoverHub,
  onPickHub,
  compact = false,
}: {
  hubs: Hub[];
  hovered: number | null;
  onHoverHub: (idx: number | null) => void;
  onPickHub: (idx: number) => void;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: compact ? 8 : 32,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 5,
        display: "flex",
        alignItems: "stretch",
        gap: compact ? 4 : 6,
        padding: compact ? "5px 6px" : "8px 10px",
        background: "rgba(12, 20, 36, 0.62)",
        backdropFilter: "blur(24px) saturate(140%)",
        WebkitBackdropFilter: "blur(24px) saturate(140%)",
        border: `0.5px solid ${ICE.hairline}`,
        borderRadius: 999,
        boxShadow:
          "0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(220,238,255,0.05)",
        maxWidth: "calc(100vw - 16px)",
        flexWrap: "nowrap",
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
              padding: compact ? "8px 12px" : "8px 14px",
              borderRadius: 999,
              border: active
                ? `0.5px solid ${ICE.accent}`
                : "0.5px solid transparent",
              background: active ? "rgba(156, 213, 255, 0.16)" : "transparent",
              color: active ? ICE.hi : ICE.mid,
              fontSize: compact ? 11 : 12.5,
              fontFamily: "inherit",
              letterSpacing: compact ? 0.2 : 0.2,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: active
                ? "inset 0 0 12px rgba(156,213,255,0.08), 0 0 16px rgba(156,213,255,0.18)"
                : "none",
              whiteSpace: "nowrap",
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
