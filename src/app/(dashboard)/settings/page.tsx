import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import SettingsForm from "@/components/SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null; // Layout handles redirect
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) return <div>User not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Preferences</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">Manage your account settings, profile preferences, and application experience.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-border">
        <div className="md:col-span-1 space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Update your personal details. This information will be displayed to other members in your workspaces and projects.
          </p>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
            <SettingsForm initialName={user.name || ""} email={user.email || ""} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
        <div className="md:col-span-1 space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Danger Zone</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Irreversible actions regarding your account and workspaces.
          </p>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Delete Account</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete your account and all associated projects.
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
