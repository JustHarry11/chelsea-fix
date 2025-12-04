"use client";

import { useEffect, useState } from "react";
import { predictionService, StoredPrediction } from "../lib/predictionService";

type Match = {
  id: number;
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  score: { fullTime: { home: number; away: number } };
  utcDate: string;
};

type Props = {
  fixture: Match | null;
  previousMatches: Match[];
};

export default function PredictionBox({ fixture, previousMatches }: Props) {
  const [choice, setChoice] = useState<StoredPrediction["prediction"] | "">("");
  const [locked, setLocked] = useState(false);
  const [status, setStatus] = useState<null | "locked" | "resolved">(null);
  const [resultInfo, setResultInfo] = useState<{
    result: "WIN" | "LOSE" | "DRAW";
    success: boolean;
  } | null>(null);

  function getMatchResultFromFinished(match: Match): "WIN" | "LOSE" | "DRAW" {
    const home = match.score.fullTime.home;
    const away = match.score.fullTime.away;
    const isChelseaHome = match.homeTeam.id === 61;

    const gf = isChelseaHome ? home : away;
    const ga = isChelseaHome ? away : home;

    if (gf > ga) return "WIN";
    if (gf < ga) return "LOSE";
    return "DRAW";
  }

const fixtureId = fixture?.id;

  // Load saved prediction for this fixture
useEffect(() => {
  if (!fixtureId) return;

  const existing = predictionService.loadPrediction(fixtureId);
  if (!existing) return;

  Promise.resolve().then(() => {
    setChoice(existing.prediction);
    setLocked(true);

    if (existing.result !== null) {
      setStatus("resolved");
      setResultInfo({
        result: existing.result,
        success: existing.success ?? false,
      });
    } else {
      setStatus("locked");
    }
  });
}, [fixtureId]);


  // Check finished matches to resolve predictions
  useEffect(() => {
    previousMatches.forEach((m) => {
      const saved = predictionService.loadPrediction(m.id);
      if (saved && saved.result === null) {
        const actual = getMatchResultFromFinished(m);
        const success = saved.prediction === actual;

        predictionService.saveResult(m.id, actual, success);

        if (fixture && fixture.id === m.id) {
          setStatus("resolved");
          setResultInfo({ result: actual, success });
        }
      }
    });
  }, [previousMatches, fixture]);

  function lockPrediction() {
    if (!fixture || !choice) return;
    predictionService.savePrediction(fixture.id, choice);
    setLocked(true);
    setStatus("locked");
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Predict This Match</h3>

      {fixture && (
        <>
          <p>
            <strong>{fixture.homeTeam.name}</strong> vs{" "}
            <strong>{fixture.awayTeam.name}</strong>
            <br />
            {new Date(fixture.utcDate).toLocaleString("en-GB")}
          </p>

          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <select
              value={choice}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setChoice(e.target.value as StoredPrediction["prediction"])
            }
              disabled={locked}
            >
              <option value="">Select…</option>
              <option value="WIN">Win</option>
              <option value="LOSE">Lose</option>
              <option value="DRAW">Draw</option>
            </select>

            <button onClick={lockPrediction} disabled={!choice || locked}>
              Lock
            </button>
          </div>

          {status === "locked" && (
            <p style={{ marginTop: 10 }}>
              🔒 Prediction locked: <strong>{choice}</strong>
            </p>
          )}

          {status === "resolved" && resultInfo && (
            <div style={{ marginTop: 10 }}>
              <p>
                Your prediction: <strong>{choice}</strong>
                <br />
                Actual result: <strong>{resultInfo.result}</strong>
              </p>

              {resultInfo.success ? (
                <p style={{ color: "green" }}>Correct! ✅</p>
              ) : (
                <p style={{ color: "crimson" }}>Wrong ❌</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
