"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ICE,
  type DetailContent,
  type ExperienceItem,
  type Hub,
  type HubId,
  type ProjectItem,
  type AboutDetail,
  type TravelDetail,
} from "@/lib/brain";

const TravelMap = dynamic(() => import("./TravelMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        aspectRatio: "980 / 480",
        borderRadius: 16,
        border: "0.5px solid rgba(156,213,255,0.16)",
        background: "rgba(8, 14, 28, 0.6)",
      }}
    />
  ),
});

const PhotoStrip = dynamic(() => import("./PhotoStrip"), { ssr: false });

const SPELL = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];
const spellOut = (n: number) => (n < 10 ? SPELL[n] : String(n));

type Props = {
  hubId: HubId;
  hubLabel: string;
  hubRegion: string;
  details: DetailContent;
  hubs: Hub[];
  onBack: () => void;
  onNavigate: (id: HubId) => void;
};

export default function NeuronDetail({
  hubId,
  hubLabel,
  hubRegion,
  details,
  hubs,
  onBack,
  onNavigate,
}: Props) {
  const idx = hubs.findIndex((h) => h.id === hubId);
  const prev = idx >= 0 ? hubs[(idx - 1 + hubs.length) % hubs.length] : null;
  const next = idx >= 0 ? hubs[(idx + 1) % hubs.length] : null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const handle = window.setTimeout(() => {
      const el = document.querySelector<HTMLElement>(
        `[data-slug="${CSS.escape(hash)}"]`,
      );
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("hd-pulse");
      window.setTimeout(() => el.classList.remove("hd-pulse"), 1600);
    }, 320);
    return () => window.clearTimeout(handle);
  }, [hubId]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 30% 20%, #0f1a32 0%, #050810 55%)",
        color: "rgba(190, 220, 255, 0.92)",
        fontFamily: "var(--font-sans)",
        overflowY: "auto",
        overflowX: "hidden",
        animation: "hd-fade 0.6s ease",
        paddingBottom: 96,
      }}
    >
      <style>{`
        @keyframes hd-fade { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: scale(1); } }
        @keyframes hd-pulse-kf {
          0%, 100% { box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(220,238,255,0.05), 0 0 0 0 rgba(156,213,255,0); border-color: rgba(156,213,255,0.16); }
          40% { box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(220,238,255,0.05), 0 0 0 3px rgba(156,213,255,0.45); border-color: rgba(156,213,255,0.6); }
        }
        .hd-pulse { animation: hd-pulse-kf 0.8s ease-in-out 2 !important; }
        .hd-card { background: linear-gradient(160deg, rgba(20,30,52,0.55) 0%, rgba(8,14,28,0.65) 100%);
                   backdrop-filter: blur(20px) saturate(140%);
                   -webkit-backdrop-filter: blur(20px) saturate(140%);
                   border: 0.5px solid rgba(156,213,255,0.16);
                   border-radius: 14px;
                   min-width: 0;
                   overflow-wrap: anywhere;
                   box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(220,238,255,0.05); }
        .hd-experience-card > div:last-child { min-width: 0; }
        .hd-eyebrow { font-size: 10px; letter-spacing: 1.6px; text-transform: uppercase;
                      color: rgba(156, 213, 255, 0.55); font-weight: 500; }
        .hd-pad { padding-left: 56px; padding-right: 56px; }
        .hd-h1 { font-size: 60px; }
        .hd-summary { font-size: 17px; }
        .hd-about-stack { max-width: 580px; margin: 0 auto; padding: 24px 0 80px; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .hd-about-rule { width: 36px; height: 0.5px; background: rgba(156,213,255,0.22); margin: 28px 0; }
        .hd-social-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; border: 0.5px solid rgba(156,213,255,0.16); background: rgba(156,213,255,0.04); color: rgba(220,238,255,0.78); font-size: 12px; letter-spacing: 0.2px; text-decoration: none; transition: all 0.15s ease; }
        .hd-social-pill:hover { border-color: rgba(156,213,255,0.36); background: rgba(156,213,255,0.09); color: rgba(220,238,255,0.95); }
        .hd-projects-grid { display: grid; gap: 18px; grid-template-columns: 1fr 1fr; }
        .hd-project-card:hover { transform: translateY(-2px); border-color: rgba(156, 213, 255, 0.32); }
        .hd-experience-card { padding: 14px 22px; display: grid; grid-template-columns: 64px 1fr; gap: 18px; align-items: center; }
        @media (max-width: 720px) {
          .hd-pad { padding-left: 18px; padding-right: 18px; }
          .hd-h1 { font-size: 34px; letter-spacing: -0.4px; }
          .hd-summary { font-size: 14px; }
          .hd-about-stack { padding: 16px 0 60px; }
          .hd-projects-grid { grid-template-columns: 1fr; gap: 14px; }
          .hd-experience-card { padding: 12px 14px; grid-template-columns: 52px 1fr; gap: 12px; }
        }
      `}</style>

      <BrainBackdrop />
      <DetailHeader hubLabel={hubLabel} hubRegion={hubRegion} onBack={onBack} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {hubId === "about" && <AboutView about={details.about} />}
        {hubId === "experience" && (
          <ExperienceView items={details.experience} />
        )}
        {hubId === "projects" && <ProjectsView items={details.projects} />}
        {hubId === "travel" && <TravelView travel={details.travel} />}
        {prev && next && (
          <NeuronFooter prev={prev} next={next} onNavigate={onNavigate} />
        )}
      </div>
    </div>
  );
}

function NeuronFooter({
  prev,
  next,
  onNavigate,
}: {
  prev: Hub;
  next: Hub;
  onNavigate: (id: HubId) => void;
}) {
  return (
    <div
      className="hd-pad"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
        paddingTop: 14,
        paddingBottom: "calc(14px + env(safe-area-inset-bottom, 0px))",
        background:
          "linear-gradient(0deg, rgba(5,8,16,0.94) 0%, rgba(5,8,16,0.82) 65%, rgba(5,8,16,0.55) 100%)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        borderTop: "0.5px solid rgba(156,213,255,0.14)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
      }}
    >
      <NeuronFooterLink direction="prev" hub={prev} onNavigate={onNavigate} />
      <NeuronFooterLink direction="next" hub={next} onNavigate={onNavigate} />
    </div>
  );
}

function NeuronFooterLink({
  direction,
  hub,
  onNavigate,
}: {
  direction: "prev" | "next";
  hub: Hub;
  onNavigate: (id: HubId) => void;
}) {
  const isNext = direction === "next";
  return (
    <button
      onClick={() => onNavigate(hub.id)}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 0,
        textAlign: isNext ? "right" : "left",
        color: "inherit",
        fontFamily: "inherit",
        display: "flex",
        flexDirection: "column",
        alignItems: isNext ? "flex-end" : "flex-start",
        gap: 4,
      }}
    >
      <span className="hd-eyebrow">{isNext ? "next →" : "← previous"}</span>
      <span
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 24,
          fontWeight: 400,
          color: ICE.hi,
          letterSpacing: -0.2,
        }}
      >
        {hub.label.toLowerCase()}
      </span>
    </button>
  );
}

function DetailHeader({
  hubLabel,
  hubRegion,
  onBack,
}: {
  hubLabel: string;
  hubRegion: string;
  onBack: () => void;
}) {
  return (
    <div
      className="hd-pad"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        paddingTop: 16,
        paddingBottom: 16,
        background:
          "linear-gradient(180deg, rgba(5,8,16,0.85) 0%, rgba(5,8,16,0) 100%)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        gap: 16,
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
          {hubLabel.toLowerCase()} · {hubRegion.toLowerCase()}
        </span>
      </div>
    </div>
  );
}

function HubTitle({
  eyebrow,
  headline,
  summary,
}: {
  eyebrow: string;
  headline: string;
  summary?: string;
}) {
  return (
    <div className="hd-pad" style={{ paddingTop: 16, paddingBottom: 28 }}>
      <div className="hd-eyebrow" style={{ marginBottom: 14 }}>
        {eyebrow}
      </div>
      <h1
        className="hd-h1"
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          lineHeight: 1.04,
          letterSpacing: -0.8,
          color: ICE.hi,
          margin: "0 0 18px",
          maxWidth: 880,
          textWrap: "balance",
        }}
      >
        {headline}
      </h1>
      {summary && (
        <p
          className="hd-summary"
          style={{
            lineHeight: 1.55,
            color: "rgba(220,238,255,0.7)",
            maxWidth: 720,
            margin: 0,
            textWrap: "pretty",
          }}
        >
          {summary}
        </p>
      )}
    </div>
  );
}

// ── About ───────────────────────────────────────────────────────────────
function AboutView({ about }: { about: AboutDetail }) {
  return (
    <>
      <div className="hd-pad">
        <div className="hd-about-stack">
          <div
            style={{
              position: "relative",
              width: 140,
              height: 140,
              borderRadius: "50%",
              overflow: "hidden",
              border: "0.5px solid rgba(156,213,255,0.3)",
              boxShadow:
                "0 0 32px rgba(156,213,255,0.18), inset 0 0 0 1px rgba(220,238,255,0.06)",
              flexShrink: 0,
            }}
          >
            <Image
              src={about.photo}
              alt={about.name}
              fill
              priority
              sizes="140px"
              style={{ objectFit: "cover" }}
            />
          </div>

          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 34,
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: -0.4,
              color: ICE.hi,
              margin: "22px 0 6px",
            }}
          >
            {about.name}
          </h1>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 16,
              fontStyle: "italic",
              color: "rgba(220,238,255,0.7)",
              letterSpacing: 0.1,
            }}
          >
            {about.tagline}
          </div>
          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 11,
              color: "rgba(220,238,255,0.5)",
              letterSpacing: 1.6,
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: 3,
                background: ICE.accent,
                boxShadow: `0 0 8px ${ICE.accent}`,
              }}
            />
            <span>based in nyc</span>
          </div>

          <div className="hd-about-rule" />

          <div style={{ width: "100%", textAlign: "left" }}>
            {about.paragraphs.map((p, i) => (
              <p
                key={i}
                style={{
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: "rgba(220,238,255,0.82)",
                  margin: i === about.paragraphs.length - 1 ? 0 : "0 0 18px",
                  textWrap: "pretty",
                }}
              >
                {p}
              </p>
            ))}
          </div>

          <div className="hd-about-rule" />

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {about.links.map((l) => (
              <a
                key={l.label}
                className="hd-social-pill"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {l.label.toLowerCase()}
                <span style={{ color: ICE.accent, opacity: 0.6, fontSize: 10 }}>↗</span>
              </a>
            ))}
          </div>

          <div
            style={{
              marginTop: 24,
              fontSize: 13,
              color: "rgba(220,238,255,0.55)",
              fontStyle: "italic",
              letterSpacing: 0.2,
            }}
          >
            always open to a coffee.{" "}
            <a
              href={about.links[0]?.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: ICE.accent,
                textDecoration: "none",
                borderBottom: `0.5px solid ${ICE.accent}`,
                paddingBottom: 1,
                fontStyle: "normal",
              }}
            >
              {about.contactCta.toLowerCase()} →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Experience ──────────────────────────────────────────────────────────
function ExperienceView({ items }: { items: ExperienceItem[] }) {
  return (
    <>
      <HubTitle
        eyebrow={`${spellOut(items.length)} roles`}
        headline="Past roles."
        summary="Full-stack at Citadel Securities, then left this April to start something new. Prev at Phia, Vivid, Microsoft, Meta, MITRE."
      />
      <div
        className="hd-pad"
        style={{
          paddingBottom: 80,
          display: "grid",
          gap: 12,
          gridTemplateColumns: "1fr",
        }}
      >
        {items.map((item) => (
          <ExperienceCard key={item.company} item={item} />
        ))}
      </div>
    </>
  );
}

function ExperienceCard({ item }: { item: ExperienceItem }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="hd-card hd-experience-card"
      data-slug={item.slug}
      style={{ scrollMarginTop: 96, scrollMarginBottom: 96 }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 12,
          overflow: "hidden",
          background: "rgba(255,255,255,0.85)",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <Image
          src={item.logo}
          alt={item.company}
          fill
          sizes="64px"
          style={{ objectFit: "contain", padding: 7 }}
        />
      </div>
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 4,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(20px, 4.5vw, 26px)",
              fontWeight: 400,
              color: ICE.hi,
              letterSpacing: -0.2,
            }}
          >
            {item.company}
          </div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: ICE.accent,
              opacity: 0.7,
              fontFamily: "ui-monospace, monospace",
            }}
          >
            {item.dates}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: expanded ? 10 : 0,
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: "rgba(220,238,255,0.82)",
              letterSpacing: 0.2,
            }}
          >
            {item.role}
            <span style={{ color: "rgba(220,238,255,0.4)" }}>
              {" "}
              · {item.blurb}
            </span>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              color: ICE.accent,
              opacity: 0.7,
              cursor: "pointer",
              fontFamily: "ui-monospace, monospace",
              fontSize: 11,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              flexShrink: 0,
            }}
          >
            {expanded ? "− less" : "+ details"}
          </button>
        </div>
        {expanded && (
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "rgba(220,238,255,0.7)",
              margin: 0,
              textWrap: "pretty",
            }}
          >
            {item.details}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Projects ────────────────────────────────────────────────────────────
function ProjectsView({ items }: { items: ProjectItem[] }) {
  return (
    <>
      <HubTitle
        eyebrow={`${spellOut(items.length)} builds`}
        headline="Projects for fun."
        summary="Perch (AI apartment hunting), Brooklyn Half tracker, Senior Scramble (700+ users in two weeks), Goji Health ($15K Columbia VC). Older below."
      />
      <div className="hd-pad hd-projects-grid" style={{ paddingBottom: 80 }}>
        {items.map((p) => (
          <ProjectCard key={p.name} project={p} />
        ))}
      </div>
    </>
  );
}

function ProjectCard({ project }: { project: ProjectItem }) {
  const Wrapper: React.ElementType = project.link ? "a" : "div";
  const wrapperProps = project.link
    ? {
        href: project.link,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};
  return (
    <Wrapper
      {...wrapperProps}
      className="hd-card hd-project-card"
      data-slug={project.slug}
      style={{
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        cursor: project.link ? "pointer" : "default",
        transition: "transform 0.25s ease, border-color 0.25s ease",
        scrollMarginTop: 96,
        scrollMarginBottom: 96,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          background: "rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
      >
        <Image
          src={project.image}
          alt={project.name}
          fill
          sizes="(max-width: 800px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            boxShadow:
              "inset 0 0 0 0.5px rgba(156,213,255,0.16), inset 0 -36px 56px -28px rgba(8,14,28,0.55)",
          }}
        />
        {project.award && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              padding: "5px 10px",
              borderRadius: 999,
              background: "rgba(8, 14, 28, 0.78)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "0.5px solid rgba(220,200,140,0.45)",
              color: "rgba(255, 240, 200, 0.92)",
              fontSize: 10.5,
              letterSpacing: 0.3,
              fontWeight: 500,
            }}
          >
            {project.award}
          </div>
        )}
      </div>
      <div
        style={{
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 22,
              fontWeight: 400,
              color: ICE.hi,
              letterSpacing: -0.2,
            }}
          >
            {project.name}
          </div>
          {project.link && (
            <span style={{ color: ICE.accent, opacity: 0.6, fontSize: 14 }}>
              ↗
            </span>
          )}
        </div>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.55,
            color: "rgba(220,238,255,0.7)",
            margin: 0,
            textWrap: "pretty",
          }}
        >
          {project.description}
        </p>
      </div>
    </Wrapper>
  );
}

// ── Travel ──────────────────────────────────────────────────────────────
function TravelView({ travel }: { travel: TravelDetail }) {
  return (
    <>
      <style>{`
        .travel-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .travel-photos {
          height: 360px;
        }
        @media (max-width: 720px) {
          .travel-photos {
            height: 320px;
          }
        }
      `}</style>
      <HubTitle
        eyebrow={`${spellOut(travel.visited.length)} countries`}
        headline={travel.headline}
        summary={travel.summary}
      />
      <div className="hd-pad" style={{ paddingBottom: 80 }}>
        <div className="travel-stack">
          <div style={{ minWidth: 0 }}>
            <TravelMap home={travel.home} visited={travel.visited} />
          </div>
          <div className="travel-photos">
            <PhotoStrip photos={travel.photos} />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Backdrop (subtle network of lines) ──────────────────────────────────
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
      const w = c.width / dpr;
      const h = c.height / dpr;
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
          const a = nodes[i];
          const b = nodes[j];
          const dx = (a.x - b.x) * w;
          const dy = (a.y - b.y) * h;
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
        overflow: "hidden",
      }}
    >
      <canvas
        ref={ref}
        style={{
          position: "absolute",
          inset: 0,
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      />
    </div>
  );
}
