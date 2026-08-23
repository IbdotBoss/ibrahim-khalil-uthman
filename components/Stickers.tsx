"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Sticker = {
  id: string;
  src: string;
  label: string;
  w: number;
  x: number;
  y: number;
  rotate: number;
  cutout?: boolean;
};

// Known files get a deliberate placement and size. Anything else dropped into
// public/stickers is scattered on a ring, so it appears without a code change.
const PLACED: Record<string, { label: string; w: number; x: number; y: number; rotate: number }> = {
  // Laid out across roughly 1050 x 620. Anything not listed falls back to the
  // ring below, which is only a safety net; add a placement instead.
  urus: { label: "the Urus", w: 300, x: 8, y: 8, rotate: -3 },
  dunk: { label: "dunks", w: 150, x: 344, y: 0, rotate: 7 },
  gt: { label: "GT", w: 180, x: 528, y: 22, rotate: -4 },
  bbc: { label: "BBC", w: 130, x: 762, y: 4, rotate: 5 },

  mecca: { label: "Mecca", w: 150, x: 26, y: 190, rotate: 3 },
  bike: { label: "AMFLOW", w: 250, x: 214, y: 176, rotate: 4 },
  ghost: { label: "ghost", w: 150, x: 512, y: 196, rotate: -6 },
  daily_paper: { label: "Daily Paper", w: 190, x: 700, y: 214, rotate: 4 },

  photo: { label: "me", w: 150, x: 16, y: 386, rotate: -2 },
  pepe: { label: "the desk", w: 140, x: 196, y: 402, rotate: -6 },
  money: { label: "money", w: 160, x: 362, y: 396, rotate: 6 },
  basketball: { label: "ball", w: 170, x: 552, y: 400, rotate: -5 },
  dp: { label: "DP", w: 150, x: 756, y: 420, rotate: 6 },
};

const RING = [
  { x: 60, y: 24 },
  { x: 340, y: 60 },
  { x: 660, y: 30 },
  { x: 160, y: 250 },
  { x: 470, y: 260 },
  { x: 760, y: 300 },
];

function build(files: { file: string; cutout: boolean }[]): Sticker[] {
  return files.map(({ file, cutout }, i) => {
    const base = file.replace(/\.[^.]+$/, "").toLowerCase();
    const placed = PLACED[base];
    const ring = RING[i % RING.length];
    return {
      id: base,
      src: `/stickers/${file}`,
      label: placed?.label ?? base,
      w: placed?.w ?? 160,
      x: placed?.x ?? ring.x,
      y: placed?.y ?? ring.y,
      rotate: placed?.rotate ?? (i % 2 === 0 ? -4 : 5),
      cutout,
    };
  });
}

const STAGE_W = 1050;
const STAGE_H = 620;

export default function Stickers({ files }: { files: { file: string; cutout: boolean }[] }) {
  const initial = useRef<Sticker[]>(build(files));
  const [items, setItems] = useState<Sticker[]>(initial.current);
  const [dragId, setDragId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const offset = useRef({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // The collage is authored at a fixed 1050x620 and scaled to whatever width
  // the pane actually has. Without this the stickers are simply wider than the
  // content area on a smaller window, which pushes the whole page sideways and
  // leaves a strip of dead space beside the black panel.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / STAGE_W));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>, s: Sticker) => {
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    offset.current = { x: e.clientX / scale - s.x, y: e.clientY / scale - s.y };
    setDragId(s.id);
    setItems((prev) => [...prev.filter((p) => p.id !== s.id), prev.find((p) => p.id === s.id)!]);
  }, [scale]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragId) return;
      setItems((prev) =>
        prev.map((p) =>
          p.id === dragId
            ? { ...p, x: e.clientX / scale - offset.current.x, y: e.clientY / scale - offset.current.y }
            : p
        )
      );
    },
    [dragId, scale]
  );

  const nudge = useCallback((id: string, dx: number, dy: number) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, x: p.x + dx, y: p.y + dy } : p)));
  }, []);

  if (!items.length) return null;

  return (
    <div className="stickerfit" ref={wrapRef} style={{ height: STAGE_H * scale }}>
      <div
        className="stickers"
        style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}
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
          aria-label={`${s.label}, drag or use arrow keys to move`}
          style={{ transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rotate}deg)`, width: s.w }}
          onPointerDown={(e) => onPointerDown(e, s)}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 16 : 4;
            if (e.key === "ArrowLeft") { e.preventDefault(); nudge(s.id, -step, 0); }
            if (e.key === "ArrowRight") { e.preventDefault(); nudge(s.id, step, 0); }
            if (e.key === "ArrowUp") { e.preventDefault(); nudge(s.id, 0, -step); }
            if (e.key === "ArrowDown") { e.preventDefault(); nudge(s.id, 0, step); }
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.src} alt={s.label} draggable={false} />
        </div>
      ))}
        <button className="stickerreset" onClick={() => setItems(initial.current)}>
          reset layout
        </button>
      </div>
    </div>
  );
}
