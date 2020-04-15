class Graph {

  /**
   * Constructor for the Graph class
   * @constructor
   * @param {*} nodes  - List of nodes, given by [{"id":"name"},...]
   * @param {*} edges - List of edges, given by [{"source":"id1", "target": "id2", "weight": "num"}]
   */

  constructor(nodes, edges) {
    this.nodes = {};
    for (let n of nodes) {
      this.nodes[n["id"]] = {};
    }
    for (let e of edges) {
      let curr_node = this.nodes[e["source"]];
      // NOTE: Assume integer edge weights for now
      let w = (e["weight"] === undefined) ? 1 : parseInt(e["weight"]);
      // Create empty adjacency list if none exists
      if (curr_node["neighbors"] === undefined) {
        curr_node["neighbors"] = [];
      }
      // NOTE: Assume undirected edges for now
      curr_node["neighbors"].push({
        "target": e["target"],
        "weight": w
      });
    }
    for (let n in this.nodes) {
      this.nodes[n]["value"] = 0;
    }
  }

  /**
   * Sets the resistance for a single node
   * @param {*} id - The id of the node to modify
   * @param {*} value - The resistance to set it to
   */
  set_resistance(id, value) {
    this.nodes[id]["value"] = value;
  }

  /**
   * Calculates the effective resistance for all nodes, given their current resistances
   */
  calculate_resistance_distance() {
    let new_values = {};
    for (let n in this.nodes) {
      let curr_node = this.nodes[n];
      let running_total = 0;
      for (let e of curr_node["neighbors"]) {
        running_total += this.nodes[e["target"]]["value"];
      }
      running_total = running_total/curr_node["neighbors"].length;
      new_values[n] = running_total;
    }
    for (let n in this.nodes) {
      this.nodes[n]["value"] = new_values[n];
    }
  }
  

}

class GraphDrawer {
  
  /**
   * Constructor for the GraphDrawer class
   * @param {*} graph - The graph that acts as the underlying data model
   */
  constructor(graph) {

  }

  /**
   * Draws the graph onto the canvas
   */
  draw_graph() {

  }

  /**
   * Redraws the graph to the canvas, called after the graph updates
   */
  update_graph() {

  }

  /**
   * Binds a function to a node, to happen on event
   */
  bind_node() {

  }
}

let nodes = [{"id": "0"}, {"id": "1"}, {"id": "2"}, {"id": "3"}];
// hack for now
let edges = [{"source": "0", "target": "1"}, {"source": "1", "target": "2"}, {"source": "2", "target": "3"},
             {"source": "1", "target": "0"}, {"source": "2", "target": "1"}, {"source": "3", "target": "2"}];
let g = new Graph(nodes, edges);
let drawer = new GraphDrawer(g);
drawer.draw_graph();
