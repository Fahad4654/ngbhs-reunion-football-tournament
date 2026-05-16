"use client";

import { useActionState, useEffect, useState } from "react";
import { createUserByAdmin } from "@/lib/actions/user.actions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CreateUserForm({ batches }: { batches: { id: string, name: string }[] }) {
  const router = useRouter();
  const [state, action, isPending] = useActionState(createUserByAdmin, null);

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
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }} 
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Last Name</label>
          <input 
            name="lastName" 
            required 
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }} 
          />
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email Address</label>
        <input 
          name="email" 
          type="email" 
          required 
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Username (Optional)</label>
          <input 
            name="username" 
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }} 
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Phone Number</label>
          <input 
            name="phone" 
            placeholder="+880..."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }} 
          />
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
