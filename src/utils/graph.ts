import Graph from '../graph/Graph';
import GraphVertex from '../graph/GraphVertex';
import Queue from '../lists/Queue';
import Stack from '../lists/Stack';

type VerticesArg<T = any> = {
  currentVertex: GraphVertex<T>| null,
  previousVertex: GraphVertex<T> | null,
  nextVertex?: GraphVertex<T>| null
};
type Callbacks<T> = {
  allowTraversal: (vertices: VerticesArg<T>) => boolean,
  enterVertex: (veritices: VerticesArg<T>) => void,
  leaveVertex: (vertices: VerticesArg<T>) => void,
}

const initCallbacks = <T>(callbacks: Partial<Callbacks<T>> = {}) => {
  const initiatedCallback = callbacks;
  const seen: Record<string, boolean> = {};

  const stubCallback = () => {};

  const allowTraversalCallback = ({ nextVertex }: VerticesArg<T>): boolean => {
    if (nextVertex && !seen[nextVertex.getKey()]) {
      seen[nextVertex.getKey()] = true;
      return true;
    }
    return false;
  };


  initiatedCallback.allowTraversal = callbacks.allowTraversal || allowTraversalCallback;
  initiatedCallback.enterVertex = callbacks.enterVertex || stubCallback;
  initiatedCallback.leaveVertex = callbacks.leaveVertex || stubCallback;

  return initiatedCallback as Callbacks<T>;
};

/**
 * @param {Graph} graph
 * @param {GraphVertex} currentVertex
 * @param {GraphVertex} previousVertex
 * @param {Callbacks} callbacks
 */
const depthFirstSearchRecursive = <T>(
  graph: Graph<T>,
  currentVertex: GraphVertex<T>,
  previousVertex: GraphVertex<T> | null,
  callbacks: Callbacks<T>,
) => {
  callbacks.enterVertex({ currentVertex, previousVertex });

  graph.getNeighbors(currentVertex).forEach((nextVertex) => {
    if (callbacks.allowTraversal({ previousVertex, currentVertex, nextVertex })) {
      depthFirstSearchRecursive(graph, nextVertex, currentVertex, callbacks);
    }
  });

  callbacks.leaveVertex({ currentVertex, previousVertex });
};


export const depthFirstSearch = <T>(graph: Graph<T>, startVertex: GraphVertex<T>, callbacks: Callbacks<T>) => {
  const previousVertex = null;

  depthFirstSearchRecursive(graph, startVertex, previousVertex, initCallbacks(callbacks));
};

export const breadthFirstSearch = <T>(
  graph: Graph<T>,
  startVertex: GraphVertex<T>,
  originalCallbacks: Callbacks<T>,
) => {
  const callbacks = initCallbacks(originalCallbacks);
  const vertexQueue = new Queue<GraphVertex<T>>();

  // Do initial queue setup.
  vertexQueue.enqueue(startVertex);

  let previousVertex: GraphVertex<T> | null = null;

  // Traverse all vertices from the queue.
  while (!vertexQueue.isEmpty()) {
    const currentVertex = vertexQueue.dequeue();
    callbacks.enterVertex({ currentVertex, previousVertex });

    if (currentVertex) {
      // Add all neighbors to the queue for future traversals.
      graph.getNeighbors(currentVertex).forEach((nextVertex) => {
        if (callbacks.allowTraversal({ previousVertex, currentVertex, nextVertex })) {
          vertexQueue.enqueue(nextVertex);
        }
      });
    }

    callbacks.leaveVertex({ currentVertex, previousVertex });

    // Memorize current vertex before next loop.
    previousVertex = currentVertex;
  }
};

export const depthFirstFilter = <T>(graph: Graph<T>, filter: (n: GraphVertex<T>) => boolean) => {
  const visitedSet: Record<string, GraphVertex<T>> = {};
  const unvisitedSet: Record<string, GraphVertex<T>> = {};
  graph.getAllVertices().forEach((vertex) => {
    unvisitedSet[vertex.getKey()] = vertex;
  });

  // Create a stack of already ordered vertices.
  const sortedStack = new Stack<GraphVertex<T>>();

  const dfsCallbacks: Callbacks<T> = {
    enterVertex: ({ currentVertex }) => {
      if (currentVertex) {

        // Add vertex to visited set in case if all its children has been explored.
        visitedSet[currentVertex.getKey()] = currentVertex;

        // Remove this vertex from unvisited set.
        delete unvisitedSet[currentVertex.getKey()];
      }
    },
    leaveVertex: ({ currentVertex }) => {
      // If the vertex has been totally explored then we may push it to stack.
      if (currentVertex && filter(currentVertex)) sortedStack.push(currentVertex);
    },
    allowTraversal: ({ nextVertex }) => !!nextVertex && !visitedSet[nextVertex.getKey()],
  };

  // Let's go and do DFS for all unvisited nodes.
  while (Object.keys(unvisitedSet).length) {
    const currentVertexKey = Object.keys(unvisitedSet)[0];
    const currentVertex = unvisitedSet[currentVertexKey];

    depthFirstSearch(graph, currentVertex, dfsCallbacks);
  }

  return sortedStack.toArray();
}

export function topologicalSort<T>(graph: Graph<T>) {
  // Create a set of all vertices we want to visit.
  const unvisitedSet: Record<string, GraphVertex<T>> = {};
  graph.getAllVertices().forEach((vertex) => {
    unvisitedSet[vertex.getKey()] = vertex;
  });

  // Create a set for all vertices that we've already visited.
  const visitedSet: Record<string, GraphVertex<T>> = {};

  // Create a stack of already ordered vertices.
  const sortedStack = new Stack<GraphVertex<T>>();

  const dfsCallbacks: Callbacks<T> = {
    enterVertex: ({ currentVertex }) => {
      if (currentVertex) {

        // Add vertex to visited set in case if all its children has been explored.
        visitedSet[currentVertex.getKey()] = currentVertex;

        // Remove this vertex from unvisited set.
        delete unvisitedSet[currentVertex.getKey()];
      }
    },
    leaveVertex: ({ currentVertex }) => {
      // If the vertex has been totally explored then we may push it to stack.
      if (currentVertex) sortedStack.push(currentVertex);
    },
    allowTraversal: ({ nextVertex }) => !!nextVertex && !visitedSet[nextVertex.getKey()],
  };

  // Let's go and do DFS for all unvisited nodes.
  while (Object.keys(unvisitedSet).length) {
    const currentVertexKey = Object.keys(unvisitedSet)[0];
    const currentVertex = unvisitedSet[currentVertexKey];

    depthFirstSearch(graph, currentVertex, dfsCallbacks);
  }

  return sortedStack.toArray();
}

export const getTreeTrunks = <T>(graph: Graph<T>) => {
  const vs = graph.getAllVertices();
  const visitedSet: Record<string, boolean> = {};

  const callbacks = initCallbacks<T>({
    enterVertex: ({ currentVertex }) => {
      if (currentVertex) visitedSet[currentVertex.getKey()] = true;
    }
  });

  return vs.reduce<GraphVertex<T>[]>((acc, current) => {
    if (!(current.getKey() in visitedSet)) {
      depthFirstSearch<T>(graph, current, callbacks);
      acc.push(current);
    }
    return acc;
  }, []);
}
