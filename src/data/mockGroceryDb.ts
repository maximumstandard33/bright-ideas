export type PlatformId = "blinkit" | "zepto" | "instamart" | "bigbasket" | "dmart" | "jiomart";

export interface Platform {
  id: PlatformId;
  name: string;
  short: string;
  quick: boolean;
  delivery: number;
  handling: number;
  surge: number;
  /** Dynamic surge ceiling; 0 = this platform never surges. */
  surgeMax: number;
  /** Granularity of the surge band (₹5 steps, or a single ₹10 rain charge). */
  surgeStep: number;
  surgeReason: string | null;
  /** Store pickup fee; null = pickup not offered by this platform. */
  pickupFee: number | null;
  freeAbove: number | null;
  eta: string;
  url: string;
}

export const PLATFORMS: Platform[] = [
  { id: "blinkit", name: "Blinkit", short: "BLNK", quick: true, delivery: 16, handling: 4, surge: 0, surgeMax: 15, surgeStep: 5, surgeReason: "Surge pricing", pickupFee: null, freeAbove: 499, eta: "10 min", url: "https://blinkit.com" },
  { id: "zepto", name: "Zepto", short: "ZPTO", quick: true, delivery: 15, handling: 5, surge: 0, surgeMax: 10, surgeStep: 5, surgeReason: "Surge pricing", pickupFee: null, freeAbove: 499, eta: "9 min", url: "https://www.zeptonow.com" },
  { id: "instamart", name: "Instamart", short: "INST", quick: true, delivery: 19, handling: 5, surge: 0, surgeMax: 10, surgeStep: 10, surgeReason: "Rain / night charge", pickupFee: null, freeAbove: 499, eta: "14 min", url: "https://www.swiggy.com/instamart" },
  { id: "bigbasket", name: "BigBasket", short: "BGBK", quick: false, delivery: 30, handling: 0, surge: 0, surgeMax: 0, surgeStep: 0, surgeReason: null, pickupFee: null, freeAbove: 1000, eta: "Slot", url: "https://www.bigbasket.com" },
  { id: "dmart", name: "DMart Ready", short: "DMRT", quick: false, delivery: 49, handling: 0, surge: 0, surgeMax: 0, surgeStep: 0, surgeReason: null, pickupFee: 0, freeAbove: null, eta: "Next day", url: "https://www.dmartready.com" },
  { id: "jiomart", name: "JioMart", short: "JIOM", quick: false, delivery: 29, handling: 0, surge: 0, surgeMax: 0, surgeStep: 0, surgeReason: null, pickupFee: null, freeAbove: 750, eta: "Same day", url: "https://www.jiomart.com" },
];

export interface Sku {
  id: string;
  brand: string;
  name: string;
  category: string;
  size: string;
  qty: number; // in base unit
  base: "kg" | "L" | "pc";
  mrp: number;
  keywords: string[];
  prices: Record<PlatformId, number | null>; // null = out of stock
}

type Raw = [brand: string, name: string, cat: string, size: string, qty: number, base: Sku["base"], mrp: number, kw: string];

const RAW: Raw[] = [
  ["Aashirvaad", "Superior MP Sharbati Atta", "Staples", "1 kg", 1, "kg", 72, "atta wheat flour"],
  ["Aashirvaad", "Superior MP Sharbati Atta", "Staples", "5 kg", 5, "kg", 340, "atta wheat flour"],
  ["Aashirvaad", "Superior MP Sharbati Atta", "Staples", "10 kg", 10, "kg", 640, "atta wheat flour"],
  ["Fortune", "Sunlite Refined Sunflower Oil", "Staples", "1 L", 1, "L", 185, "oil sunflower"],
  ["Fortune", "Sunlite Refined Sunflower Oil", "Staples", "5 L", 5, "L", 880, "oil sunflower"],
  ["Tata", "Salt Iodised", "Staples", "1 kg", 1, "kg", 28, "salt"],
  ["India Gate", "Basmati Rice Classic", "Staples", "1 kg", 1, "kg", 215, "rice basmati"],
  ["India Gate", "Basmati Rice Classic", "Staples", "5 kg", 5, "kg", 999, "rice basmati"],
  ["Daawat", "Rozana Basmati Rice", "Staples", "1 kg", 1, "kg", 120, "rice basmati rozana"],
  ["Daawat", "Rozana Basmati Rice", "Staples", "5 kg", 5, "kg", 560, "rice basmati rozana"],
  ["Tata Sampann", "Toor Dal Unpolished", "Staples", "1 kg", 1, "kg", 210, "dal toor arhar"],
  ["Tata Sampann", "Moong Dal", "Staples", "500 g", 0.5, "kg", 98, "dal moong"],
  ["Madhur", "Pure Sugar", "Staples", "1 kg", 1, "kg", 62, "sugar"],
  ["Madhur", "Pure Sugar", "Staples", "5 kg", 5, "kg", 295, "sugar"],
  ["Everest", "Turmeric Powder", "Staples", "100 g", 0.1, "kg", 42, "turmeric haldi"],
  ["MDH", "Deggi Mirch", "Staples", "100 g", 0.1, "kg", 92, "chilli mirch"],
  ["Amul", "Salted Butter", "Dairy", "100 g", 0.1, "kg", 58, "butter"],
  ["Amul", "Salted Butter", "Dairy", "500 g", 0.5, "kg", 285, "butter"],
  ["Mother Dairy", "Full Cream Milk", "Dairy", "1 L", 1, "L", 68, "milk"],
  ["Amul", "Taaza Toned Milk", "Dairy", "1 L", 1, "L", 56, "milk toned taaza"],
  ["Amul", "Masti Dahi", "Dairy", "400 g", 0.4, "kg", 35, "dahi curd"],
  ["Amul", "Paneer Fresh", "Dairy", "200 g", 0.2, "kg", 95, "paneer"],
  ["Tata Tea", "Gold", "Breakfast", "250 g", 0.25, "kg", 165, "tea chai"],
  ["Tata Tea", "Gold", "Breakfast", "500 g", 0.5, "kg", 315, "tea chai"],
  ["Nescafe", "Classic Instant Coffee", "Breakfast", "50 g", 0.05, "kg", 190, "coffee"],
  ["Nescafe", "Classic Instant Coffee", "Breakfast", "100 g", 0.1, "kg", 360, "coffee"],
  ["Britannia", "Brown Bread", "Breakfast", "400 g", 0.4, "kg", 55, "bread brown"],
  ["Kellogg's", "Corn Flakes Original", "Breakfast", "475 g", 0.475, "kg", 210, "cornflakes corn flakes cereal"],
  ["Parle-G", "Gold Biscuits", "Breakfast", "1 kg", 1, "kg", 150, "biscuit parle"],
  ["Farm", "Eggs (Tray)", "Breakfast", "12 pc", 12, "pc", 96, "eggs egg"],
  ["Surf Excel", "Matic Top Load Detergent", "Household", "2 kg", 2, "kg", 470, "detergent surf matic"],
  ["Surf Excel", "Matic Top Load Detergent", "Household", "4 kg", 4, "kg", 899, "detergent surf matic"],
  ["Vim", "Dishwash Liquid Lemon", "Household", "500 ml", 0.5, "L", 115, "vim dishwash liquid"],
  ["Vim", "Dishwash Liquid Lemon", "Household", "750 ml", 0.75, "L", 165, "vim dishwash liquid"],
  ["Dettol", "Original Handwash Refill", "Household", "200 ml", 0.2, "L", 99, "handwash dettol"],
  ["Colgate", "Strong Teeth Toothpaste", "Household", "200 g", 0.2, "kg", 120, "toothpaste colgate"],
  ["Harpic", "Power Plus Toilet Cleaner", "Household", "1 L", 1, "L", 210, "harpic toilet cleaner"],
  ["Lizol", "Floor Cleaner Citrus", "Household", "975 ml", 0.975, "L", 229, "lizol floor cleaner"],
  ["Fresh", "Hybrid Tomato", "Produce", "1 kg", 1, "kg", 48, "tomato tamatar"],
  ["Fresh", "Red Onion", "Produce", "1 kg", 1, "kg", 52, "onion pyaz"],
  ["Fresh", "Farm Potato", "Produce", "1 kg", 1, "kg", 40, "potato aloo"],
  ["Fresh", "Banana Robusta", "Produce", "6 pc", 6, "pc", 54, "banana kela"],
  ["Maggi", "2-Minute Masala Noodles", "Snacks", "4 pack", 4, "pc", 60, "maggi noodles"],
  ["Haldiram's", "Aloo Bhujia", "Snacks", "400 g", 0.4, "kg", 110, "bhujia namkeen haldiram"],
  ["Quaker", "Oats Rolled", "Breakfast", "1 kg", 1, "kg", 195, "oats quaker"],
  ["Fortune", "Besan", "Staples", "500 g", 0.5, "kg", 68, "besan gram flour"],
  ["Tata Sampann", "Poha", "Staples", "500 g", 0.5, "kg", 45, "poha flattened rice"],
  ["Kohinoor", "Super Value Basmati Rice", "Staples", "1 kg", 1, "kg", 132, "rice basmati kohinoor"],
  ["Kohinoor", "Super Value Basmati Rice", "Staples", "5 kg", 5, "kg", 620, "rice basmati kohinoor"],
  ["MDH", "Garam Masala", "Staples", "100 g", 0.1, "kg", 98, "garam masala mdh spice"],
  ["Kissan", "Mixed Fruit Jam", "Breakfast", "500 g", 0.5, "kg", 135, "jam kissan fruit spread"],
  ["Britannia", "Good Day Cashew", "Snacks", "150 g", 0.15, "kg", 35, "good day cashew biscuit"],
  ["Lay's", "India's Magic Masala", "Snacks", "52 g", 0.052, "kg", 20, "lays chips magic masala"],
  ["Cadbury", "Dairy Milk Silk", "Snacks", "50 g", 0.05, "kg", 55, "cadbury chocolate dairy milk silk"],
  ["Bru", "Instant Coffee", "Breakfast", "100 g", 0.1, "kg", 295, "coffee bru instant"],
  ["Parachute", "Coconut Hair Oil", "Household", "1 L", 1, "L", 245, "coconut oil hair parachute"],
  ["Dabur", "Amla Hair Oil", "Household", "250 ml", 0.25, "L", 108, "hair oil dabur amla"],
  ["Lifebuoy", "Total 10 Soap", "Household", "4 x 125 g", 4, "pc", 148, "soap lifebuoy total bathe"],
];

const FACTOR: Record<PlatformId, number> = {
  blinkit: 0.93, zepto: 0.91, instamart: 0.94, bigbasket: 0.89, dmart: 0.84, jiomart: 0.88,
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

export const CATALOG: Sku[] = RAW.map(([brand, name, category, size, qty, base, mrp, kw]) => {
  const id = `${brand}-${name}-${size}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const prices = {} as Record<PlatformId, number | null>;
  for (const p of PLATFORMS) {
    const h = hash(id + p.id);
    if (h % 13 === 0) { prices[p.id] = null; continue; }
    const noise = ((h % 1000) / 1000 - 0.5) * 0.12;
    prices[p.id] = Math.min(mrp, Math.max(1, Math.round(mrp * (FACTOR[p.id] + noise))));
  }
  return {
    id, brand, name, category, size, qty, base, mrp,
    keywords: `${brand} ${name} ${kw}`.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean),
    prices,
  };
});

export const SAMPLES: { label: string; text: string }[] = [
  {
    label: "Monthly Pantry Restock",
    text: "Aashirvaad atta 5kg\nFortune sunflower oil 5L\nTata salt 1kg\nIndia Gate basmati 5kg\nToor dal 1kg\nSugar 5kg\nAmul butter 500g\nTata tea gold 500g\nSurf excel matic 4kg\nVim liquid 750ml\nOnion 2kg\nPotato 2kg",
  },
  { label: "Weekend Breakfast & Chai Run", text: "Mother dairy milk 1L x2\nTata tea gold 250g\nBrown bread\nEggs 12\nAmul butter 100g" },
  { label: "Budget Bachelor Staples", text: "Maggi 4 pack x2\nDaawat rozana rice 1kg\nEggs\nTomato 1kg\nOnion 1kg\nAmul taaza milk 1L" },
];

export const PINCODES: Record<string, string> = {
  "560001": "MG Road, BLR",
  "560008": "JP Nagar, BLR",
  "560025": "Rajajinagar, BLR",
  "560034": "Koramangala, BLR",
  "560038": "Indiranagar, BLR",
  "560066": "Whitefield, BLR",
  "560076": "HSR Layout, BLR",
  "560085": "Yelahanka, BLR",
  "400001": "Fort, MUM",
  "400004": "Dadar West, MUM",
  "400050": "Bandra West, MUM",
  "400064": "Malad West, MUM",
  "400069": "Andheri East, MUM",
  "400076": "Powai, MUM",
  "400091": "Borivali West, MUM",
  "110001": "Connaught Place, DEL",
  "110005": "Karol Bagh, DEL",
  "110016": "Hauz Khas, DEL",
  "110017": "Saket, DEL",
  "110085": "Rohini, DEL",
  "122001": "Gurgaon Central, GGN",
  "122002": "DLF Phase 2, GGN",
  "122003": "DLF Phase 3, GGN",
  "122015": "New Gurgaon, GGN",
  "122018": "Sohna Road, GGN",
};

export interface HistoryEntry {
  /** Catalog family key: "<brand> <name>" lowercased. */
  key: string;
  label: string;
  vol: string;
  points: number[];
}

export const PRICE_HISTORY: HistoryEntry[] = [
  { key: "fortune sunlite refined sunflower oil", label: "Sunflower Oil 1L", vol: "±8%", points: [182, 178, 176, 179, 184, 181, 175, 172, 176, 180, 183, 179, 174, 171, 173] },
  { key: "fresh red onion", label: "Red Onion 1kg", vol: "±22%", points: [38, 41, 45, 52, 58, 55, 49, 44, 47, 53, 57, 50, 46, 42, 48] },
  { key: "fresh hybrid tomato", label: "Hybrid Tomato 1kg", vol: "±18%", points: [32, 35, 39, 44, 41, 37, 34, 36, 40, 45, 48, 43, 39, 41, 44] },
  { key: "tata sampann toor dal unpolished", label: "Toor Dal 1kg", vol: "±5%", points: [199, 201, 203, 200, 198, 202, 205, 207, 204, 201, 199, 200, 203, 206, 204] },
  { key: "amul salted butter", label: "Amul Butter 500g", vol: "±2%", points: [280, 281, 279, 282, 283, 281, 280, 279, 281, 282, 284, 283, 281, 280, 282] },
  { key: "aashirvaad superior mp sharbati atta", label: "Sharbati Atta 5kg", vol: "±3%", points: [332, 334, 331, 329, 333, 336, 338, 335, 332, 330, 328, 331, 334, 337, 335] },
  { key: "india gate basmati rice classic", label: "Basmati Rice 5kg", vol: "±6%", points: [975, 982, 991, 998, 1004, 999, 992, 985, 979, 986, 995, 1002, 997, 988, 981] },
  { key: "tata tea gold", label: "Tata Tea Gold 500g", vol: "±4%", points: [308, 311, 314, 310, 307, 309, 313, 316, 312, 308, 306, 309, 312, 315, 311] },
  { key: "nescafe classic instant coffee", label: "Nescafe Classic 100g", vol: "±7%", points: [352, 348, 344, 349, 355, 359, 353, 347, 343, 346, 351, 356, 352, 345, 341] },
  { key: "surf excel matic top load detergent", label: "Surf Excel Matic 4kg", vol: "±5%", points: [884, 889, 893, 897, 891, 886, 881, 885, 890, 895, 899, 894, 888, 883, 887] },
  { key: "mother dairy full cream milk", label: "Mother Dairy Milk 1L", vol: "±3%", points: [66, 67, 68, 68, 67, 66, 67, 68, 69, 68, 67, 66, 67, 68, 68] },
  { key: "fresh farm potato", label: "Farm Potato 1kg", vol: "±15%", points: [34, 36, 39, 43, 46, 42, 38, 35, 37, 41, 44, 40, 36, 33, 37] },
  { key: "farm eggs (tray)", label: "Eggs Tray 12", vol: "±12%", points: [92, 95, 99, 103, 100, 96, 93, 97, 101, 105, 102, 98, 94, 91, 96] },
  { key: "madhur pure sugar", label: "Sugar 1kg", vol: "±4%", points: [59, 60, 62, 63, 61, 60, 58, 59, 61, 63, 64, 62, 60, 59, 61] },
  { key: "parachute coconut hair oil", label: "Coconut Oil 1L", vol: "±9%", points: [236, 241, 246, 251, 248, 243, 238, 234, 239, 245, 250, 247, 242, 237, 240] },
];

/** Deterministic dynamic surge for a platform at a pincode (stable across runs). */
export function surgeFor(p: Platform, pincode: string): { amount: number; reason: string | null } {
  if (p.surgeMax <= 0) return { amount: 0, reason: null };
  const bands = Math.floor(p.surgeMax / p.surgeStep) + 1;
  const amount = (hash(`${pincode}|${p.id}`) % bands) * p.surgeStep;
  return { amount, reason: amount > 0 ? p.surgeReason : null };
}

/** 30-day trends for the products in the current basket, topped up with staples. */
export function trendsFor(keys: string[], max = 5): HistoryEntry[] {
  const wanted = new Set(keys);
  const mine = PRICE_HISTORY.filter((h) => wanted.has(h.key));
  const out = [...mine];
  for (const h of PRICE_HISTORY) {
    if (out.length >= max) break;
    if (!out.some((x) => x.key === h.key)) out.push(h);
  }
  return out.slice(0, max);
}
