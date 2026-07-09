"use client";

import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import ListColumn from './ListColumn';
import TaskCard from './TaskCard';
import Modal from './Modal';
import TaskDetailsModal from './TaskDetailsModal';
import { 
  createList, 
  createTask, 
  deleteList, 
  deleteTask, 
  updateTaskColumn, 
  updateCardOrders 
} from '@/app/actions/board';

export type TaskType = {
  id: string;
  listId: string;
  title: string;
  description?: string | null;
  priority?: string | null;
  dueDate?: string | null;
  checklists?: { id: string; content: string; checked: boolean }[];
};

export type ListType = {
  id: string;
  title: string;
};

interface KanbanBoardProps {
  projectId: string;
  initialLists: ListType[];
  initialTasks: TaskType[];
}

export default function KanbanBoard({ projectId, initialLists, initialTasks }: KanbanBoardProps) {
  const [lists, setLists] = useState<ListType[]>(initialLists);
  const [tasks, setTasks] = useState<TaskType[]>(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Modal States
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeListIdForTask, setActiveListIdForTask] = useState<string | null>(null);
  
  // Details Modal
  const [activeTaskForDetails, setActiveTaskForDetails] = useState<TaskType | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    import('@/lib/pusherClient').then(({ pusherClient }) => {
      const channel = pusherClient.subscribe('board-1');
      channel.bind('task-updated', (data: { tasks: TaskType[] }) => {
        setTasks(data.tasks);
      });

      return () => {
        pusherClient.unsubscribe('board-1');
      };
    }).catch(err => console.error("Pusher not configured fully yet:", err));
  }, []);

  useEffect(() => {
    const handleOpenListModal = () => setIsListModalOpen(true);
    window.addEventListener('open-add-list-modal', handleOpenListModal);
    return () => window.removeEventListener('open-add-list-modal', handleOpenListModal);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts, allows onClick to fire!
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const submitAddList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    
    // Optimistic UI update
    const tempId = Date.now().toString();
    setLists(prev => [...prev, { id: tempId, title: newListTitle }]);
    setNewListTitle("");
    setIsListModalOpen(false);

    try {
      const newList = await createList(projectId, newListTitle);
      // Update with real ID from DB
      setLists(prev => prev.map(l => l.id === tempId ? { ...l, id: newList.id } : l));
    } catch (error) {
      console.error("Failed to create list", error);
      // Revert optimistic update
      setLists(prev => prev.filter(l => l.id !== tempId));
    }
  };

  const submitAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !activeListIdForTask) return;
    
    // Optimistic UI update
    const tempId = Date.now().toString();
    setTasks(prev => [...prev, { id: tempId, title: newTaskTitle, listId: activeListIdForTask }]);
    setNewTaskTitle("");
    setIsTaskModalOpen(false);

    try {
      const newTask = await createTask(projectId, activeListIdForTask, newTaskTitle);
      // Update with real ID from DB
      setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: newTask.id } : t));
    } catch (error) {
      console.error("Failed to create task", error);
      // Revert optimistic update
      setTasks(prev => prev.filter(t => t.id !== tempId));
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!window.confirm("Are you sure you want to delete this list and all its tasks?")) return;
    
    // Optimistic
    setLists(prev => prev.filter(l => l.id !== listId));
    setTasks(prev => prev.filter(t => t.listId !== listId));
    
    try {
      await deleteList(listId);
    } catch (error) {
      console.error("Failed to delete list", error);
      alert("Failed to delete list. Please refresh the page.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    // Optimistic
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error("Failed to delete task", error);
      alert("Failed to delete task. Please refresh the page.");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = tasks.some(t => t.id === activeId);
    const isOverTask = tasks.some(t => t.id === overId);
    const isOverList = lists.some(l => l.id === overId);

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex(t => t.id === activeId);
        const overIndex = prev.findIndex(t => t.id === overId);

        let newTasks = [...prev];
        if (newTasks[activeIndex].listId !== newTasks[overIndex].listId) {
          newTasks[activeIndex].listId = newTasks[overIndex].listId;
          newTasks = arrayMove(newTasks, activeIndex, overIndex);
        } else {
          newTasks = arrayMove(newTasks, activeIndex, overIndex);
        }
        
        return newTasks;
      });
    }

    if (isActiveTask && isOverList) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex(t => t.id === activeId);
        const newTasks = [...prev];
        newTasks[activeIndex].listId = overId as string;
        return arrayMove(newTasks, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // After state updates from DragOver, we push the final column and orders to DB
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    try {
      // 1. Update task column if changed
      await updateTaskColumn(activeId, activeTask.listId, 0); // Order updated in batch below
      
      // 2. Batch update orders for tasks in the affected columns
      // Find all tasks in the same column as the active task and map their new orders
      const tasksInColumn = tasks.filter(t => t.listId === activeTask.listId);
      const ordersUpdate = tasksInColumn.map((t, index) => ({ id: t.id, order: index }));
      
      await updateCardOrders(ordersUpdate);
    } catch (error) {
      console.error("Failed to sync drag and drop to database", error);
    }
  };

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      // If the user is scrolling vertically with the mouse wheel, translate it to horizontal scroll
      if (e.deltaY !== 0) {
        scrollContainerRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  return (
    <>
      <div 
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="h-full w-full overflow-x-auto overflow-y-hidden p-4 bg-muted/20"
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 items-start w-max h-full">
            <SortableContext items={lists.map((l) => l.id)}>
              {lists.map((list) => (
                <ListColumn
                  key={list.id}
                  list={list}
                  tasks={tasks.filter((t) => t.listId === list.id)}
                  onAddTask={(listId) => {
                    setActiveListIdForTask(listId);
                    setIsTaskModalOpen(true);
                  }}
                  onDeleteList={handleDeleteList}
                  onDeleteTask={handleDeleteTask}
                  onTaskClick={(task) => {
                    setActiveTaskForDetails(task);
                    setIsDetailsModalOpen(true);
                  }}
                />
              ))}
            </SortableContext>
            
            <button 
              onClick={() => setIsListModalOpen(true)}
              className="flex-shrink-0 w-72 h-12 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors font-medium"
            >
              + Add another list
            </button>
          </div>

          <DragOverlay>
            {activeId ? (
              <TaskCard task={tasks.find((t) => t.id === activeId)!} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <Modal isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)} title="Create New List">
        <form onSubmit={submitAddList} className="space-y-4">
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">List Name</label>
            <input 
              autoFocus
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
              placeholder="e.g. In Progress"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsListModalOpen(false)} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4 border border-input">Cancel</button>
            <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">Create List</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create New Task">
        <form onSubmit={submitAddTask} className="space-y-4">
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Task Title</label>
            <input 
              autoFocus
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
              placeholder="e.g. Update user authentication"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsTaskModalOpen(false)} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4 border border-input">Cancel</button>
            <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">Create Task</button>
          </div>
        </form>
      </Modal>

      <TaskDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setActiveTaskForDetails(null);
        }}
        task={activeTaskForDetails}
        onTaskUpdated={(updatedTask) => {
          setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        }}
      />
    </>
  );
}
