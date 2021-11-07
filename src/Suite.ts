import fs from 'fs';
import Graph from './graph/Graph';
import GraphEdge from './graph/GraphEdge';
import GraphVertex from './graph/GraphVertex';
import Stack from './lists/Stack';
import Node from './Node';
import { TaskInput } from './types';
import { topo } from './utils/graph';
import { Iterator } from './utils/Iterable';

const createIdGen = (prefix = 'n') => {
  let id = 0;
  // eslint-disable-next-line no-plusplus
  return () => `${prefix}${(id++).toString()}`;
};

export default class Suite {
  private graph: Graph<Node>;

  id: (x: { name: string; params: any }) => string;
  flowFilePath: string;
  actionsFilePath: string;
  actionsModule: any;

  constructor(flowFilePath: string, actionsFilePath: string) {
    this.graph = new Graph<Node>();
    this.id = createIdGen();
    this.flowFilePath = flowFilePath;
    this.actionsFilePath = actionsFilePath;
    const stat = fs.statSync(actionsFilePath);
    if (!stat) throw new Error(`actions file not found ${actionsFilePath}`);
    this.actionsModule = require(actionsFilePath);
  }

  task({
    name,
    action,
    params,
    input = [],
  }: {
    name: string;
    action: (input: TaskInput) => Promise<any> | string;
    params?: any;
    input?: Node[] | Record<string, Node>;
  }): Node {
    if (typeof name !== 'string') throw new Error('Missing name arg');
    if (typeof action !== 'function' && typeof action !== 'string')
      throw new Error(`Missing action for '${name}', argument must be a string or a function reference`);
    if (input && typeof input !== 'object') throw new Error('input must be an array or hash of tasks');

    const actionName = typeof action === 'string' ? action : action.name;

    if (!actionName) {
      throw new Error(`Actions must be named functions: the action for '${name}' is not a named function.'`);
    }

    if (!this.actionsModule[actionName]) {
      throw new Error(`Actions '${actionName}' not found in actions file.`);
    }

    const labeledInputs = !Array.isArray(input);

    // TODO: Refactor this
    const edgesData: [string | undefined, Node][] = !labeledInputs
      ? input.map((start) => {
          this.validateInputArg(start);
          return [undefined, start];
        })
      : Object.entries(input).map(([label, start]) => {
          this.validateInputArg(start);
          return [label, start];
        });

    const key = this.id({ name, params });
    const node = new Node(key, name, actionName, params, { labeledInputs });
    const newVertex = new GraphVertex(node);

    this.graph.addVertex(newVertex);

    edgesData.forEach(([label, start]) => {
      const startVertex = this.graph.getVertexByKey(start.key);
      if (startVertex) this.graph.addEdge(new GraphEdge<Node>(startVertex, newVertex, label));
    });

    return node;
  }

  private validateInputArg(start: Node) {
    if (!(start instanceof Node)) throw new Error(`Input is not a task: ${start}`);
    if (!this.graph.getVertexByKey(start.key)) throw new Error(`Input is not a task of this graph: ${start}`);
  }

  validate(): void {
    const missingActions = Array.from(
      Iterator.map(
        ({ value: { actionName } }) => actionName,
        Iterator.filter(
          ({ value: { actionName } }) => typeof this.actionsModule[actionName] !== 'function',
          this.graph.getAllVertices(),
        ),
      ),
    );

    if (missingActions.length) {
      throw new Error(`The following action functions are missing from actions file: ${missingActions.join()}`);
    }
  }

  getGraph(): Readonly<Graph<Node>> {
    return Object.freeze(this.graph);
  }

  getNode(key: string): Node | undefined {
    return this.graph.getVertexByKey(key)?.value;
  }

  getAllNodeKeys(): Generator<string> {
    return Iterator.map((v) => v.getKey(), this.graph.getAllVertices());
  }

  getParentsAndEdges(key: string): Generator<{ node: Readonly<Node>; label?: string }> {
    return Iterator.map(
      ({ label, startVertex }) => ({ label, node: startVertex.value }),
      this.graph.getEdgesByEndVertex(key),
    );
  }

  getParentNodes(key: string): Generator<Node> {
    return Iterator.map((e) => e.startVertex.value, this.graph.getEdgesByEndVertex(key));
  }

  getTopoSorted(): Stack<Node> {
    const stack = new Stack<Node>();
    for (const s of topo(this.graph)) {
      stack.push(s);
    }
    return stack;
  }
}
