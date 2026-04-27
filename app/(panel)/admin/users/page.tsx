import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import UserActions from "./user-actions";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const user = await getServerUser();
  
  if (user?.role !== "ADMIN") redirect("/");

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <>
      <div className="responsive-table-container glass" style={{ padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1.25rem' }}>User</th>
              <th style={{ padding: '1.25rem' }}>Email</th>
              <th style={{ padding: '1.25rem' }}>Role</th>
              <th style={{ padding: '1.25rem' }}>Joined</th>
              <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem' }}>
                      {user.name?.charAt(0)}
                    </div>
                    <span style={{ fontWeight: '600' }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>{user.email}</td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '100px', 
                    fontSize: '0.7rem', 
                    fontWeight: '800',
                    background: user.role === 'ADMIN' ? 'rgba(235, 183, 0, 0.1)' : user.role === 'CO_ADMIN' ? 'rgba(255, 215, 0, 0.05)' : 'rgba(255,255,255,0.03)',
                    color: user.role === 'ADMIN' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: '1px solid currentColor'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '1.25rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                  <UserActions userId={user.id} currentRole={user.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
