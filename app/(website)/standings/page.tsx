import prisma from "@/lib/prisma";
import styles from "./standings.module.css";

async function getStandings() {
  return await prisma.batch.findMany({
    orderBy: [
      { points: 'desc' },
      { goalsFor: 'desc' },
    ],
  });
}

export default async function StandingsPage() {
  const standings = await getStandings();

  return (
    <div className="container">
      <section className={styles.section}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>League <br/>Standings</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
            The race for glory. Track how each batch is performing and who is leading the charge to become the champions.
          </p>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pos</th>
                <th>Team</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th className={styles.points}>PTS</th>
              </tr>
            </thead>
            <tbody>
              {standings.length > 0 ? standings.map((team, index) => {
                const gd = team.goalsFor - team.goalsAgainst;
                return (
                  <tr key={team.id} className={styles.row}>
                    <td>{index + 1}</td>
                    <td>
                      <div className={styles.teamCell}>
                        <div className={styles.teamLogo}></div>
                        <span style={{ fontWeight: '700' }}>{team.name}</span>
                      </div>
                    </td>
                    <td>{team.played}</td>
                    <td>{team.won}</td>
                    <td>{team.drawn}</td>
                    <td>{team.lost}</td>
                    <td>{team.goalsFor}</td>
                    <td>{team.goalsAgainst}</td>
                    <td className={gd >= 0 ? styles.positive : styles.negative}>
                      {gd > 0 ? `+${gd}` : gd}
                    </td>
                    <td className={styles.points}>{team.points}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    Standings will be updated as matches are played.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
