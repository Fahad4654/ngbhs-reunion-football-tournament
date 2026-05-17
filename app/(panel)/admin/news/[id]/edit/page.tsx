import { getServerUser } from "@/lib/server-auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import NewsForm from "@/app/components/panel/news/NewsForm";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") {
    if (user?.role === "BATCH_MANAGER") {
      const { id } = await params;
      redirect(`/dashboard/news/${id}/edit`);
    }
    redirect("/");
  }

  const { id } = await params;
  const article = await prisma.news.findUnique({
    where: { id }
  });

  if (!article) {
    notFound();
  }


  const batches = await prisma.batch.findMany({
    where: user.role === "ADMIN" ? {} : {
      OR: [
        { id: user.batchId || undefined },
      ]
    },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  const initialData = {
    title: article.title,
    slug: article.slug,
    content: article.content,
    excerpt: article.excerpt,
    imageUrl: article.imageUrl,
    isExclusive: article.isExclusive,
    isAlert: article.isAlert,
    batchId: article.batchId,
  };

  return (
    <div>
      <h2 style={{ marginBottom: "2rem", fontWeight: "800", fontSize: "1.5rem" }}>Edit Article</h2>
      <NewsForm 
        initialData={initialData} 
        newsId={article.id} 
        batches={batches}
        userRole={user.role}
        userBatchId={user.batchId}
      />
    </div>
  );
}
