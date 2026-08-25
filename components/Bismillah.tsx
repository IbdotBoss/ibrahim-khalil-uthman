"use client";

import { useDraggable } from "./useDraggable";

export default function Bismillah() {
  const { bind } = useDraggable();
  return (
    <div className="bismillah" {...bind}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/stickers/bismillah.jpg" alt="Bismillah" width={499} height={108} draggable={false} />
    </div>
  );
}
