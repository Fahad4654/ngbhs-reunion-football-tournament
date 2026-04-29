import styles from "../login/login.module.css";
import RegisterForm from "./register-form";
import { getServerUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getAllBatches } from "@/lib/actions";

export default async function RegisterPage() {
  const user = await getServerUser();

  if (user) {
    if (user.role === 'ADMIN' || user.role === 'CO_ADMIN') {
      redirect('/admin');
    } else {
      redirect('/dashboard');
    }
  }

  const batches = await getAllBatches();

  return (
    <div className={styles.container}>
      <div className={styles.bgBlob} style={{ top: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(235, 183, 0, 0.05) 0%, transparent 70%)' }}></div>
      <div className={styles.bgBlob} style={{ bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%)' }}></div>
      
      <div className={`${styles.loginCard} glass`}>
        <div className={styles.header}>
          <img 
            src="/logo.jpg" 
            alt="NGBHS Logo" 
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '20px', 
              margin: '0 auto 1.5rem', 
              display: 'block',
              objectFit: 'cover',
              border: '2px solid var(--accent-primary)'
            }} 
          />
          <h1 className={styles.title}>Create <span className="text-gradient">Account</span></h1>
          <p className={styles.subtitle}>Join the Natore Government Boys' High School Reunion community.</p>
        </div>

        <RegisterForm batches={batches} />

        <div className={styles.footer}>
          Already have an account? <a href="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Sign In</a>
        </div>
      </div>
    </div>
  );
}
