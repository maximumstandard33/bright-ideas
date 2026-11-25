import { CATALOG, type Sku } from "@/data/mockGroceryDb";

export interface ParsedItem {
  key: string;
  raw: string;
  count: number;
  sizeText: string | null;
  sku: Sku | null;
  confidence: number;
  alternatives: Sku[];
}

const UNIT_TO_BASE: Record<string, [number, Sku["base"]]> = {
  kg: [1, "kg"], g: [0.001, "kg"], gm: [0.001, "kg"], l: [1, "L"], ltr: [1, "L"], ml: [0.001, "L"],
  pc: [1, "pc"], pcs: [1, "pc"], pack: [1, "pc"],
};

export function parseLine(raw: string, idx: number): ParsedItem | null {
  let text = raw.trim().toLowerCase();
  if (!text) return null;
  let count = 1;
  const mult = text.match(/(?:^|\s)(?:x\s*(\d+)|(\d+)\s*x)(?=\s|$)/);
  if (mult) {
    count = Number(mult[1] ?? mult[2]) || 1;
    text = text.replace(mult[0], " ");
  }
  const sizeM = text.match(/(\d+(?:\.\d+)?)\s*(kg|gm|g|ltr|l|ml|pcs|pc|pack)\b/);
  let wantQty: number | null = null;
  let wantBase: Sku["base"] | null = null;
  let sizeText: string | null = null;
  if (sizeM) {
    const n = Number(sizeM[1]);
    const u = UNIT_TO_BASE[sizeM[2] ?? ""];
    if (u) { wantQty = n * u[0]; wantBase = u[1]; sizeText = `${sizeM[1]}${sizeM[2]}`; }
    text = text.replace(sizeM[0], " ");
  } else {
    const bare = text.match(/\b(\d+)\b/);
    if (bare) { wantQty = Number(bare[1]); wantBase = "pc"; sizeText = `${bare[1]} pc`; text = text.replace(bare[0], " "); }
  }
  const tokens = text.split(/[^a-z0-9']+/).filter((t) => t.length > 1);
  if (!tokens.length) return null;

  const scored = CATALOG.map((sku) => {
    const hits = tokens.filter((t) => sku.keywords.some((k) => k === t || (t.length > 3 && k.startsWith(t)))).length;
    return { sku, hits };
  }).filter((s) => s.hits > 0);
  if (!scored.length) return { key: `${idx}-${raw}`, raw: raw.trim(), count, sizeText, sku: null, confidence: 0, alternatives: [] };

  const maxHits = Math.max(...scored.map((s) => s.hits));
  const top = scored.filter((s) => s.hits === maxHits).map((s) => s.sku);
  // group = same brand+name as best text hit
  const lead = top[0]!;
  const family = CATALOG.filter((s) => s.brand === lead.brand && s.name === lead.name);
  let chosen = family[0]!;
  let sizeExact = wantQty === null;
  if (wantQty !== null && wantBase) {
    const sameBase = family.filter((f) => f.base === wantBase);
    if (sameBase.length) {
      chosen = sameBase.reduce((a, b) => (Math.abs(b.qty - wantQty!) < Math.abs(a.qty - wantQty!) ? b : a));
      sizeExact = Math.abs(chosen.qty - wantQty) < 1e-9;
      // e.g. "onion 2kg" with only 1kg pack -> bump count
      if (!sizeExact && wantQty > chosen.qty && Number.isInteger(+(wantQty / chosen.qty).toFixed(6))) {
        count *= Math.round(wantQty / chosen.qty);
        sizeExact = true;
      }
    }
  }
  const confidence = Math.round(Math.min(1, maxHits / Math.max(1, tokens.length)) * (sizeExact ? 100 : 80));
  const alternatives = CATALOG.filter((s) => top.some((t) => t.brand === s.brand && t.name === s.name) || family.includes(s));
  return { key: `${idx}-${chosen.id}`, raw: raw.trim(), count, sizeText, sku: chosen, confidence, alternatives };
}

export function parseManifest(text: string): ParsedItem[] {
  return text.split("\n").map(parseLine).filter((x): x is ParsedItem => x !== null);
}
