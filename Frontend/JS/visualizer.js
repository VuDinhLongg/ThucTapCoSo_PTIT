const container = document.getElementById('graph-container');
let svg = document.getElementById('edges-svg');

let nodes = {}; 
let edges = [];
let adjList = {};
let nodeIdCounter = 0;

let startNodeId = null;
let targetNodeId = null;

let isAnimating = false;
let selectedNodeId = null;
let draggingNodeId = null;

// Khởi tạo đồ thị mẫu lúc mới vào trang
function initGraph() {
    clearGraph();
}

// Xóa trắng bảng vẽ
function clearGraph() {
    if (isAnimating) return;
    container.innerHTML = '<svg id="edges-svg" class="edges-svg"></svg>';
    svg = document.getElementById('edges-svg');
    nodes = {}; edges = []; adjList = {}; 
    nodeIdCounter = 0; startNodeId = null; targetNodeId = null; selectedNodeId = null;
}

// Thêm đỉnh mới
function addNode(x, y, type = 'normal') {
    const id = nodeIdCounter++;
    const el = document.createElement('div');
    el.className = `vertex ${type}`;
    el.id = `vertex-${id}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.textContent = id;

    if (type === 'start') startNodeId = id;
    if (type === 'target') targetNodeId = id;

    nodes[id] = { id, x, y, type, el };
    adjList[id] = [];
    container.appendChild(el);

    // Xử lý sự kiện Chuột trái (Chọn để nối cạnh hoặc Kéo để di chuyển)
    el.addEventListener('mousedown', (e) => {
        if (isAnimating || e.button !== 0) return;
        e.stopPropagation();
        draggingNodeId = id;

        if (selectedNodeId === null) {
            selectedNodeId = id;
            el.style.boxShadow = '0 0 15px #FFD700'; // Phát sáng viền Vàng khi được chọn
        } else if (selectedNodeId !== id) {
            addEdge(selectedNodeId, id);
            nodes[selectedNodeId].el.style.boxShadow = '';
            selectedNodeId = null;
            draggingNodeId = null; 
        } else {
            el.style.boxShadow = '';
            selectedNodeId = null;
        }
    });

    // Xử lý sự kiện Chuột phải (Đổi vai trò Xuất phát/Đích)
    el.addEventListener('contextmenu', (e) => {
        if (isAnimating) return;
        e.preventDefault(); e.stopPropagation();
        
        let currType = nodes[id].type;
        el.classList.remove(currType);
        
        if (currType === 'normal') {
            if (startNodeId !== null) {
                nodes[startNodeId].type = 'normal';
                nodes[startNodeId].el.classList.remove('start');
            }
            nodes[id].type = 'start'; startNodeId = id; el.classList.add('start');
        } else if (currType === 'start') {
            if (targetNodeId !== null) {
                nodes[targetNodeId].type = 'normal';
                nodes[targetNodeId].el.classList.remove('target');
            }
            nodes[id].type = 'target'; targetNodeId = id; startNodeId = null; el.classList.add('target');
        } else {
            nodes[id].type = 'normal'; targetNodeId = null;
        }
    });

    return id;
}

// Thêm Cạnh nối 2 đỉnh
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

// Cập nhật vị trí các cạnh khi Đỉnh bị kéo đi chỗ khác
function updateEdges() {
    edges.forEach(edge => {
        edge.el.setAttribute('x1', nodes[edge.u].x);
        edge.el.setAttribute('y1', nodes[edge.u].y);
        edge.el.setAttribute('x2', nodes[edge.v].x);
        edge.el.setAttribute('y2', nodes[edge.v].y);
    });
}

// --- CÁC SỰ KIỆN TOÀN CỤC TRÊN KHUNG BẢNG ---

container.addEventListener('mousemove', (e) => {
    if (isAnimating || draggingNodeId === null) return;
    const rect = container.getBoundingClientRect();
    let x = e.clientX - rect.left; let y = e.clientY - rect.top;
    nodes[draggingNodeId].x = x; nodes[draggingNodeId].y = y;
    nodes[draggingNodeId].el.style.left = `${x}px`; nodes[draggingNodeId].el.style.top = `${y}px`;
    updateEdges();
});

container.addEventListener('mouseup', () => { draggingNodeId = null; });
container.addEventListener('contextmenu', e => e.preventDefault());

container.addEventListener('dblclick', (e) => {
    if (isAnimating) return;
    if (e.target === container || e.target === svg) {
        const rect = container.getBoundingClientRect();
        addNode(e.clientX - rect.left, e.clientY - rect.top);
    }
});

container.addEventListener('click', (e) => {
    if (isAnimating) return;
    if (e.target === container || e.target === svg) {
        if (selectedNodeId !== null) {
            nodes[selectedNodeId].el.style.boxShadow = '';
            selectedNodeId = null;
        }
    }
});

window.onload = initGraph;

// --- PHẦN LOGIC THUẬT TOÁN ĐỒ THỊ ---

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
    let visited = {}; let prev = {};
    Object.keys(nodes).forEach(id => { visited[id] = false; prev[id] = null; });
    
    let queue = [startNodeId];
    visited[startNodeId] = true;
    let visitedOrder = []; let targetFound = false;

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
    let visited = {}; let prev = {};
    Object.keys(nodes).forEach(id => { visited[id] = false; prev[id] = null; });
    
    let stack = [startNodeId];
    let visitedOrder = []; let targetFound = false;

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
    let visited = {}; let prev = {}; let dist = {};
    Object.keys(nodes).forEach(id => { visited[id] = false; prev[id] = null; dist[id] = Infinity; });
    
    dist[startNodeId] = 0;
    let pq = [{ id: startNodeId, dist: 0 }];
    let visitedOrder = []; let targetFound = false;

    while(pq.length > 0) {
        pq.sort((a, b) => a.dist - b.dist);
        let curr = pq.shift().id;

        if (visited[curr]) continue;
        visited[curr] = true;
        visitedOrder.push(curr);

        if (curr === targetNodeId) { targetFound = true; break; }

        adjList[curr].forEach(neighbor => {
            if (!visited[neighbor]) {
                // Tính khoảng cách vật lý giữa 2 đỉnh
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
    let path = []; let curr = target;
    while(curr !== null) {
        path.unshift(curr);
        curr = prev[curr];
    }
    return path;
}

function animateAlgorithm(visitedOrder, pathNodes, prev) {
    isAnimating = true; const delay = getSpeedDelay();

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
            
            // Đổi màu cạnh đã đi qua
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
            
            // Đổi màu cạnh thuộc đường đi ngắn nhất sang Vàng
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

// --- HÀM TẠO ĐỒ THỊ NGẪU NHIÊN ---
function generateRandomGraph() {
    if (isAnimating) return;
    
    // 1. Dọn sạch bảng cũ
    clearGraph();

    let w = container.clientWidth || 800;
    let h = container.clientHeight || 550;
    const padding = 50; // Giữ khoảng cách an toàn viền để đỉnh không bị tràn ra ngoài

    // 2. Random số lượng đỉnh từ 6 đến 12
    const numNodes = Math.floor(Math.random() * 7) + 6; 
    let createdNodes = [];

    // 3. Sinh tọa độ và tạo đỉnh
    for (let i = 0; i < numNodes; i++) {
        let x = Math.floor(Math.random() * (w - 2 * padding)) + padding;
        let y = Math.floor(Math.random() * (h - 2 * padding)) + padding;
        
        // Đỉnh đầu tiên là Xuất phát, đỉnh thứ hai là Đích, còn lại là Bình thường
        let type = 'normal';
        if (i === 0) type = 'start';
        if (i === 1) type = 'target';

        let id = addNode(x, y, type);
        createdNodes.push(id);
    }

    // 4. Nối các cạnh ngẫu nhiên (Đảm bảo đồ thị luôn liên thông, không có đỉnh mồ côi)
    for (let i = 1; i < numNodes; i++) {
        // Nối đỉnh hiện tại với 1 đỉnh ngẫu nhiên được sinh ra trước đó
        let randomPrev = Math.floor(Math.random() * i);
        addEdge(createdNodes[i], createdNodes[randomPrev]);
    }

    // 5. Ném thêm một vài cạnh ngẫu nhiên nữa cho đồ thị trông chằng chịt, phức tạp hơn
    let extraEdges = Math.floor(numNodes * 1.5);
    for (let i = 0; i < extraEdges; i++) {
        let u = createdNodes[Math.floor(Math.random() * numNodes)];
        let v = createdNodes[Math.floor(Math.random() * numNodes)];
        if (u !== v) {
            addEdge(u, v);
        }
    }
}