import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Clock, Minus, Pin, Plus, ShoppingBag, SlidersHorizontal, Store, X } from "lucide-react";
import { CATALOG, PINCODES, PLATFORMS, SAMPLES, surgeFor, trendsFor, type PlatformId, type Sku } from "@/data/mockGroceryDb";
import { parseManifest, type ParsedItem } from "@/lib/parser";
import { bestSplit, cheapestPlatform, inr, singleStorePlans, unitRate, type EngineCtx, type Line, type Plan } from "@/lib/priceEngine";

type Step = 1 | 2 | 3;

export function Workbench() {
  const [pincode, setPincode] = useState("560038");
  const [quickOnly, setQuickOnly] = useState(false);
  const [excluded, setExcluded] = useState<PlatformId[]>([]);
  const [dmartPickup, setDmartPickup] = useState(false);
  const [raw, setRaw] = useState(SAMPLES[1]!.text);
  const [items, setItems] = useState<ParsedItem[]>(() => parseManifest(SAMPLES[1]!.text));
  const [ran, setRan] = useState<ParsedItem[] | null>(null);
  const [ticker, setTicker] = useState<string | null>(null);
  const [plan, setPlanTab] = useState<"A" | "B">("B");
  const [saved, setSaved] = useState(3);
  const [live, setLive] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [showHistory, setShowHistory] = useState(false);
  const timer = useRef<number[]>([]);
  const pinInput = useRef<HTMLInputElement>(null);

  useEffect(() => { setItems(parseManifest(raw)); }, [raw]);

  const platforms = useMemo(
    () => PLATFORMS.filter((p) => (!quickOnly || p.quick) && !excluded.includes(p.id)),
    [quickOnly, excluded],
  );
  const ctx: EngineCtx = useMemo(
    () => ({
      surgeOf: (p) => surgeFor(p, pincode).amount,
      pickupOf: (p) => p.id === "dmart" && dmartPickup,
    }),
    [pincode, dmartPickup],
  );
  const lines: Line[] = useMemo(
    () => (ran ?? []).filter((i) => i.sku).map((i) => {
      const pin = i.pin ?? undefined;
      return pin
        ? { key: i.key, sku: i.sku!, count: i.count, pin }
        : { key: i.key, sku: i.sku!, count: i.count };
    }),
    [ran],
  );
  const singles = useMemo(() => singleStorePlans(lines, platforms, ctx), [lines, platforms, ctx]);
  const champion = useMemo(() => {
    const full = singles.filter((s) => s.fulfilled === lines.length);
    const pool = full.length ? full : singles;
    return pool.reduce<Plan | null>((a, b) => (!a || b.fulfilled > a.fulfilled || (b.fulfilled === a.fulfilled && b.total < a.total) ? b : a), null);
  }, [singles, lines.length]);
  const split = useMemo(() => bestSplit(lines, platforms, ctx), [lines, platforms, ctx]);
  const spread = useMemo(() => {
    const full = singles.filter((s) => s.fulfilled === lines.length).map((s) => s.total);
    return full.length > 1 ? { hi: Math.max(...full), lo: Math.min(...full) } : null;
  }, [singles, lines.length]);
  const trends = useMemo(
    () => trendsFor((ran ?? []).filter((i) => i.sku).map((i) => `${i.sku!.brand} ${i.sku!.name}`.toLowerCase())),
    [ran],
  );

  const run = () => {
    timer.current.forEach(clearTimeout);
    const n = items.length;
    const steps = [
      `[RESOLVING SKUs: ${items.filter((i) => i.sku).length}/${n}]`,
      `[QUERYING ${platforms.length} PLATFORMS @ ${pincode}]`,
      "[CALCULATING SPLIT OPTIMUM]",
    ];
    steps.forEach((s, i) => timer.current.push(window.setTimeout(() => setTicker(s), i * 260)));
    timer.current.push(window.setTimeout(() => { setTicker(null); setRan(items); setStep(2); }, steps.length * 260));
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); run(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const updateItem = (key: string, patch: Partial<ParsedItem>) => {
    setItems((xs) => xs.map((x) => (x.key === key ? { ...x, ...patch } : x)));
    setRan((xs) => xs && xs.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  };
  const removeItem = (key: string) => {
    setItems((xs) => xs.filter((x) => x.key !== key));
    setRan((xs) => xs && xs.filter((x) => x.key !== key));
  };
  const togglePlatform = (id: PlatformId) => {
    setExcluded((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : xs.length === PLATFORMS.length - 1 ? xs : [...xs, id]));
  };

  const exportCsv = () => {
    const head = ["Item", "Size", "Qty", ...PLATFORMS.map((p) => p.name)].join(",");
    const rows = lines.map((l) => [`"${l.sku.brand} ${l.sku.name}"`, l.sku.size, l.count, ...PLATFORMS.map((p) => l.sku.prices[p.id] ?? "OOS")].join(","));
    const blob = new Blob([[head, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "smartcart-basket.csv"; a.click();
  };

  const area = PINCODES[pincode];
  const dmartInPlay = platforms.some((p) => p.id === "dmart");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-sm lg:px-6">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-xl font-semibold tracking-tight">Smart<em className="font-normal">Cart</em></span>
          <span className="label-mono hidden sm:inline">v1.2 // PROD-BENCH</span>
        </div>
        <div className="mx-auto hidden font-mono text-xs md:block">
          <span className="rounded-sm border border-border bg-card px-2 py-1">
            DELIVERY TO: {pincode} {area ? `- ${area}` : "- UNMAPPED"}
            <button onClick={() => { setStep(1); pinInput.current?.focus(); }} className="ml-2 text-primary hover:underline">CHANGE</button>
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3 font-mono text-xs md:ml-0">
          <button onClick={() => setLive((v) => !v)} className="flex items-center gap-1.5 rounded-sm border border-border px-2 py-1 hover:border-border-strong">
            <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-primary" : "bg-accent"}`} />{live ? "LIVE" : "MOCK"}
          </button>
          <span className="hidden sm:inline">Saved Baskets ({saved})</span>
          <button onClick={exportCsv} disabled={!lines.length} className="rounded-sm border border-border px-2 py-1 hover:border-border-strong disabled:opacity-40">Export CSV</button>
        </div>
      </header>

      <nav className="flex border-b border-border font-mono text-[11px] lg:hidden">
        {(["Manifest", "Compare", "Best Basket"] as const).map((l, i) => (
          <button key={l} onClick={() => setStep((i + 1) as Step)} className={`flex-1 py-2.5 ${step === i + 1 ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"}`}>
            {i + 1}. {l.toUpperCase()}
          </button>
        ))}
      </nav>

      <div className="flex flex-col lg:flex-row">
        {/* COLUMN 1 */}
        <aside className={`${step === 1 ? "block" : "hidden"} w-full shrink-0 border-border lg:block lg:min-h-[calc(100vh-3.5rem)] lg:w-[420px] lg:border-r`}>
          <div className="space-y-6 p-5">
            <SectionLabel n="01" t="Parse grocery manifest" />
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <label className="block">
                <span className="label-mono">Pincode</span>
                <input ref={pinInput} value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="mt-1 w-full rounded-sm border border-input bg-card px-2.5 py-2 font-mono text-sm tabular-nums outline-none focus:border-primary" />
                <span className="mt-1 block font-mono text-[11px] text-muted-foreground">{area ?? "Try 560034, 400050, 110017, 122002"}</span>
              </label>
              <div>
                <span className="label-mono">Velocity</span>
                <div className="mt-1 flex rounded-sm border border-input font-mono text-[11px]">
                  <button onClick={() => setQuickOnly(true)} className={`px-2.5 py-2 ${quickOnly ? "bg-foreground text-background" : ""}`}>&lt;15 MIN</button>
                  <button onClick={() => setQuickOnly(false)} className={`px-2.5 py-2 ${!quickOnly ? "bg-foreground text-background" : ""}`}>ANY</button>
                </div>
              </div>
            </div>

            {dmartInPlay && (
              <div>
                <span className="label-mono">DMart Ready fulfilment</span>
                <div className="mt-1 flex w-fit rounded-sm border border-input font-mono text-[11px]">
                  <button onClick={() => setDmartPickup(true)} className={`px-2.5 py-2 ${dmartPickup ? "bg-foreground text-background" : ""}`}>PICKUP ₹0</button>
                  <button onClick={() => setDmartPickup(false)} className={`px-2.5 py-2 ${!dmartPickup ? "bg-foreground text-background" : ""}`}>DELIVER ₹49</button>
                </div>
              </div>
            )}

            <div>
              <span className="label-mono">Platforms in play</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {PLATFORMS.map((p) => {
                  const off = excluded.includes(p.id);
                  const dimmed = quickOnly && !p.quick;
                  return (
                    <button key={p.id} onClick={() => togglePlatform(p.id)} disabled={dimmed} title={p.name}
                      className={`rounded-sm border px-2 py-1 font-mono text-[11px] ${off || dimmed ? "border-border text-muted-foreground line-through opacity-60" : "border-border-strong bg-card"} ${dimmed ? "cursor-not-allowed" : "hover:border-primary"}`}>
                      {p.short}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between"><span className="label-mono">Raw list — one item per line</span><span className="label-mono">{items.length} lines</span></div>
              <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={8}
                className="mt-1 w-full resize-y rounded-sm border border-input bg-card p-3 font-mono text-[13px] leading-relaxed outline-none focus:border-primary" />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SAMPLES.map((s) => (
                  <button key={s.label} onClick={() => setRaw(s.text)} className="rounded-sm border border-border bg-secondary px-2 py-1 text-[12px] hover:border-border-strong">
                    {s.label} <span className="font-mono text-muted-foreground">({s.text.split("\n").length})</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="label-mono">Tokenized</span>
              <ul className="mt-1 divide-y divide-border rounded-sm border border-border bg-card">
                {items.length === 0 && <li className="p-3 text-[13px] text-muted-foreground">Paste a list or load a sample.</li>}
                {items.map((it) => <TokenRow key={it.key} it={it} onChange={(p) => updateItem(it.key, p)} onRemove={() => removeItem(it.key)} />)}
              </ul>
            </div>

            <button onClick={run} disabled={!items.some((i) => i.sku)}
              className="flex w-full items-center justify-between rounded-sm bg-primary px-4 py-3 font-mono text-[13px] font-semibold tracking-wide text-primary-foreground shadow-hard hover:opacity-95 disabled:opacity-40">
              [ RUN PRICE RECONCILIATION ] <span className="flex items-center gap-2 opacity-70">⌘↵ <ArrowRight className="h-4 w-4" /></span>
            </button>
            <p className="h-4 font-mono text-[11px] text-accent">{ticker}</p>
          </div>
        </aside>

        {/* COLUMN 2 */}
        <main className={`${step === 1 ? "hidden" : "block"} min-w-0 flex-1 space-y-8 p-5 lg:block lg:p-6`}>
          {!ran ? (
            <div className="flex h-[60vh] flex-col items-start justify-center gap-3 border border-dashed border-border-strong p-8">
              <span className="label-mono">02 / Engine idle</span>
              <h1 className="max-w-lg font-serif text-3xl leading-tight">Compare smarter. <em>Shop cheaper.</em></h1>
              <p className="max-w-md text-muted-foreground">Paste a list on the left and run reconciliation to price it across six Indian grocery platforms, fees included.</p>
            </div>
          ) : (
            <>
              <section className={`${step === 2 ? "block" : "hidden"} space-y-8 lg:block`}>
                <SectionLabel n="02" t="Algorithmic summary" />
                <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-3">
                  <Slab label="Single-store champion" icon={<Store className="h-3.5 w-3.5" />}
                    big={champion ? inr(champion.total) : "—"} title={champion?.carts[0]?.platform.name ?? "—"}
                    meta={champion ? `${champion.fulfilled}/${lines.length} items · incl. fees` : ""} />
                  <Slab label="Optimised split-cart" icon={<ShoppingBag className="h-3.5 w-3.5" />} tone="amber"
                    big={split ? inr(split.total) : "—"}
                    title={split ? split.carts.map((c) => `${c.lines.length} on ${c.platform.name}`).join(" + ") : "—"}
                    meta={split && champion ? savingText(champion.total, split.total) : ""} />
                  <Slab label="Price disparity spread" icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
                    big={spread ? inr(spread.hi - spread.lo) : "—"} title="Highest vs lowest full basket"
                    meta={spread ? `${inr(spread.hi)} → ${inr(spread.lo)}` : "Needs 2+ complete stores"} />
                </div>

                <Matrix lines={lines} platforms={platforms} ran={ran} ctx={ctx}
                  onVariant={(key, sku) => updateItem(key, { sku })}
                  onPin={(key, pin) => updateItem(key, { pin })} />
              </section>

              <section className={`${step === 3 ? "block" : "hidden"} space-y-4 lg:block`}>
                <SectionLabel n="03" t="Basket checkout blueprint" />
                <div className="rounded-sm border border-border bg-card">
                  <div className="flex border-b border-border font-mono text-[12px]">
                    {(["A", "B"] as const).map((k) => (
                      <button key={k} onClick={() => setPlanTab(k)} className={`flex-1 px-4 py-3 text-left ${plan === k ? "border-b-2 border-primary bg-card" : "bg-secondary text-muted-foreground"}`}>
                        PLAN {k} — {k === "A" ? "Single cart convenience" : "Split cart savings"}
                      </button>
                    ))}
                  </div>
                  <div className="p-4">
                    {plan === "A" && champion && <Blueprint plan={champion} />}
                    {plan === "B" && split && <Blueprint plan={split} />}
                  </div>
                </div>
                <button onClick={() => setSaved((s) => s + 1)} className="rounded-sm border border-border-strong px-3 py-2 font-mono text-[12px] hover:bg-secondary">+ SAVE THIS BASKET</button>
              </section>
            </>
          )}

          <section className="space-y-3">
            <button onClick={() => setShowHistory((v) => !v)} className="flex w-full items-center justify-between border-t border-border pt-4">
              <SectionLabel n="04" t="Price history & arbitrage trends" />
              <span className="font-mono text-[11px] text-muted-foreground">{showHistory ? "COLLAPSE −" : "EXPAND +"}</span>
            </button>
            {showHistory && (
              <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 xl:grid-cols-5">
                {trends.map((h) => (
                  <div key={h.key} className="bg-card p-3">
                    <div className="text-[12px] font-medium">{h.label}</div>
                    <div className="label-mono">30D VOL {h.vol}</div>
                    <Sparkline points={h.points} />
                    <div className="font-mono text-[11px] tabular-nums text-muted-foreground">{inr(Math.min(...h.points))} – {inr(Math.max(...h.points))}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function savingText(single: number, split: number) {
  const d = single - split;
  if (d <= 0) return "No saving vs single store";
  return `Saves ${inr(d)} (${((d / single) * 100).toFixed(1)}%) after fees`;
}

function SectionLabel({ n, t }: { n: string; t: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-[11px] text-accent">{n} /</span>
      <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em]">{t}</h2>
    </div>
  );
}

function Slab({ label, icon, big, title, meta, tone }: { label: string; icon: React.ReactNode; big: string; title: string; meta: string; tone?: "amber" }) {
  return (
    <div className={`p-4 ${tone === "amber" ? "bg-amber-soft" : "bg-card"}`}>
      <div className="label-mono flex items-center gap-1.5">{icon}{label}</div>
      <div className="mt-3 font-serif text-[15px] italic">{title}</div>
      <div className="font-mono text-3xl font-semibold tabular-nums tracking-tight">{big}</div>
      <div className="mt-1 font-mono text-[11px] text-muted-foreground">{meta}</div>
    </div>
  );
}

function TokenRow({ it, onChange, onRemove }: { it: ParsedItem; onChange: (p: Partial<ParsedItem>) => void; onRemove: () => void }) {
  return (
    <li className="flex items-center gap-2 px-3 py-2">
      <div className="min-w-0 flex-1">
        {it.sku ? (
          <div className="flex flex-wrap items-center gap-1 font-mono text-[11px]">
            <span className="rounded-sm bg-secondary px-1.5 py-0.5">{it.sku.brand}</span>
            <span className="rounded-sm bg-secondary px-1.5 py-0.5">{it.sku.name}</span>
            <select value={it.sku.id} onChange={(e) => onChange({ sku: CATALOG.find((s) => s.id === e.target.value) ?? it.sku })}
              className="rounded-sm border border-border bg-card px-1 py-0.5">
              {it.alternatives.map((a) => <option key={a.id} value={a.id}>{a.brand === it.sku!.brand && a.name === it.sku!.name ? a.size : `${a.brand} ${a.size}`}</option>)}
            </select>
            <span className={it.confidence >= 90 ? "text-primary" : "text-accent"}>({it.confidence}% match)</span>
          </div>
        ) : (
          <div className="font-mono text-[11px] text-destructive">NO MATCH — “{it.raw}”</div>
        )}
      </div>
      {it.sku && (
        <div className="flex items-center rounded-sm border border-border font-mono text-[12px]">
          <button aria-label="Decrease" onClick={() => onChange({ count: Math.max(1, it.count - 1) })} className="px-1.5 py-1"><Minus className="h-3 w-3" /></button>
          <span className="w-5 text-center tabular-nums">{it.count}</span>
          <button aria-label="Increase" onClick={() => onChange({ count: it.count + 1 })} className="px-1.5 py-1"><Plus className="h-3 w-3" /></button>
        </div>
      )}
      <button aria-label="Remove item" onClick={onRemove} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
    </li>
  );
}

function Matrix({ lines, platforms, ran, ctx, onVariant, onPin }: {
  lines: Line[];
  platforms: typeof PLATFORMS;
  ran: ParsedItem[];
  ctx: EngineCtx;
  onVariant: (key: string, sku: Sku) => void;
  onPin: (key: string, pin: PlatformId | null) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-sm border border-border bg-card">
      <table className="w-full min-w-[900px] border-collapse text-[13px]">
        <thead className="sticky top-0 bg-secondary">
          <tr className="border-b border-border text-left">
            <th className="label-mono px-3 py-2 font-normal">Item & variant</th>
            {platforms.map((p) => {
              const surge = ctx.surgeOf(p);
              return (
                <th key={p.id} className="label-mono px-3 py-2 text-right font-normal">
                  {p.name}
                  <div className="flex items-center justify-end gap-1 normal-case tracking-normal"><Clock className="h-3 w-3" />{p.eta}</div>
                  {surge > 0 && <div className="mt-0.5 font-mono text-[10px] normal-case tracking-normal text-accent">+{inr(surge)} {p.surgeReason}</div>}
                </th>
              );
            })}
            <th className="label-mono px-3 py-2 text-right font-normal">Best unit rate</th>
            <th className="label-mono px-3 py-2 text-right font-normal">Action</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => {
            const best = cheapestPlatform(l.sku, platforms);
            const bp = best ? l.sku.prices[best]! : null;
            const alts = ran.find((r) => r.key === l.key)?.alternatives ?? [];
            return (
              <tr key={l.key} className="border-b border-border last:border-0">
                <td className="px-3 py-2.5">
                  <div className="font-mono text-[10.5px] uppercase text-muted-foreground">{l.sku.brand}</div>
                  <div className="font-medium">{l.sku.name}</div>
                  <div className="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                    <select value={l.sku.id} onChange={(e) => { const s = CATALOG.find((c) => c.id === e.target.value); if (s) onVariant(l.key, s); }}
                      className="rounded-sm border border-border bg-card px-1">
                      {alts.map((a) => <option key={a.id} value={a.id}>{a.size}</option>)}
                    </select>
                    × {l.count}
                  </div>
                </td>
                {platforms.map((p) => {
                  const v = l.sku.prices[p.id];
                  if (v == null) return <td key={p.id} className="oos-hatch px-3 py-2.5 text-right font-mono text-[11px] text-destructive">OOS</td>;
                  const win = p.id === best;
                  const pinned = p.id === l.pin;
                  return (
                    <td key={p.id} className={`px-3 py-2.5 text-right font-mono tabular-nums ${win ? "border-x border-win-border bg-win text-win-foreground" : ""} ${pinned ? "outline outline-1 -outline-offset-1 outline-primary" : ""}`}>
                      <div className="text-[14px] font-semibold">{inr(v * l.count)}</div>
                      <div className="text-[11px] text-muted-foreground"><s>{inr(l.sku.mrp * l.count)}</s></div>
                      <div className="text-[10.5px]">{unitRate(l.sku, v)}</div>
                      {win && <div className="mt-0.5 flex items-center justify-end gap-0.5 text-[10px] font-semibold"><Check className="h-3 w-3" />LOWEST</div>}
                      {pinned && <div className="mt-0.5 flex items-center justify-end gap-0.5 text-[10px] font-semibold text-primary"><Pin className="h-3 w-3" />PINNED</div>}
                    </td>
                  );
                })}
                <td className="px-3 py-2.5 text-right font-mono text-[11px]">
                  {bp != null ? <><div className="font-semibold">{unitRate(l.sku, bp)}</div><div className="text-muted-foreground">[TAG: LOWEST_UNIT_RATE]</div></> : "—"}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <select value={l.pin ?? ""} onChange={(e) => onPin(l.key, (e.target.value || null) as PlatformId | null)}
                    aria-label={`Pin store for ${l.sku.brand} ${l.sku.name}`}
                    className={`rounded-sm border bg-card px-1 py-0.5 font-mono text-[11px] ${l.pin ? "border-primary text-primary" : "border-border"}`}>
                    <option value="">AUTO</option>
                    {platforms.map((p) => <option key={p.id} value={p.id}>{p.short}</option>)}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Blueprint({ plan }: { plan: Plan }) {
  const copy = (text: string) => navigator.clipboard?.writeText(text);
  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${plan.carts.length > 1 ? "md:grid-cols-2" : ""}`}>
        {plan.carts.map((c, i) => (
          <div key={c.platform.id} className="rounded-sm border border-border">
            <div className="flex items-center justify-between border-b border-border bg-secondary px-3 py-2">
              <span className="font-mono text-[11px] font-semibold">CART {i + 1} · {c.platform.name.toUpperCase()}{c.fees.pickup ? " · PICKUP" : ""}</span>
              <span className="flex items-center gap-3 font-mono text-[10.5px]">
                <button onClick={() => copy(c.lines.map((l) => `${l.count} x ${l.sku.brand} ${l.sku.name} ${l.sku.size}`).join("\n"))}
                  className="text-primary hover:underline">COPY ORDER</button>
                <a href={c.platform.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OPEN STORE ↗</a>
              </span>
            </div>
            <ul className="divide-y divide-border">
              {c.lines.map((l) => (
                <li key={l.key} className="flex justify-between px-3 py-1.5 text-[13px]">
                  <span>{l.count} × {l.sku.brand} {l.sku.name} <span className="font-mono text-[11px] text-muted-foreground">{l.sku.size}</span></span>
                  <span className="font-mono tabular-nums">{inr((l.sku.prices[c.platform.id] ?? 0) * l.count)}</span>
                </li>
              ))}
            </ul>
            <table className="w-full border-t border-border font-mono text-[12px] tabular-nums">
              <tbody>
                <FeeRow k="Item subtotal" v={inr(c.subtotal)} />
                <FeeRow k={c.fees.pickup ? "Store pickup" : "Delivery fee"} v={c.fees.delivery ? inr(c.fees.delivery) : "FREE"} />
                <FeeRow k="Handling fee" v={inr(c.fees.handling)} />
                {c.fees.surge > 0 && <FeeRow k={c.platform.surgeReason ?? "Surge charge"} v={inr(c.fees.surge)} />}
                <FeeRow k="Cart total" v={inr(c.total)} strong />
              </tbody>
            </table>
            {c.fees.gapToFree != null && c.fees.delivery > 0 && (
              <div className="border-t border-border bg-amber-soft px-3 py-2 text-[12px]">
                Add <b className="font-mono">{inr(c.fees.gapToFree)}</b> on {c.platform.name} to waive the {inr(c.fees.delivery)} delivery fee.
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-baseline justify-between border-t border-border-strong pt-3">
        <span className="label-mono">{plan.carts.length} checkout{plan.carts.length > 1 ? "s" : ""} · {plan.fulfilled} items{plan.missing.length ? ` · ${plan.missing.length} unavailable` : ""}</span>
        <span className="font-mono text-2xl font-semibold tabular-nums">{inr(plan.total)}</span>
      </div>
    </div>
  );
}

function FeeRow({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <tr className={strong ? "border-t border-border font-semibold" : ""}>
      <td className="px-3 py-1 text-muted-foreground">{k}</td>
      <td className="px-3 py-1 text-right">{v}</td>
    </tr>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const w = 160, h = 36, min = Math.min(...points), max = Math.max(...points);
  const d = points.map((p, i) => `${i ? "L" : "M"}${((i / (points.length - 1)) * w).toFixed(1)},${(h - ((p - min) / (max - min || 1)) * (h - 4) - 2).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="my-2 h-9 w-full text-primary" preserveAspectRatio="none">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
