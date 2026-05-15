import { getServerUser } from "@/lib/server-auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import NewsForm from "@/app/components/panel/news/NewsForm";

export default async function EditBatchNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (user?.role !== "BATCH_MANAGER") {
    if (user?.role === "ADMIN" || user?.role === "CO_ADMIN") {
      const { id } = await params;
      redirect(`/admin/news/${id}/edit`);
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

  // Batch manager can only edit their own news
  if (article.authorId !== user.uid) {
    redirect("/dashboard/news/manage");
  }

  const batches = await prisma.batch.findMany({
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
