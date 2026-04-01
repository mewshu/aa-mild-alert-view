"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Navigation } from "lucide-react";
import { hapticMedium } from "@/lib/haptics";

export default function GoldParallaxButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [gradientPos, setGradientPos] = useState(50);
  const [orientationActive, setOrientationActive] = useState(false);
  const permissionAttempted = useRef(false);
  const targetPos = useRef(50);
  const animFrame = useRef<number>(0);

  // Request orientation permission on tap (iOS Safari requires user gesture)
  const requestOrientationPermission = useCallback(async () => {
    if (permissionAttempted.current) return;
    permissionAttempted.current = true;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        const result = await (DeviceOrientationEvent as any).requestPermission();
        if (result === "granted") {
          setOrientationActive(true);
        }
      } else {
        // No requestPermission (Capacitor WKWebView or non-iOS) — just activate
        setOrientationActive(true);
      }
    } catch {
      // requestPermission failed — just activate and hope events fire
      setOrientationActive(true);
    }
  }, []);

  // Request orientation permission and activate on mount
  useEffect(() => {
    async function activate() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
          // In Capacitor WKWebView this can succeed without a user gesture
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (DeviceOrientationEvent as any).requestPermission();
        }
      } catch {
        // Permission denied or not available — still try listening
      }
      permissionAttempted.current = true;
      setOrientationActive(true);
    }
    activate();
  }, []);

  // Listen to device orientation once active — update target, not state directly
  useEffect(() => {
    if (!orientationActive) return;

    function handleOrientation(e: DeviceOrientationEvent) {
      const gamma = e.gamma ?? 0;
      // Reduced sensitivity: map ±45° to a narrower range around center
      const clamped = Math.max(-45, Math.min(45, gamma));
      targetPos.current = 100 - ((clamped + 45) / 90) * 100;
    }

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [orientationActive]);

  // Smooth animation loop — lerp toward target
  useEffect(() => {
    let current = gradientPos;
    const lerp = 0.25; // higher = snappier response

    function tick() {
      current += (targetPos.current - current) * lerp;
      setGradientPos(current);
      animFrame.current = requestAnimationFrame(tick);
    }

    animFrame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mouse movement for desktop fallback
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    targetPos.current = Math.max(0, Math.min(100, (x / rect.width) * 100));
  }, []);

  const handleMouseLeave = useCallback(() => {
    targetPos.current = 50;
  }, []);

  const highlightCenter = gradientPos;
  const gradient = `linear-gradient(
    110deg,
    #6B5D45 ${highlightCenter - 60}%,
    #8B7355 ${highlightCenter - 30}%,
    #C4A265 ${highlightCenter - 10}%,
    #D4B478 ${highlightCenter}%,
    #C4A265 ${highlightCenter + 10}%,
    #8B7355 ${highlightCenter + 30}%,
    #6B5D45 ${highlightCenter + 60}%
  )`;

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => { hapticMedium(); requestOrientationPermission(); }}
      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl active:brightness-90 transition-[filter] duration-100"
      style={{ background: gradient }}
    >
      <Navigation size={18} strokeWidth={2} className="text-white/70" />
      <span className="text-[15px] font-semibold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
        Navigate
      </span>
    </button>
  );
}
