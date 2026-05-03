"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createNews, updateNews } from "@/lib/actions/news.actions";

export default function NewsForm({ initialData, newsId }: {
  initialData?: {
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    imageUrl: string | null;
    isExclusive: boolean;
  };
  newsId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    content: initialData?.content || "",
    excerpt: initialData?.excerpt || "",
    imageUrl: initialData?.imageUrl || "",
    isExclusive: initialData?.isExclusive || false,
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload/news", {
        method: "POST",
        body: data,
      });
      const json = await res.json();

      if (res.ok && json.url) {
        setFormData(prev => ({ ...prev, imageUrl: json.url }));
      } else {
        setError(json.error || "Upload failed");
      }
    } catch (err) {
      setError("An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title || !formData.content) {
      setError("Title and content are required");
      return;
    }

    startTransition(async () => {
      const finalSlug = formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      let res;
      if (newsId) {
        res = await updateNews(newsId, { ...formData, slug: finalSlug });
      } else {
        res = await createNews({ ...formData, slug: finalSlug });
      }

      if (res.success) {
        router.push("/admin/news");
      } else {
        setError(res.error || `Failed to ${newsId ? "update" : "create"} news`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass" style={{ padding: "2rem", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {error && <div style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: "8px", padding: "0.75rem 1rem", color: "var(--accent-danger)", fontSize: "0.875rem" }}>{error}</div>}
      
      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.9rem" }}>Title</label>
        <input 
          type="text" 
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "white", outline: "none" }}
          required
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.9rem" }}>Slug (Optional)</label>
        <input 
          type="text" 
          value={formData.slug}
          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
          style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "white", outline: "none" }}
          placeholder="auto-generated from title if empty"
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.9rem" }}>Excerpt</label>
        <textarea 
          value={formData.excerpt}
          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
          style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "white", minHeight: "80px", outline: "none" }}
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.9rem" }}>Content (Supports basic text)</label>
        <textarea 
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "white", minHeight: "200px", outline: "none" }}
          required
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.9rem" }}>Media (Image or Video)</label>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <input 
            type="file" 
            accept="image/*,video/*"
            onChange={handleUpload}
            disabled={uploading}
            style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "white", outline: "none" }}
          />
          {uploading && <span style={{ fontSize: "0.9rem", color: "var(--accent-primary)" }}>Uploading...</span>}
        </div>
        {formData.imageUrl && (
          <div style={{ marginTop: "1rem" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Uploaded URL: {formData.imageUrl}</p>
            {formData.imageUrl.match(/\.(mp4|webm|mov)$/i) ? (
              <video src={formData.imageUrl} controls style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px" }} />
            ) : (
              <img src={formData.imageUrl} alt="Uploaded preview" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px", objectFit: "cover" }} />
            )}
            <button 
              type="button" 
              onClick={() => setFormData(prev => ({ ...prev, imageUrl: "" }))}
              style={{ display: "block", marginTop: "0.5rem", color: "var(--accent-danger)", fontSize: "0.85rem", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Remove Media
            </button>
          </div>
        )}
      </div>

      <div>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "600", cursor: "pointer", fontSize: "0.9rem" }}>
          <input 
            type="checkbox" 
            checked={formData.isExclusive}
            onChange={(e) => setFormData(prev => ({ ...prev, isExclusive: e.target.checked }))}
            style={{ accentColor: "var(--accent-primary)", width: "16px", height: "16px" }}
          />
          Exclusive Content
        </label>
      </div>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
        <button type="button" onClick={() => router.back()} className="btn glass">Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? "Saving..." : newsId ? "Update Article" : "Create Article"}
        </button>
      </div>
    </form>
  );
}
