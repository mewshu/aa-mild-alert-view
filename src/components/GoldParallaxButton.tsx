"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Navigation } from "lucide-react";
import { hapticMedium } from "@/lib/haptics";

export default function GoldParallaxButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [gradientPos, setGradientPos] = useState(50);
  const [orientationActive, setOrientationActive] = useState(false);

  const tryActivateOrientation = useCallback(async () => {
    if (orientationActive) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req = (DeviceOrientationEvent as any).requestPermission;
      if (typeof req === "function") {
        const result = await req();
        if (result === "granted") setOrientationActive(true);
      } else {
        // No permission API — orientation events just work
        setOrientationActive(true);
      }
    } catch {
      setOrientationActive(true);
    }
  }, [orientationActive]);

  useEffect(() => {
    // Try immediately on mount (works in Capacitor WKWebView)
    tryActivateOrientation();

    // Also try on first touch (needed for iOS Safari user-gesture requirement)
    function onFirstTouch() {
      tryActivateOrientation();
    }
    document.addEventListener("touchstart", onFirstTouch, { once: true });

    // Probe: if orientation events fire without permission, just activate
    function probe(e: DeviceOrientationEvent) {
      if (e.gamma !== null) setOrientationActive(true);
      window.removeEventListener("deviceorientation", probe);
    }
    window.addEventListener("deviceorientation", probe);
    const timer = setTimeout(() => {
      window.removeEventListener("deviceorientation", probe);
    }, 1000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("touchstart", onFirstTouch);
      window.removeEventListener("deviceorientation", probe);
    };
  }, [tryActivateOrientation]);

  // Listen to device orientation once active
  useEffect(() => {
    if (!orientationActive) return;

    function handleOrientation(e: DeviceOrientationEvent) {
      const gamma = e.gamma ?? 0;
      const clamped = Math.max(-45, Math.min(45, gamma));
      const pos = 100 - ((clamped + 45) / 90) * 100;
      setGradientPos(pos);
    }

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [orientationActive]);

  // Mouse movement for desktop fallback
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pos = (x / rect.width) * 100;
    setGradientPos(Math.max(0, Math.min(100, pos)));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setGradientPos(50);
  }, []);

  const highlightCenter = gradientPos;
  const gradient = `linear-gradient(
    110deg,
    #7A6842 ${highlightCenter - 90}%,
    #A08550 ${highlightCenter - 55}%,
    #C4A865 ${highlightCenter - 25}%,
    #E0D09A ${highlightCenter}%,
    #C4A865 ${highlightCenter + 25}%,
    #A08550 ${highlightCenter + 55}%,
    #7A6842 ${highlightCenter + 90}%
  )`;

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => { hapticMedium(); tryActivateOrientation(); }}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 active:brightness-90 transition-[filter] duration-100"
      style={{ background: gradient }}
    >
      <Navigation size={18} strokeWidth={2} className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]" />
      <span className="text-[15px] font-semibold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
        Navigate
      </span>
    </button>
  );
}
