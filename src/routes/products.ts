/**
 * Products API Router
 * Handles CRUD operations for products
 */

import { Router } from "itty-router";
import { json, error } from "itty-router";
import { z } from "zod";
import type { RouteDb } from "./route-db";
import { products, categories } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export function createProductsRouter(db: unknown) {
  const productsRouter = Router();
  const routeDb = db as RouteDb;

  /**
   * GET /api/products
   * Get all products with optional filtering
   */
  productsRouter.get("/", async (request: Request) => {
    try {
      const url = new URL(request.url);
      const categoryId = url.searchParams.get("categoryId");
      const isActive = url.searchParams.get("isActive");
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let query = routeDb.select().from(products);

      if (categoryId) {
        query = query.where(eq(products.categoryId, parseInt(categoryId)));
      }

      if (isActive !== null) {
        const active = isActive === "true";
        query = query.where(eq(products.isActive, active));
      }

      const allProducts = await query;
      const result = allProducts.slice(offset, offset + limit);

      return json({
        success: true,
        data: result,
        total: allProducts.length,
        limit,
        offset,
      });
    } catch (err) {
      console.error("Error fetching products:", err);
      return error(500, "Internal Server Error");
    }
  });

  /**
   * GET /api/products/:id
   * Get a single product by ID
   */
  productsRouter.get("/:id", async (request: Request) => {
    try {
      const { id } = request.params;
      const product = await routeDb
        .select()
        .from(products)
        .where(eq(products.id, parseInt(id)))
        .limit(1);

      if (!product.length) {
        return error(404, "Product not found");
      }

      return json({
        success: true,
        data: product[0],
      });
    } catch (err) {
      console.error("Error fetching product:", err);
      return error(500, "Internal Server Error");
    }
  });

  /**
   * GET /api/products/category/:categorySlug
   * Get products by category slug
   */
  productsRouter.get("/category/:slug", async (request: Request) => {
    try {
      const { slug } = request.params;

      // First, find the category
      const categoryResult = await routeDb
        .select()
        .from(categories)
        .where(eq(categories.slug, slug))
        .limit(1);

      if (!categoryResult.length) {
        return error(404, "Category not found");
      }

      const categoryId = categoryResult[0].id as number;

      // Then get products in that category
      const productsInCategory = await routeDb
        .select()
        .from(products)
        .where(eq(products.categoryId, categoryId));

      return json({
        success: true,
        category: categoryResult[0],
        data: productsInCategory,
        total: productsInCategory.length,
      });
    } catch (err) {
      console.error("Error fetching category products:", err);
      return error(500, "Internal Server Error");
    }
  });

  /**
   * POST /api/products
   * Create a new product
   */
  productsRouter.post("/", async (request: Request) => {
    try {
      const body = await request.json();

      // Validate input
      const productSchema = z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        price: z.number().optional(),
        categoryId: z.number().optional(),
        imageUrl: z.string().optional(),
        isActive: z.boolean().optional(),
      });

      const validated = productSchema.parse(body);

      const result = await routeDb
        .insert(products)
        .values({
          ...validated,
          isActive: validated.isActive ?? false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();

      return json(
        {
          success: true,
          data: result[0],
          message: "Product created successfully",
        },
        { status: 201 }
      );
    } catch (err) {
      console.error("Error creating product:", err);
      if (err instanceof z.ZodError) {
        return error(400, "Validation error: " + err.message);
      }
      return error(500, "Internal Server Error");
    }
  });

  /**
   * PUT /api/products/:id
   * Update a product
   */
  productsRouter.put("/:id", async (request: Request) => {
    try {
      const { id } = request.params;
      const body = await request.json();

      // Validate input
      const productSchema = z.object({
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        categoryId: z.number().optional(),
        imageUrl: z.string().optional(),
        isActive: z.boolean().optional(),
      });

      const validated = productSchema.parse(body);

      const result = await routeDb
        .update(products)
        .set({
          ...validated,
          isActive: validated.isActive !== undefined ? (validated.isActive ? true : false) : undefined,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(products.id, parseInt(id)))
        .returning();

      if (!result.length) {
        return error(404, "Product not found");
      }

      return json({
        success: true,
        data: result[0],
        message: "Product updated successfully",
      });
    } catch (err) {
      console.error("Error updating product:", err);
      if (err instanceof z.ZodError) {
        return error(400, "Validation error: " + err.message);
      }
      return error(500, "Internal Server Error");
    }
  });

  /**
   * DELETE /api/products/:id
   * Delete a product
   */
  productsRouter.delete("/:id", async (request: Request) => {
    try {
      const { id } = request.params;

      const result = await routeDb
        .delete(products)
        .where(eq(products.id, parseInt(id)))
        .returning();

      if (!result.length) {
        return error(404, "Product not found");
      }

      return json({
        success: true,
        message: "Product deleted successfully",
        deletedId: parseInt(id),
      });
    } catch (err) {
      console.error("Error deleting product:", err);
      return error(500, "Internal Server Error");
    }
  });

  return productsRouter;
}
