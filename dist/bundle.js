let width = 1000;
let height = 600;
let radius = 6;

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
      .append("g");
    
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

    simulation.on("tick", tickActions);

    /* Internally used functions
     */
    function tickActions() {
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
  let gd = new GraphDrawer(data["nodes"], data["edges"]);
  gd.draw_graph();
}

function show_sample() {
  let data = {"directed": false, "nodes": [{"id": "0,0"}, {"id": "0,1"}, {"id": "0,2"}, {"id": "0,3"}, {"id": "0,4"}, {"id": "1,0"}, {"id": "1,1"}, {"id": "1,2"}, {"id": "1,3"}, {"id": "1,4"}, {"id": "2,0"}, {"id": "2,1"}, {"id": "2,2"}, {"id": "2,3"}, {"id": "2,4"}], "edges": [{"source": "0,0", "target": "1,0"}, {"source": "0,0", "target": "0,1"}, {"source": "0,1", "target": "0,0"}, {"source": "0,1", "target": "1,1"}, {"source": "0,1", "target": "0,2"}, {"source": "0,2", "target": "0,1"}, {"source": "0,2", "target": "1,2"}, {"source": "0,2", "target": "0,3"}, {"source": "0,3", "target": "0,2"}, {"source": "0,3", "target": "1,3"}, {"source": "0,3", "target": "0,4"}, {"source": "0,4", "target": "0,3"}, {"source": "0,4", "target": "1,4"}, {"source": "1,0", "target": "0,0"}, {"source": "1,0", "target": "2,0"}, {"source": "1,0", "target": "1,1"}, {"source": "1,1", "target": "0,1"}, {"source": "1,1", "target": "1,0"}, {"source": "1,1", "target": "2,1"}, {"source": "1,1", "target": "1,2"}, {"source": "1,2", "target": "0,2"}, {"source": "1,2", "target": "1,1"}, {"source": "1,2", "target": "2,2"}, {"source": "1,2", "target": "1,3"}, {"source": "1,3", "target": "0,3"}, {"source": "1,3", "target": "1,2"}, {"source": "1,3", "target": "2,3"}, {"source": "1,3", "target": "1,4"}, {"source": "1,4", "target": "0,4"}, {"source": "1,4", "target": "1,3"}, {"source": "1,4", "target": "2,4"}, {"source": "2,0", "target": "1,0"}, {"source": "2,0", "target": "2,1"}, {"source": "2,1", "target": "1,1"}, {"source": "2,1", "target": "2,0"}, {"source": "2,1", "target": "2,2"}, {"source": "2,2", "target": "1,2"}, {"source": "2,2", "target": "2,1"}, {"source": "2,2", "target": "2,3"}, {"source": "2,3", "target": "1,3"}, {"source": "2,3", "target": "2,2"}, {"source": "2,3", "target": "2,4"}, {"source": "2,4", "target": "1,4"}, {"source": "2,4", "target": "2,3"}]};
  init_graph(data);
}
