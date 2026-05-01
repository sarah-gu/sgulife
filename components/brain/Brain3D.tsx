"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  BRAIN_SCALE,
  CEREB_CENTER,
  ICE,
  N_CEREB_CLUSTERS,
  N_CORTEX_CLUSTERS,
  N_CORTEX_FOG,
  PARTICLES_PER_CLUSTER_AVG,
  POINT_SIZE,
  ROTATE_SENSITIVITY,
  cerebellumRadius,
  computeHubPositions,
  cortexRadius,
  fissureKeep,
  type Hub,
} from "@/lib/brain";
import { useIsMobile } from "./use-mobile";

type Props = {
  hubs: Hub[];
  onHubHover: (idx: number | null) => void;
  onHubClick: (idx: number) => void;
  activeHub: number | null;
  expandedHub: number | null;
};

type HubScreen = { x: number; y: number; z: number; idx: number };

export default function Brain3D({
  hubs,
  onHubHover,
  onHubClick,
  activeHub,
  expandedHub,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeHubRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [hubScreen, setHubScreen] = useState<HubScreen[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    activeHubRef.current = activeHub;
  }, [activeHub]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const initialRect = mount.getBoundingClientRect();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      32,
      initialRect.width / initialRect.height,
      0.1,
      1000
    );
    // Pull camera back further on narrow viewports so hub labels don't clip.
    const cameraZForAspect = (aspect: number) => {
      const base = 5.4;
      return aspect >= 1 ? base : base * (1 / Math.max(0.45, aspect));
    };
    camera.position.set(0, 0, cameraZForAspect(initialRect.width / initialRect.height));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(initialRect.width, initialRect.height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const root = new THREE.Group();
    const tilt = new THREE.Group();
    tilt.rotation.x = -Math.PI / 2;
    root.add(tilt);
    scene.add(root);

    // Soft round point sprite
    const makeSprite = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const ctx = c.getContext("2d")!;
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.25, "rgba(220,238,255,0.85)");
      g.addColorStop(0.55, "rgba(156,213,255,0.30)");
      g.addColorStop(1, "rgba(156,213,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      const t = new THREE.CanvasTexture(c);
      t.minFilter = THREE.LinearFilter;
      return t;
    };
    const sprite = makeSprite();

    // Seeded RNG — stable cluster layout across reloads.
    const rng = (() => {
      let s = 17;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    })();
    const gauss = () => {
      const u1 = Math.max(1e-6, rng()),
        u2 = rng();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    };
    const randDir = (): [number, number, number] => {
      let dx = 0,
        dy = 0,
        dz = 0,
        len2 = 2;
      while (len2 > 1 || len2 < 0.0001) {
        dx = rng() * 2 - 1;
        dy = rng() * 2 - 1;
        dz = rng() * 2 - 1;
        len2 = dx * dx + dy * dy + dz * dz;
      }
      const len = Math.sqrt(len2);
      return [dx / len, dy / len, dz / len];
    };

    type Cluster = {
      cx: number;
      cy: number;
      cz: number;
      sigma: number;
      count: number;
      kind: "cortex" | "cereb";
    };

    const cortexClusters: Cluster[] = [];
    while (cortexClusters.length < N_CORTEX_CLUSTERS) {
      const [dx, dy, dz] = randDir();
      const R = cortexRadius(dx, dy, dz);
      const u = 0.55 + rng() * 0.42;
      const cx = dx * R * u,
        cy = dy * R * u,
        cz = dz * R * u;
      if (rng() > fissureKeep(cx, cy, cz)) continue;
      const sizeRoll = rng();
      const sigma =
        sizeRoll < 0.7
          ? 0.045 + rng() * 0.025
          : sizeRoll < 0.93
          ? 0.075 + rng() * 0.03
          : 0.105 + rng() * 0.03;
      const count = Math.round(
        PARTICLES_PER_CLUSTER_AVG * (0.55 + rng() * 0.9) * (sigma > 0.085 ? 1.5 : 1)
      );
      cortexClusters.push({ cx, cy, cz, sigma, count, kind: "cortex" });
    }

    const cerebClusters: Cluster[] = [];
    while (cerebClusters.length < N_CEREB_CLUSTERS) {
      const [dx, dy, dz] = randDir();
      const R = cerebellumRadius(dx, dy, dz);
      const u = 0.55 + rng() * 0.4;
      cerebClusters.push({
        cx: CEREB_CENTER[0] + dx * R * u,
        cy: CEREB_CENTER[1] + dy * R * u,
        cz: CEREB_CENTER[2] + dz * R * u,
        sigma: 0.03 + rng() * 0.025,
        count: Math.round(
          PARTICLES_PER_CLUSTER_AVG * 0.6 * (0.6 + rng() * 0.7)
        ),
        kind: "cereb",
      });
    }

    const totalEst =
      cortexClusters.reduce((a, c) => a + c.count, 0) +
      cerebClusters.reduce((a, c) => a + c.count, 0) +
      N_CORTEX_FOG +
      200;
    const positions = new Float32Array(3 * totalEst);
    const colors = new Float32Array(3 * totalEst);
    let ptr = 0;

    const writePoint = (x: number, y: number, z: number, kind: "cortex" | "cereb") => {
      if (ptr * 3 + 2 >= positions.length) return;
      positions[ptr * 3] = x;
      positions[ptr * 3 + 1] = y;
      positions[ptr * 3 + 2] = z;
      const top = (z + 0.9) / 1.8;
      const front = (y + 1.2) / 2.4;
      let rC: number, gC: number, bC: number;
      if (kind === "cereb") {
        rC = 0.55 + 0.1 * top;
        gC = 0.78 + 0.1 * top;
        bC = 0.96;
      } else {
        rC = 0.5 + 0.3 * top + 0.05 * front;
        gC = 0.74 + 0.2 * top + 0.04 * front;
        bC = 0.92 + 0.08 * top;
      }
      colors[ptr * 3] = rC;
      colors[ptr * 3 + 1] = gC;
      colors[ptr * 3 + 2] = bC;
      ptr++;
    };

    const renderCluster = (cl: Cluster) => {
      for (let i = 0; i < cl.count; i++) {
        const jx = gauss() * cl.sigma;
        const jy = gauss() * cl.sigma;
        const jz = gauss() * cl.sigma * 0.7;
        let x = cl.cx + jx;
        let y = cl.cy + jy;
        let z = cl.cz + jz;
        if (cl.kind === "cortex") {
          const len = Math.hypot(x, y, z);
          if (len > 0.0001) {
            const ux = x / len,
              uy = y / len,
              uz = z / len;
            const Rmax = cortexRadius(ux, uy, uz) * 1.02;
            if (len > Rmax) {
              x = ux * Rmax;
              y = uy * Rmax;
              z = uz * Rmax;
            }
          }
          if (rng() > fissureKeep(x, y, z)) continue;
        }
        writePoint(x, y, z, cl.kind);
      }
    };
    cortexClusters.forEach(renderCluster);
    cerebClusters.forEach(renderCluster);

    let fogMade = 0;
    while (fogMade < N_CORTEX_FOG) {
      const [dx, dy, dz] = randDir();
      const R = cortexRadius(dx, dy, dz);
      const u = Math.pow(rng(), 0.6);
      const r = R * u * 0.96;
      const x = dx * r,
        y = dy * r,
        z = dz * r;
      if (rng() > fissureKeep(x, y, z)) continue;
      writePoint(x, y, z, "cortex");
      fogMade++;
    }

    for (let i = 0; i < ptr * 3; i++) positions[i] *= BRAIN_SCALE;

    const geom = new THREE.BufferGeometry();
    geom.setAttribute(
      "position",
      new THREE.BufferAttribute(positions.slice(0, ptr * 3), 3)
    );
    geom.setAttribute(
      "color",
      new THREE.BufferAttribute(colors.slice(0, ptr * 3), 3)
    );
    const mat = new THREE.PointsMaterial({
      size: POINT_SIZE,
      map: sprite,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });
    const cloud = new THREE.Points(geom, mat);
    tilt.add(cloud);

    // Hub sprite texture
    const hubSpriteTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const ctx = c.getContext("2d")!;
      const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.18, "rgba(220,238,255,1)");
      g.addColorStop(0.4, "rgba(156,213,255,0.7)");
      g.addColorStop(1, "rgba(156,213,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    })();

    const hubsResolved = computeHubPositions(hubs);
    const hubGroup = new THREE.Group();
    const hubMeshes: THREE.Sprite[] = [];
    hubsResolved.forEach((h, i) => {
      const sm = new THREE.SpriteMaterial({
        map: hubSpriteTex,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const s = new THREE.Sprite(sm);
      s.scale.set(0.32, 0.32, 1);
      s.position.set(
        h.pos[0] * BRAIN_SCALE,
        h.pos[1] * BRAIN_SCALE,
        h.pos[2] * BRAIN_SCALE
      );
      s.userData.idx = i;
      hubGroup.add(s);
      hubMeshes.push(s);
    });
    tilt.add(hubGroup);

    setReady(true);

    // Drag to rotate
    let rotY = 0.0,
      rotX = 0.25;
    let dragging = false;
    let lastX = 0,
      lastY = 0;
    let autoRot = true;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      autoRot = false;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX,
        dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      rotY += dx * ROTATE_SENSITIVITY;
      rotX += dy * ROTATE_SENSITIVITY;
      rotX = Math.max(-1.3, Math.min(1.3, rotX));
    };
    const onUp = () => {
      dragging = false;
    };

    renderer.domElement.style.touchAction = "none";
    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    // Resize
    const onResize = () => {
      const r = mount.getBoundingClientRect();
      const aspect = r.width / r.height;
      camera.aspect = aspect;
      camera.position.z = cameraZForAspect(aspect);
      camera.updateProjectionMatrix();
      renderer.setSize(r.width, r.height);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    // Hover & click picking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onHover = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(hubMeshes, false);
      if (hits.length) {
        onHubHover(hits[0].object.userData.idx as number);
        renderer.domElement.style.cursor = "pointer";
      } else {
        onHubHover(null);
        renderer.domElement.style.cursor = dragging ? "grabbing" : "grab";
      }
    };
    const onCanvasClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(hubMeshes, false);
      if (hits.length) onHubClick(hits[0].object.userData.idx as number);
    };
    renderer.domElement.addEventListener("pointermove", onHover);
    renderer.domElement.addEventListener("click", onCanvasClick);
    renderer.domElement.style.cursor = "grab";

    // Animate
    let raf = 0;
    const t0 = performance.now();
    const v = new THREE.Vector3();
    const tick = () => {
      const now = performance.now();
      const t = (now - t0) / 1000;
      if (autoRot) rotY += 0.0018;
      root.rotation.y += (rotY - root.rotation.y) * 0.12;
      root.rotation.x += (rotX - root.rotation.x) * 0.12;

      const cur = activeHubRef.current;
      hubMeshes.forEach((m, i) => {
        const isActive = i === cur;
        const pulseAmp = isActive ? 0.025 : 0.075;
        const base = 0.3 + Math.sin(t * 1.4 + i * 1.3) * pulseAmp;
        const big = isActive ? 1.55 : 1.0;
        m.scale.set(base * big, base * big, 1);
      });

      const out: HubScreen[] = [];
      const screenRect = renderer.domElement.getBoundingClientRect();
      hubMeshes.forEach((m, i) => {
        m.getWorldPosition(v);
        v.project(camera);
        out.push({
          x: (v.x * 0.5 + 0.5) * screenRect.width,
          y: (-v.y * 0.5 + 0.5) * screenRect.height,
          z: v.z,
          idx: i,
        });
      });
      if (((now / 16) | 0) % 2 === 0) setHubScreen(out);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointermove", onHover);
      renderer.domElement.removeEventListener("click", onCanvasClick);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      mount.removeChild(renderer.domElement);
      geom.dispose();
      mat.dispose();
      sprite.dispose();
      hubSpriteTex.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "hidden" }}
    >
      {ready &&
        hubScreen.map((h) => {
          const cat = hubs[h.idx];
          const isActive = h.idx === activeHub || h.idx === expandedHub;
          const opacity =
            h.z < 0.55 ? 1 : Math.max(0, 1 - (h.z - 0.55) * 4);
          return (
            <div
              key={cat.id}
              data-hub-idx={h.idx}
              style={{
                position: "absolute",
                left: h.x,
                top: h.y,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                opacity,
                transition: "opacity 0.3s ease",
                fontFamily: "var(--font-sans)",
                zIndex: 4,
              }}
            >
              <div
                style={{
                  transform: `translate(0, ${(isMobile ? 18 : 22) + (isActive ? 4 : 0)}px)`,
                  textAlign: "center",
                  minWidth: isMobile ? 88 : 110,
                  userSelect: "none",
                }}
              >
                <div
                  style={{
                    fontSize: isMobile ? 8 : 9,
                    letterSpacing: isMobile ? 1.4 : 1.8,
                    textTransform: "uppercase",
                    color: ICE.accent,
                    opacity: 0.7,
                    fontFamily: "ui-monospace, monospace",
                    marginBottom: 3,
                  }}
                >
                  {cat.region}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: isMobile ? 13 : 16,
                    lineHeight: 1.15,
                    color: ICE.hi,
                    letterSpacing: 0.2,
                    fontStyle: "italic",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat.label}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? 9 : 10,
                    color: ICE.low,
                    marginTop: 3,
                    letterSpacing: 0.4,
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat.stat}
                </div>
              </div>
            </div>
          );
        })}
      {!ready && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            fontSize: 11,
            letterSpacing: 2,
            color: ICE.low,
            textTransform: "uppercase",
          }}
        >
          composing neurons…
        </div>
      )}
    </div>
  );
}
