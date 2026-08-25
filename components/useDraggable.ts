"use client";

import { useCallback, useRef, useState } from "react";

type Box = { left: number; top: number; w: number; h: number };

/**
 * Pointer drag plus arrow-key nudging, shared by the bismillah and the
 * disclaimer.
 *
 * Movement is clamped to the black panel. Without it the disclaimer could be
 * dragged off to the right, which widened the document by however far it went
 * and left the page scrolling sideways into empty white. Clipping alone would
 * stop that but would also let it be thrown out of sight with no way back, and
 * unlike the stickers it has no reset.
 */
export function useDraggable(start = { x: 0, y: 0 }) {
  const [pos, setPos] = useState(start);
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });
  const base = useRef<Box | null>(null);
  const bounds = useRef<DOMRect | null>(null);

  // One layout read per gesture, in an event handler rather than in render.
  // `base` is where the element would sit untranslated, so the clamp can be
  // expressed in the same coordinates as `pos`.
  const measure = useCallback((el: HTMLElement, at: { x: number; y: number }) => {
    const r = el.getBoundingClientRect();
    base.current = { left: r.left - at.x, top: r.top - at.y, w: r.width, h: r.height };
    bounds.current = el.closest(".about")?.getBoundingClientRect() ?? null;
  }, []);

  const clamp = useCallback((p: { x: number; y: number }) => {
    const b = base.current;
    const box = bounds.current;
    if (!b || !box) return p;
    return {
      x: Math.min(Math.max(p.x, box.left - b.left), box.right - b.left - b.w),
      y: Math.min(Math.max(p.y, box.top - b.top), box.bottom - b.top - b.h),
    };
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
      measure(e.currentTarget as HTMLElement, pos);
      offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
      setDragging(true);
    },
    [pos, measure]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!dragging) return;
      setPos(clamp({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y }));
    },
    [dragging, clamp]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const step = e.shiftKey ? 16 : 4;
      const map: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step],
      };
      const d = map[e.key];
      if (!d) return;
      e.preventDefault();
      measure(e.currentTarget as HTMLElement, pos);
      setPos(clamp({ x: pos.x + d[0], y: pos.y + d[1] }));
    },
    [pos, measure, clamp]
  );

  return {
    pos,
    dragging,
    bind: {
      tabIndex: 0,
      role: "button" as const,
      // Described, not labelled. An aria-label here would become the accessible
      // name and the visible text would never be announced.
      "aria-describedby": "draghint",
      "data-dragging": dragging,
      style: { transform: `translate(${pos.x}px, ${pos.y}px)` },
      onPointerDown,
      onPointerMove,
      onPointerUp: () => setDragging(false),
      onKeyDown,
    },
  };
}
