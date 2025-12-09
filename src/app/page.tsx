import styles from "./styles.module.css";
import PredictionBox from "./prediction-box";
import LastResults from "./last-results";

type Match = {
  id: number;
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  competition: { name: string };
  score: {
    fullTime: { home: number; away: number };
  };
  utcDate: string;
};

export default async function Home() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  const upcomingUrl =
    "https://api.football-data.org/v4/teams/61/matches?status=SCHEDULED&limit=1";

  const previousUrl =
    "https://api.football-data.org/v4/teams/61/matches?status=FINISHED&limit=5";

  const headers: HeadersInit = {
    "X-Auth-Token": apiKey || "",
  };

  const [upcomingRes, previousRes] = await Promise.all([
    fetch(upcomingUrl, { headers, next: { revalidate: 60 } }),
    fetch(previousUrl, { headers, next: { revalidate: 60 } }),
  ]);

  if (!upcomingRes.ok || !previousRes.ok) {
    return <div>Error loading data.</div>;
  }

  const upcomingData = await upcomingRes.json();
  const previousData = await previousRes.json();

  const nextMatch: Match | null = upcomingData.matches?.[0] || null;
  const previousMatches: Match[] = previousData.matches || [];

  return (
    <main className={styles.container}>
      <h1>Chelsea FC Matches</h1>

      {/* NEXT MATCH */}
      <section className={styles.card}>
        <h2>Next Match</h2>
        {nextMatch ? (
          <>
            <p>
              <strong>{nextMatch.homeTeam.name}</strong> vs{" "}
              <strong>{nextMatch.awayTeam.name}</strong>
            </p>
            <p>Competition: {nextMatch.competition.name}</p>
            <p>
              Date:{" "}
              {new Date(nextMatch.utcDate).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>

            {/* Prediction UI */}
            <PredictionBox
              fixture={nextMatch}
              previousMatches={previousMatches}
            />
          </>
        ) : (
          <p>No upcoming matches found.</p>
        )}
      </section>

      {/* LAST 5 RESULTS */}
      <section className={styles.card}>
        <h2>Last 5 Results</h2>
        <LastResults matches={previousMatches} />
      </section>
    </main>
  );
}
