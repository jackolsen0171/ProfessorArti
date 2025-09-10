# D3.js Force Simulation Documentation

## Core Concepts

### Force Simulation Overview
- **Purpose**: Positions linked nodes using physical simulation
- **Algorithm**: Velocity Verlet numerical integrator 
- **Use cases**: Networks, hierarchies, collision resolution

## Simulation Control

### Basic Setup
```javascript
const simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody())
    .force("link", d3.forceLink(links))
    .force("center", d3.forceCenter());
```

### Simulation Management
```javascript
// Control simulation lifecycle
simulation.restart()    // Restart timer (reheat simulation)
simulation.stop()       // Stop internal timer  
simulation.tick([iterations])  // Manually step simulation

// Configuration
simulation.nodes(nodes)         // Set node array
simulation.alpha(value)         // Set current energy (0-1)
simulation.alphaMin(value)      // Set minimum alpha to stop
simulation.alphaDecay(value)    // Set energy decay rate
simulation.alphaTarget(value)   // Set target alpha
simulation.velocityDecay(value) // Set friction
```

### Event Handling
```javascript
simulation.on('tick', () => {
    // Update node positions during simulation
    node.attr("cx", d => d.x)
        .attr("cy", d => d.y);
    
    link.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
});

simulation.on('end', () => {
    console.log('Simulation completed');
});
```

## Force Types

### Many-Body Force (Charge/Repulsion)
```javascript
const manyBodyForce = d3.forceManyBody()
    .strength(-300)           // Negative = repulsion, Positive = attraction
    .theta(0.9)              // Barnes-Hut approximation accuracy
    .distanceMin(1)          // Minimum distance limit
    .distanceMax(1000);      // Maximum distance limit

simulation.force("charge", manyBodyForce);
```

### Link Force (Connections)
```javascript
const linkForce = d3.forceLink(links)
    .id(d => d.id)           // Node identifier accessor
    .distance(30)            // Desired link distance
    .strength(1)             // Link strength (0-1)
    .iterations(1);          // Number of iterations per tick

simulation.force("link", linkForce);
```

### Center Force (Gravity to Center)
```javascript
const centerForce = d3.forceCenter(width / 2, height / 2)
    .strength(1);            // Centering strength

simulation.force("center", centerForce);
```

### Collision Force (Prevent Overlaps)
```javascript
const collisionForce = d3.forceCollide()
    .radius(d => d.radius + 1)  // Collision radius per node
    .strength(0.7)              // Collision resolution strength
    .iterations(1);             // Iterations per tick

simulation.force("collision", collisionForce);
```

### Positioning Forces

#### X-Positioning Force
```javascript
const xForce = d3.forceX()
    .x(d => d.targetX)       // Target x-coordinate
    .strength(0.1);          // Force strength

simulation.force("x", xForce);
```

#### Y-Positioning Force  
```javascript
const yForce = d3.forceY()
    .y(d => d.targetY)       // Target y-coordinate
    .strength(0.1);          // Force strength

simulation.force("y", yForce);
```

#### Radial Positioning Force
```javascript
const radialForce = d3.forceRadial()
    .radius(d => d.targetRadius)  // Target radius from center
    .x(width / 2)                 // Center x-coordinate
    .y(height / 2)                // Center y-coordinate
    .strength(0.1);               // Force strength

simulation.force("radial", radialForce);
```

## Data Structure Requirements

### Node Objects
```javascript
const nodes = [
    { 
        id: "node1",
        x: 100,      // Optional: initial x position
        y: 100,      // Optional: initial y position
        vx: 0,       // Velocity x (managed by simulation)
        vy: 0,       // Velocity y (managed by simulation)
        fx: null,    // Fixed x position (null = not fixed)
        fy: null,    // Fixed y position (null = not fixed)
        // Custom properties
        radius: 5,
        group: 1
    }
];
```

### Link Objects
```javascript
const links = [
    {
        source: "node1",  // Node ID or node object
        target: "node2",  // Node ID or node object
        value: 1,         // Link strength/weight
        distance: 30      // Optional: specific distance for this link
    }
];
```

## Static Layout Computation

### Manual Simulation Control
```javascript
// Stop automatic ticking
simulation.stop();

// Run simulation manually
for (let i = 0; i < 300; ++i) {
    simulation.tick();
}

// For large graphs, use web worker
if (nodes.length > 1000) {
    // Move simulation to web worker
    const worker = new Worker('force-worker.js');
    worker.postMessage({ nodes, links });
}
```

## Advanced Patterns

### Custom Forces
```javascript
function customForce() {
    let nodes;
    
    function force(alpha) {
        // Apply custom force logic
        for (let i = 0, n = nodes.length; i < n; ++i) {
            const node = nodes[i];
            // Modify node.vx and node.vy
        }
    }
    
    force.initialize = function(_nodes) {
        nodes = _nodes;
    };
    
    return force;
}

simulation.force("custom", customForce());
```

### Dynamic Updates
```javascript
// Add new nodes
const newNodes = [...nodes, { id: "new-node" }];
simulation.nodes(newNodes);

// Add new links  
const newLinks = [...links, { source: "node1", target: "new-node" }];
simulation.force("link").links(newLinks);

// Reheat simulation
simulation.alpha(1).restart();
```

## Performance Optimization

### Barnes-Hut Approximation
```javascript
// Adjust theta for performance vs accuracy tradeoff
d3.forceManyBody()
    .theta(0.9);  // Higher = faster but less accurate
                  // Lower = slower but more accurate
```

### Deterministic Simulation
```javascript
// Set custom random source for reproducible results
simulation.randomSource(() => 0.5);  // Always returns same value

// Or use seedable random
simulation.randomSource(d3.randomLcg(seed));
```

## Integration with React

### React Component Pattern
```javascript
useEffect(() => {
    const simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-300))
        .force("link", d3.forceLink(links).distance(300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);
    
    function ticked() {
        // Update React state or DOM directly
        setNodePositions(nodes.map(d => ({ ...d })));
    }
    
    return () => {
        simulation.stop();
    };
}, [nodes, links]);
```