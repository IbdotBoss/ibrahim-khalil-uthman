"use client";

import { useCallback, useRef, useState } from "react";

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
const PLACED: Record<
  string,
  { label: string; w: number; x: number; y: number; rotate: number; cutout?: boolean }
> = {
  // cutout: true means the file already has a transparent background, so it gets
  // an outline traced round its alpha instead of a white photo frame.
  urus: { label: "the Urus", w: 320, x: 10, y: 26, rotate: -3 },
  dunk: { label: "dunks", w: 190, x: 372, y: 0, rotate: 7, cutout: true },
  bike: { label: "AMFLOW", w: 280, x: 606, y: 96, rotate: 4 },
  basketball: { label: "ball", w: 200, x: 596, y: 322, rotate: -5 },
  money: { label: "money", w: 170, x: 384, y: 372, rotate: 6 },
  pepe: { label: "the desk", w: 150, x: 214, y: 300, rotate: -6 },
  photo: { label: "me", w: 160, x: 16, y: 322, rotate: 3 },
};

const RING = [
  { x: 60, y: 24 },
  { x: 340, y: 60 },
  { x: 660, y: 30 },
  { x: 160, y: 250 },
  { x: 470, y: 260 },
  { x: 760, y: 300 },
];

function build(files: string[]): Sticker[] {
  return files.map((file, i) => {
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
      cutout: placed?.cutout,
    };
  });
}

export default function Stickers({ files }: { files: string[] }) {
  const initial = useRef<Sticker[]>(build(files));
  const [items, setItems] = useState<Sticker[]>(initial.current);
  const [dragId, setDragId] = useState<string | null>(null);
  const offset = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>, s: Sticker) => {
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    offset.current = { x: e.clientX - s.x, y: e.clientY - s.y };
    setDragId(s.id);
    setItems((prev) => [...prev.filter((p) => p.id !== s.id), prev.find((p) => p.id === s.id)!]);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragId) return;
      setItems((prev) =>
        prev.map((p) =>
          p.id === dragId
            ? { ...p, x: e.clientX - offset.current.x, y: e.clientY - offset.current.y }
            : p
        )
      );
    },
    [dragId]
  );

  const nudge = useCallback((id: string, dx: number, dy: number) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, x: p.x + dx, y: p.y + dy } : p)));
  }, []);

  if (!items.length) return null;

  return (
    <div className="stickers" onPointerMove={onPointerMove} onPointerUp={() => setDragId(null)}>
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
  );
}
