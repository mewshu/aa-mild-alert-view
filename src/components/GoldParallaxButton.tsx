"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Navigation } from "lucide-react";

export default function GoldParallaxButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [gradientPos, setGradientPos] = useState(50);
  const [orientationActive, setOrientationActive] = useState(false);
  const permissionAttempted = useRef(false);

  // Request orientation permission on tap (iOS Safari requires user gesture)
  const requestOrientationPermission = useCallback(async () => {
    if (permissionAttempted.current) return;
    permissionAttempted.current = true;

    try {
      // Always try calling requestPermission — iOS Safari needs it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (DeviceOrientationEvent as any).requestPermission();
      if (result === "granted") {
        setOrientationActive(true);
      }
    } catch {
      // requestPermission doesn't exist (non-iOS) or failed — just activate
      setOrientationActive(true);
    }
  }, []);

  // On non-iOS devices, try activating immediately
  useEffect(() => {
    // If we get an orientation event without requesting, we're on a non-iOS device
    function probe(e: DeviceOrientationEvent) {
      if (e.gamma !== null) {
        setOrientationActive(true);
      }
      window.removeEventListener("deviceorientation", probe);
    }
    window.addEventListener("deviceorientation", probe);
    // Clean up after 1s if no event fires (desktop with no sensor)
    const timer = setTimeout(() => {
      window.removeEventListener("deviceorientation", probe);
    }, 1000);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("deviceorientation", probe);
    };
  }, []);

  // Listen to device orientation once active
  useEffect(() => {
    if (!orientationActive) return;

    function handleOrientation(e: DeviceOrientationEvent) {
      const gamma = e.gamma ?? 0;
      const clamped = Math.max(-45, Math.min(45, gamma));
      const pos = ((clamped + 45) / 90) * 100;
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
    #837A66 ${highlightCenter - 60}%,
    #A99D85 ${highlightCenter - 30}%,
    #D3C8B2 ${highlightCenter - 10}%,
    #F1ECE2 ${highlightCenter}%,
    #D3C8B2 ${highlightCenter + 10}%,
    #A99D85 ${highlightCenter + 30}%,
    #837A66 ${highlightCenter + 60}%
  )`;

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={requestOrientationPermission}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 active:brightness-90 transition-[filter] duration-100"
      style={{ background: gradient }}
    >
      <Navigation size={18} strokeWidth={2} className="text-gold-800/70" />
      <span className="text-[15px] font-semibold text-background drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
        Get Directions
      </span>
    </button>
  );
}
