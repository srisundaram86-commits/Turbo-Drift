// Anti-Gravity 3D - Zero-G Hyper Racer Engine
// Full WebGL 3D Anti-Gravity Racing Engine with Twisting Tracks, Wall-Riding, Cosmic Void & Asteroids
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

  // Player Ship Customization DOM
  const playerCarNameInput = document.getElementById('player-car-name');
  const finishCarName = document.getElementById('finish-car-name');
  let playerCarName = 'PHANTOM AG-1';
  try {
    const savedName = localStorage.getItem('turbo_racer_car_name');
    if (savedName && savedName.trim()) {
      playerCarName = savedName.trim().toUpperCase();
    }
  } catch (e) {}
  if (playerCarNameInput) {
    playerCarNameInput.value = playerCarName;
    playerCarNameInput.addEventListener('input', (e) => {
      const val = e.target.value.trim().toUpperCase() || 'PHANTOM AG-1';
      playerCarName = val;
      try {
        localStorage.setItem('turbo_racer_car_name', playerCarName);
      } catch (err) {}
      if (playerShip3D && playerShip3D.nameplateSprite) {
        updateNameplateSprite(playerShip3D.nameplateSprite, playerCarName, '#00f3ff');
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

  // Anti-Gravity Racing Scale & Map Calibration
  const WORLD_SPEED_FACTOR = 4.2;
  const RACE_MAP_SCALE = 60;

  // 25 Cosmic Anti-Gravity Level Configurations
  const MAX_LEVELS = 25;
  const LEVEL_CONFIGS = [
    { level: 1,  name: "Neon Nebula Circuit",  dist: 1200, rivals: 5,  baseSpeed: 180, police: false, sky: 0x02030d, fog: 0x00f3ff, nebula: 0x00f3ff },
    { level: 2,  name: "Solar Flare Ridge",    dist: 1350, rivals: 6,  baseSpeed: 188, police: false, sky: 0x0a0304, fog: 0xff5500, nebula: 0xff3300 },
    { level: 3,  name: "Tokyo Orbital Rift",   dist: 1500, rivals: 6,  baseSpeed: 195, police: false, sky: 0x09010e, fog: 0xff0088, nebula: 0xd500f9 },
    { level: 4,  name: "Vapor Voidway",        dist: 1650, rivals: 7,  baseSpeed: 202, police: false, sky: 0x010810, fog: 0x00e5ff, nebula: 0x0088ff },
    { level: 5,  name: "Cyberspace Viaduct",   dist: 1800, rivals: 7,  baseSpeed: 210, police: false, sky: 0x080214, fog: 0xd500f9, nebula: 0x9900ff },
    { level: 6,  name: "Midnight Asteroid Belt",dist: 2000,rivals: 8,  baseSpeed: 218, police: false, sky: 0x020412, fog: 0x2979ff, nebula: 0x0033aa },
    { level: 7,  name: "Chrome Heliospheric",  dist: 2200, rivals: 8,  baseSpeed: 225, police: false, sky: 0x0b0801, fog: 0xffd700, nebula: 0xffaa00 },
    { level: 8,  name: "Outrun Pulsar Loop",   dist: 2400, rivals: 9,  baseSpeed: 232, police: false, sky: 0x100402, fog: 0xff3300, nebula: 0xff6600 },
    { level: 9,  name: "Grid Event Horizon",   dist: 2600, rivals: 9,  baseSpeed: 240, police: false, sky: 0x0a010d, fog: 0xff00bb, nebula: 0xff0077 },
    { level: 10, name: "Interceptor Patrol AG",dist: 2850, rivals: 10, baseSpeed: 248, police: true,  sky: 0x0d0103, fog: 0xff0033, nebula: 0xff0022 },
    { level: 11, name: "Solar Wind Sprint",    dist: 3100, rivals: 10, baseSpeed: 255, police: false, sky: 0x0f0700, fog: 0xffaa00, nebula: 0xff8800 },
    { level: 12, name: "Night City Orbit",     dist: 3350, rivals: 11, baseSpeed: 262, police: false, sky: 0x060114, fog: 0xaa00ff, nebula: 0x7700ff },
    { level: 13, name: "Hyperion Slipstream",  dist: 3600, rivals: 11, baseSpeed: 270, police: false, sky: 0x010814, fog: 0x00f3ff, nebula: 0x00bbff },
    { level: 14, name: "Aurora Orbital Raceway",dist: 3850,rivals: 12, baseSpeed: 278, police: false, sky: 0x010e08, fog: 0x00ff88, nebula: 0x00dd66 },
    { level: 15, name: "Synthwave Supernova",  dist: 4100, rivals: 12, baseSpeed: 285, police: false, sky: 0x0e010a, fog: 0xff0088, nebula: 0xff0066 },
    { level: 16, name: "Ion Thruster Turnpike",dist: 4350, rivals: 13, baseSpeed: 292, police: false, sky: 0x0f0500, fog: 0xff6600, nebula: 0xff4400 },
    { level: 17, name: "Laser Quasar Freeway", dist: 4600, rivals: 13, baseSpeed: 300, police: false, sky: 0x010618, fog: 0x0099ff, nebula: 0x0066ff },
    { level: 18, name: "Velocity Cosmic Ridge",dist: 4900, rivals: 14, baseSpeed: 308, police: false, sky: 0x0c0901, fog: 0xffcc00, nebula: 0xffaa00 },
    { level: 19, name: "Cyber Storm Voidway",  dist: 5200, rivals: 14, baseSpeed: 315, police: false, sky: 0x080112, fog: 0xdd00ff, nebula: 0xaa00ee },
    { level: 20, name: "Special Galactic Pursuit",dist: 5500, rivals: 15, baseSpeed: 322, police: true, sky: 0x120104, fog: 0xff0022, nebula: 0xff0044 },
    { level: 21, name: "Quantum Singular Track",dist: 5800, rivals: 15, baseSpeed: 330, police: false, sky: 0x010b14, fog: 0x00f3ff, nebula: 0x00e5ff },
    { level: 22, name: "Apex Dyson Megaway",   dist: 6150, rivals: 15, baseSpeed: 338, police: false, sky: 0x011208, fog: 0x00ff66, nebula: 0x00cc44 },
    { level: 23, name: "Warp Velocity Strip",  dist: 6500, rivals: 16, baseSpeed: 345, police: false, sky: 0x120500, fog: 0xff5500, nebula: 0xff3300 },
    { level: 24, name: "Infinity Stellar Abyss",dist: 6900, rivals: 16, baseSpeed: 352, police: false, sky: 0x0c0118, fog: 0xcc00ff, nebula: 0x9900ff },
    { level: 25, name: "Grand Championship Omega Zero-G", dist: 7400, rivals: 18, baseSpeed: 360, police: true, sky: 0x120b01, fog: 0xffd700, nebula: 0xffaa00 }
  ];

  const RIVAL_NAMES = [
    'VIPER-X', 'BLAZE-AG', 'PHANTOM-9', 'APEX-ONE', 'TITAN-MAX', 'SHADOW-RAY', 'RAZOR-7', 'GHOST-ZERO',
    'FURY-MK2', 'CYPHER-V', 'STORM-X', 'VORTEX-PRO', 'COBRA-JET', 'SPECTRE-AG', 'FLASH-ION', 'BOLT-EX',
    'IGNITE-GT', 'KRAKEN-Z', 'ZENITH-STAR', 'NEXUS-PRIME'
  ];

  const RIVAL_COLORS = [
    { color: 0xff0044, hex: '#ff0044', accent: 0xff4477 },
    { color: 0x00f3ff, hex: '#00f3ff', accent: 0x88ffff },
    { color: 0xffaa00, hex: '#ffaa00', accent: 0xffdd55 },
    { color: 0x00ff88, hex: '#00ff88', accent: 0x77ffbb },
    { color: 0xd500f9, hex: '#d500f9', accent: 0xee77ff },
    { color: 0xffffff, hex: '#ffffff', accent: 0x88bbff },
    { color: 0xff4400, hex: '#ff4400', accent: 0xff8833 },
    { color: 0x2979ff, hex: '#2979ff', accent: 0x77aaff }
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
  let targetDistance = 1200;

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
  let wallRideDuration = 0;
  let wallRideCooldown = 0;

  let roadDistance = 0;
  let trafficCars = [];
  let pickups = [];
  let trafficSpawnTimer = 0;
  let pickupSpawnTimer = 0;

  // Track Dimensions (U-Channel Magnetic Bowl)
  const ROAD_WIDTH = 22.0; // 3D units wide
  const ROAD_HALF_WIDTH = ROAD_WIDTH / 2;

  // Player Definition (Anti-Gravity Craft Kinematics)
  const player = {
    u: 0,              // lateral position from -0.92 to +0.92
    speed: 180,        // Supersonic start speed
    minSpeed: 110,
    baseMaxSpeed: 245,
    topSpeed: 330,     // Boosted hyperspeed
    accel: 65,
    brakeDecel: 110,
    turnSpeed: 2.2,
    vu: 0,
    tilt: 0,
    roll: 0,
    pitch: 0,
    hoverY: 0.8,
    hoverPhase: 0,
    nitro: 100,
    isBoosting: false,
    isWallRiding: false,
    alive: true
  };

  const SHIP_TYPES = [
    { type: 'interceptor', width: 2.3, length: 4.8, speedMin: 160, speedMax: 210, color: 0x00f3ff, accent: 0x0066aa },
    { type: 'phantom',     width: 2.2, length: 4.6, speedMin: 180, speedMax: 235, color: 0xe0284f, accent: 0x8a112a },
    { type: 'titan',       width: 2.6, length: 5.4, speedMin: 140, speedMax: 195, color: 0xf7c325, accent: 0x9e7b11 },
    { type: 'plasma',      width: 2.4, length: 5.0, speedMin: 170, speedMax: 225, color: 0x9d32d4, accent: 0x5c197f },
    { type: 'dreadnought', width: 2.8, length: 7.0, speedMin: 130, speedMax: 180, color: 0x52627a, accent: 0x2b3442 },
    { type: 'enforcer',    width: 2.4, length: 4.9, speedMin: 200, speedMax: 260, color: 0x161922, accent: 0xff0033, isPolice: true }
  ];

  const PICKUP_TYPES = [
    { type: 'mult_x2', label: '2x', color: 0xff0077, hex: '#ff0077' },
    { type: 'mult_x3', label: '3x', color: 0x00f3ff, hex: '#00f3ff' },
    { type: 'mult_x5', label: '5x', color: 0xffd700, hex: '#ffd700' },
    { type: 'nitro',   label: '⚡', color: 0x00ff88, hex: '#00ff88' }
  ];

  function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
  function randomRange(min, max) { return Math.random() * (max - min) + min; }

  // 3D Twisting Track Math (Lateral curves, elevation hills/dips & banking)
  function getTrackCurveX(wZ) {
    return Math.sin(wZ * 0.00028) * 36 + Math.sin(wZ * 0.00065) * 16;
  }

  function getTrackElevationY(wZ) {
    return Math.sin(wZ * 0.00035) * 22 + Math.cos(wZ * 0.00085) * 10;
  }

  function getTrackTwist(wZ) {
    const dAhead = 20.0;
    const currentX = getTrackCurveX(wZ);
    const aheadX = getTrackCurveX(wZ + dAhead);
    return ((aheadX - currentX) / dAhead) * 0.42;
  }

  // Cross-Section Calculation for U-Channel Magnetic Wall-Riding
  function getTrackCrossSection(u) {
    const absU = Math.abs(u);
    const sign = u < 0 ? -1 : 1;
    let localX = u * (ROAD_HALF_WIDTH - 1.5);
    let localY = 0;
    let wallRoll = 0;
    let isWallRiding = false;

    if (absU > 0.58) {
      // Climbing the curved vertical magnetic wall
      const wallP = Math.min(1.0, (absU - 0.58) / 0.36);
      localY = Math.pow(wallP, 1.8) * 4.2;
      wallRoll = -sign * Math.pow(wallP, 1.25) * 1.22; // up to ~70 degrees roll bank!
      if (wallP > 0.35) {
        isWallRiding = true;
      }
    }

    return { localX, localY, wallRoll, isWallRiding };
  }

  function getMapCurveOffset(progressRatio) {
    const phase = progressRatio * Math.PI * 2.2;
    return Math.sin(phase) * 6.5 + Math.sin(phase * 1.4) * 3.0;
  }

  // Floating notifications
  function showBanner(text, type = 'banner-nearmiss') {
    const el = document.createElement('div');
    el.className = `banner-item ${type}`;
    el.textContent = text;
    bannerContainer.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 1350);
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
  let playerShip3D = null;
  let roadSegments = [];
  const ROAD_SEGMENT_COUNT = 60;
  const ROAD_SEGMENT_LENGTH = 10.0;
  let finishGantry = null;
  let sparksParticles = null;
  const MAX_SPARKS = 200;
  let sparkPositions, sparkVelocities, sparkLifes;

  // Space Environment & Asteroids
  let starfieldPoints = null;
  let spaceAsteroids = [];
  const ASTEROID_COUNT = 22;
  let speedLinesMesh = null;
  let speedLinePositions = null;
  const SPEED_LINE_COUNT = 150;
  let sunLight = null;
  let playerThrusterLight = null;

  // Camera Management
  const CAMERA_VIEWS = [
    {
      id: 'chase_near',
      name: 'CHASE (DYNAMIC)',
      banner: '🎥 CAM: DYNAMIC AG CHASE',
      getPos: (px, py, isBoosting) => ({ x: px * 0.40, y: py + (isBoosting ? 2.9 : 2.7), z: 5.6 }),
      getLookAt: (px, py) => ({ x: px * 0.70, y: py + 0.9, z: -16 }),
      baseFOV: 65,
      boostFOV: 84,
      showPlayer: true
    },
    {
      id: 'chase_far',
      name: 'SUPERSONIC (FAR)',
      banner: '🎥 CAM: SUPERSONIC AERIAL',
      getPos: (px, py, isBoosting) => ({ x: px * 0.30, y: py + (isBoosting ? 5.2 : 4.8), z: 9.0 }),
      getLookAt: (px, py) => ({ x: px * 0.55, y: py + 0.6, z: -25 }),
      baseFOV: 68,
      boostFOV: 88,
      showPlayer: true
    },
    {
      id: 'cockpit',
      name: 'COCKPIT / NOSE',
      banner: '🎥 CAM: PILOT COCKPIT',
      getPos: (px, py, isBoosting) => ({ x: px, y: py + (isBoosting ? 1.05 : 1.15), z: -2.7 }),
      getLookAt: (px, py) => ({ x: px, y: py + 0.95, z: -35 }),
      baseFOV: 74,
      boostFOV: 92,
      showPlayer: true
    },
    {
      id: 'bumper',
      name: 'BUMPER (TRACK VELOCITY)',
      banner: '🎥 CAM: TRACK SURFACE VELOCITY',
      getPos: (px, py, isBoosting) => ({ x: px, y: py + 0.45, z: -4.4 }),
      getLookAt: (px, py) => ({ x: px, y: py + 0.45, z: -40 }),
      baseFOV: 78,
      boostFOV: 96,
      showPlayer: false
    },
    {
      id: 'topdown',
      name: 'ZERO-G ORBITAL',
      banner: '🎥 CAM: ORBITAL OVERHEAD',
      getPos: (px, py, isBoosting) => ({ x: px * 0.20, y: py + 14.0, z: 2.0 }),
      getLookAt: (px, py) => ({ x: px * 0.50, y: py, z: -18 }),
      baseFOV: 60,
      boostFOV: 75,
      showPlayer: true
    }
  ];

  let currentCamIndex = 0;
  try {
    const savedCam = parseInt(localStorage.getItem('turbo_racer_cam_angle') || '0', 10);
    if (!isNaN(savedCam) && savedCam >= 0 && savedCam < CAMERA_VIEWS.length) {
      currentCamIndex = savedCam;
    }
  } catch (e) {}

  let camLookAtCurrent = new THREE.Vector3(0, 1.15, -16);

  function cycleCameraAngle() {
    currentCamIndex = (currentCamIndex + 1) % CAMERA_VIEWS.length;
    try {
      localStorage.setItem('turbo_racer_cam_angle', currentCamIndex);
    } catch (e) {}
    const cfg = CAMERA_VIEWS[currentCamIndex];
    showBanner(cfg.banner, 'banner-camera');
    triggerHaptic(20);
    if (camBtn) {
      camBtn.classList.add('cam-active');
      setTimeout(() => camBtn.classList.remove('cam-active'), 250);
    }
  }

  // Textures (Magnetic track grid, carbon composites, checkered banner)
  function createMagneticTrackTexture() {
    const cv = document.createElement('canvas');
    cv.width = 256; cv.height = 256;
    const cx = cv.getContext('2d');
    cx.fillStyle = '#0a0d18';
    cx.fillRect(0, 0, 256, 256);

    // Carbon fiber micro-weave
    cx.fillStyle = '#101626';
    for (let y = 0; y < 256; y += 8) {
      for (let x = 0; x < 256; x += 8) {
        if ((x / 8 + y / 8) % 2 === 0) cx.fillRect(x, y, 7, 7);
      }
    }

    // Glowing magnetic center acceleration rail
    cx.fillStyle = 'rgba(0, 243, 255, 0.25)';
    cx.fillRect(116, 0, 24, 256);
    cx.fillStyle = '#00f3ff';
    cx.fillRect(124, 0, 8, 256);

    // Lateral energy pulse nodes
    cx.fillStyle = 'rgba(0, 243, 255, 0.7)';
    for (let y = 16; y < 256; y += 48) {
      cx.fillRect(118, y, 20, 10);
      cx.fillRect(40, y, 8, 6);
      cx.fillRect(208, y, 8, 6);
    }

    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 4);
    return tex;
  }

  function createCheckeredTexture() {
    const cv = document.createElement('canvas');
    cv.width = 128; cv.height = 32;
    const cx = cv.getContext('2d');
    const sq = 16;
    for (let y = 0; y < 32; y += sq) {
      for (let x = 0; x < 128; x += sq) {
        cx.fillStyle = ((x / sq + y / sq) % 2 === 0) ? '#ffffff' : '#05070f';
        cx.fillRect(x, y, sq, sq);
      }
    }
    return new THREE.CanvasTexture(cv);
  }

  const trackMatTex = createMagneticTrackTexture();
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
    cx.fillStyle = 'rgba(4, 8, 20, 0.92)';
    cx.strokeStyle = colorHex;
    cx.lineWidth = 3.5;
    cx.beginPath();
    cx.roundRect(8, 6, w - 16, h - 22, 10);
    cx.fill();
    cx.stroke();

    // Downward target chevron
    cx.fillStyle = colorHex;
    cx.beginPath();
    cx.moveTo(w / 2 - 9, h - 16);
    cx.lineTo(w / 2 + 9, h - 16);
    cx.lineTo(w / 2, h - 5);
    cx.closePath();
    cx.fill();

    cx.font = '900 23px "Orbitron", monospace';
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.fillStyle = '#ffffff';
    cx.fillText(text, w / 2, (h - 22) / 2 + 5);
  }

  // =========================================================================
  //  3D ANTI-GRAVITY HOVERCRAFT CRAFT BUILDER
  // =========================================================================
  function create3DAntiGravShip({ color = 0x00f3ff, accentColor = 0x005577, isPlayer = false, name = 'AG-PILOT', isPolice = false, type = 'interceptor' } = {}) {
    const shipGroup = new THREE.Group();

    // Highly reflective aerodynamic hull
    const hullMat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.18,
      metalness: 0.85
    });

    const darkAlloyMat = new THREE.MeshStandardMaterial({
      color: 0x0f1320,
      roughness: 0.25,
      metalness: 0.9
    });

    const glowNeonMat = new THREE.MeshBasicMaterial({
      color: isPolice ? 0xff0033 : (isPlayer ? 0x00f3ff : color)
    });

    // 1. Aerodynamic Needle Fuselage
    const fuseGeo = new THREE.ConeGeometry(0.75, 4.6, 6);
    fuseGeo.rotateX(-Math.PI / 2);
    fuseGeo.scale(1.4, 0.6, 1.0);
    const fuselage = new THREE.Mesh(fuseGeo, hullMat);
    fuselage.position.set(0, 0.45, -0.4);
    fuselage.castShadow = true;
    fuselage.receiveShadow = true;
    shipGroup.add(fuselage);

    // 2. Cockpit Canopy (Reflective Iridescent Glass)
    const canopyGeo = new THREE.SphereGeometry(0.55, 12, 10);
    canopyGeo.scale(0.85, 0.55, 2.2);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x051833,
      emissive: isPlayer ? 0x00f3ff : 0x005577,
      emissiveIntensity: 0.35,
      roughness: 0.05,
      metalness: 0.95
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 0.72, -0.45);
    canopy.castShadow = true;
    shipGroup.add(canopy);

    // 3. Swept-Back Forward-Canted Anti-Gravity Wings
    const wingGeo = new THREE.BoxGeometry(3.6, 0.12, 1.8);
    const leftWing = new THREE.Mesh(wingGeo, hullMat);
    leftWing.position.set(0, 0.42, 0.4);
    leftWing.rotation.x = 0.08;
    leftWing.castShadow = true;
    leftWing.receiveShadow = true;
    shipGroup.add(leftWing);

    // Wingtip Vertical Stabilizer Fins (Banked)
    const finGeo = new THREE.BoxGeometry(0.12, 0.75, 1.4);
    const lFin = new THREE.Mesh(finGeo, darkAlloyMat);
    lFin.position.set(-1.8, 0.72, 0.5);
    lFin.rotation.z = -0.25;
    lFin.castShadow = true;
    shipGroup.add(lFin);

    const rFin = new THREE.Mesh(finGeo, darkAlloyMat);
    rFin.position.set(1.8, 0.72, 0.5);
    rFin.rotation.z = 0.25;
    rFin.castShadow = true;
    shipGroup.add(rFin);

    // Neon Wingtip Vortex Light Strips
    const tipStripGeo = new THREE.BoxGeometry(0.06, 0.1, 1.5);
    const lStrip = new THREE.Mesh(tipStripGeo, glowNeonMat);
    lStrip.position.set(-1.86, 0.82, 0.5);
    shipGroup.add(lStrip);

    const rStrip = new THREE.Mesh(tipStripGeo, glowNeonMat);
    rStrip.position.set(1.86, 0.82, 0.5);
    shipGroup.add(rStrip);

    // 4. Twin High-Output Ion Plasma Thrusters
    const thrusterGeo = new THREE.CylinderGeometry(0.32, 0.40, 1.6, 12);
    thrusterGeo.rotateX(Math.PI / 2);
    const tL = new THREE.Mesh(thrusterGeo, darkAlloyMat);
    tL.position.set(-0.62, 0.45, 1.4);
    tL.castShadow = true;
    shipGroup.add(tL);

    const tR = new THREE.Mesh(thrusterGeo, darkAlloyMat);
    tR.position.set(0.62, 0.45, 1.4);
    tR.castShadow = true;
    shipGroup.add(tR);

    // Thruster Glowing Exhaust Nozzle Rings
    const ringGeo = new THREE.TorusGeometry(0.35, 0.08, 8, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const rL = new THREE.Mesh(ringGeo, ringMat);
    rL.position.set(-0.62, 0.45, 2.22);
    shipGroup.add(rL);

    const rR = new THREE.Mesh(ringGeo, ringMat);
    rR.position.set(0.62, 0.45, 2.22);
    shipGroup.add(rR);

    // 5. Plasma Jet Flame Plumes (Animated)
    const nitroFlames = [];
    const flameGeo = new THREE.ConeGeometry(0.28, 2.2, 10);
    flameGeo.rotateX(-Math.PI / 2);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.92
    });

    const fL = new THREE.Mesh(flameGeo, flameMat);
    fL.position.set(-0.62, 0.45, 3.2);
    fL.visible = false;
    shipGroup.add(fL);
    nitroFlames.push(fL);

    const fR = new THREE.Mesh(flameGeo, flameMat);
    fR.position.set(0.62, 0.45, 3.2);
    fR.visible = false;
    shipGroup.add(fR);
    nitroFlames.push(fR);

    // Standard cruise plasma plumes (smaller constant glow)
    const cruiseGeo = new THREE.ConeGeometry(0.20, 1.2, 8);
    cruiseGeo.rotateX(-Math.PI / 2);
    const cruiseMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.75 });
    const cL = new THREE.Mesh(cruiseGeo, cruiseMat);
    cL.position.set(-0.62, 0.45, 2.6);
    shipGroup.add(cL);
    const cR = new THREE.Mesh(cruiseGeo, cruiseMat);
    cR.position.set(0.62, 0.45, 2.6);
    shipGroup.add(cR);

    // 6. Anti-Gravity Magnetic Repulsion Emitters (Underglow)
    const underMat = new THREE.MeshBasicMaterial({
      color: isPlayer ? 0x00f3ff : color,
      transparent: true,
      opacity: 0.55
    });
    const repulsorGeo = new THREE.RingGeometry(0.3, 0.9, 16);
    repulsorGeo.rotateX(-Math.PI / 2);
    const repL = new THREE.Mesh(repulsorGeo, underMat);
    repL.position.set(-0.85, 0.08, 0.2);
    shipGroup.add(repL);

    const repR = new THREE.Mesh(repulsorGeo, underMat);
    repR.position.set(0.85, 0.08, 0.2);
    shipGroup.add(repR);

    // 7. Police Siren Holo-Beacon
    let sirenMesh = null;
    if (isPolice) {
      const sGeo = new THREE.BoxGeometry(0.7, 0.15, 0.25);
      const sMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
      sirenMesh = new THREE.Mesh(sGeo, sMat);
      sirenMesh.position.set(0, 1.15, 0.2);
      shipGroup.add(sirenMesh);
    }

    // 8. 3D Floating Nameplate
    const nameHex = isPlayer ? '#00f3ff' : ('#' + new THREE.Color(color).getHexString());
    const nameplate = createNameplateSprite(name, nameHex);
    nameplate.position.set(0, 2.3, 0);
    shipGroup.add(nameplate);

    return {
      group: shipGroup,
      nitroFlames,
      cruiseFlames: [cL, cR],
      repulsors: [repL, repR],
      sirenMesh,
      nameplateSprite: nameplate,
      height: 1.4,
      length: 4.8
    };
  }

  // 3D Collectible Quantum Core Builder
  function create3DPickupMesh(type, colorHex) {
    const group = new THREE.Group();
    const geo = new THREE.OctahedronGeometry(0.85, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.85,
      roughness: 0.1,
      metalness: 0.9
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 1.0;
    mesh.castShadow = true;
    group.add(mesh);

    // Outer quantum orbital rings
    const haloGeo = new THREE.TorusGeometry(1.2, 0.06, 8, 24);
    const haloMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.75 });
    const halo1 = new THREE.Mesh(haloGeo, haloMat);
    halo1.position.y = 1.0;
    group.add(halo1);

    const halo2 = new THREE.Mesh(haloGeo, haloMat);
    halo2.position.y = 1.0;
    halo2.rotation.x = Math.PI / 2.5;
    group.add(halo2);

    return { group, gem: mesh, halo1, halo2 };
  }

  // Spark Particle System for 3D Impacts & Wall-Riding
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
      color: 0x00f3ff,
      size: 0.55,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    sparksParticles = new THREE.Points(geo, mat);
    scene.add(sparksParticles);
  }

  function spawn3DSparks(x, y, z, count = 25, colorHex = 0x00f3ff) {
    if (!sparksParticles) return;
    let spawned = 0;
    for (let i = 0; i < MAX_SPARKS && spawned < count; i++) {
      if (sparkLifes[i] <= 0) {
        sparkPositions[i * 3] = x;
        sparkPositions[i * 3 + 1] = y;
        sparkPositions[i * 3 + 2] = z;
        sparkVelocities[i].set(
          randomRange(-10, 10),
          randomRange(4, 15),
          randomRange(-10, 10)
        );
        sparkLifes[i] = randomRange(0.3, 0.75);
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
        sparkVelocities[i].y -= 18.0 * dt; // low zero-g gravity
        anyActive = true;
      } else {
        sparkPositions[i * 3 + 1] = -999;
      }
    }
    if (anyActive) {
      sparksParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  // =========================================================================
  //  DEEP SPACE ENVIRONMENT, ASTEROIDS & SPEED LINES
  // =========================================================================
  function initStarfield() {
    const starCount = 2000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const rad = randomRange(250, 750);
      starPos[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = rad * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.6,
      transparent: true,
      opacity: 0.95
    });
    starfieldPoints = new THREE.Points(starGeo, starMat);
    scene.add(starfieldPoints);
  }

  function createAsteroidMesh() {
    const radius = randomRange(6.0, 16.0);
    const geo = new THREE.DodecahedronGeometry(radius, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const noise = 1 + (Math.sin(vx * 0.8) * Math.cos(vy * 0.8) * 0.28);
      pos.setXYZ(i, vx * noise, vy * noise, vz * noise);
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: 0x1d2230,
      roughness: 0.9,
      metalness: 0.25,
      flatShading: true
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  function initAsteroidField() {
    for (let i = 0; i < ASTEROID_COUNT; i++) {
      const mesh = createAsteroidMesh();
      const isLeft = i % 2 === 0;
      const distFromTrack = randomRange(35, 95);
      mesh.position.set(
        isLeft ? -distFromTrack : distFromTrack,
        randomRange(-25, 45),
        -i * 32
      );
      mesh.userData = {
        rotSpeedX: randomRange(-0.25, 0.25),
        rotSpeedY: randomRange(-0.35, 0.35),
        baseZ: -i * 32,
        distFromTrack,
        isLeft
      };
      scene.add(mesh);
      spaceAsteroids.push(mesh);
    }
  }

  function initSpeedLines() {
    const geo = new THREE.BufferGeometry();
    speedLinePositions = new Float32Array(SPEED_LINE_COUNT * 6);
    for (let i = 0; i < SPEED_LINE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rad = randomRange(3.0, 16.0);
      const z = -randomRange(4, 70);
      const x = Math.cos(angle) * rad;
      const y = Math.sin(angle) * rad + 1.5;
      speedLinePositions[i * 6] = x;
      speedLinePositions[i * 6 + 1] = y;
      speedLinePositions[i * 6 + 2] = z;
      speedLinePositions[i * 6 + 3] = x;
      speedLinePositions[i * 6 + 4] = y;
      speedLinePositions[i * 6 + 5] = z - randomRange(3.5, 9.0);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(speedLinePositions, 3));
    const mat = new THREE.LineBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });
    speedLinesMesh = new THREE.LineSegments(geo, mat);
    scene.add(speedLinesMesh);
  }

  // =========================================================================
  //  BUILD U-CHANNEL MAGNETIC TRACK WITH BANKED WALLS
  // =========================================================================
  function buildRoadAndScenery() {
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111624,
      map: trackMatTex,
      roughness: 0.18,
      metalness: 0.85
    });

    const wallMatL = new THREE.MeshStandardMaterial({
      color: 0x0b0f1a,
      roughness: 0.22,
      metalness: 0.88
    });
    const wallMatR = new THREE.MeshStandardMaterial({
      color: 0x0b0f1a,
      roughness: 0.22,
      metalness: 0.88
    });

    const neonRailMatL = new THREE.MeshBasicMaterial({ color: 0xff0066 });
    const neonRailMatR = new THREE.MeshBasicMaterial({ color: 0x00f3ff });

    for (let i = 0; i < ROAD_SEGMENT_COUNT; i++) {
      const segGroup = new THREE.Group();

      // 1. Central Metallic Magnetic Floor
      const floorGeo = new THREE.BoxGeometry(15.0, 0.35, ROAD_SEGMENT_LENGTH + 0.35);
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.receiveShadow = true;
      segGroup.add(floorMesh);

      // Center Magnetic Power Spine
      const spineGeo = new THREE.BoxGeometry(1.2, 0.42, ROAD_SEGMENT_LENGTH + 0.35);
      const spineMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
      const spineMesh = new THREE.Mesh(spineGeo, spineMat);
      segGroup.add(spineMesh);

      // 2. Curved Banked Left Magnetic Wall (Rises from flat to 4.2m up at 75 deg bank)
      const wallGeo = new THREE.BoxGeometry(4.8, 0.35, ROAD_SEGMENT_LENGTH + 0.35);
      const leftWall = new THREE.Mesh(wallGeo, wallMatL);
      leftWall.position.set(-9.2, 1.8, 0);
      leftWall.rotation.z = -Math.PI / 3.8;
      leftWall.receiveShadow = true;
      segGroup.add(leftWall);

      // Left Neon Magnetic Edge Conduit
      const railGeo = new THREE.BoxGeometry(0.35, 0.55, ROAD_SEGMENT_LENGTH + 0.35);
      const leftRail = new THREE.Mesh(railGeo, neonRailMatL);
      leftRail.position.set(-11.2, 3.6, 0);
      segGroup.add(leftRail);

      // 3. Curved Banked Right Magnetic Wall
      const rightWall = new THREE.Mesh(wallGeo, wallMatR);
      rightWall.position.set(9.2, 1.8, 0);
      rightWall.rotation.z = Math.PI / 3.8;
      rightWall.receiveShadow = true;
      segGroup.add(rightWall);

      // Right Neon Magnetic Edge Conduit
      const rightRail = new THREE.Mesh(railGeo, neonRailMatR);
      rightRail.position.set(11.2, 3.6, 0);
      segGroup.add(rightRail);

      // 4. Overhead Quantum Booster Pylons (Every 6 segments)
      if (i % 6 === 0) {
        const ringGroup = new THREE.Group();
        const archMat = new THREE.MeshStandardMaterial({
          color: 0x161c2d,
          emissive: 0x00f3ff,
          emissiveIntensity: 0.4,
          metalness: 0.9,
          roughness: 0.15
        });
        const archGeo = new THREE.TorusGeometry(ROAD_HALF_WIDTH + 1.2, 0.45, 8, 20, Math.PI);
        const archMesh = new THREE.Mesh(archGeo, archMat);
        archMesh.position.set(0, 0, 0);
        ringGroup.add(archMesh);
        segGroup.add(ringGroup);
      }

      scene.add(segGroup);
      roadSegments.push({
        group: segGroup,
        baseZ: -i * ROAD_SEGMENT_LENGTH
      });
    }

    // 3D Finish Line Quantum Gate
    finishGantry = new THREE.Group();
    const finishLineGeo = new THREE.PlaneGeometry(ROAD_WIDTH, 4.0);
    finishLineGeo.rotateX(-Math.PI / 2);
    const finishLineMat = new THREE.MeshBasicMaterial({ map: checkeredTex });
    const finishLineMesh = new THREE.Mesh(finishLineGeo, finishLineMat);
    finishLineMesh.position.set(0, 0.25, 0);
    finishGantry.add(finishLineMesh);

    // Glowing finish gate pylons
    const pylonMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 1.0 });
    const pylonGeo = new THREE.CylinderGeometry(0.5, 0.7, 5.0, 12);
    const p1 = new THREE.Mesh(pylonGeo, pylonMat);
    p1.position.set(-ROAD_HALF_WIDTH - 1.2, 2.5, 0);
    finishGantry.add(p1);

    const p2 = new THREE.Mesh(pylonGeo, pylonMat);
    p2.position.set(ROAD_HALF_WIDTH + 1.2, 2.5, 0);
    finishGantry.add(p2);

    scene.add(finishGantry);
  }

  // =========================================================================
  //  THREE.JS INITIALIZATION WITH DYNAMIC LIGHTING & SHADOWS
  // =========================================================================
  function init3D() {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(480, 720, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Enable Dynamic Soft Shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020309);
    scene.fog = new THREE.FogExp2(0x020309, 0.0028);

    camera = new THREE.PerspectiveCamera(65, 480 / 720, 0.5, 950);
    camera.position.set(0, 3.2, 7.5);

    // Dynamic Cosmic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    sunLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    sunLight.position.set(35, 65, -45);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 1.0;
    sunLight.shadow.camera.far = 140;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    sunLight.shadow.bias = -0.0006;
    scene.add(sunLight);

    // Player Dynamic Thruster PointLight
    playerThrusterLight = new THREE.PointLight(0x00f3ff, 2.5, 22);
    playerThrusterLight.position.set(0, 1.2, 2.5);
    scene.add(playerThrusterLight);

    // Build Cosmic Environment
    initStarfield();
    initAsteroidField();
    initSpeedLines();
    buildRoadAndScenery();
    initSparks();

    // Player Anti-Gravity Ship 3D
    playerShip3D = create3DAntiGravShip({
      color: 0x00f3ff,
      accentColor: 0x0066aa,
      isPlayer: true,
      name: playerCarName,
      type: 'interceptor'
    });
    scene.add(playerShip3D.group);
  }

  // =========================================================================
  //  GAME LOGIC & RESET
  // =========================================================================
  function spawnRivals(cfg) {
    for (const r of rivalCars) {
      if (r.model3D) scene.remove(r.model3D.group);
    }
    rivalCars = [];

    const count = Math.min(cfg.rivals, RIVAL_NAMES.length);
    for (let i = 0; i < count; i++) {
      const col = RIVAL_COLORS[i % RIVAL_COLORS.length];
      const isPolice = cfg.police && i === count - 1;
      const initialU = randomRange(-0.84, 0.84);
      const leadDist = 30 + i * (cfg.dist * 0.74 / Math.max(1, count));
      const rName = isPolice ? 'COP ' + RIVAL_NAMES[i % RIVAL_NAMES.length] : RIVAL_NAMES[i % RIVAL_NAMES.length];

      const model = create3DAntiGravShip({
        color: isPolice ? 0x161922 : col.color,
        accentColor: isPolice ? 0xff0033 : col.accent,
        isPlayer: false,
        name: rName,
        isPolice: isPolice,
        type: isPolice ? 'enforcer' : (i % 3 === 0 ? 'phantom' : 'interceptor')
      });
      scene.add(model.group);

      rivalCars.push({
        id: i,
        name: rName,
        color: col.hex,
        speed: randomRange(cfg.baseSpeed * 0.92, cfg.baseSpeed * 1.05),
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
    wallRideDuration = 0;
    wallRideCooldown = 0;

    for (const c of trafficCars) { if (c.model3D) scene.remove(c.model3D.group); }
    trafficCars = [];
    for (const p of pickups) { if (p.model3D) scene.remove(p.model3D.group); }
    pickups = [];

    screenShake = 0;
    roadDistance = 0;
    raceTime = 0;
    overtakeCount = 0;

    player.u = 0;
    player.speed = 180;
    player.nitro = 100;
    player.vu = 0;
    player.tilt = 0;
    player.roll = 0;
    player.pitch = 0;
    player.alive = true;
    player.isBoosting = false;
    player.isWallRiding = false;

    trafficSpawnTimer = 1.2;
    pickupSpawnTimer = 3.5;

    // Stage theme setup
    const cfg = LEVEL_CONFIGS[currentLevel - 1];
    targetDistance = cfg.dist;
    player.baseMaxSpeed = cfg.baseSpeed + 45;
    player.topSpeed = cfg.baseSpeed + 110;
    scene.background.setHex(cfg.sky);
    scene.fog.color.setHex(cfg.sky);

    spawnRivals(cfg);
    prevPlayerRank = totalRacers;

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
    const template = SHIP_TYPES[Math.floor(Math.random() * SHIP_TYPES.length)];
    const carSpeed = randomRange(template.speedMin, template.speedMax);

    const model = create3DAntiGravShip({
      color: template.color,
      accentColor: template.accent,
      isPlayer: false,
      name: template.type.toUpperCase(),
      isPolice: !!template.isPolice,
      type: template.type
    });
    scene.add(model.group);

    trafficCars.push({
      u: targetU,
      targetU: targetU,
      driftTimer: randomRange(2.5, 5.5),
      worldZ: roadDistance + 240,
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
      worldZ: roadDistance + 220,
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
    if (e.code === 'KeyC' || e.code === 'KeyV') {
      cycleCameraAngle();
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
      finishBadge.textContent = playerRank === 1 ? '🏆 1ST PLACE CHAMPION!' :
                                playerRank <= 3 ? `🥈 ${posStr} PLACE PODIUM!` :
                                `P${playerRank} - CIRCUIT COMPLETED`;
      finishBadge.className = 'finish-badge ' + (playerRank === 1 ? 'winner' : playerRank <= 3 ? 'podium' : 'dnq');
    }
    if (levelCompleteTitle) levelCompleteTitle.textContent = `LEVEL ${currentLevel} CLEARED!`;
    if (levelCompleteSub) levelCompleteSub.textContent = playerRank <= 3 ? '✅ YOU QUALIFIED FOR NEXT STAGE!' : '❌ TOP 3 REQUIRED TO UNLOCK NEXT';
    if (finishCarName) finishCarName.textContent = playerCarName || 'PHANTOM AG-1';
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

  function gameOver() {
    currentState = STATE.GAMEOVER;
    player.alive = false;
    if (sound) { sound.stopEngine(); sound.playCrash(); }
    triggerHaptic([100, 50, 150]);
    screenShake = 22;

    if (score > highScore) {
      highScore = score;
      try { localStorage.setItem('turbo_racer_high_score', highScore.toString()); } catch (e) {}
      if (newHighBadge) newHighBadge.classList.remove('hidden');
    } else {
      if (newHighBadge) newHighBadge.classList.add('hidden');
    }

    finalScore.textContent = Math.floor(score).toLocaleString();
    finalMaxMult.textContent = `x${maxMultiplierAchieved.toFixed(1)}`;
    finalNearMisses.textContent = nearMissCount;
    finalTopSpeed.textContent = `${Math.floor(topSpeedAchieved)} km/h`;

    hud.classList.add('hidden');
    if (raceProgressBar) raceProgressBar.classList.add('hidden');
    if (minimapWrapper) minimapWrapper.classList.add('hidden');

    setTimeout(() => {
      gameoverOverlay.classList.remove('hidden');
      gameoverOverlay.classList.add('active');
    }, 350);
  }

  function startGame() {
    startOverlay.classList.remove('active');
    startOverlay.classList.add('hidden');
    gameoverOverlay.classList.remove('active');
    gameoverOverlay.classList.add('hidden');
    levelcompleteOverlay.classList.remove('active');
    levelcompleteOverlay.classList.add('hidden');

    resetGame();

    currentState = STATE.COUNTDOWN;
    countdownOverlay.classList.remove('hidden');
    countdownOverlay.style.display = 'flex';

    let count = 3;
    countdownText.textContent = count;
    countdownText.className = 'countdown-number';
    if (sound && sound.playCountdown) sound.playCountdown(false);

    const countInterval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownText.textContent = count;
        countdownText.className = 'countdown-number';
        if (sound && sound.playCountdown) sound.playCountdown(false);
      } else if (count === 0) {
        countdownText.textContent = 'GO!';
        countdownText.className = 'countdown-number go';
        if (sound && sound.playCountdown) sound.playCountdown(true);
      } else {
        clearInterval(countInterval);
        countdownOverlay.classList.add('hidden');
        countdownOverlay.style.display = 'none';
        countdownText.textContent = '';
        currentState = STATE.PLAYING;
        hud.classList.remove('hidden');
        if (raceProgressBar) raceProgressBar.classList.remove('hidden');
        if (minimapWrapper) minimapWrapper.classList.remove('hidden');
        if (sound) sound.startEngine();
      }
    }, 750);
  }

  function pauseGame() {
    if (currentState !== STATE.PLAYING) return;
    currentState = STATE.PAUSED;
    if (sound) sound.stopEngine();
    pauseOverlay.classList.remove('hidden');
    pauseOverlay.classList.add('active');
  }

  function resumeGame() {
    if (currentState !== STATE.PAUSED) return;
    currentState = STATE.PLAYING;
    if (sound) sound.startEngine();
    pauseOverlay.classList.remove('active');
    pauseOverlay.classList.add('hidden');
  }

  function returnToMenu() {
    currentState = STATE.MENU;
    if (sound) sound.stopEngine();

    pauseOverlay.classList.remove('active');
    pauseOverlay.classList.add('hidden');
    gameoverOverlay.classList.remove('active');
    gameoverOverlay.classList.add('hidden');
    levelcompleteOverlay.classList.remove('active');
    levelcompleteOverlay.classList.add('hidden');
    levelselectOverlay.classList.remove('active');
    levelselectOverlay.classList.add('hidden');

    hud.classList.add('hidden');
    if (raceProgressBar) raceProgressBar.classList.add('hidden');
    if (minimapWrapper) minimapWrapper.classList.add('hidden');

    menuHighScore.textContent = highScore.toLocaleString();
    updateMenuLevelDisplay();

    startOverlay.classList.remove('hidden');
    startOverlay.classList.add('active');
  }

  // Level Select UI
  function updateMenuLevelDisplay() {
    const cfg = LEVEL_CONFIGS[currentLevel - 1];
    if (menuCurrentLevel) menuCurrentLevel.textContent = currentLevel;
    if (menuLevelName) menuLevelName.textContent = cfg.name;
  }

  function openLevelSelect() {
    renderLevelGrid();
    levelselectOverlay.classList.remove('hidden');
    levelselectOverlay.classList.add('active');
  }

  function closeLevelSelect() {
    levelselectOverlay.classList.remove('active');
    levelselectOverlay.classList.add('hidden');
  }

  function selectLevel(lvl) {
    if (lvl > unlockedLevel) return;
    currentLevel = lvl;
    try { localStorage.setItem('turbo_racer_current_level', currentLevel); } catch (e) {}
    updateMenuLevelDisplay();
    closeLevelSelect();
    if (currentState === STATE.PAUSED) {
      startGame();
    }
  }

  function renderLevelGrid() {
    if (!levelsGrid) return;
    levelsGrid.innerHTML = '';
    LEVEL_CONFIGS.forEach((cfg) => {
      const tile = document.createElement('div');
      const isUnlocked = cfg.level <= unlockedLevel;
      const isActive = cfg.level === currentLevel;
      const isCleared = cfg.level < unlockedLevel;

      tile.className = `level-tile ${isUnlocked ? 'unlocked' : 'locked'} ${isActive ? 'active-level' : ''} ${isCleared ? 'cleared' : ''}`;
      tile.innerHTML = `
        <span class="tile-num">${cfg.level}</span>
        <span class="tile-icon">${isCleared ? '⭐' : (isUnlocked ? '🏎️' : '🔒')}</span>
      `;
      if (isUnlocked) {
        tile.addEventListener('click', () => {
          triggerHaptic(15);
          selectLevel(cfg.level);
        });
      }
      levelsGrid.appendChild(tile);
    });
  }

  // Button Listeners
  startBtn.addEventListener('click', () => { sound.init(); triggerHaptic(20); startGame(); });
  restartBtn.addEventListener('click', () => { sound.init(); triggerHaptic(20); startGame(); });
  retryRaceBtn.addEventListener('click', () => { sound.init(); triggerHaptic(20); startGame(); });
  if (nextLevelBtn) {
    nextLevelBtn.addEventListener('click', () => {
      if (currentLevel < MAX_LEVELS) {
        currentLevel++;
        try { localStorage.setItem('turbo_racer_current_level', currentLevel); } catch (e) {}
        updateMenuLevelDisplay();
        sound.init(); triggerHaptic(20); startGame();
      }
    });
  }
  resumeBtn.addEventListener('click', () => { triggerHaptic(15); resumeGame(); });
  menuBtn.addEventListener('click', () => { triggerHaptic(15); returnToMenu(); });
  muteBtn.addEventListener('click', () => {
    triggerHaptic(15);
    const isMuted = sound.toggleMute();
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
  });
  pauseBtn.addEventListener('click', () => { triggerHaptic(15); pauseGame(); });
  if (camBtn) {
    camBtn.addEventListener('click', () => { triggerHaptic(20); cycleCameraAngle(); });
  }

  if (levelSelectBtn) levelSelectBtn.addEventListener('click', openLevelSelect);
  if (levelSelectBtn2) levelSelectBtn2.addEventListener('click', openLevelSelect);
  if (pauseLevelSelectBtn) pauseLevelSelectBtn.addEventListener('click', openLevelSelect);
  if (closeLevelselectBtn) closeLevelselectBtn.addEventListener('click', closeLevelSelect);

  updateMenuLevelDisplay();

  function updateMultiplier(dt) {
    if (multiplier > 1.0) {
      comboTimer -= dt;
      const fillPct = Math.max(0, (comboTimer / COMBO_MAX_TIME) * 100);
      comboBarFill.style.width = `${fillPct}%`;
      if (comboTimer <= 0) {
        multiplier = 1.0;
        comboBarFill.style.width = '0%';
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

    // Hyper Nitro boost
    if (wantsNitro && player.nitro > 0 && player.speed > 130) {
      player.isBoosting = true;
      player.nitro = Math.max(0, player.nitro - 28 * dt);
      player.speed += (player.accel * 2.8) * dt;
      if (Math.random() < 0.28 && sound) sound.playNitro();
      screenShake = Math.max(screenShake, 4);
    } else {
      player.isBoosting = false;
      player.nitro = Math.min(100, player.nitro + 6.0 * dt);
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

    // Steering Physics (Responsive Zero-G lateral thrusters)
    const speedFactor = clamp(player.speed / 200, 0.75, 1.25);
    let targetVu = 0;
    if (isLeft) targetVu = -player.turnSpeed * speedFactor;
    if (isRight) targetVu = player.turnSpeed * speedFactor;

    player.vu += (targetVu - player.vu) * 7.5 * dt;
    player.u += player.vu * dt;
    player.u = clamp(player.u, -0.94, 0.94);

    // Wall-Riding Mechanics Check
    const trackSec = getTrackCrossSection(player.u);
    player.isWallRiding = trackSec.isWallRiding;

    if (player.isWallRiding) {
      wallRideDuration += dt;
      wallRideCooldown -= dt;

      // Magnetic wall sparks
      const sign = player.u < 0 ? -1 : 1;
      const sparkX = trackSec.localX + sign * 0.4;
      const sparkY = trackSec.localY + 0.3;
      spawn3DSparks(sparkX, sparkY, -2, 8, 0x00ff88);

      // Score and Multiplier Boost from Magnetic Wall Grip
      score += (player.speed * 0.08 * multiplier) * dt;
      boostMultiplier(0.35 * dt, 'WALL RIDE');

      if (wallRideCooldown <= 0) {
        showBanner('⚡ MAGNETIC WALL RIDE BOOST! ⚡', 'banner-wallride');
        triggerHaptic(25);
        if (sound && sound.playWallRide) sound.playWallRide();
        wallRideCooldown = 1.2;
      }
    } else {
      wallRideDuration = 0;
      wallRideCooldown = 0;
    }

    // Smooth Anti-Grav Hover Bobbing & Bank Roll
    player.hoverPhase += dt * (player.isBoosting ? 12.0 : 8.0);
    const targetRoll = (player.vu / player.turnSpeed) * 0.35 + trackSec.wallRoll;
    player.roll += (targetRoll - player.roll) * 8.5 * dt;

    player.speed = clamp(player.speed, player.minSpeed, currentMaxSpeed);
    if (sound) sound.updateEngine(player.speed / player.topSpeed);

    // Advance world distance along twisting track
    const worldSpeed = player.speed * WORLD_SPEED_FACTOR;
    roadDistance += worldSpeed * dt;

    // Scoring
    let speedBonusMult = player.speed > 250 ? 1.5 : 1.0;
    score += (player.speed * 0.028 * multiplier * speedBonusMult) * dt;
    updateMultiplier(dt);

    // Spawners
    trafficSpawnTimer -= dt;
    if (trafficSpawnTimer <= 0) {
      spawnTraffic();
      const minSpawn = Math.max(0.6, 1.8 - (score / 3500));
      trafficSpawnTimer = randomRange(minSpawn, minSpawn + 0.9);
    }

    pickupSpawnTimer -= dt;
    if (pickupSpawnTimer <= 0) {
      spawnPickup();
      pickupSpawnTimer = randomRange(3.5, 6.0);
    }

    // Update Traffic Anti-Grav Craft
    const playerX = trackSec.localX;
    const playerY = trackSec.localY + player.hoverY;

    for (let i = trafficCars.length - 1; i >= 0; i--) {
      const car = trafficCars[i];
      car.worldZ += (car.speed - player.speed) * WORLD_SPEED_FACTOR * dt;

      // Weaving in magnetic channel
      car.driftTimer -= dt;
      if (car.driftTimer <= 0) {
        car.targetU = randomRange(-0.82, 0.82);
        car.driftTimer = randomRange(2.5, 5.5);
      }
      car.u += (car.targetU - car.u) * 1.2 * dt;
      car.u = clamp(car.u, -0.92, 0.92);

      if (car.isPolice) car.sirenTimer += dt * 8;

      const relZ = car.worldZ - roadDistance;
      const cSec = getTrackCrossSection(car.u);
      const carX = cSec.localX;
      const carY = cSec.localY + 0.8;

      // Collision Check
      const dz = Math.abs(relZ);
      const dx = Math.abs(carX - playerX);
      const dy = Math.abs(carY - playerY);

      if (dz < 4.0 && dx < 2.2 && dy < 1.8) {
        spawn3DSparks(playerX, playerY, -2, 45, 0xff0044);
        gameOver();
        return;
      }

      // Near-Miss Check
      if (dz < 5.2 && dx >= 2.2 && dx <= 4.2 && !car.hasNearMissed && player.speed > 140) {
        car.hasNearMissed = true;
        nearMissCount++;
        const baseBonus = 60;
        const totalBonus = Math.floor(baseBonus * multiplier);
        score += totalBonus;
        boostMultiplier(0.5, 'NEAR MISS');
        if (sound) sound.playNearMiss(Math.floor(multiplier));
        triggerHaptic(30);
        spawn3DSparks(carX, carY, -2 - relZ, 20, 0x00f3ff);
        screenShake = 5;
        showBanner(`⚡ QUANTUM NEAR MISS! +${totalBonus} (x${multiplier.toFixed(1)})`, 'banner-nearmiss');
      }

      // Despawn
      if (relZ < -60 || relZ > 450) {
        if (car.model3D) scene.remove(car.model3D.group);
        trafficCars.splice(i, 1);
      }
    }

    // Update Pickups
    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i];
      p.pulse += dt * 5.0;
      const relZ = p.worldZ - roadDistance;
      const pSec = getTrackCrossSection(p.u);
      const pX = pSec.localX;
      const pY = pSec.localY + 1.0;

      const dz = Math.abs(relZ);
      const dx = Math.abs(pX - playerX);

      if (dz < 3.8 && dx < 2.4) {
        if (sound) sound.playPickup();
        triggerHaptic([25, 35, 30]);
        spawn3DSparks(pX, pY, -2, 30, p.colorHex);

        if (p.type === 'mult_x2') {
          boostMultiplier(2.0, '2X CORE');
          const bonusPts = Math.floor(80 * multiplier);
          score += bonusPts;
          showBanner(`💎 2x QUANTUM MULTIPLIER! +${bonusPts}`, 'banner-multiplier');
        } else if (p.type === 'mult_x3') {
          boostMultiplier(3.0, '3X CORE');
          const bonusPts = Math.floor(150 * multiplier);
          score += bonusPts;
          showBanner(`⭐ 3x PLASMA MULTIPLIER! +${bonusPts}`, 'banner-multiplier');
        } else if (p.type === 'mult_x5') {
          boostMultiplier(5.0, '5X CORE');
          const bonusPts = Math.floor(350 * multiplier);
          score += bonusPts;
          showBanner(`👑 5x HYPERDRIVE CORE! +${bonusPts}`, 'banner-multiplier');
        } else if (p.type === 'nitro') {
          player.nitro = Math.min(100, player.nitro + 65);
          showBanner(`⚡ HYPER-NITRO REFILLED!`, 'banner-nearmiss');
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

    // Update Rival Racing Craft
    raceTime += dt;
    for (const rival of rivalCars) {
      rival.distanceTravelled += rival.speed * WORLD_SPEED_FACTOR * dt;
      if (rival.isPolice) rival.sirenTimer += dt * 8;

      rival.laneTimer -= dt;
      if (rival.laneTimer <= 0) {
        rival.targetU = randomRange(-0.88, 0.88);
        rival.laneTimer = randomRange(2.0, 4.5);
      }
      rival.u += (rival.targetU - rival.u) * 1.1 * dt;
      rival.u = clamp(rival.u, -0.92, 0.92);

      const relDist = rival.distanceTravelled - roadDistance;

      // Overtake Detection
      if (relDist <= 0 && !rival.overtakenByPlayer) {
        rival.overtakenByPlayer = true;
        overtakeCount++;
        if (sound && sound.playOvertake) sound.playOvertake();
        triggerHaptic([25, 20, 35]);
        showBanner(`🚀 OVERTOOK ${rival.name}!`, 'banner-nearmiss');
      }

      // Bump interaction
      if (Math.abs(relDist) < 3.6) {
        const rSec = getTrackCrossSection(rival.u);
        const rX = rSec.localX;
        const dx = Math.abs(rX - playerX);
        if (dx < 2.2) {
          player.speed = Math.max(player.minSpeed, player.speed - 25);
          rival.speed += 18;
          screenShake = Math.max(screenShake, 7);
          triggerHaptic(30);
          spawn3DSparks(rX, rSec.localY + 0.8, -2, 22, 0xffaa00);
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
      screenShake -= 24 * dt;
      if (screenShake < 0) screenShake = 0;
    }

    update3DSparks(dt);
    updateUI();
  }

  // =========================================================================
  //  3D RENDER LOOP: TWISTING TRACK, SHADOWS, CINEMATIC CAMERA & SPEED LINES
  // =========================================================================
  function render3D(dt = 0.016) {
    const totalRoadLength = ROAD_SEGMENT_COUNT * ROAD_SEGMENT_LENGTH;
    const currentCurve = getTrackCurveX(roadDistance);
    const currentElev = getTrackElevationY(roadDistance);
    const currentTwist = getTrackTwist(roadDistance);

    // 1. Update Twisting Track Segments in 3D Space
    roadSegments.forEach((seg) => {
      let relZ = (seg.baseZ - (roadDistance % totalRoadLength));
      while (relZ > 20) relZ -= totalRoadLength;
      while (relZ < -totalRoadLength + 20) relZ += totalRoadLength;

      const worldZAtSeg = roadDistance - relZ;
      const curveXAtSeg = getTrackCurveX(worldZAtSeg) - currentCurve;
      const elevYAtSeg = getTrackElevationY(worldZAtSeg) - currentElev;
      const twistAtSeg = getTrackTwist(worldZAtSeg);

      seg.group.position.set(curveXAtSeg, elevYAtSeg, relZ);

      // 3D Pitch and Yaw along the ribbon
      const dAhead = 12.0;
      const curveAhead = getTrackCurveX(worldZAtSeg + dAhead) - currentCurve;
      const elevAhead = getTrackElevationY(worldZAtSeg + dAhead) - currentElev;
      const yawAngle = Math.atan2(curveAhead - curveXAtSeg, dAhead);
      const pitchAngle = -Math.atan2(elevAhead - elevYAtSeg, dAhead);

      seg.group.rotation.set(pitchAngle, yawAngle, twistAtSeg);
    });

    // 2. Position Finish Line Quantum Gate
    if (finishGantry) {
      const finishDist = targetDistance * RACE_MAP_SCALE;
      const relFinishZ = -(finishDist - roadDistance);
      const finishCurveX = getTrackCurveX(finishDist) - currentCurve;
      const finishElevY = getTrackElevationY(finishDist) - currentElev;
      finishGantry.position.set(finishCurveX, finishElevY, relFinishZ);
    }

    // 3. Update Player Anti-Gravity Ship 3D
    const pSec = getTrackCrossSection(player.u);
    const hoverBob = Math.sin(player.hoverPhase) * 0.08;
    const pX = pSec.localX;
    const pY = pSec.localY + player.hoverY + hoverBob;

    if (playerShip3D) {
      playerShip3D.group.position.set(pX, pY, -2);
      playerShip3D.group.rotation.z = player.roll;
      playerShip3D.group.rotation.y = -player.vu * 0.09;
      playerShip3D.group.rotation.x = -player.pitch * 0.15;

      // Pulse Nitro Flame and Cruise Plasma
      playerShip3D.nitroFlames.forEach((f) => {
        f.visible = player.isBoosting;
        if (player.isBoosting) {
          f.scale.set(randomRange(0.85, 1.3), randomRange(0.9, 1.6), randomRange(0.85, 1.3));
        }
      });

      playerShip3D.cruiseFlames.forEach((c) => {
        const throttleScale = 0.8 + (player.speed / player.baseMaxSpeed) * 0.5;
        c.scale.set(1.0, 1.0, throttleScale + randomRange(-0.05, 0.08));
      });

      // Update Dynamic Thruster PointLight
      if (playerThrusterLight) {
        playerThrusterLight.position.set(pX, pY + 0.4, 0.5);
        playerThrusterLight.intensity = player.isBoosting ? 4.5 : 2.2;
      }

      // Update Shadow Light to follow the action
      if (sunLight) {
        sunLight.position.set(pX + 30, pY + 55, -35);
        sunLight.target.position.set(pX, pY, -10);
        sunLight.target.updateMatrixWorld();
      }
    }

    // 4. Update Asteroids in Space
    spaceAsteroids.forEach((ast) => {
      ast.rotation.x += ast.userData.rotSpeedX * dt;
      ast.rotation.y += ast.userData.rotSpeedY * dt;

      let relZ = (ast.userData.baseZ - (roadDistance % (ASTEROID_COUNT * 32)));
      while (relZ > 50) relZ -= (ASTEROID_COUNT * 32);
      while (relZ < -(ASTEROID_COUNT * 32) + 50) relZ += (ASTEROID_COUNT * 32);

      const astWorldZ = roadDistance - relZ;
      const trackXAtZ = getTrackCurveX(astWorldZ) - currentCurve;
      const trackYAtZ = getTrackElevationY(astWorldZ) - currentElev;

      ast.position.set(
        trackXAtZ + (ast.userData.isLeft ? -ast.userData.distFromTrack : ast.userData.distFromTrack),
        trackYAtZ + Math.sin(astWorldZ * 0.001) * 15,
        relZ
      );
    });

    // 5. Update Speed Lines / Hyperspace Particle Tunnel
    if (speedLinesMesh && speedLinePositions) {
      const speedRatio = player.speed / player.topSpeed;
      speedLinesMesh.material.opacity = player.isBoosting ? 0.85 : clamp((speedRatio - 0.55) * 1.8, 0.0, 0.55);

      const streamSpeed = (player.speed * 0.22) * dt * 60;
      for (let i = 0; i < SPEED_LINE_COUNT; i++) {
        speedLinePositions[i * 6 + 2] += streamSpeed;
        speedLinePositions[i * 6 + 5] += streamSpeed;
        if (speedLinePositions[i * 6 + 2] > 10) {
          const newZ = -randomRange(40, 80);
          speedLinePositions[i * 6 + 2] = newZ;
          speedLinePositions[i * 6 + 5] = newZ - randomRange(4.0, 10.0);
        }
      }
      speedLinesMesh.geometry.attributes.position.needsUpdate = true;
    }

    // 6. Update Rival Anti-Grav Craft 3D
    for (const rival of rivalCars) {
      if (!rival.model3D) continue;
      const relDist = rival.distanceTravelled - roadDistance;
      const rZ = -2 - relDist;
      const rivalWorldZ = rival.distanceTravelled;
      const rCurveX = (getTrackCurveX(rivalWorldZ) - currentCurve);
      const rElevY = (getTrackElevationY(rivalWorldZ) - currentElev);
      const rTwist = getTrackTwist(rivalWorldZ);

      const rSec = getTrackCrossSection(rival.u);
      const rX = rCurveX + rSec.localX;
      const rY = rElevY + rSec.localY + 0.8 + Math.sin(raceTime * 7 + rival.id) * 0.07;

      rival.model3D.group.position.set(rX, rY, rZ);
      rival.model3D.group.rotation.set(0, 0, rSec.wallRoll + rTwist);
      rival.model3D.group.visible = (rZ > -550 && rZ < 60);

      // Police siren strobe
      if (rival.isPolice && rival.model3D.sirenMesh) {
        const isRed = Math.floor(rival.sirenTimer) % 2 === 0;
        rival.model3D.sirenMesh.material.color.setHex(isRed ? 0xff0022 : 0x0066ff);
      }
    }

    // 7. Update Traffic Craft 3D
    for (const car of trafficCars) {
      if (!car.model3D) continue;
      const relDist = car.worldZ - roadDistance;
      const cZ = -2 - relDist;
      const cCurveX = (getTrackCurveX(car.worldZ) - currentCurve);
      const cElevY = (getTrackElevationY(car.worldZ) - currentElev);
      const cTwist = getTrackTwist(car.worldZ);

      const cSec = getTrackCrossSection(car.u);
      const cX = cCurveX + cSec.localX;
      const cY = cElevY + cSec.localY + 0.8 + Math.sin(raceTime * 6 + car.worldZ * 0.05) * 0.06;

      car.model3D.group.position.set(cX, cY, cZ);
      car.model3D.group.rotation.set(0, 0, cSec.wallRoll + cTwist);
      car.model3D.group.visible = (cZ > -550 && cZ < 50);

      if (car.isPolice && car.model3D.sirenMesh) {
        const isRed = Math.floor(car.sirenTimer) % 2 === 0;
        car.model3D.sirenMesh.material.color.setHex(isRed ? 0xff0022 : 0x0066ff);
      }
    }

    // 8. Update Quantum Pickups 3D
    for (const p of pickups) {
      if (!p.model3D) continue;
      const relDist = p.worldZ - roadDistance;
      const pZ = -2 - relDist;
      const pCurveX = (getTrackCurveX(p.worldZ) - currentCurve);
      const pElevY = (getTrackElevationY(p.worldZ) - currentElev);

      const pSec = getTrackCrossSection(p.u);
      const pX = pCurveX + pSec.localX;
      const pY = pElevY + pSec.localY + 0.8 + Math.sin(p.pulse) * 0.35;

      p.model3D.group.position.set(pX, pY, pZ);
      p.model3D.gem.rotation.y += 0.05;
      p.model3D.gem.rotation.x += 0.03;
      p.model3D.halo1.rotation.z += 0.04;
      p.model3D.halo2.rotation.z -= 0.04;
      p.model3D.group.visible = (pZ > -500 && pZ < 40);
    }

    // 9. Cinematic Camera System (Dynamic Bank Roll & Warping)
    let shakeX = 0, shakeY = 0;
    if (screenShake > 0) {
      shakeX = (Math.random() - 0.5) * (screenShake * 0.03);
      shakeY = (Math.random() - 0.5) * (screenShake * 0.03);
    }

    const camCfg = CAMERA_VIEWS[currentCamIndex];
    const targetPos = camCfg.getPos(pX, pY, player.isBoosting);
    const targetLook = camCfg.getLookAt(pX, pY);

    if (playerShip3D) {
      playerShip3D.group.visible = camCfg.showPlayer;
    }

    // Smooth position interpolation
    const posLerp = Math.min(1.0, 7.5 * dt);
    camera.position.x += (targetPos.x + shakeX - camera.position.x) * posLerp;
    camera.position.y += (targetPos.y + shakeY - camera.position.y) * posLerp;
    camera.position.z += (targetPos.z - camera.position.z) * posLerp;

    // Smooth lookAt target interpolation
    const lookLerp = Math.min(1.0, 8.5 * dt);
    camLookAtCurrent.x += (targetLook.x - camLookAtCurrent.x) * lookLerp;
    camLookAtCurrent.y += (targetLook.y - camLookAtCurrent.y) * lookLerp;
    camLookAtCurrent.z += (targetLook.z - camLookAtCurrent.z) * lookLerp;
    camera.lookAt(camLookAtCurrent);

    // Cinematic Camera Roll Banking with ship and track
    const cameraRoll = (player.roll * 0.55) + (currentTwist * 0.45);
    camera.rotation.z += (cameraRoll - camera.rotation.z) * Math.min(1.0, 6.5 * dt);

    // Dynamic FOV Warp Expansion on Supersonic Velocity & Boost
    const speedRatio = player.speed / player.topSpeed;
    const dynamicTargetFOV = (player.isBoosting ? camCfg.boostFOV : (camCfg.baseFOV + speedRatio * 8.0));
    camera.fov += (dynamicTargetFOV - camera.fov) * Math.min(1.0, 7.0 * dt);
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

    // Deep cosmic radar background
    minimapCtx.fillStyle = 'rgba(2, 4, 12, 0.88)';
    minimapCtx.fillRect(0, 0, MW, MH);

    const padX = 14;
    const trackPlayWidth = MW - padX * 2;
    const trackCenterX = MW / 2;
    const startY = MH - 18;
    const endY = 16;
    const trackPlayHeight = startY - endY;

    const totalRaceDist = targetDistance * RACE_MAP_SCALE;

    function uToMapX(uVal, mapY) {
      const progress = (startY - mapY) / trackPlayHeight;
      const curveOffset = getMapCurveOffset(progress);
      return trackCenterX + curveOffset + (uVal * (trackPlayWidth * 0.38));
    }

    // Curved Track Borders
    const segments = 24;
    minimapCtx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const p = i / segments;
      const my = startY - p * trackPlayHeight;
      const mx = uToMapX(-1.0, my);
      if (i === 0) minimapCtx.moveTo(mx, my);
      else minimapCtx.lineTo(mx, my);
    }
    for (let i = segments; i >= 0; i--) {
      const p = i / segments;
      const my = startY - p * trackPlayHeight;
      const mx = uToMapX(1.0, my);
      minimapCtx.lineTo(mx, my);
    }
    minimapCtx.closePath();
    minimapCtx.fillStyle = 'rgba(0, 243, 255, 0.08)';
    minimapCtx.fill();

    // Glowing Neon Rails
    minimapCtx.strokeStyle = 'rgba(255, 0, 102, 0.65)';
    minimapCtx.lineWidth = 1.5;
    minimapCtx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const p = i / segments;
      const my = startY - p * trackPlayHeight;
      const mx = uToMapX(-1.0, my);
      if (i === 0) minimapCtx.moveTo(mx, my);
      else minimapCtx.lineTo(mx, my);
    }
    minimapCtx.stroke();

    minimapCtx.strokeStyle = 'rgba(0, 243, 255, 0.65)';
    minimapCtx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const p = i / segments;
      const my = startY - p * trackPlayHeight;
      const mx = uToMapX(1.0, my);
      if (i === 0) minimapCtx.moveTo(mx, my);
      else minimapCtx.lineTo(mx, my);
    }
    minimapCtx.stroke();

    // Checkered Finish Line
    const fLX = uToMapX(-1.0, endY);
    const fRX = uToMapX(1.0, endY);
    minimapCtx.strokeStyle = '#ffd700';
    minimapCtx.lineWidth = 3;
    minimapCtx.beginPath();
    minimapCtx.moveTo(fLX, endY);
    minimapCtx.lineTo(fRX, endY);
    minimapCtx.stroke();

    // AI Rivals
    for (const rival of rivalCars) {
      const rRatio = clamp(rival.distanceTravelled / totalRaceDist, 0, 1);
      const my = startY - rRatio * trackPlayHeight;
      const mx = uToMapX(rival.u, my);

      minimapCtx.fillStyle = rival.color;
      minimapCtx.shadowColor = rival.color;
      minimapCtx.shadowBlur = 4;
      minimapCtx.beginPath();
      minimapCtx.roundRect(mx - 3.5, my - 4.5, 7, 9, 2);
      minimapCtx.fill();
      minimapCtx.shadowBlur = 0;

      minimapCtx.fillStyle = '#ffffff';
      minimapCtx.font = 'bold 6px sans-serif';
      minimapCtx.textAlign = 'center';
      minimapCtx.fillText(rival.name.charAt(0), mx, my + 2);
    }

    // Player Craft
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

    // Radar border
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
