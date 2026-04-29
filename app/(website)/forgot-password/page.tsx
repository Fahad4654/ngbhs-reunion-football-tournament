import ForgotPasswordForm from './ForgotPasswordForm';
import styles from '../login/login.module.css';

export const metadata = {
  title: 'Forgot Password - NGBHS Reunion',
  description: 'Reset your account password.',
};

export default function ForgotPasswordPage() {
  return (
    <div className={styles.container}>
      <div className={styles.bgBlob} style={{ top: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(235, 183, 0, 0.05) 0%, transparent 70%)' }}></div>
      <div className={styles.bgBlob} style={{ bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%)' }}></div>
      
      <div className={`${styles.loginCard} glass`}>
        <div className={styles.header}>
          <h1 className={styles.title}>Forgot <span className="text-gradient">Password</span></h1>
          <p className={styles.subtitle}>
            Enter your email address and we&apos;ll send you a code to reset your password.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
