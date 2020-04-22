class Graph {

  /**
   * Constructor for the Graph class
   * Graph is stored as a dictionary, which is an adjacency list
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

  /**
   * Stores each node's value into a key to free up the value slot
   * @param {*} key - The key to store each node's value in 
   */
  store_values(key) {
    for (let n in this.nodes) {
      this.nodes[n][key] = this.nodes[n]["value"];
    }
  }

  /**
   * Resets the values of all of the nodes
   * @param {*} value - The value to reset every node's value to
   */
  reset_values(value=0) {
    for (let n in this.nodes) {
      this.nodes[n]["value"] = value;
    }
  }


  

}

export { Graph };