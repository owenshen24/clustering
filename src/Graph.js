class Graph {

  /**
   * Constructor for the Graph class
   * Graph is stored as a dictionary, which is an adjacency list
   * @constructor
   * @param {*} nodes  - List of nodes, given by [{"id":"name"},...]
   * @param {*} edges - List of edges, given by [{"source":"id1", "target": "id2", "weight": "num", "length:" "num"}]
   */

  constructor(nodes, edges, directed) {
    this.nodes = {};
    // initialize all nodes to be 0 value with no neighbors
    for (let n of nodes) {
      this.nodes[n["id"]] = {};
      this.nodes[n["id"]]["value"] = 0;
    }
    for (let e of edges) {
      let curr_node = this.nodes[e["source"]];
      // NOTE: Assume integer edge weights for now
      let w = (e["weight"] === undefined) ? 1 : parseInt(e["weight"]);
      let l = (e["length"] === undefined) ? 1 : parseInt(e["length"]);
      // Create empty adjacency list if none exists
      if (curr_node["neighbors"] === undefined) {
        curr_node["neighbors"] = [];
      }
      curr_node["neighbors"].push({
        "target": e["target"],
        "weight": w,
        "length": l
      });
      // if is undirected, also add an edge in the opposite direction
      if (! directed) {
        let adj_node = this.nodes[e["target"]];
        if (adj_node["neighbors"] === undefined) {
          adj_node["neighbors"] = [];
        }
        adj_node["neighbors"].push({
          "target": e["source"],
          "weight": w,
          "length": l
        })
      }
    }
  }


  

}

export { Graph };