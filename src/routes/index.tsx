import { createFileRoute } from "@tanstack/react-router";
import { Workbench } from "@/components/smartcart/Workbench";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartCart — Grocery price comparison workbench" },
      { name: "description", content: "Paste your grocery list and compare Blinkit, Zepto, Instamart, BigBasket, DMart and JioMart, fees included." },
      { property: "og:title", content: "SmartCart — Compare smarter. Shop cheaper." },
      { property: "og:description", content: "Find the cheapest single store or split cart for your grocery basket in India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <Workbench />;
}
