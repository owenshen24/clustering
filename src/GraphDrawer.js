let width = 1000;
let height = 600;
let radius = 6;

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
  constructor(nodes, edges) {
    this.nodes = nodes;
    for (let e of edges) {
      let w = (e["weight"] === undefined) ? 1 : parseInt(e["weight"]);
      let l = (e["length"] === undefined) ? 30 : parseInt(e["length"]);
      e["weight"] = w;
      e["length"] = l;
    }
    this.edges = edges;
  }

  /**
   * Draws the graph onto the canvas
   */
  draw_graph() {
    // remove previous graph
    d3.select("svg").remove();

    let svg = d3.select("#graph-holder")
      .append("svg")
      .attr("class", "graph")
      .attr("width", width)
      .attr("height", height)
      .append("g")
    
    let tooltip = d3.select("body").append("div")	
      .attr("class", "tooltip")				
      .style("opacity", 0);

    let manyBody = d3.forceManyBody()
      .strength(-50)
      .distanceMax(300);

    let link_force = d3.forceLink(this.edges)
      .id(function(d) { return(d.id); })
      .distance(function(e) { 
        return(e["weight"]*e["length"]);
       })
      .iterations(10);

    let simulation = d3.forceSimulation(this.nodes)
      .force("charge_force", manyBody)
      .force("center_force", d3.forceCenter(width / 2, height / 2))
      .force("links", link_force);
    
    let node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(this.nodes)
    .enter()
    .append("circle")
    .attr("r", radius)
    .call(d3.drag()
      .on("start", restart_sim)
      .on("drag", fix_node)
      .on("end", end_sim));
    

    let link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(this.edges)
      .enter().append("line")
        .attr("stroke-width", 1);

    simulation.on("tick", tickActions)

    /* Internally used functions
     */
    function tickActions() {
      let factor = radius;
      node
          .attr("cx", function(d) { return d.x })
          .attr("cy", function(d) { return d.y });
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
}

export { GraphDrawer };