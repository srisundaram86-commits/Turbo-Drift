// Turbo Overdrive 3D - Full WebGL Racing Engine
(() => {
  const canvas = document.getElementById('game-canvas');

  // DOM Elements
  const hud = document.getElementById('hud');
  const scoreDisplay = document.getElementById('score-display');
  const multiplierDisplay = document.getElementById('multiplier-display');
  const multiplierContainer = document.getElementById('multiplier-container');
  const comboBarFill = document.getElementById('combo-bar-fill');
  const speedDisplay = document.getElementById('speed-display');
  const nitroBarFill = document.getElementById('nitro-bar-fill');
  const bannerContainer = document.getElementById('banner-container');
  const startOverlay = document.getElementById('start-overlay');
  const pauseOverlay = document.getElementById('pause-overlay');
  const gameoverOverlay = document.getElementById('gameover-overlay');
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const resumeBtn = document.getElementById('resume-btn');
  const menuBtn = document.getElementById('menu-btn');
  const muteBtn = document.getElementById('mute-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const camBtn = document.getElementById('cam-btn');

  // Racing HUD & Level Elements
  const posDisplay = document.getElementById('pos-display');
  const raceProgressBar = document.getElementById('race-progress-bar');
  const hudLevelLabel = document.getElementById('hud-level-label');
  const raceProgressFill = document.getElementById('race-progress-fill');
  const raceCarDot = document.getElementById('race-car-dot');
  const raceDistDisplay = document.getElementById('race-dist-display');
  const countdownOverlay = document.getElementById('countdown-overlay');
  const countdownText = document.getElementById('countdown-text');

  // Menu Level Elements
  const menuCurrentLevel = document.getElementById('menu-current-level');
  const menuLevelName = document.getElementById('menu-level-name');
  const levelSelectBtn = document.getElementById('level-select-btn');

  // Level Complete Elements
  const levelcompleteOverlay = document.getElementById('levelcomplete-overlay');
  const finishBadge = document.getElementById('finish-badge');
  const levelCompleteTitle = document.getElementById('level-complete-title');
  const levelCompleteSub = document.getElementById('level-complete-sub');
  const finishPos = document.getElementById('finish-pos');
  const finishTime = document.getElementById('finish-time');
  const finishScore = document.getElementById('finish-score');
  const finishOvertakes = document.getElementById('finish-overtakes');
  const championBadge = document.getElementById('champion-badge');
  const nextLevelBtn = document.getElementById('next-level-btn');
  const retryRaceBtn = document.getElementById('retry-race-btn');
  const levelSelectBtn2 = document.getElementById('level-select-btn-2');

  // Level Select Modal Elements
  const levelselectOverlay = document.getElementById('levelselect-overlay');
  const levelsGrid = document.getElementById('levels-grid');
  const closeLevelselectBtn = document.getElementById('close-levelselect-btn');
  const pauseLevelSelectBtn = document.getElementById('pause-level-select-btn');

  // Mini-Map
  const minimapWrapper = document.getElementById('minimap-wrapper');
  const minimapCanvas = document.getElementById('minimap-canvas');
  const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;

  // Stats DOM
  const menuHighScore = document.getElementById('menu-high-score');
  const finalScore = document.getElementById('final-score');
  const finalMaxMult = document.getElementById('final-max-mult');
  const finalNearMisses = document.getElementById('final-near-misses');
  const finalTopSpeed = document.getElementById('final-top-speed');
  const newHighBadge = document.getElementById('new-high-badge');

  // Ensure countdown overlay is hidden on load
  if (countdownOverlay) {
    countdownOverlay.classList.add('hidden');
    countdownOverlay.style.display = 'none';
  }
  if (countdownText) countdownText.textContent = '';

  // Player Car Customization DOM
  const playerCarNameInput = document.getElementById('player-car-name');
  const finishCarName = document.getElementById('finish-car-name');
  let playerCarName = 'TURBO PHANTOM';
  try {
    const savedName = localStorage.getItem('turbo_racer_car_name');
    if (savedName && savedName.trim()) {
      playerCarName = savedName.trim().toUpperCase();
    }
  } catch (e) {}
  if (playerCarNameInput) {
    playerCarNameInput.value = playerCarName;
    playerCarNameInput.addEventListener('input', (e) => {
      const val = e.target.value.trim().toUpperCase() || 'TURBO PHANTOM';
      playerCarName = val;
      try {
        localStorage.setItem('turbo_racer_car_name', playerCarName);
      } catch (err) {}
      if (playerCar3D && playerCar3D.nameplateSprite) {
        updateNameplateSprite(playerCar3D.nameplateSprite, playerCarName, '#00f3ff');
      }
    });
  }

  // Touch controls
  const touchLeft = document.getElementById('touch-left');
  const touchRight = document.getElementById('touch-right');
  const touchBrake = document.getElementById('touch-brake');
  const touchNitro = document.getElementById('touch-nitro');

  // Key states
  const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    KeyA: false,
    KeyD: false,
    KeyW: false,
    KeyS: false,
    Space: false
  };

  // Game States
  const STATE = {
    MENU: 'MENU',
    COUNTDOWN: 'COUNTDOWN',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    LEVEL_COMPLETE: 'LEVEL_COMPLETE',
    GAMEOVER: 'GAMEOVER'
  };
  let currentState = STATE.MENU;

  // High-Speed Racing Scale & Realistic Map Calibration
  const WORLD_SPEED_FACTOR = 1.10;
  const RACE_MAP_SCALE = 60;

  // 25 Racing Level Configurations
  const MAX_LEVELS = 25;
  const LEVEL_CONFIGS = [
    { level: 1,  name: "Neon Highway",       dist: 280,  rivals: 5,  baseSpeed: 26, police: false, sky: 0x060814, fog: 0x00f3ff },
    { level: 2,  name: "Sunset Sprint",      dist: 300,  rivals: 6,  baseSpeed: 27, police: false, sky: 0x1a0815, fog: 0xff6600 },
    { level: 3,  name: "Tokyo Driftway",     dist: 320,  rivals: 6,  baseSpeed: 28, police: false, sky: 0xff0077, fog: 0xff0077 },
    { level: 4,  name: "Vapor Coastline",    dist: 340,  rivals: 7,  baseSpeed: 28, police: false, sky: 0x05141e, fog: 0x00e5ff },
    { level: 5,  name: "Metro Viaduct",      dist: 360,  rivals: 7,  baseSpeed: 29, police: false, sky: 0x120822, fog: 0xd500f9 },
    { level: 6,  name: "Midnight Run",       dist: 380,  rivals: 8,  baseSpeed: 30, police: false, sky: 0x04081c, fog: 0x2979ff },
    { level: 7,  name: "Chrome Boulevard",   dist: 400,  rivals: 8,  baseSpeed: 31, police: false, sky: 0x181204, fog: 0xffd700 },
    { level: 8,  name: "Outrun Expressway",  dist: 420,  rivals: 9,  baseSpeed: 31, police: false, sky: 0x200b08, fog: 0xff4400 },
    { level: 9,  name: "Grid Canyon",        dist: 440,  rivals: 9,  baseSpeed: 32, police: false, sky: 0x18041c, fog: 0xff00bb },
    { level: 10, name: "Police Intercept",   dist: 460,  rivals: 10, baseSpeed: 33, police: true,  sky: 0x180509, fog: 0xff0033 },
    { level: 11, name: "Solar Flare",        dist: 480,  rivals: 10, baseSpeed: 33, police: false, sky: 0x221300, fog: 0xffaa00 },
    { level: 12, name: "Night City Express", dist: 500,  rivals: 11, baseSpeed: 34, police: false, sky: 0x0e0624, fog: 0xaa00ff },
    { level: 13, name: "Starlight Speedway", dist: 520,  rivals: 11, baseSpeed: 35, police: false, sky: 0x03141f, fog: 0x00f3ff },
    { level: 14, name: "Aurora Speedway",    dist: 550,  rivals: 12, baseSpeed: 35, police: false, sky: 0x031c12, fog: 0x00ff88 },
    { level: 15, name: "Synth Circuit",      dist: 580,  rivals: 12, baseSpeed: 36, police: false, sky: 0x20051e, fog: 0xff0088 },
    { level: 16, name: "Turbo Turnpike",     dist: 610,  rivals: 13, baseSpeed: 36, police: false, sky: 0x220c02, fog: 0xff6600 },
    { level: 17, name: "Laser Freeway",      dist: 640,  rivals: 13, baseSpeed: 37, police: false, sky: 0x040e28, fog: 0x0099ff },
    { level: 18, name: "Velocity Ridge",     dist: 670,  rivals: 14, baseSpeed: 38, police: false, sky: 0x1e1602, fog: 0xffcc00 },
    { level: 19, name: "Cyber Stormway",     dist: 700,  rivals: 14, baseSpeed: 38, police: false, sky: 0x150424, fog: 0xdd00ff },
    { level: 20, name: "Special Cop Pursuit",dist: 730,  rivals: 15, baseSpeed: 39, police: true,  sky: 0x240409, fog: 0xff0022 },
    { level: 21, name: "Quantum Sprint",     dist: 760,  rivals: 15, baseSpeed: 40, police: false, sky: 0x031a26, fog: 0x00f3ff },
    { level: 22, name: "Apex Megaway",       dist: 790,  rivals: 15, baseSpeed: 40, police: false, sky: 0x042416, fog: 0x00ff66 },
    { level: 23, name: "Supersonic Strip",   dist: 820,  rivals: 16, baseSpeed: 41, police: false, sky: 0x260d00, fog: 0xff5500 },
    { level: 24, name: "Infinity Expressway",dist: 850,  rivals: 16, baseSpeed: 41, police: false, sky: 0x1b042c, fog: 0xcc00ff },
    { level: 25, name: "Grand Championship Omega", dist: 900, rivals: 18, baseSpeed: 42, police: true, sky: 0x241a02, fog: 0xffd700 }
  ];

  const RIVAL_NAMES = [
    'VIPER', 'BLAZE', 'PHANTOM', 'APEX', 'TITAN', 'SHADOW', 'RAZOR', 'GHOST',
    'FURY', 'CYPHER', 'STORM', 'VORTEX', 'COBRA', 'SPECTRE', 'FLASH', 'BOLT',
    'IGNITE', 'KRAKEN', 'ZENITH', 'NEXUS'
  ];

  const RIVAL_COLORS = [
    { color: 0xff0033, hex: '#ff0033', roof: 0x880011 },
    { color: 0x00e5ff, hex: '#00e5ff', roof: 0x005577 },
    { color: 0xffaa00, hex: '#ffaa00', roof: 0x995500 },
    { color: 0x00e676, hex: '#00e676', roof: 0x006622 },
    { color: 0xd500f9, hex: '#d500f9', roof: 0x550066 },
    { color: 0xffffff, hex: '#ffffff', roof: 0x334455 },
    { color: 0xff6d00, hex: '#ff6d00', roof: 0x772200 },
    { color: 0x2979ff, hex: '#2979ff', roof: 0x0d2277 }
  ];

  // Level & Racing Progress
  let currentLevel = 1;
  let unlockedLevel = 1;
  try {
    currentLevel = parseInt(localStorage.getItem('turbo_racer_current_level') || '1', 10);
    if (isNaN(currentLevel) || currentLevel < 1 || currentLevel > MAX_LEVELS) currentLevel = 1;
    unlockedLevel = parseInt(localStorage.getItem('turbo_racer_unlocked_level') || '1', 10);
    if (isNaN(unlockedLevel) || unlockedLevel < 1) unlockedLevel = 1;
    if (unlockedLevel > MAX_LEVELS) unlockedLevel = MAX_LEVELS;
  } catch (e) {}

  let rivalCars = [];
  let playerRank = 1;
  let prevPlayerRank = 1;
  let totalRacers = 1;
  let overtakeCount = 0;
  let raceTime = 0;
  let targetDistance = 1400;

  const sound = window.soundSystem;

  // High score
  let highScore = 0;
  try {
    highScore = parseInt(localStorage.getItem('turbo_racer_high_score') || '0', 10);
    if (isNaN(highScore)) highScore = 0;
  } catch (e) {}
  menuHighScore.textContent = highScore.toLocaleString();

  let screenShake = 0;
  let score = 0;
  let multiplier = 1.0;
  let maxMultiplierAchieved = 1.0;
  let comboTimer = 0;
  const COMBO_MAX_TIME = 4.0;
  let nearMissCount = 0;
  let topSpeedAchieved = 0;

  let roadDistance = 0;
  let trafficCars = [];
  let pickups = [];
  let trafficSpawnTimer = 0;
  let pickupSpawnTimer = 0;

  // Track Dimensions
  const ROAD_WIDTH = 18.0; // 3D units wide
  const ROAD_HALF_WIDTH = ROAD_WIDTH / 2;

  // Player Definition (Smooth, relaxed, controllable pace)
  const player = {
    u: 0,          // lateral position from -0.90 to +0.90
    speed: 30,     // Gentle controllable start
    minSpeed: 16,
    baseMaxSpeed: 38,
    topSpeed: 52,
    accel: 11,
    brakeDecel: 32,
    turnSpeed: 1.25,
    vu: 0,
    tilt: 0,
    nitro: 100,
    isBoosting: false,
    alive: true
  };

  const CAR_TYPES = [
    { type: 'sedan',  width: 2.1, length: 4.4, speedMin: 20, speedMax: 26, color: 0x2a75d3, roof: 0x174785 },
    { type: 'sports', width: 2.2, length: 4.3, speedMin: 26, speedMax: 33, color: 0xe0284f, roof: 0x8a112a },
    { type: 'cab',    width: 2.1, length: 4.4, speedMin: 18, speedMax: 24, color: 0xf7c325, roof: 0x9e7b11 },
    { type: 'muscle', width: 2.2, length: 4.6, speedMin: 22, speedMax: 29, color: 0x9d32d4, roof: 0x5c197f },
    { type: 'truck',  width: 2.5, length: 7.2, speedMin: 15, speedMax: 20, color: 0x52627a, roof: 0x2b3442 },
    { type: 'police', width: 2.2, length: 4.5, speedMin: 28, speedMax: 36, color: 0x161922, roof: 0x0c0e14, isPolice: true }
  ];

  const PICKUP_TYPES = [
    { type: 'mult_x2', label: '2x', color: 0xff0077, hex: '#ff0077' },
    { type: 'mult_x3', label: '3x', color: 0x00f3ff, hex: '#00f3ff' },
    { type: 'mult_x5', label: '5x', color: 0xffd700, hex: '#ffd700' },
    { type: 'nitro',   label: '⚡', color: 0x00ff88, hex: '#00ff88' }
  ];

  function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
  function randomRange(min, max) { return Math.random() * (max - min) + min; }

  // Road Curve Math - Silky smooth & gradual sideways curvature
  function getRoadCurve(wZ) {
    return Math.sin(wZ * 0.00018) * 24 + Math.sin(wZ * 0.00038) * 10;
  }

  function getMapCurveOffset(progressRatio) {
    const phase = progressRatio * Math.PI * 2.0;
    return Math.sin(phase) * 5.5 + Math.sin(phase * 1.3) * 2.5;
  }

  // Floating notifications
  function showBanner(text, type = 'banner-nearmiss') {
    const el = document.createElement('div');
    el.className = `banner-item ${type}`;
    el.textContent = text;
    bannerContainer.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 1250);
  }

  // Haptic feedback
  function triggerHaptic(pattern = 15) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }

  // =========================================================================
  //  THREE.JS TRUE 3D ENGINE INITIALIZATION
  // =========================================================================
  let renderer, scene, camera;
  let playerCar3D = null;
  let roadSegments = [];
  const ROAD_SEGMENT_COUNT = 65;
  const ROAD_SEGMENT_LENGTH = 7.5;
  let sceneryObjects = [];
  let finishGantry = null;
  let sparksParticles = null;
  const MAX_SPARKS = 150;
  let sparkPositions, sparkVelocities, sparkLifes;

  // Textures
  function createSkyscraperTexture() {
    const cv = document.createElement('canvas');
    cv.width = 128; cv.height = 256;
    const cx = cv.getContext('2d');
    cx.fillStyle = '#0a0d18';
    cx.fillRect(0, 0, 128, 256);
    // Window grid
    for (let y = 10; y < 240; y += 14) {
      for (let x = 8; x < 120; x += 16) {
        if (Math.random() > 0.35) {
          cx.fillStyle = Math.random() > 0.6 ? '#00f3ff' : (Math.random() > 0.5 ? '#ffd700' : '#ff0077');
          cx.fillRect(x, y, 9, 8);
        }
      }
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  function createCheckeredTexture() {
    const cv = document.createElement('canvas');
    cv.width = 128; cv.height = 32;
    const cx = cv.getContext('2d');
    const sq = 16;
    for (let y = 0; y < 32; y += sq) {
      for (let x = 0; x < 128; x += sq) {
        cx.fillStyle = ((x / sq + y / sq) % 2 === 0) ? '#ffffff' : '#111111';
        cx.fillRect(x, y, sq, sq);
      }
    }
    return new THREE.CanvasTexture(cv);
  }

  const buildingTex = createSkyscraperTexture();
  const checkeredTex = createCheckeredTexture();

  // 3D Canvas Nameplate Sprite
  function createNameplateSprite(text, colorHex = '#00f3ff') {
    const cv = document.createElement('canvas');
    cv.width = 256; cv.height = 64;
    const cx = cv.getContext('2d');
    drawNameplateCanvas(cx, cv.width, cv.height, text, colorHex);

    const tex = new THREE.CanvasTexture(cv);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(3.2, 0.8, 1);
    sprite.userData = { canvas: cv, ctx: cx, text, colorHex };
    return sprite;
  }

  function updateNameplateSprite(sprite, text, colorHex) {
    if (!sprite || !sprite.userData) return;
    const { canvas: cv, ctx: cx } = sprite.userData;
    sprite.userData.text = text;
    sprite.userData.colorHex = colorHex;
    drawNameplateCanvas(cx, cv.width, cv.height, text, colorHex);
    sprite.material.map.needsUpdate = true;
  }

  function drawNameplateCanvas(cx, w, h, text, colorHex) {
    cx.clearRect(0, 0, w, h);
    // Background pill
    cx.fillStyle = 'rgba(8, 12, 24, 0.9)';
    cx.strokeStyle = colorHex;
    cx.lineWidth = 4;
    cx.beginPath();
    cx.roundRect(8, 6, w - 16, h - 22, 12);
    cx.fill();
    cx.stroke();

    // Downward arrow
    cx.fillStyle = colorHex;
    cx.beginPath();
    cx.moveTo(w / 2 - 10, h - 16);
    cx.lineTo(w / 2 + 10, h - 16);
    cx.lineTo(w / 2, h - 4);
    cx.closePath();
    cx.fill();

    // Text
    cx.font = '900 24px "Orbitron", monospace';
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.fillStyle = '#ffffff';
    cx.fillText(text, w / 2, (h - 22) / 2 + 6);
  }

  // 3D Procedural Car Builder
  function create3DCar({ color = 0x00f3ff, roofColor = 0x005577, isPlayer = false, name = 'RACER', isPolice = false, type = 'sports' } = {}) {
    const carGroup = new THREE.Group();
    const wheels = [];

    // Car scale dimensions based on type
    const carW = type === 'truck' ? 2.5 : 2.1;
    const carL = type === 'truck' ? 6.5 : 4.4;
    const carH = type === 'truck' ? 2.2 : 1.0;

    // 1. Lower Chassis
    const bodyMat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.25,
      metalness: 0.65
    });
    const chassisGeo = new THREE.BoxGeometry(carW, 0.45, carL);
    const chassisMesh = new THREE.Mesh(chassisGeo, bodyMat);
    chassisMesh.position.y = 0.45;
    carGroup.add(chassisMesh);

    // Front wedge/hood taper
    const noseGeo = new THREE.BoxGeometry(carW * 0.95, 0.35, 1.2);
    const noseMesh = new THREE.Mesh(noseGeo, bodyMat);
    noseMesh.position.set(0, 0.4, -carL * 0.4);
    carGroup.add(noseMesh);

    // 2. Cabin & Windshield
    const cabinMat = new THREE.MeshStandardMaterial({
      color: isPlayer ? 0x00f3ff : roofColor,
      roughness: 0.1,
      metalness: 0.8
    });
    const cabinW = carW * 0.82;
    const cabinL = type === 'truck' ? 2.2 : 2.0;
    const cabinH = carH * 0.55;
    const cabinGeo = new THREE.BoxGeometry(cabinW, cabinH, cabinL);
    const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
    cabinMesh.position.set(0, 0.45 + 0.22 + cabinH / 2, type === 'truck' ? -carL * 0.2 : 0.1);
    carGroup.add(cabinMesh);

    // Dark glass windshield
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0a1020,
      roughness: 0.05,
      metalness: 0.95
    });
    const glassGeo = new THREE.BoxGeometry(cabinW * 0.92, cabinH * 0.75, 0.1);
    const rearGlass = new THREE.Mesh(glassGeo, glassMat);
    rearGlass.position.set(0, 0.45 + 0.22 + cabinH / 2, (type === 'truck' ? -carL * 0.2 : 0.1) + cabinL / 2 + 0.02);
    carGroup.add(rearGlass);

    const frontGlass = new THREE.Mesh(glassGeo, glassMat);
    frontGlass.position.set(0, 0.45 + 0.22 + cabinH / 2, (type === 'truck' ? -carL * 0.2 : 0.1) - cabinL / 2 - 0.02);
    carGroup.add(frontGlass);

    // 3. Wheels (4 rubber cylinders)
    const wheelRadius = 0.38;
    const wheelThickness = 0.28;
    const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 14);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.8, metalness: 0.2 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xdde5ff, roughness: 0.3, metalness: 0.85 });

    const wheelOffsets = [
      [-carW / 2 - 0.06, wheelRadius, -carL * 0.32],
      [ carW / 2 + 0.06, wheelRadius, -carL * 0.32],
      [-carW / 2 - 0.06, wheelRadius,  carL * 0.32],
      [ carW / 2 + 0.06, wheelRadius,  carL * 0.32]
    ];

    wheelOffsets.forEach(([wx, wy, wz]) => {
      const wGroup = new THREE.Group();
      wGroup.position.set(wx, wy, wz);

      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      wGroup.add(tire);

      const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.55, wheelRadius * 0.55, wheelThickness + 0.02, 8);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      wGroup.add(rim);

      carGroup.add(wGroup);
      wheels.push(wGroup);
    });

    // 4. Glowing Headlights & Taillights
    const headMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const headGeo = new THREE.BoxGeometry(0.35, 0.16, 0.1);
    const hl1 = new THREE.Mesh(headGeo, headMat);
    hl1.position.set(-carW * 0.34, 0.45, -carL * 0.5 - 0.02);
    carGroup.add(hl1);
    const hl2 = new THREE.Mesh(headGeo, headMat);
    hl2.position.set( carW * 0.34, 0.45, -carL * 0.5 - 0.02);
    carGroup.add(hl2);

    // Taillights
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1133 });
    const tailGeo = new THREE.BoxGeometry(carW * 0.85, 0.12, 0.08);
    const tl = new THREE.Mesh(tailGeo, tailMat);
    tl.position.set(0, 0.52, carL * 0.5 + 0.02);
    carGroup.add(tl);

    // 5. Nitro Exhaust Flame Cones
    const nitroFlames = [];
    const flameGeo = new THREE.ConeGeometry(0.18, 1.2, 8);
    flameGeo.rotateX(-Math.PI / 2);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.9 });

    const f1 = new THREE.Mesh(flameGeo, flameMat);
    f1.position.set(-0.45, 0.35, carL * 0.5 + 0.6);
    f1.visible = false;
    carGroup.add(f1);
    nitroFlames.push(f1);

    const f2 = new THREE.Mesh(flameGeo, flameMat);
    f2.position.set(0.45, 0.35, carL * 0.5 + 0.6);
    f2.visible = false;
    carGroup.add(f2);
    nitroFlames.push(f2);

    // 6. Neon Underglow
    const underMat = new THREE.MeshBasicMaterial({
      color: isPlayer ? 0x00f3ff : color,
      transparent: true,
      opacity: 0.4
    });
    const underGeo = new THREE.PlaneGeometry(carW * 1.3, carL * 1.1);
    underGeo.rotateX(-Math.PI / 2);
    const underglow = new THREE.Mesh(underGeo, underMat);
    underglow.position.y = 0.05;
    carGroup.add(underglow);

    // 7. Police Siren Bar
    let sirenMesh = null;
    if (isPolice) {
      const sGeo = new THREE.BoxGeometry(0.8, 0.15, 0.3);
      const sMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
      sirenMesh = new THREE.Mesh(sGeo, sMat);
      sirenMesh.position.set(0, 0.45 + 0.22 + cabinH + 0.1, (type === 'truck' ? -carL * 0.2 : 0.1));
      carGroup.add(sirenMesh);
    }

    // 8. 3D Floating Nameplate
    const nameHex = isPlayer ? '#00f3ff' : ('#' + new THREE.Color(color).getHexString());
    const nameplate = createNameplateSprite(name, nameHex);
    nameplate.position.set(0, carH + 1.2, 0);
    carGroup.add(nameplate);

    return {
      group: carGroup,
      wheels,
      nitroFlames,
      underglow,
      sirenMesh,
      nameplateSprite: nameplate,
      height: carH,
      length: carL
    };
  }

  // 3D Collectible Gem Builder
  function create3DPickupMesh(type, colorHex) {
    const group = new THREE.Group();
    const geo = new THREE.OctahedronGeometry(0.65, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.8;
    group.add(mesh);

    // Outer glow halo
    const haloGeo = new THREE.RingGeometry(0.7, 0.9, 16);
    haloGeo.rotateX(-Math.PI / 2);
    const haloMat = new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 0.1;
    group.add(halo);

    return { group, gem: mesh, halo };
  }

  // Spark Particle System for 3D Impacts
  function initSparks() {
    const geo = new THREE.BufferGeometry();
    sparkPositions = new Float32Array(MAX_SPARKS * 3);
    sparkVelocities = [];
    sparkLifes = new Float32Array(MAX_SPARKS);

    for (let i = 0; i < MAX_SPARKS; i++) {
      sparkPositions[i * 3] = 0;
      sparkPositions[i * 3 + 1] = -999;
      sparkPositions[i * 3 + 2] = 0;
      sparkVelocities.push(new THREE.Vector3());
      sparkLifes[i] = 0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.45,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    sparksParticles = new THREE.Points(geo, mat);
    scene.add(sparksParticles);
  }

  function spawn3DSparks(x, y, z, count = 20, colorHex = 0xffd700) {
    if (!sparksParticles) return;
    let spawned = 0;
    for (let i = 0; i < MAX_SPARKS && spawned < count; i++) {
      if (sparkLifes[i] <= 0) {
        sparkPositions[i * 3] = x;
        sparkPositions[i * 3 + 1] = y;
        sparkPositions[i * 3 + 2] = z;
        sparkVelocities[i].set(
          randomRange(-7, 7),
          randomRange(3, 12),
          randomRange(-7, 7)
        );
        sparkLifes[i] = randomRange(0.4, 0.8);
        spawned++;
      }
    }
    sparksParticles.geometry.attributes.position.needsUpdate = true;
  }

  function update3DSparks(dt) {
    if (!sparksParticles) return;
    let anyActive = false;
    for (let i = 0; i < MAX_SPARKS; i++) {
      if (sparkLifes[i] > 0) {
        sparkLifes[i] -= dt;
        sparkPositions[i * 3] += sparkVelocities[i].x * dt;
        sparkPositions[i * 3 + 1] += sparkVelocities[i].y * dt;
        sparkPositions[i * 3 + 2] += sparkVelocities[i].z * dt;
        sparkVelocities[i].y -= 25.0 * dt; // gravity
        anyActive = true;
      } else {
        sparkPositions[i * 3 + 1] = -999;
      }
    }
    if (anyActive) {
      sparksParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  // Build Road Segments and Scenery (Zero tunnels, smooth sideways, open skyway)
  function buildRoadAndScenery() {
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x141825,
      roughness: 0.8,
      metalness: 0.1
    });
    const curbMatL = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const curbMatR = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const railMat = new THREE.MeshBasicMaterial({ color: 0x223355 });

    for (let i = 0; i < ROAD_SEGMENT_COUNT; i++) {
      const segGroup = new THREE.Group();

      // Smooth continuous asphalt base with extra overlap to eliminate seams
      const roadGeo = new THREE.BoxGeometry(ROAD_WIDTH, 0.2, ROAD_SEGMENT_LENGTH + 0.35);
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      segGroup.add(roadMesh);

      // Smooth flush neon curbs (silky border profile)
      const curbGeo = new THREE.BoxGeometry(0.85, 0.16, ROAD_SEGMENT_LENGTH + 0.35);
      const curbL = new THREE.Mesh(curbGeo, curbMatL);
      curbL.position.set(-ROAD_HALF_WIDTH - 0.4, 0.05, 0);
      segGroup.add(curbL);

      const curbR = new THREE.Mesh(curbGeo, curbMatR);
      curbR.position.set(ROAD_HALF_WIDTH + 0.4, 0.05, 0);
      segGroup.add(curbR);

      // Smooth low-profile guardrail barriers
      const railGeo = new THREE.BoxGeometry(0.28, 0.45, ROAD_SEGMENT_LENGTH + 0.35);
      const railL = new THREE.Mesh(railGeo, railMat);
      railL.position.set(-ROAD_HALF_WIDTH - 0.75, 0.22, 0);
      segGroup.add(railL);

      const railR = new THREE.Mesh(railGeo, railMat);
      railR.position.set(ROAD_HALF_WIDTH + 0.75, 0.22, 0);
      segGroup.add(railR);

      // Distant low skyline (pushed far away, wide open highway horizon - tunnels removed)
      const isLeft = i % 2 === 0;
      const bH = randomRange(12, 28);
      const bW = randomRange(14, 25);
      const bD = randomRange(14, 20);
      const bGeo = new THREE.BoxGeometry(bW, bH, bD);
      const bMat = new THREE.MeshStandardMaterial({
        color: 0x080c16,
        map: buildingTex,
        roughness: 0.4,
        metalness: 0.6
      });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(isLeft ? -ROAD_HALF_WIDTH - 55 - bW / 2 : ROAD_HALF_WIDTH + 55 + bW / 2, bH / 2, 0);
      segGroup.add(bMesh);

      // Low glowing roadside light marker every 4 segments
      if (i % 4 === 0) {
        const markerMat = new THREE.MeshBasicMaterial({ color: isLeft ? 0xff0055 : 0x00f3ff });
        const markerGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.2, 8);
        const markerMesh = new THREE.Mesh(markerGeo, markerMat);
        markerMesh.position.set(isLeft ? -ROAD_HALF_WIDTH - 0.75 : ROAD_HALF_WIDTH + 0.75, 0.6, 0);
        segGroup.add(markerMesh);
      }

      scene.add(segGroup);
      roadSegments.push({
        group: segGroup,
        baseZ: -i * ROAD_SEGMENT_LENGTH
      });
    }

    // 3D Ground Finish Line (Zero overhead arches/tunnels - completely open sky)
    finishGantry = new THREE.Group();

    // Checkered ground stripe across the asphalt
    const finishLineGeo = new THREE.PlaneGeometry(ROAD_WIDTH, 4.0);
    finishLineGeo.rotateX(-Math.PI / 2);
    const finishLineMat = new THREE.MeshBasicMaterial({ map: checkeredTex });
    const finishLineMesh = new THREE.Mesh(finishLineGeo, finishLineMat);
    finishLineMesh.position.set(0, 0.12, 0);
    finishGantry.add(finishLineMesh);

    // Glowing finish beacons on the left and right borders (low profile, open sky)
    const pylonMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 0.8 });
    const pylonGeo = new THREE.CylinderGeometry(0.35, 0.45, 2.5, 12);
    const p1 = new THREE.Mesh(pylonGeo, pylonMat);
    p1.position.set(-ROAD_HALF_WIDTH - 0.7, 1.25, 0);
    finishGantry.add(p1);

    const p2 = new THREE.Mesh(pylonGeo, pylonMat);
    p2.position.set(ROAD_HALF_WIDTH + 0.7, 1.25, 0);
    finishGantry.add(p2);

    scene.add(finishGantry);
  }

  // Initialize Three.js
  function init3D() {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(480, 720, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060814);
    scene.fog = new THREE.FogExp2(0x060814, 0.0035);

    camera = new THREE.PerspectiveCamera(65, 480 / 720, 0.5, 800);
    camera.position.set(0, 3.2, 7.5);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffeedd, 0.9);
    sunLight.position.set(20, 40, -50);
    scene.add(sunLight);

    // Build environment
    buildRoadAndScenery();
    initSparks();

    // Player Car 3D
    playerCar3D = create3DCar({
      color: 0x00f3ff,
      roofColor: 0x006699,
      isPlayer: true,
      name: playerCarName,
      type: 'sports'
    });
    scene.add(playerCar3D.group);
  }

  // =========================================================================
  //  GAME LOGIC & RESET
  // =========================================================================
  function spawnRivals(cfg) {
    // Remove old 3D models
    for (const r of rivalCars) {
      if (r.model3D) scene.remove(r.model3D.group);
    }
    rivalCars = [];

    const count = Math.min(cfg.rivals, RIVAL_NAMES.length);
    for (let i = 0; i < count; i++) {
      const col = RIVAL_COLORS[i % RIVAL_COLORS.length];
      const isPolice = cfg.police && i === count - 1;
      const initialU = randomRange(-0.80, 0.80);
      const leadDist = 25 + i * (cfg.dist * 0.72 / Math.max(1, count));
      const rName = isPolice ? 'COP ' + RIVAL_NAMES[i % RIVAL_NAMES.length] : RIVAL_NAMES[i % RIVAL_NAMES.length];

      const model = create3DCar({
        color: isPolice ? 0x161922 : col.color,
        roofColor: isPolice ? 0x0c0e14 : col.roof,
        isPlayer: false,
        name: rName,
        isPolice: isPolice,
        type: isPolice ? 'police' : (i % 3 === 0 ? 'muscle' : 'sports')
      });
      scene.add(model.group);

      rivalCars.push({
        id: i,
        name: rName,
        color: col.hex,
        speed: randomRange(cfg.baseSpeed * 0.88, cfg.baseSpeed * 1.02),
        distanceTravelled: leadDist,
        u: initialU,
        targetU: initialU,
        laneTimer: randomRange(2.0, 5.0),
        overtakenByPlayer: false,
        isPolice: isPolice,
        sirenTimer: 0,
        model3D: model
      });
    }
    totalRacers = count + 1;
    playerRank = totalRacers;
  }

  function resetGame() {
    score = 0;
    multiplier = 1.0;
    maxMultiplierAchieved = 1.0;
    comboTimer = 0;
    nearMissCount = 0;
    topSpeedAchieved = 0;

    // Clear traffic and pickups
    for (const c of trafficCars) { if (c.model3D) scene.remove(c.model3D.group); }
    trafficCars = [];
    for (const p of pickups) { if (p.model3D) scene.remove(p.model3D.group); }
    pickups = [];

    screenShake = 0;
    roadDistance = 0;
    raceTime = 0;
    overtakeCount = 0;

    player.u = 0;
    player.speed = 30;
    player.nitro = 100;
    player.vu = 0;
    player.tilt = 0;
    player.alive = true;
    player.isBoosting = false;

    trafficSpawnTimer = 1.5;
    pickupSpawnTimer = 4.0;

    // Level setup
    const cfg = LEVEL_CONFIGS[currentLevel - 1];
    targetDistance = cfg.dist;
    player.baseMaxSpeed = cfg.baseSpeed + 8;
    player.topSpeed = cfg.baseSpeed + 22;
    scene.background.setHex(cfg.sky);
    scene.fog.color.setHex(cfg.sky);

    spawnRivals(cfg);
    prevPlayerRank = totalRacers;

    // Position finish line gantry
    if (finishGantry) {
      const finishWorldZ = targetDistance * RACE_MAP_SCALE;
      const finishCurveX = getRoadCurve(finishWorldZ);
      finishGantry.position.set(finishCurveX, 0, -finishWorldZ);
    }

    updateUI();
  }

  function boostMultiplier(amount, reason = 'NEAR MISS') {
    const prevMult = multiplier;
    multiplier = parseFloat((multiplier + amount).toFixed(1));
    multiplier = clamp(multiplier, 1.0, 10.0);

    if (multiplier > maxMultiplierAchieved) {
      maxMultiplierAchieved = multiplier;
    }

    comboTimer = COMBO_MAX_TIME;
    multiplierContainer.classList.add('pulse');
    setTimeout(() => multiplierContainer.classList.remove('pulse'), 220);

    if (Math.floor(multiplier) > Math.floor(prevMult) && multiplier >= 2.0) {
      if (sound) sound.playMultiplierLevelUp();
      triggerHaptic([35, 45, 55]);
      showBanner(`🔥 MULTIPLIER x${multiplier.toFixed(1)}! 🔥`, 'banner-multiplier');
    }
  }

  function spawnTraffic() {
    const targetU = randomRange(-0.84, 0.84);
    const template = CAR_TYPES[Math.floor(Math.random() * CAR_TYPES.length)];
    const carSpeed = randomRange(template.speedMin, template.speedMax);

    const model = create3DCar({
      color: template.color,
      roofColor: template.roof,
      isPlayer: false,
      name: template.type.toUpperCase(),
      isPolice: !!template.isPolice,
      type: template.type
    });
    scene.add(model.group);

    trafficCars.push({
      u: targetU,
      targetU: targetU,
      driftTimer: randomRange(2.5, 5.0),
      worldZ: roadDistance + 220,
      speed: carSpeed,
      type: template.type,
      isPolice: !!template.isPolice,
      hasNearMissed: false,
      sirenTimer: 0,
      model3D: model
    });
  }

  function spawnPickup() {
    const targetU = randomRange(-0.82, 0.82);
    const rand = Math.random();
    let pType;
    if (rand < 0.40) pType = PICKUP_TYPES[0]; // x2
    else if (rand < 0.65) pType = PICKUP_TYPES[3]; // nitro
    else if (rand < 0.85) pType = PICKUP_TYPES[1]; // x3
    else pType = PICKUP_TYPES[2]; // x5

    const model = create3DPickupMesh(pType.type, pType.color);
    scene.add(model.group);

    pickups.push({
      u: targetU,
      worldZ: roadDistance + 200,
      type: pType.type,
      label: pType.label,
      colorHex: pType.hex,
      pulse: 0,
      model3D: model
    });
  }

  // Input Listeners
  window.addEventListener('keydown', (e) => {
    if (e.code in keys) { keys[e.code] = true; e.preventDefault(); }
    if (e.code === 'KeyP' || e.code === 'Escape') {
      if (currentState === STATE.PLAYING) pauseGame();
      else if (currentState === STATE.PAUSED) resumeGame();
    }
    if (e.code === 'Enter' && currentState === STATE.GAMEOVER) {
      sound.init(); startGame();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code in keys) { keys[e.code] = false; e.preventDefault(); }
  });

  // Audio unlock on first touch
  const unlockAudio = () => {
    if (sound) sound.init();
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('click', unlockAudio);
  };
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('click', unlockAudio, { passive: true });

  // Mobile App Background Handling
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (currentState === STATE.PLAYING) pauseGame();
      if (sound) sound.stopEngine();
    }
  });

  function bindTouch(element, keyCode, hapticPattern = 15) {
    if (!element) return;
    const startHandler = (e) => {
      e.preventDefault();
      sound.init();
      keys[keyCode] = true;
      element.classList.add('active');
      triggerHaptic(hapticPattern);
    };
    const endHandler = (e) => {
      e.preventDefault();
      keys[keyCode] = false;
      element.classList.remove('active');
    };
    element.addEventListener('touchstart', startHandler, { passive: false });
    element.addEventListener('touchend', endHandler, { passive: false });
    element.addEventListener('touchcancel', endHandler, { passive: false });
    element.addEventListener('mousedown', startHandler);
    element.addEventListener('mouseup', endHandler);
  }

  bindTouch(touchLeft, 'ArrowLeft', 15);
  bindTouch(touchRight, 'ArrowRight', 15);
  bindTouch(touchBrake, 'ArrowDown', 25);
  bindTouch(touchNitro, 'Space', 35);

  // Screen Touch Steering (Left/Right half of screen)
  let activeScreenTouchId = null;
  canvas.addEventListener('touchstart', (e) => {
    if (currentState !== STATE.PLAYING) return;
    sound.init();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const rect = canvas.getBoundingClientRect();
      const x = t.clientX - rect.left;
      const isLeft = x < rect.width * 0.5;
      activeScreenTouchId = t.identifier;
      keys.ArrowLeft = isLeft;
      keys.ArrowRight = !isLeft;
      triggerHaptic(15);
      if (touchLeft) touchLeft.classList.toggle('active', isLeft);
      if (touchRight) touchRight.classList.toggle('active', !isLeft);
      e.preventDefault();
      break;
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (currentState !== STATE.PLAYING || activeScreenTouchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === activeScreenTouchId) {
        const rect = canvas.getBoundingClientRect();
        const x = t.clientX - rect.left;
        const isLeft = x < rect.width * 0.5;
        keys.ArrowLeft = isLeft;
        keys.ArrowRight = !isLeft;
        if (touchLeft) touchLeft.classList.toggle('active', isLeft);
        if (touchRight) touchRight.classList.toggle('active', !isLeft);
        e.preventDefault();
        break;
      }
    }
  }, { passive: false });

  const clearScreenTouch = () => {
    activeScreenTouchId = null;
    keys.ArrowLeft = false;
    keys.ArrowRight = false;
    if (touchLeft) touchLeft.classList.remove('active');
    if (touchRight) touchRight.classList.remove('active');
  };
  canvas.addEventListener('touchend', clearScreenTouch, { passive: false });
  canvas.addEventListener('touchcancel', clearScreenTouch, { passive: false });

  window.addEventListener('touchend', (e) => {
    if (e.touches && e.touches.length === 0) {
      keys.ArrowLeft = false; keys.ArrowRight = false; keys.ArrowDown = false; keys.Space = false;
      if (touchLeft) touchLeft.classList.remove('active');
      if (touchRight) touchRight.classList.remove('active');
      if (touchBrake) touchBrake.classList.remove('active');
      if (touchNitro) touchNitro.classList.remove('active');
    }
  });

  // State Transitions
  function formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toFixed(1).padStart(4, '0');
    return `${m}:${s}`;
  }

  function levelComplete() {
    currentState = STATE.LEVEL_COMPLETE;
    if (sound) { sound.stopEngine(); if (sound.playLevelComplete) sound.playLevelComplete(playerRank <= 3); }
    triggerHaptic([50, 30, 80, 30, 120]);

    const ordinal = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
    const posStr = ordinal[playerRank] || `${playerRank}th`;

    if (finishBadge) {
      finishBadge.textContent = playerRank === 1 ? '🏆 1ST PLACE WINNER!' :
                                playerRank <= 3 ? `🥈 ${posStr} PLACE!` :
                                `P${playerRank} - RACE FINISHED`;
      finishBadge.className = 'finish-badge ' + (playerRank === 1 ? 'winner' : playerRank <= 3 ? 'podium' : 'dnq');
    }
    if (levelCompleteTitle) levelCompleteTitle.textContent = `LEVEL ${currentLevel} CLEARED!`;
    if (levelCompleteSub) levelCompleteSub.textContent = playerRank <= 3 ? '✅ YOU QUALIFIED!' : '❌ TOP 3 NEEDED TO UNLOCK NEXT';
    if (finishCarName) finishCarName.textContent = playerCarName || 'TURBO RACER';
    if (finishPos) finishPos.textContent = `${posStr} / ${totalRacers}`;
    if (finishTime) finishTime.textContent = formatTime(raceTime);
    if (finishScore) finishScore.textContent = Math.floor(score).toLocaleString();
    if (finishOvertakes) finishOvertakes.textContent = overtakeCount;

    if (playerRank <= 3 && currentLevel >= unlockedLevel && currentLevel < MAX_LEVELS) {
      unlockedLevel = currentLevel + 1;
      try { localStorage.setItem('turbo_racer_unlocked_level', unlockedLevel); } catch (e) {}
    }
    if (score > highScore) {
      highScore = score;
      try { localStorage.setItem('turbo_racer_high_score', highScore.toString()); } catch (e) {}
    }

    const isChamp = currentLevel === MAX_LEVELS && playerRank <= 3;
    if (championBadge) championBadge.classList.toggle('hidden', !isChamp);
    if (nextLevelBtn) nextLevelBtn.disabled = currentLevel >= MAX_LEVELS || playerRank > 3;

    hud.classList.add('hidden');
    if (raceProgressBar) raceProgressBar.classList.add('hidden');
    if (minimapWrapper) minimapWrapper.classList.add('hidden');

    setTimeout(() => {
      levelcompleteOverlay.classList.remove('hidden');
      levelcompleteOverlay.classList.add('active');
    }, 500);
  }

  // 3-2-1-GO Countdown
  let _countdownHandle = null;
  function runCountdown(callback) {
    if (!countdownOverlay || !countdownText) { callback(); return; }
    countdownOverlay.style.display = 'flex';
    countdownOverlay.classList.remove('hidden');
    countdownOverlay.classList.add('active');
    let n = 3;
    countdownText.textContent = n;
    if (sound && sound.playCountdownBeep) sound.playCountdownBeep();

    _countdownHandle = setInterval(() => {
      n--;
      if (n > 0) {
        countdownText.textContent = n;
        if (sound && sound.playCountdownBeep) sound.playCountdownBeep();
      } else if (n === 0) {
        countdownText.textContent = 'GO!';
        countdownText.style.color = '#00f3ff';
      } else {
        clearInterval(_countdownHandle);
        countdownOverlay.classList.remove('active');
        countdownOverlay.classList.add('hidden');
        countdownOverlay.style.display = 'none';
        countdownText.textContent = '';
        countdownText.style.color = '';
        callback();
      }
    }, 850);
  }

  // Level Select Modal
  function openLevelSelect() {
    if (!levelsGrid || !levelselectOverlay) return;
    levelsGrid.innerHTML = '';
    for (let i = 1; i <= MAX_LEVELS; i++) {
      const cfg = LEVEL_CONFIGS[i - 1];
      const isUnlocked = i <= unlockedLevel;
      const isCurrent = i === currentLevel;
      const tile = document.createElement('div');
      tile.className = `level-tile ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'active-level' : ''}`;
      tile.innerHTML = `<div class="tile-num">${i}</div><div class="tile-icon">${isUnlocked ? (i < currentLevel ? '✅' : '🏁') : '🔒'}</div><div class="tile-name">${cfg.name}</div>`;
      if (isUnlocked) {
        tile.addEventListener('click', () => {
          currentLevel = i;
          try { localStorage.setItem('turbo_racer_current_level', currentLevel); } catch (e) {}
          closeLevelSelect();
          startGame();
        });
      }
      levelsGrid.appendChild(tile);
    }
    levelselectOverlay.classList.remove('hidden');
    levelselectOverlay.classList.add('active');
  }

  function closeLevelSelect() {
    if (!levelselectOverlay) return;
    levelselectOverlay.classList.remove('active');
    levelselectOverlay.classList.add('hidden');
  }

  function goToMenu() {
    currentState = STATE.MENU;
    if (sound) sound.stopEngine();
    hud.classList.add('hidden');
    if (raceProgressBar) raceProgressBar.classList.add('hidden');
    if (minimapWrapper) minimapWrapper.classList.add('hidden');
    if (countdownOverlay) {
      clearInterval(_countdownHandle);
      countdownOverlay.classList.remove('active');
      countdownOverlay.classList.add('hidden');
      countdownOverlay.style.display = 'none';
    }
    if (countdownText) countdownText.textContent = '';
    gameoverOverlay.classList.remove('active');
    gameoverOverlay.classList.add('hidden');
    if (levelcompleteOverlay) { levelcompleteOverlay.classList.remove('active'); levelcompleteOverlay.classList.add('hidden'); }
    startOverlay.classList.remove('hidden');
    startOverlay.classList.add('active');
    if (menuCurrentLevel) menuCurrentLevel.textContent = currentLevel;
    if (menuLevelName) menuLevelName.textContent = LEVEL_CONFIGS[currentLevel - 1].name;
    menuHighScore.textContent = highScore.toLocaleString();
  }

  function startGame() {
    startOverlay.classList.remove('active');
    startOverlay.classList.add('hidden');
    gameoverOverlay.classList.remove('active');
    gameoverOverlay.classList.add('hidden');
    pauseOverlay.classList.remove('active');
    pauseOverlay.classList.add('hidden');
    if (levelcompleteOverlay) { levelcompleteOverlay.classList.remove('active'); levelcompleteOverlay.classList.add('hidden'); }

    resetGame();

    if (menuCurrentLevel) menuCurrentLevel.textContent = currentLevel;
    if (menuLevelName) menuLevelName.textContent = LEVEL_CONFIGS[currentLevel - 1].name;

    hud.classList.remove('hidden');
    if (raceProgressBar) raceProgressBar.classList.remove('hidden');
    if (minimapWrapper) minimapWrapper.classList.remove('hidden');

    currentState = STATE.COUNTDOWN;
    runCountdown(() => {
      currentState = STATE.PLAYING;
      if (sound) sound.startEngine();
    });
  }

  function pauseGame() {
    if (currentState !== STATE.PLAYING) return;
    currentState = STATE.PAUSED;
    pauseOverlay.classList.remove('hidden');
    pauseOverlay.classList.add('active');
    if (sound) sound.stopEngine();
  }

  function resumeGame() {
    if (currentState !== STATE.PAUSED) return;
    currentState = STATE.PLAYING;
    pauseOverlay.classList.remove('active');
    pauseOverlay.classList.add('hidden');
    if (sound) sound.startEngine();
  }

  window.pauseGame = pauseGame;
  window.resumeGame = resumeGame;
  window.startGame = startGame;
  window.soundSystem = sound;

  function gameOver() {
    currentState = STATE.GAMEOVER;
    player.alive = false;
    player.speed = 0;
    player.vu = 0;
    if (sound) { sound.stopEngine(); sound.playCrash(); }
    triggerHaptic([120, 60, 240]);
    screenShake = 30;

    if (countdownOverlay) {
      clearInterval(_countdownHandle);
      countdownOverlay.classList.remove('active');
      countdownOverlay.classList.add('hidden');
      countdownOverlay.style.display = 'none';
      if (countdownText) countdownText.textContent = '';
    }

    const isNewHigh = score > highScore;
    if (isNewHigh) {
      highScore = score;
      try { localStorage.setItem('turbo_racer_high_score', highScore.toString()); } catch (e) {}
      newHighBadge.classList.remove('hidden');
    } else {
      newHighBadge.classList.add('hidden');
    }

    finalScore.textContent = Math.floor(score).toLocaleString();
    finalMaxMult.textContent = `x${maxMultiplierAchieved.toFixed(1)}`;
    finalNearMisses.textContent = nearMissCount.toString();
    finalTopSpeed.textContent = `${Math.floor(topSpeedAchieved)} km/h`;
    menuHighScore.textContent = highScore.toLocaleString();

    hud.classList.add('hidden');
    if (raceProgressBar) raceProgressBar.classList.add('hidden');
    if (minimapWrapper) minimapWrapper.classList.add('hidden');

    setTimeout(() => {
      gameoverOverlay.classList.remove('hidden');
      gameoverOverlay.classList.add('active');
    }, 250);
  }

  // Button Listeners
  startBtn.addEventListener('click', () => { sound.init(); startGame(); });
  restartBtn.addEventListener('click', () => { sound.init(); startGame(); });
  resumeBtn.addEventListener('click', () => { resumeGame(); });
  menuBtn.addEventListener('click', () => { goToMenu(); });
  muteBtn.addEventListener('click', () => {
    sound.init();
    const isMuted = sound.toggleMute();
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
  });
  pauseBtn.addEventListener('click', () => {
    if (currentState === STATE.PLAYING) pauseGame();
    else if (currentState === STATE.PAUSED) resumeGame();
  });
  if (nextLevelBtn) nextLevelBtn.addEventListener('click', () => {
    if (currentLevel < MAX_LEVELS) {
      currentLevel++;
      try { localStorage.setItem('turbo_racer_current_level', currentLevel); } catch (e) {}
    }
    sound.init(); startGame();
  });
  if (retryRaceBtn) retryRaceBtn.addEventListener('click', () => { sound.init(); startGame(); });
  if (levelSelectBtn2) levelSelectBtn2.addEventListener('click', openLevelSelect);
  if (levelSelectBtn) levelSelectBtn.addEventListener('click', openLevelSelect);
  if (closeLevelselectBtn) closeLevelselectBtn.addEventListener('click', closeLevelSelect);
  if (pauseLevelSelectBtn) pauseLevelSelectBtn.addEventListener('click', () => { resumeGame(); openLevelSelect(); });

  function updateMultiplier(dt) {
    if (comboTimer > 0) {
      comboTimer -= dt;
      const fillPercent = (comboTimer / COMBO_MAX_TIME) * 100;
      comboBarFill.style.width = `${Math.max(0, fillPercent)}%`;
      if (comboTimer <= 0) {
        if (multiplier > 1.0) {
          multiplier = Math.max(1.0, parseFloat((multiplier - 0.5).toFixed(1)));
          comboTimer = multiplier > 1.0 ? 1.8 : 0;
        }
      }
    } else {
      comboBarFill.style.width = '0%';
    }
  }

  function updateUI() {
    scoreDisplay.textContent = Math.floor(score).toLocaleString();
    multiplierDisplay.textContent = `x${multiplier.toFixed(1)}`;
    speedDisplay.innerHTML = `${Math.floor(player.speed)} <small>km/h</small>`;
    nitroBarFill.style.width = `${Math.max(0, Math.min(100, player.nitro))}%`;
  }

  // =========================================================================
  //  SIMULATION & UPDATE LOOP
  // =========================================================================
  function update(dt) {
    if (currentState !== STATE.PLAYING) return;

    if (player.speed > topSpeedAchieved) {
      topSpeedAchieved = player.speed;
    }

    const isBrake = keys.ArrowDown || keys.KeyS;
    const isGas = keys.ArrowUp || keys.KeyW;
    const isLeft = keys.ArrowLeft || keys.KeyA;
    const isRight = keys.ArrowRight || keys.KeyD;
    const wantsNitro = keys.Space;

    // Nitro boost (Smooth acceleration)
    if (wantsNitro && player.nitro > 0 && player.speed > 24) {
      player.isBoosting = true;
      player.nitro = Math.max(0, player.nitro - 22 * dt);
      player.speed += (player.accel * 2.2) * dt;
      if (Math.random() < 0.25 && sound) sound.playNitro();
      screenShake = Math.max(screenShake, 2);
    } else {
      player.isBoosting = false;
      player.nitro = Math.min(100, player.nitro + 5.0 * dt);
    }

    const currentMaxSpeed = player.isBoosting ? player.topSpeed : player.baseMaxSpeed;

    if (isBrake) {
      player.speed -= player.brakeDecel * dt;
      if (Math.random() < 0.08 && sound) sound.playScreech();
    } else {
      if (player.speed < currentMaxSpeed) {
        const rate = isGas ? player.accel * 1.5 : player.accel * 1.25;
        player.speed += rate * dt;
      }
    }

    // Shoulder friction
    const isOffRoad = Math.abs(player.u) > 0.85;
    if (isOffRoad) {
      player.speed -= 25 * dt;
      screenShake = Math.max(screenShake, 2);
    }

    player.speed = clamp(player.speed, player.minSpeed, currentMaxSpeed);
    if (sound) sound.updateEngine(player.speed / player.topSpeed);

    // Steering Physics - Silky Smooth & Controllable
    const speedFactor = clamp(player.speed / 35, 0.65, 1.05);
    let targetVu = 0;
    if (isLeft) targetVu = -player.turnSpeed * speedFactor;
    if (isRight) targetVu = player.turnSpeed * speedFactor;

    player.vu += (targetVu - player.vu) * 4.8 * dt;
    player.u += player.vu * dt;
    player.u = clamp(player.u, -0.90, 0.90);

    // Smooth tilt into turn
    const targetTilt = (player.vu / player.turnSpeed) * 0.12;
    player.tilt += (targetTilt - player.tilt) * 4.5 * dt;

    // Advance world distance
    const worldSpeed = player.speed * WORLD_SPEED_FACTOR;
    roadDistance += worldSpeed * dt;

    // Scoring
    let speedBonusMult = player.speed > 75 ? 1.5 : 1.0;
    score += (player.speed * 0.02 * multiplier * speedBonusMult) * dt;
    updateMultiplier(dt);

    // Spawners
    trafficSpawnTimer -= dt;
    if (trafficSpawnTimer <= 0) {
      spawnTraffic();
      const minSpawn = Math.max(0.65, 1.7 - (score / 2500));
      trafficSpawnTimer = randomRange(minSpawn, minSpawn + 0.85);
    }

    pickupSpawnTimer -= dt;
    if (pickupSpawnTimer <= 0) {
      spawnPickup();
      pickupSpawnTimer = randomRange(4.5, 8.5);
    }

    // Update Traffic Cars
    const playerX = player.u * (ROAD_HALF_WIDTH - 1.6);
    for (let i = trafficCars.length - 1; i >= 0; i--) {
      const car = trafficCars[i];
      car.worldZ += (car.speed * WORLD_SPEED_FACTOR) * dt;

      // Weaving
      car.driftTimer -= dt;
      if (car.driftTimer <= 0) {
        car.targetU = randomRange(-0.82, 0.82);
        car.driftTimer = randomRange(3.0, 6.0);
      }
      car.u += (car.targetU - car.u) * 0.9 * dt;
      car.u = clamp(car.u, -0.88, 0.88);

      if (car.isPolice) car.sirenTimer += dt * 8;

      const relZ = car.worldZ - roadDistance;
      const carX = car.u * (ROAD_HALF_WIDTH - 1.6);

      // Collision Check
      const dz = Math.abs(relZ);
      const dx = Math.abs(carX - playerX);

      if (dz < 3.8 && dx < 2.0) {
        spawn3DSparks(playerX, 0.6, -2, 35, 0xff2200);
        gameOver();
        return;
      }

      // Near-Miss Check
      if (dz < 4.8 && dx >= 2.0 && dx <= 3.6 && !car.hasNearMissed && player.speed > 20) {
        car.hasNearMissed = true;
        nearMissCount++;
        const baseBonus = 35;
        const totalBonus = Math.floor(baseBonus * multiplier);
        score += totalBonus;
        boostMultiplier(0.5, 'NEAR MISS');
        if (sound) sound.playNearMiss(Math.floor(multiplier));
        triggerHaptic(30);
        spawn3DSparks(carX, 0.6, -2 - relZ, 15, 0xffd700);
        screenShake = 4;
        showBanner(`⚡ NEAR MISS! +${totalBonus} (x${multiplier.toFixed(1)})`, 'banner-nearmiss');
      }

      // Remove car when far behind or far ahead
      if (relZ < -60 || relZ > 420) {
        if (car.model3D) scene.remove(car.model3D.group);
        trafficCars.splice(i, 1);
      }
    }

    // Update Pickups
    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i];
      p.pulse += dt * 4.5;
      const relZ = p.worldZ - roadDistance;
      const pX = p.u * (ROAD_HALF_WIDTH - 1.6);

      const dz = Math.abs(relZ);
      const dx = Math.abs(pX - playerX);

      if (dz < 3.6 && dx < 2.2) {
        if (sound) sound.playPickup();
        triggerHaptic([20, 30, 25]);
        spawn3DSparks(pX, 0.8, -2, 22, p.colorHex);

        if (p.type === 'mult_x2') {
          boostMultiplier(2.0, '2X PICKUP');
          const bonusPts = Math.floor(50 * multiplier);
          score += bonusPts;
          showBanner(`💎 2x MULTIPLIER BOOST! +${bonusPts}`, 'banner-multiplier');
        } else if (p.type === 'mult_x3') {
          boostMultiplier(3.0, '3X PICKUP');
          const bonusPts = Math.floor(100 * multiplier);
          score += bonusPts;
          showBanner(`⭐ 3x MULTIPLIER BOOST! +${bonusPts}`, 'banner-multiplier');
        } else if (p.type === 'mult_x5') {
          boostMultiplier(5.0, '5X MEGA PICKUP');
          const bonusPts = Math.floor(250 * multiplier);
          score += bonusPts;
          showBanner(`👑 5x MEGA BOOST! +${bonusPts}`, 'banner-multiplier');
        } else if (p.type === 'nitro') {
          player.nitro = Math.min(100, player.nitro + 60);
          showBanner(`⚡ NITRO REFILL!`, 'banner-nearmiss');
        }

        if (p.model3D) scene.remove(p.model3D.group);
        pickups.splice(i, 1);
        continue;
      }

      if (relZ < -30) {
        if (p.model3D) scene.remove(p.model3D.group);
        pickups.splice(i, 1);
      }
    }

    // Update Rival Racing Cars
    raceTime += dt;
    for (const rival of rivalCars) {
      rival.distanceTravelled += rival.speed * WORLD_SPEED_FACTOR * dt;
      if (rival.isPolice) rival.sirenTimer += dt * 8;

      rival.laneTimer -= dt;
      if (rival.laneTimer <= 0) {
        rival.targetU = randomRange(-0.82, 0.82);
        rival.laneTimer = randomRange(2.0, 4.5);
      }
      rival.u += (rival.targetU - rival.u) * 0.9 * dt;
      rival.u = clamp(rival.u, -0.88, 0.88);

      const relDist = rival.distanceTravelled - roadDistance;

      // Overtake Detection
      if (relDist <= 0 && !rival.overtakenByPlayer) {
        rival.overtakenByPlayer = true;
        overtakeCount++;
        if (sound && sound.playOvertake) sound.playOvertake();
        triggerHaptic([25, 20, 35]);
        showBanner(`🏎️ OVERTOOK ${rival.name}!`, 'banner-nearmiss');
      }

      // Bump interaction with rivals
      if (Math.abs(relDist) < 3.4) {
        const rX = rival.u * (ROAD_HALF_WIDTH - 1.6);
        const dx = Math.abs(rX - playerX);
        if (dx < 2.0) {
          player.speed = Math.max(player.minSpeed, player.speed - 8);
          rival.speed += 5;
          screenShake = Math.max(screenShake, 3);
          triggerHaptic(20);
          spawn3DSparks(rX, 0.6, -2, 12, 0xff9900);
        }
      }
    }

    // Dynamic Race Position Ranking
    prevPlayerRank = playerRank;
    let currentRank = 1;
    for (const r of rivalCars) {
      if (r.distanceTravelled > roadDistance) currentRank++;
    }
    playerRank = currentRank;
    if (playerRank < prevPlayerRank) {
      if (sound && sound.playOvertake) sound.playOvertake();
      showBanner(`🏁 NOW POSITION P${playerRank}!`, 'banner-multiplier');
    }

    // Level Completion Check
    const totalRaceUnits = targetDistance * RACE_MAP_SCALE;
    if (roadDistance >= totalRaceUnits) {
      levelComplete();
      return;
    }

    // Racing HUD Updates
    const raceProgressRatio = clamp(roadDistance / totalRaceUnits, 0, 1);
    if (raceProgressFill) raceProgressFill.style.width = `${raceProgressRatio * 100}%`;
    if (raceCarDot) raceCarDot.style.left = `${raceProgressRatio * 100}%`;
    if (raceDistDisplay) {
      const remainingMeters = Math.max(0, Math.floor(targetDistance * (1 - raceProgressRatio)));
      raceDistDisplay.textContent = `${remainingMeters}m`;
    }
    if (posDisplay) {
      posDisplay.innerHTML = `${playerRank}<small id="pos-total">/${totalRacers}</small>`;
    }
    if (hudLevelLabel) {
      hudLevelLabel.textContent = `LVL ${currentLevel}/25`;
    }

    // Screen Shake decay
    if (screenShake > 0) {
      screenShake -= 25 * dt;
      if (screenShake < 0) screenShake = 0;
    }

    update3DSparks(dt);
    updateUI();
  }

  // =========================================================================
  //  3D RENDER LOOP
  // =========================================================================
  function render3D(dt = 0.016) {
    // 1. Update Road Segments with Curve & Recycling ahead
    const totalRoadLength = ROAD_SEGMENT_COUNT * ROAD_SEGMENT_LENGTH;
    const currentCurve = getRoadCurve(roadDistance);

    roadSegments.forEach((seg) => {
      // Relative distance in front of player
      let relZ = (seg.baseZ - (roadDistance % totalRoadLength));
      while (relZ > 20) relZ -= totalRoadLength;
      while (relZ < -totalRoadLength + 20) relZ += totalRoadLength;

      const worldZAtSeg = roadDistance - relZ;
      const curveXAtSeg = getRoadCurve(worldZAtSeg) - currentCurve;
      seg.group.position.set(curveXAtSeg, 0, relZ);

      // Silky smooth continuous yaw alignment to track tangent
      const dAhead = 15.0;
      const curveAhead = getRoadCurve(worldZAtSeg + dAhead) - currentCurve;
      const yawAngle = Math.atan2(curveAhead - curveXAtSeg, dAhead);
      seg.group.rotation.y = yawAngle;
    });

    // 2. Position Checkered Finish Line Gantry
    if (finishGantry) {
      const finishDist = targetDistance * RACE_MAP_SCALE;
      const relFinishZ = -(finishDist - roadDistance);
      const finishCurveX = getRoadCurve(finishDist) - currentCurve;
      finishGantry.position.set(finishCurveX, 0, relFinishZ);
    }

    // 3. Update Player Car 3D
    if (playerCar3D) {
      const playerX = player.u * (ROAD_HALF_WIDTH - 1.6);
      playerCar3D.group.position.set(playerX, 0, -2);
      playerCar3D.group.rotation.z = -player.tilt * 0.45;
      playerCar3D.group.rotation.y = -player.vu * 0.08;

      // Wheel spin (Smooth realistic rate)
      const wheelSpinRate = (player.speed / 20) * 0.08;
      playerCar3D.wheels.forEach(w => { w.rotation.x += wheelSpinRate; });

      // Nitro exhaust flame animation
      playerCar3D.nitroFlames.forEach(f => {
        f.visible = player.isBoosting;
        if (player.isBoosting) {
          f.scale.set(randomRange(0.8, 1.25), randomRange(0.9, 1.5), randomRange(0.8, 1.25));
        }
      });
    }

    // 4. Update Rival Cars 3D
    for (const rival of rivalCars) {
      if (!rival.model3D) continue;
      const relDist = rival.distanceTravelled - roadDistance;
      const rZ = -2 - relDist;
      const rivalWorldZ = rival.distanceTravelled;
      const rCurveX = (getRoadCurve(rivalWorldZ) - currentCurve);
      const rX = rCurveX + rival.u * (ROAD_HALF_WIDTH - 1.6);

      rival.model3D.group.position.set(rX, 0, rZ);

      // Visibility clipping
      rival.model3D.group.visible = (rZ > -450 && rZ < 50);

      // Wheels
      const spin = (rival.speed / 20) * 0.08;
      rival.model3D.wheels.forEach(w => { w.rotation.x += spin; });

      // Police siren strobe
      if (rival.isPolice && rival.model3D.sirenMesh) {
        const isRed = Math.floor(rival.sirenTimer) % 2 === 0;
        rival.model3D.sirenMesh.material.color.setHex(isRed ? 0xff0022 : 0x0066ff);
      }
    }

    // 5. Update Traffic Cars 3D
    for (const car of trafficCars) {
      if (!car.model3D) continue;
      const relDist = car.worldZ - roadDistance;
      const cZ = -2 - relDist;
      const cCurveX = (getRoadCurve(car.worldZ) - currentCurve);
      const cX = cCurveX + car.u * (ROAD_HALF_WIDTH - 1.6);

      car.model3D.group.position.set(cX, 0, cZ);
      car.model3D.group.visible = (cZ > -450 && cZ < 40);

      const spin = (car.speed / 20) * 0.08;
      car.model3D.wheels.forEach(w => { w.rotation.x += spin; });

      if (car.isPolice && car.model3D.sirenMesh) {
        const isRed = Math.floor(car.sirenTimer) % 2 === 0;
        car.model3D.sirenMesh.material.color.setHex(isRed ? 0xff0022 : 0x0066ff);
      }
    }

    // 6. Update Pickups 3D
    for (const p of pickups) {
      if (!p.model3D) continue;
      const relDist = p.worldZ - roadDistance;
      const pZ = -2 - relDist;
      const pCurveX = (getRoadCurve(p.worldZ) - currentCurve);
      const pX = pCurveX + p.u * (ROAD_HALF_WIDTH - 1.6);

      p.model3D.group.position.set(pX, 0.4 + Math.sin(p.pulse) * 0.25, pZ);
      p.model3D.gem.rotation.y += 0.04;
      p.model3D.gem.rotation.x += 0.02;
      p.model3D.group.visible = (pZ > -450 && pZ < 30);
    }

    // 7. Dynamic Chase Camera - Smooth Gliding
    const px = player.u * (ROAD_HALF_WIDTH - 1.6);
    let shakeX = 0, shakeY = 0;
    if (screenShake > 0) {
      shakeX = (Math.random() - 0.5) * (screenShake * 0.02);
      shakeY = (Math.random() - 0.5) * (screenShake * 0.02);
    }

    const targetCamX = px * 0.40;
    camera.position.x += (targetCamX - camera.position.x) * (5.5 * dt) + shakeX;
    const targetCamY = (player.isBoosting ? 3.1 : 2.9) + shakeY;
    camera.position.y += (targetCamY - camera.position.y) * (4.5 * dt);
    camera.position.z = 5.8;

    // Smooth camera look target
    camera.lookAt(camera.position.x * 0.65, 1.1, -15);

    // Dynamic FOV on nitro boost
    const targetFOV = player.isBoosting ? 74 : 64;
    camera.fov += (targetFOV - camera.fov) * 0.1;
    camera.updateProjectionMatrix();

    // Render 3D Scene
    renderer.render(scene, camera);

    // Render Minimap in 2D Canvas Overlay
    drawMiniMap();
  }

  // =========================================================================
  //  MINI-MAP 2D CANVAS RENDERER
  // =========================================================================
  function drawMiniMap() {
    if (!minimapCtx || !minimapWrapper) return;
    if (currentState !== STATE.PLAYING && currentState !== STATE.PAUSED && currentState !== STATE.COUNTDOWN) return;

    const MW = minimapCanvas.width;
    const MH = minimapCanvas.height;
    minimapCtx.clearRect(0, 0, MW, MH);

    // Background
    minimapCtx.fillStyle = 'rgba(6, 8, 18, 0.95)';
    minimapCtx.beginPath();
    minimapCtx.roundRect(0, 0, MW, MH, 10);
    minimapCtx.fill();

    const dist = targetDistance > 0 ? targetDistance : 1400;
    const totalRaceDist = dist * RACE_MAP_SCALE;
    const finishY = 16;
    const startY = MH - 18;
    const trackPlayHeight = startY - finishY;
    const roadW = 46;

    const uToMapX = (u, y) => {
      const ratio = 1 - (y - finishY) / trackPlayHeight;
      const curve = getMapCurveOffset(clamp(ratio, 0, 1));
      const leftX = (MW - roadW) / 2 + curve;
      return leftX + 4 + (u + 1) / 2 * (roadW - 8);
    };

    // Draw curved road slices
    const slices = 28;
    const sliceH = (MH - 8) / slices;
    for (let i = 0; i < slices; i++) {
      const y1 = 4 + i * sliceH;
      const y2 = y1 + sliceH + 0.5;
      const ratio1 = 1 - (y1 - finishY) / trackPlayHeight;
      const ratio2 = 1 - (y2 - finishY) / trackPlayHeight;

      const curve1 = getMapCurveOffset(clamp(ratio1, 0, 1));
      const curve2 = getMapCurveOffset(clamp(ratio2, 0, 1));

      const x1 = (MW - roadW) / 2 + curve1;
      const x2 = (MW - roadW) / 2 + curve2;

      minimapCtx.fillStyle = '#141a2b';
      minimapCtx.beginPath();
      minimapCtx.moveTo(x1, y1);
      minimapCtx.lineTo(x1 + roadW, y1);
      minimapCtx.lineTo(x2 + roadW, y2);
      minimapCtx.lineTo(x2, y2);
      minimapCtx.closePath();
      minimapCtx.fill();

      minimapCtx.fillStyle = 'rgba(0, 243, 255, 0.55)';
      minimapCtx.fillRect(x1, y1, 2, sliceH + 0.5);
      minimapCtx.fillRect(x1 + roadW - 2, y1, 2, sliceH + 0.5);
    }

    // Finish line
    const finishCurve = getMapCurveOffset(1.0);
    const finishX = (MW - roadW) / 2 + finishCurve;
    minimapCtx.fillStyle = 'rgba(255, 215, 0, 0.95)';
    minimapCtx.fillRect(finishX, finishY - 2, roadW, 4);
    minimapCtx.fillStyle = '#ffd700';
    minimapCtx.font = 'bold 8px sans-serif';
    minimapCtx.textAlign = 'center';
    minimapCtx.fillText('🏁 FINISH', finishX + roadW / 2, finishY - 5);

    // Rivals on map
    for (const rival of rivalCars) {
      const rivalRatio = clamp(rival.distanceTravelled / totalRaceDist, 0, 1.05);
      const my = startY - rivalRatio * trackPlayHeight;
      const mx = uToMapX(rival.u, my);

      minimapCtx.fillStyle = rival.color;
      minimapCtx.shadowColor = rival.color;
      minimapCtx.shadowBlur = 4;
      minimapCtx.beginPath();
      minimapCtx.roundRect(mx - 4, my - 5, 8, 10, 2);
      minimapCtx.fill();
      minimapCtx.shadowBlur = 0;

      minimapCtx.fillStyle = '#ffffff';
      minimapCtx.font = 'bold 6px sans-serif';
      minimapCtx.textAlign = 'center';
      minimapCtx.fillText(rival.name.charAt(0), mx, my + 2);
    }

    // Player Car
    const playerRatio = clamp(roadDistance / totalRaceDist, 0, 1);
    const playerMapY = startY - playerRatio * trackPlayHeight;
    const playerMapX = uToMapX(player.u, playerMapY);

    minimapCtx.fillStyle = '#00f3ff';
    minimapCtx.shadowColor = '#00f3ff';
    minimapCtx.shadowBlur = 9;
    minimapCtx.beginPath();
    minimapCtx.moveTo(playerMapX, playerMapY - 8);
    minimapCtx.lineTo(playerMapX - 5, playerMapY + 5);
    minimapCtx.lineTo(playerMapX, playerMapY + 2);
    minimapCtx.lineTo(playerMapX + 5, playerMapY + 5);
    minimapCtx.closePath();
    minimapCtx.fill();
    minimapCtx.shadowBlur = 0;

    minimapCtx.fillStyle = '#ffffff';
    minimapCtx.font = 'bold 5.5px sans-serif';
    minimapCtx.textAlign = 'center';
    minimapCtx.fillText('YOU', playerMapX, playerMapY - 9);

    // Neon border
    minimapCtx.strokeStyle = 'rgba(0, 243, 255, 0.55)';
    minimapCtx.lineWidth = 1.5;
    minimapCtx.beginPath();
    minimapCtx.roundRect(0.75, 0.75, MW - 1.5, MH - 1.5, 10);
    minimapCtx.stroke();
  }

  // Master Animation Frame Loop
  let lastTime = performance.now();
  function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    update(dt);
    render3D(dt);

    requestAnimationFrame(gameLoop);
  }

  // Initialize and start render loop
  init3D();
  requestAnimationFrame(gameLoop);
})();
