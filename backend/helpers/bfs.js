export const bfs = (rGraph, s, t, parent) => {
  const visited = Array(rGraph.length).fill(false);
  const queue = [];

  queue.push(s);
  visited[s] = true;
  parent[s] = -1;

  while (queue.length > 0) {
    const u = queue.shift();

    for (let v = 0; v < rGraph[u].length; v++) {
      if (!visited[v] && rGraph[u][v] > 0) {
        if (v === t) {
          parent[v] = u;
          return true;
        }
        queue.push(v);
        parent[v] = u;
        visited[v] = true;
      }
    }
  }
  return false;
};
