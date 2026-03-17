/**
 * Projects API Router
 * Handles project showcase/case studies CRUD operations
 */

import { Router } from "itty-router";
import { json, error } from "itty-router";
import { z } from "zod";
import type { RouteDb } from "./route-db";
import { projects } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export function createProjectsRouter(db: unknown) {
  const projectsRouter = Router();
  const routeDb = db as RouteDb;

  /**
   * GET /api/projects
   * Get all projects with optional filtering
   */
  projectsRouter.get("/", async (request: Request) => {
    try {
      const url = new URL(request.url);
      const isActive = url.searchParams.get("isActive");
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let query = routeDb.select().from(projects);

      if (isActive !== null) {
        const active = isActive === "true";
        query = query.where(eq(projects.isActive, active));
      }

      const allProjects = await query;
      const result = allProjects.slice(offset, offset + limit);

      return json({
        success: true,
        data: result,
        total: allProjects.length,
        limit,
        offset,
      });
    } catch (err) {
      console.error("Error fetching projects:", err);
      return error(500, "Internal Server Error");
    }
  });

  /**
   * GET /api/projects/:id
   * Get a single project by ID
   */
  projectsRouter.get("/:id", async (request: Request) => {
    try {
      const { id } = request.params;
      const project = await routeDb
        .select()
        .from(projects)
        .where(eq(projects.id, parseInt(id)))
        .limit(1);

      if (!project.length) {
        return error(404, "Project not found");
      }

      return json({
        success: true,
        data: project[0],
      });
    } catch (err) {
      console.error("Error fetching project:", err);
      return error(500, "Internal Server Error");
    }
  });

  /**
   * GET /api/projects/slug/:slug
   * Get a single project by slug
   */
  projectsRouter.get("/slug/:slug", async (request: Request) => {
    try {
      const { slug } = request.params;
      const project = await routeDb
        .select()
        .from(projects)
        .where(eq(projects.slug, slug))
        .limit(1);

      if (!project.length) {
        return error(404, "Project not found");
      }

      return json({
        success: true,
        data: project[0],
      });
    } catch (err) {
      console.error("Error fetching project by slug:", err);
      return error(500, "Internal Server Error");
    }
  });

  /**
   * POST /api/projects
   * Create a new project
   */
  projectsRouter.post("/", async (request: Request) => {
    try {
      const body = await request.json();

      const projectSchema = z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        featuredImage: z.string().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
      });

      const validated = projectSchema.parse(body);

      const result = await routeDb
        .insert(projects)
        .values({
          ...validated,
          isActive: validated.isActive ?? false,
          createdAt: new Date().toISOString(),
        })
        .returning();

      return json(
        {
          success: true,
          data: result[0],
          message: "Project created successfully",
        },
        { status: 201 }
      );
    } catch (err) {
      console.error("Error creating project:", err);
      if (err instanceof z.ZodError) {
        return error(400, "Validation error: " + err.message);
      }
      return error(500, "Internal Server Error");
    }
  });

  /**
   * PUT /api/projects/:id
   * Update a project
   */
  projectsRouter.put("/:id", async (request: Request) => {
    try {
      const { id } = request.params;
      const body = await request.json();

      const projectSchema = z.object({
        title: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        featuredImage: z.string().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
      });

      const validated = projectSchema.parse(body);

      const result = await routeDb
        .update(projects)
        .set({
          ...validated,
          isActive: validated.isActive !== undefined ? (validated.isActive ? true : false) : undefined,
        })
        .where(eq(projects.id, parseInt(id)))
        .returning();

      if (!result.length) {
        return error(404, "Project not found");
      }

      return json({
        success: true,
        data: result[0],
        message: "Project updated successfully",
      });
    } catch (err) {
      console.error("Error updating project:", err);
      if (err instanceof z.ZodError) {
        return error(400, "Validation error: " + err.message);
      }
      return error(500, "Internal Server Error");
    }
  });

  /**
   * DELETE /api/projects/:id
   * Delete a project
   */
  projectsRouter.delete("/:id", async (request: Request) => {
    try {
      const { id } = request.params;

      const result = await routeDb
        .delete(projects)
        .where(eq(projects.id, parseInt(id)))
        .returning();

      if (!result.length) {
        return error(404, "Project not found");
      }

      return json({
        success: true,
        message: "Project deleted successfully",
        deletedId: parseInt(id),
      });
    } catch (err) {
      console.error("Error deleting project:", err);
      return error(500, "Internal Server Error");
    }
  });

  return projectsRouter;
}
