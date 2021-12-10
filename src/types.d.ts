import Graph from './graph/Graph';
import TaskStateStore from './TaskStateStore';

// TODO: Flesh this out properly
export type TaskResult = any;

export type TaskInput = {
  input: TaskResult[] | Record<string, TaskResult>;
  params?: Record<string, any>;
};

export interface IRenderer<T = any> {
  onStateChange(key: string, graph: Readonly<Graph<T>>, state: Readonly<TaskStateStore>): Promise<void>;
  onDestroy(): void;
}

export interface IReporter<T = any> {
  report(graph: Readonly<Graph<T>>, state: Readonly<TaskStateStore>): Promise<string>;
  getOutputFilePath(): string;
}

export type RunOptions = { output: string; renderer?: 'log' | 'taskprogress'; plan: boolean };

