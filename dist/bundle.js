class Graph {

  /**
   * Constructor for the Graph class
   * Graph is stored as a dictionary, which is an adjacency list
   * @constructor
   * @param {*} nodes  - List of nodes, given by [{"id":"name"},...]
   * @param {*} edges - List of edges, given by [{"source":"id1", "target": "id2", "weight": "num", "length:" "num"}]
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
      let d = (e["distance"] === undefined) ? 30 : parseInt(e["distance"]);
      // Create empty adjacency list if none exists
      if (curr_node["neighbors"] === undefined) {
        curr_node["neighbors"] = [];
      }
      let edge1 = {
        "source": e["source"],
        "target": e["target"],
        "weight": w,
        "distance": d
      };
      curr_node["neighbors"].push(edge1);
      // if is undirected, also add an edge in the opposite direction
      if (! directed) {
        let adj_node = this.nodes[e["target"]];
        if (adj_node["neighbors"] === undefined) {
          adj_node["neighbors"] = [];
        }
        let edge2 = {
          "source": e["target"],
          "target": e["source"],
          "weight": w,
          "distance": d
        };
        adj_node["neighbors"].push(edge2);
      }
    }
  }


  

}

let width = 1000;
let height = 600;
let radius = 6;

function l2_norm(v1, v2) {
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    sum += Math.pow((v1[i]-v2[i]),2);
  }
  return(Math.sqrt(sum));
}

function vector_add(v1, v2) {
  return([v1[0]+v2[0], v1[1]+v2[1]])
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
      .append("g");
    
    let tooltip = d3.select("body").append("div")	
      .attr("class", "tooltip")				
      .style("opacity", 0);

    let many_body = d3.forceManyBody()
      .strength(-30)
      .distanceMax(100);

    let link_force = d3.forceLink(this.edges)
      .id(function(d) { return(d.id); })
      .distance(function(e) { 
        return(e["distance"]*e["weight"]);
       })
      .strength(0.01);
  
    let is_centered = false;

    function approx_force() {
      let step_size = 0.0015;
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
            let diff = l2_norm(v1, v2) - adj_list[j]["distance"];
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
      .alphaDecay(0.003);

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
  let gd = new GraphDrawer(data["nodes"], data["edges"], data["directed"], g);
  gd.draw_graph();
}

function show_sample() {
  let data = {"directed": false, "nodes": [{"id": "0,0"}, {"id": "0,1"}, {"id": "0,2"}, {"id": "0,3"}, {"id": "0,4"}, {"id": "1,0"}, {"id": "1,1"}, {"id": "1,2"}, {"id": "1,3"}, {"id": "1,4"}, {"id": "2,0"}, {"id": "2,1"}, {"id": "2,2"}, {"id": "2,3"}, {"id": "2,4"}], "edges": [{"source": "0,0", "target": "1,0"}, {"source": "0,0", "target": "0,1"}, {"source": "0,1", "target": "0,0"}, {"source": "0,1", "target": "1,1"}, {"source": "0,1", "target": "0,2"}, {"source": "0,2", "target": "0,1"}, {"source": "0,2", "target": "1,2"}, {"source": "0,2", "target": "0,3"}, {"source": "0,3", "target": "0,2"}, {"source": "0,3", "target": "1,3"}, {"source": "0,3", "target": "0,4"}, {"source": "0,4", "target": "0,3"}, {"source": "0,4", "target": "1,4"}, {"source": "1,0", "target": "0,0"}, {"source": "1,0", "target": "2,0"}, {"source": "1,0", "target": "1,1"}, {"source": "1,1", "target": "0,1"}, {"source": "1,1", "target": "1,0"}, {"source": "1,1", "target": "2,1"}, {"source": "1,1", "target": "1,2"}, {"source": "1,2", "target": "0,2"}, {"source": "1,2", "target": "1,1"}, {"source": "1,2", "target": "2,2"}, {"source": "1,2", "target": "1,3"}, {"source": "1,3", "target": "0,3"}, {"source": "1,3", "target": "1,2"}, {"source": "1,3", "target": "2,3"}, {"source": "1,3", "target": "1,4"}, {"source": "1,4", "target": "0,4"}, {"source": "1,4", "target": "1,3"}, {"source": "1,4", "target": "2,4"}, {"source": "2,0", "target": "1,0"}, {"source": "2,0", "target": "2,1"}, {"source": "2,1", "target": "1,1"}, {"source": "2,1", "target": "2,0"}, {"source": "2,1", "target": "2,2"}, {"source": "2,2", "target": "1,2"}, {"source": "2,2", "target": "2,1"}, {"source": "2,2", "target": "2,3"}, {"source": "2,3", "target": "1,3"}, {"source": "2,3", "target": "2,2"}, {"source": "2,3", "target": "2,4"}, {"source": "2,4", "target": "1,4"}, {"source": "2,4", "target": "2,3"}]};
  init_graph(data);
}
