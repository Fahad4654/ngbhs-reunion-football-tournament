import { getServerUser } from "@/lib/server-auth";
import { getAds } from "@/lib/actions/ad.actions";
import { redirect } from "next/navigation";
import ManageAdsClient from "./ManageAdsClient";

export const metadata = {
  title: "Manage Advertisements - Admin",
};

export default async function AdminAdsPage() {
  const user = await getServerUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CO_ADMIN")) {
    redirect("/");
  }

  const ads = await getAds();

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '950', marginBottom: '3rem', color: 'var(--accent-primary)', textAlign: 'center' }} className="text-gradient">
        Manage Advertisements
      </h1>

      <ManageAdsClient initialAds={ads} />
    </div>
  );
}

