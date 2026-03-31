"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Navigation,
  ExternalLink,
  MessageSquare,
  MapPin,
  Clock,
  User,
  Hash,
  Crosshair,
  FileText,
  ChevronRight,
  Radio,
  Pencil,
} from "lucide-react";
import GoldParallaxButton from "./GoldParallaxButton";

export type AlertDetailData = {
  id: string;
  title: string;
  address: string;
  city: string;
  time: string;
  date: string;
  respondersOnScene: number;
  respondersTotal: number;
  priority?: "high" | "medium" | "low";
  agencyName: string;
  source: string;
  alertNumber: string;
  gps: string;
  details?: string;
  callNotes?: { author: string; time: string; text: string }[];
  nearestMarkers: { name: string; distance: string; color: string }[];
};

type ResponseStep = "initial" | "responding" | "enRoute" | "onScene" | "transporting" | "atHospital";

type ButtonAction = "advance" | "cancel" | "decline" | "clear" | "cpr" | "transport";

type StepConfig = {
  buttons: { label: string; action: ButtonAction; statusOverride?: string }[];
};

const STEP_CONFIGS: Record<ResponseStep, StepConfig> = {
  initial: {
    buttons: [
      { label: "Respond", action: "advance", statusOverride: "Response Received" },
      { label: "Decline", action: "decline" },
    ],
  },
  responding: {
    buttons: [
      { label: "En Route", action: "advance" },
      { label: "Cancel", action: "cancel" },
    ],
  },
  enRoute: {
    buttons: [
      { label: "On Scene", action: "advance" },
      { label: "Cancel", action: "cancel" },
    ],
  },
  onScene: {
    buttons: [
      { label: "Transporting", action: "transport" },
      { label: "CPR", action: "cpr" },
      { label: "Clear", action: "clear" },
      { label: "Cancel", action: "cancel" },
    ],
  },
  transporting: {
    buttons: [
      { label: "Arrived", action: "advance", statusOverride: "At Hospital" },
      { label: "Cancel", action: "cancel" },
    ],
  },
  atHospital: {
    buttons: [
      { label: "Clear", action: "clear" },
      { label: "Cancel", action: "cancel" },
    ],
  },
};

const STEP_ORDER: ResponseStep[] = ["initial", "responding", "enRoute", "onScene"];

function PriorityBadge({ priority }: { priority?: "high" | "medium" | "low" }) {
  if (!priority) return null;
  const config = {
    high: { bg: "bg-ios-red/15", text: "text-ios-red", label: "High" },
    medium: { bg: "bg-ios-orange/15", text: "text-ios-orange", label: "Medium" },
    low: { bg: "bg-ios-green/15", text: "text-ios-green", label: "Low" },
  };
  const c = config[priority];
  return (
    <span className={`${c.bg} ${c.text} text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full`}>
      {c.label}
    </span>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="text-battalion-500 mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-text-tertiary uppercase tracking-wide font-medium">{label}</p>
        <p className="text-[14px] text-white mt-0.5 leading-snug">{value}</p>
      </div>
    </div>
  );
}

function MarkerDot({ color }: { color: string }) {
  return <span className={`w-2.5 h-2.5 rounded-full shrink-0`} style={{ backgroundColor: color }} />;
}

export default function AlertDetail({
  alert,
  onBack,
}: {
  alert: AlertDetailData;
  onBack: () => void;
}) {
  const [responseStep, setResponseStep] = useState<ResponseStep>("initial");
  const [declined, setDeclined] = useState(false);
  const [statusLabel, setStatusLabel] = useState<string | null>(null);
  const [cprActive, setCprActive] = useState(false);

  function handleStepAction(action: string, label: string, statusOverride?: string) {
    const displayLabel = statusOverride || label;
    setStatusLabel(displayLabel);
    if (action === "advance") {
      setDeclined(false);
      if (responseStep === "transporting") {
        setResponseStep("atHospital");
      } else {
        const currentIndex = STEP_ORDER.indexOf(responseStep);
        if (currentIndex < STEP_ORDER.length - 1) {
          setResponseStep(STEP_ORDER[currentIndex + 1]);
        }
      }
    } else if (action === "transport") {
      setDeclined(false);
      setResponseStep("transporting");
    } else if (action === "clear") {
      setDeclined(false);
      setCprActive(false);
      setResponseStep("initial");
      setStatusLabel("Closed");
    } else if (action === "cpr") {
      setCprActive(true);
      setStatusLabel("CPR");
      return;
    } else if (action === "cancel") {
      setResponseStep("initial");
      setDeclined(true);
      setCprActive(false);
      setStatusLabel("Declined");
    } else if (action === "decline") {
      setDeclined(true);
      setCprActive(false);
      setStatusLabel("Declined");
    }
  }

  const currentStep = STEP_CONFIGS[responseStep];

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      className="absolute inset-0 z-40 bg-background flex flex-col h-screen"
    >
      {/* Status bar spacer */}
      <div className="h-5 safe-area-top" />

      {/* Navigation bar */}
      <div className="flex items-center gap-1 px-2 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-0.5 text-gold-500 active:text-gold-600 transition-colors px-2 py-2 -ml-1"
        >
          <ChevronLeft size={20} strokeWidth={2} />
          <span className="text-[15px]">Alerts</span>
        </button>
        <div className="flex-1" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Hero section */}
        <div className="px-4 pt-1 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[12px] text-text-tertiary">{alert.agencyName}</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-bold text-white leading-tight">{alert.title}</h1>
            {statusLabel && (
              <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 ${
                statusLabel === "Declined"
                  ? "bg-ios-red/15 text-ios-red"
                  : statusLabel === "Closed"
                    ? "bg-text-tertiary/15 text-text-tertiary"
                    : "bg-gold-500/15 text-gold-500"
              }`}>
                {statusLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <MapPin size={14} strokeWidth={2} className="text-text-secondary shrink-0" />
            <p className="text-[15px] text-text-secondary">{alert.address}</p>
          </div>
          {alert.city && (
            <p className="text-[13px] text-text-tertiary ml-[22px]">{alert.city}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <Clock size={14} strokeWidth={2} className="text-text-secondary shrink-0" />
            <p className="text-[13px] text-text-secondary">{alert.date} at {alert.time}</p>
          </div>
        </div>

        {/* Status buttons */}
        {statusLabel !== "Closed" && <div className="pb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-4">
            {currentStep.buttons.map((btn) => {
              const isDecline = btn.action === "decline";
              const isCancel = btn.action === "cancel";
              const isHighlightedDecline = isDecline && declined;
              const isCpr = btn.action === "cpr";
              const isCprHighlighted = isCpr && cprActive;

              return (
                <motion.button
                  key={btn.label}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  onClick={() => handleStepAction(btn.action, btn.label, btn.statusOverride)}
                  className={`shrink-0 flex-1 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                    isHighlightedDecline
                      ? "bg-ios-red/20 border border-ios-red/40 text-ios-red"
                      : isCprHighlighted
                        ? "bg-gold-500/20 border border-gold-500/40 text-gold-500"
                        : "bg-bg-secondary border border-separator text-white active:bg-white/5"
                  }`}
                >
                  {btn.label}
                </motion.button>
              );
            })}
          </div>
        </div>}

        {/* Directions card */}
        <div className="px-4 pb-3">
          <div className="bg-bg-secondary rounded-2xl overflow-hidden">
            <GoldParallaxButton />
            <div className="flex divide-x divide-separator">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 active:bg-gold-500/20 transition-colors">
                <Navigation size={14} strokeWidth={2} className="text-gold-500" />
                <span className="text-[13px] text-gold-500 font-medium">Alternate Location 1</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 active:bg-gold-500/20 transition-colors">
                <Navigation size={14} strokeWidth={2} className="text-gold-500" />
                <span className="text-[13px] text-gold-500 font-medium">Staging</span>
              </button>
            </div>
          </div>
        </div>

        {/* Response + Chat row */}
        <div className="px-4 pb-3">
          <div className="bg-bg-secondary rounded-2xl overflow-hidden divide-y divide-separator">
            <button className="w-full flex items-center px-4 py-3 active:bg-white/5 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <Radio size={18} strokeWidth={2} className="text-gold-500" />
                <span className="text-[15px] text-white font-medium">Response</span>
              </div>
              <span className="text-[15px] text-text-secondary tabular-nums mr-2">
                <span className="text-white font-semibold">{alert.respondersOnScene}</span>
                <span className="text-text-tertiary">/{alert.respondersTotal}</span>
              </span>
              <ChevronRight size={16} strokeWidth={2} className="text-text-tertiary" />
            </button>
            <button className="w-full flex items-center px-4 py-3 active:bg-white/5 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <MessageSquare size={18} strokeWidth={2} className="text-gold-500" />
                <span className="text-[15px] text-white font-medium">Alert Chat</span>
              </div>
              <ChevronRight size={16} strokeWidth={2} className="text-text-tertiary" />
            </button>
            <button className="w-full flex items-center px-4 py-3 active:bg-white/5 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <FileText size={18} strokeWidth={2} className="text-gold-500" />
                <span className="text-[15px] text-white font-medium">Log</span>
              </div>
              <ChevronRight size={16} strokeWidth={2} className="text-text-tertiary" />
            </button>
          </div>
        </div>

        {/* Call info card */}
        <div className="px-4 pb-3">
          <p className="text-[12px] text-text-tertiary uppercase tracking-wide font-medium px-1 mb-2">Call Information</p>
          <div className="bg-bg-secondary rounded-2xl px-4 divide-y divide-separator">
            <InfoRow icon={<User size={16} strokeWidth={2} />} label="Source" value={alert.source} />
            <InfoRow icon={<Hash size={16} strokeWidth={2} />} label="Active911 #" value={alert.alertNumber} />
            <InfoRow icon={<Crosshair size={16} strokeWidth={2} />} label="GPS" value={alert.gps} />
            {alert.details && (
              <InfoRow icon={<FileText size={16} strokeWidth={2} />} label="Details" value={alert.details} />
            )}
          </div>
        </div>

        {/* Call notes */}
        {alert.callNotes && alert.callNotes.length > 0 && (
          <div className="px-4 pb-3">
            <p className="text-[12px] text-text-tertiary uppercase tracking-wide font-medium px-1 mb-2">Call Notes</p>
            <div className="bg-bg-secondary rounded-2xl px-4 divide-y divide-separator">
              {alert.callNotes.map((note, i) => (
                <div key={i} className="py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] text-white font-medium">{note.author}</span>
                    <span className="text-[11px] text-text-tertiary">{note.time}</span>
                  </div>
                  <p className="text-[13px] text-text-secondary leading-relaxed">{note.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nearest markers */}
        {alert.nearestMarkers.length > 0 && (
          <div className="px-4 pb-3">
            <p className="text-[12px] text-text-tertiary uppercase tracking-wide font-medium px-1 mb-2">Nearest Markers</p>
            <div className="bg-bg-secondary rounded-2xl overflow-hidden divide-y divide-separator">
              {alert.nearestMarkers.map((marker) => (
                <button
                  key={marker.name}
                  className="w-full flex items-center gap-3 px-4 py-3 active:bg-white/5 transition-colors"
                >
                  <MarkerDot color={marker.color} />
                  <span className="text-[14px] text-white flex-1 text-left">{marker.name}</span>
                  <span className="text-[13px] text-text-secondary tabular-nums">{marker.distance}</span>
                  <span className="text-[12px] text-gold-500 font-medium">Map</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
