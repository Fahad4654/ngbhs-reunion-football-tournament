import styles from "./login.module.css";
import LoginForm from "./login-form";

export default function LoginPage() {
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
          <h1 className={styles.title}>Welcome <span className="text-gradient">Back</span></h1>
          <p className={styles.subtitle}>Enter your credentials to access the tournament dashboard.</p>
        </div>

        <LoginForm />

        <div className={styles.footer}>
          Don&apos;t have an account? <a href="/register" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Create one now</a>
        </div>
      </div>
    </div>
  );
}
