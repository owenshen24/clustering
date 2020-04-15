## Classes

<dl>
<dt><a href="#Graph">Graph</a></dt>
<dd></dd>
<dt><a href="#GraphDrawer">GraphDrawer</a></dt>
<dd></dd>
</dl>

<a name="Graph"></a>

## Graph
**Kind**: global class  

* [Graph](#Graph)
    * [new Graph(nodes, edges)](#new_Graph_new)
    * [.set_resistance(id, value)](#Graph+set_resistance)
    * [.calculate_resistance_distance()](#Graph+calculate_resistance_distance)

<a name="new_Graph_new"></a>

### new Graph(nodes, edges)
Constructor for the Graph class


| Param | Type | Description |
| --- | --- | --- |
| nodes | <code>\*</code> | List of nodes, given by [{"id":"name"},...] |
| edges | <code>\*</code> | List of edges, given by [{"source":"id1", "target": "id2", "weight": "num"}] |

<a name="Graph+set_resistance"></a>

### graph.set\_resistance(id, value)
Sets the resistance for a single node

**Kind**: instance method of [<code>Graph</code>](#Graph)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>\*</code> | The id of the node to modify |
| value | <code>\*</code> | The resistance to set it to |

<a name="Graph+calculate_resistance_distance"></a>

### graph.calculate\_resistance\_distance()
Calculates the effective resistance for all nodes, given their current resistances

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="GraphDrawer"></a>

## GraphDrawer
**Kind**: global class  

* [GraphDrawer](#GraphDrawer)
    * [new GraphDrawer(graph)](#new_GraphDrawer_new)
    * [.draw_graph()](#GraphDrawer+draw_graph)
    * [.update_graph()](#GraphDrawer+update_graph)
    * [.bind_node()](#GraphDrawer+bind_node)

<a name="new_GraphDrawer_new"></a>

### new GraphDrawer(graph)
Constructor for the GraphDrawer class


| Param | Type | Description |
| --- | --- | --- |
| graph | <code>\*</code> | The graph that acts as the underlying data model |

<a name="GraphDrawer+draw_graph"></a>

### graphDrawer.draw\_graph()
Draws the graph onto the canvas

**Kind**: instance method of [<code>GraphDrawer</code>](#GraphDrawer)  
<a name="GraphDrawer+update_graph"></a>

### graphDrawer.update\_graph()
Redraws the graph to the canvas, called after the graph updates

**Kind**: instance method of [<code>GraphDrawer</code>](#GraphDrawer)  
<a name="GraphDrawer+bind_node"></a>

### graphDrawer.bind\_node()
Binds a function to a node, to happen on event

**Kind**: instance method of [<code>GraphDrawer</code>](#GraphDrawer)  
