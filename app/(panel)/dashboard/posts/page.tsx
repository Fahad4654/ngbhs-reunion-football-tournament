import PostForm from "./post-form";

export default function CreatePostPage() {
  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div className="badge" style={{ marginBottom: '0.5rem' }}>Community Sharing</div>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Create a New Post</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Share your tournament experience with the community. Posts will be visible on the blog after approval.
        </p>
      </header>

      <div style={{ maxWidth: '800px' }}>
        <PostForm />
      </div>
    </div>
  );
}
