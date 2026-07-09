"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Trello, Plus, LogOut } from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import CreateProjectModal from "./CreateProjectModal";

interface Project {
  id: string;
  name: string;
}

interface SidebarNavProps {
  projects: Project[];
}

export function SidebarNav({ projects }: SidebarNavProps) {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="mb-4 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Menu
        </div>
        <nav className="grid gap-1">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group ${
              pathname === "/dashboard" 
                ? "bg-primary/10 text-primary" 
                : "text-foreground hover:bg-muted"
            }`}
          >
            <LayoutDashboard className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Dashboard
          </Link>
          
          <div className="mt-6 mb-2 px-2 flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Projects</span>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="hover:bg-primary/20 hover:text-primary rounded p-1 transition-colors"
              title="Create new project"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {projects.map(project => {
            const isActive = pathname.includes(`/project/${project.id}`);
            return (
              <Link 
                key={project.id}
                href={`/project/${project.id}/board`} 
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Trello className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="truncate">{project.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 mb-4 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Preferences
        </div>
        <nav className="grid gap-1">
          <Link 
            href="/settings" 
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group ${
              pathname === "/settings"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Settings className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Settings
          </Link>
        </nav>
      </div>

      <div className="mt-auto pt-4 border-t border-border">
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group"
        >
          <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
          Log Out
        </button>
      </div>

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
