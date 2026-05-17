import prisma from "@/lib/prisma";
import Link from "next/link";
import AlertIcon from "@mui/icons-material/NotificationsActive";

export default async function AlertBanner() {
  const [alertMatches, alertNews] = await Promise.all([
    prisma.match.findMany({
      where: { isAlert: true },
      include: { homeTeam: true, awayTeam: true }
    }),
    prisma.news.findMany({
      where: { isAlert: true }
    })
  ]);

  if (alertMatches.length === 0 && alertNews.length === 0) {
    return null;
  }

  return (
    <div style={{
      background: "var(--accent-danger)",
      color: "white",
      padding: "0.5rem 1rem",
      fontSize: "0.85rem",
      fontWeight: "700",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      overflow: "hidden",
      whiteSpace: "nowrap",
      position: "relative",
      zIndex: 50,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(0,0,0,0.2)", padding: "0.2rem 0.6rem", borderRadius: "4px", zIndex: 2 }}>
        <AlertIcon sx={{ fontSize: "1.1rem" }} />
        <span>LATEST ALERTS</span>
      </div>
      
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{
          display: "inline-flex",
          gap: "3rem",
          animation: "marquee 25s linear infinite"
        }}>
          {alertMatches.map((match) => (
            <Link key={match.id} href={`/matches/${match.id}`} style={{ color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ background: "white", color: "var(--accent-danger)", padding: "0.1rem 0.4rem", borderRadius: "3px", fontSize: "0.7rem", fontWeight: "800" }}>MATCH</span>
              {match.homeTeam.name} vs {match.awayTeam.name} {match.status === "LIVE" ? "is LIVE!" : `(${match.status})`}
            </Link>
          ))}
          {alertNews.map((news) => (
            <Link key={news.id} href={`/news/${news.slug}`} style={{ color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ background: "white", color: "var(--accent-danger)", padding: "0.1rem 0.4rem", borderRadius: "3px", fontSize: "0.7rem", fontWeight: "800" }}>NEWS</span>
              {news.title}
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
