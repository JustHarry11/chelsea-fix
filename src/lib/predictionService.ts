// lib/predictionService.ts
export type StoredPrediction = {
  fixtureId: number;
  prediction: "WIN" | "LOSE" | "DRAW";
  lockedAt: number;
  result: "WIN" | "LOSE" | "DRAW" | null;
  success: boolean | null;
  resolvedAt?: number;
};

const PREFIX = "prediction_";

export const predictionService = {
  savePrediction(fixtureId: number, prediction: StoredPrediction["prediction"]): StoredPrediction {
    const record: StoredPrediction = {
      fixtureId,
      prediction,
      lockedAt: Date.now(),
      result: null,
      success: null,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(PREFIX + fixtureId, JSON.stringify(record));
    }
    return record;
  },

  loadPrediction(fixtureId: number): StoredPrediction | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(PREFIX + fixtureId);
    return raw ? (JSON.parse(raw) as StoredPrediction) : null;
  },

  saveResult(fixtureId: number, result: StoredPrediction["result"], success: boolean) {
    if (typeof window === "undefined") return null;

    const raw = localStorage.getItem(PREFIX + fixtureId);
    if (!raw) return null;

    const rec = JSON.parse(raw) as StoredPrediction;
    rec.result = result;
    rec.success = success;
    rec.resolvedAt = Date.now();

    localStorage.setItem(PREFIX + fixtureId, JSON.stringify(rec));
    return rec;
  },
};
