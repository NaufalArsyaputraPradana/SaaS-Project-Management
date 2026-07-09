"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createNewProject(name: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return { error: "Unauthorized" };
  }

  if (!name || name.trim() === "") {
    return { error: "Project name is required" };
  }

  try {
    // 1. Find user's first workspace (for simplicity, we assume they have one, created on registration)
    let workspace = await prisma.workspace.findFirst({
      where: { ownerId: userId }
    });

    // Fallback if they somehow don't have one
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: "Personal Workspace",
          slug: `personal-${userId.toLowerCase()}`,
          ownerId: userId,
          members: {
            create: {
              userId,
              role: "ADMIN"
            }
          }
        }
      });
    }

    // 2. Create the project and default columns inside a transaction
    const newProject = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name,
          workspaceId: workspace.id,
          members: {
            create: {
              userId,
              role: "ADMIN"
            }
          }
        }
      });

      // Create default Kanban columns
      await tx.column.createMany({
        data: [
          { name: "To Do", order: 0, projectId: project.id },
          { name: "In Progress", order: 1, projectId: project.id },
          { name: "Done", order: 2, projectId: project.id },
        ]
      });

      return project;
    });

    // Revalidate the dashboard layout to ensure sidebar updates immediately
    revalidatePath("/", "layout");

    return { success: true, projectId: newProject.id };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { error: "Failed to create project" };
  }
}
