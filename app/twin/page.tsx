import type { Metadata, Viewport } from "next";
import TwinChat from "@/components/twin/TwinChat";

export const metadata: Metadata = {
  title: "Sarah Gu",
  description: "Text Sarah.",
  alternates: { canonical: "https://twin.sgu.life" },
  openGraph: {
    title: "Sarah Gu",
    description: "Text Sarah.",
    url: "https://twin.sgu.life",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content", // browsers that support it shrink the page for the keyboard
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function TwinPage() {
  return <TwinChat />;
}
