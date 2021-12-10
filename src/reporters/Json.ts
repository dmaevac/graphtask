import Graph from '../graph/Graph';
import TaskStateStore from '../TaskStateStore';
import Node from '../Node';
import { IReporter } from '../types';
import { Iterator } from '../utils/Iterable';

export default class JsonReporter implements IReporter<Node> {
  constructor(private filePath: string) {}

  getOutputFilePath(): string {
    return this.filePath;
  }

  async report(graph: Readonly<Graph<Node>>, state: Readonly<TaskStateStore>): Promise<string> {
    const pairs = Iterator.map(
      v => {
        const key = v.getKey();
        const parentKeys = Iterator.map((e) => e.startVertex.value.key, graph.getEdgesByEndVertex(key));
        const item = state.getState(key);
        const metrics = state.getMetrics(key);

        if (!item) {
          return [key, 'NOT FOUND'];
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { config, ...nodeConfig } = v.value;

          return [key, { ...nodeConfig, inputs: [...parentKeys], ...item, metrics }];
        }
      },
      graph.getAllVertices()
    )

    return JSON.stringify(Object.fromEntries(pairs), null, 2);
  }
}
