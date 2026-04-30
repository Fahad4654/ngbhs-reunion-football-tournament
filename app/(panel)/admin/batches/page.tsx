import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import BatchesClient from "./BatchesClient";

export const metadata = {
  title: "Batch Settings - Admin",
};

export default async function AdminBatchesPage() {
  const user = await getServerUser();

  if (user?.role !== "ADMIN") redirect("/");

  const batches = await prisma.batch.findMany({
    orderBy: [{ points: "desc" }, { goalsFor: "desc" }],
    include: { _count: { select: { members: true } } },
  });

  return <BatchesClient batches={batches} />;
}
