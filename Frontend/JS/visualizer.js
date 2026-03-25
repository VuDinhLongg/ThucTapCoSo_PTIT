const ROWS = 20;
const COLS = 50;

let startNodePos = { row: 10, col: 10 };
let targetNodePos = { row: 10, col: 36 };
let isAnimating = false;

let isMousePressed = false;
let isDraggingStart = false; 
let isDraggingTarget = false;

function createGrid() {
    if (isAnimating) return;
    const gridContainer = document.getElementById('gridContainer');
    gridContainer.innerHTML = '';

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const node = document.createElement('div');
            node.className = 'node';
            node.id = `node-${row}-${col}`; 

            if (row === startNodePos.row && col === startNodePos.col) {
                node.classList.add('start');
            } else if (row === targetNodePos.row && col === targetNodePos.col) {
                node.classList.add('target');
            }

            gridContainer.appendChild(node);
        }
    }

    gridContainer.addEventListener('mousedown', (e) => {
        if (isAnimating) return;
        const node = e.target;
        if (!node.classList.contains('node')) return;

        if (node.classList.contains('start')) { isDraggingStart = true; return; }
        if (node.classList.contains('target')) { isDraggingTarget = true; return; }
        
        isMousePressed = true;
        toggleWall(node);
    });

    gridContainer.addEventListener('mousemove', (e) => {
        if (isAnimating) return;
        const node = e.target;
        if (!node.classList.contains('node')) return;

        const coords = node.id.split('-');
        const r = parseInt(coords[1]);
        const c = parseInt(coords[2]);

        if (isDraggingStart) {
            if (node.classList.contains('wall') || node.classList.contains('target')) return;
            document.getElementById(`node-${startNodePos.row}-${startNodePos.col}`).classList.remove('start');
            node.classList.add('start');
            startNodePos = { row: r, col: c };
            return;
        }

        if (isDraggingTarget) {
            if (node.classList.contains('wall') || node.classList.contains('start')) return;
            document.getElementById(`node-${targetNodePos.row}-${targetNodePos.col}`).classList.remove('target');
            node.classList.add('target');
            targetNodePos = { row: r, col: c };
            return;
        }

        if (isMousePressed) {
            if (!node.classList.contains('start') && !node.classList.contains('target')) {
                node.classList.add('wall');
            }
        }
    });
}

function toggleWall(nodeElement) {
    if (nodeElement.classList.contains('start') || nodeElement.classList.contains('target')) return;
    nodeElement.classList.toggle('wall');
}

document.addEventListener('mouseup', function() {
    isMousePressed = false;
    isDraggingStart = false;
    isDraggingTarget = false;
});

function resetGrid() {
    createGrid(); 
}

window.onload = function() {
    createGrid();
};

function generateRandomWalls() {
    resetGrid(); 

    const nodes = document.querySelectorAll('.node');
    
    nodes.forEach(node => {
        if (!node.classList.contains('start') && !node.classList.contains('target')) {
            if (Math.random() < 0.3) {
                node.classList.add('wall');
            }
        }
    });
}

function startAlgorithm() {
    if (isAnimating) return;
    const algo = document.getElementById('algo-select').value;
    clearPreviousPaths();
    if (algo === 'bfs') {
        runBFS();
    } else if (algo === 'dfs') {
        runDFS();
    } else if (algo === 'dijkstra') {
        runDijkstra();
    }
}

function clearPreviousPaths() {
    const nodes = document.querySelectorAll('.node');
    nodes.forEach(node => {
        node.classList.remove('visited', 'path'); 
    });
}

function runBFS() {
    let visited = Array(ROWS).fill().map(() => Array(COLS).fill(false));
    let prev = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    
    let queue = [];
    
    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    queue.push(startNodePos);
    visited[startNodePos.row][startNodePos.col] = true;

    let visitedNodesInOrder = []; 
    let targetFound = false;

    while (queue.length > 0) {
        let current = queue.shift(); 
        visitedNodesInOrder.push(current);

        if (current.row === targetNodePos.row && current.col === targetNodePos.col) {
            targetFound = true;
            break;
        }

        for (let i = 0; i < 4; i++) {
            let newRow = current.row + dr[i];
            let newCol = current.col + dc[i];

            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                if (!visited[newRow][newCol]) {
                    let nodeElement = document.getElementById(`node-${newRow}-${newCol}`);
                    
                    if (!nodeElement.classList.contains('wall')) {
                        visited[newRow][newCol] = true;
                        prev[newRow][newCol] = current;
                        
                        queue.push({ row: newRow, col: newCol });
                    }
                }
            }
        }
    }
    const shortestPathNodes = targetFound ? getShortestPath(prev) : [];
    animateAlgorithm(visitedNodesInOrder, shortestPathNodes);
}

function runDFS() {
    let visited = Array(ROWS).fill().map(() => Array(COLS).fill(false));
    let prev = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    
    let stack = [];
    
    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    stack.push(startNodePos);

    let visitedNodesInOrder = []; 
    let targetFound = false;

    while (stack.length > 0) {
        let current = stack.pop(); 

        if (visited[current.row][current.col]) continue;

        visited[current.row][current.col] = true;
        visitedNodesInOrder.push(current);

        if (current.row === targetNodePos.row && current.col === targetNodePos.col) {
            targetFound = true;
            break;
        }

        for (let i = 3; i >= 0; i--) {
            let newRow = current.row + dr[i];
            let newCol = current.col + dc[i];

            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                if (!visited[newRow][newCol]) {
                    let nodeElement = document.getElementById(`node-${newRow}-${newCol}`);
                    
                    if (!nodeElement.classList.contains('wall')) {
                        prev[newRow][newCol] = current;
                        stack.push({ row: newRow, col: newCol });
                    }
                }
            }
        }
    }
    const shortestPathNodes = targetFound ? getShortestPath(prev) : [];
    animateAlgorithm(visitedNodesInOrder, shortestPathNodes);
}

function runDijkstra() {
    let visited = Array(ROWS).fill().map(() => Array(COLS).fill(false));
    let prev = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    
    let distances = Array(ROWS).fill().map(() => Array(COLS).fill(Infinity));

    let pq = [];

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    distances[startNodePos.row][startNodePos.col] = 0;
    pq.push({ row: startNodePos.row, col: startNodePos.col, dist: 0 });

    let visitedNodesInOrder = [];
    let targetFound = false;

    while (pq.length > 0) {
        pq.sort((a, b) => a.dist - b.dist);
        let current = pq.shift(); 

        if (visited[current.row][current.col]) continue;

        visited[current.row][current.col] = true;
        visitedNodesInOrder.push(current);

        if (current.row === targetNodePos.row && current.col === targetNodePos.col) {
            targetFound = true;
            break;
        }

        for (let i = 0; i < 4; i++) {
            let newRow = current.row + dr[i];
            let newCol = current.col + dc[i];

            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                if (!visited[newRow][newCol]) {
                    let nodeElement = document.getElementById(`node-${newRow}-${newCol}`);
                    
                    if (!nodeElement.classList.contains('wall')) {
                        let newDist = distances[current.row][current.col] + 1;

                        if (newDist < distances[newRow][newCol]) {
                            distances[newRow][newCol] = newDist;
                            prev[newRow][newCol] = current;
                            
                            pq.push({ row: newRow, col: newCol, dist: newDist });
                        }
                    }
                }
            }
        }
    }
    const shortestPathNodes = targetFound ? getShortestPath(prev) : [];
    animateAlgorithm(visitedNodesInOrder, shortestPathNodes);
}

function getSpeedDelay() {
    const speed = document.getElementById('speed-select').value;
    if (speed === 'fast') return 10;   
    if (speed === 'slow') return 100;  
    return 30;                         
}

function getShortestPath(prev) {
    let path = [];
    let current = { row: targetNodePos.row, col: targetNodePos.col };
    
    if (prev[current.row][current.col] === null) return [];

    while (current !== null && current !== undefined) {
        path.unshift(current); 
        if (current.row === startNodePos.row && current.col === startNodePos.col) break;
        current = prev[current.row][current.col];
    }
    return path;
}

function animateAlgorithm(visitedNodesInOrder, shortestPathNodes) {
    isAnimating = true; 
    const delay = getSpeedDelay();

    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
        if (i === visitedNodesInOrder.length) {
            setTimeout(() => {
                animateShortestPath(shortestPathNodes);
            }, delay * i);
            return;
        }
        
        setTimeout(() => {
            const node = visitedNodesInOrder[i];
            if (!(node.row === startNodePos.row && node.col === startNodePos.col) && 
                !(node.row === targetNodePos.row && node.col === targetNodePos.col)) {
                
                document.getElementById(`node-${node.row}-${node.col}`).classList.add('visited');
            }
        }, delay * i);
    }
}

function animateShortestPath(shortestPathNodes) {
    if (shortestPathNodes.length === 0) {
        isAnimating = false; 
        return;
    }

    for (let i = 0; i < shortestPathNodes.length; i++) {
        setTimeout(() => {
            const node = shortestPathNodes[i];
            if (!(node.row === startNodePos.row && node.col === startNodePos.col) && 
                !(node.row === targetNodePos.row && node.col === targetNodePos.col)) {
                
                document.getElementById(`node-${node.row}-${node.col}`).classList.add('path');
            }

            if (i === shortestPathNodes.length - 1) {
                isAnimating = false;
            }
        }, 40 * i); 
    }
}