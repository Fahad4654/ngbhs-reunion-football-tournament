import VerifyOTPForm from './VerifyOTPForm';
import styles from '../../login/login.module.css';
import { Suspense } from 'react';

export const metadata = {
  title: 'Verify Code - NGBHS Reunion',
  description: 'Enter the verification code sent to your email.',
};

export default function VerifyResetPage() {
  return (
    <div className={styles.container}>
      <div className={styles.bgBlob} style={{ top: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(235, 183, 0, 0.05) 0%, transparent 70%)' }}></div>
      <div className={styles.bgBlob} style={{ bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%)' }}></div>

      <div className={`${styles.loginCard} glass`}>
        <div className={styles.header}>
          <h1 className={styles.title}>Verify <span className="text-gradient">Code</span></h1>
          <p className={styles.subtitle}>
            Please enter the 6-digit code we sent to your email address.
          </p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyOTPForm />
        </Suspense>
      </div>
    </div>
  );
}
