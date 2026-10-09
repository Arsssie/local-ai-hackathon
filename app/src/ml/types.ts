export type Detection = {
  label: string; // class name, e.g. "plastic"
  confidence: number; // 0 to 1
  // normalized 0-1 relative to the image (used later for drawing boxes)
  box: { x: number; y: number; width: number; height: number };
};

export type ScanResult = {
  imageUri: string;
  detections: Detection[];
  inferenceMs: number;
};
