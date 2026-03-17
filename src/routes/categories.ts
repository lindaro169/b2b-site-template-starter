/**
 * Categories API Router
 * Handles CRUD operations for product categories
 */

import { Router } from "itty-router";
import { json, error } from "itty-router";
import { z } from "zod";
import type { RouteDb } from "./route-db";
import { categories } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export function createCategoriesRouter(db: unknown) {
  const categoriesRouter = Router({ base: "/api/categories" });
  const routeDb = db as RouteDb;

  /**
   * GET /api/categories
   * Get all categories
   */
  categoriesRouter.get("/", async () => {
    try {
      const result = await routeDb.select().from(categories);
      return json({
        success: true,
        data: result,
        total: result.length,
      });
    } catch (err) {
      console.error("Error fetching categories:", err);
      return error(500, "Internal Server Error");
    }
  });

  /**
   * GET /api/categories/tree
   * Get categories as tree structure (for admin)
   */
  categoriesRouter.get("/tree", async () => {
    try {
      const result = await routeDb.select().from(categories);
      // For now, return flat list as tree (since parentId not in D1 yet)
      return json({
        success: true,
        data: result.map((cat) => ({ ...cat, children: [] })),
        total: result.length,
      });
    } catch (err) {
      console.error("Error fetching category tree:", err);
      return error(500, "Internal Server Error");
    }
  });

  /**
   * GET /api/categories/:id
   * Get a single category by ID
   */
  categoriesRouter.get("/:id", async (request: Request) => {
    try {
      const { id } = request.params;
      const category = await routeDb
        .select()
        .from(categories)
        .where(eq(categories.id, parseInt(id)))
        .limit(1);

      if (!category.length) {
        return error(404, "Category not found");
      }

      return json({
        success: true,
        data: category[0],
      });
    } catch (err) {
      console.error("Error fetching category:", err);
      return error(500, "Internal Server Error");
    }
  });

  /**
   * POST /api/categories
   * Create a new category
   */
  categoriesRouter.post("/", async (request: Request) => {
    try {
      const body = await request.json();

      const categorySchema = z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        isActive: z.boolean().optional(),
      });

      const validated = categorySchema.parse(body);

      const result = await routeDb
        .insert(categories)
        .values({
          ...validated,
          isActive: validated.isActive ? 1 : 0,
          createdAt: new Date().toISOString(),
        })
        .returning();

      return json(
        {
          success: true,
          data: result[0],
          message: "Category created successfully",
        },
        { status: 201 }
      );
    } catch (err) {
      console.error("Error creating category:", err);
      if (err instanceof z.ZodError) {
        return error(400, "Validation error: " + err.message);
      }
      return error(500, "Internal Server Error");
    }
  });

  /**
   * PUT /api/categories/:id
   * Update a category
   */
  categoriesRouter.put("/:id", async (request: Request) => {
    try {
      const { id } = request.params;
      const body = await request.json();

      const categorySchema = z.object({
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        isActive: z.boolean().optional(),
      });

      const validated = categorySchema.parse(body);

      const result = await routeDb
        .update(categories)
        .set({
          ...validated,
          isActive: validated.isActive !== undefined ? (validated.isActive ? 1 : 0) : undefined,
        })
        .where(eq(categories.id, parseInt(id)))
        .returning();

      if (!result.length) {
        return error(404, "Category not found");
      }

      return json({
        success: true,
        data: result[0],
        message: "Category updated successfully",
      });
    } catch (err) {
      console.error("Error updating category:", err);
      if (err instanceof z.ZodError) {
        return error(400, "Validation error: " + err.message);
      }
      return error(500, "Internal Server Error");
    }
  });

  /**
   * DELETE /api/categories/:id
   * Delete a category
   */
  categoriesRouter.delete("/:id", async (request: Request) => {
    try {
      const { id } = request.params;

      const result = await routeDb
        .delete(categories)
        .where(eq(categories.id, parseInt(id)))
        .returning();

      if (!result.length) {
        return error(404, "Category not found");
      }

      return json({
        success: true,
        message: "Category deleted successfully",
        deletedId: parseInt(id),
      });
    } catch (err) {
      console.error("Error deleting category:", err);
      return error(500, "Internal Server Error");
    }
  });

  return categoriesRouter;
}
