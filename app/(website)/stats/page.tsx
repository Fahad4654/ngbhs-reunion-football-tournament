import { getTopScorers, getBestGoalkeepers, getBestPlayers, getSeasonAward } from "@/lib/actions/stats.actions";
import Link from "next/link";
import styles from "./stats.module.css";

export const metadata = { title: "Stats & Awards | NGBHS Reunion Championship" };

export default async function StatsPage() {
  const [topScorers, bestGKs, bestPlayers, topTeam, bestEleven] = await Promise.all([
    getTopScorers(10),
    getBestGoalkeepers(10),
    getBestPlayers(10),
    getSeasonAward("TOP_TEAM"),
    getSeasonAward("BEST_ELEVEN"),
  ]);

  return (
    <div className={styles.page}>
      {/* Hero Header */}
      <div className={styles.hero}>
        <div className="container">
          <div className="badge">Tournament Records</div>
          <h1 className={`${styles.heroTitle} text-gradient`}>Stats & Awards</h1>
          <p className={styles.heroSubtitle}>
            Celebrating outstanding individual performances and legendary squads of the NGBHS Reunion Championship.
          </p>
        </div>
      </div>

      {/* Dynamic Leaderboards */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>
            Player <span className="text-gradient">Leaderboards</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Automatically calculated from match events and results.
          </p>

          <div className={styles.leaderboardGrid}>
            {/* Top Scorers */}
            <div className={`glass ${styles.card}`}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>⚽</div>
                <div>
                  <h3 className={styles.cardTitle}>Top Scorers</h3>
                  <p className={styles.cardSub}>Ranked by goals scored</p>
                </div>
              </div>
              <div className={styles.list}>
                {topScorers.length > 0 ? topScorers.map((item: any, i: number) => (
                  <div key={item.player.id} className={`${styles.listItem} ${i === 0 ? styles.gold : i === 1 ? styles.silver : i === 2 ? styles.bronze : ""}`}>
                    <div className={styles.rank}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span style={{ color: "var(--text-muted)" }}>{i + 1}</span>}
                    </div>
                    <img src={item.player.image || "/default-avatar.png"} alt={item.player.name || ""} className={styles.avatar} />
                    <div className={styles.info}>
                      <div className={styles.name}>{item.player.name}</div>
                      <div className={styles.meta}>{item.player.batch?.name || "No Batch"}</div>
                    </div>
                    <div className={styles.statBadge}>{item.goals} <span>goals</span></div>
                  </div>
                )) : <p className={styles.empty}>No goals recorded yet.</p>}
              </div>
            </div>

            {/* Best Goalkeepers */}
            <div className={`glass ${styles.card}`}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>🧤</div>
                <div>
                  <h3 className={styles.cardTitle}>Best Goalkeepers</h3>
                  <p className={styles.cardSub}>Ranked by clean sheets</p>
                </div>
              </div>
              <div className={styles.list}>
                {bestGKs.length > 0 ? bestGKs.map((item: any, i: number) => (
                  <div key={item.player.id} className={`${styles.listItem} ${i === 0 ? styles.gold : i === 1 ? styles.silver : i === 2 ? styles.bronze : ""}`}>
                    <div className={styles.rank}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span style={{ color: "var(--text-muted)" }}>{i + 1}</span>}
                    </div>
                    <img src={item.player.image || "/default-avatar.png"} alt={item.player.name || ""} className={styles.avatar} />
                    <div className={styles.info}>
                      <div className={styles.name}>{item.player.name}</div>
                      <div className={styles.meta}>{item.player.batch?.name || "No Batch"}</div>
                    </div>
                    <div className={styles.statBadge}>{item.cleanSheets} <span>CS</span></div>
                  </div>
                )) : <p className={styles.empty}>No clean sheets recorded yet.</p>}
              </div>
            </div>

            {/* Best Players */}
            <div className={`glass ${styles.card}`}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>⭐</div>
                <div>
                  <h3 className={styles.cardTitle}>Best Players</h3>
                  <p className={styles.cardSub}>Goals · Assists · MOTM rating</p>
                </div>
              </div>
              <div className={styles.list}>
                {bestPlayers.length > 0 ? bestPlayers.map((item: any, i: number) => (
                  <div key={item.player.id} className={`${styles.listItem} ${i === 0 ? styles.gold : i === 1 ? styles.silver : i === 2 ? styles.bronze : ""}`}>
                    <div className={styles.rank}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span style={{ color: "var(--text-muted)" }}>{i + 1}</span>}
                    </div>
                    <img src={item.player.image || "/default-avatar.png"} alt={item.player.name || ""} className={styles.avatar} />
                    <div className={styles.info}>
                      <div className={styles.name}>{item.player.name}</div>
                      <div className={styles.meta}>
                        {item.player.batch?.name || "No Batch"}
                        <span className={styles.statChips}>
                          <span title="Goals">{item.stats.goals}G</span>
                          <span title="Assists">{item.stats.assists}A</span>
                          <span title="MOTM">{item.stats.motms}🏆</span>
                        </span>
                      </div>
                    </div>
                    <div className={styles.statBadge}>{item.stats.total} <span>pts</span></div>
                  </div>
                )) : <p className={styles.empty}>No stats recorded yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Season Awards */}
      {(topTeam || bestEleven) && (
        <section className={styles.section}>
          <div className="container">
            <h2 className={styles.sectionTitle}>
              Teams of the <span className="text-gradient">Season</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Curated by match coordinators and batch managers.
            </p>

            <div className={styles.awardsGrid}>
              {topTeam && topTeam.players.length > 0 && (
                <AwardCard award={topTeam} icon="🏆" />
              )}
              {bestEleven && bestEleven.players.length > 0 && (
                <AwardCard award={bestEleven} icon="⭐" />
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function AwardCard({ award, icon }: { award: any; icon: string }) {
  return (
    <div className={`glass ${styles.awardCard}`}>
      {/* Award Header */}
      <div className={styles.awardHeader}>
        <span className={styles.awardIcon}>{icon}</span>
        <div>
          <h3 className={styles.awardTitle}>{award.title}</h3>
          {award.description && (
            <p className={styles.awardDesc}>{award.description}</p>
          )}
        </div>
      </div>

      {/* Coach & Captain row */}
      {(award.coach || award.captain) && (
        <div className={styles.staffRow}>
          {award.coach && (
            <div className={styles.staffItem}>
              <img src={award.coach.image || "/default-avatar.png"} alt={award.coach.name || ""} className={styles.staffAvatar} />
              <div>
                <div className={styles.staffLabel}>Coach</div>
                <div className={styles.staffName}>{award.coach.name}</div>
              </div>
            </div>
          )}
          {award.captain && (
            <div className={styles.staffItem}>
              <img src={award.captain.image || "/default-avatar.png"} alt={award.captain.name || ""} className={styles.staffAvatar} />
              <div>
                <div className={styles.staffLabel}>Captain</div>
                <div className={styles.staffName}>{award.captain.name}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Player Grid */}
      <div className={styles.squadGrid}>
        {award.players.map((p: any, i: number) => (
          <div key={p.id} className={styles.squadPlayer}>
            <div className={styles.squadNumBadge}>{i + 1}</div>
            <img src={p.image || "/default-avatar.png"} alt={p.name || ""} className={styles.squadAvatar} />
            <div className={styles.squadName}>{p.name}</div>
            <div className={styles.squadBatch}>{p.batch?.name || p.teamRole || "Player"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
