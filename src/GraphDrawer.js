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
    let nodes = this.nodes;
    let edges = this.edges;

    let canvas = document.querySelector("canvas"),
      context = canvas.getContext("2d"),
      width = canvas.width,
      height = canvas.height;

    let many_body = d3.forceManyBody()
      .strength(-50)
      .distanceMax(150);

    let link_force = d3.forceLink(this.edges)
      .id(function(d) { return(d.id); })
      .distance(function(e) { 
        return(e["distance"]*e["weight"]);
       })
      .strength(0);
  
    let is_centered = false;

    function approx_force() {
      //let step_size = 0.0017;
      let step_size = 0.0005;
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
          
          // Only calculate force if neighbors exist
          // NOTE: this might still bug out for directed graphs, e.g. if A->B but B has no outgoing edges
          if (adj_list) {
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
    }

    let simulation = d3.forceSimulation(this.nodes)
      .force("links", link_force)
      .force("approx_force", approx_force)
      .force("many_body", many_body)
      .alphaDecay(0.0075);
    
    simulation.nodes(this.nodes)
    .on("tick", ticked);

    // drag handler
    d3.select(canvas)
      .call(d3.drag()
          .container(canvas)
          .subject(dragsubject)
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

    /* Internally used functions
     */
    function ticked() {
      // remove previous graph
      context.clearRect(0, 0, width, height);

      context.beginPath();
      edges.forEach(draw_edge);
      context.strokeStyle = "#aaa";
      context.stroke();

      context.beginPath();
      nodes.forEach(draw_node);
      context.fill();
      context.strokeStyle = "#fff";
      context.stroke();
    }

    function draw_edge(d) {
      context.moveTo(d.source.x, d.source.y);
      context.lineTo(d.target.x, d.target.y);
    }

    function draw_node(d) {
      context.moveTo(d.x + radius, d.y);
      context.arc(d.x, d.y, radius, 0, 2 * Math.PI);
    }

    function dragsubject() {
      let x = d3.event.x;
      let y = d3.event.y;
      for (let node of nodes) {
        let dx = x - node.x;
        let dy = y - node.y;
        if (dx * dx + dy * dy < radius * radius) {
          return node;
        }
      }
    }
    
    function dragstarted() {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d3.event.subject.fx = d3.event.subject.x;
      d3.event.subject.fy = d3.event.subject.y;
    }
    
    function dragged() {
      d3.event.subject.fx = d3.event.x;
      d3.event.subject.fy = d3.event.y;
    }
    
    function dragended() {
      if (!d3.event.active) simulation.alphaTarget(0);
      d3.event.subject.fx = null;
      d3.event.subject.fy = null;
    }
  }
}

export { GraphDrawer };