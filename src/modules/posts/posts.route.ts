import { Hono } from "hono";
import { authMiddleware, roleGuard } from "@/shared/middleware/auth.middleware";
import { cache } from "@/shared/middleware/cache.middleware";
import { createPostSchema } from "./posts.validation";
import type { AppEnv } from "@/shared/types/hono";
import { PostService } from "./posts.service";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";

const app = new Hono<AppEnv>();

app.get("/", cache({ key: "all-posts", ttl: 60 }), async (c) => {
  const allPosts = await PostService.getAllPosts();
  return c.json(allPosts);
});
app.post(
  "/",
  authMiddleware,
  zValidator("json", createPostSchema),
  async (c) => {
    const newPost = await PostService.createPost(
      c.req.valid("json"),
      c.get("user")
    );
    return c.json(newPost, 201);
  }
);
app.delete("/:id", authMiddleware, roleGuard(["admin"]), async (c) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    throw new HTTPException(400, { message: "Invalid post ID" });
  }
  const deletedPost = await PostService.deletePostById(id);

  if (!deletedPost) {
    throw new HTTPException(404, { message: "Post not found" });
  }

  return c.json({ message: "Post deleted successfully" });
});

export default app;
