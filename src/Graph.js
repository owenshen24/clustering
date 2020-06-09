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
    
    // Scales distances for so average edge distance is reasonable
    let scaling_factor = 60/(edges.reduce(function(acc, e) {
      let d = (e["distance"] === undefined) ? 30 : parseFloat(e["distance"]);
      return(acc+d);
      }, 0)/edges.length);

    // Populate edge list
    for (let e of edges) {
      let curr_node = this.nodes[e["source"]];
      let w = (e["weight"] === undefined) ? 1 : parseFloat(e["weight"]);
      let d = (e["distance"] === undefined) ? 30 : parseFloat(e["distance"]);
      d = scaling_factor*d;
      // Create empty adjacency list if none exists
      if (curr_node["neighbors"] === undefined) {
        curr_node["neighbors"] = [];
      }
      let edge1 = {
        "source": e["source"],
        "target": e["target"],
        "weight": w,
        "distance": d
      };
      curr_node["neighbors"].push(edge1);
      // if is undirected, also add an edge in the opposite direction
      if (! directed) {
        let adj_node = this.nodes[e["target"]];
        if (adj_node["neighbors"] === undefined) {
          adj_node["neighbors"] = [];
        }
        let edge2 = {
          "source": e["target"],
          "target": e["source"],
          "weight": w,
          "distance": d
        };
        adj_node["neighbors"].push(edge2)
      }
    }
  }


  

}

export { Graph };