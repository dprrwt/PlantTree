// Uttarakhand-focused data for PlantTree.life (lean v2)

export type DistrictStatus = "active" | "field-visited" | "researching";
export type Priority = "critical" | "high" | "medium";
export type PhotoTone = "moss" | "terra" | "neutral";

export interface District {
  id: string;
  name: string;
  elevation: string;
  x: number;
  y: number;
  summary: string;
  soil: string;
  rainfall: string;
  species: string[];
  why: string;
  treesPlanted: number;
  farmers: number;
  priority: Priority;
  status: DistrictStatus;
  activeSince: string | null;
  history: string;
  canopy: number;
  fireRisk: string;
  fieldNotes: string;
}

export interface Farmer {
  id: string;
  name: string;
  village: string;
  districtId: string;
  plotIds?: string[];        // ids of plots this farmer tends (primary or co-steward)
  upi: string;
  phone: string;
  years: number;
  treesPlanted: number;
  treesAlive: number;
  donorsThisYear: number;
  plot: string;
  quote: string;
  quoteEn: string;
  plants: string[];
  rate: number;
  rateCare: number;
  pendingTrees: number;
  photoTone: PhotoTone;
  verifiedBy: string;
}

export interface TreePhoto {
  date: string;
  caption: string;
  by: string;
}

export interface TreeMilestone {
  date: string;
  label: string;
  done: boolean;
  by?: string;
}

export interface Tree {
  id: string;
  species: string;
  sci: string;
  farmerId: string;
  districtId: string;
  plotId?: string;
  planted: string;
  paid: number;
  stage: 0 | 1 | 2 | 3 | 4;
  height: number;
  health: number;
  lastUpdate: string;
  photos?: TreePhoto[];
  milestones?: TreeMilestone[];
}

export type LandTenure = "private" | "van-panchayat" | "community" | "lease";
export type PlotStatus = "researching" | "field-visited" | "planting";

export interface PlotSoil {
  N: number;
  P: number;
  K: number;
  pH: number;
  OM: number;
}

export interface Plot {
  id: string;
  name: string;                // local-script: "Naula ke Paas"
  nameEn: string;              // English subtitle: "Near the spring"
  primaryFarmerId: string;
  coFarmers: string[];
  village: string;
  districtId: string;
  lat: number | null;
  lng: number | null;
  areaHa: number;
  elevationM: number;
  slopeDeg: number;
  aspect: string | null;
  waterSource: string | null;
  landTenure: LandTenure;
  panchayatVerified: boolean;
  soil: PlotSoil | null;
  status: PlotStatus;
  joinedAt: string | null;
  treesPlanted: number;
  treesAlive: number;
  description: string | null;
  photoTone: PhotoTone | null;
}

export interface Grove {
  name: string;
  joined: string;
  total: number;
  totalPaid: number;
  trees: Tree[];
}

export type MessageKind = "text" | "photo" | "thread-open" | "planting" | "milestone";

export interface Message {
  id: string;
  from: "donor" | "farmer" | "system";
  time: string;
  kind: MessageKind;
  text?: string;
  caption?: string;
  photoTone?: PhotoTone;
}

export interface Thread {
  treeId: string;
  donor: string;
  farmerId: string;
  messages: Message[];
}

export interface FarmerTree {
  id: string;
  donor: string;
  species: string;
  planted: string | null;
  lastUpdate: string;
  height: number;
  health: number | null;
  unread: number;
  needsUpdate?: boolean;
  awaitingPlant?: boolean;
}

export interface Earning {
  id: string;
  date: string;
  donor: string;
  amount: number;
  tree: string;
  kind: "plant only" | "plant + care" | "grove";
}

export interface FarmerInbox {
  farmerId: string;
  pendingUpdates: number;
  newMessages: number;
  trees: FarmerTree[];
  earnings: Earning[];
}

export const DISTRICTS: District[] = [
  {
    id: "almora",
    name: "Almora",
    elevation: "1,650 m",
    x: 62,
    y: 48,
    summary:
      "Banj oak forests being lost to flammable chir pine — and with them, the springs.",
    soil: "Brown forest soil, mid-slope",
    rainfall: "1,100 mm · monsoon-fed",
    species: ["Banj oak", "Buransh", "Kafal"],
    why: "Banj oak (Quercus leucotrichophora) holds groundwater. Where oak is replaced by chir pine, naula springs go dry within a generation.",
    treesPlanted: 1840,
    farmers: 6,
    priority: "high",
    status: "active",
    activeSince: "Mar 2024",
    history:
      "Once dense banj oak forest, replaced post-1960s by chir pine for resin tapping. Local naula springs began drying by the early 2000s. Communities have organized Van Panchayats to reverse this.",
    canopy: 32,
    fireRisk: "low (oak canopy returning)",
    fieldNotes:
      "Visited Feb ' Apr & Sep 2024, Mar 2025. Sunita-ji's plot is the most established — used as reference site for the rest of the district.",
  },
  {
    id: "bageshwar",
    name: "Bageshwar",
    elevation: "1,000 m",
    x: 72,
    y: 36,
    summary: "Reviving sacred groves around naula springs that feed three valleys.",
    soil: "Loamy, terraced",
    rainfall: "1,400 mm",
    species: ["Buransh", "Tilonj oak", "Kharsu oak"],
    why: "Mixed oak forests above villages directly recharge stone-cut spring channels — the only year-round water source for upper-Himalayan hamlets.",
    treesPlanted: 920,
    farmers: 3,
    priority: "high",
    status: "field-visited",
    activeSince: "Oct 2025",
    history:
      "Sacred groves (devta van) kept these slopes forested even when adjacent valleys were cleared. The naula spring system is documented since the 18th century. Restoration here is about widening protected fragments, not starting from bare land.",
    canopy: 41,
    fireRisk: "low",
    fieldNotes:
      "Visited Nov 2025 with Hark Foundation. Two panchayats signed letters of intent. First planting cycle starts post-monsoon 2026.",
  },
  {
    id: "tehri",
    name: "Tehri Garhwal",
    elevation: "1,800 m",
    x: 28,
    y: 56,
    summary:
      "Slope stabilization above the Tehri reservoir + fruit-tree income for women's collectives.",
    soil: "Mountain soil, landslide-prone",
    rainfall: "1,000 mm",
    species: ["Walnut", "Apricot", "Bhimal", "Banj oak"],
    why: "Deep-rooted natives + fruit trees hold the slope AND produce sellable harvests — a forest you can eat.",
    treesPlanted: 1240,
    farmers: 4,
    priority: "medium",
    status: "field-visited",
    activeSince: "Feb 2026",
    history:
      "Massive land disturbance from the 2010s onwards — Tehri dam construction and slope failures. Many of the original forests above the reservoir are gone. Reforestation here is also slope-stabilization.",
    canopy: 22,
    fireRisk: "medium",
    fieldNotes:
      "Geeta-ji's Mahila Mangal Dal hosted us. Pilot of 50 trees scheduled for Jun 2026.",
  },
  {
    id: "chamoli",
    name: "Chamoli",
    elevation: "2,400 m",
    x: 46,
    y: 26,
    summary: "Post-Joshimath: planting on subsidence-affected slopes around the holy belt.",
    soil: "Disturbed, shallow",
    rainfall: "1,200 mm · snow-influenced",
    species: ["Deodar", "Kharsu oak", "Bhojpatra"],
    why: "Deodar (Cedrus deodara) roots 9m deep — one of the few species that can knit unstable Himalayan slopes back together.",
    treesPlanted: 520,
    farmers: 2,
    priority: "critical",
    status: "researching",
    activeSince: null,
    history:
      "The 2023 Joshimath subsidence revealed how shallow and unstable many of these slopes have become. Reforestation is part of a much larger geological intervention that has to happen at the same time.",
    canopy: 14,
    fireRisk: "high",
    fieldNotes:
      "Two desk reviews so far. Awaiting a site visit with the Wadia Institute geologists before we commit to a planting plan.",
  },
  {
    id: "pauri",
    name: "Pauri Garhwal",
    elevation: "1,400 m",
    x: 36,
    y: 64,
    summary: "Replacing colonial chir pine monoculture with native broadleaf forest.",
    soil: "Acidic from pine needles, recoverable",
    rainfall: "1,100 mm",
    species: ["Banj oak", "Bhimal", "Buransh"],
    why: "Chir pine plantations (planted by the British for railway sleepers) drop tinder-dry needles every summer. Almost every forest fire you read about starts in chir. Native oak doesn't burn the same way.",
    treesPlanted: 1560,
    farmers: 4,
    priority: "high",
    status: "active",
    activeSince: "Aug 2024",
    history:
      "The British forest dept replaced native oak with chir pine here in the 1880s to supply railway sleepers. The needle-drop changed soil chemistry, the canopy stopped recharging springs, and the fire frequency tripled. We're peeling that mistake back, one acre at a time.",
    canopy: 26,
    fireRisk: "high (chir-dominated)",
    fieldNotes:
      "Dinesh-ji's plot is the most aggressive replacement effort. The Forest Department gave us a no-objection certificate after the first year's data.",
  },
  {
    id: "pithoragarh",
    name: "Pithoragarh",
    elevation: "1,500 m",
    x: 84,
    y: 42,
    summary: "Border-district revival — high-altitude fruit + medicinal trees.",
    soil: "Mountain loam, well-drained",
    rainfall: "1,500 mm",
    species: ["Walnut", "Kafal", "Timur"],
    why: "Migration is hollowing out these villages. A walnut tree pays back ₹4,000–₹8,000/yr after year 6 — a reason to stay.",
    treesPlanted: 380,
    farmers: 2,
    priority: "medium",
    status: "researching",
    activeSince: null,
    history:
      "Border district. Outmigration is so severe that many villages are 80% empty — the soil is fine, the people aren't there. Any tree program here also has to be a 'reason to stay' program.",
    canopy: 38,
    fireRisk: "medium",
    fieldNotes:
      "Phone calls with three village heads. No site visit yet — logistics are hard. Targeting first visit Sep 2026.",
  },
];

export const FARMERS: Farmer[] = [
  {
    id: "sunita",
    name: "Sunita Devi",
    village: "Dhauladevi, Almora",
    districtId: "almora",
    upi: "sunita.devi@oksbi",
    phone: "+91 9XXXX 12480",
    years: 7,
    treesPlanted: 612,
    treesAlive: 489,
    donorsThisYear: 34,
    plot: "0.8 ha · terraced",
    quote:
      "Mere bachpan mein naula nahi sookhta tha. Ab jeth mein hi sookh jaata hai. Ham wapas banj laga rahe hain — taaki paani wapas aaye.",
    quoteEn:
      "When I was a child the spring never went dry. Now it's dry by May. We're planting banj oak back — so the water comes back.",
    plants: ["Banj oak", "Buransh", "Kafal"],
    rate: 500,
    rateCare: 1500,
    pendingTrees: 18,
    photoTone: "moss",
    verifiedBy: "Hark Foundation, Almora",
  },
  {
    id: "kamla",
    name: "Kamla Bisht",
    village: "Kapkot, Bageshwar",
    districtId: "bageshwar",
    upi: "kamla.bisht@ybl",
    phone: "+91 9XXXX 84102",
    years: 4,
    treesPlanted: 320,
    treesAlive: 281,
    donorsThisYear: 18,
    plot: "1.2 ha + community grove",
    quote: "Mahila samiti ke saath kaam karte hain. Saamne wala naula ab phir se chal raha hai.",
    quoteEn: "We work as a women's collective. The naula across from us is flowing again.",
    plants: ["Tilonj oak", "Buransh", "Kharsu oak"],
    rate: 500,
    rateCare: 1500,
    pendingTrees: 6,
    photoTone: "terra",
    verifiedBy: "Panchayat resolution + Van Panchayat",
  },
  {
    id: "dinesh",
    name: "Dinesh Negi",
    village: "Pabo, Pauri",
    districtId: "pauri",
    upi: "dineshnegi.up@upi",
    phone: "+91 9XXXX 02148",
    years: 9,
    treesPlanted: 1280,
    treesAlive: 940,
    donorsThisYear: 52,
    plot: "2.1 ha · ex-chir plantation",
    quote: "Chir to angrez laga gaye the. Ab hamari baari hai jungle wapas lagaane ki — asli waala.",
    quoteEn: "The British planted chir pine. It's our turn now to plant the real forest back.",
    plants: ["Banj oak", "Bhimal", "Buransh"],
    rate: 400,
    rateCare: 1200,
    pendingTrees: 24,
    photoTone: "moss",
    verifiedBy: "Forest Dept. NOC + Van Panchayat",
  },
  {
    id: "geeta",
    name: "Geeta Rawat",
    village: "Ghansali, Tehri",
    districtId: "tehri",
    upi: "geeta.rawat@paytm",
    phone: "+91 9XXXX 71024",
    years: 3,
    treesPlanted: 184,
    treesAlive: 170,
    donorsThisYear: 12,
    plot: "0.6 ha",
    quote: "Khubani aur akhrot ek saath laga rahe hain — ki phal bhi mile, mitti bhi rake.",
    quoteEn: "We plant apricot with walnut — fruit to sell, roots to hold the slope.",
    plants: ["Walnut", "Apricot", "Bhimal"],
    rate: 800,
    rateCare: 2200,
    pendingTrees: 9,
    photoTone: "terra",
    verifiedBy: "Mahila Mangal Dal",
  },
  {
    id: "mohan",
    name: "Mohan Singh Bhandari",
    village: "Pipalkoti, Chamoli",
    districtId: "chamoli",
    upi: "mohanbhandari@oksbi",
    phone: "+91 9XXXX 33960",
    years: 6,
    treesPlanted: 412,
    treesAlive: 340,
    donorsThisYear: 21,
    plot: "1.0 ha · slope >40°",
    quote:
      "Joshimath ke baad sab dar gaye the. Deodar ki jaden 9 meter neeche jaati hain — yahi pakad rakhega.",
    quoteEn:
      "After Joshimath everyone was afraid. Deodar's roots go 9 meters deep — that's what will hold us.",
    plants: ["Deodar", "Kharsu oak"],
    rate: 600,
    rateCare: 1800,
    pendingTrees: 14,
    photoTone: "moss",
    verifiedBy: "Disaster Mgmt. Authority listing",
  },
];

export const USER_GROVE: Grove = {
  name: "Aditya",
  joined: "Mar 2026",
  total: 3,
  totalPaid: 4500,
  trees: [
    {
      id: "PT-014",
      species: "Banj oak",
      sci: "Quercus leucotrichophora",
      farmerId: "sunita",
      districtId: "almora",
      planted: "2026-04-08",
      paid: 1500,
      stage: 2,
      height: 0.8,
      health: 92,
      lastUpdate: "5 days ago",
      photos: [
        { date: "Apr 08", caption: "Day 1 — sapling in the ground", by: "sunita" },
        { date: "Apr 22", caption: "First leaves opening", by: "sunita" },
        { date: "May 09", caption: "After the first big rain", by: "sunita" },
      ],
      milestones: [
        { date: "Apr 08 '26", label: "Planted by Sunita-ji", done: true, by: "sunita" },
        { date: "May 09 '26", label: "Survived first month", done: true, by: "sunita" },
        { date: "Oct 2026", label: "Through the monsoon", done: false },
        { date: "May 2027", label: "First dry season cleared", done: false },
        { date: "2030", label: "First acorn drop", done: false },
      ],
    },
    {
      id: "PT-021",
      species: "Walnut",
      sci: "Juglans regia",
      farmerId: "geeta",
      districtId: "tehri",
      planted: "2026-04-22",
      paid: 2200,
      stage: 1,
      height: 0.3,
      health: 95,
      lastUpdate: "yesterday",
    },
    {
      id: "PT-027",
      species: "Buransh",
      sci: "Rhododendron arboreum",
      farmerId: "kamla",
      districtId: "bageshwar",
      planted: "2026-05-04",
      paid: 800,
      stage: 0,
      height: 0,
      health: 100,
      lastUpdate: "planted today",
    },
  ],
};

export const THREADS: Record<string, Thread> = {
  "PT-014": {
    treeId: "PT-014",
    donor: "Aditya",
    farmerId: "sunita",
    messages: [
      { id: "m1", from: "system", time: "Apr 4 · 10:42", kind: "thread-open", text: "Thread opened. ₹1,500 paid to Sunita-ji · banj oak · plant + 1 yr care" },
      { id: "m2", from: "donor", time: "Apr 4 · 10:43", kind: "text", text: "Namaste Sunita-ji. Looking forward to seeing the tree grow." },
      { id: "m3", from: "donor", time: "Apr 4 · 10:43", kind: "photo", caption: "My UPI payment screenshot — for your records.", photoTone: "neutral" },
      { id: "m4", from: "farmer", time: "Apr 4 · 18:20", kind: "text", text: "Namaste. Payment mil gaya. Saplings nursery se aaj la raha hoon — kal subah lagaa dunga." },
      { id: "m5", from: "system", time: "Apr 8 · 07:14", kind: "planting", text: "Sunita-ji marked the tree as planted" },
      { id: "m6", from: "farmer", time: "Apr 8 · 07:14", kind: "photo", caption: "Lag gaya hai. Mitti gili hai aaj subah — acchi shuruaat.", photoTone: "moss" },
      { id: "m7", from: "donor", time: "Apr 8 · 09:01", kind: "text", text: "Bahut sundar ji 🙏 Thank you so much." },
      { id: "m8", from: "system", time: "May 9 · 06:30", kind: "milestone", text: "Milestone reached · Survived first month" },
      { id: "m9", from: "farmer", time: "May 9 · 06:31", kind: "photo", caption: "First big rain. Patti khul rahi hai — leaves are opening.", photoTone: "moss" },
      { id: "m10", from: "farmer", time: "May 9 · 06:32", kind: "text", text: "Height ab 0.4m. Sab theek hai." },
      { id: "m11", from: "donor", time: "May 9 · 08:14", kind: "text", text: "Beautiful. Aap kaise hain? Family theek?" },
      { id: "m12", from: "farmer", time: "May 9 · 13:02", kind: "text", text: "Sab theek, dhanyavad. Aap zaroor aana kabhi gaaon mein." },
    ],
  },
  "PT-021": {
    treeId: "PT-021",
    donor: "Aditya",
    farmerId: "geeta",
    messages: [
      { id: "m1", from: "system", time: "Apr 22 · 11:08", kind: "thread-open", text: "Thread opened. ₹2,200 paid to Geeta-ji · walnut · plant + 1 yr care" },
      { id: "m2", from: "donor", time: "Apr 22 · 11:09", kind: "photo", caption: "UPI screenshot.", photoTone: "neutral" },
      { id: "m3", from: "farmer", time: "Apr 23 · 09:14", kind: "text", text: "Mil gaya ji. Akhrot ke nursery se laaye hain. Kal lagaa rahe hain." },
      { id: "m4", from: "system", time: "Apr 24 · 16:40", kind: "planting", text: "Geeta-ji marked the tree as planted" },
      { id: "m5", from: "farmer", time: "Apr 24 · 16:40", kind: "photo", caption: "Aapke naam ki taakhti bhi laga di.", photoTone: "terra" },
    ],
  },
  "PT-027": {
    treeId: "PT-027",
    donor: "Aditya",
    farmerId: "kamla",
    messages: [
      { id: "m1", from: "system", time: "today · 08:12", kind: "thread-open", text: "Thread opened. ₹800 paid to Kamla-ji · buransh · plant only" },
      { id: "m2", from: "donor", time: "today · 08:13", kind: "photo", caption: "Payment screenshot.", photoTone: "neutral" },
      { id: "m3", from: "farmer", time: "today · 10:34", kind: "text", text: "Namaste ji. Sapling taiyaar hai — aaj shaam ko hi lagaa dunga." },
      { id: "m4", from: "system", time: "today · 17:50", kind: "planting", text: "Kamla-ji marked the tree as planted" },
      { id: "m5", from: "farmer", time: "today · 17:50", kind: "photo", caption: "Lag gaya. Paas mein naula bhi hai — paani milta rahega.", photoTone: "moss" },
    ],
  },
};

export const FARMER_INBOX: FarmerInbox = {
  farmerId: "sunita",
  pendingUpdates: 3,
  newMessages: 2,
  trees: [
    { id: "PT-014", donor: "Aditya M.", species: "Banj oak", planted: "Apr 8", lastUpdate: "5 days ago", height: 0.8, health: 92, unread: 1 },
    { id: "PT-029", donor: "Sarah P.", species: "Buransh", planted: "Apr 12", lastUpdate: "2 weeks ago", height: 0.6, health: 88, unread: 0, needsUpdate: true },
    { id: "PT-038", donor: "Maja K.", species: "Banj oak", planted: "Apr 18", lastUpdate: "3 weeks ago", height: 0.5, health: 95, unread: 0, needsUpdate: true },
    { id: "PT-047", donor: "Ravi C.", species: "Kafal", planted: "Apr 22", lastUpdate: "3 weeks ago", height: 0.3, health: 90, unread: 1 },
    { id: "PT-061", donor: "Megha R.", species: "Banj oak", planted: "May 8", lastUpdate: "yesterday", height: 0.2, health: 100, unread: 0 },
    { id: "PT-068", donor: "Aditya M.", species: "Banj oak", planted: null, lastUpdate: "—", height: 0, health: null, unread: 0, awaitingPlant: true },
  ],
  earnings: [
    { id: "e1", date: "May 8", donor: "Megha R.", amount: 1500, tree: "PT-061", kind: "plant + care" },
    { id: "e2", date: "May 7", donor: "Aditya M.", amount: 1500, tree: "PT-068", kind: "plant + care" },
    { id: "e3", date: "Apr 22", donor: "Ravi C.", amount: 500, tree: "PT-047", kind: "plant only" },
    { id: "e4", date: "Apr 18", donor: "Maja K.", amount: 1500, tree: "PT-038", kind: "plant + care" },
    { id: "e5", date: "Apr 12", donor: "Sarah P.", amount: 500, tree: "PT-029", kind: "plant only" },
    { id: "e6", date: "Apr 4", donor: "Aditya M.", amount: 1500, tree: "PT-014", kind: "plant + care" },
  ],
};

export const COMING_NEXT = [
  { name: "Uttarkashi", note: "Bhagirathi basin · deodar revival" },
  { name: "Rudraprayag", note: "Mandakini valley · post-2013 floods" },
  { name: "Champawat", note: "Border Kumaon · mixed oak" },
  { name: "Nainital (rural)", note: "Lake basin recharge zones" },
];

export const SCIENCE_AXES = [
  {
    title: "Soil chemistry",
    short: "N · P · K · pH · organic matter",
    body: "We send soil samples from each candidate plot to a Dehradun lab — nitrogen, phosphorus, potassium, pH, and organic-matter percentage. A banj oak that thrives on Almora loam will die on a chir-acidified slope. We don't guess; we measure.",
  },
  {
    title: "Rainfall pattern",
    short: "12-month cycle · IMD station data",
    body: "Total mm matters less than distribution. A region with 1,400mm in three months is harder than one with 900mm spread evenly. We pull 30 years of district rainfall data from IMD and overlay it on tree species' known tolerances.",
  },
  {
    title: "Existing canopy",
    short: "Sentinel-2 NDVI · quarterly",
    body: "NDVI (Normalized Difference Vegetation Index) from the European Sentinel-2 satellite tells us what the canopy is doing right now — thinning, stable, or growing. We screen this seasonally for every active plot and quarterly for every researched district.",
  },
  {
    title: "Native species fit",
    short: "Local nursery stock only",
    body: "We only plant species native to that elevation band, drawn from a list maintained with local foresters and Krishi Vigyan Kendras. No eucalyptus. No chir pine in new plantings. No exotics, ever. The seedlings come from nurseries within 60 km of the plot.",
  },
  {
    title: "Community land tenure",
    short: "Panchayat resolution required",
    body: "Every plot needs a documented green-light from the local panchayat or Van Panchayat. We do not plant on disputed land, leased land, or land where the user of the land is unclear. This is the most common reason we walk away from a site.",
  },
  {
    title: "Water access",
    short: "Within 800m of plot · dry season",
    body: "Year-one survival depends on dry-season watering. We don't enter plots where the farmer would have to carry water more than 800 metres uphill. It sounds prosaic; it's the single biggest predictor of trees still being alive at month 18.",
  },
];
