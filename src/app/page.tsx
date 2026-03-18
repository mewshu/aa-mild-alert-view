"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Search, SquarePen, MessageSquare } from "lucide-react";
import TabBar from "@/components/TabBar";
import AlertDetail, { type AlertDetailData } from "@/components/AlertDetail";

type Alert = {
  id: string;
  title: string;
  address: string;
  city: string;
  time: string;
  date: string;
  respondersOnScene: number;
  respondersTotal: number;
  priority?: "high" | "medium" | "low";
  source: string;
  alertNumber: string;
  gps: string;
  details?: string;
  callNotes?: { author: string; time: string; text: string }[];
  nearestMarkers: { name: string; distance: string; color: string }[];
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
        city: "Saltillo, MX",
        time: "11:22",
        date: "Mar 18, 2026",
        respondersOnScene: 4,
        respondersTotal: 6,
        priority: "high",
        source: "CAD Dispatch (Saltillo Central)",
        alertNumber: "608401122",
        gps: "25.422300, -100.992200",
        callNotes: [
          { author: "Dispatch", time: "11:22", text: "2-vehicle MVA, rollover reported. Possible entrapment driver side." },
          { author: "E12 Capt. Morales", time: "11:28", text: "On scene. One vehicle on its side, second vehicle in ditch. Requesting extrication tools." },
          { author: "Dispatch", time: "11:31", text: "Medic 4 en route. ETA 6 min." },
          { author: "E12 Capt. Morales", time: "11:35", text: "Patient extricated. Conscious, leg injury. Setting up LZ for helo just in case." },
        ],
        nearestMarkers: [
          { name: "Hydrant KM12-A", distance: "85 ft", color: "#FF3B30" },
          { name: "Staging Area North", distance: "320 ft", color: "#FF9500" },
        ],
      },
      {
        id: "s2",
        title: "Brush Fire",
        address: "Sierra Madre Oriental Trail",
        city: "Saltillo, MX",
        time: "08:15",
        date: "Mar 18, 2026",
        respondersOnScene: 2,
        respondersTotal: 5,
        priority: "medium",
        source: "Citizen Report (Active911 971500)",
        alertNumber: "608400815",
        gps: "25.380100, -100.950400",
        callNotes: [
          { author: "Dispatch", time: "08:15", text: "Brush fire reported along hiking trail. Estimated 1/4 acre. Wind pushing east toward residential." },
          { author: "E5 FF Torres", time: "08:30", text: "Fire is in heavy brush, 30% contained. Requesting water tender to trail access gate." },
        ],
        nearestMarkers: [
          { name: "Trail Access Gate", distance: "150 ft", color: "#34C759" },
        ],
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
        city: "Test City, TX",
        time: "13:00",
        date: "Mar 18, 2026",
        respondersOnScene: 1,
        respondersTotal: 1,
        priority: "low",
        source: "System Test (Active911 971510)",
        alertNumber: "608401300",
        gps: "32.751200, -97.330500",
        callNotes: [
          { author: "Dispatch", time: "13:00", text: "Scheduled radio check. All units verify signal on TAC-2." },
          { author: "Station 4", time: "13:02", text: "Tower B loud and clear. System check complete." },
        ],
        nearestMarkers: [],
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
        city: "Philomath, OR",
        time: "09:54",
        date: "Mar 3, 2026",
        respondersOnScene: 3,
        respondersTotal: 3,
        priority: "low",
        source: "Joshua Muse on test agency (Active911 971522)",
        alertNumber: "608326313",
        gps: "44.542946, -123.358154",
        callNotes: [
          { author: "J. Muse", time: "09:54", text: "Test alert — verifying push notification delivery and map overlay rendering." },
          { author: "J. Muse", time: "09:56", text: "Confirmed delivery on all 3 devices. Overlay markers displaying correctly." },
        ],
        nearestMarkers: [
          { name: "hello", distance: "204 ft", color: "#3478F6" },
          { name: "testing overlay", distance: "205 ft", color: "#34C759" },
          { name: "Ambo access", distance: "207 ft", color: "#34C759" },
          { name: "test", distance: "211 ft", color: "#FF3B30" },
          { name: "Lopez test 1", distance: "234 ft", color: "#FF9500" },
        ],
      },
      {
        id: "a2",
        title: "Structure Fire",
        address: "726 E 2nd St",
        city: "Philomath, OR",
        time: "14:35",
        date: "Mar 18, 2026",
        respondersOnScene: 2,
        respondersTotal: 9,
        priority: "high",
        source: "CAD Dispatch (Benton County)",
        alertNumber: "608401435",
        gps: "44.540120, -123.362800",
        details: "2-story residential, smoke showing from second floor. Occupants reported trapped.",
        callNotes: [
          { author: "Dispatch", time: "14:02", text: "Caller reports heavy smoke from upstairs windows. 2 adults and 1 child may still be inside." },
          { author: "BC3 Chief Allen", time: "14:08", text: "Arriving on scene. Smoke showing B/C side. Establishing command. Striking 2nd alarm." },
          { author: "E7 Lt. Reeves", time: "14:11", text: "Primary search in progress. Found 1 occupant 2nd floor bedroom, removing now." },
          { author: "Dispatch", time: "14:14", text: "Remaining occupants confirmed out — neighbor has visual. Updating to 2 accounted for." },
          { author: "E7 Lt. Reeves", time: "14:18", text: "All clear on primary. Fire knocked down in bedroom of origin. Checking for extension." },
        ],
        nearestMarkers: [
          { name: "Hydrant E2-7", distance: "110 ft", color: "#FF3B30" },
          { name: "FDC Connection", distance: "185 ft", color: "#FF9500" },
        ],
      },
      {
        id: "a3",
        title: "Medical Emergency",
        address: "1200 W Main St",
        city: "Philomath, OR",
        time: "15:12",
        date: "Mar 18, 2026",
        respondersOnScene: 1,
        respondersTotal: 4,
        priority: "high",
        source: "911 Caller (Active911 971522)",
        alertNumber: "608401512",
        gps: "44.541800, -123.370100",
        details: "Chest pain, difficulty breathing. Patient is 67M, conscious and alert.",
        callNotes: [
          { author: "Dispatch", time: "14:45", text: "67 y/o male, crushing chest pain onset 20 min ago. Hx of MI. Wife on scene, gave aspirin." },
          { author: "M3 Paramedic Diaz", time: "14:52", text: "On scene. 12-lead showing ST elevation. Administering nitro. Transporting to Good Sam." },
        ],
        nearestMarkers: [
          { name: "AED Location", distance: "45 ft", color: "#34C759" },
        ],
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
        city: "Saltillo, MX",
        time: "10:03",
        date: "Mar 18, 2026",
        respondersOnScene: 3,
        respondersTotal: 4,
        priority: "high",
        source: "Gas Company Report (Naturgy)",
        alertNumber: "608401003",
        gps: "25.425100, -100.999800",
        details: "Commercial building, strong gas odor reported. Area evacuated 50m radius.",
        callNotes: [
          { author: "Dispatch", time: "10:03", text: "Naturgy reports gas odor at commercial address. Building manager evacuating occupants." },
          { author: "E2 Capt. Delgado", time: "10:12", text: "On scene. Confirmed LEL readings at 15% near south wall. Shutoff valve located and secured." },
          { author: "Dispatch", time: "10:18", text: "Naturgy tech en route, ETA 20 min. Maintain perimeter until utility clears scene." },
        ],
        nearestMarkers: [
          { name: "Gas Shutoff Valve", distance: "30 ft", color: "#FF9500" },
        ],
      },
      {
        id: "sf2",
        title: "Welfare Check",
        address: "Col. República 112",
        city: "Saltillo, MX",
        time: "07:45",
        date: "Mar 18, 2026",
        respondersOnScene: 2,
        respondersTotal: 2,
        priority: "low",
        source: "Neighbor Report (Active911 971530)",
        alertNumber: "608400745",
        gps: "25.419800, -100.988300",
        callNotes: [
          { author: "Dispatch", time: "07:45", text: "Neighbor reports elderly resident hasn't been seen in 2 days. Mail piling up. No answer at door." },
          { author: "E3 Lt. Garza", time: "07:58", text: "Contact made through window. Resident is mobile but had a fall. Requesting medic for eval." },
        ],
        nearestMarkers: [],
      },
      {
        id: "sf3",
        title: "Dumpster Fire",
        address: "Av. Universidad 900",
        city: "Saltillo, MX",
        time: "12:30",
        date: "Mar 18, 2026",
        respondersOnScene: 1,
        respondersTotal: 3,
        priority: "medium",
        source: "Security Guard (Active911 971530)",
        alertNumber: "608401230",
        gps: "25.430200, -101.002100",
        callNotes: [
          { author: "Dispatch", time: "12:30", text: "Security guard reports dumpster fire behind university building. Not threatening structures." },
          { author: "E6 FF Rios", time: "12:38", text: "Knocked down. Appears to be improperly discarded ashes. No extension." },
        ],
        nearestMarkers: [],
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
        city: "Querétaro, MX",
        time: "06:48",
        date: "Mar 18, 2026",
        respondersOnScene: 7,
        respondersTotal: 12,
        priority: "high",
        source: "CAD Dispatch (Querétaro Central)",
        alertNumber: "608400648",
        gps: "20.620300, -100.406700",
        details: "Large warehouse fully involved. Multiple exposures. 2nd alarm requested.",
        callNotes: [
          { author: "Dispatch", time: "06:48", text: "Multiple 911 calls. Large commercial structure fully involved. Flames visible from highway." },
          { author: "BC1 Chief Herrera", time: "06:55", text: "Defensive operations only. Building is a loss. Protecting exposure Delta side — adjacent warehouse 50ft away." },
          { author: "Dispatch", time: "07:02", text: "2nd alarm companies staged at Lot B. Water supply established from PI-12." },
          { author: "BC1 Chief Herrera", time: "07:20", text: "Exposure protected. Fire darkening down. Collapse hazard — no entry. Requesting fire investigator." },
        ],
        nearestMarkers: [
          { name: "Hydrant PI-12", distance: "200 ft", color: "#FF3B30" },
          { name: "Staging Lot B", distance: "450 ft", color: "#FF9500" },
        ],
      },
      {
        id: "bq2",
        title: "Water Rescue",
        address: "Río Querétaro - Puente Josefa",
        city: "Querétaro, MX",
        time: "16:20",
        date: "Mar 18, 2026",
        respondersOnScene: 3,
        respondersTotal: 5,
        priority: "high",
        source: "Police Transfer (Active911 971540)",
        alertNumber: "608401620",
        gps: "20.593100, -100.392500",
        details: "Person in swift water. Bystanders on scene attempting rope throw.",
        callNotes: [
          { author: "Dispatch", time: "16:20", text: "PD on scene reports person clinging to bridge piling in swift current. Bystander rope throw unsuccessful." },
          { author: "Rescue 1 Lt. Vega", time: "16:28", text: "Deploying inflatable from boat launch. Current is strong — estimating 8-10 knots. Setting downstream safety." },
          { author: "Rescue 1 Lt. Vega", time: "16:35", text: "Patient retrieved. Hypothermic but conscious. Handing off to medics on bank." },
        ],
        nearestMarkers: [
          { name: "Boat Launch", distance: "340 ft", color: "#3478F6" },
        ],
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
        city: "Lafayette, IN",
        time: "11:55",
        date: "Mar 18, 2026",
        respondersOnScene: 2,
        respondersTotal: 3,
        priority: "medium",
        source: "CAD Dispatch (Tippecanoe County)",
        alertNumber: "608401155",
        gps: "40.417800, -86.875400",
        callNotes: [
          { author: "Dispatch", time: "11:55", text: "Employees report intermittent smoke smell in warehouse section C. No visible smoke or flame." },
          { author: "E4 Capt. Miller", time: "12:05", text: "Investigating. Found overheating HVAC motor in ceiling unit. Secured power. No fire. Building maintenance notified." },
        ],
        nearestMarkers: [],
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
        city: "West Lafayette, IN",
        time: "22:10",
        date: "Mar 17, 2026",
        respondersOnScene: 2,
        respondersTotal: 4,
        priority: "high",
        source: "Alarm Company (SimpliSafe)",
        alertNumber: "608402210",
        gps: "40.425900, -86.908100",
        details: "CO alarm activation, 3rd floor apartment. 2 occupants, no symptoms reported yet.",
        callNotes: [
          { author: "Dispatch", time: "22:10", text: "SimpliSafe reports CO alarm activation. 2 occupants sheltering in hallway. No symptoms." },
          { author: "E9 Lt. Novak", time: "22:18", text: "Meter reading 35 ppm in kitchen area. Source appears to be malfunctioning furnace. Ventilating." },
          { author: "E9 Lt. Novak", time: "22:25", text: "Readings clearing. Gas company shutting down furnace. Occupants cleared by medics — no transport needed." },
        ],
        nearestMarkers: [
          { name: "Gas Meter", distance: "15 ft", color: "#FF9500" },
        ],
      },
      {
        id: "ds2",
        title: "Lift Assist",
        address: "Sunrise Senior Living",
        city: "Lafayette, IN",
        time: "14:05",
        date: "Mar 18, 2026",
        respondersOnScene: 2,
        respondersTotal: 2,
        priority: "low",
        source: "Facility Staff (Active911 971550)",
        alertNumber: "608401405",
        gps: "40.411200, -86.893700",
        callNotes: [
          { author: "Dispatch", time: "14:05", text: "Facility staff requesting lift assist. 82 y/o female, fall in room 214. Conscious, no apparent injuries." },
          { author: "E8 FF Banks", time: "14:12", text: "Patient assisted back to bed. Vitals stable. Staff will monitor. No transport." },
        ],
        nearestMarkers: [],
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
        city: "Lebanon, IN",
        time: "17:33",
        date: "Mar 18, 2026",
        respondersOnScene: 5,
        respondersTotal: 8,
        priority: "high",
        source: "ISP Dispatch (Active911 971560)",
        alertNumber: "608401733",
        gps: "40.048700, -86.469200",
        details: "Multi-vehicle accident, 1 confirmed entrapment. Extrication tools requested.",
        callNotes: [
          { author: "Dispatch", time: "17:33", text: "ISP reports multi-vehicle accident SB I-65 at MM 142. At least 1 entrapment. Traffic backed up 2 miles." },
          { author: "R3 Capt. Walsh", time: "17:40", text: "3 vehicles involved. Minivan driver pinned by dashboard. Starting extrication with spreaders." },
          { author: "M7 Paramedic Chen", time: "17:44", text: "2 walking wounded triaged green. Entrapped patient alert, complaining of bilateral leg pain." },
          { author: "R3 Capt. Walsh", time: "17:52", text: "Patient freed. Packaging for transport to St. Elizabeth trauma center." },
        ],
        nearestMarkers: [
          { name: "MM 142 Access", distance: "50 ft", color: "#34C759" },
          { name: "Median Crossover", distance: "800 ft", color: "#FF9500" },
        ],
      },
      {
        id: "k2",
        title: "Automatic Fire Alarm",
        address: "Jefferson High School",
        city: "Lafayette, IN",
        time: "09:20",
        date: "Mar 18, 2026",
        respondersOnScene: 0,
        respondersTotal: 4,
        priority: "medium",
        source: "Alarm Company (Honeywell)",
        alertNumber: "608400920",
        gps: "40.419500, -86.881200",
        callNotes: [
          { author: "Dispatch", time: "09:20", text: "Honeywell monitoring reports automatic fire alarm, north wing pull station. School in session." },
          { author: "E1 Lt. Park", time: "09:27", text: "On scene. Building evacuated. Investigating — no smoke, no heat. Appears to be accidental pull. Resetting system." },
        ],
        nearestMarkers: [
          { name: "FDC - North Wing", distance: "120 ft", color: "#FF3B30" },
          { name: "Knox Box", distance: "8 ft", color: "#3478F6" },
        ],
      },
      {
        id: "k3",
        title: "Chest Pain",
        address: "3310 Oak Ridge Dr",
        city: "Lafayette, IN",
        time: "19:45",
        date: "Mar 18, 2026",
        respondersOnScene: 2,
        respondersTotal: 3,
        priority: "high",
        source: "911 Caller (Active911 971560)",
        alertNumber: "608401945",
        gps: "40.405300, -86.862100",
        details: "55F, crushing chest pain radiating to left arm. History of cardiac issues.",
        callNotes: [
          { author: "Dispatch", time: "19:45", text: "55 y/o female, crushing chest pain radiating to left arm. Hx of cardiac stents. Husband on scene." },
          { author: "M2 Paramedic Webb", time: "19:53", text: "12-lead showing inferior STEMI. Aspirin and nitro administered. Activating cath lab at St. Elizabeth." },
          { author: "M2 Paramedic Webb", time: "20:01", text: "En route to St. Elizabeth. Patient stable, pain decreasing. ETA 8 min." },
        ],
        nearestMarkers: [],
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
        city: "Kokomo, IN",
        time: "13:18",
        date: "Mar 18, 2026",
        respondersOnScene: 4,
        respondersTotal: 7,
        priority: "high",
        source: "DOT Report (Active911 971570)",
        alertNumber: "608401318",
        gps: "40.486700, -86.133800",
        details: "Overturned tanker, unknown substance leaking. 500ft perimeter established.",
        callNotes: [
          { author: "Dispatch", time: "13:18", text: "DOT reports overturned tanker at intersection. Unknown liquid leaking from saddle tank. Placard 1203 — gasoline." },
          { author: "HM1 Lt. Crawford", time: "13:30", text: "500ft perimeter established. Product is gasoline, flowing toward storm drain. Deploying absorbent boom." },
          { author: "Dispatch", time: "13:38", text: "EPA notified. Tanker company sending recovery crew. ETA 45 min." },
          { author: "HM1 Lt. Crawford", time: "13:50", text: "Flow contained before reaching drain. Approximately 200 gallons spilled. Air monitoring clear at perimeter." },
        ],
        nearestMarkers: [
          { name: "Storm Drain", distance: "90 ft", color: "#FF3B30" },
          { name: "Creek Access", distance: "400 ft", color: "#3478F6" },
        ],
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
        city: "West Lafayette, IN",
        time: "05:30",
        date: "Mar 18, 2026",
        respondersOnScene: 6,
        respondersTotal: 10,
        priority: "high",
        source: "Property Owner (Active911 971580)",
        alertNumber: "608400530",
        gps: "40.478900, -86.932400",
        details: "Large pole barn fully involved. Livestock inside. No exposures within 200ft.",
        callNotes: [
          { author: "Dispatch", time: "05:30", text: "Property owner reports barn fully involved. Livestock (cattle) may be inside. Nearest hydrant 2+ miles." },
          { author: "E14 Capt. Brennan", time: "05:42", text: "Confirmed fully involved 60x120 pole barn. Setting up draft from pond on south side. Defensive only." },
          { author: "Dispatch", time: "05:48", text: "Mutual aid tanker from Romney en route. Animal control notified." },
          { author: "E14 Capt. Brennan", time: "06:10", text: "Barn is a total loss. Owner confirms 3 head of cattle were inside. No exposures threatened. Overhaul in progress." },
        ],
        nearestMarkers: [
          { name: "Pond - Draft Site", distance: "180 ft", color: "#3478F6" },
          { name: "Driveway Gate", distance: "350 ft", color: "#34C759" },
        ],
      },
      {
        id: "t2",
        title: "Allergic Reaction",
        address: "Tippecanoe Mall Food Court",
        city: "Lafayette, IN",
        time: "12:15",
        date: "Mar 18, 2026",
        respondersOnScene: 2,
        respondersTotal: 3,
        priority: "medium",
        source: "Mall Security (Active911 971580)",
        alertNumber: "608401215",
        gps: "40.382100, -86.867500",
        callNotes: [
          { author: "Dispatch", time: "12:15", text: "Mall security reports allergic reaction at food court. 28 y/o female, difficulty breathing, hives. Epi-pen administered by bystander." },
          { author: "M5 Paramedic Torres", time: "12:22", text: "Patient responsive, epi effective. Administering Benadryl IV. Transporting to Franciscan for observation." },
        ],
        nearestMarkers: [
          { name: "AED - Food Court", distance: "25 ft", color: "#34C759" },
        ],
      },
      {
        id: "t3",
        title: "Tree on Power Line",
        address: "County Rd 350 S",
        city: "Lafayette, IN",
        time: "20:00",
        date: "Mar 18, 2026",
        respondersOnScene: 0,
        respondersTotal: 4,
        priority: "medium",
        source: "Duke Energy (Active911 971580)",
        alertNumber: "608402000",
        gps: "40.370500, -86.912300",
        callNotes: [
          { author: "Dispatch", time: "20:00", text: "Duke Energy reports large tree on power lines. Lines arcing. Road blocked. Crew en route, ETA 90 min." },
          { author: "E11 Lt. Hoffman", time: "20:10", text: "Established perimeter 100ft around downed lines. Road closed both directions. PD handling traffic." },
          { author: "Dispatch", time: "20:15", text: "Duke confirms line de-energized from substation. Safe to reduce perimeter. Crew ETA now 60 min." },
        ],
        nearestMarkers: [],
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

function AlertRow({ alert, onTap }: { alert: Alert; onTap: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      onClick={onTap}
      className="w-full px-4 py-3 flex items-start gap-3 active:bg-white/5 transition-colors text-left"
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
      <div className="mt-1 shrink-0 text-battalion-500">
        <MessageSquare size={20} strokeWidth={1.8} />
      </div>
    </motion.button>
  );
}

function AgencySection({
  agency,
  onAlertTap,
}: {
  agency: Agency;
  onAlertTap: (alert: Alert, agencyName: string) => void;
}) {
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
                <AlertRow
                  key={alert.id}
                  alert={alert}
                  onTap={() => onAlertTap(alert, agency.name)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AlertsPage() {
  const [selectedAlert, setSelectedAlert] = useState<AlertDetailData | null>(null);

  function handleAlertTap(alert: Alert, agencyName: string) {
    setSelectedAlert({ ...alert, agencyName });
  }

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      {/* Status bar spacer */}
      <div className="h-5 safe-area-top" />

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
            <AgencySection
              key={agency.id}
              agency={agency}
              onAlertTap={handleAlertTap}
            />
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <TabBar activeTab="alerts" />

      {/* Alert detail overlay */}
      <AnimatePresence>
        {selectedAlert && (
          <AlertDetail
            alert={selectedAlert}
            onBack={() => setSelectedAlert(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
