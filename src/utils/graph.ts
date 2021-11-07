import Graph from '../graph/Graph';
import GraphVertex from '../graph/GraphVertex';

function* dfs<T>(graph: Graph<T>, currentVertex: GraphVertex<T>): Generator<GraphVertex<T>> {
  for (const n of currentVertex.getNeighbors()) {
    yield* dfs(graph, n);
  }
  yield currentVertex;
}

export function* topo<T>(graph: Graph<T>): Generator<T> {
  const visitedSet = new Set<string>();

  for (const currentVertex of graph.getAllVertices()) {
    for (const s of dfs(graph, currentVertex)) {
      if (visitedSet.has(s.getKey())) continue;
      visitedSet.add(s.getKey());
      yield s.value;
    }
  }
}
