/* eslint-disable no-dupe-class-members */
/* eslint-disable max-classes-per-file */
import fs from 'fs/promises';
import Graph from './graph/Graph';
import GraphEdge from './graph/GraphEdge';
import GraphVertex from './graph/GraphVertex';
import Node, { NodeState } from './Node';
import { topologicalSort } from './utils/graph';

const createIdGen = (prefix = 'n') => {
  let id = 0;
  // eslint-disable-next-line no-plusplus
  return () => `${prefix}${(id++).toString()}`;
};

export class Suite {
  graph: Graph<Node>;

  id: (x: { name: string, params: any }) => string;
  testFilePath: string;

  constructor(testFilePath: string) {
    this.graph = new Graph<Node>();
    this.id = createIdGen();
    this.testFilePath = testFilePath;
  }

  static async create(testFilePath: string, fn: (_: { add: Suite['add'] }) => Promise<void>): Promise<Suite> {
    const suite = new Suite(testFilePath);
    await fn({ add: suite.add.bind(suite) });
    return suite;
  }

  add({
    name,
    action,
    params,
    parents = [],
  }: {
    name: string;
    action: Function;
    params?: any;
    parents?: Node[];
  }): Node {
    if (typeof name !== 'string') throw new Error('Missing name arg');
    if (typeof action !== 'function') throw new Error('Missing action arg');

    const key = this.id({ name, params });
    const actionName = action.name;

    if (!actionName)
      throw new Error(`Actions must be named functions: the action for '${name}' is not a named function.'`);

    const node = new Node(key, name, actionName, params, 'pending');

    const newVertex = new GraphVertex(node);
    this.graph.addVertex(newVertex);

    parents.forEach((dep) => {
      if (dep instanceof Node) {
        const parent = this.graph.getVertexByKey(dep.key);
        this.graph.addEdge(new GraphEdge<Node>(parent, newVertex));
      } else {
        throw new Error(`Parent is not a node: ${dep}`)
      }
    });

    return node;
  }

  async validate(): Promise<void> {
    await fs.stat(this.testFilePath);
    const actionsModule = require(this.testFilePath);
    const missingActions = this.graph.getAllVertices().reduce((acc, { value: { actionName } }) => {
      if (typeof actionsModule[actionName] !== 'function') acc.push(actionName);
      return acc;
    }, [] as string[]);

    if (missingActions.length) {
      throw new Error(`The following action functions are missing from ${this.testFilePath}: ${missingActions.join()}`);
    }
  }

  getNode(key: string): Node | null {
    return this.graph.getVertexByKey(key)?.value;
  }

  setNodeState(key: string, state: NodeState) {
    this.graph.updateVertexValue(key, { state });
  }

  getNodeState(key: string) {
    return this.getNode(key)?.state;
  }

  hasPendingOrStarted() {
    const allNodeStates = this.graph.getAllVertices().map((v) => v.value.state);
    return allNodeStates.includes('pending') || allNodeStates.includes('started');
  }

  getParentNodes(key: string) {
    return this.graph.getEdgesByEndVertex(key).map(e => e.startVertex.value);
  }

  getTopoSorted() {
    const ready = topologicalSort(this.graph);

    return ready.map((s) => s.value);
  }

  renderDot() {
    const buildAttrs = (n: Node) => {
      const col = n.state === 'aborted' ? 'red' : (n.state === 'failed' ? 'yellow' : 'green');
      return `label="${n.name}" color="${col}"`
    }

    return `digraph g {
      ${this.graph.getAllVertices().map(v => `${v.getKey()} [${buildAttrs(v.value)}];`).join(' ')}

      ${this.graph.getAllEdges().map(e => `${e.startVertex.getKey()} -> ${e.endVertex.getKey()};`).join(' ')}
    }`
  }
}
