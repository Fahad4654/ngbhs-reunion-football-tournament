import PostForm from "./post-form";
import { getServerUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";

export default async function CreatePostPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div className="badge" style={{ marginBottom: '0.5rem' }}>Community Sharing</div>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Create a New Post</h1>
      </header>

      <div style={{ width: '100%', maxWidth: '550px' }}>
        <PostForm user={user} />
      </div>
    </div>
  );
}
