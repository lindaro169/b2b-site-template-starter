/**
 * Cloudflare Workers API Router
 * Handles all incoming HTTP requests and routes them to appropriate API handlers
 * with CORS support and comprehensive error handling
 */

import { Router } from "itty-router";
import { json, error } from "itty-router";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./drizzle/schema";

// Import route handlers
import { createProductsRouter } from "./routes/products";
import { createCategoriesRouter } from "./routes/categories";
import { createInquiriesRouter } from "./routes/inquiries";
import { createContactsRouter } from "./routes/contacts";
import { createPostsRouter } from "./routes/posts";
import { createProjectsRouter } from "./routes/projects";

/**
 * CORS Middleware - Allow requests from frontend
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function addCorsHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  return newResponse;
}

/**
 * Main Worker fetch handler
 */
const worker = {
  fetch: async (request: Request, env: unknown) => {
    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      // Initialize database (env shape is platform-specific; treat safely)
      const DBbinding = (env as { DB?: unknown }).DB;
      const db = drizzle(DBbinding as unknown as Parameters<typeof drizzle>[0], { schema });

      // Create main router
      const router = Router();

      /**
       * Root endpoint - health check
       */
      router.get("/api/health", () =>
        json({
          status: "ok",
          timestamp: new Date().toISOString(),
          service: "Template Catalog API",
          version: "1.0.0",
        })
      );

      /**
       * API Documentation
       */
      router.get("/api", () =>
        json({
          name: "Template Catalog API",
          version: "1.0.0",
          description: "Cloudflare Workers API for the sanitized template catalog",
          endpoints: {
            products: "/api/products",
            categories: "/api/categories",
            inquiries: "/api/inquiries",
            contacts: "/api/contacts",
            posts: "/api/posts",
            projects: "/api/projects",
            health: "/api/health",
          },
          database: "Cloudflare D1 (SQLite)",
          orm: "Drizzle ORM",
        })
      );

      /**
       * Create route handlers with database instance
       */
      const productsRouter = createProductsRouter(db);
      const categoriesRouter = createCategoriesRouter(db);
      const inquiriesRouter = createInquiriesRouter(db);
      const contactsRouter = createContactsRouter(db);
      const postsRouter = createPostsRouter(db);
      const projectsRouter = createProjectsRouter(db);

      /**
       * Mount route handlers - both root and wildcard patterns
       */
      router.all("/api/products", productsRouter.handle);
      router.all("/api/products/*", productsRouter.handle);
      router.all("/api/categories", categoriesRouter.handle);
      router.all("/api/categories/*", categoriesRouter.handle);
      router.all("/api/inquiries", inquiriesRouter.handle);
      router.all("/api/inquiries/*", inquiriesRouter.handle);
      router.all("/api/contacts", contactsRouter.handle);
      router.all("/api/contacts/*", contactsRouter.handle);
      router.all("/api/posts", postsRouter.handle);
      router.all("/api/posts/*", postsRouter.handle);
      router.all("/api/projects", projectsRouter.handle);
      router.all("/api/projects/*", projectsRouter.handle);

      /**
       * 404 Handler
       */
      router.all("*", () => error(404, "Not Found"));

      const response = await router.handle(request);
      return addCorsHeaders(response);
    } catch (err) {
      console.error("Worker Error:", err);
      const response = json(
        {
          success: false,
          error: "Internal Server Error",
          message: err instanceof Error ? err.message : "Unknown error",
        },
        { status: 500 }
      );
      return addCorsHeaders(response);
    }
  },
};

export default worker;
