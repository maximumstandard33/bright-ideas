import { describe, expect, it } from "vitest";
import { PLATFORMS } from "@/data/mockGroceryDb";
import { feesFor } from "./priceEngine";
import { parseLine } from "./parser";

const p = (id: string) => PLATFORMS.find((x) => x.id === id)!;

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
