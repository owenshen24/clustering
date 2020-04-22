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

export { GraphDrawer };