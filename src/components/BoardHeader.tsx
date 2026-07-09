"use client";

import React, { useState, useEffect } from 'react';
import { Share2, Plus } from 'lucide-react';
import ShareModal from './ShareModal';

interface Props {
  projectName: string;
}

export default function BoardHeader({ projectName }: Props) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{projectName}</h1>
          <p className="text-muted-foreground mt-1">SaaS Project Management Tool</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </button>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-add-list-modal'))}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add List
          </button>
        </div>
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        url={currentUrl} 
        projectName={projectName} 
      />
    </>
  );
}
