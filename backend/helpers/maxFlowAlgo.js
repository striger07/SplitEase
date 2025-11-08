import { bfs } from "./bfs.js";

export const maxFlowAlgo = (graph, s, t, paths, amtPending) => {
  let maxFlow = 0;
  const parent = Array(graph.length).fill(-1);
  const rGraph = graph.map((row) => row.slice()); // Clone the graph to create a residual graph

  while (bfs(rGraph, s, t, parent)) {
    let pathFlow = Number.MAX_SAFE_INTEGER;

    // Find the maximum flow in the path found by BFS
    for (let v = t; v !== s; v = parent[v]) {
      const u = parent[v];
      pathFlow = Math.min(pathFlow, rGraph[u][v]);
    }

    // Update residual graph capacities along the path
    for (let v = t; v !== s; v = parent[v]) {
      const u = parent[v];
      rGraph[u][v] -= pathFlow;
      rGraph[v][u] += pathFlow;
    }

    // Store the path and flow
    const tempPath = [];
    for (let v = t; v !== s; v = parent[v]) {
      tempPath.push(v);
    }
    tempPath.push(s);
    tempPath.reverse(); // To show the path from source to sink

    paths.push(tempPath);
    amtPending.push(pathFlow);

    maxFlow += pathFlow;
  }

  return maxFlow;
};
