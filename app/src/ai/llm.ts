// classifies an object name as biodegradable / non-biodegradable / recyclable
// using a local GGUF model through llama.rn.
import { initLlama, LlamaContext } from "llama.rn";

const LABELS = ["biodegradable", "non-biodegradable", "recyclable"] as const;
export type Category = (typeof LABELS)[number] | "unknown";

type Msg = { role: "system" | "user" | "assistant"; content: string };

const SYSTEM_PROMPT =
  "You sort household waste in the Philippines. The user gives the name of " +
  'one object. Reply with JSON like {"category": "recyclable"} where ' +
  "category is exactly one of:\n" +
  "- biodegradable: food, fruit, vegetables, peels, bones, leaves, plants, wood, anything that rots naturally\n" +
  "- recyclable: plastic bottles, glass, metal cans, cardboard, paper, aluminum, metal utensils\n" +
  "- non-biodegradable: things that neither rot nor are commonly recycled, such as wrappers, styrofoam, straws, diapers, ceramics, old rubber, broken electronics\n" +
  "All food is biodegradable.";

const FEWSHOT: [string, Category][] = [
  ["egg shell", "biodegradable"],
  ["soda can", "recyclable"],
  ["candy wrapper", "non-biodegradable"],
  ["newspaper", "recyclable"],
  ["fish bone", "biodegradable"],
  ["styrofoam food box", "non-biodegradable"],
  ["glass jar", "recyclable"],
  ["dried leaves", "biodegradable"],
  ["fried chicken", "biodegradable"],
  ["steel pot", "recyclable"],
  ["leftover rice", "biodegradable"],
  ["broken ceramic plate", "non-biodegradable"],
];

let ctx: LlamaContext | null = null;
const cache = new Map<string, Category>();

export async function loadLlm(modelPath: string) {
  ctx = await initLlama({ model: modelPath, n_ctx: 1024, n_threads: 4 });
}

function buildMessages(name: string): Msg[] {
  const msgs: Msg[] = [{ role: "system", content: SYSTEM_PROMPT }];
  for (const [obj, cat] of FEWSHOT.slice(0, 6)) {
    msgs.push({ role: "user", content: `Object: ${obj}` });
    msgs.push({
      role: "assistant",
      content: JSON.stringify({ category: cat }),
    });
  }
  msgs.push({ role: "user", content: `Object: ${name}` });
  return msgs;
}

const QUICK: Record<string, Category> = {
  bottle: "recyclable",
  "wine glass": "recyclable",
  fork: "recyclable",
  knife: "recyclable",
  spoon: "recyclable",
  book: "recyclable",
  scissors: "recyclable",
  banana: "biodegradable",
  apple: "biodegradable",
  orange: "biodegradable",
  sandwich: "biodegradable",
  broccoli: "biodegradable",
  carrot: "biodegradable",
  "hot dog": "biodegradable",
  pizza: "biodegradable",
  donut: "biodegradable",
  cake: "biodegradable",
  cup: "non-biodegradable",
  bowl: "non-biodegradable",
  toothbrush: "non-biodegradable",
  backpack: "non-biodegradable",
  handbag: "non-biodegradable",
  umbrella: "non-biodegradable",
  tie: "non-biodegradable",
  suitcase: "non-biodegradable",
  frisbee: "non-biodegradable",
  "sports ball": "non-biodegradable",
  kite: "non-biodegradable",
};

export async function classify(name: string): Promise<Category> {
  const quick = QUICK[name];
  if (quick) return quick;
  const hit = cache.get(name);
  if (hit) return hit;
  if (!ctx) return "unknown";
  try {
    const res = await ctx.completion({
      messages: buildMessages(name),
      temperature: 0,
      n_predict: 16,
      stop: ["<|eot_id|>", "<|end_of_text|>"],
    });
    console.log("[LLM raw]", JSON.stringify(res.text));
    const t = res.text.toLowerCase();
    // check "non-biodegradable" first, since it contains "biodegradable"
    const out: Category = t.includes("non-biodegradable")
      ? "non-biodegradable"
      : t.includes("recyclable")
        ? "recyclable"
        : t.includes("biodegradable")
          ? "biodegradable"
          : "unknown";
    cache.set(name, out);
    return out;
  } catch (e) {
    console.warn("[LLM error]", e);
    return "unknown";
  }
}
