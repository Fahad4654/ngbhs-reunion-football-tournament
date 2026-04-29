import ResetPasswordForm from './ResetPasswordForm';
import styles from '../../login/login.module.css';
import { Suspense } from 'react';

export const metadata = {
  title: 'Reset Password - NGBHS Reunion',
  description: 'Enter your new password.',
};

export default function ResetPasswordPage() {
  return (
    <div className={styles.container}>
      <div className={styles.bgBlob} style={{ top: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(235, 183, 0, 0.05) 0%, transparent 70%)' }}></div>
      <div className={styles.bgBlob} style={{ bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%)' }}></div>

      <div className={`${styles.loginCard} glass`}>
        <div className={styles.header}>
          <h1 className={styles.title}>New <span className="text-gradient">Password</span></h1>
          <p className={styles.subtitle}>
            Create a secure new password for your account.
          </p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
