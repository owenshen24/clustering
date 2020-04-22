class Graph {

  /**
   * Constructor for the Graph class
   * Graph is stored as a dictionary, which is an adjacency list
   * @constructor
   * @param {*} nodes  - List of nodes, given by [{"id":"name"},...]
   * @param {*} edges - List of edges, given by [{"source":"id1", "target": "id2", "weight": "num"}]
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
      // Create empty adjacency list if none exists
      if (curr_node["neighbors"] === undefined) {
        curr_node["neighbors"] = [];
      }
      curr_node["neighbors"].push({
        "target": e["target"],
        "weight": w
      });
      // if is undirected, also add an edge in the opposite direction
      if (! directed) {
        let adj_node = this.nodes[e["target"]];
        if (adj_node["neighbors"] === undefined) {
          adj_node["neighbors"] = [];
        }
        adj_node["neighbors"].push({
          "target": e["source"],
          "weight": w
        })
      }
    }
  }

  /**
   * Sets the resistance for a single node
   * @param {*} id - The id of the node to modify
   * @param {*} value - The resistance to set it to
   */
  set_value(id, value) {
    this.nodes[id]["value"] = value;
    this.nodes[id]["terminal"] = true;
  }

  /**
   * Calculates the effective resistance for all nodes, given their current resistances (excluding nodes set by set_value)
   */
  calc_resistance(iters) {
    for (let i = 0; i < iters; i++) {
      // Create new values, which are the average of each node's neighbor's values
      let new_values = {};
      for (let n in this.nodes) {
        let curr_node = this.nodes[n];
        if (curr_node["terminal"] !== true) {
          let running_total = 0;
          for (let e of curr_node["neighbors"]) {
            running_total += this.nodes[e["target"]]["value"];
          }
          running_total = running_total/curr_node["neighbors"].length;
          new_values[n] = running_total;
        }
      }
      // Copy new values over
      for (let n in this.nodes) {
        let curr_node = this.nodes[n];
        if (curr_node["terminal"] !== true) {
          curr_node["value"] = new_values[n];
        }
      }
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
   * Resets the values of all of the nodes and removes the terminal flag
   * @param {*} value - The value to reset every node's value to
   */
  reset_values(value=0) {
    for (let n in this.nodes) {
      this.nodes[n]["value"] = value;
      this.nodes[n]["terminal"] = false;
    }
  }


  

}

export { Graph };