import { PLATFORMS, type Platform, type PlatformId, type Sku } from "@/data/mockGroceryDb";

export interface Line { key: string; sku: Sku; count: number; pin?: PlatformId }

/** Per-run context: dynamic surge and store-pickup preference. */
export interface EngineCtx {
  surgeOf: (p: Platform) => number;
  pickupOf: (p: Platform) => boolean;
}

export const DEFAULT_CTX: EngineCtx = { surgeOf: () => 0, pickupOf: () => false };

export function unitRate(sku: Sku, price: number): string {
  if (sku.base === "pc") return `₹${(price / sku.qty).toFixed(1)}/pc`;
  if (sku.qty < 1) return `₹${((price / sku.qty) / 10).toFixed(1)}/100${sku.base === "kg" ? "g" : "ml"}`;
  return `₹${(price / sku.qty).toFixed(1)}/${sku.base}`;
}

export interface FeeBreakdown {
  delivery: number;
  handling: number;
  surge: number;
  total: number;
  gapToFree: number | null;
  pickup: boolean;
}

export function feesFor(p: Platform, subtotal: number, ctx: EngineCtx = DEFAULT_CTX): FeeBreakdown {
  const pickup = ctx.pickupOf(p) && p.pickupFee !== null;
  if (subtotal <= 0) return { delivery: 0, handling: 0, surge: 0, total: 0, gapToFree: null, pickup };
  const free = !pickup && p.freeAbove !== null && subtotal >= p.freeAbove;
  const delivery = pickup ? p.pickupFee! : free ? 0 : p.delivery;
  const gapToFree = !pickup && p.freeAbove !== null && !free ? p.freeAbove - subtotal : null;
  const surge = pickup ? 0 : ctx.surgeOf(p);
  return { delivery, handling: p.handling, surge, total: delivery + p.handling + surge, gapToFree, pickup };
}

export interface Cart {
  platform: Platform;
  lines: Line[];
  subtotal: number;
  fees: FeeBreakdown;
  total: number;
}

export interface Plan { carts: Cart[]; total: number; fulfilled: number; missing: Line[] }

function buildCart(p: Platform, lines: Line[], ctx: EngineCtx): Cart {
  const subtotal = lines.reduce((s, l) => s + (l.sku.prices[p.id] ?? 0) * l.count, 0);
  const fees = feesFor(p, subtotal, ctx);
  return { platform: p, lines, subtotal, fees, total: subtotal + fees.total };
}

export function singleStorePlans(lines: Line[], platforms: Platform[], ctx: EngineCtx = DEFAULT_CTX): Plan[] {
  return platforms.map((p) => {
    const ok = lines.filter((l) => l.sku.prices[p.id] != null && (!l.pin || l.pin === p.id));
    const cart = buildCart(p, ok, ctx);
    return { carts: [cart], total: cart.total, fulfilled: ok.length, missing: lines.filter((l) => !ok.includes(l)) };
  });
}

/** Best plan using 1 or 2 stores, maximising fulfilment first, then minimising total. */
export function bestSplit(lines: Line[], platforms: Platform[], ctx: EngineCtx = DEFAULT_CTX): Plan | null {
  let best: Plan | null = null;
  const consider = (plan: Plan) => {
    if (!best || plan.fulfilled > best.fulfilled || (plan.fulfilled === best.fulfilled && plan.total < best.total)) best = plan;
  };
  for (const s of singleStorePlans(lines, platforms, ctx)) consider(s);
  for (let i = 0; i < platforms.length; i++) {
    for (let j = i + 1; j < platforms.length; j++) {
      const a = platforms[i]!, b = platforms[j]!;
      const la: Line[] = [], lb: Line[] = [], miss: Line[] = [];
      for (const l of lines) {
        const pa = l.sku.prices[a.id], pb = l.sku.prices[b.id];
        if (l.pin) {
          const pinned = l.pin === a.id ? pa : l.pin === b.id ? pb : null;
          if (pinned == null) miss.push(l);
          else (l.pin === a.id ? la : lb).push(l);
          continue;
        }
        if (pa == null && pb == null) miss.push(l);
        else if (pb == null || (pa != null && pa <= pb)) la.push(l);
        else lb.push(l);
      }
      if (!la.length || !lb.length) continue;
      // local improvement: try moving each line to the other cart if it lowers total (fee thresholds)
      let carts = [buildCart(a, la, ctx), buildCart(b, lb, ctx)];
      let improved = true;
      while (improved) {
        improved = false;
        for (const [from, to] of [[0, 1], [1, 0]] as const) {
          for (const l of carts[from]!.lines) {
            if (l.pin || l.sku.prices[carts[to]!.platform.id] == null || carts[from]!.lines.length === 1) continue;
            const nf = buildCart(carts[from]!.platform, carts[from]!.lines.filter((x) => x !== l), ctx);
            const nt = buildCart(carts[to]!.platform, [...carts[to]!.lines, l], ctx);
            if (nf.total + nt.total < carts[0]!.total + carts[1]!.total - 0.001) {
              const next = [...carts]; next[from] = nf; next[to] = nt; carts = next; improved = true; break;
            }
          }
          if (improved) break;
        }
      }
      consider({ carts, total: carts[0]!.total + carts[1]!.total, fulfilled: lines.length - miss.length, missing: miss });
    }
  }
  return best;
}

export function cheapestPlatform(sku: Sku, platforms: Platform[]): PlatformId | null {
  let best: PlatformId | null = null, bp = Infinity;
  for (const p of platforms) { const v = sku.prices[p.id]; if (v != null && v < bp) { bp = v; best = p.id; } }
  return best;
}

export const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
export { PLATFORMS };
