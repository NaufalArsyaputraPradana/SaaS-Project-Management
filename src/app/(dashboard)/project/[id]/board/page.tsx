import React from 'react';
import dynamic from 'next/dynamic';
import { getBoardData } from '@/app/actions/board';
import BoardHeader from '@/components/BoardHeader';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import KanbanBoardWrapper from '@/components/KanbanBoardWrapper';

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const resolvedParams = await params;
  const projectId = resolvedParams.id;
  
  // Try to find the project to get its name, if it doesn't exist, create a dummy one for demo
  let project = await prisma.project.findUnique({ where: { id: projectId } });
  
  if (!project) {
    // Demo fallback: create a workspace and project if DB is empty
    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: "Default Workspace", slug: "default", ownerId: session?.user?.id || "demo-user" }
      });
    }
    project = await prisma.project.create({
      data: {
        id: projectId,
        name: "Project Alpha",
        workspaceId: workspace.id
      }
    });
  }

  const { columns, cards } = await getBoardData(projectId);

  // Map to Kanban format
  const initialLists = columns.map(c => ({ id: c.id, title: c.name }));
  const initialTasks = cards.map(c => ({ 
    id: c.id, 
    title: c.title, 
    listId: c.columnId,
    description: c.description,
    priority: c.priority,
    dueDate: c.dueDate ? c.dueDate.toISOString() : null,
    checklists: c.checklists || []
  }));

  return (
    <div className="h-full flex flex-col p-6">
      <BoardHeader projectName={project.name} />

      <div className="flex-1 min-h-0 overflow-hidden">
        <KanbanBoardWrapper projectId={projectId} initialLists={initialLists} initialTasks={initialTasks} />
      </div>
    </div>
  );
}
