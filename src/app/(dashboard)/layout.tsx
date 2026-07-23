import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Settings, Trello, Search } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserNav from "@/components/UserNav";
import NotificationBell from "@/components/NotificationBell";
import ThemeToggle from "@/components/ThemeToggle";
import { SidebarNav } from "@/components/SidebarNav";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch notifications
  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { readAt: 'asc' } // unread first
  });

  // Fetch user projects
  const workspaces = await prisma.workspace.findMany({
    where: { ownerId: session.user.id },
    include: { projects: true }
  });
  
  const projects = workspaces.flatMap(w => w.projects).map(p => ({ id: p.id, name: p.name }));

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground selection:bg-primary/20">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2 font-bold text-primary">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Trello className="h-5 w-5" />
            </div>
            <span className="text-xl tracking-tight">SaaS Manager</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto py-6 px-4">
          <SidebarNav projects={projects} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full overflow-hidden bg-muted/20">
        {/* Top Header */}
        <header className="h-16 flex items-center gap-4 border-b border-border bg-card/50 backdrop-blur-xl px-8 z-10 sticky top-0">
          <div className="w-full flex-1">
            <form>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="search"
                  placeholder="Search projects, tasks..."
                  className="w-full bg-background/50 hover:bg-background shadow-none appearance-none pl-10 md:w-2/3 lg:w-1/3 flex h-10 rounded-full border border-border px-3 py-1 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </form>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell initialNotifications={notifications} />
            <div className="w-px h-6 bg-border mx-2" />
            <UserNav user={session.user!} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

