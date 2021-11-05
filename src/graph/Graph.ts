import GraphEdge from './GraphEdge';
import GraphVertex from './GraphVertex';

export default class Graph<T = any> {
  vertices: Record<string, GraphVertex<T>>;

  edges: Record<string, GraphEdge<T>>;

  constructor() {
    this.vertices = {};
    this.edges = {};
  }

  addVertex(newVertex: GraphVertex<T>): Graph {
    this.vertices[newVertex.getKey()] = newVertex;

    return this;
  }

  getVertexByKey(vertexKey: string) {
    return this.vertices[vertexKey];
  }


  // eslint-disable-next-line class-methods-use-this
  getNeighbors(vertex: GraphVertex<T>): GraphVertex<T>[] {
    return vertex.getNeighbors();
  }

  getAllVertices(): GraphVertex<T>[] {
    return Object.values(this.vertices);
  }


  getAllEdges(): GraphEdge<T>[] {
    return Object.values(this.edges);
  }

  getEdgesByEndVertex(key: string): GraphEdge<T>[] {
    return this.getAllEdges().filter(e => e.endVertex.getKey() === key);
  }

  addEdge(edge: GraphEdge<T>): Graph<T> {
    // // Try to find and end start vertices.
    let startVertex = this.getVertexByKey(edge.startVertex.getKey());
    // let endVertex = this.getVertexByKey(edge.endVertex.getKey());

    // // Insert start vertex if it wasn't inserted.
    // if (!startVertex) {
    //   this.addVertex(edge.startVertex);
    //   startVertex = this.getVertexByKey(edge.startVertex.getKey());
    // }

    // // Insert end vertex if it wasn't inserted.
    // if (!endVertex) {
    //   this.addVertex(edge.endVertex);
    //   endVertex = this.getVertexByKey(edge.endVertex.getKey());
    // }

    // Check if edge has been already added.
    if (this.edges[edge.getKey()]) {
      throw new Error('Edge has already been added');
    } else {
      this.edges[edge.getKey()] = edge;
    }

    // If graph IS directed then add the edge only to start vertex.
    startVertex.addEdge(edge);

    return this;
  }


  deleteEdge(edge: GraphEdge<T>) {
    // Delete edge from the list of edges.
    if (this.edges[edge.getKey()]) {
      delete this.edges[edge.getKey()];
    } else {
      throw new Error('Edge not found in graph');
    }

    // Try to find and end start vertices and delete edge from them.
    const startVertex = this.getVertexByKey(edge.startVertex.getKey());
    const endVertex = this.getVertexByKey(edge.endVertex.getKey());

    startVertex.deleteEdge(edge);
    endVertex.deleteEdge(edge);
  }


  findEdge(startVertex: GraphVertex<T>, endVertex: GraphVertex<T>) {
    const vertex = this.getVertexByKey(startVertex.getKey());

    if (!vertex) {
      return;
    }

    return vertex.findEdge(endVertex);
  }

  getWeight(): number {
    return this.getAllEdges().reduce((weight, graphEdge) => weight + graphEdge.weight, 0);
  }


  reverse(): Graph<T> {
    this.getAllEdges().forEach((edge) => {
      // Delete straight edge from graph and from vertices.
      this.deleteEdge(edge);

      // Reverse the edge.
      edge.reverse();

      // Add reversed edge back to the graph and its vertices.
      this.addEdge(edge);
    });

    return this;
  }

  getVerticesIndices(): Record<string, number> {
    const verticesIndices: Record<string, number> = {};
    this.getAllVertices().forEach((vertex, index) => {
      verticesIndices[vertex.getKey()] = index;
    });

    return verticesIndices;
  }

  getAdjacencyMatrix(): number[][] {
    const vertices = this.getAllVertices();
    const verticesIndices = this.getVerticesIndices();

    // Init matrix with infinities meaning that there is no ways of
    // getting from one vertex to another yet.
    const adjacencyMatrix: number[][] = Array(vertices.length)
      .fill(null)
      .map(() => Array(vertices.length).fill(Infinity));

    // Fill the columns.
    vertices.forEach((vertex, vertexIndex) => {
      vertex.getNeighbors().forEach((neighbor) => {
        const neighborIndex = verticesIndices[neighbor.getKey()];
        const weight = this.findEdge(vertex, neighbor)?.weight || 0

        adjacencyMatrix[vertexIndex][neighborIndex] = weight;
      });
    });

    return adjacencyMatrix;
  }

  toString(): string {
    return Object.keys(this.vertices).toString();
  }

  updateVertexValue(key: string, data: any) {
    // TODO: dont like this
    Object.assign(this.vertices[key].value, data);
  }
}
