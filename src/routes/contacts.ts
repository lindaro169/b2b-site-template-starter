/**
 * Contacts API Router
 * Handles general contact form submissions
 */

import { Router } from "itty-router";
import { json, error } from "itty-router";
import { z } from "zod";
import type { RouteDb } from "./route-db";
import { contacts } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export function createContactsRouter(db: unknown) {
  const contactsRouter = Router();
  const routeDb = db as RouteDb;

  /**
   * GET /api/contacts
   * Get all contact submissions (admin only)
   */
  contactsRouter.get("/", async () => {
    try {
      const result = await routeDb.select().from(contacts);
      return json({
        success: true,
        data: result,
        total: result.length,
      });
    } catch (err) {
      console.error("Error fetching contacts:", err);
      return error(500, "Internal Server Error");
    }
  });

  /**
   * GET /api/contacts/:id
   * Get a single contact by ID
   */
  contactsRouter.get("/:id", async (request: Request) => {
    try {
      const { id } = request.params;
      const contact = await routeDb
        .select()
        .from(contacts)
        .where(eq(contacts.id, parseInt(id)))
        .limit(1);

      if (!contact.length) {
        return error(404, "Contact not found");
      }

      return json({
        success: true,
        data: contact[0],
      });
    } catch (err) {
      console.error("Error fetching contact:", err);
      return error(500, "Internal Server Error");
    }
  });

  /**
   * POST /api/contacts
   * Create a new contact submission
   */
  contactsRouter.post("/", async (request: Request) => {
    try {
      const body = await request.json();

      const contactSchema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        subject: z.string().optional(),
        message: z.string().min(1),
        phone: z.string().optional(),
      });

      const validated = contactSchema.parse(body);

      const result = await routeDb
        .insert(contacts)
        .values({
          ...validated,
          status: "unread",
          createdAt: new Date().toISOString(),
        })
        .returning();

      return json(
        {
          success: true,
          data: result[0],
          message: "Contact message sent successfully",
        },
        { status: 201 }
      );
    } catch (err) {
      console.error("Error creating contact:", err);
      if (err instanceof z.ZodError) {
        return error(400, "Validation error: " + err.message);
      }
      return error(500, "Internal Server Error");
    }
  });

  /**
   * PUT /api/contacts/:id
   * Update contact status
   */
  contactsRouter.put("/:id", async (request: Request) => {
    try {
      const { id } = request.params;
      const body = await request.json();

      const contactSchema = z.object({
        status: z.enum(["unread", "read", "replied"]).optional(),
      });

      const validated = contactSchema.parse(body);

      const result = await routeDb
        .update(contacts)
        .set(validated)
        .where(eq(contacts.id, parseInt(id)))
        .returning();

      if (!result.length) {
        return error(404, "Contact not found");
      }

      return json({
        success: true,
        data: result[0],
        message: "Contact updated successfully",
      });
    } catch (err) {
      console.error("Error updating contact:", err);
      if (err instanceof z.ZodError) {
        return error(400, "Validation error: " + err.message);
      }
      return error(500, "Internal Server Error");
    }
  });

  /**
   * DELETE /api/contacts/:id
   * Delete a contact
   */
  contactsRouter.delete("/:id", async (request: Request) => {
    try {
      const { id } = request.params;

      const result = await routeDb
        .delete(contacts)
        .where(eq(contacts.id, parseInt(id)))
        .returning();

      if (!result.length) {
        return error(404, "Contact not found");
      }

      return json({
        success: true,
        message: "Contact deleted successfully",
        deletedId: parseInt(id),
      });
    } catch (err) {
      console.error("Error deleting contact:", err);
      return error(500, "Internal Server Error");
    }
  });

  return contactsRouter;
}
