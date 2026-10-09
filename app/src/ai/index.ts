import { loadDetector, detect as detectObjects } from "./detector";
import { loadLlm, classify, Category } from "./llm";

export type AiItem = {
  name: string;
  confidence: number;
  category: Category;
  box: { x: number; y: number; w: number; h: number };
};

let initPromise: Promise<void> | null = null;

export function initAi(opts: {
  llmModelPath: string;
  onProgress?: (s: string) => void;
}): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      opts.onProgress?.("Loading object detector...");
      await loadDetector();
      opts.onProgress?.("Loading language model (first launch is slow)...");
      await loadLlm(opts.llmModelPath);
      opts.onProgress?.("Ready");
    })().catch((e) => {
      initPromise = null; // allow Retry
      throw e;
    });
  }
  return initPromise;
}

export async function analyze(imageUri: string): Promise<AiItem[]> {
  const t0 = Date.now();
  const found = await detectObjects(imageUri);
  console.log("[TIME] detect", Date.now() - t0, "ms");
  console.log("DETECTED", JSON.stringify(found));
  const items: AiItem[] = [];
  // one at a time: the LLM can only run one prompt at once
  for (const d of found) {
    items.push({ ...d, category: await classify(d.name) });
  }
  console.log("[TIME] total", Date.now() - t0, "ms");
  return items;
}
