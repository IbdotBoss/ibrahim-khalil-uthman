"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type StickerFile = { file: string; cutout: boolean; width: number; height: number };

type Sticker = {
  id: string;
  src: string;
  label: string;
  /** Intrinsic size, read from the file header at build time, so the browser
      knows the aspect ratio before the bytes arrive. 0 when unparseable. */
  nw: number;
  nh: number;
  w: number;
  x: number;
  y: number;
  rotate: number;
  cutout?: boolean;
};

// Known files get a deliberate placement and size. Anything else dropped into
// public/stickers is scattered on a ring, so it appears without a code change.
const PLACED: Record<string, { label: string; w: number; x: number; y: number; rotate: number }> = {
  // Laid out across roughly 1050 x 620, three rows of five. Anything not listed
  // falls back to the ring below, where it will collide with whatever else is
  // unplaced; that is a signal to add a placement, not a layout.
  urus: { label: "the Urus", w: 300, x: 8, y: 8, rotate: -3 },
  dunk: { label: "dunks", w: 150, x: 336, y: 0, rotate: 7 },
  gt: { label: "GT", w: 180, x: 516, y: 18, rotate: -4 },
  bbc: { label: "BBC", w: 130, x: 730, y: 0, rotate: 5 },
  stagalxe: { label: "stagalxe", w: 130, x: 890, y: 10, rotate: -5 },

  mecca: { label: "Mecca", w: 150, x: 20, y: 186, rotate: 3 },
  bike: { label: "AMFLOW", w: 250, x: 200, y: 196, rotate: 4 },
  ghost: { label: "ghost", w: 150, x: 480, y: 190, rotate: -6 },
  daily_paper: { label: "Daily Paper", w: 190, x: 660, y: 210, rotate: 4 },
  bee: { label: "the bee", w: 140, x: 880, y: 188, rotate: 6 },

  photo: { label: "me", w: 150, x: 16, y: 392, rotate: -2 },
  pepe: { label: "the desk", w: 140, x: 196, y: 404, rotate: -6 },
  money: { label: "money", w: 160, x: 362, y: 396, rotate: 6 },
  basketball: { label: "ball", w: 170, x: 552, y: 404, rotate: -5 },
  cat: { label: "the cat", w: 85, x: 782, y: 392, rotate: 5 },
  batman: { label: "Batman", w: 145, x: 890, y: 430, rotate: -4 },
};

// A phone pane is about a third of the authored width, so scaling the desktop
// collage down leaves stamp-sized stickers in a large empty black panel. This
// is the same thirteen re-laid out for a narrow, tall stage, which then scales
// to roughly 0.85 instead of 0.30.
const PLACED_NARROW: Record<string, { w: number; x: number; y: number; rotate: number }> = {
  // Laid out across roughly 380 x 720.
  urus: { w: 168, x: 4, y: 4, rotate: -3 },
  dunk: { w: 100, x: 186, y: 14, rotate: 7 },
  bbc: { w: 88, x: 288, y: 6, rotate: 5 },

  gt: { w: 130, x: 6, y: 126, rotate: -4 },
  bike: { w: 150, x: 146, y: 120, rotate: 4 },
  stagalxe: { w: 84, x: 290, y: 130, rotate: -5 },

  mecca: { w: 80, x: 10, y: 256, rotate: 3 },
  ghost: { w: 100, x: 110, y: 250, rotate: -6 },
  daily_paper: { w: 112, x: 232, y: 268, rotate: 4 },

  photo: { w: 96, x: 8, y: 384, rotate: -2 },
  pepe: { w: 88, x: 122, y: 392, rotate: -6 },
  bee: { w: 110, x: 232, y: 380, rotate: 6 },

  money: { w: 104, x: 14, y: 532, rotate: 6 },
  basketball: { w: 116, x: 140, y: 540, rotate: -5 },
  cat: { w: 70, x: 286, y: 524, rotate: 5 },

  batman: { w: 132, x: 124, y: 676, rotate: -4 },
};

const RING = [
  { x: 60, y: 24 },
  { x: 340, y: 60 },
  { x: 660, y: 30 },
  { x: 160, y: 250 },
  { x: 470, y: 260 },
  { x: 760, y: 300 },
];

function build(files: StickerFile[], narrow: boolean): Sticker[] {
  return files.map(({ file, cutout, width, height }, i) => {
    const base = file.replace(/\.[^.]+$/, "").toLowerCase();
    const placed = PLACED[base];
    const narrowed = narrow ? PLACED_NARROW[base] : undefined;
    const spot = narrowed ?? placed;
    const ring = RING[i % RING.length];
    return {
      id: base,
      src: `/stickers/${file}`,
      label: placed?.label ?? base,
      nw: width,
      nh: height,
      w: spot?.w ?? (narrow ? 110 : 160),
      x: spot?.x ?? ring.x,
      y: spot?.y ?? ring.y,
      rotate: spot?.rotate ?? (i % 2 === 0 ? -4 : 5),
      cutout,
    };
  });
}

const STAGE = { wide: { w: 1050, h: 620 }, narrow: { w: 380, h: 790 } };

/** Below this the wide collage would scale under 0.6 and stop being readable. */
const NARROW_AT = 620;

export default function Stickers({ files }: { files: StickerFile[] }) {
  const [narrow, setNarrow] = useState(false);
  const initial = useRef<Sticker[]>(build(files, false));
  const [items, setItems] = useState<Sticker[]>(initial.current);
  const [dragId, setDragId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const offset = useRef({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const bounds = useRef<{ minX: number; minY: number; maxX: number; maxY: number } | null>(null);

  // Which coordinate map applies, and how far down the stage is scaled to fit.
  // Both are measured here rather than expressed in CSS, because the CSS form
  // needed tan(atan2()) over two lengths and Safari drops it. See globals.css.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth;
      const isNarrow = w < NARROW_AT;
      setNarrow(isNarrow);
      setScale(Math.min(1, w / (isNarrow ? STAGE.narrow.w : STAGE.wide.w)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // A layout swap re-lays the collage out; any drags made in the other layout
  // no longer mean anything at these coordinates.
  useEffect(() => {
    initial.current = build(files, narrow);
    setItems(initial.current);
  }, [files, narrow]);

  // The black panel, expressed in stage coordinates, so a sticker can be moved
  // anywhere on the visible screen but never off it. Measured once per gesture
  // rather than per pointermove.
  const measure = useCallback((s: Sticker) => {
    const el = wrapRef.current;
    const panel = el?.closest(".about")?.getBoundingClientRect();
    if (!el || !panel) return (bounds.current = null);
    const fit = el.getBoundingClientRect();

    // The drawn box, not the image box: a framed sticker adds its padding, and
    // every sticker is rotated a few degrees, which makes the axis-aligned box
    // it actually occupies wider and taller than w by h. Ignore that and the
    // corners hang a few pixels past the panel and get shaved off.
    const frame = s.cutout ? 0 : 12;
    const w = s.w + frame;
    const h = (s.nh && s.nw ? (s.w * s.nh) / s.nw : s.w) + frame;
    const rad = (Math.abs(s.rotate) * Math.PI) / 180;
    const padX = (w * Math.cos(rad) + h * Math.sin(rad) - w) / 2;
    const padY = (w * Math.sin(rad) + h * Math.cos(rad) - h) / 2;

    bounds.current = {
      minX: (panel.left - fit.left) / scale + padX,
      minY: (panel.top - fit.top) / scale + padY,
      maxX: (panel.right - fit.left) / scale - w - padX,
      maxY: (panel.bottom - fit.top) / scale - h - padY,
    };
  }, [scale]);

  const clamp = useCallback((x: number, y: number) => {
    const b = bounds.current;
    if (!b) return { x, y };
    return {
      x: Math.min(Math.max(x, b.minX), b.maxX),
      y: Math.min(Math.max(y, b.minY), b.maxY),
    };
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>, s: Sticker) => {
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    measure(s);
    offset.current = { x: e.clientX / scale - s.x, y: e.clientY / scale - s.y };
    setDragId(s.id);
    setItems((prev) => [...prev.filter((p) => p.id !== s.id), prev.find((p) => p.id === s.id)!]);
  }, [scale, measure]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragId) return;
      setItems((prev) =>
        prev.map((p) =>
          p.id === dragId
            ? { ...p, ...clamp(e.clientX / scale - offset.current.x, e.clientY / scale - offset.current.y) }
            : p
        )
      );
    },
    [dragId, scale, clamp]
  );

  const nudge = useCallback((s: Sticker, dx: number, dy: number) => {
    measure(s);
    setItems((prev) => prev.map((p) => (p.id === s.id ? { ...p, ...clamp(p.x + dx, p.y + dy) } : p)));
  }, [measure, clamp]);

  if (!items.length) return null;

  const stage = narrow ? STAGE.narrow : STAGE.wide;

  return (
    <div className="stickerfit" ref={wrapRef} style={{ height: stage.h * scale }}>
      <div
        className="stickers"
        style={{ width: stage.w, height: stage.h, transform: `scale(${scale})` }}
        onPointerMove={onPointerMove}
        onPointerUp={() => setDragId(null)}
      >
      {items.map((s) => (
        <div
          key={s.id}
          className="sticker"
          data-cutout={s.cutout ? "true" : undefined}
          data-dragging={dragId === s.id}
          tabIndex={0}
          role="button"
          aria-describedby="draghint"
          style={{ transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rotate}deg)`, width: s.w }}
          onPointerDown={(e) => onPointerDown(e, s)}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 16 : 4;
            if (e.key === "ArrowLeft") { e.preventDefault(); nudge(s, -step, 0); }
            if (e.key === "ArrowRight") { e.preventDefault(); nudge(s, step, 0); }
            if (e.key === "ArrowUp") { e.preventDefault(); nudge(s, 0, -step); }
            if (e.key === "ArrowDown") { e.preventDefault(); nudge(s, 0, step); }
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.src}
            alt={s.label}
            width={s.nw || undefined}
            height={s.nh || undefined}
            draggable={false}
          />
        </div>
      ))}
        <button className="stickerreset" onClick={() => setItems(initial.current)}>
          reset layout
        </button>
      </div>
    </div>
  );
}
