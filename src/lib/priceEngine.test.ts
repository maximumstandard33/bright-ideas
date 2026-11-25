import { describe, expect, it } from "vitest";
import { CATALOG, PLATFORMS, surgeFor, trendsFor } from "@/data/mockGroceryDb";
import { bestSplit, feesFor, singleStorePlans, type EngineCtx, type Line } from "./priceEngine";
import { parseLine } from "./parser";

const p = (id: string) => PLATFORMS.find((x) => x.id === id)!;
const ctx = (over: Partial<EngineCtx> = {}): EngineCtx => ({ surgeOf: () => 0, pickupOf: () => false, ...over });

describe("platform fees", () => {
  it("Blinkit charges ₹16 delivery + ₹4 handling below ₹499", () => expect(feesFor(p("blinkit"), 400).total).toBe(20));
  it("Blinkit waives delivery at ₹499", () => expect(feesFor(p("blinkit"), 499).delivery).toBe(0));
  it("BigBasket free delivery only above ₹1,000", () => {
    expect(feesFor(p("bigbasket"), 999).delivery).toBe(30);
    expect(feesFor(p("bigbasket"), 1000).delivery).toBe(0);
  });
  it("DMart home delivery is always ₹49", () => expect(feesFor(p("dmart"), 5000).delivery).toBe(49));
});

describe("parser", () => {
  it("matches atta 5kg pack", () => expect(parseLine("Aashirvaad atta 5kg", 0)?.sku?.size).toBe("5 kg"));
  it("reads x2 multiplier", () => expect(parseLine("milk 1L x2", 0)?.count).toBe(2));
});

describe("dynamic surge", () => {
  it("keeps Blinkit inside the ₹0–15 band in ₹5 steps", () => {
    for (const code of ["560038", "400050", "110017", "122002"]) expect([0, 5, 10, 15]).toContain(surgeFor(p("blinkit"), code).amount);
  });
  it("charges Instamart either nothing or the ₹10 rain/night fee", () => {
    for (const code of ["560038", "400050", "110017", "122002"]) expect([0, 10]).toContain(surgeFor(p("instamart"), code).amount);
  });
  it("never surges scheduled platforms", () => {
    for (const id of ["bigbasket", "dmart", "jiomart"]) expect(surgeFor(p(id), "560038").amount).toBe(0);
  });
  it("is stable for the same pincode", () => expect(surgeFor(p("zepto"), "560038")).toEqual(surgeFor(p("zepto"), "560038")));
  it("adds surge on top of delivery and handling", () => expect(feesFor(p("blinkit"), 400, ctx({ surgeOf: () => 15 })).total).toBe(35));
});

describe("DMart store pickup", () => {
  it("drops the ₹49 home delivery fee when pickup is chosen", () => {
    const f = feesFor(p("dmart"), 500, ctx({ pickupOf: (x) => x.id === "dmart" }));
    expect(f.pickup).toBe(true);
    expect(f.delivery).toBe(0);
    expect(f.total).toBe(0);
  });
  it("ignores pickup on platforms that do not offer it", () => expect(feesFor(p("bigbasket"), 500, ctx({ pickupOf: () => true })).delivery).toBe(30));
});

describe("store pinning", () => {
  const both = CATALOG.filter((s) => s.prices.blinkit != null && s.prices.zepto != null).slice(0, 2);
  it("drops a line pinned elsewhere from another store's basket", () => {
    expect(both.length).toBe(2);
    const line: Line = { key: "a", sku: both[0]!, count: 1, pin: "zepto" };
    const plan = singleStorePlans([line], [p("blinkit")], ctx())[0]!;
    expect(plan.fulfilled).toBe(0);
    expect(plan.missing.length).toBe(1);
  });
  it("keeps a pinned line on the pinned store in the split plan", () => {
    const lines: Line[] = [
      { key: "a", sku: both[0]!, count: 1, pin: "zepto" },
      { key: "b", sku: both[1]!, count: 1 },
    ];
    const plan = bestSplit(lines, [p("blinkit"), p("zepto")], ctx())!;
    const cart = plan.carts.find((c) => c.lines.some((l) => l.key === "a"));
    expect(cart?.platform.id).toBe("zepto");
  });
});

describe("price trends", () => {
  it("leads with a product that is in the basket", () => expect(trendsFor(["fresh red onion"])[0]?.key).toBe("fresh red onion"));
  it("tops up to five charts when the basket is empty", () => expect(trendsFor([]).length).toBe(5));
});
