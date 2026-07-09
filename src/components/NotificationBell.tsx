"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { markNotificationAsRead } from "@/app/actions/notifications";

interface Notification {
  id: string;
  type: string;
  content: string;
  readAt: Date | null;
}

interface NotificationBellProps {
  initialNotifications: Notification[];
}

export default function NotificationBell({ initialNotifications }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
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

  const unreadCount = notifications.filter(n => !n.readAt).length;

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date() } : n));
    try {
      await markNotificationAsRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full h-8 w-8 flex items-center justify-center hover:bg-accent text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-lg bg-card border border-border overflow-hidden animate-in fade-in zoom-in-95 z-50">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b border-border last:border-0 flex gap-3 ${!notification.readAt ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm leading-snug">{notification.content}</p>
                  </div>
                  {!notification.readAt && (
                    <button 
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors shrink-0"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
