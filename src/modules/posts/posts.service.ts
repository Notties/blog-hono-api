import { db } from "@/db";
import { posts, type User } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redisClient } from "@/shared/utils/redis";
import type { z } from "zod";
import type { createPostSchema } from "./posts.validation";

const POSTS_CACHE_KEY = "all-posts";

export const PostService = {
  async getAllPosts() {
    return db.select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      authorId: posts.authorId,
    }).from(posts);
  },

  async createPost(data: z.infer<typeof createPostSchema>, user: User) {
    const [newPost] = await db
      .insert(posts)
      .values({ ...data, authorId: user.id })
      .returning();

    if (redisClient.isReady) await redisClient.del(POSTS_CACHE_KEY);
    return newPost;
  },

  async deletePostById(id: number) {
    const [deletedPost] = await db
      .delete(posts)
      .where(eq(posts.id, id))
      .returning();
    if (deletedPost && redisClient.isReady) {
      await redisClient.del(POSTS_CACHE_KEY);
    }
    return deletedPost;
  },
};
