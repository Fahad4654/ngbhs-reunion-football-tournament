import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import UserActions from "./user-actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import UsersFilter from "./UsersFilter";
import { Prisma } from "@prisma/client";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getServerUser();
  
  if (user?.role !== "ADMIN") redirect("/");

  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';
  const sort = typeof resolvedParams.sort === 'string' ? resolvedParams.sort : 'newest';

  const where: Prisma.UserWhereInput = q ? {
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ]
  } : {};

  let orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'desc' };
  switch (sort) {
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    case 'name_asc':
      orderBy = { name: 'asc' };
      break;
    case 'name_desc':
      orderBy = { name: 'desc' };
      break;
    case 'role':
      orderBy = { role: 'asc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  const users = await prisma.user.findMany({
    where,
    orderBy,
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <Link href="/admin/users/new" className="btn btn-primary">+ Create New User</Link>
      </div>

      <UsersFilter />
      <div className="responsive-table-container glass" style={{ padding: '0' }}>
        <table className="sticky-table" style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1.25rem' }}>User</th>
              <th style={{ padding: '1.25rem' }}>Email</th>
              <th style={{ padding: '1.25rem' }}>Role</th>
              <th style={{ padding: '1.25rem' }}>Joined</th>
              <th className="sticky-actions" style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      background: u.image ? 'transparent' : 'var(--accent-primary)', 
                      color: 'black', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: '800', 
                      fontSize: '0.8rem',
                      overflow: 'hidden',
                      border: u.image ? '1px solid var(--border-color)' : 'none'
                    }}>
                      {u.image ? (
                        <img src={u.image} alt={u.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        u.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <span style={{ fontWeight: '600' }}>{u.name || 'Unknown User'}</span>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '100px', 
                    fontSize: '0.7rem', 
                    fontWeight: '800',
                    background: u.role === 'ADMIN' ? 'rgba(235, 183, 0, 0.1)' : u.role === 'CO_ADMIN' ? 'rgba(255, 215, 0, 0.05)' : 'rgba(255,255,255,0.03)',
                    color: u.role === 'ADMIN' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: '1px solid currentColor'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="sticky-actions" style={{ textAlign: 'right' }}>
                  <UserActions 
                    userId={u.id} 
                    currentUserId={user.uid}
                    currentRole={u.role} 
                    isCommitteeMember={u.isCommitteeMember}
                    committeeRole={u.committeeRole || ''}
                    isVolunteer={u.isVolunteer}
                  />
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No users found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
