"use client";

import { useDraggable } from "./useDraggable";

/**
 * The wordmark beside the heading. Two elements rather than one because the
 * drag writes a translate into the style attribute, which would replace a
 * rotate declared in CSS: the outer div moves, the inner span holds the tilt.
 *
 * The padding is not decoration. Rotating a 232x84 banner by six degrees makes
 * the box it really occupies about 12px taller, and the drag clamp measures the
 * outer div, so without the padding the corners would clip at the panel edge.
 */
export default function Nameplate() {
  const { bind } = useDraggable();
  return (
    <div className="nameplate" {...bind}>
      <span className="nameplatetilt">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mr-faaja.webp" alt="Mr. Faaja" width={600} height={218} draggable={false} />
      </span>
    </div>
  );
}
