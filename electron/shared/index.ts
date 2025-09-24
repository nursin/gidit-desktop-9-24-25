// Shared types and utilities used by both main and renderer processes

export interface Task {
  id: number;
  title: string;
  status: 'todo' | 'in_progress' | 'done' | 'backlog';
}

export type AIResponse = string;