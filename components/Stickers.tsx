"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Sticker = {
  id: string;
  label: string;
  src?: string[];
  w: number;
  cutout?: boolean;
  x: number;
  y: number;
  rotate: number;
};

const INITIAL: Sticker[] = [
  { id: "urus", label: "the Urus", src: ["/stickers/urus.png", "/stickers/urus.jpg"], w: 260, x: 24, y: 18, rotate: -3 },
  { id: "bike", label: "AMFLOW", src: ["/stickers/bike.png", "/stickers/bike.jpg"], w: 210, x: 320, y: 96, rotate: 4 },
  { id: "pepe", label: "the desk", src: ["/stickers/pepe.jpg", "/stickers/pepe.png"], w: 130, x: 116, y: 190, rotate: -6 },
  { id: "photo", label: "photo", src: ["/stickers/photo.jpg", "/stickers/photo.png"], w: 120, x: 400, y: 8, rotate: 5 },
  { id: "cad", label: "CAD 2026", w: 0, x: 32, y: 320, rotate: 2 },
  { id: "cambridge", label: "Cambridge", w: 0, x: 300, y: 330, rotate: -2 },
];

export default function Stickers() {
  const [items, setItems] = useState<Sticker[]>(INITIAL);
  const [dragId, setDragId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<Record<string, number>>({});
  const [broken, setBroken] = useState<string[]>([]);
  const offset = useRef({ x: 0, y: 0 });
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Images can finish loading (or failing) before hydration attaches onError,
  // so a missing file would otherwise render as an invisible zero-height box.
  // Re-check every image once on mount.
  useEffect(() => {
    const imgs = rootRef.current?.querySelectorAll<HTMLImageElement>("img[data-sid]");
    if (!imgs) return;
    imgs.forEach((img) => {
      if (img.complete && img.naturalWidth === 0) {
        const sid = img.dataset.sid;
        if (sid) fail(sid);
      }
    });
  }, []);

  // Try each candidate extension in turn; only give up on the label once every
  // one has failed.
  const fail = useCallback((id: string) => {
    const total = INITIAL.find((i) => i.id === id)?.src?.length ?? 0;
    setAttempt((prev) => {
      const next = (prev[id] ?? 0) + 1;
      if (next >= total) setBroken((b) => (b.includes(id) ? b : [...b, id]));
      return { ...prev, [id]: next };
    });
  }, []);

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
      const x = e.clientX - offset.current.x;
      const y = e.clientY - offset.current.y;
      setItems((prev) => prev.map((p) => (p.id === dragId ? { ...p, x, y } : p)));
    },
    [dragId]
  );

  const nudge = useCallback((id: string, dx: number, dy: number) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, x: p.x + dx, y: p.y + dy } : p)));
  }, []);

  return (
    <div className="stickers" ref={rootRef} onPointerMove={onPointerMove} onPointerUp={() => setDragId(null)}>
      {items.map((s) => {
        const idx = attempt[s.id] ?? 0;
        const currentSrc = s.src?.[idx];
        const hasImage = Boolean(currentSrc) && !broken.includes(s.id);
        return (
          <div
            key={s.id}
            className="sticker"
            data-image={hasImage}
            data-cutout={hasImage && s.cutout ? "true" : undefined}
            data-dragging={dragId === s.id}
            tabIndex={0}
            role="button"
            aria-label={`${s.label}, drag or use arrow keys to move`}
            style={{
              transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rotate}deg)`,
              width: hasImage ? s.w : undefined,
            }}
            onPointerDown={(e) => onPointerDown(e, s)}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 16 : 4;
              if (e.key === "ArrowLeft") { e.preventDefault(); nudge(s.id, -step, 0); }
              if (e.key === "ArrowRight") { e.preventDefault(); nudge(s.id, step, 0); }
              if (e.key === "ArrowUp") { e.preventDefault(); nudge(s.id, 0, -step); }
              if (e.key === "ArrowDown") { e.preventDefault(); nudge(s.id, 0, step); }
            }}
          >
            {hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={currentSrc}
                src={currentSrc}
                alt={s.label}
                data-sid={s.id}
                draggable={false}
                onError={() => fail(s.id)}
              />
            ) : (
              s.label
            )}
          </div>
        );
      })}
      <button className="stickerreset" onClick={() => setItems(INITIAL)}>
        reset layout
      </button>
    </div>
  );
}
