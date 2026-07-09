"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(data: FormData) {
  const name = data.get("name") as string;
  const email = data.get("email") as string;
  const password = data.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Missing required fields" };
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return { error: "Email is already registered" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user with default workspace and project
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        }
      });

      const workspace = await tx.workspace.create({
        data: {
          name: "Personal Workspace",
          slug: `personal-${user.id.toLowerCase()}`,
          ownerId: user.id,
          members: {
            create: {
              userId: user.id,
              role: "ADMIN"
            }
          }
        }
      });

      const project = await tx.project.create({
        data: {
          name: "My First Project",
          workspaceId: workspace.id,
          members: {
            create: {
              userId: user.id,
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
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to create account" };
  }
}
