let width = 1000;
let height = 600;
let radius = 7;
let precision = 3;

function euclid_dist(v1, v2) {
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    sum += Math.pow((v1[i]-v2[i]),2);
  }
  return(Math.sqrt(sum));
}

function vector_add(v1, v2) {
  return([v1[0]+v2[0], v1[1]+v2[1]])
}

function round(num, decimal) {
  return(Math.round((num + Number.EPSILON) * Math.pow(10,decimal)) / Math.pow(10,decimal));
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
  constructor(nodes, edges, directed, graph) {
    this.nodes = nodes;
    // make nodes globally accessible
    window["nodes"] = nodes;

    // let node_map = {};
    // for (let n of nodes) {
    //   node_map[n["id"]] = n;
    // }
    // window["node_map"] = node_map;

    let e = [];
    for (let k in graph["nodes"]) {
      e = e.concat(graph["nodes"][k]["neighbors"]);
    }

    this.edges = e;

    // make graph globally accessible
    window["graph"] = graph;
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

    let many_body = d3.forceManyBody()
      .strength(-40)
      .distanceMax(120);

    let link_force = d3.forceLink(this.edges)
      .id(function(d) { return(d.id); })
      .distance(function(e) { 
        return(e["distance"]*e["weight"]);
       })
      .strength(0.01);
  
    let is_centered = false;

    function approx_force() {
      let step_size = 0.0017;
      if (! is_centered) {
        is_centered = true;
        for (let i = 0; i < window["nodes"].length; i++) {
          window["nodes"][i]["x"] = (Math.random()/5 + 0.8)*width/2;
          window["nodes"][i]["y"] = (Math.random()/5 + 0.8)*height/2;
        }
      }
      else {
        for (let i = 0; i < window["nodes"].length; i++) {
          let curr_node = window["nodes"][i];
          let adj_list = window["graph"]["nodes"][curr_node["id"]]["neighbors"];
          let full_grad = [0,0];
          
          for (let j = 0; j < adj_list.length; j++) {
            let neighbor = adj_list[j]["target"];
            let v1 = [curr_node.x, curr_node.y];
            let v2 = [neighbor.x, neighbor.y];
            let diff = euclid_dist(v1, v2) - adj_list[j]["distance"];
            diff = step_size * diff * adj_list[j]["weight"];
            let grad = [diff*(v1[0]-v2[0]), diff*(v1[1]-v2[1])];
            full_grad = vector_add(full_grad, grad);
          }

          let new_x = curr_node.x - full_grad[0];
          let new_y = curr_node.y - full_grad[1];
          curr_node.x = Math.max(radius, Math.min(width - radius, new_x));
          curr_node.y = Math.max(radius, Math.min(height - radius, new_y));
        }
      }
    }

    let simulation = d3.forceSimulation(this.nodes)
      .force("links", link_force)
      .force("approx_force", approx_force)
      .force("many_body", many_body)
      .alphaDecay(0.0075);

    let tooltip = d3.select("body").append("div")	
      .attr("class", "tooltip")				
      .style("visibility", "hidden");

    let node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(this.nodes)
      .enter()
      .append("circle")
      .attr("r", radius)
      .on("mouseover", function(d){
        let x = round(d.x, precision);
        let y = round(d.y, precision);
        tooltip.text(d.id + " : (" + x + ", " + y + ")");
        tooltip.style("visibility", "visible");
      })
      .on("mousemove", function(){return tooltip.style("top",
      (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
      .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
      .call(d3.drag()
        .on("start", restart_sim)
        .on("drag", fix_node)
        .on("end", end_sim));

    let link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(this.edges)
      .enter().append("line")
        .attr("stroke-width", 2)
      .on("mouseover", function(d){
        let v1 = [d.source.x, d.source.y];
        let v2 = [d.target.x, d.target.y];
        let distance = round(euclid_dist(v1, v2), precision);
        tooltip.text("distance: " + distance + " | " + "weight: " + d.weight);
        tooltip.style("visibility", "visible");
      })
      .on("mousemove", function(){return tooltip.style("top",
      (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
      .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

    simulation.on("tick", tickActions)

    /* Internally used functions
     */
    function tickActions() {
      node
      .attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
      .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });
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
        simulation.alphaTarget(0.1);
      }
    }
  }
}

export { GraphDrawer };