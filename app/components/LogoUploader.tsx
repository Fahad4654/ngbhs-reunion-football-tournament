"use client";

import { useRef, useState } from "react";

interface LogoUploaderProps {
  currentUrl: string;
  onChange: (url: string) => void;
}

export default function LogoUploader({ currentUrl, onChange }: LogoUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError("");
    setUploading(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload/batch-logo", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Upload failed");
        setPreview(currentUrl); // revert preview
        return;
      }

      onChange(data.url);
      setPreview(data.url);
    } catch {
      setError("Upload failed. Please try again.");
      setPreview(currentUrl);
    } finally {
      setUploading(false);
      // Reset so the same file can be re-selected if needed
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
      {/* Avatar preview */}
      <div
        style={{ width: "72px", height: "72px", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--accent-primary)", background: "var(--bg-secondary)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
        onClick={() => fileRef.current?.click()}
        title="Click to upload"
      >
        {preview ? (
          <img
            src={preview}
            alt="Logo"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={() => setPreview("")}
          />
        ) : (
          <span style={{ fontSize: "1.5rem" }}>🏅</span>
        )}
      </div>

      {/* Controls */}
      <div style={{ flex: 1, minWidth: "180px" }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          style={{ display: "none" }}
          onChange={handleFile}
        />
        <button
          type="button"
          className="btn glass"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ padding: "0.5rem 1rem", fontSize: "0.82rem", width: "100%", marginBottom: "0.35rem" }}
        >
          {uploading ? "Uploading…" : preview ? "Change Logo" : "Upload Logo"}
        </button>
        {preview && (
          <button
            type="button"
            onClick={() => { setPreview(""); onChange(""); }}
            style={{ background: "none", border: "none", color: "var(--accent-danger)", fontSize: "0.72rem", cursor: "pointer", padding: 0, display: "block", width: "100%", textAlign: "center" }}
          >
            Remove logo
          </button>
        )}
        <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", margin: "0.3rem 0 0" }}>
          JPG, PNG, WebP, GIF or SVG · Max 5 MB
        </p>
      </div>

      {error && <p style={{ color: "var(--accent-danger)", fontSize: "0.78rem", width: "100%", margin: 0 }}>{error}</p>}
    </div>
  );
}
