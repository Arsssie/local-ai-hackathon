// runs YOLO11n (.tflite) on a photo and returns waste-like detections.
// Model I/O: input [1,3,640,640] float32 (NCHW), output [1,84,8400] float32.
import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import jpeg from "jpeg-js";
import { Buffer } from "buffer";

const SIZE = 640;
const N = 8400;
const NC = 80;
const CONF_THRESHOLD = 0.4;
const IOU_THRESHOLD = 0.45;

export interface Detection {
  name: string;
  confidence: number;
  box: { x: number; y: number; w: number; h: number }; // normalized 0..1, x/y = top-left
}

const COCO = [
  "person",
  "bicycle",
  "car",
  "motorcycle",
  "airplane",
  "bus",
  "train",
  "truck",
  "boat",
  "traffic light",
  "fire hydrant",
  "stop sign",
  "parking meter",
  "bench",
  "bird",
  "cat",
  "dog",
  "horse",
  "sheep",
  "cow",
  "elephant",
  "bear",
  "zebra",
  "giraffe",
  "backpack",
  "umbrella",
  "handbag",
  "tie",
  "suitcase",
  "frisbee",
  "skis",
  "snowboard",
  "sports ball",
  "kite",
  "baseball bat",
  "baseball glove",
  "skateboard",
  "surfboard",
  "tennis racket",
  "bottle",
  "wine glass",
  "cup",
  "fork",
  "knife",
  "spoon",
  "bowl",
  "banana",
  "apple",
  "sandwich",
  "orange",
  "broccoli",
  "carrot",
  "hot dog",
  "pizza",
  "donut",
  "cake",
  "chair",
  "couch",
  "potted plant",
  "bed",
  "dining table",
  "toilet",
  "tv",
  "laptop",
  "mouse",
  "remote",
  "keyboard",
  "cell phone",
  "microwave",
  "oven",
  "toaster",
  "sink",
  "refrigerator",
  "book",
  "clock",
  "vase",
  "scissors",
  "teddy bear",
  "hair drier",
  "toothbrush",
];

const NOT_WASTE = new Set([
  "person",
  "bicycle",
  "car",
  "motorcycle",
  "airplane",
  "bus",
  "train",
  "truck",
  "boat",
  "traffic light",
  "fire hydrant",
  "stop sign",
  "parking meter",
  "bench",
  "bird",
  "cat",
  "dog",
  "horse",
  "sheep",
  "cow",
  "elephant",
  "bear",
  "zebra",
  "giraffe",
  "chair",
  "couch",
  "potted plant",
  "bed",
  "dining table",
  "toilet",
  "tv",
  "laptop",
  "mouse",
  "remote",
  "keyboard",
  "cell phone",
  "microwave",
  "oven",
  "toaster",
  "sink",
  "refrigerator",
  "clock",
  "vase",
  "teddy bear",
  "hair drier",
]);

let model: TensorflowModel | null = null;

export async function loadDetector() {
  const source = require("../../assets/model/yolo11n.tflite");
  model = await loadTensorflowModel(source, []); // [] = CPU only
  console.log(
    "IN",
    JSON.stringify(model.inputs),
    "OUT",
    JSON.stringify(model.outputs),
  );
}

// RGBA bytes -> planar float32 RGB (NCHW), values 0..1
function toInput(rgba: Uint8Array): Float32Array {
  const plane = SIZE * SIZE;
  const input = new Float32Array(3 * plane);
  for (let p = 0, i = 0; p < plane; p++, i += 4) {
    input[p] = rgba[i] / 255;
    input[plane + p] = rgba[i + 1] / 255;
    input[2 * plane + p] = rgba[i + 2] / 255;
  }
  return input;
}

function iou(a: Detection["box"], b: Detection["box"]) {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = a.w * a.h + b.w * b.h - inter;
  return union > 0 ? inter / union : 0;
}

export async function detect(photoUri: string): Promise<Detection[]> {
  if (!model) throw new Error("Call loadDetector() first");

  // Stretch to 640x640 (no letterbox), so normalized boxes map straight back to the photo.
  const resized = await manipulateAsync(
    photoUri,
    [{ resize: { width: SIZE, height: SIZE } }],
    { format: SaveFormat.JPEG, compress: 1, base64: true },
  );
  const img = jpeg.decode(Buffer.from(resized.base64!, "base64"), {
    useTArray: true,
    formatAsRGBA: true,
  });

  const input = toInput(img.data as unknown as Uint8Array);
  const result = model.runSync([input.buffer as ArrayBuffer]);
  const out = new Float32Array(result[0] as unknown as ArrayBuffer);

  // Box values may be in pixels (0..640) or already normalized; detect which.
  let maxCoord = 0;
  for (let i = 0; i < 4 * N; i++) if (out[i] > maxCoord) maxCoord = out[i];
  const k = maxCoord > 2 ? 1 / SIZE : 1;

  const raw: { name: string; s: number }[] = [];
  for (let j = 0; j < N; j++) {
    let best = -1,
      bs = 0;
    for (let c = 0; c < NC; c++) {
      const s = out[(4 + c) * N + j];
      if (s > bs) {
        bs = s;
        best = c;
      }
    }
    if (best >= 0 && bs > 0.2)
      raw.push({ name: COCO[best], s: Math.round(bs * 100) / 100 });
  }
  raw.sort((a, b) => b.s - a.s);
  console.log("RAW TOP", JSON.stringify(raw.slice(0, 8)), "maxCoord", maxCoord);

  const candidates: Detection[] = [];
  for (let j = 0; j < N; j++) {
    let best = -1;
    let bestScore = 0;
    for (let c = 0; c < NC; c++) {
      const s = out[(4 + c) * N + j];
      if (s > bestScore) {
        bestScore = s;
        best = c;
      }
    }
    if (best < 0 || bestScore < CONF_THRESHOLD) continue;
    const name = COCO[best];
    if (NOT_WASTE.has(name)) continue;

    const cx = out[j] * k;
    const cy = out[N + j] * k;
    const w = out[2 * N + j] * k;
    const h = out[3 * N + j] * k;
    const x = Math.max(0, cx - w / 2);
    const y = Math.max(0, cy - h / 2);
    candidates.push({
      name,
      confidence: bestScore,
      box: { x, y, w: Math.min(w, 1 - x), h: Math.min(h, 1 - y) },
    });
  }

  // Greedy non-max suppression, per class
  candidates.sort((a, b) => b.confidence - a.confidence);
  const kept: Detection[] = [];
  for (const d of candidates) {
    if (
      !kept.some((m) => m.name === d.name && iou(m.box, d.box) > IOU_THRESHOLD)
    ) {
      kept.push(d);
    }
  }
  return kept;
}
