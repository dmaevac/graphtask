import chalk from 'chalk';
import { terminal as term } from 'terminal-kit';
import Graph from '../graph/Graph';
import TaskStateStore from '../TaskStateStore';
import Node from '../Node';
import { stateColorFn } from '../lib/colors';
import { replaceUnicode } from '../lib/text';
import { IRenderer } from '../types';
import { Iterator } from '../utils/Iterable';
import { formatElapsed } from '../utils/time';

export default class TaskProgressRenderer implements IRenderer<Node> {
  positions: Map<string, number>;
  store?: TaskStateStore;
  graph?: Graph<Node>;
  handle: NodeJS.Timer;

  constructor() {
    this.positions = new Map();
    term.clear();

    this.handle = setInterval(() => {
      process.nextTick(() => {
        this.render();
      })
    }, 100);
  }

  onDestroy(): void {
    clearInterval(this.handle);
    this.render();
  }

  async onStateChange(key: string, graph: Graph<Node>, store: TaskStateStore): Promise<void> {
      this.store = store;
      this.graph = graph;
  }

  private render() {
    if (!this.store || !this.graph) return;

    for (const key of this.store.getAllKeys()) {

      const item = this.store?.getState(key);
      const metrics = this.store?.getMetrics(key);
      let content = `NOT FOUND ${key}`;

      if (!this.positions.has(key)) {
        this.positions.set(key, this.positions.size + 1);
      }

      if (item) {
        const node = this.graph.getVertexByKey(key)?.value || { name: 'Unnamed' };
        const parentKeys = Iterator.map((e) => e.startVertex.value.key, this.graph.getEdgesByEndVertex(key));
        const text = item.status === 'failed' ? replaceUnicode(item.output) : '';
        const elapsed = metrics?.start && item.status !== 'aborted'
          ? formatElapsed(metrics?.start, metrics?.end): '--:--.---';

        content = `${chalk.gray(elapsed)} ${key} (${[...parentKeys].join()}) [${stateColorFn[item.status](
          item.status.toUpperCase(),
          )}] "${node.name}": ${text}`;
        }

        term.moveTo(1, this.positions.get(key), content);
      }
  }
}
