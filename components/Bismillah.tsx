"use client";

import { useDraggable } from "./useDraggable";

export default function Bismillah() {
  const { bind } = useDraggable();
  return (
    <div className="bismillah" aria-label="Bismillah, drag or use arrow keys to move" {...bind}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/stickers/bismillah.jpg" alt="Bismillah" draggable={false} />
    </div>
  );
}
