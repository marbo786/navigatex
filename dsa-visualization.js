// ===================================================================
// DSA Visualization - JavaScript Implementation
// ===================================================================

// Global data structures
let users = new Map(); // Hash Map
let trie = { children: {}, isEnd: false }; // Trie
let graph = { nodes: [], edges: [], nodeMap: new Map() }; // Graph
let routes = new Map(); // Linked Lists (Bus Routes)
let queue = []; // Queue
let processedItems = []; // Processed items

let graphNetwork = null; // vis.js network instance
let graphNodes = null; // vis.js DataSet for nodes
let graphEdges = null; // vis.js DataSet for edges
let edgeIdCounter = 0; // For unique edge IDs

// Add these two new lines after: let edgeIdCounter = 0;
let trieZoom = null; // For D3 zoom behavior
let currentScale = 1; // Track current zoom level

// Initialize visualizations
document.addEventListener('DOMContentLoaded', function() {
    // Wait for all libraries to load
    setTimeout(() => {
        initializeGraph();
        initializeTrie();
    }, 500);
});

// ===================================================================
// TOAST NOTIFICATION SYSTEM
// ===================================================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showInfo(message, type = 'info') {
    showToast(message, type);
}

// ===================================================================
// HASH MAP OPERATIONS
// ===================================================================

function addUser() {
    const id = document.getElementById('userId').value.trim();
    const name = document.getElementById('userName').value.trim();
    
    if (!id || !name) {
        showInfo('Please enter both ID and Name', 'error');
        return;
    }
    
    if (users.has(id)) {
        showInfo('User already exists!', 'error');
        return;
    }
    
    users.set(id, name);
    document.getElementById('userId').value = '';
    document.getElementById('userName').value = '';
    visualizeHashMap();
    showInfo(`User "${id}" added successfully!`, 'success');
}

function findUser() {
    const id = document.getElementById('userId').value.trim();
    if (!id) {
        showInfo('Please enter User ID', 'error');
        return;
    }
    
    if (users.has(id)) {
        highlightHashMap(id);
        showInfo(`Found: ID=${id}, Name=${users.get(id)}`, 'success');
    } else {
        showInfo('User not found!', 'error');
    }
}

function removeUser() {
    const id = document.getElementById('userId').value.trim();
    if (!id) {
        showInfo('Please enter User ID', 'error');
        return;
    }
    
    if (users.delete(id)) {
        visualizeHashMap();
        showInfo(`User "${id}" removed successfully!`, 'success');
    } else {
        showInfo('User not found!', 'error');
    }
}

// Removed displayUsers - hash map is always visible

function clearHashMap() {
    if (users.size === 0) {
        showInfo('Hash Map is already empty', 'info');
        return;
    }
    if (confirm('Clear all users?')) {
        users.clear();
        visualizeHashMap();
        showInfo('Hash Map cleared!', 'success');
    }
}

function visualizeHashMap() {
    const container = document.getElementById('hashTable');
    container.innerHTML = '';
    
    if (users.size === 0) {
        container.innerHTML = '<p class="text-muted text-center">Hash Map is empty. Add users to see visualization.</p>';
        return;
    }
    
    users.forEach((name, id) => {
        const bucket = document.createElement('div');
        bucket.className = 'hash-bucket';
        bucket.innerHTML = `<strong style="color: #667eea;">${id}</strong><br><span style="color: #666;">${name}</span>`;
        bucket.dataset.id = id;
        container.appendChild(bucket);
    });
}

function highlightHashMap(id) {
    document.querySelectorAll('.hash-bucket').forEach(bucket => {
        bucket.classList.remove('active');
        if (bucket.dataset.id === id) {
            bucket.classList.add('active');
            setTimeout(() => bucket.classList.remove('active'), 2000);
        }
    });
}

// ===================================================================
// TRIE OPERATIONS
// ===================================================================

function insertTrie() {
    const word = document.getElementById('trieWord').value.trim().toLowerCase();
    if (!word) {
        showInfo('Please enter a word', 'error');
        return;
    }
    
    if (!/^[a-z]+$/.test(word)) {
        showInfo('Please enter only alphabetic characters', 'error');
        return;
    }
    
    let node = trie;
    for (let char of word) {
        if (!node.children[char]) {
            node.children[char] = { children: {}, isEnd: false };
        }
        node = node.children[char];
    }
    node.isEnd = true;
    
    document.getElementById('trieWord').value = '';
    visualizeTrie();
    showInfo(`Word "${word}" inserted!`, 'success');
}

function searchTrie() {
    const prefix = document.getElementById('triePrefix').value.trim().toLowerCase();
    if (!prefix) {
        showInfo('Please enter a prefix', 'error');
        return;
    }
    
    let node = trie;
    for (let char of prefix) {
        if (!node.children[char]) {
            showInfo('No matches found!', 'error');
            return;
        }
        node = node.children[char];
    }
    
    const results = [];
    collectWords(node, prefix, results);
    
    if (results.length === 0) {
        showInfo('No matches found!', 'error');
    } else {
        showInfo(`Found ${results.length} match(es): ${results.join(', ')}`, 'success');
        highlightTriePath(prefix);
    }
}

function collectWords(node, prefix, results) {
    if (node.isEnd) {
        results.push(prefix);
    }
    for (let char in node.children) {
        collectWords(node.children[char], prefix + char, results);
    }
}

function clearTrie() {
    if (Object.keys(trie.children).length === 0) {
        showInfo('Trie is already empty', 'info');
        return;
    }
    if (confirm('Clear all words from Trie?')) {
        trie = { children: {}, isEnd: false };
        visualizeTrie();
        showInfo('Trie cleared!', 'success');
    }
}

function visualizeTrie() {
    if (typeof d3 === 'undefined') {
        console.error('D3.js is not loaded!');
        const emptyMsg = document.getElementById('trieEmpty');
        if (emptyMsg) emptyMsg.textContent = 'D3.js library not loaded. Please refresh the page.';
        return;
    }
    
    const svgElement = document.getElementById('trieSvg');
    const emptyMsg = document.getElementById('trieEmpty');
    
    if (!svgElement) {
        console.error('Trie SVG element not found!');
        return;
    }
    
    const svg = d3.select('#trieSvg');
    svg.selectAll('*').remove();
    
    const hasData = Object.keys(trie.children).length > 0;
    
    if (!hasData) {
        if (emptyMsg) {
            emptyMsg.style.display = 'block';
            emptyMsg.textContent = 'Trie is empty. Insert words to see visualization.';
        }
        svgElement.style.display = 'none';
        return;
    }
    
    const container = document.getElementById('trieViz');
    if (!container) {
        console.error('Trie container not found!');
        return;
    }
    
    const treeData = buildTreeData(trie, '');
    
    if (!treeData || !treeData.children || treeData.children.length === 0) {
        if (emptyMsg) {
            emptyMsg.style.display = 'block';
            emptyMsg.textContent = 'Trie is empty. Insert words to see visualization.';
        }
        svgElement.style.display = 'none';
        return;
    }
    
    if (emptyMsg) emptyMsg.style.display = 'none';
    svgElement.style.display = 'block';
    
    const containerWidth = container.clientWidth || 800;
    const containerHeight = container.clientHeight || 600;
    const width = Math.max(containerWidth, 800);
    const height = Math.max(containerHeight, 600);
    
    svg.attr('width', width).attr('height', height);
    
    try {
        console.log('Building trie visualization...');
        console.log('Tree data:', treeData);
        
        const root = d3.hierarchy(treeData);
        console.log('Root hierarchy:', root);
        
        // Use tree layout with size (vertical orientation, better for fitting)
        const treeLayout = d3.tree()
            .size([height - 100, width - 200])
            .separation((a, b) => (a.parent === b.parent ? 1 : 1.2));
        
        treeLayout(root);
        
        const nodes = root.descendants();
        const links = root.links();
        
        console.log('Number of nodes:', nodes.length);
        console.log('Number of links:', links.length);
        
        // Create zoom behavior
        trieZoom = d3.zoom()
            .scaleExtent([0.3, 3])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
                currentScale = event.transform.k;
            });
        
        svg.call(trieZoom);
        
        const g = svg.append('g')
            .attr('transform', `translate(100, 50)`);
        
        // Store zoom group for external access
        svg.node().__zoomGroup = g;
        
        console.log('Offset:', 100, 50);
        
        const getPathString = (node) => {
            const path = [];
            let current = node;
            while (current && current.data.name !== 'ROOT') {
                path.unshift(current.data.name);
                current = current.parent;
            }
            return path.join('');
        };
        
        // Draw links (edges)
        const linkPaths = g.selectAll('.link')
            .data(links)
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('d', d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x))
            .attr('fill', 'none')
            .attr('stroke', '#999')
            .attr('stroke-width', 2);
        
        console.log('Links drawn:', linkPaths.size());
        
        // Draw nodes
        const nodeGroups = g.selectAll('.node')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.y},${d.x})`);
        
        console.log('Node groups created:', nodeGroups.size());
        
        // Add circles for nodes (reduced size from 25 to 20)
        nodeGroups.append('circle')
            .attr('r', 20)
            .attr('fill', d => {
                if (d.data.name === 'ROOT') return '#764ba2';
                const fullPath = getPathString(d);
                const isHighlighted = highlightedPrefix && fullPath.startsWith(highlightedPrefix);
                if (isHighlighted) return '#ffd700';
                return d.data.isEnd ? '#ff6b6b' : '#667eea';
            })
            .attr('stroke', d => {
                const fullPath = getPathString(d);
                const isHighlighted = highlightedPrefix && fullPath.startsWith(highlightedPrefix);
                return isHighlighted ? '#ff6b6b' : '#fff';
            })
            .attr('stroke-width', d => {
                const fullPath = getPathString(d);
                const isHighlighted = highlightedPrefix && fullPath.startsWith(highlightedPrefix);
                return isHighlighted ? 3 : 2;
            });
        
        // Add character labels on nodes (reduced font size)
        nodeGroups.append('text')
            .attr('dy', '.35em')
            .attr('x', 0)
            .style('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .style('fill', '#fff')
            .style('pointer-events', 'none')
            .text(d => {
                if (d.data.name === 'ROOT') return 'R';
                return d.data.name.toUpperCase();
            });
        
        // Add word labels below end nodes (reduced font size)
        nodeGroups.filter(d => d.data.isEnd && d.data.name !== 'ROOT')
            .append('text')
            .attr('dy', '2.2em')
            .attr('x', 0)
            .style('text-anchor', 'middle')
            .style('font-size', '11px')
            .style('fill', '#ff6b6b')
            .style('font-weight', 'bold')
            .style('pointer-events', 'none')
            .text(d => getPathString(d));
        
        console.log('Trie visualization complete!');
            
    } catch(error) {
        console.error('Error visualizing trie:', error);
        console.error('Error details:', error.stack);
        if (emptyMsg) {
            emptyMsg.style.display = 'block';
            emptyMsg.textContent = 'Error rendering trie: ' + error.message;
        }
        svgElement.style.display = 'none';
    }
}

function buildTreeData(node, prefix) {
    // Always create root node
    const data = { name: prefix || 'ROOT', isEnd: node.isEnd, children: [] };
    
    for (let char in node.children) {
        const child = buildTreeData(node.children[char], char);
        data.children.push(child);
    }
    
    return data;
}

let highlightedPrefix = '';

function highlightTriePath(prefix) {
    highlightedPrefix = prefix.toLowerCase();
    visualizeTrie();
    
    // Highlight the path after a short delay to ensure visualization is complete
    setTimeout(() => {
        const svg = d3.select('#trieSvg');
        if (svg.empty()) return;
        
        // Find and highlight nodes in the path
        svg.selectAll('.node').each(function(d) {
            const node = d3.select(this);
            const circle = node.select('circle');
            
            // Reconstruct path from root to this node
            const path = [];
            let current = d;
            while (current && current.data.name !== 'ROOT') {
                path.unshift(current.data.name);
                current = current.parent;
            }
            const fullPath = path.join('');
            
            // Highlight if this node is part of the search path
            if (fullPath.startsWith(highlightedPrefix)) {
                circle.attr('fill', '#ffd700') // Gold color for highlighted path
                      .attr('stroke', '#ff6b6b')
                      .attr('stroke-width', 4);
            }
        });
        
        // Reset highlight after 3 seconds
        setTimeout(() => {
            highlightedPrefix = '';
            visualizeTrie();
        }, 3000);
    }, 100);
}

function initializeTrie() {
    visualizeTrie();
}

// ===================================================================
// GRAPH + DIJKSTRA'S ALGORITHM
// ===================================================================

function addGraphLocation() {
    const loc = document.getElementById('graphLoc').value.trim();
    if (!loc) {
        showInfo('Please enter location name', 'error');
        return;
    }
    
    // Check case-insensitive
    let exists = false;
    for (let node of graph.nodes) {
        if (node.label.toLowerCase() === loc.toLowerCase()) {
            exists = true;
            break;
        }
    }
    
    if (exists) {
        showInfo('Location already exists!', 'error');
        return;
    }
    
    const id = graph.nodes.length;
    graph.nodeMap.set(loc, id);
    graph.nodes.push({ id: id, label: loc });
    
    document.getElementById('graphLoc').value = '';
    updateGraph();
    showInfo(`Location "${loc}" added!`, 'success');
}

function addEdge() {
    const from = document.getElementById('edgeFrom').value.trim();
    const to = document.getElementById('edgeTo').value.trim();
    const weight = parseInt(document.getElementById('edgeWeight').value);
    
    if (!from || !to || isNaN(weight) || weight <= 0) {
        showInfo('Please fill all fields with valid values', 'error');
        return;
    }
    
    // Find actual node names (case-insensitive)
    let fromNode = null;
    let toNode = null;
    let fromId = -1;
    let toId = -1;
    
    for (let node of graph.nodes) {
        if (node.label.toLowerCase() === from.toLowerCase()) {
            fromNode = node.label;
            fromId = node.id;
        }
        if (node.label.toLowerCase() === to.toLowerCase()) {
            toNode = node.label;
            toId = node.id;
        }
    }
    
    if (fromId === -1) {
        showInfo(`Location "${from}" does not exist! Add it first.`, 'error');
        return;
    }
    
    if (toId === -1) {
        showInfo(`Location "${to}" does not exist! Add it first.`, 'error');
        return;
    }
    
    if (fromId === toId) {
        showInfo('Source and destination cannot be the same!', 'error');
        return;
    }
    
    // Check if edge exists
    const exists = graph.edges.some(e => 
        (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId)
    );
    
    if (exists) {
        showInfo('Edge already exists!', 'error');
        return;
    }
    
    graph.edges.push({
        id: edgeIdCounter++,
        from: fromId,
        to: toId,
        label: weight.toString(),
        value: weight
    });
    
    document.getElementById('edgeFrom').value = '';
    document.getElementById('edgeTo').value = '';
    document.getElementById('edgeWeight').value = '';
    updateGraph();
    showInfo(`Edge added: ${fromNode} → ${toNode} (${weight})`, 'success');
}

function findShortestPath() {
    const from = document.getElementById('dijkstraFrom').value.trim();
    const to = document.getElementById('dijkstraTo').value.trim();
    
    if (!from || !to) {
        showInfo('Please enter both source and destination', 'error');
        return;
    }
    
    // Find actual node names (case-insensitive)
    let fromNode = null;
    let toNode = null;
    
    for (let node of graph.nodes) {
        if (node.label.toLowerCase() === from.toLowerCase()) {
            fromNode = node.label;
        }
        if (node.label.toLowerCase() === to.toLowerCase()) {
            toNode = node.label;
        }
    }
    
    if (!fromNode) {
        showInfo(`Source "${from}" does not exist!`, 'error');
        return;
    }
    
    if (!toNode) {
        showInfo(`Destination "${to}" does not exist!`, 'error');
        return;
    }
    
    if (fromNode === toNode) {
        showInfo('Source and destination cannot be the same!', 'error');
        return;
    }
    
    if (graph.edges.length === 0) {
        showInfo('No edges in graph! Add edges first.', 'error');
        return;
    }
    
    const result = dijkstra(fromNode, toNode);
    if (result.path.length > 0) {
        showInfo(`Shortest Path: ${result.path.join(' → ')} | Distance: ${result.distance}`, 'success');
        highlightPath(result.path);
    } else {
        showInfo('No path found between these locations!', 'error');
    }
}

function dijkstra(source, dest) {
    const INF = Number.MAX_SAFE_INTEGER;
    const sourceId = graph.nodeMap.get(source);
    const destId = graph.nodeMap.get(dest);
    
    const dist = new Array(graph.nodes.length).fill(INF);
    const parent = new Array(graph.nodes.length).fill(-1);
    const visited = new Array(graph.nodes.length).fill(false);
    
    // Priority queue (min-heap simulation)
    const pq = [{ dist: 0, id: sourceId }];
    dist[sourceId] = 0;
    
    while (pq.length > 0) {
        pq.sort((a, b) => a.dist - b.dist);
        const { id: u } = pq.shift();
        
        if (visited[u]) continue;
        visited[u] = true;
        
        // Relax edges
        graph.edges.forEach(edge => {
            let v = -1;
            if (edge.from === u) v = edge.to;
            else if (edge.to === u) v = edge.from;
            
            if (v !== -1 && dist[u] + edge.value < dist[v]) {
                dist[v] = dist[u] + edge.value;
                parent[v] = u;
                pq.push({ dist: dist[v], id: v });
            }
        });
    }
    
    // Reconstruct path
    const path = [];
    let cur = destId;
    while (cur !== -1) {
        path.unshift(graph.nodes[cur].label);
        cur = parent[cur];
    }
    
    return {
        path: path[0] === source ? path : [],
        distance: dist[destId] === INF ? -1 : dist[destId]
    };
}

function highlightPath(path) {
    if (!graphNetwork || !graphNodes || !graphEdges || path.length === 0) return;
    
    const nodeIds = path.map(loc => graph.nodeMap.get(loc));
    const edgeIds = new Set();
    
    // Find edges in the path
    for (let i = 0; i < nodeIds.length - 1; i++) {
        const from = nodeIds[i];
        const to = nodeIds[i + 1];
        const edge = graph.edges.find(e => 
            (e.from === from && e.to === to) || (e.from === to && e.to === from)
        );
        if (edge) edgeIds.add(edge.id);
    }
    
    // Update nodes with highlights
    graphNodes.forEach(node => {
        const update = {
            id: node.id,
            color: nodeIds.includes(node.id) ? {
                background: '#ff6b6b',
                border: '#ff4757',
                highlight: { background: '#ff6b6b', border: '#ff4757' }
            } : {
                background: '#667eea',
                border: '#764ba2',
                highlight: { background: '#ff6b6b', border: '#ff4757' }
            }
        };
        graphNodes.update(update);
    });
    
    // Update edges with highlights
    graphEdges.forEach(edge => {
        const update = {
            id: edge.id,
            color: edgeIds.has(edge.id) ? { color: '#ff6b6b', highlight: '#ff4757' } : { color: '#999', highlight: '#ff6b6b' },
            width: edgeIds.has(edge.id) ? 5 : 3
        };
        graphEdges.update(update);
    });
    
    // Reset after 5 seconds
    setTimeout(() => {
        updateGraph();
    }, 5000);
}

function clearGraph() {
    if (graph.nodes.length === 0) {
        showInfo('Graph is already empty', 'info');
        return;
    }
    if (confirm('Clear all locations and edges?')) {
        graph.nodes = [];
        graph.edges = [];
        graph.nodeMap.clear();
        edgeIdCounter = 0;
        if (graphNodes) graphNodes.clear();
        if (graphEdges) graphEdges.clear();
        updateGraph();
        showInfo('Graph cleared!', 'success');
    }
}

function initializeGraph() {
    // Wait a bit for DOM to be ready
    setTimeout(() => {
        updateGraph();
    }, 100);
}

function updateGraph() {
    const container = document.getElementById('graphViz');
    
    if (!container) {
        console.error('Graph container not found!');
        return;
    }
    
    if (graph.nodes.length === 0) {
        // Clear everything if empty
        if (graphNetwork) {
            try {
                graphNetwork.destroy();
            } catch(e) {
                console.error('Error destroying network:', e);
            }
            graphNetwork = null;
            graphNodes = null;
            graphEdges = null;
        }
        container.innerHTML = '<p class="text-muted text-center" style="padding: 50px;">Graph is empty. Add locations and edges to see visualization.<br><small>Tip: Add at least 2 locations, then connect them with edges.</small></p>';
        return;
    }
    
    // Prepare node data
    const nodeData = graph.nodes.map(n => ({
        id: n.id,
        label: n.label,
        color: {
            background: '#667eea',
            border: '#764ba2',
            highlight: { background: '#ff6b6b', border: '#ff4757' }
        }
    }));
    
    // Prepare edge data
    const edgeData = graph.edges.map(e => ({
        id: e.id,
        from: e.from,
        to: e.to,
        label: String(e.label),
        value: e.value,
        color: { color: '#999', highlight: '#ff6b6b' },
        width: 3
    }));
    
    const options = {
        nodes: {
            shape: 'dot',
            size: 30,
            font: { 
                size: 16, 
                face: 'Arial', 
                color: '#fff',
                strokeWidth: 3,
                strokeColor: '#333'
            },
            borderWidth: 3,
            color: {
                background: '#667eea',
                border: '#764ba2',
                highlight: { background: '#ff6b6b', border: '#ff4757' }
            }
        },
        edges: {
            width: 3,
            arrows: { to: { enabled: false } },
            font: { 
                size: 14, 
                align: 'middle', 
                strokeWidth: 4, 
                strokeColor: '#fff', 
                color: '#333' 
            },
            color: { color: '#999', highlight: '#ff6b6b' },
            smooth: { type: 'continuous', roundness: 0.5 }
        },
        physics: {
            enabled: true,
            stabilization: { iterations: 200 },
            barnesHut: {
                gravitationalConstant: -2000,
                centralGravity: 0.3,
                springLength: 200,
                springConstant: 0.04
            }
        },
        interaction: {
            dragNodes: true,
            dragView: true,
            zoomView: true
        }
    };
    
    // Create or update DataSets
    if (!graphNodes) {
        graphNodes = new vis.DataSet(nodeData);
    } else {
        // Update existing DataSet
        graphNodes.clear();
        graphNodes.add(nodeData);
    }
    
    if (!graphEdges) {
        graphEdges = new vis.DataSet(edgeData);
    } else {
        // Update existing DataSet
        graphEdges.clear();
        graphEdges.add(edgeData);
    }
    
    const data = { nodes: graphNodes, edges: graphEdges };
    
    // Create or update network
    try {
        if (!graphNetwork) {
            // Clear container only when creating new network
            container.innerHTML = '';
            graphNetwork = new vis.Network(container, data, options);
        } else {
            // Just update data, don't clear container
            graphNetwork.setData(data);
            graphNetwork.setOptions(options);
        }
    } catch(error) {
        console.error('Error creating graph network:', error);
        container.innerHTML = '<p class="text-danger">Error rendering graph. Please refresh the page.</p>';
        graphNetwork = null;
        graphNodes = null;
        graphEdges = null;
    }
}

// ===================================================================
// LINKED LIST OPERATIONS
// ===================================================================

function addRoute() {
    const name = document.getElementById('routeName').value.trim();
    if (!name) {
        showInfo('Please enter route name', 'error');
        return;
    }
    
    if (routes.has(name)) {
        showInfo('Route already exists!', 'error');
        return;
    }
    
    routes.set(name, []);
    updateRouteSelect();
    document.getElementById('routeName').value = '';
    visualizeLinkedList();
    showInfo(`Route "${name}" added!`, 'success');
}

function addStop() {
    const routeName = document.getElementById('routeSelect').value;
    const stop = document.getElementById('stopName').value.trim();
    
    if (!routeName) {
        showInfo('Please select a route first', 'error');
        return;
    }
    
    if (!stop) {
        showInfo('Please enter stop name', 'error');
        return;
    }
    
    const route = routes.get(routeName);
    if (route.includes(stop)) {
        showInfo('Stop already exists in this route!', 'error');
        return;
    }
    
    route.push(stop);
    routes.set(routeName, route);
    visualizeLinkedList();
    document.getElementById('stopName').value = '';
    showInfo(`Stop "${stop}" added to route "${routeName}"!`, 'success');
}

function deleteStop() {
    const routeName = document.getElementById('routeSelect').value;
    const stop = document.getElementById('stopName').value.trim();
    
    if (!routeName) {
        showInfo('Please select a route first', 'error');
        return;
    }
    
    if (!stop) {
        showInfo('Please enter stop name', 'error');
        return;
    }
    
    const route = routes.get(routeName);
    const index = route.indexOf(stop);
    if (index !== -1) {
        route.splice(index, 1);
        routes.set(routeName, route);
        visualizeLinkedList();
        showInfo(`Stop "${stop}" removed!`, 'success');
    } else {
        showInfo('Stop not found in this route!', 'error');
    }
    document.getElementById('stopName').value = '';
}

function reverseRoute() {
    const routeName = document.getElementById('routeSelect').value;
    if (!routeName) {
        showInfo('Please select a route', 'error');
        return;
    }
    
    const route = routes.get(routeName);
    if (route.length === 0) {
        showInfo('Route is empty!', 'error');
        return;
    }
    
    route.reverse();
    routes.set(routeName, route);
    visualizeLinkedList();
    showInfo(`Route "${routeName}" reversed!`, 'success');
}

function clearRoutes() {
    if (routes.size === 0) {
        showInfo('No routes to clear', 'info');
        return;
    }
    if (confirm('Clear all routes?')) {
        routes.clear();
        updateRouteSelect();
        visualizeLinkedList();
        showInfo('All routes cleared!', 'success');
    }
}

function visualizeLinkedList() {
    const container = document.getElementById('linkedListViz');
    container.innerHTML = '';
    
    if (routes.size === 0) {
        container.innerHTML = '<p class="text-muted text-center">No routes found. Create a route to see visualization.</p>';
        return;
    }
    
    routes.forEach((stops, routeName) => {
        const routeDiv = document.createElement('div');
        routeDiv.style.marginBottom = '30px';
        routeDiv.innerHTML = `<h5 style="color: #667eea; margin-bottom: 15px;"><i class="fas fa-route"></i> Route: ${routeName} <span style="font-size: 0.8em; color: #666;">(${stops.length} stops)</span></h5>`;
        
        const listDiv = document.createElement('div');
        listDiv.style.textAlign = 'center';
        listDiv.style.padding = '15px';
        listDiv.style.background = '#f8f9fa';
        listDiv.style.borderRadius = '8px';
        
        if (stops.length === 0) {
            listDiv.innerHTML = '<span class="text-muted">(Empty route - add stops)</span>';
        } else {
            stops.forEach((stop, index) => {
                const node = document.createElement('span');
                node.className = 'linked-list-node';
                node.textContent = stop;
                node.style.animation = `slideIn 0.3s ${index * 0.1}s both`;
                listDiv.appendChild(node);
                
                if (index < stops.length - 1) {
                    const arrow = document.createElement('span');
                    arrow.className = 'linked-list-arrow';
                    arrow.innerHTML = '→';
                    listDiv.appendChild(arrow);
                }
            });
        }
        
        routeDiv.appendChild(listDiv);
        container.appendChild(routeDiv);
    });
}

function updateRouteSelect() {
    const select = document.getElementById('routeSelect');
    select.innerHTML = '<option value="">Select Route First</option>';
    routes.forEach((stops, name) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = `${name} (${stops.length} stops)`;
        select.appendChild(option);
    });
}

// ===================================================================
// QUEUE OPERATIONS
// ===================================================================

function enqueue() {
    const item = document.getElementById('queueItem').value.trim();
    
    if (!item) {
        showInfo('Please enter item name', 'error');
        return;
    }
    
    queue.push(item);
    visualizeQueue();
    document.getElementById('queueItem').value = '';
    showInfo(`Item "${item}" added to queue!`, 'success');
}

function dequeue() {
    if (queue.length === 0) {
        showInfo('Queue is empty!', 'error');
        return;
    }
    
    const item = queue.shift();
    processedItems.push(item);
    visualizeQueue();
    visualizeProcessedItems();
    showInfo(`Processed: "${item}" (removed from queue)`, 'success');
}

function processAll() {
    if (queue.length === 0) {
        showInfo('Queue is empty!', 'error');
        return;
    }
    
    let count = 0;
    while (queue.length > 0) {
        const item = queue.shift();
        processedItems.push(item);
        count++;
    }
    
    visualizeQueue();
    visualizeProcessedItems();
    showInfo(`Processed ${count} item(s)!`, 'success');
}

function clearQueue() {
    if (queue.length === 0 && processedItems.length === 0) {
        showInfo('Queue is already empty', 'info');
        return;
    }
    if (confirm('Clear queue and processed items?')) {
        queue = [];
        processedItems = [];
        visualizeQueue();
        visualizeProcessedItems();
        showInfo('Queue cleared!', 'success');
    }
}

function visualizeQueue() {
    const container = document.getElementById('queueDisplay');
    container.innerHTML = '';
    
    if (queue.length === 0) {
        container.innerHTML = '<p class="text-muted">Queue is empty. Add items to see visualization.</p>';
        return;
    }
    
    queue.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'queue-item';
        itemDiv.textContent = item;
        itemDiv.style.animationDelay = `${index * 0.1}s`;
        if (index === 0) {
            itemDiv.style.border = '3px solid #ff6b6b';
            itemDiv.innerHTML = `<strong>${item}</strong> <small>(Front)</small>`;
        }
        if (index === queue.length - 1) {
            itemDiv.innerHTML = `<strong>${item}</strong> <small>(Rear)</small>`;
        }
        container.appendChild(itemDiv);
    });
}

function visualizeProcessedItems() {
    const container = document.getElementById('processedDisplay');
    container.innerHTML = '';
    
    if (processedItems.length === 0) {
        container.innerHTML = '<p class="text-muted">No processed items yet.</p>';
        return;
    }
    
    processedItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'queue-item';
        itemDiv.style.background = '#28a745';
        itemDiv.textContent = item;
        itemDiv.style.opacity = '0.8';
        container.appendChild(itemDiv);
    });

// Zoom controls for Trie
function zoomIn() {
    if (!trieZoom) return;
    const svg = d3.select('#trieSvg');
    svg.transition().call(trieZoom.scaleBy, 1.3);
}

function zoomOut() {
    if (!trieZoom) return;
    const svg = d3.select('#trieSvg');
    svg.transition().call(trieZoom.scaleBy, 0.7);
}

function resetZoom() {
    if (!trieZoom) return;
    const svg = d3.select('#trieSvg');
    svg.transition().call(trieZoom.transform, d3.zoomIdentity);
}
}
