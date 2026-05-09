import prisma from "@/lib/prisma";
import styles from "./committee.module.css";

export const metadata = { title: "Committee | NGBHS Reunion Football Championship" };

export default async function CommitteePage() {
  const members = await prisma.user.findMany({
    where: { isCommitteeMember: true },
    include: { batch: { select: { name: true } } },
    orderBy: { name: 'asc' }
  });

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <div className="badge">Tournament Organization</div>
          <h1 className={`${styles.heroTitle} text-gradient`}>Organizing Committee</h1>
          <p className={styles.heroSubtitle}>
            Meet the dedicated individuals working behind the scenes to make the NGBHS Reunion Football Championship a reality.
          </p>
        </div>
      </div>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.grid}>
            {members.length > 0 ? members.map((member) => (
              <div key={member.id} className={`${styles.card} glass`}>
                <div className={styles.avatarWrapper}>
                  <img 
                    src={member.image || "/default-avatar.png"} 
                    alt={member.name || ""} 
                    className={styles.avatar} 
                  />
                  {member.committeeRole && (
                    <div className={styles.roleBadge}>{member.committeeRole}</div>
                  )}
                </div>
                <div className={styles.info}>
                  <h3 className={styles.name}>{member.name}</h3>
                  <p className={styles.batch}>{member.batch?.name || "NGBHS Alumnus"}</p>
                </div>
              </div>
            )) : (
              <div className="glass" style={{ padding: '4rem', textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>
                <p style={{ color: 'var(--text-muted)' }}>Committee members list is being finalized.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
