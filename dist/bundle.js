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
    
    // Scales distances for so average edge distance is reasonable
    let scaling_factor = 50/(edges.reduce(function(acc, e) {
      let d = (e["distance"] === undefined) ? 30 : parseFloat(e["distance"]);
      return(acc+d);
    }, 0)/edges.length);

    // Populate edge list
    for (let e of edges) {
      let curr_node = this.nodes[e["source"]];
      let w = (e["weight"] === undefined) ? 1 : parseFloat(e["weight"]);
      let d = (e["distance"] === undefined) ? 30 : parseFloat(e["distance"]);
      d = scaling_factor*d;
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

let radius = 8;

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
    let count = 0;

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
      let step_size = 0.00055;
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
            let delta = 0.1;
            for (let j = 0; j < adj_list.length; j++) {
              let neighbor = adj_list[j]["target"];
              let v1 = [curr_node.x, curr_node.y];
              let v2 = [neighbor.x, neighbor.y];
              let diff = euclid_dist(v1, v2) - adj_list[j]["distance"];
              // only update if it's a big difference
              if (adj_list[j]["distance"]/euclid_dist(v1, v2) < (1-delta) || adj_list[j]["distance"]/euclid_dist(v1, v2) > (1+delta)) {
                diff = step_size * diff * adj_list[j]["weight"];
                let grad = [diff*(v1[0]-v2[0]), diff*(v1[1]-v2[1])];
                full_grad = vector_add(full_grad, grad);
              }
            }
            let new_x = curr_node.x - full_grad[0];
            let new_y = curr_node.y - full_grad[1];
            //curr_node.x = Math.max(radius, Math.min(width - radius, new_x));
            //curr_node.y = Math.max(radius, Math.min(height - radius, new_y));
            curr_node.x = new_x;
            curr_node.y = new_y;
          }
        }
      }
    }

    let simulation = d3.forceSimulation(this.nodes)
      .force("links", link_force)
      .force("approx_force", approx_force)
      .force("many_body", many_body)
      .alphaDecay(0.0075);
    
    let transform = d3.zoomIdentity;

    simulation.nodes(this.nodes)
    .on("tick", ticked);

    // drag handler
    d3.select(canvas)
      .call(d3.drag()
          .container(canvas)
          .subject(drag_subject)
          .on("start", drag_started)
          .on("drag", dragged)
          .on("end", drag_ended))
      .call(d3.zoom()
        .scaleExtent([1 / 10, 8])
        .on('zoom', zoomed));

    /* Internally used functions
     */
    function ticked() {
      context.save();
      context.clearRect(0, 0, width, height);
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);
      
      edges.forEach(function(d) {
        context.beginPath();
        draw_edge(d);
        if (count % 12 == 0) {
          let ratio = euclid_dist([d.source.x, d.source.y],[d.target.x, d.target.y])/d.distance;
          if (ratio > 0.5) {
            ratio = ratio-0.5;
          }
          if (ratio > 0.5) {
            ratio = ratio/5 + 0.4;
          }
          context.strokeStyle = d3.interpolateTurbo(ratio);
          d["color"] = context.strokeStyle;
        }
        else {
          context.strokeStyle = d["color"];
        }
        context.lineWidth = '2';
        context.stroke(); 
      });

      context.beginPath();
      context.lineWidth = '1';
      nodes.forEach(draw_node);
      context.fill();
      context.strokeStyle = "#fff";
      context.stroke();

      context.restore();

      count += 1;
    }

    function draw_edge(d) {
      context.moveTo(d.source.x, d.source.y);
      context.lineTo(d.target.x, d.target.y);
    }

    function draw_node(d) {
      context.moveTo(d.x + radius, d.y);
      context.arc(d.x, d.y, radius, 0, 2 * Math.PI);
    }

    function drag_subject() {
      const x = transform.invertX(d3.event.x),
            y = transform.invertY(d3.event.y);
      const node = find_node(nodes, x, y, radius);
      if (node) {
        node.x =  transform.applyX(node.x);
        node.y = transform.applyY(node.y);
      }
      // else: No node selected, drag container
      return node;
    }

    function find_node(nodes, x, y, radius) {
      const rSq = radius * radius;
      let i;
      for (i = nodes.length - 1; i >= 0; --i) {
        const node = nodes[i],
              dx = x - node.x,
              dy = y - node.y,
              distSq = (dx * dx) + (dy * dy);
        if (distSq < rSq) {
          return node;
        }
      }
      // No node selected
      return undefined; 
    }

    function drag_started() {
      if (!d3.event.active) {
        simulation.alphaTarget(0.1).restart();
      }
      d3.event.subject.fx = transform.invertX(d3.event.x);
      d3.event.subject.fy = transform.invertY(d3.event.y);
    }
  
    function dragged() {
      d3.event.subject.fx = transform.invertX(d3.event.x);
      d3.event.subject.fy = transform.invertY(d3.event.y);
    }
  
    function drag_ended() {
      if (!d3.event.active) {
        simulation.alphaTarget(0);
      }
      d3.event.subject.fx = null;
      d3.event.subject.fy = null;
    }

    function zoomed() {
      transform = d3.event.transform;
      ticked();
    }
  }
}

let ui = $(document).ready(function() {
  // show sample graph onload
  init_graph(data_3x5);

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
      alert('The File APIs are not supported in this browser.');
    }
  });
  
  $("#show_3x5").click(function() {
    init_graph(data_3x5);
  });

  $("#show_10x11").click(function() {
    $.getJSON("data_10x11.json", function(data) {
      init_graph(data);
    });
  });
});

function init_graph(data) {
  let g = new Graph(data["nodes"], data["edges"], data["directed"]);
  let gd = new GraphDrawer(data["nodes"], data["edges"], data["directed"], g);
  gd.draw_graph();
}

let data_3x5 = {"directed": false, "nodes": [{"id": "0,0"}, {"id": "0,1"}, {"id": "0,2"}, {"id": "0,3"}, {"id": "0,4"}, {"id": "1,0"}, {"id": "1,1"}, {"id": "1,2"}, {"id": "1,3"}, {"id": "1,4"}, {"id": "2,0"}, {"id": "2,1"}, {"id": "2,2"}, {"id": "2,3"}, {"id": "2,4"}], "edges": [{"source": "0,0", "target": "1,0"}, {"source": "0,0", "target": "0,1"}, {"source": "0,1", "target": "0,0"}, {"source": "0,1", "target": "1,1"}, {"source": "0,1", "target": "0,2"}, {"source": "0,2", "target": "0,1"}, {"source": "0,2", "target": "1,2"}, {"source": "0,2", "target": "0,3"}, {"source": "0,3", "target": "0,2"}, {"source": "0,3", "target": "1,3"}, {"source": "0,3", "target": "0,4"}, {"source": "0,4", "target": "0,3"}, {"source": "0,4", "target": "1,4"}, {"source": "1,0", "target": "0,0"}, {"source": "1,0", "target": "2,0"}, {"source": "1,0", "target": "1,1"}, {"source": "1,1", "target": "0,1"}, {"source": "1,1", "target": "1,0"}, {"source": "1,1", "target": "2,1"}, {"source": "1,1", "target": "1,2"}, {"source": "1,2", "target": "0,2"}, {"source": "1,2", "target": "1,1"}, {"source": "1,2", "target": "2,2"}, {"source": "1,2", "target": "1,3"}, {"source": "1,3", "target": "0,3"}, {"source": "1,3", "target": "1,2"}, {"source": "1,3", "target": "2,3"}, {"source": "1,3", "target": "1,4"}, {"source": "1,4", "target": "0,4"}, {"source": "1,4", "target": "1,3"}, {"source": "1,4", "target": "2,4"}, {"source": "2,0", "target": "1,0"}, {"source": "2,0", "target": "2,1"}, {"source": "2,1", "target": "1,1"}, {"source": "2,1", "target": "2,0"}, {"source": "2,1", "target": "2,2"}, {"source": "2,2", "target": "1,2"}, {"source": "2,2", "target": "2,1"}, {"source": "2,2", "target": "2,3"}, {"source": "2,3", "target": "1,3"}, {"source": "2,3", "target": "2,2"}, {"source": "2,3", "target": "2,4"}, {"source": "2,4", "target": "1,4"}, {"source": "2,4", "target": "2,3"}]};
