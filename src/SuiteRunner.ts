import Piscina from 'piscina';
import Suite from './Suite';
import Node from './Node';
import TaskStateStore, { isEndStatus, isFailedStatus } from './TaskStateStore';
import { IRenderer, TaskInput, TaskResult } from './types';
import { Iterator } from './utils/Iterable';

type TickFunction = (state: Readonly<TaskStateStore>) => void;

const wait = async (timeout = 1000) =>
  new Promise((res) => {
    setTimeout(res, timeout);
  });

export default class SuiteRunner {
  private suite: Suite;
  private state: TaskStateStore;
  private pool: Piscina;
  private renderer: IRenderer<any> | undefined;
  private tickListeners: TickFunction[] = [];

  constructor(suite: Suite, renderer?: IRenderer, onTick?: TickFunction) {
    this.suite = suite;
    this.renderer = renderer;
    this.state = new TaskStateStore(this.stateChange.bind(this));
    this.pool = new Piscina({
      filename: suite.actionsFilePath,
    });
    if (onTick) this.tickListeners.push(onTick);

    const keys = [...this.suite.getAllNodeKeys()];
    if (!keys || !keys.length) throw new Error('Keys list must be specified');
    keys.forEach((k) => this.state.set(k, 'pending'));
  }

  private stateChange(key: string) {
    this.renderer?.onStateChange(key, this.suite.getGraph(), this.getState());
  }

  getState(): Readonly<TaskStateStore> {
    return Object.freeze(this.state);
  }

  async processItem(item: Node): Promise<void> {
    this.state.set(item.key, 'started');

    const parentFailedStates = Iterator.map(
      ({ key }) => {
        const s = this.state.getState(key);
        if (!s) throw new Error(`No state found for key '${key}'`);
        return isFailedStatus(s.status) ? 1 : 0;
      },
      this.suite.getParentNodes(item.key),
    );

    const allParentsFailed = Math.min(...parentFailedStates) === 1;

    const items = Iterator.map(
      ({ label = '', node }) => [label, this.state.getState(node.key)?.output] as [string, TaskResult],
      Iterator.filter(({ node }) => !!this.state.getState(node.key), this.suite.getParentsAndEdges(item.key)),
    );

    const taskInput: TaskInput = {
      input: item.config.labeledInputs ? Object.fromEntries(items) : Array.from(Iterator.map(([, tr]) => tr, items)),
      params: item.params,
    };

    try {
      if (!allParentsFailed) {
        const output: TaskResult = await this.pool.run(taskInput, { name: item.actionName });
        this.state.set(item.key, 'succeeded', output);
      } else {
        this.state.set(item.key, 'aborted');
      }
    } catch (e: any) {
      const err = e.stack?.toString() || e.message || 'Unknown Error';
      this.state.set(item.key, 'failed', { error: err });
    }
  }

  hasPendingOrStarted(): boolean {
    const allNodeStatuses = this.state.getAllStatuses();
    return allNodeStatuses.includes('pending') || allNodeStatuses.includes('started');
  }

  private async _tick() {
    const state = this.getState();
    for (const listener of this.tickListeners) {
      listener(state);
    }
  }

  private async _loop() {
    const canProcess = (node: Node): boolean => {
      const statuses = Iterator.map((p) => {
        const s = this.state.getState(p.key);
        if (!s) throw new Error(`No state for key '${p.key}'`);
        return isEndStatus(s.status);
      }, this.suite.getParentNodes(node.key));

      const alldepsDone = Array.from(statuses).every(x => x !== false)
      const item = this.state.getState(node.key);

      return !!(item && item.status === 'pending' && alldepsDone);
    };

    for (const node of Iterator.filter(canProcess, this.suite.getTopoSorted().toList())) {
      this.processItem(node);
    }

    await wait(10);
    await this._tick();

    if (this.hasPendingOrStarted()) {
      await this._loop();
    }
    await this._tick();
  }

  async run({ dryRun }: { dryRun: boolean }): Promise<Readonly<TaskStateStore>> {
    this.suite.validate();
    if (dryRun) {
      await this._tick();
    } else {
      await this._loop();
    }
    return Object.freeze(this.state);
  }

  abort(): void {
    const allPendingKeys = this.state.getAllKeysByState({ state: 'pending' });
    allPendingKeys.forEach((key) => this.state.set(key, 'aborted'));
  }
}
