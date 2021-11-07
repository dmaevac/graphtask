import LinkedList from '../lists/LinkedList';
import { Iterator } from '../utils/Iterable';
import GraphEdge from './GraphEdge';

export default class GraphVertex<T extends Record<string, any> = any> {
  value: T;

  keyField: string;

  edges: LinkedList<GraphEdge<T>>;

  constructor(value: T, keyField = 'key') {
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

  deleteEdge(edge: GraphEdge<T>): void {
    this.edges.delete(edge);
  }

  *getNeighbors(): Generator<GraphVertex<T>> {
    for (const edge of this.edges) {
      const {
        startVertex, endVertex,
      } = edge;
      yield startVertex === this ? endVertex : startVertex;
    }
  }

  *getEdges(): Generator<GraphEdge<T>> {
    for (const edge of this.edges) {
      yield edge;
    }
  }

  hasEdge(requiredEdge: GraphEdge<T>): boolean {
    for(const edge of this.edges) {
      if (edge === requiredEdge) return true;
    }
    return false;
  }

  hasNeighbor(vertex: GraphVertex<T>): boolean {
    for(const edge of this.edges) {
      if (edge.startVertex === vertex || edge.endVertex === vertex) return true;
    }
    return false;
  }

  findEdge(vertex: GraphVertex<T>): GraphEdge<T> | undefined {
    for(const edge of this.edges) {
      if (edge.startVertex === vertex || edge.endVertex === vertex) return edge;
    }
  }

  getKey(): string {
    return this.value[this.keyField];
  }
}
