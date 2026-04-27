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

      <div style={{ width: '100%', maxWidth: '550px', margin: '0 auto' }}>
        <PostForm user={user} />
      </div>
    </>
  );
}
