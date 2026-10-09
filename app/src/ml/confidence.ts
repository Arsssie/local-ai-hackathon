import { Detection } from "./types";

export const SURE_THRESHOLD = 0.65;

export function isUnsure(d: Detection) {
  const area = d.box.width * d.box.height;
  return d.confidence < SURE_THRESHOLD || (area > 0.9 && d.confidence < 0.8);
}
