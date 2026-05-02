import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import TournamentsClient from "./TournamentsClient";

export const metadata = {
  title: "Tournaments - Admin",
};

export default async function AdminTournamentsPage() {
  const user = await getServerUser();

  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") redirect("/");

  const tournaments = await prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { teams: true, matches: true } },
    },
  });

  return <TournamentsClient tournaments={tournaments} />;
}
