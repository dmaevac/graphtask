import Piscina from 'piscina';
import { Suite } from './Suite';
import Node from './Node';

type TaskResult = any;

type TaskInput = {
  parents: TaskResult[];
  params: Record<string, any>;
  global: Record<string, any>;
};

const wait = async (timeout = 1000) =>
  new Promise((res) => {
    setTimeout(res, timeout);
  });

export class SuiteRunner {
  suite: Suite;

  state: Map<any, { input: TaskInput; output?: TaskResult; metrics: { elapsed: number } }>;

  pool: Piscina;

  private globalData: any;

  constructor(suite: Suite) {
    this.suite = suite;
    this.state = new Map();

    this.pool = new Piscina({
      filename: suite.testFilePath,
    });
  }

  async itemDone({ name, key, state }: Node): Promise<void> {
    if (state === 'aborted' || state === 'failed') {
      console.error(`${name}: ${this.suite.getNodeState(key)} - ${JSON.stringify(this.state.get(key), null, 2)}`);
    }
  }

  async processItem(item: Node): Promise<void> {
    this.suite.setNodeState(item.key, 'started');
    const parents = this.suite.getParentNodes(item.key);
    const allFailedParents = parents.length > 0 && parents.every((p) => p.state === 'failed' || p.state === 'aborted');

    const input: TaskInput = {
      parents: parents
        .reduce((acc, p) => {
          const data = this.state.get(p.key);

          return [...acc, { ...p, output: data?.output }];
        }, [] as TaskResult[])
        .filter(Boolean),
      params: item.params,
      global: this.globalData,
    };

    const ts = Date.now();
    let output: TaskResult = {};
    try {
      if (!allFailedParents) {
        output = await this.pool.run({ ...input }, { name: item.actionName });
        this.suite.setNodeState(item.key, 'succeeded');
      } else {
        this.suite.setNodeState(item.key, 'aborted');
      }
    } catch (e: any) {
      output = { error: e?.stack };
      this.suite.setNodeState(item.key, 'failed');
    } finally {
      this.state.set(item.key, { input, output, metrics: { elapsed: Date.now() - ts } });
      this.itemDone(item);
    }
  }

  private async _loop(opts: { dryrun?: boolean }) {
    const nodes = this.suite.getTopoSorted();

    const canProcess = (item: Node) => {
      const nodes = this.suite.getParentNodes(item.key);
      const alldepsDone = nodes.every((node) => node.state && node.state !== 'pending' && node.state !== 'started');
      return item.state === 'pending' && alldepsDone;
    };

    nodes.filter(canProcess).forEach((node) => {
      this.processItem(node);
    });

    await wait(50);

    if (this.suite.hasPendingOrStarted()) {
      await this._loop(opts);
    }
  }

  async run(initialData = {}): Promise<string> {
    await this.suite.validate();

    this.globalData = { ...initialData };
    await this._loop({ dryrun: false });

    const dotGraph = this.suite.renderDot();

    return dotGraph;
  }

  async plan(): Promise<string> {
    await this.suite.validate();

    const dotGraph = this.suite.renderDot();

    return dotGraph;
  }
}
