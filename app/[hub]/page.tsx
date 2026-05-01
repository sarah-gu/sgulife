import BrainPage from "@/components/brain/BrainPage";
import { HUBS_BASE, type HubId } from "@/lib/brain";
import { loadBrainData } from "@/lib/brain-data";
import { notFound } from "next/navigation";

const VALID_HUBS = new Set<string>(HUBS_BASE.map((h) => h.id));

export function generateStaticParams() {
  return HUBS_BASE.map((h) => ({ hub: h.id }));
}

export default async function HubPage({
  params,
}: {
  params: Promise<{ hub: string }>;
}) {
  const { hub } = await params;
  if (!VALID_HUBS.has(hub)) notFound();
  const data = loadBrainData();
  return (
    <main style={{ position: "fixed", inset: 0 }}>
      <BrainPage data={data} initialRoute={hub as HubId} />
    </main>
  );
}
