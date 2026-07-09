"use client";

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { TaskType } from './KanbanBoard';
import { updateTaskDetails, addChecklistItem, toggleChecklistItem, deleteChecklistItem } from '@/app/actions/board';
import { Loader2, Plus, Trash2, CheckSquare } from 'lucide-react';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskType | null;
  onTaskUpdated: (updatedTask: TaskType) => void;
}

export default function TaskDetailsModal({ isOpen, onClose, task, onTaskUpdated }: TaskDetailsModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Checklist states
  const [checklists, setChecklists] = useState<{id: string, content: string, checked: boolean}[]>([]);
  const [newChecklistContent, setNewChecklistContent] = useState("");
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "Low");
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "");
      setChecklists(task.checklists || []);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    setIsSaving(true);
    
    try {
      const updatedData = {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null
      };
      
      await updateTaskDetails(task.id, updatedData);
      
      onTaskUpdated({
        ...task,
        ...updatedData,
        dueDate: updatedData.dueDate ? updatedData.dueDate.toISOString() : undefined,
        checklists
      });
      
      onClose();
    } catch (error) {
      console.error("Failed to update task", error);
      alert("Failed to update task");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddChecklist = async () => {
    if (!task || !newChecklistContent.trim()) return;
    setIsAddingChecklist(true);
    try {
      const newItem = await addChecklistItem(task.id, newChecklistContent);
      setChecklists(prev => [...prev, newItem]);
      setNewChecklistContent("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsAddingChecklist(false);
    }
  };

  const handleToggleChecklist = async (id: string, checked: boolean) => {
    setChecklists(prev => prev.map(c => c.id === id ? { ...c, checked } : c));
    try {
      await toggleChecklistItem(id, checked);
    } catch (error) {
      console.error(error);
      // Revert on error
      setChecklists(prev => prev.map(c => c.id === id ? { ...c, checked: !checked } : c));
    }
  };

  const handleDeleteChecklist = async (id: string) => {
    const original = [...checklists];
    setChecklists(prev => prev.filter(c => c.id !== id));
    try {
      await deleteChecklistItem(id);
    } catch (error) {
      console.error(error);
      setChecklists(original); // Revert on error
    }
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium leading-none block mb-1.5 text-muted-foreground">Task Title</label>
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-medium"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium leading-none block mb-1.5 text-muted-foreground">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium leading-none block mb-1.5 text-muted-foreground">Due Date</label>
            <input 
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium leading-none block mb-1.5 text-muted-foreground">Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            placeholder="Add a more detailed description..."
          />
        </div>

        {/* Checklist Section */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
            <CheckSquare className="h-4 w-4" /> 
            Checklist
          </div>
          
          <div className="space-y-2 mb-3">
            {checklists.map(item => (
              <div key={item.id} className="flex items-start gap-3 group">
                <input 
                  type="checkbox" 
                  checked={item.checked}
                  onChange={(e) => handleToggleChecklist(item.id, e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className={`text-sm flex-1 ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                  {item.content}
                </span>
                <button 
                  type="button"
                  onClick={() => handleDeleteChecklist(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input 
              value={newChecklistContent}
              onChange={(e) => setNewChecklistContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklist())}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Add an item..."
            />
            <button 
              type="button"
              onClick={handleAddChecklist}
              disabled={isAddingChecklist || !newChecklistContent.trim()}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-3 disabled:opacity-50"
            >
              {isAddingChecklist ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
          <button type="button" onClick={onClose} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted h-10 py-2 px-4 border border-input">Cancel</button>
          <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 disabled:opacity-50">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Task Details"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
