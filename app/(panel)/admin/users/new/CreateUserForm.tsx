"use client";

import { useActionState, useEffect, useState } from "react";
import { createUserByAdmin } from "@/lib/actions/user.actions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import PhoneInput from "@/app/components/PhoneInput";
import { isValidPhone } from "@/lib/utils/phone";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// ─── Validation helpers ───────────────────────────────────────────────────────
const validateEmail    = (v: string) => {
  if (!v) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email address.';
  return '';
};
const validateFirstName = (v: string) => (!v.trim() ? 'First name is required.' : '');
const validateLastName  = (v: string) => (!v.trim() ? 'Last name is required.' : '');
const validatePhone = (v: string) => {
  if (v && !isValidPhone(v)) return 'Invalid phone number format.';
  return '';
};

// ─── Inline field feedback ────────────────────────────────────────────────────
function FieldMessage({ error, touched }: { error: string; touched: boolean }) {
  if (!touched) return null;
  return (
    <p style={{
      fontSize: '0.72rem',
      marginTop: '4px',
      color: error ? '#ef4444' : '#10b981',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    }}>
      {error ? '✕ ' + error : <><CheckCircleIcon style={{ fontSize: '0.9rem' }} /> Looks good!</>}
    </p>
  );
}

export default function CreateUserForm({ batches }: { batches: { id: string, name: string }[] }) {
  const router = useRouter();
  const [state, action, isPending] = useActionState(createUserByAdmin, null);
  
  // Controlled field state
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');
  const [username,  setUsername]  = useState('');

  // Touched state
  const [touched, setTouched] = useState({
    firstName: false, lastName: false, email: false, phone: false,
  });
  const touch = (field: keyof typeof touched) =>
    setTouched(prev => ({ ...prev, [field]: true }));

  // Live errors
  const errors = {
    firstName: validateFirstName(firstName),
    lastName:  validateLastName(lastName),
    email:     validateEmail(email),
    phone:     validatePhone(phone),
  };

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "User created successfully!");
      router.push("/admin/users");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={action} className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>First Name</label>
          <input 
            name="firstName" 
            required 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={() => touch('firstName')}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              background: 'rgba(255,255,255,0.05)', 
              border: `1px solid ${touched.firstName ? (errors.firstName ? '#ef4444' : '#10b981') : 'var(--border-color)'}`, 
              color: 'white',
              outline: 'none',
              transition: 'border-color 0.2s'
            }} 
          />
          <FieldMessage error={errors.firstName} touched={touched.firstName} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Last Name</label>
          <input 
            name="lastName" 
            required 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={() => touch('lastName')}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              background: 'rgba(255,255,255,0.05)', 
              border: `1px solid ${touched.lastName ? (errors.lastName ? '#ef4444' : '#10b981') : 'var(--border-color)'}`, 
              color: 'white',
              outline: 'none',
              transition: 'border-color 0.2s'
            }} 
          />
          <FieldMessage error={errors.lastName} touched={touched.lastName} />
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email Address</label>
        <input 
          name="email" 
          type="email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => touch('email')}
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            background: 'rgba(255,255,255,0.05)', 
            border: `1px solid ${touched.email ? (errors.email ? '#ef4444' : '#10b981') : 'var(--border-color)'}`, 
            color: 'white',
            outline: 'none',
            transition: 'border-color 0.2s'
          }} 
        />
        <FieldMessage error={errors.email} touched={touched.email} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Username (Optional)</label>
          <input 
            name="username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }} 
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Phone Number</label>
          <div style={{ 
            borderRadius: '8px', 
            background: 'rgba(255,255,255,0.05)', 
            border: `1px solid ${touched.phone ? (errors.phone ? '#ef4444' : '#10b981') : 'var(--border-color)'}`, 
            overflow: 'hidden',
            transition: 'border-color 0.2s'
          }}>
            <PhoneInput 
              name="phone" 
              defaultValue={phone}
              onChange={(v) => {
                setPhone(v);
                if (v) touch('phone');
              }}
            />
          </div>
          <FieldMessage error={errors.phone} touched={touched.phone} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Password</label>
          <input 
            name="password" 
            type="password"
            placeholder="Default: NgBhs123!"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }} 
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Role</label>
          <select 
            name="role" 
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}
          >
            <option value="USER" style={{ color: 'black' }}>USER</option>
            <option value="CO_ADMIN" style={{ color: 'black' }}>CO_ADMIN</option>
            <option value="BATCH_MANAGER" style={{ color: 'black' }}>BATCH_MANAGER</option>
            <option value="SCORER" style={{ color: 'black' }}>SCORER</option>
            <option value="ADMIN" style={{ color: 'black' }}>ADMIN</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Graduation Batch</label>
        <select 
          name="batchId" 
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}
        >
          <option value="" style={{ color: 'black' }}>None (Global)</option>
          {batches.map(b => (
            <option key={b.id} value={b.id} style={{ color: 'black' }}>Batch {b.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button 
          type="button" 
          onClick={() => router.back()}
          className="btn glass"
          disabled={isPending}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isPending}
        >
          {isPending ? "Creating..." : "Create User"}
        </button>
      </div>
    </form>
  );
}
