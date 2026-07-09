"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function markNotificationAsRead(id: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Ensure the notification belongs to the user
  const notification = await prisma.notification.findUnique({
    where: { id }
  });

  if (notification?.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() }
  });

  return true;
}
