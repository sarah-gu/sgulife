import BrainPage from "@/components/brain/BrainPage";
import { loadBrainData } from "@/lib/brain-data.server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await loadBrainData();
  return (
    <main style={{ position: "fixed", inset: 0 }}>
      <BrainPage data={data} />
    </main>
  );
}
