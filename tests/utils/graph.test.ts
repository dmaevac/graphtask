import test from 'tape';
import Graph from '../../src/graph/Graph';
import GraphEdge from '../../src/graph/GraphEdge';
import GraphVertex from '../../src/graph/GraphVertex';
import { topo } from '../../src/utils/graph';

test('topo', async ({ deepEqual }) => {
  const graph = new Graph();

  const z1 = new GraphVertex({ key: 'z1', name: 'mouse' });
  const a1 = new GraphVertex({ key: 'a1', name: 'dog' });
  const a2 = new GraphVertex({ key: 'a2', name: 'horse' });
  const b1 = new GraphVertex({ key: 'b1', name: 'cat' });
  const b2 = new GraphVertex({ key: 'b2', name: 'rabbit' });
  const c1 = new GraphVertex({ key: 'c1', name: 'fish' });

  graph
    .addVertex(a1)
    .addVertex(b1)
    .addVertex(z1)
    .addVertex(b2)
    .addVertex(c1)
    .addVertex(a2)
    .addEdge(new GraphEdge(a1, b1))
    .addEdge(new GraphEdge(a2, b2))
    .addEdge(new GraphEdge(a1, b2))
    .addEdge(new GraphEdge(b1, c1))
    .addEdge(new GraphEdge(z1, a2))
    .addEdge(new GraphEdge(z1, c1))
    .addEdge(new GraphEdge(b2, c1));

  const result = [...topo(graph)];

  deepEqual(
    result,
    [c1, b1, b2, a1, a2, z1].map((v) => v.value),
  );
});
