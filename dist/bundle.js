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
        });
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

let color_scheme = d3.interpolateRdBu;
let width = 640;
let height = 480;
let radius = 10;
// Changes [-1,1] to [0,1]
function squish(x) {
  return((x+1)/2);
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
    // remove previous graph
    d3.select("svg").remove();

    let svg = d3.select("#graph")
      .append("svg")
      .attr("class", "graph-holder")
      .attr("width", width)
      .attr("height", height)
      .append("g");

    let simulation = d3.forceSimulation(this.nodes)
      .force("charge_force", d3.forceManyBody())
      // center nodes
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
      .attr("r", radius)
      .on("mouseover", function(d) {		
        tooltip.transition()		
          .duration(100)		
          .style("opacity", .9);		
        tooltip.html("id: " + d.id + " | value: " + window.graph.nodes[d.id]["value"])	
          .style("left", (d3.event.pageX) + "px")		
          .style("top", (d3.event.pageY - 28) + "px");	
        })					
      .on("mouseout", function(d) {		
        tooltip.transition()		
          .duration(100)		
          .style("opacity", 0);})
      .on("click", function(d) {
        let value = parseInt(prompt("Enter value"));
        window.graph.set_value(d.id, value);
        d3.select(this)
          .attr("fill", d3.scaleSequential(color_scheme)(squish(window.graph.nodes[d.id]["value"])));
      })
      .call(d3.drag()
        .on("start", restart_sim)
        .on("drag", fix_node)
        .on("end", end_sim));

    let link_force = d3.forceLink(this.edges).id(function(d) { return(d.id); });
    simulation.force("links", link_force);
    
    let link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(this.edges)
      .enter().append("line")
        .attr("stroke-width", 1);

    simulation.on("tick", tickActions);

    // Set color based on initial value
    this.update_all_colors();

    /* Internally used functions
     */
    function tickActions() {
      let factor = radius;
      node
          .attr("cx", function(d) { return d.x = Math.max(factor, Math.min(width - factor, d.x)); })
          .attr("cy", function(d) { return d.y = Math.max(factor, Math.min(height - factor, d.y)); });
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
    }
    function restart_sim() {
      if (!d3.event.active) {
        simulation.alphaTarget(0.1).restart();
      }
    }
    function fix_node(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    function end_sim() {
      if (!d3.event.active) {
        simulation.alphaTarget(0);
      }
    }
  }

  update_color(node) {
    d3.select(this).attr("fill", d3.scaleSequential(color_scheme)(squish(window.graph.nodes[node.id]["value"])));
  }

  /**
   * Redraws all nodes' colors to match its value
   */
  update_all_colors() {
    d3.selectAll("circle").each(this.update_color);
  }

  /**
   * Updates the positions of nodes based on the current value
   */
  update_positions(axis) {
    d3.selectAll("circle").each(function(d) {
      if (axis === "x") {
        d.fx = squish(window.graph.nodes[d.id]["value"])*width;
      }
      else
      if (axis === "y") {
        d.fy = squish(window.graph.nodes[d.id]["value"])*height;
      }
    });
  }
}

let ui = $(document).ready(function() {
  // show sample graph onload
  show_sample();

  // Grab uploaded json file
  $("#upload").on("change", function(e) {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      let file = e.target.files[0];
      let reader = new FileReader(file);
      reader.addEventListener("loadend", function() {
        let data = JSON.parse(reader.result);
        init_graph(data);
      });
      reader.readAsText(file);
    } 
    else {
      alert('The File APIs are not fully supported in this browser.');
    }
  });
  
  $("#sample").click(function() {
    show_sample();
  });
});

function init_graph(data) {
  let g = new Graph(data["nodes"], data["edges"], data["directed"]);
  let gd = new GraphDrawer(data["nodes"], data["edges"], g);
  gd.draw_graph();
  $("#runX").click(function() {
    run_cluster(g, gd, "x");
  });
  $("#runY").click(function() {
    run_cluster(g, gd, "y");
  });
}

function run_cluster(graph, graph_drawer, axis) {
  let times = parseInt($("#iter-field").val());
  graph.calc_resistance(times);
  graph_drawer.update_all_colors();
  graph_drawer.update_positions(axis);
  graph.store_values(axis);
  graph.reset_values();
}

function show_sample() {
  let data = {};
  data["directed"] = false;
  data["nodes"] = [{"id":"1"},{"id":"2"},{"id":"3"}];
  data["edges"] = [{"source": "1", "target": "2"}, {"source": "2", "target": "3"}, {"source": "1", "target": "3"}];
  init_graph(data);
}
