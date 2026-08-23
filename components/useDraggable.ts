"use client";

import { useCallback, useRef, useState } from "react";

/** Pointer drag plus arrow-key nudging, shared by the bismillah and the disclaimer. */
export function useDraggable(start = { x: 0, y: 0 }) {
  const [pos, setPos] = useState(start);
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
      offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
      setDragging(true);
    },
    [pos]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!dragging) return;
      setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    },
    [dragging]
  );

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    const step = e.shiftKey ? 16 : 4;
    const map: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step],
    };
    const d = map[e.key];
    if (!d) return;
    e.preventDefault();
    setPos((p) => ({ x: p.x + d[0], y: p.y + d[1] }));
  }, []);

  return {
    pos,
    dragging,
    bind: {
      tabIndex: 0,
      role: "button" as const,
      "data-dragging": dragging,
      style: { transform: `translate(${pos.x}px, ${pos.y}px)` },
      onPointerDown,
      onPointerMove,
      onPointerUp: () => setDragging(false),
      onKeyDown,
    },
  };
}
