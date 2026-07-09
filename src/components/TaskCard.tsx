"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskType } from './KanbanBoard'; // imported from KanbanBoard instead of @/types to be safe
import { GripVertical, Trash2, Calendar, AlignLeft, CheckSquare } from 'lucide-react';

interface Props {
  task: TaskType;
  onDeleteTask?: (taskId: string) => void;
  onClick?: () => void;
}

export default function TaskCard({ task, onDeleteTask, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors: Record<string, string> = {
    High: "bg-destructive/10 text-destructive border-destructive/20",
    Medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
  };
  
  const priorityBorder: Record<string, string> = {
    High: "border-l-destructive",
    Medium: "border-l-amber-500",
    Low: "border-l-emerald-500"
  };

  const priorityStyle = task.priority && priorityColors[task.priority] 
    ? priorityColors[task.priority] 
    : priorityColors["Low"];
    
  const leftBorderStyle = task.priority && priorityBorder[task.priority]
    ? priorityBorder[task.priority]
    : priorityBorder["Low"];

  const hasDescription = !!task.description?.trim();
  const hasChecklists = task.checklists && task.checklists.length > 0;
  const totalChecklists = task.checklists?.length || 0;
  const completedChecklists = task.checklists?.filter(c => c.checked).length || 0;
  const allChecklistsDone = totalChecklists > 0 && totalChecklists === completedChecklists;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`group relative bg-card border border-l-4 rounded-lg shadow-sm hover:shadow-md hover:border-primary/50 transition-all p-3 cursor-grab active:cursor-grabbing ${leftBorderStyle} ${isDragging ? 'opacity-50 ring-2 ring-primary ring-offset-2' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
        {onDeleteTask && (
          <button 
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task.id);
            }}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      
      <p className="text-sm font-medium leading-snug mb-3 pr-6 text-card-foreground">{task.title}</p>
      
      <div className="flex flex-wrap gap-2 mt-3 items-center">
        {task.priority && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${priorityStyle}`}>
            {task.priority}
          </span>
        )}
        
        {task.dueDate && (
          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border border-border text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}

        {hasDescription && (
          <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border border-transparent text-muted-foreground" title="Has description">
            <AlignLeft className="h-3.5 w-3.5" />
          </span>
        )}
        
        {hasChecklists && (
          <span className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${allChecklistsDone ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'border-transparent text-muted-foreground'}`} title={`${completedChecklists} of ${totalChecklists} completed`}>
            <CheckSquare className="h-3 w-3" />
            {completedChecklists}/{totalChecklists}
          </span>
        )}
      </div>
    </div>
  );
}
