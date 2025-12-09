"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { predictionService, StoredPrediction } from "../lib/predictionService";
import styles from "./match-card.module.css";

type Team = {
  id: number;
  name: string;
  crest: string;
};

type Match = {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
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

  const fixtureId = fixture?.id;

  // --- Move getMatchResult here, BEFORE useEffect ---
  function getMatchResult(match: Match): "WIN" | "LOSE" | "DRAW" {
    const home = match.score.fullTime.home;
    const away = match.score.fullTime.away;
    const isChelseaHome = match.homeTeam.id === 61;

    const gf = isChelseaHome ? home : away;
    const ga = isChelseaHome ? away : home;

    if (gf > ga) return "WIN";
    if (gf < ga) return "LOSE";
    return "DRAW";
  }

  useEffect(() => {
    // Resolve previous predictions
    previousMatches.forEach((m) => {
      const saved = predictionService.loadPrediction(m.id);
      if (saved && saved.result === null) {
        const actual = getMatchResult(m); // now safe to call
        const success = saved.prediction === actual;
        predictionService.saveResult(m.id, actual, success);

        if (fixture && fixture.id === m.id) {
          setStatus("resolved");
          setResultInfo({ result: actual, success });
        }
      }
    });

    // Load existing prediction for current fixture
    if (fixtureId) {
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
    }
  }, [fixture, fixtureId, previousMatches]);


  function lockPrediction() {
    if (!fixture || !choice) return;
    predictionService.savePrediction(fixture.id, choice);
    setLocked(true);
    setStatus("locked");
  }

  if (!fixture) return null;

  return (
    <div className={styles.card}>
      <div className={styles.matchHeader}>
        <div className={styles.team}>
          <Image
            src={fixture.homeTeam.crest}
            alt={fixture.homeTeam.name}
            width={40}
            height={40}
          />
          <strong>{fixture.homeTeam.name}</strong>
        </div>

        <span className={styles.vs}>vs</span>

        <div className={styles.team}>
          <strong>{fixture.awayTeam.name}</strong>
          <Image
            src={fixture.awayTeam.crest}
            alt={fixture.awayTeam.name}
            width={40}
            height={40}
          />
        </div>
      </div>

      <div className={styles.date}>
        {new Date(fixture.utcDate).toLocaleString("en-GB")}
      </div>

      <div className={styles.selectPrediction}>
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

        <button
          className={styles.predictionButton}
          onClick={lockPrediction}
          disabled={!choice || locked}
        >
          Lock
        </button>
      </div>

      {status === "locked" && (
        <div className={styles.locked}>
          🔒 Prediction locked: <strong>{choice}</strong>
        </div>
      )}

      {status === "resolved" && resultInfo && (
        <div className={styles.locked}>
          <p>
            Your prediction: <strong>{choice}</strong>
            <br />
            Actual result: <strong>{resultInfo.result}</strong>
          </p>

          {resultInfo.success ? (
            <span className={styles.resultCorrect}>Correct! ✅</span>
          ) : (
            <span className={styles.resultWrong}>Wrong ❌</span>
          )}
        </div>
      )}
    </div>
  );
}
