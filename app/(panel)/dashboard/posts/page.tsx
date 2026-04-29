import PostForm from "./post-form";
import { getServerUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";

export default async function CreatePostPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return (
    <>
      <div style={{ textAlign: 'center' }}>
      </div>

      <div style={{ width: '100%', maxWidth: 'min(100%, 600px)', margin: '0 auto', padding: '0 0.5rem' }}>
        <PostForm user={user} />
      </div>
    </>
  );
}
