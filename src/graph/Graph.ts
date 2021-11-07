import { Iterator } from '../utils/Iterable';
import GraphEdge from './GraphEdge';
import GraphVertex from './GraphVertex';

export default class Graph<T = any> {
  private vertices: Map<string, GraphVertex<T>>;

  private edges: Map<string, GraphEdge<T>>;

  constructor() {
    this.vertices = new Map();
    this.edges = new Map();
  }

  addVertex(newVertex: GraphVertex<T>): Graph {
    const key = newVertex.getKey();
    if (this.vertices.has(key)) {
      throw new Error(`Graph already contains vertex with key '${key}'`);
    }
    this.vertices.set(key, newVertex);

    return this;
  }

  getVertexByKey(vertexKey: string): GraphVertex<T> | undefined {
    return this.vertices.get(vertexKey);
  }

  getAllVertices(): IterableIterator<GraphVertex<T>> {
    return this.vertices.values();
  }

  getAllEdges(): IterableIterator<GraphEdge<T>> {
    return this.edges.values();
  }

  getEdgesByEndVertex(key: string): Generator<GraphEdge<T>> {
    return Iterator.filter((edge) => edge.endVertex.getKey() === key, this.getAllEdges());
  }

  addEdge(edge: GraphEdge<T>): Graph<T> {
    // // Try to find and end start vertices.
    let startVertex = this.getVertexByKey(edge.startVertex.getKey());
    let endVertex = this.getVertexByKey(edge.endVertex.getKey());

    if (!startVertex) {
      this.addVertex(edge.startVertex);
      startVertex = this.getVertexByKey(edge.startVertex.getKey());
    }

    if (!endVertex) {
      this.addVertex(edge.endVertex);
      endVertex = this.getVertexByKey(edge.endVertex.getKey());
    }

    if (!startVertex) {
      throw new Error(`Unable to find or add start vertex for edge '${edge.getKey()}'`);
    }

    // Check if edge has been already added.
    if (this.edges.has(edge.getKey())) {
      throw new Error('Edge has already been added');
    } else {
      this.edges.set(edge.getKey(), edge);
    }

    // As this is a directed then add the edge only to start vertex.
    startVertex.addEdge(edge);

    return this;
  }

  deleteEdge(edge: GraphEdge<T>): void {
    // Delete edge from the list of edges.
    if (this.edges.has(edge.getKey())) {
      this.edges.delete(edge.getKey());
    } else {
      throw new Error('Edge not found in graph');
    }

    // Try to find and end start vertices and delete edge from them.
    const startVertex = this.getVertexByKey(edge.startVertex.getKey());
    const endVertex = this.getVertexByKey(edge.endVertex.getKey());

    startVertex?.deleteEdge(edge);
    endVertex?.deleteEdge(edge);
  }

  findEdge(startVertex: GraphVertex<T>, endVertex: GraphVertex<T>): GraphEdge<T> | undefined {
    const start = this.getVertexByKey(startVertex.getKey());

    return start ? start.findEdge(endVertex) : undefined;
  }

  getWeight(): number {
    return [...this.getAllEdges()].reduce((weight, graphEdge) => weight + graphEdge.weight, 0);
  }

  // reverse(): Graph<T> {
  //   for (const edge of this.getAllEdges()) {
  //     // Delete straight edge from graph and from vertices.
  //     this.deleteEdge(edge);

  //     // Reverse the edge.
  //     edge.reverse();

  //     // Add reversed edge back to the graph and its vertices.
  //     this.addEdge(edge);
  //   }

  //   return this;
  // }

  getVerticesIndices(): Map<string, number> {
    const pairs = Iterator.map((x, idx) => [x.getKey(), idx] as [string, number], this.getAllVertices())
    return new Map(pairs);
  }

  toString(): string {
    return Array.from(this.vertices.keys()).toString();
  }
}
