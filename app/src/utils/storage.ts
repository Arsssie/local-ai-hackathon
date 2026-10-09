import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScanResult } from "../ml/types";

const KEY = "gigo_history";

export type HistoryItem = ScanResult & {
  id: string;
  timestamp: number;
};

export async function getHistory(): Promise<HistoryItem[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveScan(result: ScanResult): Promise<void> {
  const history = await getHistory();
  const item: HistoryItem = {
    ...result,
    id: Date.now().toString(),
    timestamp: Date.now(),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify([item, ...history]));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
