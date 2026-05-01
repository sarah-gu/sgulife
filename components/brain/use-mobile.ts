"use client";

import { useEffect, useState } from "react";

export function useIsMobile(maxWidth = 720): boolean {
  const [is, setIs] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const sync = () => setIs(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [maxWidth]);
  return is;
}
