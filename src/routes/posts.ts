/**
 * Posts API Router
 * Handles blog articles (read-only for public, CRUD for admin)
 */

import { Router } from "itty-router";
import { json, error } from "itty-router";
import { z } from "zod";
import type { RouteDb } from "./route-db";
import { posts } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export function createPostsRouter(db: unknown) {
  const postsRouter = Router();
  const routeDb = db as RouteDb;

  /**
   * GET /api/posts
   * Get all published posts
   */
  postsRouter.get("/", async (request: Request) => {
    try {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      const allPosts = await routeDb
        .select()
        .from(posts)
        .where(eq(posts.published, true));

      const result = allPosts.slice(offset, offset + limit);

      return json({
        success: true,
        data: result,
        total: allPosts.length,
        limit,
        offset,
      });
    } catch (err) {
      console.error("Error fetching posts:", err);
      return error(500, "Internal Server Error");
    }
  });

  /**
   * GET /api/posts/:id
   * Get a single post by ID
   */
  postsRouter.get("/:id", async (request: Request) => {
    try {
      const { id } = request.params;
      const post = await routeDb
        .select()
        .from(posts)
        .where(eq(posts.id, parseInt(id)))
        .limit(1);

      if (!post.length) {
        return error(404, "Post not found");
      }

      return json({
        success: true,
        data: post[0],
      });
    } catch (err) {
      console.error("Error fetching post:", err);
      return error(500, "Internal Server Error");
    }
  });

  /**
   * GET /api/posts/slug/:slug
   * Get a single post by slug
   */
  postsRouter.get("/slug/:slug", async (request: Request) => {
    try {
      const { slug } = request.params;
      const post = await routeDb
        .select()
        .from(posts)
        .where(eq(posts.slug, slug))
        .limit(1);

      if (!post.length) {
        return error(404, "Post not found");
      }

      return json({
        success: true,
        data: post[0],
      });
    } catch (err) {
      console.error("Error fetching post by slug:", err);
      return error(500, "Internal Server Error");
    }
  });

  /**
   * POST /api/posts (admin)
   * Create a new post
   */
  postsRouter.post("/", async (request: Request) => {
    try {
      const body = await request.json();

      const postSchema = z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        featuredImage: z.string().optional(),
        published: z.boolean().optional(),
        publishedAt: z.string().optional(),
      });

      const validated = postSchema.parse(body);

      const result = await routeDb
        .insert(posts)
        .values({
          ...validated,
          published: validated.published ?? false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();

      return json(
        {
          success: true,
          data: result[0],
          message: "Post created successfully",
        },
        { status: 201 }
      );
    } catch (err) {
      console.error("Error creating post:", err);
      if (err instanceof z.ZodError) {
        return error(400, "Validation error: " + err.message);
      }
      return error(500, "Internal Server Error");
    }
  });

  /**
   * PUT /api/posts/:id (admin)
   * Update a post
   */
  postsRouter.put("/:id", async (request: Request) => {
    try {
      const { id } = request.params;
      const body = await request.json();

      const postSchema = z.object({
        title: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        featuredImage: z.string().optional(),
        published: z.boolean().optional(),
        publishedAt: z.string().optional(),
      });

      const validated = postSchema.parse(body);

      const result = await routeDb
        .update(posts)
        .set({
          ...validated,
          published: validated.published !== undefined ? (validated.published ? true : false) : undefined,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(posts.id, parseInt(id)))
        .returning();

      if (!result.length) {
        return error(404, "Post not found");
      }

      return json({
        success: true,
        data: result[0],
        message: "Post updated successfully",
      });
    } catch (err) {
      console.error("Error updating post:", err);
      if (err instanceof z.ZodError) {
        return error(400, "Validation error: " + err.message);
      }
      return error(500, "Internal Server Error");
    }
  });

  /**
   * DELETE /api/posts/:id (admin)
   * Delete a post
   */
  postsRouter.delete("/:id", async (request: Request) => {
    try {
      const { id } = request.params;

      const result = await routeDb
        .delete(posts)
        .where(eq(posts.id, parseInt(id)))
        .returning();

      if (!result.length) {
        return error(404, "Post not found");
      }

      return json({
        success: true,
        message: "Post deleted successfully",
        deletedId: parseInt(id),
      });
    } catch (err) {
      console.error("Error deleting post:", err);
      return error(500, "Internal Server Error");
    }
  });

  return postsRouter;
}
