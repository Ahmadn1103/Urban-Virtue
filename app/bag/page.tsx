import type { Metadata } from "next";
import BagView from "@/components/bag/BagView";
import { getBag } from "@/lib/bag";
import "../hero.css";
import "./bag.css";

export const metadata: Metadata = {
  title: "Your Atelier Bag | Urban Virtue",
  description: "Review your bespoke Urban Virtue formulas before checkout.",
};

export default async function BagPage() {
  const bag = await getBag();
  return <BagView initialBag={bag} />;
}
