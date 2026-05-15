import { getServerUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import NewsForm from "@/app/components/panel/news/NewsForm";

export default async function NewBatchNewsPage() {
  const user = await getServerUser();
  if (user?.role !== "BATCH_MANAGER") {
    if (user?.role === "ADMIN" || user?.role === "CO_ADMIN") {
      redirect("/admin/news/new");
    }
    redirect("/");
  }

  const batches = await prisma.batch.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div>
      <h2 style={{ marginBottom: "2rem", fontWeight: "800", fontSize: "1.5rem" }}>Create Batch News</h2>
      <NewsForm 
        batches={batches} 
        userRole={user.role} 
        userBatchId={user.batchId} 
      />
    </div>
  );
}
