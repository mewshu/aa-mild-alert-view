"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Navigation } from "lucide-react";
import { hapticMedium } from "@/lib/haptics";

export default function GoldParallaxButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [gradientPos, setGradientPos] = useState(50);

  // Always listen for device orientation events
  useEffect(() => {
    function handleOrientation(e: DeviceOrientationEvent) {
      if (e.gamma === null) return;
      const gamma = e.gamma;
      const clamped = Math.max(-45, Math.min(45, gamma));
      const pos = 100 - ((clamped + 45) / 90) * 100;
      setGradientPos(pos);
    }

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  // Request permission on first touch (needed for iOS Safari)
  useEffect(() => {
    async function requestPermission() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const req = (DeviceOrientationEvent as any).requestPermission;
        if (typeof req === "function") {
          await req();
        }
      } catch {
        // Permission denied or not available — orientation events may still work
      }
    }

    // Try immediately (works in Capacitor WKWebView)
    requestPermission();

    // Also try on first touch (iOS Safari user-gesture requirement)
    function onFirstTouch() {
      requestPermission();
    }
    document.addEventListener("touchstart", onFirstTouch, { once: true });

    return () => {
      document.removeEventListener("touchstart", onFirstTouch);
    };
  }, []);

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
      onClick={hapticMedium}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 active:brightness-90 transition-[filter] duration-100"
      style={{ background: gradient }}
    >
      <Navigation size={18} strokeWidth={2} className="text-black/80" />
      <span className="text-[15px] font-semibold text-black/80">
        Navigate
      </span>
    </button>
  );
}
