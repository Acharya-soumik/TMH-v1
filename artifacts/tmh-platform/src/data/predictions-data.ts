export interface PredictionCard {
  id: number
  category: string
  resolves: string
  question: string
  count: string
  yes: number
  no: number
  momentum: number
  up: boolean
  data: number[]
}

function spark(base: number, trend: "up" | "down" | "flat", volatility = 2): number[] {
  const seed = base * 137 + (trend === "up" ? 31 : trend === "down" ? 59 : 17) + volatility * 7
  const pts: number[] = [base]
  for (let i = 1; i < 8; i++) {
    const s = Math.sin(seed * (i + 1) * 0.7931 + i * 2.1) * 0.5 + 0.5
    const d = trend === "up" ? s * volatility : trend === "down" ? -s * volatility : (s - 0.5) * volatility
    pts.push(Math.round(Math.max(5, Math.min(95, pts[i - 1] + d))))
  }
  return pts
}

export const PREDICTION_CATEGORIES = [
  "Economy & Finance",
  "Technology & AI",
  "Energy & Climate",
  "Culture & Society",
  "Business & Startups",
  "Geopolitics & Governance",
  "Education & Workforce",
  "Infrastructure & Cities",
  "Sports & Entertainment",
  "Health & Demographics",
]

export const PREDICTIONS: PredictionCard[] = [
  // ─── ECONOMY & FINANCE ──────────────────────────────────────
  { id: 1, category: "Economy & Finance", resolves: "Dec 2026", question: "Saudi Arabia's non-oil GDP will exceed 50% of total GDP by end of 2026", count: "18,203", yes: 62, no: 38, momentum: 1.8, up: true, data: spark(58, "up") },
  { id: 2, category: "Economy & Finance", resolves: "Mar 2029", question: "UAE will introduce some form of personal income tax within 3 years", count: "15,603", yes: 38, no: 62, momentum: 0.8, up: true, data: spark(35, "up", 1) },
  { id: 3, category: "Economy & Finance", resolves: "Dec 2027", question: "Egypt's pound will stabilize below 50 EGP/$ by 2027", count: "11,402", yes: 41, no: 59, momentum: 2.3, up: false, data: spark(45, "down") },
  { id: 4, category: "Economy & Finance", resolves: "Jun 2027", question: "At least 3 MENA countries will launch a central bank digital currency (CBDC)", count: "9,804", yes: 55, no: 45, momentum: 1.1, up: true, data: spark(51, "up") },
  { id: 5, category: "Economy & Finance", resolves: "Dec 2026", question: "Kuwait's debt law will finally pass before end of 2026", count: "7,291", yes: 47, no: 53, momentum: 0.6, up: false, data: spark(49, "flat") },
  { id: 6, category: "Economy & Finance", resolves: "Dec 2028", question: "Bahrain will need another GCC bailout package before 2029", count: "6,312", yes: 64, no: 36, momentum: 1.4, up: true, data: spark(60, "up") },
  { id: 7, category: "Economy & Finance", resolves: "Jun 2027", question: "Riyadh's stock exchange (Tadawul) will surpass $4 trillion market cap", count: "8,734", yes: 51, no: 49, momentum: 0.9, up: true, data: spark(48, "up") },
  { id: 8, category: "Economy & Finance", resolves: "Dec 2027", question: "Iraq's total GDP will exceed $300 billion", count: "5,901", yes: 43, no: 57, momentum: 0.4, up: false, data: spark(45, "down", 1) },
  { id: 9, category: "Economy & Finance", resolves: "Mar 2027", question: "Jordan will reach a new IMF loan agreement by Q1 2027", count: "4,823", yes: 72, no: 28, momentum: 1.2, up: true, data: spark(68, "up") },
  { id: 10, category: "Economy & Finance", resolves: "Dec 2026", question: "Qatar's LNG revenue will hit a new annual record in 2026", count: "10,445", yes: 78, no: 22, momentum: 0.5, up: true, data: spark(76, "up", 1) },

  // ─── TECHNOLOGY & AI ────────────────────────────────────────
  { id: 11, category: "Technology & AI", resolves: "Dec 2026", question: "UAE will deploy AI in at least 50% of government services by end of 2026", count: "13,892", yes: 68, no: 32, momentum: 2.4, up: true, data: spark(62, "up") },
  { id: 12, category: "Technology & AI", resolves: "Jun 2027", question: "Saudi Arabia will launch a homegrown large language model (Arabic-first)", count: "11,204", yes: 74, no: 26, momentum: 1.9, up: true, data: spark(70, "up") },
  { id: 13, category: "Technology & AI", resolves: "Dec 2027", question: "MENA will have 5+ unicorn AI companies by end of 2027", count: "8,903", yes: 42, no: 58, momentum: 1.1, up: true, data: spark(38, "up") },
  { id: 14, category: "Technology & AI", resolves: "Sep 2026", question: "Autonomous delivery robots will operate commercially in at least 2 GCC cities", count: "7,421", yes: 56, no: 44, momentum: 0.7, up: true, data: spark(53, "up", 1) },
  { id: 15, category: "Technology & AI", resolves: "Dec 2028", question: "A MENA-based company will build a top-50 global data center", count: "6,892", yes: 71, no: 29, momentum: 1.6, up: true, data: spark(67, "up") },
  { id: 16, category: "Technology & AI", resolves: "Mar 2027", question: "5G coverage will exceed 90% in UAE, Saudi Arabia, and Qatar combined", count: "9,123", yes: 82, no: 18, momentum: 0.4, up: true, data: spark(80, "up", 1) },
  { id: 17, category: "Technology & AI", resolves: "Dec 2026", question: "At least one MENA country will regulate cryptocurrency as legal tender", count: "10,302", yes: 31, no: 69, momentum: 1.3, up: false, data: spark(34, "down") },
  { id: 18, category: "Technology & AI", resolves: "Jun 2028", question: "Deepfake detection will become mandatory for MENA social media platforms", count: "5,671", yes: 48, no: 52, momentum: 0.9, up: true, data: spark(44, "up") },
  { id: 19, category: "Technology & AI", resolves: "Dec 2027", question: "MENA's cybersecurity market will exceed $10 billion annually", count: "7,834", yes: 65, no: 35, momentum: 1.2, up: true, data: spark(61, "up") },
  { id: 20, category: "Technology & AI", resolves: "Sep 2027", question: "An Arabic AI chatbot will reach 50 million monthly active users", count: "8,456", yes: 39, no: 61, momentum: 2.1, up: true, data: spark(33, "up") },

  // ─── ENERGY & CLIMATE ───────────────────────────────────────
  { id: 21, category: "Energy & Climate", resolves: "Dec 2030", question: "Saudi Arabia will generate 50% of electricity from renewables by 2030", count: "14,672", yes: 34, no: 66, momentum: 0.8, up: false, data: spark(37, "down", 1) },
  { id: 22, category: "Energy & Climate", resolves: "Dec 2027", question: "UAE's Barakah nuclear plant will reach full 4-unit capacity", count: "9,301", yes: 71, no: 29, momentum: 0.6, up: true, data: spark(69, "up", 1) },
  { id: 23, category: "Energy & Climate", resolves: "Jun 2028", question: "At least 2 GCC countries will ban single-use plastics nationwide", count: "7,823", yes: 44, no: 56, momentum: 1.5, up: true, data: spark(39, "up") },
  { id: 24, category: "Energy & Climate", resolves: "Dec 2026", question: "Oil will average above $85/barrel for all of 2026", count: "12,901", yes: 52, no: 48, momentum: 2.8, up: false, data: spark(58, "down") },
  { id: 25, category: "Energy & Climate", resolves: "Dec 2028", question: "NEOM's green hydrogen project will begin commercial production", count: "8,234", yes: 38, no: 62, momentum: 0.9, up: false, data: spark(41, "down", 1) },
  { id: 26, category: "Energy & Climate", resolves: "Jun 2027", question: "Morocco will become Africa's largest solar energy exporter", count: "6,901", yes: 57, no: 43, momentum: 1.3, up: true, data: spark(53, "up") },
  { id: 27, category: "Energy & Climate", resolves: "Dec 2029", question: "Water desalination costs in the Gulf will drop below $0.30/cubic meter", count: "5,412", yes: 63, no: 37, momentum: 0.7, up: true, data: spark(60, "up", 1) },
  { id: 28, category: "Energy & Climate", resolves: "Sep 2027", question: "Dubai will have 5,000+ electric vehicle charging stations", count: "7,123", yes: 69, no: 31, momentum: 1.1, up: true, data: spark(65, "up") },
  { id: 29, category: "Energy & Climate", resolves: "Dec 2028", question: "At least one Gulf city will hit 55°C (131°F) during summer", count: "11,234", yes: 45, no: 55, momentum: 1.8, up: true, data: spark(40, "up") },
  { id: 30, category: "Energy & Climate", resolves: "Jun 2030", question: "Oman's green hydrogen exports will exceed $1 billion annually", count: "4,892", yes: 41, no: 59, momentum: 0.5, up: true, data: spark(38, "up", 1) },

  // ─── CULTURE & SOCIETY ──────────────────────────────────────
  { id: 31, category: "Culture & Society", resolves: "Dec 2026", question: "Saudi Arabia will have a fully operating cinema in every major city by end of 2026", count: "12,847", yes: 71, no: 29, momentum: 2.1, up: true, data: spark(66, "up") },
  { id: 32, category: "Culture & Society", resolves: "Jun 2027", question: "Alcohol will be legally sold in Saudi Arabia in some form by mid-2027", count: "14,302", yes: 28, no: 72, momentum: 1.4, up: true, data: spark(23, "up") },
  { id: 33, category: "Culture & Society", resolves: "Dec 2027", question: "A MENA film will win or be nominated for an Oscar (main categories)", count: "8,923", yes: 52, no: 48, momentum: 0.8, up: true, data: spark(49, "up") },
  { id: 34, category: "Culture & Society", resolves: "Sep 2026", question: "Female labor force participation in Saudi Arabia will exceed 35%", count: "10,102", yes: 76, no: 24, momentum: 0.6, up: true, data: spark(74, "up", 1) },
  { id: 35, category: "Culture & Society", resolves: "Dec 2027", question: "MENA region will have 500+ million social media users", count: "7,234", yes: 81, no: 19, momentum: 0.3, up: true, data: spark(79, "up", 1) },
  { id: 36, category: "Culture & Society", resolves: "Jun 2028", question: "At least 2 Arab countries will legalize cannabis for medical use", count: "6,891", yes: 35, no: 65, momentum: 1.7, up: true, data: spark(29, "up") },
  { id: 37, category: "Culture & Society", resolves: "Dec 2026", question: "Riyadh Season 2026 will attract more than 20 million visitors", count: "11,456", yes: 67, no: 33, momentum: 1.2, up: true, data: spark(63, "up") },
  { id: 38, category: "Culture & Society", resolves: "Mar 2028", question: "An Arab creator will surpass 100 million YouTube subscribers", count: "9,012", yes: 44, no: 56, momentum: 2.3, up: true, data: spark(38, "up") },
  { id: 39, category: "Culture & Society", resolves: "Dec 2027", question: "Divorce rates in the GCC will exceed 40% of all marriages", count: "5,678", yes: 58, no: 42, momentum: 0.9, up: true, data: spark(55, "up") },
  { id: 40, category: "Culture & Society", resolves: "Jun 2027", question: "Expat populations in Qatar and UAE combined will exceed 12 million", count: "7,892", yes: 73, no: 27, momentum: 0.4, up: true, data: spark(71, "up", 1) },

  // ─── BUSINESS & STARTUPS ────────────────────────────────────
  { id: 41, category: "Business & Startups", resolves: "Dec 2026", question: "A MENA-founded startup will reach $10B valuation in 2026", count: "9,231", yes: 44, no: 56, momentum: 1.3, up: false, data: spark(47, "down") },
  { id: 42, category: "Business & Startups", resolves: "Jun 2027", question: "Riyadh will overtake Dubai in total VC funding deployed in a single year", count: "8,456", yes: 39, no: 61, momentum: 2.1, up: true, data: spark(33, "up") },
  { id: 43, category: "Business & Startups", resolves: "Dec 2027", question: "MENA fintech companies will process over $100B in annual transactions", count: "7,312", yes: 61, no: 39, momentum: 1.5, up: true, data: spark(56, "up") },
  { id: 44, category: "Business & Startups", resolves: "Sep 2026", question: "At least 10 MENA startups will IPO on regional exchanges in 2026", count: "6,789", yes: 52, no: 48, momentum: 0.8, up: true, data: spark(49, "up") },
  { id: 45, category: "Business & Startups", resolves: "Dec 2028", question: "A Gulf sovereign wealth fund will acquire a top-10 global tech company", count: "5,901", yes: 33, no: 67, momentum: 0.7, up: false, data: spark(35, "down", 1) },
  { id: 46, category: "Business & Startups", resolves: "Jun 2027", question: "MENA e-commerce market will exceed $50 billion in annual GMV", count: "8,234", yes: 68, no: 32, momentum: 1.1, up: true, data: spark(64, "up") },
  { id: 47, category: "Business & Startups", resolves: "Dec 2026", question: "Saudi Arabia's PIF will complete at least 3 major international acquisitions in 2026", count: "9,102", yes: 74, no: 26, momentum: 0.5, up: true, data: spark(72, "up", 1) },
  { id: 48, category: "Business & Startups", resolves: "Mar 2028", question: "A MENA-based super app will reach 50M+ monthly active users", count: "6,412", yes: 46, no: 54, momentum: 1.9, up: true, data: spark(40, "up") },
  { id: 49, category: "Business & Startups", resolves: "Dec 2027", question: "Total MENA venture capital funding will exceed $8 billion in a single year", count: "7,823", yes: 38, no: 62, momentum: 0.6, up: false, data: spark(41, "down", 1) },
  { id: 50, category: "Business & Startups", resolves: "Jun 2027", question: "Amazon/Noon will launch same-day grocery delivery in 5+ MENA cities", count: "5,123", yes: 71, no: 29, momentum: 0.9, up: true, data: spark(68, "up") },

  // ─── GEOPOLITICS & GOVERNANCE ───────────────────────────────
  { id: 51, category: "Geopolitics & Governance", resolves: "Dec 2026", question: "Saudi Arabia and Iran will establish full diplomatic embassies in each other's capitals", count: "11,234", yes: 62, no: 38, momentum: 1.3, up: true, data: spark(58, "up") },
  { id: 52, category: "Geopolitics & Governance", resolves: "Jun 2027", question: "Yemen's civil war will reach a formal ceasefire agreement", count: "9,823", yes: 41, no: 59, momentum: 0.8, up: false, data: spark(43, "down", 1) },
  { id: 53, category: "Geopolitics & Governance", resolves: "Dec 2027", question: "At least 2 more Arab states will normalize relations with Israel", count: "8,102", yes: 34, no: 66, momentum: 1.7, up: false, data: spark(39, "down") },
  { id: 54, category: "Geopolitics & Governance", resolves: "Mar 2028", question: "Turkey will fully resolve its currency crisis (lira below 30/$)", count: "7,456", yes: 29, no: 71, momentum: 0.5, up: false, data: spark(32, "down", 1) },
  { id: 55, category: "Geopolitics & Governance", resolves: "Dec 2026", question: "Lebanon will elect a new president and form a stable government in 2026", count: "10,789", yes: 55, no: 45, momentum: 2.4, up: true, data: spark(48, "up") },
  { id: 56, category: "Geopolitics & Governance", resolves: "Jun 2028", question: "Iraq will hold provincial elections without major security incidents", count: "5,234", yes: 38, no: 62, momentum: 0.6, up: false, data: spark(40, "flat") },
  { id: 57, category: "Geopolitics & Governance", resolves: "Dec 2027", question: "GCC countries will introduce a unified tourist visa", count: "8,567", yes: 48, no: 52, momentum: 1.4, up: true, data: spark(43, "up") },
  { id: 58, category: "Geopolitics & Governance", resolves: "Sep 2027", question: "Tunisia's democratic backslide will continue — no free elections before 2028", count: "6,012", yes: 67, no: 33, momentum: 0.7, up: true, data: spark(64, "up", 1) },
  { id: 59, category: "Geopolitics & Governance", resolves: "Dec 2026", question: "Libya will hold its first national election in over a decade", count: "7,891", yes: 22, no: 78, momentum: 0.3, up: false, data: spark(24, "down", 1) },
  { id: 60, category: "Geopolitics & Governance", resolves: "Jun 2027", question: "Sudan's conflict will displace more than 10 million people total", count: "9,345", yes: 79, no: 21, momentum: 1.1, up: true, data: spark(75, "up") },

  // ─── EDUCATION & WORKFORCE ──────────────────────────────────
  { id: 61, category: "Education & Workforce", resolves: "Sep 2027", question: "Arabic will become mandatory in all Dubai private schools within 2 years", count: "8,094", yes: 58, no: 42, momentum: 1.4, up: true, data: spark(54, "up") },
  { id: 62, category: "Education & Workforce", resolves: "Dec 2027", question: "MENA youth unemployment will drop below 25% region-wide", count: "7,234", yes: 32, no: 68, momentum: 0.9, up: false, data: spark(35, "down") },
  { id: 63, category: "Education & Workforce", resolves: "Jun 2027", question: "At least 5 top-50 global universities will have MENA branch campuses", count: "8,901", yes: 72, no: 28, momentum: 0.6, up: true, data: spark(70, "up", 1) },
  { id: 64, category: "Education & Workforce", resolves: "Dec 2026", question: "Saudi Saudization quotas will reach 50% in retail by end of 2026", count: "6,567", yes: 61, no: 39, momentum: 1.2, up: true, data: spark(57, "up") },
  { id: 65, category: "Education & Workforce", resolves: "Mar 2028", question: "MENA EdTech market will exceed $5 billion in annual revenue", count: "5,123", yes: 54, no: 46, momentum: 1.8, up: true, data: spark(48, "up") },
  { id: 66, category: "Education & Workforce", resolves: "Dec 2027", question: "Remote work will be formally adopted by 30%+ of Gulf employers", count: "7,890", yes: 43, no: 57, momentum: 1.3, up: true, data: spark(38, "up") },
  { id: 67, category: "Education & Workforce", resolves: "Sep 2026", question: "UAE will launch a dedicated ministry or authority for AI education", count: "6,234", yes: 67, no: 33, momentum: 0.8, up: true, data: spark(64, "up", 1) },
  { id: 68, category: "Education & Workforce", resolves: "Jun 2028", question: "Gig economy workers in MENA will exceed 25 million", count: "5,678", yes: 71, no: 29, momentum: 0.5, up: true, data: spark(69, "up", 1) },
  { id: 69, category: "Education & Workforce", resolves: "Dec 2027", question: "A MENA country will rank in the top 10 of PISA education scores", count: "4,567", yes: 18, no: 82, momentum: 0.4, up: false, data: spark(20, "flat", 1) },
  { id: 70, category: "Education & Workforce", resolves: "Mar 2027", question: "Coding bootcamps will produce more MENA tech workers than universities", count: "6,789", yes: 45, no: 55, momentum: 2.2, up: true, data: spark(39, "up") },

  // ─── INFRASTRUCTURE & CITIES ────────────────────────────────
  { id: 71, category: "Infrastructure & Cities", resolves: "Dec 2030", question: "NEOM's The Line will have its first residents living in it by 2030", count: "16,234", yes: 36, no: 64, momentum: 1.8, up: false, data: spark(40, "down") },
  { id: 72, category: "Infrastructure & Cities", resolves: "Jun 2027", question: "Riyadh Metro will be fully operational across all 6 lines", count: "11,456", yes: 64, no: 36, momentum: 1.1, up: true, data: spark(60, "up") },
  { id: 73, category: "Infrastructure & Cities", resolves: "Dec 2027", question: "Dubai will surpass 20 million annual international tourists", count: "9,823", yes: 73, no: 27, momentum: 0.7, up: true, data: spark(71, "up", 1) },
  { id: 74, category: "Infrastructure & Cities", resolves: "Sep 2028", question: "Egypt's new administrative capital will be fully functioning as the seat of government", count: "8,234", yes: 48, no: 52, momentum: 1.5, up: true, data: spark(43, "up") },
  { id: 75, category: "Infrastructure & Cities", resolves: "Dec 2028", question: "Hyperloop technology will be tested in at least one GCC country", count: "6,901", yes: 29, no: 71, momentum: 0.6, up: false, data: spark(31, "down", 1) },
  { id: 76, category: "Infrastructure & Cities", resolves: "Jun 2027", question: "Abu Dhabi will complete Saadiyat Island's cultural district (Guggenheim + all museums)", count: "7,567", yes: 42, no: 58, momentum: 0.9, up: false, data: spark(44, "down") },
  { id: 77, category: "Infrastructure & Cities", resolves: "Dec 2026", question: "Jeddah Tower (1km+ supertall) will resume construction in 2026", count: "10,123", yes: 53, no: 47, momentum: 2.6, up: true, data: spark(47, "up") },
  { id: 78, category: "Infrastructure & Cities", resolves: "Mar 2028", question: "Baghdad will open a new international airport terminal", count: "5,234", yes: 44, no: 56, momentum: 0.4, up: false, data: spark(46, "flat") },
  { id: 79, category: "Infrastructure & Cities", resolves: "Dec 2029", question: "Qatar's Lusail City will reach 250,000 permanent residents", count: "6,789", yes: 51, no: 49, momentum: 0.8, up: true, data: spark(48, "up") },
  { id: 80, category: "Infrastructure & Cities", resolves: "Jun 2027", question: "Oman's Duqm economic zone will attract $10B+ in committed investment", count: "4,567", yes: 46, no: 54, momentum: 1.2, up: true, data: spark(42, "up") },

  // ─── SPORTS & ENTERTAINMENT ─────────────────────────────────
  { id: 81, category: "Sports & Entertainment", resolves: "Dec 2030", question: "Saudi Arabia will be awarded the 2034 FIFA World Cup (confirmed)", count: "15,678", yes: 91, no: 9, momentum: 0.2, up: true, data: spark(89, "up", 1) },
  { id: 82, category: "Sports & Entertainment", resolves: "Jun 2027", question: "A MENA football club will sign a current top-10 world player for $100M+", count: "8,901", yes: 72, no: 28, momentum: 1.6, up: true, data: spark(67, "up") },
  { id: 83, category: "Sports & Entertainment", resolves: "Dec 2026", question: "Esports revenue in MENA will exceed $1 billion in 2026", count: "7,234", yes: 48, no: 52, momentum: 2.1, up: true, data: spark(42, "up") },
  { id: 84, category: "Sports & Entertainment", resolves: "Sep 2027", question: "Qatar will host another mega sporting event (Olympics bid or similar)", count: "9,456", yes: 55, no: 45, momentum: 0.8, up: true, data: spark(52, "up") },
  { id: 85, category: "Sports & Entertainment", resolves: "Dec 2027", question: "F1 will add a 3rd MENA race (beyond Bahrain and Saudi Arabia)", count: "6,123", yes: 63, no: 37, momentum: 1.3, up: true, data: spark(59, "up") },
  { id: 86, category: "Sports & Entertainment", resolves: "Jun 2028", question: "A MENA country will host the Summer or Winter Olympics by 2040", count: "7,890", yes: 44, no: 56, momentum: 0.7, up: true, data: spark(41, "up") },
  { id: 87, category: "Sports & Entertainment", resolves: "Dec 2026", question: "Saudi Pro League average attendance will exceed 15,000 per match", count: "5,678", yes: 39, no: 61, momentum: 1.1, up: false, data: spark(42, "down") },
  { id: 88, category: "Sports & Entertainment", resolves: "Mar 2027", question: "A MENA-based gaming studio will publish a globally top-100 game", count: "6,234", yes: 35, no: 65, momentum: 1.9, up: true, data: spark(29, "up") },
  { id: 89, category: "Sports & Entertainment", resolves: "Dec 2027", question: "WWE will hold 10+ events annually in Saudi Arabia", count: "8,012", yes: 78, no: 22, momentum: 0.4, up: true, data: spark(76, "up", 1) },
  { id: 90, category: "Sports & Entertainment", resolves: "Sep 2026", question: "Riyadh Season 2026 will attract 25+ international music headliners", count: "9,567", yes: 82, no: 18, momentum: 0.6, up: true, data: spark(80, "up", 1) },

  // ─── HEALTH & DEMOGRAPHICS ──────────────────────────────────
  { id: 91, category: "Health & Demographics", resolves: "Dec 2027", question: "MENA's diabetes prevalence will exceed 15% of the adult population", count: "8,234", yes: 74, no: 26, momentum: 0.5, up: true, data: spark(72, "up", 1) },
  { id: 92, category: "Health & Demographics", resolves: "Jun 2028", question: "Gulf countries will mandate mental health coverage in all insurance plans", count: "6,789", yes: 47, no: 53, momentum: 1.8, up: true, data: spark(41, "up") },
  { id: 93, category: "Health & Demographics", resolves: "Dec 2026", question: "UAE population will officially surpass 10.5 million", count: "7,901", yes: 69, no: 31, momentum: 0.7, up: true, data: spark(67, "up", 1) },
  { id: 94, category: "Health & Demographics", resolves: "Sep 2027", question: "Saudi Arabia's average life expectancy will reach 78 years", count: "5,456", yes: 58, no: 42, momentum: 0.9, up: true, data: spark(55, "up") },
  { id: 95, category: "Health & Demographics", resolves: "Dec 2028", question: "At least 3 MENA countries will fully legalize IVF for unmarried women", count: "4,123", yes: 22, no: 78, momentum: 0.4, up: false, data: spark(24, "flat", 1) },
  { id: 96, category: "Health & Demographics", resolves: "Jun 2027", question: "Medical tourism revenue in UAE and Turkey combined will exceed $15 billion", count: "7,345", yes: 63, no: 37, momentum: 1.2, up: true, data: spark(59, "up") },
  { id: 97, category: "Health & Demographics", resolves: "Dec 2027", question: "MENA's total population will officially surpass 550 million", count: "8,678", yes: 81, no: 19, momentum: 0.3, up: true, data: spark(79, "up", 1) },
  { id: 98, category: "Health & Demographics", resolves: "Mar 2028", question: "Obesity rates in the Gulf will exceed 35% (adult population)", count: "6,012", yes: 72, no: 28, momentum: 0.6, up: true, data: spark(70, "up", 1) },
  { id: 99, category: "Health & Demographics", resolves: "Dec 2026", question: "MENA will have 100+ operational telemedicine platforms", count: "5,234", yes: 66, no: 34, momentum: 1.5, up: true, data: spark(61, "up") },
  { id: 100, category: "Health & Demographics", resolves: "Sep 2028", question: "Water scarcity will force at least one MENA city to implement strict rationing", count: "9,123", yes: 55, no: 45, momentum: 2.3, up: true, data: spark(48, "up") },

  // ─── BONUS: CROSS-CUTTING / HIGH-INTEREST ───────────────────
  { id: 101, category: "Culture & Society", resolves: "Dec 2027", question: "Arabic will become a top-10 language on the internet by content volume", count: "6,789", yes: 31, no: 69, momentum: 1.1, up: true, data: spark(27, "up") },
  { id: 102, category: "Business & Startups", resolves: "Jun 2027", question: "Careem (or equivalent) will launch financial services rivaling traditional banks", count: "7,234", yes: 54, no: 46, momentum: 1.4, up: true, data: spark(50, "up") },
  { id: 103, category: "Technology & AI", resolves: "Dec 2028", question: "MENA will produce a globally recognized open-source AI framework", count: "4,891", yes: 28, no: 72, momentum: 0.8, up: false, data: spark(30, "flat") },
  { id: 104, category: "Geopolitics & Governance", resolves: "Jun 2028", question: "A GCC country will grant permanent residency pathways to long-term expats", count: "11,567", yes: 58, no: 42, momentum: 1.7, up: true, data: spark(53, "up") },
  { id: 105, category: "Infrastructure & Cities", resolves: "Dec 2029", question: "A fully autonomous public transit system will operate in a MENA city", count: "6,345", yes: 52, no: 48, momentum: 1.3, up: true, data: spark(48, "up") },
  { id: 106, category: "Economy & Finance", resolves: "Dec 2027", question: "Remittances from GCC to South Asia will exceed $100 billion annually", count: "7,890", yes: 64, no: 36, momentum: 0.6, up: true, data: spark(62, "up", 1) },
  { id: 107, category: "Energy & Climate", resolves: "Jun 2028", question: "Saudi Aramco's market cap will drop below $1.5 trillion", count: "8,456", yes: 37, no: 63, momentum: 1.9, up: true, data: spark(31, "up") },
  { id: 108, category: "Sports & Entertainment", resolves: "Dec 2026", question: "A Saudi-produced TV series will trend globally on Netflix or similar", count: "7,012", yes: 59, no: 41, momentum: 2.4, up: true, data: spark(52, "up") },
  { id: 109, category: "Education & Workforce", resolves: "Sep 2027", question: "KAUST will be ranked in the global top-50 universities", count: "5,678", yes: 42, no: 58, momentum: 0.9, up: true, data: spark(39, "up") },
  { id: 110, category: "Health & Demographics", resolves: "Dec 2027", question: "Fertility rates in the Gulf will drop below 1.8 children per woman", count: "6,234", yes: 57, no: 43, momentum: 0.7, up: true, data: spark(54, "up") },
  { id: 111, category: "Culture & Society", resolves: "Mar 2027", question: "MENA will have 10+ internationally touring music festivals annually", count: "5,890", yes: 68, no: 32, momentum: 1.1, up: true, data: spark(64, "up") },
  { id: 112, category: "Business & Startups", resolves: "Dec 2027", question: "A MENA crypto exchange will become a top-5 global platform by volume", count: "6,456", yes: 33, no: 67, momentum: 1.6, up: true, data: spark(27, "up") },
  { id: 113, category: "Geopolitics & Governance", resolves: "Jun 2027", question: "Morocco will formally bid for the 2030 FIFA World Cup co-hosting", count: "8,234", yes: 84, no: 16, momentum: 0.4, up: true, data: spark(82, "up", 1) },
  { id: 114, category: "Infrastructure & Cities", resolves: "Dec 2028", question: "Dubai Creek Tower will be completed and open to the public", count: "7,345", yes: 31, no: 69, momentum: 0.5, up: false, data: spark(34, "down", 1) },
  { id: 115, category: "Technology & AI", resolves: "Sep 2027", question: "Drone delivery will be commercially available in 3+ MENA cities", count: "6,901", yes: 61, no: 39, momentum: 1.3, up: true, data: spark(57, "up") },
]

export const PREDICTIONS_TICKER = [
  { label: "CINEMA SAUDI", yes: 71, delta: 2.1, up: true },
  { label: "$10B STARTUP", yes: 44, delta: 1.3, up: false },
  { label: "UAE INCOME TAX", yes: 38, delta: 0.8, up: true },
  { label: "ARABIC SCHOOLS", yes: 58, delta: 1.4, up: true },
  { label: "MENA CANNABIS", yes: 29, delta: 0.6, up: false },
  { label: "JOB SURVIVAL", yes: 71, delta: 2.1, up: true },
  { label: "NEOM LINE", yes: 36, delta: 1.8, up: false },
  { label: "RIYADH METRO", yes: 64, delta: 1.1, up: true },
  { label: "SAUDI 2034 WC", yes: 91, delta: 0.2, up: true },
  { label: "ESPORTS $1B", yes: 48, delta: 2.1, up: true },
  { label: "EGYPT CAPITAL", yes: 48, delta: 1.5, up: true },
  { label: "YOUTH JOBS", yes: 32, delta: 0.9, up: false },
  { label: "GREEN H2 OMAN", yes: 41, delta: 0.5, up: true },
  { label: "JEDDAH TOWER", yes: 53, delta: 2.6, up: true },
  { label: "ARAMCO CAP", yes: 37, delta: 1.9, up: true },
  { label: "GCC VISA", yes: 48, delta: 1.4, up: true },
]
