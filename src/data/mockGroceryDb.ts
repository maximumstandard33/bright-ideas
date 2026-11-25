export type PlatformId = "blinkit" | "zepto" | "instamart" | "bigbasket" | "dmart" | "jiomart";

export interface Platform {
  id: PlatformId;
  name: string;
  short: string;
  quick: boolean;
  delivery: number;
  handling: number;
  surge: number;
  freeAbove: number | null;
  eta: string;
}

export const PLATFORMS: Platform[] = [
  { id: "blinkit", name: "Blinkit", short: "BLNK", quick: true, delivery: 16, handling: 4, surge: 0, freeAbove: 499, eta: "10 min" },
  { id: "zepto", name: "Zepto", short: "ZPTO", quick: true, delivery: 15, handling: 5, surge: 0, freeAbove: 499, eta: "9 min" },
  { id: "instamart", name: "Instamart", short: "INST", quick: true, delivery: 19, handling: 5, surge: 0, freeAbove: 499, eta: "14 min" },
  { id: "bigbasket", name: "BigBasket", short: "BGBK", quick: false, delivery: 30, handling: 0, surge: 0, freeAbove: 1000, eta: "Slot" },
  { id: "dmart", name: "DMart Ready", short: "DMRT", quick: false, delivery: 49, handling: 0, surge: 0, freeAbove: null, eta: "Next day" },
  { id: "jiomart", name: "JioMart", short: "JIOM", quick: false, delivery: 29, handling: 0, surge: 0, freeAbove: 750, eta: "Same day" },
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
  "560038": "Indiranagar, BLR",
  "560034": "Koramangala, BLR",
  "400050": "Bandra West, MUM",
  "400076": "Powai, MUM",
  "110017": "Saket, DEL",
  "110001": "Connaught Place, DEL",
  "122002": "DLF Phase 2, GGN",
};

export const PRICE_HISTORY: { label: string; vol: string; points: number[] }[] = [
  { label: "Sunflower Oil 1L", vol: "±8%", points: [182, 178, 176, 179, 184, 181, 175, 172, 176, 180, 183, 179, 174, 171, 173] },
  { label: "Red Onion 1kg", vol: "±22%", points: [38, 41, 45, 52, 58, 55, 49, 44, 47, 53, 57, 50, 46, 42, 48] },
  { label: "Hybrid Tomato 1kg", vol: "±18%", points: [32, 35, 39, 44, 41, 37, 34, 36, 40, 45, 48, 43, 39, 41, 44] },
  { label: "Toor Dal 1kg", vol: "±5%", points: [199, 201, 203, 200, 198, 202, 205, 207, 204, 201, 199, 200, 203, 206, 204] },
  { label: "Amul Butter 500g", vol: "±2%", points: [280, 281, 279, 282, 283, 281, 280, 279, 281, 282, 284, 283, 281, 280, 282] },
];
