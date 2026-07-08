import { 
  Building2, 
  Scale, 
  Users, 
  HelpCircle,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  BarChart3,
  Lightbulb
} from "lucide-react";

export const DEFAULT_CONSTITUENCY = "Baramati Constituency";
export const DEMO_CITIZEN_ID = "6582f3a4b12c3d4e5f6a7b8c"; // Valid 24-character ObjectId

export const CATEGORIES = [
  {
    id: "infrastructure",
    label: "Infrastructure",
    description: "Roads, water supply, lighting, community halls, etc.",
    icon: Building2,
    color: "from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  },
  {
    id: "policy",
    label: "Policy & Schemes",
    description: "Public welfare suggestions, administrative rules, local schemes.",
    icon: Scale,
    color: "from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20"
  },
  {
    id: "community",
    label: "Community Services",
    description: "Sports centers, local festivals, skill development programs.",
    icon: Users,
    color: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  },
  {
    id: "other",
    label: "Other Matters",
    description: "Any other suggestions, grievances, or community feedback.",
    icon: HelpCircle,
    color: "from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-400",
    badgeColor: "bg-slate-500/10 text-slate-400 border-slate-500/20"
  }
] as const;

export const STATUSES = {
  submitted: {
    label: "Submitted",
    description: "Suggestion received and queued for AI analysis.",
    icon: Clock,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/25",
    colorFull: "border-amber-500/30 bg-amber-500/5 text-amber-300"
  },
  under_review: {
    label: "Under Review",
    description: "AI analysis complete. The representative is evaluating feasibility.",
    icon: Eye,
    color: "text-sky-400 bg-sky-500/10 border-sky-500/25",
    colorFull: "border-sky-500/30 bg-sky-500/5 text-sky-300"
  },
  implemented: {
    label: "Implemented",
    description: "Work completed successfully. Project closed.",
    icon: CheckCircle2,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    colorFull: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
  },
  rejected: {
    label: "Rejected / Archived",
    description: "Feasibility review failed or suggestion marked redundant.",
    icon: XCircle,
    color: "text-rose-400 bg-rose-500/10 border-rose-500/25",
    colorFull: "border-rose-500/30 bg-rose-500/5 text-rose-300"
  }
} as const;

export const DASHBOARD_NAV = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3
  },
  {
    title: "AI Recommendations",
    href: "/recommendations",
    icon: Lightbulb
  }
];

// Constituency Mapping Data for Authentic Localized Dropdowns
export const CONSTITUENCIES_MAP = {
  "Baramati Constituency": [
    "Baramati Center",
    "Supe",
    "Malegaon",
    "Nira",
    "Someshwar",
    "Walchandnagar",
    "Vadgaon Nimbalkar",
    "Jejuri"
  ],
  "Mumbai North Constituency": [
    "Borivali",
    "Dahisar",
    "Magathane",
    "Kandivali East",
    "Charkop",
    "Malad West"
  ],
  "Bangalore South Constituency": [
    "Jayanagar",
    "BTM Layout",
    "Padmanabhanagar",
    "Basavanagudi",
    "Chickpet",
    "Vijayanagar"
  ]
} as const;

// Flattened list for default backwards compatibility
export const DEMO_VILLAGES = [
  ...CONSTITUENCIES_MAP["Baramati Constituency"],
  ...CONSTITUENCIES_MAP["Mumbai North Constituency"],
  ...CONSTITUENCIES_MAP["Bangalore South Constituency"]
];

export interface ConstituencyGeo {
  center: [number, number];
  zoom: number;
  villages: Record<string, { lat: number; lng: number }>;
}

export const CONSTITUENCY_GEOGRAPHY: Record<string, ConstituencyGeo> = {
  "Baramati Constituency": {
    center: [18.1568, 74.5000],
    zoom: 11,
    villages: {
      "Baramati Center": { lat: 18.1568, lng: 74.5768 },
      "Supe": { lat: 18.2831, lng: 74.3857 },
      "Malegaon": { lat: 18.1065, lng: 74.5204 },
      "Nira": { lat: 18.0267, lng: 74.2057 },
      "Someshwar": { lat: 18.1638, lng: 74.3411 },
      "Walchandnagar": { lat: 17.9734, lng: 74.8329 },
      "Vadgaon Nimbalkar": { lat: 18.1751, lng: 74.4093 },
      "Jejuri": { lat: 18.2764, lng: 74.1611 }
    }
  },
  "Mumbai North Constituency": {
    center: [19.2288, 72.8541],
    zoom: 12,
    villages: {
      "Borivali": { lat: 19.2307, lng: 72.8567 },
      "Dahisar": { lat: 19.2483, lng: 72.8596 },
      "Magathane": { lat: 19.2238, lng: 72.8624 },
      "Kandivali East": { lat: 19.2104, lng: 72.8722 },
      "Charkop": { lat: 19.2064, lng: 72.8361 },
      "Malad West": { lat: 19.1864, lng: 72.8306 }
    }
  },
  "Bangalore South Constituency": {
    center: [12.9279, 77.6271],
    zoom: 12,
    villages: {
      "Jayanagar": { lat: 12.9299, lng: 77.5824 },
      "BTM Layout": { lat: 12.9166, lng: 77.6101 },
      "Padmanabhanagar": { lat: 12.9182, lng: 77.5584 },
      "Basavanagudi": { lat: 12.9417, lng: 77.5755 },
      "Chickpet": { lat: 12.9719, lng: 77.5781 },
      "Vijayanagar": { lat: 12.9756, lng: 77.5354 }
    }
  }
};
