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
    this.simulation = undefined;
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
      .append("g")

    let simulation = d3.forceSimulation(this.nodes)
      .force("charge_force", d3.forceManyBody())
      // center nodes
      .force("center_force", d3.forceCenter(width / 2, height / 2));
    this.simulation = simulation;
    
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

    simulation.on("tick", tickActions)

    // Set color based on initial value
    this.update_all_colors()

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
    this.simulation.alpha(0).restart();
  }
}

export { GraphDrawer };