fetch("./data.json").then(res => res.json()).then(data => {
  const Graph = ForceGraph()
  (document.getElementById('graph'))
    .graphData(data)
    .nodeId('id')
    // .nodeVal('r')
    .nodeLabel('id')
    .nodeAutoColorBy('group')
    .linkSource('source')
    .linkTarget('target')
    .linkWidth('value')
    .linkDirectionalArrowLength(6)
    .onNodeDragEnd(node => {
      node.fx = node.x;
      node.fy = node.y;
    });
});