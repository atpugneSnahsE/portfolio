"use client";

import { useSyncExternalStore } from "react";

export default function CustomCursor() {
  const touchDevice = useSyncExternalStore(
    (cb) => {
      const mq = matchMedia("(pointer: coarse)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => matchMedia("(pointer: coarse)").matches,
    () => true,
  );

  if (touchDevice) return null;

  return null;
}
