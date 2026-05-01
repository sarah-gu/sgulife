"use client";

import Image from "next/image";
import { useMemo } from "react";
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
        flex: 1,
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
          overflowY: "auto",
          padding: "8px 14px 16px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(156,213,255,0.25) transparent",
        }}
      >
        {groups.map((g, gi) => (
          <div key={g.trip} style={{ marginTop: gi === 0 ? 8 : 18 }}>
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                padding: "8px 4px 10px",
                background:
                  "linear-gradient(180deg, rgba(8,14,28,0.95) 60%, rgba(8,14,28,0))",
                fontSize: 10,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: ICE.accent,
                fontFamily: "ui-monospace, monospace",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  background: ICE.accent,
                  boxShadow: `0 0 8px ${ICE.accent}`,
                }}
              />
              <span>{g.trip}</span>
              <span
                aria-hidden
                style={{ flex: 1, height: 0.5, background: "rgba(156,213,255,0.16)" }}
              />
              <span style={{ color: "rgba(220,238,255,0.45)", letterSpacing: 0.4 }}>
                {g.photos.length}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {g.photos.map((p) => (
                <PhotoRow key={p.src} photo={p} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhotoRow({ photo }: { photo: TravelPhoto }) {
  return (
    <figure
      style={{
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        cursor: "default",
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
          sizes="(max-width: 900px) 90vw, 360px"
          style={{ objectFit: "cover" }}
        />
      </div>
      <figcaption style={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
