import prisma from "@/lib/prisma";
import styles from "./volunteers.module.css";

export const metadata = { title: "Volunteers | NGBHS Reunion Football Championship" };

export default async function VolunteersPage() {
  const volunteers = await prisma.user.findMany({
    where: { isVolunteer: true },
    include: { batch: { select: { name: true } } },
    orderBy: { name: 'asc' }
  });

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <div className="badge">Community Support</div>
          <h1 className={`${styles.heroTitle} text-gradient`}>Our Volunteers</h1>
          <p className={styles.heroSubtitle}>
            A special thanks to the volunteers who dedicate their time and energy to ensure the smooth operation of every match and event.
          </p>
        </div>
      </div>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.grid}>
            {volunteers.length > 0 ? volunteers.map((volunteer) => (
              <div key={volunteer.id} className={`${styles.card} glass`}>
                <img 
                  src={volunteer.image || "/default-avatar.png"} 
                  alt={volunteer.name || ""} 
                  className={styles.avatar} 
                />
                <div className={styles.info}>
                  <h3 className={styles.name}>{volunteer.name}</h3>
                  <p className={styles.batch}>{volunteer.batch?.name || "Volunteer"}</p>
                </div>
              </div>
            )) : (
              <div className="glass" style={{ padding: '4rem', textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>
                <p style={{ color: 'var(--text-muted)' }}>Volunteer list is being updated.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
