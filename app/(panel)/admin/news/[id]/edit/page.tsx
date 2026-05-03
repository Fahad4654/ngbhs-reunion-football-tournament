import { getServerUser } from "@/lib/server-auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import NewsForm from "../../NewsForm";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") redirect("/");

  const { id } = await params;
  const article = await prisma.news.findUnique({
    where: { id }
  });

  if (!article) {
    notFound();
  }

  const initialData = {
    title: article.title,
    slug: article.slug,
    content: article.content,
    excerpt: article.excerpt,
    imageUrl: article.imageUrl,
    isExclusive: article.isExclusive,
  };

  return (
    <div>
      <h2 style={{ marginBottom: "2rem", fontWeight: "800", fontSize: "1.5rem" }}>Edit Article</h2>
      <NewsForm initialData={initialData} newsId={article.id} />
    </div>
  );
}
