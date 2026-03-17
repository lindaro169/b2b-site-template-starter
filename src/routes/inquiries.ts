/**
 * Inquiries API Router
 * Handles product inquiry form submissions
 */

import { Router } from "itty-router";
import { json, error } from "itty-router";
import { z } from "zod";
import type { RouteDb } from "./route-db";
import { inquiries } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export function createInquiriesRouter(db: unknown) {
  const inquiriesRouter = Router();
  const routeDb = db as RouteDb;

  /**
   * GET /api/inquiries
   * Get all inquiries (admin only)
   */
  inquiriesRouter.get("/", async () => {
    try {
      const result = await routeDb.select().from(inquiries);
      return json({
        success: true,
        data: result,
        total: result.length,
      });
    } catch (err) {
      console.error("Error fetching inquiries:", err);
      return error(500, "Internal Server Error");
    }
  });

  /**
   * GET /api/inquiries/:id
   * Get a single inquiry by ID
   */
  inquiriesRouter.get("/:id", async (request: Request) => {
    try {
      const { id } = request.params;
      const inquiry = await routeDb
        .select()
        .from(inquiries)
        .where(eq(inquiries.id, parseInt(id)))
        .limit(1);

      if (!inquiry.length) {
        return error(404, "Inquiry not found");
      }

      return json({
        success: true,
        data: inquiry[0],
      });
    } catch (err) {
      console.error("Error fetching inquiry:", err);
      return error(500, "Internal Server Error");
    }
  });

  /**
   * POST /api/inquiries
   * Create a new inquiry
   */
  inquiriesRouter.post("/", async (request: Request) => {
    try {
      const body = await request.json();

      const inquirySchema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        company: z.string().optional(),
        message: z.string().min(1),
        productId: z.number().optional(),
      });

      const validated = inquirySchema.parse(body);

      const result = await routeDb
        .insert(inquiries)
        .values({
          ...validated,
          status: "new",
          createdAt: new Date().toISOString(),
        })
        .returning();

      return json(
        {
          success: true,
          data: result[0],
          message: "Inquiry submitted successfully",
        },
        { status: 201 }
      );
    } catch (err) {
      console.error("Error creating inquiry:", err);
      if (err instanceof z.ZodError) {
        return error(400, "Validation error: " + err.message);
      }
      return error(500, "Internal Server Error");
    }
  });

  /**
   * PUT /api/inquiries/:id
   * Update inquiry status
   */
  inquiriesRouter.put("/:id", async (request: Request) => {
    try {
      const { id } = request.params;
      const body = await request.json();

      const inquirySchema = z.object({
        status: z.enum(["new", "processing", "replied"]).optional(),
        repliedAt: z.string().optional(),
      });

      const validated = inquirySchema.parse(body);

      const result = await routeDb
        .update(inquiries)
        .set(validated)
        .where(eq(inquiries.id, parseInt(id)))
        .returning();

      if (!result.length) {
        return error(404, "Inquiry not found");
      }

      return json({
        success: true,
        data: result[0],
        message: "Inquiry updated successfully",
      });
    } catch (err) {
      console.error("Error updating inquiry:", err);
      if (err instanceof z.ZodError) {
        return error(400, "Validation error: " + err.message);
      }
      return error(500, "Internal Server Error");
    }
  });

  /**
   * DELETE /api/inquiries/:id
   * Delete an inquiry
   */
  inquiriesRouter.delete("/:id", async (request: Request) => {
    try {
      const { id } = request.params;

      const result = await routeDb
        .delete(inquiries)
        .where(eq(inquiries.id, parseInt(id)))
        .returning();

      if (!result.length) {
        return error(404, "Inquiry not found");
      }

      return json({
        success: true,
        message: "Inquiry deleted successfully",
        deletedId: parseInt(id),
      });
    } catch (err) {
      console.error("Error deleting inquiry:", err);
      return error(500, "Internal Server Error");
    }
  });

  return inquiriesRouter;
}
