"use client";

import { useState, useTransition } from "react";
import { updateBatchProfile } from "@/lib/actions/batch.actions";
import LogoUploader from "@/app/components/LogoUploader";

type Batch = {
  id: string;
  name: string;
  year: number;
  nickname: string | null;
  logoUrl: string | null;
  slogan: string | null;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.9rem",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid var(--border-color)",
  borderRadius: "10px",
  color: "white",
  fontSize: "0.95rem",
  outline: "none",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: "700",
  fontSize: "0.72rem",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  letterSpacing: "0.07em",
  marginBottom: "0.35rem",
};

export default function BatchProfileForm({ batch }: { batch: Batch }) {
  const [nickname, setNickname] = useState(batch.nickname ?? "");
  const [logoUrl, setLogoUrl] = useState(batch.logoUrl ?? "");
  const [slogan, setSlogan] = useState(batch.slogan ?? "");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    startTransition(async () => {
      const res = await updateBatchProfile({ nickname, logoUrl, slogan });
      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.error ?? "Failed to update");
      }
    });
  }

  return (
    <div style={{ maxWidth: "560px" }}>
      {/* Batch identity card (read-only) */}
      <div className="glass" style={{ padding: "1.25rem 1.5rem", borderRadius: "14px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
        {logoUrl ? (
          <img src={logoUrl} alt={batch.name} style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-primary)" }} />
        ) : (
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--bg-secondary)", border: "2px solid var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "var(--accent-primary)", fontSize: "1.3rem", flexShrink: 0 }}>
            {batch.year.toString().slice(-2)}
          </div>
        )}
        <div>
          <h2 style={{ fontWeight: "900", fontSize: "1.4rem", margin: 0 }}>{batch.name}</h2>
          {nickname && <p style={{ color: "var(--accent-secondary)", fontWeight: "700", margin: "0.2rem 0 0", fontSize: "0.9rem" }}>"{nickname}"</p>}
          {slogan && <p style={{ color: "var(--text-muted)", fontStyle: "italic", margin: "0.2rem 0 0", fontSize: "0.82rem" }}>{slogan}</p>}
          <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", margin: "0.4rem 0 0", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Year: {batch.year} · Read-only
          </p>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit} className="glass" style={{ padding: "1.5rem", borderRadius: "14px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 style={{ fontWeight: "900", fontSize: "1rem", margin: 0 }}>Edit Batch Profile</h3>

        <div>
          <label style={labelStyle}>Nickname</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder='e.g. "The Lions"'
            maxLength={60}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Logo</label>
          <LogoUploader currentUrl={logoUrl} onChange={setLogoUrl} />
        </div>

        <div>
          <label style={labelStyle}>Team Slogan</label>
          <input
            type="text"
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
            placeholder='e.g. "Born to Win"'
            maxLength={120}
            style={inputStyle}
          />
        </div>

        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
          ⚠ The graduating year cannot be changed. Contact an Admin to correct it.
        </p>

        {error && <p style={{ color: "var(--accent-danger)", fontSize: "0.85rem", margin: 0 }}>{error}</p>}
        {success && <p style={{ color: "#10b981", fontSize: "0.85rem", fontWeight: "700", margin: 0 }}>✓ Profile updated successfully!</p>}

        <button type="submit" className="btn btn-primary" disabled={isPending} style={{ width: "100%" }}>
          {isPending ? "Saving…" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
