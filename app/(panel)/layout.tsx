import { getServerUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import PanelShell from "@/app/components/panel/PanelShell";

export default async function PanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <PanelShell user={user}>
      {children}
    </PanelShell>
  );
}
