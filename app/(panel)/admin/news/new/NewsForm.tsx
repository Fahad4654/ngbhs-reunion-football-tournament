"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createNews } from "@/lib/actions/news.actions";

export default function NewsForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    imageUrl: "",
    isExclusive: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title || !formData.content) {
      setError("Title and content are required");
      return;
    }

    startTransition(async () => {
      const finalSlug = formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const res = await createNews({ ...formData, slug: finalSlug });
      if (res.success) {
        router.push("/admin/news");
      } else {
        setError(res.error || "Failed to create news");
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
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.9rem" }}>Image URL</label>
        <input 
          type="text" 
          value={formData.imageUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
          style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "white", outline: "none" }}
        />
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
          {isPending ? "Saving..." : "Create Article"}
        </button>
      </div>
    </form>
  );
}
