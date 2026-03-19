"use client";

import { Bell, Users, Map, MessageSquare, Settings } from "lucide-react";

type Tab = {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

const tabs: Tab[] = [
  {
    id: "alerts",
    label: "Alerts",
    icon: <Bell size={24} strokeWidth={1.8} />,
  },
  {
    id: "personnel",
    label: "Personnel",
    icon: <Users size={24} strokeWidth={1.8} />,
  },
  {
    id: "map",
    label: "Map",
    icon: <Map size={24} strokeWidth={1.8} />,
  },
  {
    id: "chat",
    label: "Chat",
    badge: 5,
    icon: <MessageSquare size={24} strokeWidth={1.8} />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings size={24} strokeWidth={1.8} />,
  },
];

export default function TabBar({ activeTab }: { activeTab: string }) {
  return (
    <div className="fixed bottom-0 w-[390px] z-50">
      <div className="bg-bg-secondary/80 backdrop-blur-2xl border-t border-separator safe-area-bottom">
        <div className="flex items-center justify-around pt-2 pb-1">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                className="flex flex-col items-center gap-0.5 min-w-[64px] py-1"
              >
                <div className="relative">
                  <span className={isActive ? "text-gold-500" : "text-battalion-600"}>
                    {tab.icon}
                  </span>
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-2.5 bg-ios-red text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] ${
                    isActive ? "text-gold-500" : "text-battalion-600"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
