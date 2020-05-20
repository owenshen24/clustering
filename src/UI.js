import { Graph } from './Graph.js';
import { GraphDrawer } from './GraphDrawer.js';

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
    })
  });
});

function init_graph(data) {
  let g = new Graph(data["nodes"], data["edges"], data["directed"]);
  let gd = new GraphDrawer(data["nodes"], data["edges"], data["directed"], g);
  gd.draw_graph();
}

let data_3x5 = {"directed": false, "nodes": [{"id": "0,0"}, {"id": "0,1"}, {"id": "0,2"}, {"id": "0,3"}, {"id": "0,4"}, {"id": "1,0"}, {"id": "1,1"}, {"id": "1,2"}, {"id": "1,3"}, {"id": "1,4"}, {"id": "2,0"}, {"id": "2,1"}, {"id": "2,2"}, {"id": "2,3"}, {"id": "2,4"}], "edges": [{"source": "0,0", "target": "1,0"}, {"source": "0,0", "target": "0,1"}, {"source": "0,1", "target": "0,0"}, {"source": "0,1", "target": "1,1"}, {"source": "0,1", "target": "0,2"}, {"source": "0,2", "target": "0,1"}, {"source": "0,2", "target": "1,2"}, {"source": "0,2", "target": "0,3"}, {"source": "0,3", "target": "0,2"}, {"source": "0,3", "target": "1,3"}, {"source": "0,3", "target": "0,4"}, {"source": "0,4", "target": "0,3"}, {"source": "0,4", "target": "1,4"}, {"source": "1,0", "target": "0,0"}, {"source": "1,0", "target": "2,0"}, {"source": "1,0", "target": "1,1"}, {"source": "1,1", "target": "0,1"}, {"source": "1,1", "target": "1,0"}, {"source": "1,1", "target": "2,1"}, {"source": "1,1", "target": "1,2"}, {"source": "1,2", "target": "0,2"}, {"source": "1,2", "target": "1,1"}, {"source": "1,2", "target": "2,2"}, {"source": "1,2", "target": "1,3"}, {"source": "1,3", "target": "0,3"}, {"source": "1,3", "target": "1,2"}, {"source": "1,3", "target": "2,3"}, {"source": "1,3", "target": "1,4"}, {"source": "1,4", "target": "0,4"}, {"source": "1,4", "target": "1,3"}, {"source": "1,4", "target": "2,4"}, {"source": "2,0", "target": "1,0"}, {"source": "2,0", "target": "2,1"}, {"source": "2,1", "target": "1,1"}, {"source": "2,1", "target": "2,0"}, {"source": "2,1", "target": "2,2"}, {"source": "2,2", "target": "1,2"}, {"source": "2,2", "target": "2,1"}, {"source": "2,2", "target": "2,3"}, {"source": "2,3", "target": "1,3"}, {"source": "2,3", "target": "2,2"}, {"source": "2,3", "target": "2,4"}, {"source": "2,4", "target": "1,4"}, {"source": "2,4", "target": "2,3"}]};

export { ui };