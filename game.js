// Game setup
let scene, camera, renderer;
let playerCar, road, obstacles = [], coins = [];
let score = 0, speed = 60;
let gameRunning = true;
let keys = {};
let touchControls = { left: false, right: false };
let lampPosts = [];
let wheels = [];
let wheelRotation = 0;
let userSpeed = 60; // User-controlled speed
let minSpeed = 30;
let maxSpeed = 150;
let bobTimer = 0;

// Initialize Three.js
function init() {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87ceeb, 10, 50);
    
    // Camera - Better positioning for full car view
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 4, 8);
    camera.rotation.x = -0.3;
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Create road
    createRoad();
    
    // Create player car
    createPlayerCar();
    
    // Keyboard controls
    window.addEventListener('keydown', (e) => keys[e.key] = true);
    window.addEventListener('keyup', (e) => keys[e.key] = false);
    
    // Mobile touch controls
    setupTouchControls();
    
    // Window resize
    window.addEventListener('resize', onWindowResize);
    
    // Restart button
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    
    // Start game loop
    animate();
}

function createRoad() {
    // Road surface
    const roadGeometry = new THREE.PlaneGeometry(4, 100);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0;
    road.receiveShadow = true;
    scene.add(road);
    
    // Road edges (grass)
    const edgeGeometry = new THREE.PlaneGeometry(2, 100);
    const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5016 });
    
    const leftEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    leftEdge.rotation.x = -Math.PI / 2;
    leftEdge.position.set(-3, 0, 0);
    scene.add(leftEdge);
    
    const rightEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    rightEdge.rotation.x = -Math.PI / 2;
    rightEdge.position.set(3, 0, 0);
    scene.add(rightEdge);
    
    // Road lines
    for (let i = 0; i < 20; i++) {
        const lineGeometry = new THREE.BoxGeometry(0.1, 0.01, 1);
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(0, 0.01, -i * 5);
        scene.add(line);
    }
    
    // Add lamp posts on both sides
    for (let i = 0; i < 15; i++) {
        // Left side
        const leftLamp = createLampPost(-i * 8);
        leftLamp.position.set(-2.5, 0, -i * 8);
        scene.add(leftLamp);
        lampPosts.push(leftLamp);
        
        // Right side
        const rightLamp = createLampPost(-i * 8);
        rightLamp.position.set(2.5, 0, -i * 8);
        scene.add(rightLamp);
        lampPosts.push(rightLamp);
    }
}

function createPlayerCar() {
    playerCar = new THREE.Group();
    wheels = []; // Reset wheels array
    
    // Car body
    const bodyGeometry = new THREE.BoxGeometry(0.8, 0.4, 1.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff3333 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.3;
    body.castShadow = true;
    playerCar.add(body);
    
    // Car roof
    const roofGeometry = new THREE.BoxGeometry(0.7, 0.3, 0.8);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xff4444 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, 0.65, -0.1);
    roof.castShadow = true;
    playerCar.add(roof);
    
    // Windows
    const windowGeometry = new THREE.BoxGeometry(0.71, 0.25, 0.6);
    const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x87ceeb, 
        transparent: true, 
        opacity: 0.7 
    });
    const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    frontWindow.position.set(0, 0.65, 0.2);
    playerCar.add(frontWindow);
    
    // Wheels - store them in array for animation
    const wheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const wheelPositions = [
        [-0.4, 0.15, 0.5],
        [0.4, 0.15, 0.5],
        [-0.4, 0.15, -0.5],
        [0.4, 0.15, -0.5]
    ];
    
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        wheel.castShadow = true;
        playerCar.add(wheel);
        wheels.push(wheel); // Store wheel reference
    });
    
    // Make car larger and more visible
    playerCar.scale.set(1.2, 1.2, 1.2);
    playerCar.position.set(0, 0, 3);
    scene.add(playerCar);
}

function createLampPost(z) {
    const lampPost = new THREE.Group();
    
    // Pole
    const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 1.25;
    pole.castShadow = true;
    lampPost.add(pole);
    
    // Lamp head
    const lampGeometry = new THREE.CylinderGeometry(0.15, 0.1, 0.3, 8);
    const lampMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
    lamp.position.y = 2.5;
    lampPost.add(lamp);
    
    // Light bulb (glowing effect)
    const bulbGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const bulbMaterial = new THREE.MeshBasicMaterial({ color: 0xffff88 });
    const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
    bulb.position.y = 2.4;
    lampPost.add(bulb);
    
    // Point light for illumination
    const pointLight = new THREE.PointLight(0xffff88, 0.5, 3);
    pointLight.position.y = 2.4;
    lampPost.add(pointLight);
    
    return lampPost;
}

function updateLampPosts() {
    const moveSpeed = userSpeed / 200;
    
    lampPosts.forEach(lamp => {
        lamp.position.z += moveSpeed;
        
        // Reset lamp post when it goes past the camera
        if (lamp.position.z > 10) {
            lamp.position.z -= 120;
        }
    });
}

function createObstacleCar() {
    const obstacle = new THREE.Group();
    
    const colors = [0xff6666, 0x66ff66, 0x6666ff, 0xffff66, 0xff66ff, 0x66ffff];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Car body
    const bodyGeometry = new THREE.BoxGeometry(0.8, 0.4, 1.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.3;
    body.castShadow = true;
    obstacle.add(body);
    
    // Car roof
    const roofGeometry = new THREE.BoxGeometry(0.7, 0.3, 0.8);
    const roof = new THREE.Mesh(roofGeometry, bodyMaterial);
    roof.position.set(0, 0.65, 0.1);
    roof.castShadow = true;
    obstacle.add(roof);
    
    // Back window
    const windowGeometry = new THREE.BoxGeometry(0.71, 0.25, 0.6);
    const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333, 
        transparent: true, 
        opacity: 0.7 
    });
    const window = new THREE.Mesh(windowGeometry, windowMaterial);
    window.position.set(0, 0.65, -0.2);
    obstacle.add(window);
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const wheelPos = [
        [-0.4, 0.15, 0.5],
        [0.4, 0.15, 0.5],
        [-0.4, 0.15, -0.5],
        [0.4, 0.15, -0.5]
    ];
    
    wheelPos.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        wheel.castShadow = true;
        obstacle.add(wheel);
    });
    
    const lane = Math.random() < 0.5 ? -1.2 : 1.2;
    obstacle.position.set(lane, 0, -20);
    
    scene.add(obstacle);
    obstacles.push(obstacle);
}

function createCoin() {
    const coinGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
    const coinMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.2
    });
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    coin.rotation.x = Math.PI / 2;
    
    const x = (Math.random() - 0.5) * 3;
    coin.position.set(x, 0.5, -20);
    coin.castShadow = true;
    
    scene.add(coin);
    coins.push(coin);
}

function setupTouchControls() {
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    
    // Left button
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.left = true;
    });
    
    leftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControls.left = false;
    });
    
    // Right button
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.right = true;
    });
    
    rightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControls.right = false;
    });
    
    // Up button (accelerate)
    upBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys['ArrowUp'] = true;
    });
    
    upBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys['ArrowUp'] = false;
    });
    
    // Down button (brake)
    downBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys['ArrowDown'] = true;
    });
    
    downBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys['ArrowDown'] = false;
    });
}


function updatePlayer() {
    if (!gameRunning) return;
    
    const moveSpeed = 0.1;
    
    // Left/Right movement
    if ((keys['ArrowLeft'] || touchControls.left) && playerCar.position.x > -1.5) {
        playerCar.position.x -= moveSpeed;
    }
    if ((keys['ArrowRight'] || touchControls.right) && playerCar.position.x < 1.5) {
        playerCar.position.x += moveSpeed;
    }
    
    // Speed control with Up/Down arrows
    if (keys['ArrowUp'] && userSpeed < maxSpeed) {
        userSpeed += 0.5;
        updateSpeedDisplay();
    }
    if (keys['ArrowDown'] && userSpeed > minSpeed) {
        userSpeed -= 0.5;
        updateSpeedDisplay();
    }
    
    // Animate wheels based on speed
    wheelRotation += userSpeed / 500;
    wheels.forEach(wheel => {
        wheel.rotation.x = wheelRotation;
    });
    
    // Add subtle bobbing motion for driving effect
    bobTimer += userSpeed / 1000;
    playerCar.position.y = Math.sin(bobTimer) * 0.02;
    
    // Slight tilt when turning
    if (keys['ArrowLeft'] || touchControls.left) {
        playerCar.rotation.z = Math.min(playerCar.rotation.z + 0.02, 0.1);
    } else if (keys['ArrowRight'] || touchControls.right) {
        playerCar.rotation.z = Math.max(playerCar.rotation.z - 0.02, -0.1);
    } else {
        // Return to center
        if (playerCar.rotation.z > 0) {
            playerCar.rotation.z = Math.max(playerCar.rotation.z - 0.02, 0);
        } else if (playerCar.rotation.z < 0) {
            playerCar.rotation.z = Math.min(playerCar.rotation.z + 0.02, 0);
        }
    }
}

function updateSpeedDisplay() {
    document.getElementById('speed').textContent = Math.round(userSpeed);
}

function updateObstacles() {
    const moveSpeed = userSpeed / 200;
    
    obstacles.forEach((obstacle, index) => {
        obstacle.position.z += moveSpeed;
        
        // Remove if passed player
        if (obstacle.position.z > 5) {
            scene.remove(obstacle);
            obstacles.splice(index, 1);
            score += 10;
            updateScore();
        }
        
        // Collision detection
        if (checkCollision(playerCar, obstacle)) {
            gameOver();
        }
    });
}

function updateCoins() {
    const moveSpeed = userSpeed / 200;
    
    coins.forEach((coin, index) => {
        coin.position.z += moveSpeed;
        coin.rotation.y += 0.05;
        
        // Remove if passed player
        if (coin.position.z > 5) {
            scene.remove(coin);
            coins.splice(index, 1);
        }
        
        // Collision detection
        if (checkCoinCollision(playerCar, coin)) {
            scene.remove(coin);
            coins.splice(index, 1);
            score += 50;
            updateScore();
        }
    });
}

function checkCollision(car1, car2) {
    const distance = Math.sqrt(
        Math.pow(car1.position.x - car2.position.x, 2) +
        Math.pow(car1.position.z - car2.position.z, 2)
    );
    return distance < 1;
}

function checkCoinCollision(car, coin) {
    const distance = Math.sqrt(
        Math.pow(car.position.x - coin.position.x, 2) +
        Math.pow(car.position.z - coin.position.z, 2)
    );
    return distance < 0.8;
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function gameOver() {
    gameRunning = false;
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').style.display = 'block';
}

function restartGame() {
    // Clear obstacles and coins
    obstacles.forEach(obs => scene.remove(obs));
    coins.forEach(coin => scene.remove(coin));
    obstacles = [];
    coins = [];
    
    // Reset game state
    score = 0;
    userSpeed = 60;
    gameRunning = true;
    playerCar.position.set(0, 0, 3);
    playerCar.rotation.z = 0;
    bobTimer = 0;
    
    document.getElementById('game-over').style.display = 'none';
    updateScore();
    updateSpeedDisplay();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Game loop
let lastObstacleTime = 0;
let lastCoinTime = 0;

function animate(time) {
    requestAnimationFrame(animate);
    
    if (gameRunning) {
        updatePlayer();
        updateObstacles();
        updateCoins();
        updateLampPosts();
        
        // Spawn obstacles
        if (time - lastObstacleTime > 2000) {
            createObstacleCar();
            lastObstacleTime = time;
        }
        
        // Spawn coins
        if (time - lastCoinTime > 2500) {
            createCoin();
            lastCoinTime = time;
        }
    }
    
    renderer.render(scene, camera);
}

// Start game
init();
