### Docs

`Graph.js` is a class that represents a graph. It has a set of nodes and edges.

`GraphDrawer.js` is a class that actually handles the D3 rendering of the graph.

`UI.js` provides the JQuery bindings for the assorted components on the page (e.g. the buttons) and calls methods in `Graph` and `GraphDrawer`.

`index.js` is the entry point for the rollup bundler. It just imports the other files.