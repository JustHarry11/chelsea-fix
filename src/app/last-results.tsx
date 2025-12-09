"use client";

import Image from "next/image";
import { StoredPrediction, predictionService } from "../lib/predictionService";
import styles from "./last-results.module.css";

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

export default function LastResults({ matches }: { matches: Match[] }) {
  // Explicitly type results to use StoredPrediction
  const results: {
    match: Match;
    prediction: StoredPrediction["prediction"] | null;
    success: boolean | null;
    actualResult: "WIN" | "LOSE" | "DRAW";
  }[] = matches.map((match) => {
    const saved = predictionService.loadPrediction(match.id);

    const actual =
      match.score.fullTime.home > match.score.fullTime.away
        ? "WIN"
        : match.score.fullTime.home < match.score.fullTime.away
        ? "LOSE"
        : "DRAW";

    return {
      match,
      prediction: saved?.prediction ?? null,
      success: saved?.success ?? null,
      actualResult: actual,
    };
  });

  return (
    <div>
      {results.map(({ match, prediction, success }) => (
        <div key={match.id} className={styles.card}>
          <div className={styles.matchHeader}>
            <div className={styles.team}>
              <Image
                src={match.homeTeam.crest}
                alt={match.homeTeam.name}
                width={36}
                height={36}
              />
              <strong>{match.homeTeam.name}</strong>
            </div>

            <span className={styles.vs}>vs</span>

            <div className={styles.team}>
              <strong>{match.awayTeam.name}</strong>
              <Image
                src={match.awayTeam.crest}
                alt={match.awayTeam.name}
                width={36}
                height={36}
              />
            </div>
          </div>

          <div className={styles.score}>
            {match.score.fullTime.home} - {match.score.fullTime.away}
          </div>

          <div className={styles.date}>
            {new Date(match.utcDate).toLocaleDateString("en-GB")}
          </div>

          {prediction ? (
            <div className={styles.prediction}>
              Your prediction:{" "}
              <span className={success ? styles.correct : styles.wrong}>
                {prediction} {success ? "✔" : "✘"}
              </span>
            </div>
          ) : (
            <div className={styles.prediction} style={{ color: "#777" }}>
              No prediction
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
