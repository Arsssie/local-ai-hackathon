import { ScanResult } from "./types";
import { fromBackend } from "./adapter";
import sample from "../data/sample_response.json";

// Set to false to go back to the mock (e.g. when running in Expo Go)
const USE_REAL_MODEL = true;

export async function detect(imageUri: string): Promise<ScanResult> {
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
