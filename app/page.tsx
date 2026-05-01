import BrainPage from "@/components/brain/BrainPage";
import { loadBrainData } from "@/lib/brain-data";

export default function Home() {
  const data = loadBrainData();
  return (
    <main style={{ position: "fixed", inset: 0 }}>
      <BrainPage data={data} initialRoute="brain" />
    </main>
  );
}
