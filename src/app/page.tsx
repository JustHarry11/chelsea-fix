import styles from "./styles.module.css";
import PredictionBox from "./prediction-box";
import LastResults from "./last-results";

type Team = {
  id: number;
  name: string;
  crest: string;
};

type Match = {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  competition: { name: string };
  score: { fullTime: { home: number; away: number } };
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
  const teamName = nextMatch
  ? nextMatch.homeTeam.id === 61
    ? nextMatch.homeTeam.name
    : nextMatch.awayTeam.name
  : "Team";

  return (
    <main className={styles.container}>
      <h1 style={{ textAlign: "center" }}>{teamName} Matches</h1>


      {/* NEXT MATCH */}
      <section>
        <h2 style={{ textAlign: "center" }}>Next Match</h2>
        {nextMatch ? (
          <PredictionBox
            fixture={nextMatch}
            previousMatches={previousMatches}
          />
        ) : (
          <p>No upcoming matches found.</p>
        )}
      </section>

      {/* LAST 5 RESULTS */}
      <section style={{ marginTop: 32 }}>
        <h2 style={{ textAlign: "center" }}>Last 5 Results</h2>
        <LastResults matches={previousMatches} />
      </section>
    </main>
  );
}
