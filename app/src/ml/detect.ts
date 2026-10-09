import { ScanResult } from "./types";
import { fromBackend } from "./adapter";
import sample from "../data/sample_response.json";
import { analyze } from "../ai";

// Set to false to go back to the mock (e.g. when running in Expo Go)
const USE_REAL_MODEL = true;
const USE_AI_PIPELINE = true;

export async function detect(imageUri: string): Promise<ScanResult> {
  if (USE_AI_PIPELINE) {
    const start = Date.now();
    const items = await analyze(imageUri);
    return {
      imageUri,
      inferenceMs: Date.now() - start,
      detections: items.map((i) => ({
        label: i.name,
        confidence: i.confidence,
        category: i.category,
        box: { x: i.box.x, y: i.box.y, width: i.box.w, height: i.box.h },
      })),
    };
  }
  if (USE_REAL_MODEL) {
    const { detectOnnx } = require("./onnx");
    return detectOnnx(imageUri);
  }

  const start = Date.now();
  await new Promise((r) => setTimeout(r, 600));
  return {
    imageUri,
    inferenceMs: Date.now() - start,
    detections: fromBackend(sample as any),
  };
}
