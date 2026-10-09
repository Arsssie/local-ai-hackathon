import { ScanResult } from "./types";

export async function detect(imageUri: string): Promise<ScanResult> {
  const start = Date.now();

  // MOCK: replace with real on-device model inference later
  await new Promise((r) => setTimeout(r, 600));

  return {
    imageUri,
    inferenceMs: Date.now() - start,
    detections: [
      {
        label: "plastic",
        confidence: 0.91,
        box: { x: 0.1, y: 0.2, width: 0.4, height: 0.5 },
      },
      {
        label: "paper",
        confidence: 0.74,
        box: { x: 0.55, y: 0.3, width: 0.3, height: 0.4 },
      },
    ],
  };
}
