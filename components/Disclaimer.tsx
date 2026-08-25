"use client";

import { useDraggable } from "./useDraggable";

/** Styled as the platform's error notification, because that is the joke. */
export default function Disclaimer({ text }: { text: string }) {
  const { bind } = useDraggable();
  return (
    <div className="disclaimer" {...bind}>
      <span className="disclaimerpill">
        <span className="disclaimericon" aria-hidden="true">!</span>
        Disclaimer!
      </span>
      <span className="disclaimertext">{text}</span>
    </div>
  );
}
