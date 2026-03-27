const container = document.getElementById('graph-container');
let svg = document.getElementById('edges-svg');

let nodes = {}, edges = [], adjList = {};
let nodeIdCounter = 0, startNodeId = null, targetNodeId = null;
let isAnimating = false;

// 1. Thêm lại biến theo dõi đỉnh đang bị kéo
let draggingNodeId = null; 

function clearGraph() {
    if (isAnimating) return;
    container.innerHTML = '<svg id="edges-svg" class="edges-svg"></svg>';
    svg = document.getElementById('edges-svg');
    nodes = {}; edges = []; adjList = {}; 
    nodeIdCounter = 0; startNodeId = null; targetNodeId = null;
    draggingNodeId = null; // Reset khi xóa bảng
}

window.onload = clearGraph;

function addNode(x, y, type = 'normal', customLabel = null) {
    const id = nodeIdCounter++;
    const el = document.createElement('div');
    el.className = `vertex ${type}`;
    el.id = `vertex-${id}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.textContent = customLabel !== null ? customLabel : id; 

    if (type === 'start') startNodeId = id;
    if (type === 'target') targetNodeId = id;

    nodes[id] = { id, x, y, type, el };
    adjList[id] = [];
    container.appendChild(el);

    // 2. Lắng nghe sự kiện nhấn chuột vào Đỉnh để chuẩn bị kéo
    el.addEventListener('mousedown', (e) => {
        if (isAnimating || e.button !== 0) return; // Không cho kéo khi đang chạy thuật toán
        e.stopPropagation();
        draggingNodeId = id;
    });

    return id;
}

function addEdge(u, v) {
    if (adjList[u].includes(v)) return;
    adjList[u].push(v); adjList[v].push(u); 

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.classList.add('edge-line');
    line.id = `edge-${u}-${v}`;
    svg.appendChild(line);

    edges.push({ u, v, el: line });
    updateEdges();
}

function updateEdges() {
    edges.forEach(edge => {
        edge.el.setAttribute('x1', nodes[edge.u].x);
        edge.el.setAttribute('y1', nodes[edge.u].y);
        edge.el.setAttribute('x2', nodes[edge.v].x);
        edge.el.setAttribute('y2', nodes[edge.v].y);
    });
}

// 3. Lắng nghe sự kiện di chuyển chuột trên toàn bộ Bảng vẽ
container.addEventListener('mousemove', (e) => {
    if (isAnimating || draggingNodeId === null) return;
    
    // Tính toán tọa độ mới của chuột so với khung bảng
    const rect = container.getBoundingClientRect();
    let x = e.clientX - rect.left; 
    let y = e.clientY - rect.top;
    
    // Cập nhật vị trí Đỉnh
    nodes[draggingNodeId].x = x; 
    nodes[draggingNodeId].y = y;
    nodes[draggingNodeId].el.style.left = `${x}px`; 
    nodes[draggingNodeId].el.style.top = `${y}px`;
    
    // Kéo giãn các Cạnh đi theo
    updateEdges();
});

// 4. Lắng nghe sự kiện nhả chuột (ở bất kỳ đâu) để dừng kéo
window.addEventListener('mouseup', () => { 
    draggingNodeId = null; 
});


// --- CÁC HÀM THUẬT TOÁN ĐỒ THỊ ---

function getSpeedDelay() {
    const speed = document.getElementById('speed-select').value;
    if (speed === 'fast') return 100;   
    if (speed === 'slow') return 800;  
    return 400;                         
}

function clearPaths() {
    if (isAnimating) return;
    Object.values(nodes).forEach(n => n.el.classList.remove('visited', 'path'));
    edges.forEach(e => {
        e.el.classList.remove('path');
        e.el.style.stroke = '#7f8c8d';
    });
}

function startAlgorithm() {
    if (isAnimating || startNodeId === null || targetNodeId === null) return;
    const algo = document.getElementById('algo-select').value;
    clearPaths();
    if (algo === 'bfs') runBFS();
    else if (algo === 'dfs') runDFS();
    else if (algo === 'dijkstra') runDijkstra();
}

function runBFS() {
    let visited = {}, prev = {};
    Object.keys(nodes).forEach(id => { visited[id] = false; prev[id] = null; });
    
    let queue = [startNodeId];
    visited[startNodeId] = true;
    let visitedOrder = [], targetFound = false;

    while (queue.length > 0) {
        let curr = queue.shift();
        visitedOrder.push(curr);

        if (curr === targetNodeId) { targetFound = true; break; }

        adjList[curr].forEach(neighbor => {
            if (!visited[neighbor]) {
                visited[neighbor] = true; prev[neighbor] = curr;
                queue.push(neighbor);
            }
        });
    }
    animateAlgorithm(visitedOrder, targetFound ? getShortestPath(prev, targetNodeId) : [], prev);
}

function runDFS() {
    let visited = {}, prev = {};
    Object.keys(nodes).forEach(id => { visited[id] = false; prev[id] = null; });
    
    let stack = [startNodeId];
    let visitedOrder = [], targetFound = false;

    while (stack.length > 0) {
        let curr = stack.pop();
        if (visited[curr]) continue;

        visited[curr] = true;
        visitedOrder.push(curr);

        if (curr === targetNodeId) { targetFound = true; break; }

        adjList[curr].forEach(neighbor => {
            if (!visited[neighbor]) {
                prev[neighbor] = curr;
                stack.push(neighbor);
            }
        });
    }
    animateAlgorithm(visitedOrder, targetFound ? getShortestPath(prev, targetNodeId) : [], prev);
}

function runDijkstra() {
    let visited = {}, prev = {}, dist = {};
    Object.keys(nodes).forEach(id => { visited[id] = false; prev[id] = null; dist[id] = Infinity; });
    
    dist[startNodeId] = 0;
    let pq = [{ id: startNodeId, dist: 0 }];
    let visitedOrder = [], targetFound = false;

    while(pq.length > 0) {
        pq.sort((a, b) => a.dist - b.dist);
        let curr = pq.shift().id;

        if (visited[curr]) continue;
        visited[curr] = true;
        visitedOrder.push(curr);

        if (curr === targetNodeId) { targetFound = true; break; }

        adjList[curr].forEach(neighbor => {
            if (!visited[neighbor]) {
                let d = Math.hypot(nodes[curr].x - nodes[neighbor].x, nodes[curr].y - nodes[neighbor].y);
                let newDist = dist[curr] + d;
                
                if (newDist < dist[neighbor]) {
                    dist[neighbor] = newDist; prev[neighbor] = curr;
                    pq.push({ id: neighbor, dist: newDist });
                }
            }
        });
    }
    animateAlgorithm(visitedOrder, targetFound ? getShortestPath(prev, targetNodeId) : [], prev);
}

function getShortestPath(prev, target) {
    let path = [], curr = target;
    while(curr !== null) {
        path.unshift(curr);
        curr = prev[curr];
    }
    return path;
}

function animateAlgorithm(visitedOrder, pathNodes, prev) {
    isAnimating = true; 
    const delay = getSpeedDelay();

    for (let i = 0; i <= visitedOrder.length; i++) {
        if (i === visitedOrder.length) {
            setTimeout(() => { animateShortestPath(pathNodes); }, delay * i);
            return;
        }

        setTimeout(() => {
            const curr = visitedOrder[i];
            if (curr !== startNodeId && curr !== targetNodeId) {
                nodes[curr].el.classList.add('visited');
            }
            
            if (prev[curr] !== null) {
                let u = prev[curr], v = curr;
                let edgeEl = document.getElementById(`edge-${u}-${v}`) || document.getElementById(`edge-${v}-${u}`);
                if (edgeEl) edgeEl.style.stroke = '#3498db';
            }
        }, delay * i);
    }
}

function animateShortestPath(pathNodes) {
    if (pathNodes.length === 0) { isAnimating = false; return; }

    for (let i = 0; i < pathNodes.length; i++) {
        setTimeout(() => {
            let curr = pathNodes[i];
            if (curr !== startNodeId && curr !== targetNodeId) {
                nodes[curr].el.classList.add('path');
            }
            
            if (i > 0) {
                let u = pathNodes[i-1], v = curr;
                let edgeEl = document.getElementById(`edge-${u}-${v}`) || document.getElementById(`edge-${v}-${u}`);
                if (edgeEl) {
                    edgeEl.classList.add('path');
                    edgeEl.style.stroke = ''; 
                }
            }

            if (i === pathNodes.length - 1) isAnimating = false;
        }, 100 * i); 
    }
}

// --- HÀM TẠO ĐỒ THỊ BÂY GIỜ ---
function buildGraphFromEdgeList() {
    if (isAnimating) return;
    
    const text = document.getElementById('edge-list-input').value.trim();
    // Lấy giá trị từ 2 ô nhập mới
    const startInput = document.getElementById('start-node-input').value.trim();
    const targetInput = document.getElementById('target-node-input').value.trim();
    
    if (!text) return;

    const lines = text.split('\n');
    let edgesToBuild = [];
    let uniqueNodes = new Set(); 

    lines.forEach(line => {
        const parts = line.trim().split(/\s+/); 
        if (parts.length >= 2) {
            edgesToBuild.push([parts[0], parts[1]]);
            uniqueNodes.add(parts[0]);
            uniqueNodes.add(parts[1]);
        }
    });

    // Ép thêm đỉnh xuất phát/đích vào tập hợp (nếu người dùng nhập đỉnh mồ côi không có cạnh)
    if (startInput) uniqueNodes.add(startInput);
    if (targetInput) uniqueNodes.add(targetInput);

    if (uniqueNodes.size === 0) return;
    clearGraph();

    let w = container.clientWidth || 800, h = container.clientHeight || 550;
    let cx = w / 2, cy = h / 2, r = Math.min(cx, cy) - 60; 
    
    const nodesArray = Array.from(uniqueNodes);
    const angleStep = (2 * Math.PI) / nodesArray.length; 
    let nodeMap = {}; 

    nodesArray.forEach((nodeName, index) => {
        let x = cx + r * Math.cos(index * angleStep);
        let y = cy + r * Math.sin(index * angleStep);
        
        // LUẬT TẠO ĐỈNH MỚI: Kiểm tra chính xác tên đỉnh với ô nhập
        let type = 'normal';
        if (nodeName === startInput) type = 'start';
        else if (nodeName === targetInput) type = 'target';
        
        nodeMap[nodeName] = addNode(x, y, type, nodeName);
    });

    edgesToBuild.forEach(edge => addEdge(nodeMap[edge[0]], nodeMap[edge[1]]));
}