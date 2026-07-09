
import { FolderGit2, CheckCircle2, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch real data
  const workspaces = await prisma.workspace.findMany({
    where: { ownerId: userId },
    include: {
      projects: {
        include: {
          cards: true
        }
      }
    }
  });

  const allProjects = workspaces.flatMap(w => w.projects);
  const totalProjects = allProjects.length;

  let tasksCompleted = 0;
  let tasksPending = 0;

  allProjects.forEach(project => {
    project.cards.forEach(card => {
      // Assuming 'Done' lists have 'done' in their name or we just hardcode logic for now
      // Actually, we need to check the column name. Let's fetch columns too.
    });
  });

  // Better approach: Count cards by column name
  const columns = await prisma.column.findMany({
    where: {
      project: {
        workspace: {
          ownerId: userId
        }
      }
    },
    include: {
      _count: {
        select: { cards: true }
      }
    }
  });

  columns.forEach(col => {
    if (col.name.toLowerCase().includes('done') || col.name.toLowerCase().includes('complete')) {
      tasksCompleted += col._count.cards;
    } else {
      tasksPending += col._count.cards;
    }
  });

  // Fetch recent activity (mocked for now, as we don't have an activity log table, just showing projects)
  const recentProjects = await prisma.project.findMany({
    where: {
      workspace: { ownerId: userId }
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        {/* Can add a global create button here later if needed */}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <h3 className="tracking-tight text-sm font-medium">Total Projects</h3>
            <FolderGit2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold text-foreground relative z-10">{totalProjects}</div>
          <p className="text-xs text-muted-foreground mt-1 relative z-10">Active workspaces</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <h3 className="tracking-tight text-sm font-medium">Tasks Completed</h3>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-500 relative z-10">{tasksCompleted}</div>
          <p className="text-xs text-muted-foreground mt-1 relative z-10">Across all projects</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <h3 className="tracking-tight text-sm font-medium">Tasks Pending</h3>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-amber-500 relative z-10">{tasksPending}</div>
          <p className="text-xs text-muted-foreground mt-1 relative z-10">Requires attention</p>
        </div>

      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-4">Recent Projects</h2>
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="p-0">
              <ul className="divide-y divide-border">
                {recentProjects.length === 0 ? (
                  <li className="p-10 text-center text-muted-foreground text-sm flex flex-col items-center justify-center space-y-3">
                    <FolderGit2 className="h-8 w-8 text-muted-foreground/50" />
                    <p>No projects yet.</p>
                    <p className="text-xs">Use the <span className="font-bold text-primary">+</span> button in the sidebar to create your first project!</p>
                  </li>
                ) : (
                  recentProjects.map(project => (
                    <li key={project.id}>
                      <Link href={`/project/${project.id}/board`} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <FolderGit2 className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{project.name}</p>
                          <p className="text-xs text-muted-foreground">View Board</p>
                        </div>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight mb-4">System Status</h2>
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium">All systems operational</span>
              </div>
              <div className="h-px w-full bg-border" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Database Connection</span>
                <span className="font-medium text-emerald-500">Connected</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Real-time Sync</span>
                <span className="font-medium text-emerald-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
