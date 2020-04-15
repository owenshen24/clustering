import { Graph } from './Graph.js';
import { GraphDrawer } from './GraphDrawer.js';

let nodes = [{"id": "0"}, {"id": "1"}, {"id": "2"}, {"id": "3"}]
// hack for now
let edges = [{"source": "0", "target": "1"}, {"source": "1", "target": "2"}, {"source": "2", "target": "3"},
             {"source": "1", "target": "0"}, {"source": "2", "target": "1"}, {"source": "3", "target": "2"}];
let g = new Graph(nodes, edges);
let drawer = new GraphDrawer(g);
drawer.draw_graph();