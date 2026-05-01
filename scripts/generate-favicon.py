#!/usr/bin/env python3
# Renders a brain particle cloud (same shape math + icy palette as the
# homepage Brain3D) and packs it into app/favicon.ico at multiple sizes.

import math
import os
import random
from PIL import Image, ImageFilter
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "app", "favicon.ico"))

RENDER_SIZE = 512
SIZES = [256, 64, 48, 32, 16]

N_CORTEX_CLUSTERS = 110
N_CEREB_CLUSTERS = 22
PARTICLES_PER_CLUSTER_AVG = 28
N_CORTEX_FOG = 500
BRAIN_SCALE = 1.55
CEREB_CENTER = (0.0, -0.78, -0.42)
CEREB_RADIUS = 0.42

random.seed(17)


def cortex_radius(dx, dy, dz):
    a, b, c = 1.0, 1.22, 0.88
    r = 1.0 / math.sqrt(dx * dx / (a * a) + dy * dy / (b * b) + dz * dz / (c * c))
    if dy > 0:
        r *= 1.0 + 0.04 * dy
    else:
        r *= 1.0 + 0.05 * dy
    if dz < -0.45:
        r *= 1.0 - 0.18 * (-dz - 0.45)
    lateral_low = max(0.0, abs(dx) - 0.45) * max(0.0, -dz - 0.05)
    r += 0.12 * lateral_low
    sulci = (
        0.075 * math.sin(dx * 6.8 + dy * 5.1) * math.cos(dz * 6.5)
        + 0.06 * math.cos(dy * 8.2 + dz * 4.3) * math.sin(dx * 5.7)
        + 0.05 * math.sin(dx * 6.5 + dy * 7.9 + dz * 5.3)
        + 0.04 * math.cos(dx * 10.5) * math.sin(dy * 8.7)
        + 0.03 * math.sin(dz * 11.3 + dx * 4.9)
    )
    r += sulci
    return r


def cerebellum_radius(dx, dy, dz):
    a, b, c = 1.0, 0.85, 0.75
    r = 1.0 / math.sqrt(dx * dx / (a * a) + dy * dy / (b * b) + dz * dz / (c * c))
    r += 0.04 * math.sin(dy * 18 + dx * 4) + 0.03 * math.sin(dz * 14)
    return r * CEREB_RADIUS


def fissure_keep(x, y, z):
    if z < -0.1:
        return 1.0
    y_soft = max(0.0, 1.0 - abs(y) / 1.1)
    width = 0.05 * y_soft
    dx = abs(x)
    if dx > width + 0.04:
        return 1.0
    t = max(0.0, dx / (width + 0.04))
    return max(0.05, t)


def rand_dir():
    while True:
        dx = random.random() * 2 - 1
        dy = random.random() * 2 - 1
        dz = random.random() * 2 - 1
        l2 = dx * dx + dy * dy + dz * dz
        if 0.0001 < l2 <= 1.0:
            l = math.sqrt(l2)
            return dx / l, dy / l, dz / l


def gauss():
    u1 = max(1e-6, random.random())
    u2 = random.random()
    return math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)


# Build clusters (same logic as Brain3D.tsx).
cortex_clusters = []
while len(cortex_clusters) < N_CORTEX_CLUSTERS:
    dx, dy, dz = rand_dir()
    R = cortex_radius(dx, dy, dz)
    u = 0.55 + random.random() * 0.42
    cx, cy, cz = dx * R * u, dy * R * u, dz * R * u
    if random.random() > fissure_keep(cx, cy, cz):
        continue
    roll = random.random()
    if roll < 0.7:
        sigma = 0.045 + random.random() * 0.025
    elif roll < 0.93:
        sigma = 0.075 + random.random() * 0.03
    else:
        sigma = 0.105 + random.random() * 0.03
    count = round(
        PARTICLES_PER_CLUSTER_AVG
        * (0.55 + random.random() * 0.9)
        * (1.5 if sigma > 0.085 else 1.0)
    )
    cortex_clusters.append((cx, cy, cz, sigma, count, "cortex"))

cereb_clusters = []
while len(cereb_clusters) < N_CEREB_CLUSTERS:
    dx, dy, dz = rand_dir()
    R = cerebellum_radius(dx, dy, dz)
    u = 0.55 + random.random() * 0.4
    cx = CEREB_CENTER[0] + dx * R * u
    cy = CEREB_CENTER[1] + dy * R * u
    cz = CEREB_CENTER[2] + dz * R * u
    sigma = 0.03 + random.random() * 0.025
    count = round(PARTICLES_PER_CLUSTER_AVG * 0.6 * (0.6 + random.random() * 0.7))
    cereb_clusters.append((cx, cy, cz, sigma, count, "cereb"))

# Emit particles: position + color (matching Brain3D writePoint).
points = []  # (x, y, z, r, g, b)


def color_for(x, y, z, kind):
    top = (z + 0.9) / 1.8
    front = (y + 1.2) / 2.4
    if kind == "cereb":
        return (0.55 + 0.1 * top, 0.78 + 0.1 * top, 0.96)
    return (
        0.5 + 0.3 * top + 0.05 * front,
        0.74 + 0.2 * top + 0.04 * front,
        0.92 + 0.08 * top,
    )


def emit_cluster(cl):
    cx, cy, cz, sigma, count, kind = cl
    for _ in range(count):
        jx = gauss() * sigma
        jy = gauss() * sigma
        jz = gauss() * sigma * 0.7
        x, y, z = cx + jx, cy + jy, cz + jz
        if kind == "cortex":
            ll = math.hypot(x, y, z)
            if ll > 0.0001:
                ux, uy, uz = x / ll, y / ll, z / ll
                Rmax = cortex_radius(ux, uy, uz) * 1.02
                if ll > Rmax:
                    x, y, z = ux * Rmax, uy * Rmax, uz * Rmax
            if random.random() > fissure_keep(x, y, z):
                continue
        r, g, b = color_for(x, y, z, kind)
        points.append((x, y, z, r, g, b))


for cl in cortex_clusters:
    emit_cluster(cl)
for cl in cereb_clusters:
    emit_cluster(cl)

# Cortex fog
fog = 0
while fog < N_CORTEX_FOG:
    dx, dy, dz = rand_dir()
    R = cortex_radius(dx, dy, dz)
    u = pow(random.random(), 0.6)
    rr = R * u * 0.96
    x, y, z = dx * rr, dy * rr, dz * rr
    if random.random() > fissure_keep(x, y, z):
        continue
    r, g, b = color_for(x, y, z, "cortex")
    points.append((x, y, z, r, g, b))
    fog += 1

pts = np.array(points, dtype=np.float32)
pts[:, 0:3] *= BRAIN_SCALE

# Apply tilt (rotation.x = -pi/2 on tilt group) then root.rotation.x = 0.25.
# Combined: rotate around x by (-pi/2 + 0.25) ≈ -1.3208 rad.
theta_x = -math.pi / 2 + 0.25
cx_, sx_ = math.cos(theta_x), math.sin(theta_x)

x = pts[:, 0]
y = pts[:, 1]
z = pts[:, 2]

# Rx: y' = y*cos - z*sin ; z' = y*sin + z*cos
yr = y * cx_ - z * sx_
zr = y * sx_ + z * cx_

# Orthographic projection: screen X = world x, screen Y = -world y' (y down)
sx = x
sy = -yr
sz = zr  # depth (larger = closer to camera in original framing)

# Render to high-res float buffer with additive gaussian splats.
W = H = RENDER_SIZE
buf = np.zeros((H, W, 3), dtype=np.float32)

# Map world coords to pixels. Brain ranges ~[-1.9, 1.9] after BRAIN_SCALE.
half = 1.95
scale = (W * 0.5) / half
cx0 = W * 0.5
cy0 = H * 0.5

# Sort by depth so back-to-front (additive blending makes order moot, but
# consistent ordering helps any clipped tonemap).
order = np.argsort(sz)
sx = sx[order]
sy = sy[order]
sz = sz[order]
cols = pts[order, 3:6]

# Splat parameters: smaller, tighter gaussian kernel so dots stay distinct.
KR = 3  # half-size
xx, yy = np.meshgrid(np.arange(-KR, KR + 1), np.arange(-KR, KR + 1))
kernel = np.exp(-(xx * xx + yy * yy) / (2.0 * 0.95 * 0.95)).astype(np.float32)
kernel /= kernel.max()

# Per-particle intensity: brighter when in front, dimmer in back.
front_boost = (sz - sz.min()) / max(1e-6, (sz.max() - sz.min()))
intensity = 0.20 + 0.55 * front_boost  # mostly bright, slight depth fade

px = (sx * scale + cx0).astype(np.int32)
py = (sy * scale + cy0).astype(np.int32)

KS = 2 * KR + 1
for i in range(len(px)):
    x0 = px[i] - KR
    y0 = py[i] - KR
    if x0 < 0 or y0 < 0 or x0 + KS > W or y0 + KS > H:
        # clip
        kx0 = max(0, -x0)
        ky0 = max(0, -y0)
        kx1 = min(KS, W - x0)
        ky1 = min(KS, H - y0)
        if kx1 <= kx0 or ky1 <= ky0:
            continue
        sub = kernel[ky0:ky1, kx0:kx1] * intensity[i]
        bx0 = x0 + kx0
        by0 = y0 + ky0
        buf[by0:by0 + (ky1 - ky0), bx0:bx0 + (kx1 - kx0), 0] += sub * cols[i, 0]
        buf[by0:by0 + (ky1 - ky0), bx0:bx0 + (kx1 - kx0), 1] += sub * cols[i, 1]
        buf[by0:by0 + (ky1 - ky0), bx0:bx0 + (kx1 - kx0), 2] += sub * cols[i, 2]
    else:
        sub = kernel * intensity[i]
        buf[y0:y0 + KS, x0:x0 + KS, 0] += sub * cols[i, 0]
        buf[y0:y0 + KS, x0:x0 + KS, 1] += sub * cols[i, 1]
        buf[y0:y0 + KS, x0:x0 + KS, 2] += sub * cols[i, 2]

# Modest boost - keep dots distinct rather than blowing out to a blob.
buf *= 1.65
# Filmic-ish tonemap with soft knee - bright cores saturate to white.
buf = 1.0 - np.exp(-buf)

# Slight overall blue tint lift in highlights to match the icy palette.
buf[..., 2] = np.minimum(1.0, buf[..., 2] * 1.06 + 0.02)

# Gamma encode for output.
particles_rgb = np.clip(np.power(buf, 1 / 1.05), 0, 1)
particles_8 = (particles_rgb * 255).astype(np.uint8)
particles_img = Image.fromarray(particles_8, mode="RGB")

# Subtle outer bloom - just enough to suggest a glow halo, not flood.
bloom = particles_img.filter(ImageFilter.GaussianBlur(radius=4))
bloom_arr = np.asarray(bloom).astype(np.float32) / 255.0
combined = np.clip(particles_rgb + bloom_arr * 0.18, 0, 1)
combined_8 = (combined * 255).astype(np.uint8)
particles_img = Image.fromarray(combined_8, mode="RGB")

# Compose onto the same dark navy as the page background (#02040a).
BG = (5, 8, 16)  # #050810 - slightly lighter than #02040a so brain reads
bg = Image.new("RGB", (W, H), BG)
# Treat particle image as additive: use it as a screen-blend onto bg.
bg_arr = np.asarray(bg).astype(np.float32) / 255.0
particles_arr = np.asarray(particles_img).astype(np.float32) / 255.0
# Screen blend: 1 - (1-a)*(1-b)
blended = 1.0 - (1.0 - bg_arr) * (1.0 - particles_arr)
blended_8 = (np.clip(blended, 0, 1) * 255).astype(np.uint8)
flat = Image.fromarray(blended_8, mode="RGB")

# Mask the corners with a soft rounded square so the icon reads as an icon
# (not a photo) - but keep most of the square so the brain isn't cropped.
mask = Image.new("L", (W, H), 0)
from PIL import ImageDraw
draw = ImageDraw.Draw(mask)
radius = int(W * 0.18)
draw.rounded_rectangle((0, 0, W - 1, H - 1), radius=radius, fill=255)
big = Image.new("RGBA", (W, H), (0, 0, 0, 0))
flat_rgba = flat.convert("RGBA")
big.paste(flat_rgba, (0, 0), mask)

# Build multi-size .ico - pass explicit sizes so PIL embeds all of them.
big.save(
    OUT,
    format="ICO",
    sizes=[(s, s) for s in SIZES],
)

print(f"wrote {OUT}  (sizes: {SIZES})")
