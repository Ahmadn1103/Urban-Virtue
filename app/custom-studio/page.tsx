import type { Metadata } from "next";
import CustomBlend from "@/components/hero/CustomBlend";
import "../hero.css";

export const metadata: Metadata = {
  title: "Custom Studio | Urban Virtue",
  description:
    "Compose your own Urban Virtue parfum: pick two or three notes, watch each pour a third of the flacon, then seal and name it.",
};

// The 3D blend studio at its own address (the home page shows the same studio)
export default function CustomStudioPage() {
  return <CustomBlend />;
}
