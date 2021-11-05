import LinkedList from '../lists/LinkedList';
import GraphEdge from './GraphEdge';

export default class GraphVertex<T extends Record<string, any> = any> {
  value: T;

  keyField: string;

  edges: LinkedList<GraphEdge<T>>;

  constructor(value: T, keyField: string = 'key') {
    if (value === undefined) {
      throw new Error('Graph vertex must have a value');
    }

    this.value = value;
    this.keyField = keyField;
    this.edges = new LinkedList();
  }

  addEdge(edge: GraphEdge<T>): GraphVertex<T> {
    this.edges.append(edge);

    return this;
  }

  deleteEdge(edge: GraphEdge<T>) {
    this.edges.delete(edge);
  }

  getNeighbors(): GraphVertex<T>[] {
    return this.edges.toArray().map((node) => (node.value.startVertex === this
      ? node.value.endVertex
      : node.value.startVertex));
  }

  getEdges(): GraphEdge<T>[] {
    return this.edges.toArray().map((linkedListNode) => linkedListNode.value);
  }

  getDegree(): number {
    return this.edges.toArray().length;
  }

  hasEdge(requiredEdge: GraphEdge<T>): boolean {
    const edgeNode = this.edges.find({
      callback: (edge) => edge === requiredEdge,
    });

    return !!edgeNode;
  }

  hasNeighbor(vertex: GraphVertex<T>): boolean {
    const vertexNode = this.edges.find({
      callback: (edge) => edge.startVertex === vertex || edge.endVertex === vertex,
    });

    return !!vertexNode;
  }

  findEdge(vertex: GraphVertex<T>) {
    const edge = this.edges.find({
      callback: (edge) => edge.startVertex === vertex || edge.endVertex === vertex
    });

    return edge?.value;
  }

  getKey(): string {
    return this.value[this.keyField];
  }

  deleteAllEdges(): GraphVertex<T> {
    this.getEdges().forEach((edge) => this.deleteEdge(edge));

    return this;
  }

  toString(callback: Function): string {
    return callback ? callback(this.value) : `${this.value}`;
  }
}
