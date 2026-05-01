"use client";

import Image from "next/image";
import { Fragment, useMemo } from "react";
import { ICE, type TravelPhoto } from "@/lib/brain";

type Props = {
  photos: TravelPhoto[];
};

type Group = { trip: string; photos: TravelPhoto[] };

export default function PhotoStrip({ photos }: Props) {
  const groups = useMemo<Group[]>(() => {
    const order: string[] = [];
    const map = new Map<string, TravelPhoto[]>();
    for (const p of photos) {
      if (!map.has(p.trip)) {
        map.set(p.trip, []);
        order.push(p.trip);
      }
      map.get(p.trip)!.push(p);
    }
    return order.map((trip) => ({ trip, photos: map.get(trip)! }));
  }, [photos]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        borderRadius: 16,
        border: `0.5px solid ${ICE.hairline}`,
        background:
          "linear-gradient(160deg, rgba(20,30,52,0.55) 0%, rgba(8,14,28,0.65) 100%)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        boxShadow:
          "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(220,238,255,0.05)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        .ps-card { width: 300px; }
        @media (max-width: 720px) {
          .ps-card { width: 240px; }
        }
      `}</style>
      <div
        style={{
          padding: "16px 18px 12px",
          borderBottom: "0.5px solid rgba(156,213,255,0.12)",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 18,
            color: ICE.hi,
            letterSpacing: -0.1,
          }}
        >
          From the road
        </div>
        <div
          style={{
            fontSize: 9.5,
            letterSpacing: 1.6,
            textTransform: "uppercase",
            color: "rgba(156, 213, 255, 0.55)",
          }}
        >
          {photos.length} photos
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowX: "auto",
          overflowY: "hidden",
          padding: "14px 18px",
          display: "flex",
          gap: 14,
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(156,213,255,0.25) transparent",
        }}
      >
        {groups.map((g, gi) => (
          <Fragment key={g.trip}>
            {gi > 0 && (
              <div
                aria-hidden
                style={{
                  flex: "0 0 auto",
                  width: 1,
                  alignSelf: "stretch",
                  margin: "36px 12px",
                  background: "rgba(156,213,255,0.16)",
                }}
              />
            )}
            {g.photos.map((p) => (
              <PhotoCard key={p.src} photo={p} />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function PhotoCard({ photo }: { photo: TravelPhoto }) {
  return (
    <figure
      className="ps-card"
      style={{
        margin: 0,
        flex: "0 0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "3 / 2",
          borderRadius: 10,
          overflow: "hidden",
          background: "rgba(0,0,0,0.3)",
          border: "0.5px solid rgba(156,213,255,0.08)",
        }}
      >
        <Image
          src={photo.src}
          alt={photo.title}
          fill
          sizes="(max-width: 720px) 240px, 300px"
          style={{ objectFit: "cover" }}
        />
      </div>
      <figcaption style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            fontSize: 9.5,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: ICE.accent,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {photo.trip}
        </span>
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 15,
            color: ICE.hi,
            letterSpacing: -0.1,
            lineHeight: 1.25,
          }}
        >
          {photo.title}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "rgba(220,238,255,0.6)",
            letterSpacing: 0.2,
          }}
        >
          {photo.where}
        </span>
      </figcaption>
    </figure>
  );
}
