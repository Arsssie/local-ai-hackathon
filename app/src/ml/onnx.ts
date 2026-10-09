import { InferenceSession, Tensor } from "onnxruntime-react-native";
import { Asset } from "expo-asset";
import * as ImageManipulator from "expo-image-manipulator";
import jpeg from "jpeg-js";
import { Buffer } from "buffer";
import { Detection, ScanResult } from "./types";
import labels from "./labels.json";

const SIZE = 640;
const NUM_CLASSES = labels.length; // 6
const NUM_BOXES = 8400;
const CONF_THRESHOLD = 0.4;
const IOU_THRESHOLD = 0.45;

// ---------- model loading (once) ----------
let sessionPromise: Promise<InferenceSession> | null = null;

export function loadModel() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const asset = Asset.fromModule(require("../../assets/model/best.onnx"));
      await asset.downloadAsync();
      const path = (asset.localUri ?? asset.uri).replace("file://", "");
      return InferenceSession.create(path);
    })().catch((e) => {
      sessionPromise = null;
      throw e;
    });
  }
  return sessionPromise;
}

// ---------- preprocessing: resize, letterbox to 640x640, RGB, 0-1, CHW ----------
async function preprocess(uri: string) {
  // resize so the longest side is 640 (keeps aspect ratio)
  let img = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: SIZE } }],
    {
      format: ImageManipulator.SaveFormat.JPEG,
      compress: 0.9,
    },
  );
  if (img.height > SIZE) {
    img = await ImageManipulator.manipulateAsync(
      img.uri,
      [{ resize: { height: SIZE } }],
      {
        format: ImageManipulator.SaveFormat.JPEG,
        compress: 0.9,
        base64: true,
      },
    );
  } else {
    img = await ImageManipulator.manipulateAsync(img.uri, [], {
      format: ImageManipulator.SaveFormat.JPEG,
      compress: 0.9,
      base64: true,
    });
  }

  const raw = Buffer.from(img.base64!, "base64");
  const decoded = jpeg.decode(raw, { useTArray: true, formatAsRGBA: true });
  const w = decoded.width;
  const h = decoded.height;
  const padX = Math.floor((SIZE - w) / 2);
  const padY = Math.floor((SIZE - h) / 2);

  const area = SIZE * SIZE;
  const data = new Float32Array(3 * area).fill(114 / 255); // gray padding
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const src = (y * w + x) * 4;
      const dst = (y + padY) * SIZE + (x + padX);
      data[dst] = decoded.data[src] / 255; // R
      data[area + dst] = decoded.data[src + 1] / 255; // G
      data[2 * area + dst] = decoded.data[src + 2] / 255; // B
    }
  }
  return { data, w, h, padX, padY };
}

// ---------- postprocessing: decode + NMS ----------
type Cand = {
  cls: number;
  score: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

function iou(a: Cand, b: Cand) {
  const ix = Math.max(0, Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1));
  const iy = Math.max(0, Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1));
  const inter = ix * iy;
  const union =
    (a.x2 - a.x1) * (a.y2 - a.y1) + (b.x2 - b.x1) * (b.y2 - b.y1) - inter;
  return union <= 0 ? 0 : inter / union;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function postprocess(
  out: Float32Array,
  p: { w: number; h: number; padX: number; padY: number },
): Detection[] {
  const cands: Cand[] = [];
  for (let i = 0; i < NUM_BOXES; i++) {
    let best = -1;
    let bestScore = 0;
    for (let c = 0; c < NUM_CLASSES; c++) {
      const s = out[(4 + c) * NUM_BOXES + i];
      if (s > bestScore) {
        bestScore = s;
        best = c;
      }
    }
    if (best < 0 || bestScore < CONF_THRESHOLD) continue;
    const cx = out[i];
    const cy = out[NUM_BOXES + i];
    const w = out[2 * NUM_BOXES + i];
    const h = out[3 * NUM_BOXES + i];
    cands.push({
      cls: best,
      score: bestScore,
      x1: cx - w / 2,
      y1: cy - h / 2,
      x2: cx + w / 2,
      y2: cy + h / 2,
    });
  }

  cands.sort((a, b) => b.score - a.score);
  const kept: Cand[] = [];
  for (const c of cands) {
    if (kept.every((k) => k.cls !== c.cls || iou(k, c) < IOU_THRESHOLD))
      kept.push(c);
  }

  // convert from letterboxed 640 space back to normalized 0-1 of the photo
  return kept.map((k) => {
    const x1 = clamp01((k.x1 - p.padX) / p.w);
    const y1 = clamp01((k.y1 - p.padY) / p.h);
    const x2 = clamp01((k.x2 - p.padX) / p.w);
    const y2 = clamp01((k.y2 - p.padY) / p.h);
    return {
      label: labels[k.cls].toLowerCase(),
      confidence: k.score,
      box: { x: x1, y: y1, width: x2 - x1, height: y2 - y1 },
    };
  });
}

// ---------- public ----------
export async function detectOnnx(imageUri: string): Promise<ScanResult> {
  const session = await loadModel(); // load time not counted below
  const start = Date.now();

  const prep = await preprocess(imageUri);
  const input = new Tensor("float32", prep.data, [1, 3, SIZE, SIZE]);
  const results = await session.run({ [session.inputNames[0]]: input });
  const output = results[session.outputNames[0]].data as Float32Array;

  return {
    imageUri,
    inferenceMs: Date.now() - start,
    detections: postprocess(output, prep),
  };
}
