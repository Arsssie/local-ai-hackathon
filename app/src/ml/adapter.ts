import { Detection } from "./types";

export type BackendResponse = {
  image: { width: number; height: number };
  detections: {
    class: string;
    confidence: number;
    bbox: { x1: number; y1: number; x2: number; y2: number };
  }[];
};

const clamp = (v: number) => Math.max(0, Math.min(1, v));

export function fromBackend(data: BackendResponse): Detection[] {
  const { width: w, height: h } = data.image;
  return data.detections.map((d) => ({
    label: d.class.toLowerCase(),
    confidence: d.confidence,
    box: {
      x: clamp(d.bbox.x1 / w),
      y: clamp(d.bbox.y1 / h),
      width: clamp((d.bbox.x2 - d.bbox.x1) / w),
      height: clamp((d.bbox.y2 - d.bbox.y1) / h),
    },
  }));
}
