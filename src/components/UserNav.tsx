"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { User, Settings, LogOut } from "lucide-react";

interface UserNavProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : "US";

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full h-8 w-8 bg-primary/20 flex items-center justify-center font-semibold text-sm cursor-pointer hover:bg-primary/30 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-card border border-border ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95 z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <div className="py-1">
            <Link 
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
            <Link 
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </div>
          <div className="py-1 border-t border-border">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center px-4 py-2 text-sm text-destructive hover:bg-muted"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
