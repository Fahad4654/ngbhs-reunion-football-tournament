import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateUserForm from "./CreateUserForm";

export default async function NewUserPage() {
  const user = await getServerUser();
  if (user?.role !== "ADMIN") redirect("/");

  const batches = await prisma.batch.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem', fontWeight: '800', fontSize: '1.5rem' }}>Create New User</h2>
      <CreateUserForm batches={batches} />
    </div>
  );
}
