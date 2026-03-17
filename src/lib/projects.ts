import {
    D1Database,
    getProjectsD1,
    getProjectD1,
    createProjectD1,
    updateProjectD1,
    deleteProjectD1,
} from './d1-db';

export interface Project {
    id: number;
    title: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    link?: string;
    createdAt: string;
    updatedAt: string;
}

// Mock data
const mockProjects = new Map<number, Project>();
let nextProjectId = 1;

export async function initializeSampleProjects() {
    if (mockProjects.size > 0) return;

    const samples = [
        {
            title: 'Project 1',
            slug: 'project-1',
            description: 'Description for project 1',
            imageUrl: 'https://via.placeholder.com/800x600',
            link: 'https://example.com/project-1',
        },
        {
            title: 'Project 2',
            slug: 'project-2',
            description: 'Description for project 2',
            imageUrl: 'https://via.placeholder.com/800x600',
            link: 'https://example.com/project-2',
        },
    ];

    for (const sample of samples) {
        const project: Project = {
            id: nextProjectId++,
            ...sample,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockProjects.set(project.id, project);
    }
}

export async function getProjects(
    filters?: { limit?: number; offset?: number },
    db?: D1Database
): Promise<{
    success: boolean;
    data?: Project[];
    total?: number;
    error?: string;
}> {
    try {
        if (db) {
            const projectsList = await getProjectsD1(db, filters);
            const projects: Project[] = projectsList.map((p) => ({
                id: p.id,
                title: p.title as string,
                slug: p.slug as string,
                description: p.description as string,
                imageUrl: p.image_url as string,
                link: p.link as string,
                createdAt: p.created_at as string,
                updatedAt: (p.updated_at as string) || (p.created_at as string),
            }));
            return {
                success: true,
                data: projects,
                total: projects.length, // Approximation
            };
        }

        await initializeSampleProjects();
        let projects = Array.from(mockProjects.values());

        // Sort by createdAt desc
        projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (filters?.limit) {
            const offset = filters.offset || 0;
            projects = projects.slice(offset, offset + filters.limit);
        }

        return {
            success: true,
            data: projects,
            total: mockProjects.size,
        };
    } catch (error) {
        console.error('Error fetching projects:', error);
        return {
            success: false,
            error: 'Failed to fetch projects',
        };
    }
}

export async function getProjectById(id: number, db?: D1Database): Promise<{
    success: boolean;
    data?: Project;
    error?: string;
}> {
    try {
        if (db) {
            const p = await getProjectD1(db, id);
            const project: Project = {
                id: p.id,
                title: p.title as string,
                slug: p.slug as string,
                description: p.description as string,
                imageUrl: p.image_url as string,
                link: p.link as string,
                createdAt: p.created_at as string,
                updatedAt: (p.updated_at as string) || (p.created_at as string),
            };
            return { success: true, data: project };
        }

        await initializeSampleProjects();
        const project = mockProjects.get(id);

        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        return { success: true, data: project };
    } catch (error) {
        console.error('Error fetching project:', error);
        return { success: false, error: 'Failed to fetch project' };
    }
}

export async function createProject(
    data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
    db?: D1Database
): Promise<{
    success: boolean;
    data?: Project;
    error?: string;
}> {
    try {
        if (db) {
            const p = await createProjectD1(db, data);
            const project: Project = {
                id: p.id,
                title: p.title as string,
                slug: p.slug as string,
                description: p.description as string,
                imageUrl: p.image_url as string,
                link: p.link as string,
                createdAt: p.created_at as string,
                updatedAt: (p.updated_at as string) || (p.created_at as string),
            };
            return { success: true, data: project };
        }

        await initializeSampleProjects();
        const project: Project = {
            id: nextProjectId++,
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockProjects.set(project.id, project);

        return { success: true, data: project };
    } catch (error) {
        console.error('Error creating project:', error);
        return { success: false, error: 'Failed to create project' };
    }
}

export async function updateProject(
    id: number,
    data: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>,
    db?: D1Database
): Promise<{
    success: boolean;
    data?: Project;
    error?: string;
}> {
    try {
        if (db) {
            const p = await updateProjectD1(db, id, data);
            const project: Project = {
                id: p.id,
                title: p.title as string,
                slug: p.slug as string,
                description: p.description as string,
                imageUrl: p.image_url as string,
                link: p.link as string,
                createdAt: p.created_at as string,
                updatedAt: (p.updated_at as string) || (p.created_at as string),
            };
            return { success: true, data: project };
        }

        await initializeSampleProjects();
        const project = mockProjects.get(id);

        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        const updatedProject = {
            ...project,
            ...data,
            updatedAt: new Date().toISOString(),
        };
        mockProjects.set(id, updatedProject);

        return { success: true, data: updatedProject };
    } catch (error) {
        console.error('Error updating project:', error);
        return { success: false, error: 'Failed to update project' };
    }
}

export async function deleteProject(id: number, db?: D1Database): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        if (db) {
            await deleteProjectD1(db, id);
            return { success: true };
        }

        await initializeSampleProjects();
        if (!mockProjects.has(id)) {
            return { success: false, error: 'Project not found' };
        }
        mockProjects.delete(id);
        return { success: true };
    } catch (error) {
        console.error('Error deleting project:', error);
        return { success: false, error: 'Failed to delete project' };
    }
}
