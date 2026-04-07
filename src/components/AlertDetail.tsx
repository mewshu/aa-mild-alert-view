"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  List,
  Zap,
  X,
  Send,
} from "lucide-react";
import GoldParallaxButton from "./GoldParallaxButton";
import { hapticLight, hapticMedium, hapticWarning } from "@/lib/haptics";

export type Responder = {
  name: string;
  role: string;
  status: "On Scene" | "En Route" | "Responding" | "Staging" | "Declined";
};

export type AlertDetailData = {
  id: string;
  title: string;
  address: string;
  city: string;
  time: string;
  date: string;
  respondersOnScene: number;
  respondersTotal: number;
  responders?: Responder[];
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
  initialChatOpen = false,
}: {
  alert: AlertDetailData;
  onBack: () => void;
  initialChatOpen?: boolean;
}) {
  const [responseStep, setResponseStep] = useState<ResponseStep>("initial");
  const [declined, setDeclined] = useState(false);
  const [statusLabel, setStatusLabel] = useState<string | null>(null);
  const [cprActive, setCprActive] = useState(false);
  const [viewMode, setViewMode] = useState<"details" | "response">("details");
  const [navPopupOpen, setNavPopupOpen] = useState(false);
  const [respondersSheetOpen, setRespondersSheetOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(initialChatOpen);
  const [chatInput, setChatInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "Dispatch", time: "2 min ago", text: "All units, be advised: caller reports smoke visible from the road.", isMe: false },
    { id: 2, sender: "Engine 42", time: "2 min ago", text: "Engine 42 copy, we have visual on the smoke column. Approximately 1 mile out.", isMe: false },
    { id: 3, sender: "You", time: "1 min ago", text: "Copy, responding from station. ETA 4 minutes.", isMe: true },
    { id: 4, sender: "Battalion 7", time: "1 min ago", text: "Battalion 7 en route. Engine 42, give me a size-up on arrival.", isMe: false },
    { id: 5, sender: "Engine 42", time: "just now", text: "On scene. Single story residential, smoke showing from the Charlie side. Establishing command.", isMe: false },
  ]);

  function sendChatMessage() {
    const text = chatInput.trim();
    if (!text) return;
    hapticLight();
    setChatMessages(prev => [...prev, { id: prev.length + 1, sender: "You", time: "just now", text, isMe: true }]);
    setChatInput("");
    setTimeout(() => chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" }), 50);
  }

  const isResponse = viewMode === "response";

  const responders = alert.responders ?? [];
  const onSceneCount = responders.length > 0 ? responders.filter(r => r.status === "On Scene").length : alert.respondersOnScene;
  const totalCount = responders.length > 0 ? responders.length : alert.respondersTotal;

  function handleStepAction(action: string, label: string, statusOverride?: string) {
    if (action === "decline" || action === "cancel" || action === "clear") {
      hapticWarning();
    } else {
      hapticMedium();
    }
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
          onClick={() => { onBack(); }}
          className="flex items-center gap-0.5 text-gold-500 active:text-gold-600 transition-colors px-2 py-2 -ml-1"
        >
          <ChevronLeft size={20} strokeWidth={2} />
          <span className="text-[15px]">Blue Base</span>
        </button>
        <div className="flex-1" />
        <div className="flex items-center bg-bg-secondary rounded-lg p-0.5 mr-2">
          <button
            onClick={() => { hapticLight(); setViewMode("details"); scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
              viewMode === "details" ? "bg-bg-tertiary text-gold-500" : "text-text-tertiary"
            }`}
          >
            <List size={14} strokeWidth={2} />
            Details
          </button>
          <button
            onClick={() => { hapticLight(); setViewMode("response"); scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
              viewMode === "response" ? "bg-bg-tertiary text-gold-500" : "text-text-tertiary"
            }`}
          >
            <Zap size={14} strokeWidth={2} />
            Response
          </button>
        </div>
      </div>

      {/* Response mode */}
      <div className={`flex-1 flex flex-col min-h-0 transition-opacity duration-200 ${isResponse ? "" : "hidden"}`}>
        {/* Response mode: fixed top sections + scrollable call notes */}
        <div className="shrink-0">
          {/* Hero section with navigate button */}
          <div className="px-4 pt-1 pb-4 flex gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-[28px] font-bold text-white leading-tight">{alert.title}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <MapPin size={18} strokeWidth={2} className="text-text-secondary shrink-0" />
                <p className="text-[18px] text-text-secondary">{alert.address}</p>
              </div>
              <div className="h-7 flex items-center mt-1">
                {statusLabel && (
                  <span className={`text-[13px] px-2.5 py-1 font-semibold uppercase tracking-wide rounded-full ${
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
            </div>
            {statusLabel !== "Closed" && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { hapticMedium(); setNavPopupOpen(true); }}
              className="shrink-0 self-center w-16 h-16 rounded-full bg-gold-500 flex items-center justify-center active:bg-gold-600 transition-colors"
            >
              <Navigation size={28} strokeWidth={2} className="text-black/80" />
            </motion.button>
            )}
          </div>

          {/* Status buttons */}
          {statusLabel !== "Closed" && <div className="pb-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar px-4">
              {currentStep.buttons.map((btn) => {
                const isDecline = btn.action === "decline";
                const isHighlightedDecline = isDecline && declined;
                const isCpr = btn.action === "cpr";
                const isCprHighlighted = isCpr && cprActive;

                return (
                  <motion.button
                    key={btn.label}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    onClick={() => handleStepAction(btn.action, btn.label, btn.statusOverride)}
                    className={`shrink-0 flex-1 px-5 py-4 rounded-2xl text-[16px] font-medium transition-colors ${
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
        </div>

        {/* Scrollable call notes */}
        {alert.callNotes && alert.callNotes.length > 0 && (
          <div className="flex-1 flex flex-col min-h-0 px-4">
            <p className="shrink-0 text-[14px] text-text-tertiary uppercase tracking-wide font-medium px-1 mb-2">Call Notes</p>
            <div className="flex-1 overflow-y-auto pb-24 bg-bg-secondary rounded-2xl px-4 divide-y divide-separator">
              {alert.callNotes.map((note, i) => (
                <div key={i} className="py-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[16px] text-white font-medium">{note.author}</span>
                    <span className="text-[13px] text-text-tertiary">{note.time}</span>
                  </div>
                  <p className="text-[16px] text-text-secondary leading-relaxed">{note.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Details mode */}
      <div ref={scrollRef} className={`flex-1 overflow-y-auto pb-24 ${isResponse ? "hidden" : ""}`}>
        {/* Hero section */}
        <div className="px-4 pt-1 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[12px] text-text-tertiary">{alert.agencyName}</span>
          </div>
          <h1 className="text-[22px] font-bold text-white leading-tight">{alert.title}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <MapPin size={14} strokeWidth={2} className="text-text-secondary shrink-0" />
            <p className="text-[15px] text-text-secondary">{alert.address}</p>
          </div>
          <div className="h-6 flex items-center mt-1">
            {statusLabel && (
              <span className={`text-[11px] px-2 py-0.5 font-semibold uppercase tracking-wide rounded-full ${
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
          {alert.city && (
            <p className="text-[13px] text-text-tertiary ml-[22px]">{alert.city}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <Clock size={14} strokeWidth={2} className="text-text-secondary shrink-0" />
            <p className="text-[13px] text-text-secondary">{alert.date} at {alert.time}</p>
          </div>
        </div>

        {/* Status buttons — always rendered to prevent layout shift */}
        <div className="pb-4">
          <div className={`flex gap-2 overflow-x-auto no-scrollbar px-4 ${statusLabel === "Closed" ? "opacity-40 pointer-events-none" : ""}`}>
            {currentStep.buttons.map((btn) => {
              const isDecline = btn.action === "decline";
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
        </div>

        {/* Directions card */}
        {statusLabel !== "Closed" && (
        <div className="px-4 pb-3">
          <div className="bg-bg-secondary rounded-2xl overflow-hidden">
            <GoldParallaxButton />
            <div className="flex divide-x divide-separator">
              <button onClick={hapticLight} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 active:bg-gold-500/20 transition-colors">
                <Navigation size={14} strokeWidth={2} className="text-gold-500" />
                <span className="text-[13px] text-gold-500 font-medium">Alternate Location 1</span>
              </button>
              <button onClick={hapticLight} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 active:bg-gold-500/20 transition-colors">
                <Navigation size={14} strokeWidth={2} className="text-gold-500" />
                <span className="text-[13px] text-gold-500 font-medium">Staging</span>
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Response + Chat row */}
        <div className="px-4 pb-3">
          <div className="bg-bg-secondary rounded-2xl overflow-hidden divide-y divide-separator">
            <button onClick={() => { hapticLight(); setRespondersSheetOpen(true); }} className="w-full flex items-center px-4 py-3 active:bg-white/5 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <Radio size={18} strokeWidth={2} className="text-gold-500" />
                <span className="text-[15px] text-white font-medium">Response</span>
              </div>
              <span className="text-[15px] text-text-secondary tabular-nums mr-2">
                <span className="text-white font-semibold">{onSceneCount}</span>
                <span className="text-text-tertiary">/{totalCount}</span>
              </span>
              <ChevronRight size={16} strokeWidth={2} className="text-text-tertiary" />
            </button>
            <button onClick={() => { hapticLight(); setChatOpen(true); }} className="w-full flex items-center px-4 py-3 active:bg-white/5 transition-colors">
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
                  onClick={hapticLight}
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

      {/* Navigation popup */}
      <AnimatePresence>
        {navPopupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={() => setNavPopupOpen(false)} />
            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative bg-bg-secondary rounded-3xl w-[85%] max-w-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h2 className="text-[20px] font-bold text-white">Navigate</h2>
                <button
                  onClick={() => { hapticLight(); setNavPopupOpen(false); }}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20 transition-colors"
                >
                  <X size={16} strokeWidth={2.5} className="text-text-tertiary" />
                </button>
              </div>
              <div className="px-4 pb-5 flex flex-col gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { hapticMedium(); setNavPopupOpen(false); }}
                  className="flex items-center gap-4 px-5 py-5 rounded-2xl bg-gold-500 active:bg-gold-600 transition-colors"
                >
                  <Navigation size={24} strokeWidth={2} className="text-white" />
                  <span className="text-[18px] font-semibold text-white">Navigate</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { hapticMedium(); setNavPopupOpen(false); }}
                  className="flex items-center gap-4 px-5 py-5 rounded-2xl bg-bg-tertiary border border-separator active:bg-white/5 transition-colors"
                >
                  <Navigation size={24} strokeWidth={2} className="text-gold-500" />
                  <span className="text-[18px] font-semibold text-white">Alternate Location</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { hapticMedium(); setNavPopupOpen(false); }}
                  className="flex items-center gap-4 px-5 py-5 rounded-2xl bg-bg-tertiary border border-separator active:bg-white/5 transition-colors"
                >
                  <Navigation size={24} strokeWidth={2} className="text-gold-500" />
                  <span className="text-[18px] font-semibold text-white">Staging</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Responders bottom sheet */}
      <AnimatePresence>
        {respondersSheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 flex flex-col justify-end"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={() => setRespondersSheetOpen(false)} />
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="relative bg-bg-secondary rounded-t-3xl w-full flex flex-col safe-area-bottom"
              style={{ height: "80vh" }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-9 h-1 rounded-full bg-white/20" />
              </div>
              <div className="flex items-center justify-between px-5 pt-2 pb-3">
                <h2 className="text-[20px] font-bold text-white">Responders</h2>
                <button
                  onClick={() => { hapticLight(); setRespondersSheetOpen(false); }}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20 transition-colors"
                >
                  <X size={16} strokeWidth={2.5} className="text-text-tertiary" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-24">
                {responders.length === 0 ? (
                  <p className="text-[14px] text-text-tertiary text-center py-8">No responders yet</p>
                ) : (
                  <div className="bg-bg-tertiary rounded-2xl divide-y divide-separator">
                    {responders.map((r, i) => {
                      const statusColor = r.status === "On Scene"
                        ? "text-ios-green"
                        : r.status === "En Route"
                          ? "text-ios-blue"
                          : r.status === "Responding"
                            ? "text-gold-500"
                            : r.status === "Staging"
                              ? "text-ios-orange"
                              : "text-ios-red";
                      return (
                        <div key={i} className="flex items-center px-4 py-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-[15px] text-white font-medium">{r.name}</p>
                            <p className="text-[12px] text-text-tertiary">{r.role}</p>
                          </div>
                          <span className={`text-[13px] font-medium ${statusColor}`}>{r.status}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Alert Chat overlay */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="absolute inset-0 z-[60] bg-background flex flex-col"
          >
            {/* Status bar spacer */}
            <div className="h-5 safe-area-top" />
            {/* Chat nav bar */}
            <div className="flex items-center gap-1 px-2 pb-2 border-b border-separator">
              <button
                onClick={() => { hapticLight(); setChatOpen(false); }}
                className="flex items-center gap-0.5 text-gold-500 active:text-gold-600 transition-colors px-2 py-2 -ml-1"
              >
                <ChevronLeft size={20} strokeWidth={2} />
                <span className="text-[15px]">Back</span>
              </button>
              <div className="flex-1 text-center">
                <p className="text-[15px] font-semibold text-white">Alert Chat</p>
                <p className="text-[11px] text-text-tertiary">{chatMessages.length} messages</p>
              </div>
              <div className="w-16" />
            </div>
            {/* Messages */}
            <div ref={chatScrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[11px] font-medium ${msg.isMe ? "text-gold-500" : "text-text-tertiary"}`}>{msg.sender}</span>
                    <span className="text-[10px] text-text-tertiary">{msg.time}</span>
                  </div>
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl ${
                    msg.isMe
                      ? "bg-gold-500 text-white rounded-br-md"
                      : "bg-bg-secondary text-white rounded-bl-md"
                  }`}>
                    <p className="text-[14px] leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Input bar */}
            <div className="shrink-0 border-t border-separator px-4 pt-3 pb-3 safe-area-bottom bg-background">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendChatMessage(); }}
                  placeholder="Message..."
                  className="flex-1 bg-bg-secondary text-white text-[15px] rounded-full px-4 py-2.5 placeholder:text-text-tertiary outline-none border border-separator focus:border-gold-500/50 transition-colors"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={sendChatMessage}
                  className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center active:bg-gold-600 transition-colors"
                >
                  <Send size={18} strokeWidth={2} className="text-white ml-0.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
