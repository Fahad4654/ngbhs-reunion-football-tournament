import prisma from "@/lib/prisma";
import styles from "./organization.module.css";

export const metadata = { title: "Organization | NGBHS Reunion Football Championship" };

export default async function OrganizationPage() {
  const [committee, volunteers] = await Promise.all([
    prisma.user.findMany({
      where: { isCommitteeMember: true },
      include: { batch: { select: { name: true } } },
      orderBy: { name: 'asc' }
    }),
    prisma.user.findMany({
      where: { isVolunteer: true },
      include: { batch: { select: { name: true } } },
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className="container">
          <div className="badge">Behind the Scenes</div>
          <h1 className={`${styles.heroTitle} text-gradient`}>Our Team</h1>
          <p className={styles.heroSubtitle}>
            The NGBHS Reunion Football Championship is powered by the passion and dedication of our committee members and selfless volunteers.
          </p>
        </div>
      </div>

      {/* Committee Section */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Organizing <span className="text-gradient">Committee</span></h2>
            <p className={styles.sectionDesc}>The core team managing the tournament operations, batch relations, and official coordination.</p>
          </div>
          
          <div className={styles.committeeGrid}>
            {committee.length > 0 ? committee.map((member) => (
              <div key={member.id} className={`${styles.committeeCard} glass`}>
                <div className={styles.avatarWrapper}>
                  <img 
                    src={member.image || "/default-avatar.png"} 
                    alt={member.name || ""} 
                    className={styles.committeeAvatar} 
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
              <div className="glass" style={{ padding: '3rem', textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>
                <p style={{ color: 'var(--text-muted)' }}>Committee list is being finalized.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Volunteers Section */}
      <section className={`${styles.section} ${styles.altBg}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Dedicated <span className="text-gradient">Volunteers</span></h2>
            <p className={styles.sectionDesc}>The lifeblood of our event, helping with ground management, scoring assistance, and hospitality.</p>
          </div>

          <div className={styles.volunteerGrid}>
            {volunteers.length > 0 ? volunteers.map((volunteer) => (
              <div key={volunteer.id} className={`${styles.volunteerCard} glass`}>
                <img 
                  src={volunteer.image || "/default-avatar.png"} 
                  alt={volunteer.name || ""} 
                  className={styles.volunteerAvatar} 
                />
                <div className={styles.info}>
                  <h3 className={styles.volunteerName}>{volunteer.name}</h3>
                  <p className={styles.volunteerBatch}>{volunteer.batch?.name || "Volunteer"}</p>
                </div>
              </div>
            )) : (
              <div className="glass" style={{ padding: '3rem', textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>
                <p style={{ color: 'var(--text-muted)' }}>Volunteer recruitment is ongoing.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
