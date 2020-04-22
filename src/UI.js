import { Graph } from './Graph.js';
import { GraphDrawer } from './GraphDrawer.js';

let ui = $(document).ready(function() {
  // show sample graph onload
  show_sample();

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
  })
});

function init_graph(data) {
  let g = new Graph(data["nodes"], data["edges"], data["directed"]);
  let gd = new GraphDrawer(data["nodes"], data["edges"], g);
  gd.draw_graph();
}

function show_sample() {
  let data = {};
  data["directed"] = false;
  data["nodes"] = [{"id":"1"},{"id":"2"},{"id":"3"}];
  data["edges"] = [{"source": "1", "target": "2"}, {"source": "2", "target": "3"}, {"source": "1", "target": "3"}];
  init_graph(data);
}

export { ui };