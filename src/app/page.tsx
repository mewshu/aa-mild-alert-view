"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Search, SquarePen, MessageSquare } from "lucide-react";
import TabBar from "@/components/TabBar";

type Alert = {
  id: string;
  title: string;
  address: string;
  time: string;
  respondersOnScene: number;
  respondersTotal: number;
  priority?: "high" | "medium" | "low";
};

type Agency = {
  id: string;
  name: string;
  alerts: Alert[];
};

const MOCK_AGENCIES: Agency[] = [
  {
    id: "1",
    name: "Saltillo Fire",
    alerts: [
      {
        id: "s1",
        title: "Vehicle Accident",
        address: "Carr. Saltillo-Monterrey Km 12",
        time: "11:22",
        respondersOnScene: 4,
        respondersTotal: 6,
        priority: "high",
      },
      {
        id: "s2",
        title: "Brush Fire",
        address: "Sierra Madre Oriental Trail",
        time: "08:15",
        respondersOnScene: 2,
        respondersTotal: 5,
        priority: "medium",
      },
    ],
  },
  {
    id: "2",
    name: "Comms Test Account",
    alerts: [
      {
        id: "c1",
        title: "Radio Check",
        address: "Station 4 - Tower B",
        time: "13:00",
        respondersOnScene: 1,
        respondersTotal: 1,
        priority: "low",
      },
    ],
  },
  {
    id: "3",
    name: "BFFD #1",
    alerts: [
      {
        id: "a1",
        title: "Alert Test",
        address: "517 N 19th St",
        time: "09:54",
        respondersOnScene: 3,
        respondersTotal: 3,
        priority: "low",
      },
      {
        id: "a2",
        title: "Structure Fire",
        address: "726 E 2nd St",
        time: "14:35",
        respondersOnScene: 2,
        respondersTotal: 9,
        priority: "high",
      },
      {
        id: "a3",
        title: "Medical Emergency",
        address: "1200 W Main St",
        time: "15:12",
        respondersOnScene: 1,
        respondersTotal: 4,
        priority: "high",
      },
    ],
  },
  {
    id: "4",
    name: "Saltillo FD",
    alerts: [
      {
        id: "sf1",
        title: "Gas Leak",
        address: "Blvd. Venustiano Carranza 450",
        time: "10:03",
        respondersOnScene: 3,
        respondersTotal: 4,
        priority: "high",
      },
      {
        id: "sf2",
        title: "Welfare Check",
        address: "Col. República 112",
        time: "07:45",
        respondersOnScene: 2,
        respondersTotal: 2,
        priority: "low",
      },
      {
        id: "sf3",
        title: "Dumpster Fire",
        address: "Av. Universidad 900",
        time: "12:30",
        respondersOnScene: 1,
        respondersTotal: 3,
        priority: "medium",
      },
    ],
  },
  {
    id: "5",
    name: "Bomberos Queretaro",
    alerts: [
      {
        id: "bq1",
        title: "Warehouse Fire",
        address: "Parque Industrial Benito Juárez",
        time: "06:48",
        respondersOnScene: 7,
        respondersTotal: 12,
        priority: "high",
      },
      {
        id: "bq2",
        title: "Water Rescue",
        address: "Río Querétaro - Puente Josefa",
        time: "16:20",
        respondersOnScene: 3,
        respondersTotal: 5,
        priority: "high",
      },
    ],
  },
  {
    id: "6",
    name: "Test Agency - MEA - 01",
    alerts: [
      {
        id: "m1",
        title: "Smoke Investigation",
        address: "4501 Industrial Pkwy",
        time: "11:55",
        respondersOnScene: 2,
        respondersTotal: 3,
        priority: "medium",
      },
    ],
  },
  {
    id: "7",
    name: "Daniel Strub Test Agency!",
    alerts: [
      {
        id: "ds1",
        title: "Carbon Monoxide Alarm",
        address: "822 Elm St Apt 3B",
        time: "22:10",
        respondersOnScene: 2,
        respondersTotal: 4,
        priority: "high",
      },
      {
        id: "ds2",
        title: "Lift Assist",
        address: "Sunrise Senior Living",
        time: "14:05",
        respondersOnScene: 2,
        respondersTotal: 2,
        priority: "low",
      },
    ],
  },
  {
    id: "8",
    name: "Kendra's Test Agency",
    alerts: [
      {
        id: "k1",
        title: "MVA - Entrapment",
        address: "I-65 Southbound MM 142",
        time: "17:33",
        respondersOnScene: 5,
        respondersTotal: 8,
        priority: "high",
      },
      {
        id: "k2",
        title: "Automatic Fire Alarm",
        address: "Jefferson High School",
        time: "09:20",
        respondersOnScene: 0,
        respondersTotal: 4,
        priority: "medium",
      },
      {
        id: "k3",
        title: "Chest Pain",
        address: "3310 Oak Ridge Dr",
        time: "19:45",
        respondersOnScene: 2,
        respondersTotal: 3,
        priority: "high",
      },
    ],
  },
  {
    id: "9",
    name: "JM Test QA",
    alerts: [
      {
        id: "jm1",
        title: "Hazmat Spill",
        address: "Rt. 31 & County Rd 200",
        time: "13:18",
        respondersOnScene: 4,
        respondersTotal: 7,
        priority: "high",
      },
    ],
  },
  {
    id: "10",
    name: "Tippecanoe Twp VFD",
    alerts: [
      {
        id: "t1",
        title: "Barn Fire",
        address: "8800 N 400 W",
        time: "05:30",
        respondersOnScene: 6,
        respondersTotal: 10,
        priority: "high",
      },
      {
        id: "t2",
        title: "Allergic Reaction",
        address: "Tippecanoe Mall Food Court",
        time: "12:15",
        respondersOnScene: 2,
        respondersTotal: 3,
        priority: "medium",
      },
      {
        id: "t3",
        title: "Tree on Power Line",
        address: "County Rd 350 S",
        time: "20:00",
        respondersOnScene: 0,
        respondersTotal: 4,
        priority: "medium",
      },
    ],
  },
];

function PriorityIndicator({ priority }: { priority?: "high" | "medium" | "low" }) {
  if (!priority) return null;
  const colors = {
    high: "bg-ios-red",
    medium: "bg-ios-orange",
    low: "bg-ios-green",
  };
  return <span className={`w-2 h-2 rounded-full ${colors[priority]} shrink-0`} />;
}

function AlertRow({ alert }: { alert: Alert }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      className="px-4 py-3 flex items-start gap-3 active:bg-white/5 transition-colors"
    >
      <div className="mt-1.5">
        <PriorityIndicator priority={alert.priority} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-white leading-tight">
          {alert.title}
        </p>
        <p className="text-[13px] text-text-secondary mt-0.5 leading-tight">
          {alert.address}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[13px] text-text-secondary tabular-nums">
          {alert.time}
        </p>
        <p className="text-[13px] text-text-secondary tabular-nums mt-0.5">
          <span className="text-white font-medium">{alert.respondersOnScene}</span>
          <span className="text-text-tertiary">/{alert.respondersTotal}</span>
        </p>
      </div>
      <button className="mt-1 shrink-0 text-battalion-500 active:text-gold-500 transition-colors">
        <MessageSquare size={20} strokeWidth={1.8} />
      </button>
    </motion.div>
  );
}

function AgencySection({ agency }: { agency: Agency }) {
  const hasAlerts = agency.alerts.length > 0;
  const [expanded, setExpanded] = useState(hasAlerts);

  return (
    <div className="overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 active:bg-white/5 transition-colors"
      >
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          className="text-battalion-500 shrink-0"
        >
          <ChevronRight size={12} strokeWidth={2.2} />
        </motion.div>
        <span className="text-[15px] font-medium text-white flex-1 text-left">
          {agency.name}
        </span>
        {hasAlerts && (
          <span className="text-[13px] text-text-secondary bg-bg-tertiary px-2 py-0.5 rounded-full tabular-nums">
            {agency.alerts.length}
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && hasAlerts && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="ml-7 border-l border-separator">
              {agency.alerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AlertsPage() {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Status bar spacer */}
      <div className="h-12 safe-area-top" />

      {/* Navigation bar */}
      <div className="flex items-center justify-between px-4 pb-2">
        <div className="w-10" />
        <h1 className="text-[17px] font-semibold text-white">Alerts</h1>
        <button className="w-10 h-10 flex items-center justify-center text-gold-500">
          <SquarePen size={22} strokeWidth={1.8} />
        </button>
      </div>

      {/* Search bar */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 bg-bg-secondary rounded-xl px-3 py-2">
          <Search size={16} strokeWidth={2} className="text-battalion-500 shrink-0" />
          <span className="text-[15px] text-text-tertiary">Search agencies or alerts</span>
        </div>
      </div>

      {/* Agency list */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="mx-4 bg-bg-secondary rounded-2xl overflow-hidden divide-y divide-separator">
          {MOCK_AGENCIES.map((agency) => (
            <AgencySection key={agency.id} agency={agency} />
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <TabBar activeTab="alerts" />
    </div>
  );
}
