"use client";

import { useCallback, useRef, useState } from "react";

type Sticker = { id: string; label: string; x: number; y: number; rotate: number; wide?: boolean };

const INITIAL: Sticker[] = [
  { id: "photo", label: "photo", x: 8, y: 6, rotate: -4, wide: true },
  { id: "cambridge", label: "Cambridge", x: 232, y: 34, rotate: 3 },
  { id: "cad", label: "CAD 2026", x: 78, y: 152, rotate: -2 },
  { id: "beng", label: "BEng", x: 268, y: 138, rotate: 5 },
  { id: "shipped", label: "7 shipped", x: 176, y: 214, rotate: -3 },
];

export default function Stickers() {
  const [items, setItems] = useState<Sticker[]>(INITIAL);
  const [dragId, setDragId] = useState<string | null>(null);
  const offset = useRef({ x: 0, y: 0 });
  const moved = useRef(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, s: Sticker) => {
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
      offset.current = { x: e.clientX - s.x, y: e.clientY - s.y };
      moved.current = false;
      setDragId(s.id);
      setItems((prev) => [...prev.filter((p) => p.id !== s.id), prev.find((p) => p.id === s.id)!]);
    },
    []
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragId) return;
      moved.current = true;
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
    <div className="stickers" onPointerMove={onPointerMove} onPointerUp={() => setDragId(null)}>
      {items.map((s) => (
        <div
          key={s.id}
          className="sticker"
          data-wide={s.wide}
          data-dragging={dragId === s.id}
          tabIndex={0}
          role="button"
          aria-label={`${s.label}, drag or use arrow keys to move`}
          style={{ transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rotate}deg)` }}
          onPointerDown={(e) => onPointerDown(e, s)}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 16 : 4;
            if (e.key === "ArrowLeft") { e.preventDefault(); nudge(s.id, -step, 0); }
            if (e.key === "ArrowRight") { e.preventDefault(); nudge(s.id, step, 0); }
            if (e.key === "ArrowUp") { e.preventDefault(); nudge(s.id, 0, -step); }
            if (e.key === "ArrowDown") { e.preventDefault(); nudge(s.id, 0, step); }
          }}
        >
          {s.label}
        </div>
      ))}
      <button className="stickerreset" onClick={() => setItems(INITIAL)}>
        reset layout
      </button>
    </div>
  );
}
