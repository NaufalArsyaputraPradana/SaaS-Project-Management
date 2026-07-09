"use client";

import dynamic from 'next/dynamic';

const KanbanBoard = dynamic(() => import('./KanbanBoard'), { ssr: false });

interface Props {
  projectId: string;
  initialLists: { id: string; title: string }[];
  initialTasks: { id: string; title: string; listId: string }[];
}

export default function KanbanBoardWrapper(props: Props) {
  return <KanbanBoard {...props} />;
}
