import { Graph } from './Graph.js';
import { GraphDrawer } from './GraphDrawer.js';

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
  data["nodes"] = [
    {"id":"1"}, 
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
    {"id":"19"}
  ];
  data["edges"] = [
    {"source":"1", "target":"2"}, 
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
    {"source":"18", "target":"19"}
  ];
  init_graph(data);
}

export { ui };