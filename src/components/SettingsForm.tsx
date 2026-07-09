"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/settings";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface SettingsFormProps {
  initialName: string;
  email: string;
}

export default function SettingsForm({ initialName, email }: SettingsFormProps) {
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);
    
    try {
      await updateProfile(name);
      setSuccess(true);
      router.refresh(); // Refresh to update navbar name
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">Email Address</label>
        <input 
          disabled
          value={email}
          className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground focus-visible:outline-none cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">Your email address cannot be changed.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">Full Name</label>
        <input 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. John Doe"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="pt-4 flex items-center gap-4">
        <button 
          type="submit" 
          disabled={isSaving || name === initialName}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Changes
        </button>
        {success && <span className="text-sm text-green-600 font-medium">Profile updated successfully!</span>}
      </div>
    </form>
  );
}
