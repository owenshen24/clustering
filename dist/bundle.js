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

class GraphDrawer {
  
  /**
   * Constructor for the GraphDrawer class
   * @param {*} nodes  - List of nodes, given by [{"id":"name"},...]
   * 
   * @param {*} edges - List of edges, given by [{"source":"id1", "target": "id2", "weight": "num"}]
   * 
   * @param {*} graph - A reference to the graph that this class draws
   */
  constructor(nodes, edges, graph) {
    this.nodes = nodes;
    this.edges = edges;
    // make graph globally accessible
    window.graph = graph;
  }

  /**
   * Draws the graph onto the canvas
   */
  draw_graph() {
    let margin = {top: 10, right: 30, bottom: 30, left: 40};
    let width = 640;
    let height = 480;

    let svg = d3.select("#graph")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    let simulation = d3.forceSimulation(this.nodes)
      .force("charge_force", d3.forceManyBody())
      .force("center_force", d3.forceCenter(width / 2, height / 2));
    
    let tooltip = d3.select("body").append("div")	
      .attr("class", "tooltip")				
      .style("opacity", 0);
    
    let node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(this.nodes)
      .enter()
      .append("circle")
      .attr("r", 5)
      .on("click", function() {
      })
      .on("mouseover", function(d) {		
        tooltip.transition()		
          .duration(100)		
          .style("opacity", .9);		
          // TODO: fix this so we can see the resistance
        tooltip.html("id: " + d.id + " | value: " + window.graph.nodes[d.id]["value"])	
          .style("left", (d3.event.pageX) + "px")		
          .style("top", (d3.event.pageY - 28) + "px");	
        })					
    .on("mouseout", function(d) {		
        tooltip.transition()		
            .duration(100)		
            .style("opacity", 0);	
    });

    let link_force = d3.forceLink(this.edges).id(function(d) { return(d.id); });
    simulation.force("links", link_force);
    
    let link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(this.edges)
      .enter().append("line")
        .attr("stroke-width", 1);

    simulation.on("tick", tickActions);

    function tickActions() {
      node
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
    }       
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

let nodes = 
[{"id":"1"}, 
{"id":"2"}, 
{"id":"3"}, 
{"id":"4"}, 
{"id":"5"}, 
{"id":"6"}, 
{"id":"7"}, 
{"id":"8"}, 
{"id":"9"}, 
{"id":"10"}, 
{"id":"11"}, 
{"id":"12"}, 
{"id":"13"}, 
{"id":"14"}, 
{"id":"15"}, 
{"id":"16"}, 
{"id":"17"}, 
{"id":"18"}, 
{"id":"19"}];
// hack for now (undirected edges have duplicates)
let edges = 
[{"source":"1", "target":"2"}, 
{"source":"2", "target":"3"}, 
{"source":"3", "target":"4"}, 
{"source":"4", "target":"5"}, 
{"source":"5", "target":"6"}, 
{"source":"6", "target":"7"}, 
{"source":"7", "target":"8"}, 
{"source":"8", "target":"9"}, 
{"source":"9", "target":"10"}, 
{"source":"10", "target":"11"}, 
{"source":"11", "target":"12"}, 
{"source":"12", "target":"13"}, 
{"source":"13", "target":"14"}, 
{"source":"14", "target":"15"}, 
{"source":"15", "target":"16"}, 
{"source":"16", "target":"17"}, 
{"source":"17", "target":"18"}, 
{"source":"18", "target":"19"}];
let g = new Graph(nodes, edges);
let drawer = new GraphDrawer(nodes, edges, g);
drawer.draw_graph();
