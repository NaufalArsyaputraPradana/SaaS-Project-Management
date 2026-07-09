"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { ListType, TaskType } from './KanbanBoard';
import { MoreHorizontal, Plus, Trash2 } from 'lucide-react';

interface Props {
  list: ListType;
  tasks: TaskType[];
  onAddTask: (listId: string) => void;
  onDeleteList: (listId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskClick?: (task: TaskType) => void;
}

export default function ListColumn({ list, tasks, onAddTask, onDeleteList, onDeleteTask, onTaskClick }: Props) {
  const { setNodeRef } = useDroppable({
    id: list.id,
  });

  return (
    <div 
      ref={setNodeRef}
      className="flex-shrink-0 w-[280px] bg-muted/30 border rounded-xl flex flex-col max-h-full"
    >
      <div className="p-3 flex items-center justify-between group">
        <h3 className="font-semibold text-sm pl-1">{list.title} <span className="text-muted-foreground font-normal ml-1">{tasks.length}</span></h3>
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onAddTask(list.id)}
            className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onDeleteList(list.id)}
            className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Delete list"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div 
        className="p-2 pt-0 flex-1 overflow-y-auto space-y-2"
        onWheel={(e) => e.stopPropagation()}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDeleteTask={onDeleteTask} onClick={() => onTaskClick?.(task)} />
          ))}
        </SortableContext>
        
        <button 
          onClick={() => onAddTask(list.id)}
          className="w-full flex items-center gap-2 p-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add a card
        </button>
      </div>
    </div>
  );
}
