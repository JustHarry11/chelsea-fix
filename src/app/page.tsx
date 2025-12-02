// app/page.jsx
import styles from "./styles.module.css";

type Match = {
  id: number;
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
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

  const nextMatch = upcomingData.matches?.[0] || null;
  const previousMatches = previousData.matches || [];




  function getResultClass(match: Match) {
    const homeScore = match.score.fullTime.home;
    const awayScore = match.score.fullTime.away;
    const isChelseaHome = match.homeTeam.id === 61;

    const diff = isChelseaHome
      ? homeScore - awayScore
      : awayScore - homeScore;

    if (diff > 0) return styles.win;
    if (diff < 0) return styles.loss;
    return styles.draw;
  }

  return (
    <main className={styles.container}>
      <h1>Chelsea FC Matches</h1>

      {/* Next Match */}
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
          </>
        ) : (
          <p>No upcoming matches found.</p>
        )}
      </section>

      {/* Last 5 Results */}
      <section className={styles.card}>
        <h2>Last 5 Results</h2>
        <div className={styles.resultsList}>
          {previousMatches.map((match: Match) => (
            <div
              key={match.id}
              className={`${styles.resultItem} ${getResultClass(match)}`}
            >
              <span>
                {match.homeTeam.name} {match.score.fullTime.home} -{" "}
                {match.score.fullTime.away} {match.awayTeam.name}
              </span>
              <span className={styles.date}>
                {new Date(match.utcDate).toLocaleDateString("en-GB")}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
