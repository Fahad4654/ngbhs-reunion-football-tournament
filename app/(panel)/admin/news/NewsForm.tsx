"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createNews, updateNews } from "@/lib/actions/news.actions";
import MediaRenderer from "@/app/components/MediaRenderer";

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
  const [localPreview, setLocalPreview] = useState<{ url: string; type: "IMAGE" | "VIDEO" } | null>(null);

  // Cleanup local preview URL
  useEffect(() => {
    return () => {
      if (localPreview?.url.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview.url);
      }
    };
  }, [localPreview]);

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

    // Show local preview immediately
    if (localPreview?.url.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview.url);
    }
    const type = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";
    setLocalPreview({ url: URL.createObjectURL(file), type });

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
        // We keep the local blob URL in localPreview for the UI
        // so the user doesn't see a flicker or 'vanish' while the 
        // server URL becomes available.
      } else {
        setError(json.error || "Upload failed");
        setLocalPreview(null);
      }
    } catch (err) {
      setError("An error occurred during upload.");
      setLocalPreview(null);
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
        {(localPreview || formData.imageUrl) && (
          <div style={{ marginTop: "1rem" }}>
            <div style={{ position: "relative", maxWidth: "400px", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
              <MediaRenderer 
                url={localPreview?.url || formData.imageUrl} 
                type={localPreview?.type || (formData.imageUrl.match(/\.(mp4|webm|mov)$/i) ? "VIDEO" : "IMAGE")} 
                style={{ maxHeight: "300px", width: "100%", height: "auto" }}
              />
              <button 
                type="button" 
                onClick={() => {
                  setFormData(prev => ({ ...prev, imageUrl: "" }));
                  setLocalPreview(null);
                }}
                style={{ 
                  position: "absolute", 
                  top: "0.5rem", 
                  right: "0.5rem", 
                  background: "rgba(0,0,0,0.6)", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "50%", 
                  width: "30px", 
                  height: "30px", 
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold"
                }}
                title="Remove Media"
              >
                ✕
              </button>
            </div>
            {formData.imageUrl && !localPreview && (
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                Stored URL: {formData.imageUrl}
              </p>
            )}
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
