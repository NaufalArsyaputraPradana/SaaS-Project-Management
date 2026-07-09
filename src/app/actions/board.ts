"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getBoardData(projectId: string) {
  const columns = await prisma.column.findMany({
    where: { projectId },
    orderBy: { order: 'asc' }
  });
  
  const cards = await prisma.card.findMany({
    where: { projectId },
    orderBy: { order: 'asc' },
    include: {
      checklists: {
        orderBy: { id: 'asc' }
      }
    }
  });
  
  return { columns, cards };
}

export async function createList(projectId: string, name: string) {
  // Find highest order
  const lastColumn = await prisma.column.findFirst({
    where: { projectId },
    orderBy: { order: 'desc' }
  });
  const newOrder = lastColumn ? lastColumn.order + 1 : 0;

  const column = await prisma.column.create({
    data: {
      name,
      order: newOrder,
      projectId
    }
  });
  
  return column;
}

export async function createTask(projectId: string, columnId: string, title: string) {
  const session = await getServerSession(authOptions);
  let userId = session?.user?.id;

  if (!userId) {
    // For demo fallback if not logged in
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
      throw new Error("No user found in database to assign to task");
    }
    userId = firstUser.id;
  }

  // Find highest order in this column
  const lastCard = await prisma.card.findFirst({
    where: { columnId },
    orderBy: { order: 'desc' }
  });
  const newOrder = lastCard ? lastCard.order + 1 : 0;

  const card = await prisma.card.create({
    data: {
      title,
      order: newOrder,
      columnId,
      projectId,
      createdById: userId
    }
  });

  return card;
}

export async function deleteList(columnId: string) {
  await prisma.column.delete({
    where: { id: columnId }
  });
  return true;
}

export async function deleteTask(cardId: string) {
  await prisma.card.delete({
    where: { id: cardId }
  });
  return true;
}

export async function updateTaskColumn(cardId: string, newColumnId: string, newOrder: number) {
  // Update task's column and order
  await prisma.card.update({
    where: { id: cardId },
    data: {
      columnId: newColumnId,
      order: newOrder
    }
  });
  return true;
}

export async function updateCardOrders(cards: { id: string; order: number }[]) {
  // Batch update all changed orders
  await Promise.all(
    cards.map(card => 
      prisma.card.update({
        where: { id: card.id },
        data: { order: card.order }
      })
    )
  );
  return true;
}

export async function updateTaskDetails(
  cardId: string, 
  data: { title?: string; description?: string; priority?: string; dueDate?: Date | null }
) {
  await prisma.card.update({
    where: { id: cardId },
    data
  });
  return true;
}

// Checklist Actions
export async function addChecklistItem(cardId: string, content: string) {
  const item = await prisma.checklistItem.create({
    data: {
      content,
      cardId,
      checked: false
    }
  });
  return item;
}

export async function toggleChecklistItem(itemId: string, checked: boolean) {
  const item = await prisma.checklistItem.update({
    where: { id: itemId },
    data: { checked }
  });
  return item;
}

export async function deleteChecklistItem(itemId: string) {
  await prisma.checklistItem.delete({
    where: { id: itemId }
  });
  return true;
}
