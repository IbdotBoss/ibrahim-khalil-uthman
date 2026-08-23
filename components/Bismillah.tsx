"use client";

import { useCallback, useRef, useState } from "react";

// Sits centred above the name. Draggable like the stickers, but it starts in
// the middle rather than scattered, and it is not part of the sticker set.
export default function Bismillah() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
      offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
      setDragging(true);
    },
    [pos]
  );

  return (
    <div
      className="bismillah"
      data-dragging={dragging}
      tabIndex={0}
      role="button"
      aria-label="Bismillah, drag or use arrow keys to move"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      onPointerDown={onPointerDown}
      onPointerMove={(e) => {
        if (!dragging) return;
        setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
      }}
      onPointerUp={() => setDragging(false)}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 16 : 4;
        if (e.key === "ArrowLeft") { e.preventDefault(); setPos((p) => ({ ...p, x: p.x - step })); }
        if (e.key === "ArrowRight") { e.preventDefault(); setPos((p) => ({ ...p, x: p.x + step })); }
        if (e.key === "ArrowUp") { e.preventDefault(); setPos((p) => ({ ...p, y: p.y - step })); }
        if (e.key === "ArrowDown") { e.preventDefault(); setPos((p) => ({ ...p, y: p.y + step })); }
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/stickers/bismillah.jpg" alt="Bismillah" draggable={false} />
    </div>
  );
}
