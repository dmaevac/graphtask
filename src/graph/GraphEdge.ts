import GraphVertex from './GraphVertex';

export default class GraphEdge<T = any> {
  public startVertex: Readonly<GraphVertex<T>>;
  public endVertex: Readonly<GraphVertex<T>>;
  public weight: Readonly<number>;
  public label?: Readonly<string>;

  constructor(startVertex: GraphVertex<T>, endVertex: GraphVertex<T>, label?: string, weight = 0) {
    this.startVertex = startVertex;
    this.endVertex = endVertex;
    this.weight = weight;
    this.label = label;
  }

  getKey(): string {
    const startVertexKey = this.startVertex.getKey();
    const endVertexKey = this.endVertex.getKey();

    return `${startVertexKey}_${endVertexKey}`;
  }

  reverse(): GraphEdge<T> {
    const tmp = this.startVertex;
    this.startVertex = this.endVertex;
    this.endVertex = tmp;

    return this;
  }

  toString(): string {
    return this.getKey();
  }
}
