"use client";

import { useEffect, useState } from "react";
import { StoredPrediction, predictionService } from "../lib/predictionService";
import styles from "./styles.module.css";

type Match = {
  id: number;
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  score: { fullTime: { home: number; away: number } };
  utcDate: string;
};

export default function LastResults({ matches }: { matches: Match[] }) {
  const [predictions, setPredictions] = useState<StoredPrediction[]>([]);

useEffect(() => {
  Promise.resolve().then(() => {
    const loaded = matches
      .map((m) => predictionService.loadPrediction(m.id))
      .filter((x): x is StoredPrediction => !!x);

    setPredictions(loaded);
  });
}, [matches]);



  return (
    <div className={styles.resultsList}>
      {matches.map((match) => {
        const pred = predictions.find((p) => p.fixtureId === match.id);

        const actual =
          match.score.fullTime.home > match.score.fullTime.away
            ? "WIN"
            : match.score.fullTime.home < match.score.fullTime.away
            ? "LOSE"
            : "DRAW";

        const isCorrect = pred ? pred.prediction === actual : null;

        return (
          <div
            key={match.id}
            className={`${styles.resultItem} ${
              actual === "WIN"
                ? styles.win
                : actual === "LOSE"
                ? styles.loss
                : styles.draw
            }`}
          >
            <span>
              {match.homeTeam.name} {match.score.fullTime.home} -{" "}
              {match.score.fullTime.away} {match.awayTeam.name}
            </span>

            <span className={styles.date}>
              {new Date(match.utcDate).toLocaleDateString("en-GB")}
            </span>

            {/* PREDICTION INFO */}
            <div style={{ marginTop: 4 }}>
              {pred ? (
                <>
                  <strong>You predicted: {pred.prediction}</strong>{" "}
                  {isCorrect ? (
                    <span style={{ color: "limegreen" }}>✔ Correct</span>
                  ) : (
                    <span style={{ color: "crimson" }}>✘ Wrong</span>
                  )}
                </>
              ) : (
                <em style={{ color: "#777" }}>No prediction</em>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
