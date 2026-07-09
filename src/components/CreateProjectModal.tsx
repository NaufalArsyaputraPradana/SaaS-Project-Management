"use client";

import React, { useState } from 'react';
import Modal from './Modal';
import { createNewProject } from '@/app/actions/project';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSaving(true);
    setError("");
    
    try {
      const result = await createNewProject(name);
      
      if (result.error) {
        setError(result.error);
        setIsSaving(false);
        return;
      }
      
      if (result.projectId) {
        onClose();
        setName("");
        setIsSaving(false);
        router.push(`/project/${result.projectId}/board`);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}
        
        <div>
          <label className="text-sm font-medium leading-none block mb-1.5">Project Name</label>
          <input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g. Website Redesign"
            autoFocus
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-6">
          <button 
            type="button" 
            onClick={onClose} 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted h-10 py-2 px-4 border border-input"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSaving || !name.trim()} 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
