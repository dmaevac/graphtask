import Graph from '../graph/Graph';
import TaskStateStore, { TaskStatus } from '../TaskStateStore';
import { IReporter, TaskResult } from '../types';
import Node from '../Node';
import { stateColor } from '../lib/colors';
import { Iterator } from '../utils/Iterable';

const buildAttrs = (node: Node, state: TaskStatus, output: TaskResult) => {
  const col = stateColor[state];
  return { label: node.name, color: col, tooltip: state === 'failed' ? JSON.stringify(output.error) : null };
};

const objectToAttrString = (o: Record<string, number | string | null>) =>
  Object.entries(o)
    .filter(([k, v]) => k && v)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');

export default class DotReporter implements IReporter<Node> {
  constructor(private filePath: string) {}

  getOutputFilePath(): string {
    return this.filePath;
  }

  async report(graph: Readonly<Graph<Node>>, state: Readonly<TaskStateStore>): Promise<string> {
    const verts = Iterator.map((v) => {
      const item = state.getState(v.getKey());

      return item
        ? `${v.getKey()} [${objectToAttrString(buildAttrs(v.value, item.status, item.output))}];`
        : `${v.getKey()} [label="NOT FOUND]`;
    }, graph.getAllVertices());

    const edges = Iterator.map(
      (e) => `${e.startVertex.getKey()} -> ${e.endVertex.getKey()}${e.label ? ` [label="${e.label}"]` : ''};`,
      graph.getAllEdges(),
    );

    const dot = `
    digraph g {
      fontname="sans-serif"

      ${[...verts].join(' ')}

      ${[...edges].join(' ')}
    }`;

    return dot;
  }
}
