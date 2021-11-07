import chalk from 'chalk';
import Graph from '../graph/Graph';
import TaskStateStore from '../TaskStateStore';
import Node from '../Node';
import { stateColorFn } from '../lib/colors';
import { replaceUnicode } from '../lib/text';
import { IRenderer } from '../types';

export default class LogRenderer implements IRenderer<Node> {
  constructor() {
    process.stdout.setEncoding('utf8');
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onDestroy(): void {
  }

  async onStateChange(key: string, graph: Graph<Node>, store: TaskStateStore): Promise<void> {
    const item = store?.getState(key);
    const v = graph.getVertexByKey(key)?.value || { name: 'Unnamed' };

    if (!item) return;

    const text = replaceUnicode(item.output);

    process.stdout.write(
      `${chalk.gray(Date.now())} ${key} [${stateColorFn[item.status](item.status.toUpperCase())}] ${v.name}: ${text}` +
        '\n',
    );
  }
}
