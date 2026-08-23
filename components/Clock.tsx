"use client";

import { useEffect, useState } from "react";
import { profile } from "@/data/records";

function read() {
  const now = new Date();
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: profile.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  const zone =
    new Intl.DateTimeFormat("en-GB", {
      timeZone: profile.timezone,
      timeZoneName: "shortOffset",
    })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT";

  return `${zone} UK · ${time}`;
}

export default function Clock() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(read());
    const tick = () => setLabel(read());
    const now = new Date();
    const msToMinute = (60 - now.getSeconds()) * 1000;
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 60_000);
    }, msToMinute);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return <span suppressHydrationWarning>{label ?? " "}</span>;
}
