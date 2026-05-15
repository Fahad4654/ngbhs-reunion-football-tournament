import { getServerUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import NewsForm from "../NewsForm";
import prisma from "@/lib/prisma";

export default async function NewNewsPage() {
  const user = await getServerUser();
  
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN" && user?.role !== "BATCH_MANAGER") redirect("/");

  const batches = await prisma.batch.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div>
      <h2 style={{ marginBottom: "2rem", fontWeight: "800", fontSize: "1.5rem" }}>Create New Article</h2>
      <NewsForm 
        batches={batches} 
        userRole={user.role} 
        userBatchId={user.batchId} 
      />
    </div>
  );
}
