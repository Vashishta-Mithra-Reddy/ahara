"use client";

import { useEffect, useState } from "react";

export default function TitleBarOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const overlay = (navigator as any)?.windowControlsOverlay;
    if (!overlay || typeof overlay.getBoundingClientRect !== "function") {
      return;
    }

    const updateGeometry = () => {
      try {
        const rect = overlay.getBoundingClientRect?.();
        setVisible(Boolean(overlay.visible));
        const x = rect?.x ?? 0;
        const width = rect?.width ?? 0;
        const leftInset = x;
        const rightInset = Math.max(window.innerWidth - (x + width), 0);
        const height = rect?.height ?? 0;

        document.documentElement.style.setProperty("--overlay-left-inset", `${leftInset}px`);
        document.documentElement.style.setProperty("--overlay-right-inset", `${rightInset}px`);
        document.documentElement.style.setProperty("--overlay-height", `${height}px`);
      } catch {
        // ignore; overlay API may be unavailable
      }
    };

    updateGeometry();
    overlay.addEventListener("geometrychange", updateGeometry);
    return () => overlay.removeEventListener("geometrychange", updateGeometry);
  }, []);

  return (
    <div className="titlebar" aria-hidden={!visible}>
      <div className="titlebar-content">
        <span className="no-drag font-outfit font-semibold text-sm">āhāra</span>
      </div>
    </div>
  );
}