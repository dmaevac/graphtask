import Graph from '../graph/Graph';
import TaskStateStore from '../TaskStateStore';
import Node from '../Node';
import { replaceUnicode } from '../lib/text';
import { IReporter } from '../types';
import { Iterator } from '../utils/Iterable';

export default class LogReporter implements IReporter<Node> {
  constructor(private filePath: string) {}

  getOutputFilePath(): string {
    return this.filePath;
  }

  async report(graph: Readonly<Graph<Node>>, state: Readonly<TaskStateStore>): Promise<string> {
    const lines = Iterator.map(
      (vertex) => {
        let line = '';
        const key = vertex.getKey();
        const parentKeys = Iterator.map((e) => e.startVertex.value.key, graph.getEdgesByEndVertex(key));
        const item = state.getState(key);

        if (!item) return (line += `${key} NOT FOUND \n`);

        const text = replaceUnicode(item.output);

        line += `${item.change} ${key} (${[...parentKeys].join()}) ${vertex.value.name}`;

        if (item.status !== 'pending') {
          line += `: [${item.status.toUpperCase()}]: ${text}`;
        } else {
          line += `: ${vertex.value.name}${
            vertex.value.params ? `\n\tINPUT: ${JSON.stringify(vertex.value.params)}` : ''
          }`;
        }

        return line;
      },
      graph.getAllVertices()
    )

    return Array.from(lines).join('\n');
  }
}
