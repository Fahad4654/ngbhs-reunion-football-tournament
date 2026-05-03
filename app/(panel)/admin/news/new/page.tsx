import { getServerUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import NewsForm from "../NewsForm";

export default async function NewNewsPage() {
  const user = await getServerUser();
  
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") redirect("/");

  return (
    <div>
      <h2 style={{ marginBottom: "2rem", fontWeight: "800", fontSize: "1.5rem" }}>Create New Article</h2>
      <NewsForm />
    </div>
  );
}
