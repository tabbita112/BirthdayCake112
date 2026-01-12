// 游戏配置
const config = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    score: 1,
    health: 3,
    gameRunning: true,
    targetScore: 10000,
    playerName: '女巫', // 玩家名字，默认值
    cakeName: '小蛋糕' // 小蛋糕名字，默认值
};

// 开始界面对话系统
const dialogue = {
    currentIndex: 0,
    dialogues: [
        { text: '哇，这是！！', needsInput: false},
        { text: '{cakeName}', needsInput: true, inputType: 'cakeName', placeholder: '为它取名吧' },
        { text: '天哪！{name}，今天是你的生日！', needsInput: true, inputType: 'playerName', placeholder: '输入你的名字' },
        { text: '难怪你烤出了我，一个很美味小蛋糕！', needsInput: false },
        { text: '为了成为超美味小蛋糕，{name}大人，我需要你的帮助，收集水果内馅！', needsInput: false }
    ]
};

// 摇杆控制
const joystick = {
    element: null,
    handle: null,
    isActive: false,
    x: 0,
    y: 0,
    maxDistance: 27 // 适配新的摇杆大小（100px摇杆，45px手柄，最大移动距离约27px）
};

// 小蛋糕对象（添加平滑移动）
const cake = {
    x: 0,
    y: 0,
    size: 30,
    maxSpeed: 3, // 提高最大速度以便有加速/减速感
    acceleration: 0.25, // 加速度更大，提升加速感
    friction: 0.9, // 摩擦力（越接近1越平滑）
    vx: 0,
    vy: 0,
    targetVx: 0, // 目标速度
    targetVy: 0,
    animationFrame: 0, // 动画帧计数器
    isMoving: false, // 是否在移动
    shakeOffsetX: 0,  // 受击晃动偏移X
    shakeOffsetY: 0,  // 受击晃动偏移Y
    shakeTimer: 0     // 晃动计时器
};

// 键盘控制状态
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// 触控拖拽控制
const touchControl = {
    active: false,
    x: 0,
    y: 0
};

// 大小映射配置（蛋糕与水果统一使用）
const sizeConfig = {
    min: 20, // 
    max: 80  // 最大尺寸保持减半
};

function sizeFromScore(score) {
    //const ratio = Math.min(1, score / config.targetScore);
    return sizeConfig.min + Math.log2(score+1) * 7;
}

// 水果数组
const fruits = [];

// 音符反馈数组
const noteFeedbacks = []; // {x, y, timer, alpha}

// 水果图片缓存
const fruitImages = {};
// 小蛋糕图片
let cakeImage = null;
let cakeRunImage = null;
// 胜利和失败图片
let winImage = null;

// 加载水果图片
function loadFruitImage(type, imagePath) {
    return new Promise((resolve, reject) => {
        if (fruitImages[imagePath]) {
            resolve(fruitImages[imagePath]);
            return;
        }
        const img = new Image();
        img.onload = () => {
            fruitImages[imagePath] = img;
            resolve(img);
        };
        img.onerror = () => {
            console.warn(`无法加载图片: ${imagePath}，将使用emoji`);
            resolve(null);
        };
        img.src = imagePath;
    });
}

// 加载小蛋糕图片
function loadCakeImage() {
    return new Promise((resolve) => {
        if (cakeImage && cakeRunImage) {
            resolve(cakeImage);
            return;
        }
        
        let loadedCount = 0;
        const totalImages = 2;
        
        const checkComplete = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
                resolve(cakeImage);
            }
        };
        
        // 加载普通状态图片
        const img = new Image();
        img.onload = () => {
            cakeImage = img;
            checkComplete();
        };
        img.onerror = () => {
            console.warn('无法加载小蛋糕图片，将使用emoji');
            checkComplete();
        };
        img.src = './Assets/cake.png';
        
        // 加载奔跑状态图片
        const runImg = new Image();
        runImg.onload = () => {
            cakeRunImage = runImg;
            checkComplete();
        };
        runImg.onerror = () => {
            console.warn('无法加载小蛋糕奔跑图片，将使用普通图片');
            checkComplete();
        };
        runImg.src = './Assets/cake_run.png';
    });
}

// 加载胜利图片
function loadWinImage() {
    return new Promise((resolve) => {
        if (winImage) {
            resolve(winImage);
            return;
        }
        const img = new Image();
        img.onload = () => {
            winImage = img;
            resolve(img);
        };
        img.onerror = () => {
            console.warn('无法加载胜利图片');
            resolve(null);
        };
        img.src = './Assets/win.png';
    });
}

// 水果类型配置（不同分数段对应不同水果）
const fruitTypes = [
    { min: 1, max: 10, emoji: '🫐', name: '蓝莓', color: '#4169E1', gain: 1, image: './Assets/blueberry.png' },
    { min: 11, max: 25, emoji: '🍓', name: '草莓', color: '#FF4D6D', gain: 2 , image: './Assets/strawberry.png' },
    { min: 26, max: 50, emoji: '🪴', name: '无花果', color: '#c75d7a', gain: 3, image: './Assets/fig.png' },
    { min: 51, max: 100, emoji: '🍊', name: '橙子', color: '#FF8C00', gain: 5, image: './Assets/orange.png' },
    { min: 101, max: 250, emoji: '🍎', name: '苹果', color: '#FF4500', gain: 8, image: './Assets/apple.png' },
    { min: 251, max: 375, emoji: '🥭', name: '芒果', color: '#f4a300', gain: 13, image: './Assets/mango.png' },
    { min: 376, max: 750, emoji: '🐉', name: '火龙果', color: '#d83c68', gain: 21, image: './Assets/dragonfruit.png' },
    { min: 751, max: 1500, emoji: '🍍', name: '菠萝', color: '#f7c948', gain: 34, image: './Assets/pineapple.png' },
    { min: 1500, max: 5000, emoji: '🍉', name: '西瓜', color: '#32CD32', gain: 65, image: './Assets/watermelon.png' }
];

function getFruitGain(score) {
    return score;
}

// 初始化游戏
function init() {
    config.canvas = document.getElementById('gameCanvas');
    config.ctx = config.canvas.getContext('2d');
    
    // 设置画布大小（适应手机端）
    updateCanvasSize();
    
    // 初始化小蛋糕位置
    cake.x = config.width / 2;
    cake.y = config.height / 2;
    cake.size = sizeFromScore(config.score);
    
    // 初始化摇杆
    joystick.element = document.getElementById('joystick');
    joystick.handle = document.getElementById('joystickHandle');
    
    setupJoystick();
    setupKeyboardControls();
    setupTouchControls();
    setupEventListeners();
    
    // 预加载水果图片和小蛋糕图片
    preloadFruitImages();
    loadCakeImage();
    loadWinImage();
    
    // 开始游戏循环
    gameLoop();
    
    // 定期生成水果
    setInterval(spawnFruit, 2000);
    spawnFruit(); // 立即生成一些水果
}

// 预加载水果图片
function preloadFruitImages() {
    fruitTypes.forEach(type => {
        if (type.image) {
            loadFruitImage(type, type.image);
        }
    });
}

// 初始化开始界面
function initStartScreen() {
    const startScreen = document.getElementById('startScreen');
    const gameContainer = document.getElementById('gameContainer');
    const dialogText = document.getElementById('dialogText');
    const dialogArrow = document.getElementById('dialogArrow');
    const dialogHint = document.getElementById('dialogHint');
    const startGameBtn = document.getElementById('startGameBtn');
    const enterKeyBtn = document.getElementById('enterKeyBtn');
    const playerNameInput = document.getElementById('playerNameInput');
    const cakeIcon = document.getElementById('cakeIcon');
    const cakeIconImg = document.getElementById('cakeIconImg');
    
    // 重置对话索引（确保每次都是从头开始）
    dialogue.currentIndex = 0;
    
    // 加载小蛋糕图标图片
    if (cakeIconImg) {
        cakeIconImg.onerror = () => {
            // 如果图片加载失败，显示emoji作为备用
            cakeIcon.innerHTML = '🎂';
        };
    }
    
    // 显示第一句对话
    updateDialogue();
    
    // 推进对话的函数
    function handleNext() {
        const currentDialogue = dialogue.dialogues[dialogue.currentIndex];
        const activeInput = document.getElementById('playerNameInput');
        const isInputFocused = document.activeElement === activeInput;
        
        // 如果有输入框，处理输入
        if (currentDialogue.needsInput && activeInput) {
            const inputValue = activeInput.value.trim();
            if (currentDialogue.inputType === 'cakeName') {
                config.cakeName = inputValue || '小蛋糕';
            } else if (currentDialogue.inputType === 'playerName') {
                config.playerName = inputValue || '女巫';
            }
            if (isInputFocused) {
                activeInput.blur();
            }
        }
        
        // 推进到下一句对话
        nextDialogue();
    }
    
    // 回车键事件（推进对话）
    document.addEventListener('keydown', (e) => {
        if (startScreen.style.display === 'none') return;
        
        const activeInput = document.getElementById('playerNameInput');
        const isInputFocused = document.activeElement === activeInput;
        
        if (e.key === 'Enter') {
            // 如果输入框聚焦，输入框的keydown事件会处理
            // 这里只处理输入框未聚焦的情况
            if (!isInputFocused) {
                e.preventDefault();
                handleNext();
            }
        }
    });
    
    // 回车键按钮点击事件
    enterKeyBtn.addEventListener('click', () => {
        handleNext();
    });
    
    // 开始游戏按钮
    startGameBtn.addEventListener('click', () => {
        startScreen.style.display = 'none';
        gameContainer.style.display = 'flex';
        init();
    });
    
    function nextDialogue() {
        // 小蛋糕晃动动画
        cakeIcon.classList.add('shake');
        setTimeout(() => {
            cakeIcon.classList.remove('shake');
        }, 500);
        
        dialogue.currentIndex++;
        
        if (dialogue.currentIndex < dialogue.dialogues.length) {
            updateDialogue();
        } else {
            // 最后一句对话，显示开始游戏按钮
            dialogHint.parentElement.style.display = 'none';
            dialogArrow.style.display = 'none';
            startGameBtn.style.display = 'inline-block';
        }
    }
    
    function updateDialogue() {
        const currentDialogue = dialogue.dialogues[dialogue.currentIndex];
        if (!currentDialogue) {
            return;
        }
        
        const inputId = 'playerNameInput';
        const placeholder = currentDialogue.placeholder || '输入';
        
        if (currentDialogue.needsInput) {
            // 需要输入的对话，显示输入框
            const defaultValue = currentDialogue.inputType === 'cakeName' 
                ? (config.cakeName || '小蛋糕')
                : (config.playerName || '女巫');
            
            // 根据inputType决定输入框位置
            if (currentDialogue.inputType === 'cakeName') {
                // 小蛋糕名字输入
                dialogText.innerHTML = `名字：<input type="text" id="${inputId}" placeholder="${placeholder}" maxlength="10" value="${defaultValue}">`;
            } else {
                // 玩家名字输入，需要替换文本中的{name}，但保留{cakeName}
                let text = currentDialogue.text.replace('{cakeName}', config.cakeName || '小蛋糕');
                const parts = text.split('{name}');
                if (parts.length === 2) {
                    dialogText.innerHTML = `${parts[0]}<input type="text" id="${inputId}" placeholder="${placeholder}" maxlength="10" value="${defaultValue}">${parts[1]}`;
                } else {
                    dialogText.innerHTML = text.replace('{name}', `<input type="text" id="${inputId}" placeholder="${placeholder}" maxlength="10" value="${defaultValue}">`);
                }
            }
            
            // 设置输入框事件
            setTimeout(() => {
                const newInput = document.getElementById(inputId);
                if (newInput) {
                    newInput.focus();
                    newInput.select();
                    const handleInputEnter = (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            handleNext();
                        }
                    };
                    // 移除旧的事件监听器（通过克隆节点）
                    const newInputClone = newInput.cloneNode(true);
                    newInput.parentNode.replaceChild(newInputClone, newInput);
                    newInputClone.addEventListener('keydown', handleInputEnter);
                }
            }, 100);
        } else {
            // 普通对话，替换所有占位符
            let text = currentDialogue.text
                .replace('{name}', config.playerName || '女巫')
                .replace('{cakeName}', config.cakeName || '小蛋糕');
            dialogText.innerHTML = text;
        }
    }
}

// 更新画布大小
function updateCanvasSize() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        config.width = window.innerWidth;
        config.height = window.innerHeight;
    } else {
        config.width = Math.min(window.innerWidth - 40, 1200);
        config.height = Math.min(window.innerHeight - 200, 800);
    }
    config.canvas.width = config.width;
    config.canvas.height = config.height;
}

// 设置摇杆事件
function setupJoystick() {
    let touchId = null;
    
    // 鼠标事件
    joystick.element.addEventListener('mousedown', (e) => {
        e.preventDefault();
        joystick.isActive = true;
        updateJoystick(e.clientX, e.clientY);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (joystick.isActive) {
            updateJoystick(e.clientX, e.clientY);
        }
    });
    
    document.addEventListener('mouseup', () => {
        joystick.isActive = false;
        resetJoystick();
    });
    
    // 触摸事件
    joystick.element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchId = e.touches[0].identifier;
        joystick.isActive = true;
        const touch = e.touches[0];
        updateJoystick(touch.clientX, touch.clientY);
    });
    
    document.addEventListener('touchmove', (e) => {
        if (joystick.isActive && touchId !== null) {
            e.preventDefault();
            const touch = Array.from(e.touches).find(t => t.identifier === touchId);
            if (touch) {
                updateJoystick(touch.clientX, touch.clientY);
            }
        }
    });
    
    document.addEventListener('touchend', (e) => {
        if (touchId !== null && !Array.from(e.touches).find(t => t.identifier === touchId)) {
            joystick.isActive = false;
            touchId = null;
            resetJoystick();
        }
    });
}

// 更新摇杆位置
function updateJoystick(clientX, clientY) {
    const rect = joystick.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 动态计算最大移动距离（摇杆半径 - 手柄半径）
    const joystickRadius = rect.width / 2;
    const handleRadius = joystick.handle.offsetWidth / 2;
    const maxDistance = joystickRadius - handleRadius - 2; // 留2px边距
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > maxDistance) {
        joystick.x = (dx / distance) * maxDistance;
        joystick.y = (dy / distance) * maxDistance;
    } else {
        joystick.x = dx;
        joystick.y = dy;
    }
    
    // 更新摇杆手柄位置
    joystick.handle.style.transform = `translate(calc(-50% + ${joystick.x}px), calc(-50% + ${joystick.y}px))`;
    
    // 更新小蛋糕目标速度（使用平滑移动）
    const normalizedX = joystick.x / maxDistance;
    const normalizedY = joystick.y / maxDistance;
    cake.targetVx = normalizedX * cake.maxSpeed;
    cake.targetVy = normalizedY * cake.maxSpeed;
}

// 重置摇杆
function resetJoystick() {
    joystick.x = 0;
    joystick.y = 0;
    joystick.handle.style.transform = 'translate(-50%, -50%)';
    cake.targetVx = 0;
    cake.targetVy = 0;
}

// 设置键盘控制（WASD）
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'w' || key === 'a' || key === 's' || key === 'd' ||
            key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright') {
            e.preventDefault();
            keys[e.key] = true;
            updateKeyboardMovement();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'w' || key === 'a' || key === 's' || key === 'd' ||
            key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright') {
            e.preventDefault();
            keys[e.key] = false;
            updateKeyboardMovement();
        }
    });
}

// 更新键盘移动
function updateKeyboardMovement() {
    let targetVx = 0;
    let targetVy = 0;
    
    if (keys.w) targetVy -= 1;
    if (keys.s) targetVy += 1;
    if (keys.a) targetVx -= 1;
    if (keys.d) targetVx += 1;
    if (keys.ArrowUp) targetVy -= 1;
    if (keys.ArrowDown) targetVy += 1;
    if (keys.ArrowLeft) targetVx -= 1;
    if (keys.ArrowRight) targetVx += 1;
    
    // 归一化对角线移动
    if (targetVx !== 0 && targetVy !== 0) {
        const length = Math.sqrt(targetVx * targetVx + targetVy * targetVy);
        targetVx /= length;
        targetVy /= length;
    }
    
    // 如果摇杆未激活，使用键盘输入
    if (!joystick.isActive) {
        cake.targetVx = targetVx * cake.maxSpeed;
        cake.targetVy = targetVy * cake.maxSpeed;
    } else {
        // 如果摇杆激活，键盘输入会被忽略（摇杆优先）
        // 但我们可以让它们同时工作，这里选择摇杆优先
    }
}

// 在游戏循环中持续更新键盘移动（确保响应及时）
function updateKeyboardMovementInLoop() {
    if (!joystick.isActive) {
        updateKeyboardMovement();
    }
}

// 触屏拖拽控制（直接拖动方向）
function setupTouchControls() {
    const canvas = config.canvas;
    const handleTouch = (clientX, clientY) => {
        touchControl.active = true;
        touchControl.x = clientX;
        touchControl.y = clientY;
        applyTouchVector(clientX, clientY);
    };
    
    canvas.addEventListener('touchstart', (e) => {
        if (e.target.closest('.joystick')) return; // 避免与摇杆冲突
        const touch = e.touches[0];
        handleTouch(touch.clientX, touch.clientY);
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        if (e.target.closest('.joystick')) return;
        e.preventDefault();
        const touch = e.touches[0];
        handleTouch(touch.clientX, touch.clientY);
    }, { passive: false });
    
    canvas.addEventListener('touchend', () => {
        touchControl.active = false;
        if (!joystick.isActive) {
            cake.targetVx = 0;
            cake.targetVy = 0;
        }
    });
}

function applyTouchVector(clientX, clientY) {
    const rect = config.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const dx = x - cake.x;
    const dy = y - cake.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    if (!joystick.isActive) {
        cake.targetVx = nx * cake.maxSpeed;
        cake.targetVy = ny * cake.maxSpeed;
    }
}

// 设置事件监听器
function setupEventListeners() {
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    window.addEventListener('resize', () => {
        updateCanvasSize();
        // 重新居中蛋糕
        cake.x = Math.min(cake.x, config.width - cake.size);
        cake.y = Math.min(cake.y, config.height - cake.size);
    });
}

// 生成正态分布随机数
function normalRandom(mean, stdDev) {
    // Box-Muller变换生成正态分布随机数
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
}

// 生成水果
function spawnFruit() {
    if (!config.gameRunning) return;
    const batchCount = 2; // 每次生成数量翻倍
    for (let n = 0; n < batchCount; n++) {
        // 使用正态分布生成水果分值，均值在小蛋糕分数附近（更集中）
        const mean = config.score;
        const stdDev = Math.max(8, config.score * 0.2); // 更集中于当前分数
        let fruitScore = Math.max(1, Math.round(normalRandom(mean, stdDev)));
        
        // 确保水果分值在合理范围内
        fruitScore = Math.max(1, Math.min(fruitScore, config.targetScore));
        
        // 根据分值确定水果类型
        const fruitType = fruitTypes.find(type => fruitScore >= type.min && fruitScore <= type.max) || fruitTypes[0];
        
        // 根据分值计算大小（统一标准，线性分布）
        const size = sizeFromScore(fruitScore);
        
        // 从屏幕外生成
        const margin = 60;
        const side = Math.random() < 0.5 ? 'left' : 'right';
        const x = side === 'left' ? -margin : config.width + margin;
        const y = Math.random() * config.height;
        
        // 运动方向：水平为基准，偏转±30°以内
        const baseDir = side === 'left' ? 0 : Math.PI;
        const angleOffset = (Math.random() - 0.5) * (Math.PI / 3);
        const angle = baseDir + angleOffset;
        
        // 速度：最大为蛋糕最大速度的一半
        const fruitMaxSpeed = cake.maxSpeed / 2;
        const speed = (0.4 + Math.random() * 0.6) * fruitMaxSpeed; // 0.4~1.0 * max
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);
        const vx = dirX * speed;
        const vy = dirY * speed;
        
        fruits.push({
            x,
            y,
            size,
            score: fruitScore,
            type: fruitType,
            vx,
            vy,
            baseDirX: dirX,
            baseDirY: dirY,
            targetVx: vx,
            targetVy: vy,
            maxSpeed: fruitMaxSpeed,
            baseSpeed: speed
        });
    }
}

// 更新游戏状态
function update() {
    if (!config.gameRunning) return;
    
    // 平滑移动系统：使用加速度和摩擦力
    const dvx = cake.targetVx - cake.vx;
    const dvy = cake.targetVy - cake.vy;
    
    // 应用加速度（更强加速/减速感）
    cake.vx += dvx * cake.acceleration;
    cake.vy += dvy * cake.acceleration;
    
    // 应用摩擦力（使移动更平滑）
    cake.vx *= cake.friction;
    cake.vy *= cake.friction;
    
    // 如果速度很小，直接设为0（避免无限小的抖动）
    if (Math.abs(cake.vx) < 0.01) cake.vx = 0;
    if (Math.abs(cake.vy) < 0.01) cake.vy = 0;
    
    // 判断是否在移动（用于动画切换）
    cake.isMoving = Math.abs(cake.vx) > 0.05 || Math.abs(cake.vy) > 0.05;
    
    // 更新动画帧（移动时每帧增加，用于切换动画）
    if (cake.isMoving) {
        cake.animationFrame++;
    } else {
        cake.animationFrame = 0;
    }
    
    // 更新小蛋糕位置
    cake.x += cake.vx;
    cake.y += cake.vy;
    
    // 边界检测
    cake.x = Math.max(cake.size, Math.min(config.width - cake.size, cake.x));
    cake.y = Math.max(cake.size, Math.min(config.height - cake.size, cake.y));
    
    // 如果撞到边界，停止移动
    if (cake.x <= cake.size || cake.x >= config.width - cake.size) {
        cake.vx = 0;
        cake.targetVx = 0;
    }
    if (cake.y <= cake.size || cake.y >= config.height - cake.size) {
        cake.vy = 0;
        cake.targetVy = 0;
    }
    
    // 更新键盘移动（如果摇杆未激活）
    updateKeyboardMovementInLoop();
    
    // 更新水果位置（基础直线运动 + 近距追逐/躲避）
    const offscreenMargin = 80;
    for (let i = fruits.length - 1; i >= 0; i--) {
        const fruit = fruits[i];
        const dx = cake.x - fruit.x;
        const dy = cake.y - fruit.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        // 基础直线运动（朝屏幕方向）
        const baseVx = fruit.baseDirX * fruit.baseSpeed;
        const baseVy = fruit.baseDirY * fruit.baseSpeed;
        
        // 近距离追逐/躲避强度（仅蛋糕周围触发，越近越强）
        const influenceRadius = cake.size * 8; // 范围扩大一倍
        let influence = Math.max(0, 1 - dist / influenceRadius);
        if (dist <= cake.size) {
            influence *= 1.5; // 蛋糕直径范围内最明显
        }
        influence = Math.min(influence, 1.5);
        
        let dirX, dirY;
        if (fruit.score > config.score) {
            // 更大的水果追逐小蛋糕
            dirX = dx / dist;
            dirY = dy / dist;
        } else {
            // 更小或相等的水果躲避小蛋糕
            dirX = -dx / dist;
            dirY = -dy / dist;
        }
        
        const chaseSpeed = Math.min(fruit.maxSpeed, fruit.baseSpeed) * influence;
        const chaseVx = dirX * chaseSpeed;
        const chaseVy = dirY * chaseSpeed;
        
        // 合成目标速度 = 基础直线 + 近距影响
        fruit.targetVx = baseVx + chaseVx;
        fruit.targetVy = baseVy + chaseVy;
        
        // 限制合成速度不超过上限
        const targetSpeed = Math.hypot(fruit.targetVx, fruit.targetVy);
        const maxSpeed = fruit.maxSpeed;
        if (targetSpeed > maxSpeed) {
            const scale = maxSpeed / targetSpeed;
            fruit.targetVx *= scale;
            fruit.targetVy *= scale;
        }
        
        // 应用加速度与摩擦（加速/减速感）
        const fruitAccel = 0.14;
        const fruitFriction = 0.97;
        fruit.vx += (fruit.targetVx - fruit.vx) * fruitAccel;
        fruit.vy += (fruit.targetVy - fruit.vy) * fruitAccel;
        fruit.vx *= fruitFriction;
        fruit.vy *= fruitFriction;
        
        // 位置更新
        fruit.x += fruit.vx;
        fruit.y += fruit.vy;
        
        // 越界则移除（穿越屏幕）
        if (
            fruit.x < -offscreenMargin || fruit.x > config.width + offscreenMargin ||
            fruit.y < -offscreenMargin || fruit.y > config.height + offscreenMargin
        ) {
            fruits.splice(i, 1);
        }
    }
    
    // 更新受击晃动效果
    if (cake.shakeTimer > 0) {
        cake.shakeTimer--;
        // 随机晃动偏移（逐渐减小）
        const shakeIntensity = (cake.shakeTimer / 20) * 5; // 最大5像素
        cake.shakeOffsetX = (Math.random() - 0.5) * shakeIntensity;
        cake.shakeOffsetY = (Math.random() - 0.5) * shakeIntensity;
    } else {
        cake.shakeOffsetX = 0;
        cake.shakeOffsetY = 0;
    }
    
    // 更新音符反馈
    for (let i = noteFeedbacks.length - 1; i >= 0; i--) {
        const note = noteFeedbacks[i];
        note.timer--;
        note.y -= 2; // 音符向上飘
        note.alpha = note.timer / 30; // 逐渐淡出
        
        if (note.timer <= 0) {
            noteFeedbacks.splice(i, 1);
        }
    }
    
    // 碰撞检测
    checkCollisions();
    
    // 限制水果数量
    if (fruits.length > 30) {
        fruits.shift();
    }
}

// 碰撞检测
function checkCollisions() {
    for (let i = fruits.length - 1; i >= 0; i--) {
        const fruit = fruits[i];
        const dx = cake.x - fruit.x;
        const dy = cake.y - fruit.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (cake.size + fruit.size) / 2;
        
        if (distance < minDistance) {
            if (fruit.score <= config.score) {
                // 小蛋糕吃掉水果
                config.score += getFruitGain(fruit.score);
                
                // 添加音符反馈（在水果被吃掉的位置）
                noteFeedbacks.push({
                    x: fruit.x,
                    y: fruit.y,
                    timer: 30, // 显示30帧
                    alpha: 1.0
                });
                
                fruits.splice(i, 1);
                
                // 更新小蛋糕大小
                cake.size = sizeFromScore(config.score);
                
                // 检查是否通关
                if (config.score >= config.targetScore) {
                    winGame();
                }
            } else {
                // 小蛋糕被更大的水果吃掉
                config.health--;
                fruits.splice(i, 1);
                
                // 触发受击晃动效果
                cake.shakeTimer = 20; // 晃动20帧
                
                // 更新血量显示
                document.getElementById('health').textContent = config.health;
                
                // 检查是否游戏结束
                if (config.health <= 0) {
                    loseGame(fruit);
                    return;
                }
            }
        }
    }
}

// 绘制游戏
function draw() {
    // 清空画布
    config.ctx.clearRect(0, 0, config.width, config.height);
    
    // 绘制背景网格（可选）
    drawGrid();
    
    // 绘制水果
    fruits.forEach(fruit => {
        drawFruit(fruit);
    });
    
    // 绘制小蛋糕
    drawCake();
    
    // 更新分数显示
    document.getElementById('score').textContent = config.score;
}

// 绘制网格背景
function drawGrid() {
    config.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    config.ctx.lineWidth = 1;
    
    const gridSize = 50;
    for (let x = 0; x < config.width; x += gridSize) {
        config.ctx.beginPath();
        config.ctx.moveTo(x, 0);
        config.ctx.lineTo(x, config.height);
        config.ctx.stroke();
    }
    
    for (let y = 0; y < config.height; y += gridSize) {
        config.ctx.beginPath();
        config.ctx.moveTo(0, y);
        config.ctx.lineTo(config.width, y);
        config.ctx.stroke();
    }
}

// 绘制水果
function drawFruit(fruit) {
    config.ctx.save();
    config.ctx.translate(fruit.x, fruit.y);
    
    // 圆形主体（无阴影）
    config.ctx.beginPath();
    config.ctx.fillStyle = fruit.type.color;
    config.ctx.arc(0, 0, fruit.size / 2, 0, Math.PI * 2);
    config.ctx.fill();
    
    // 绘制水果图标（优先使用图片，否则使用emoji）
    const fruitImage = fruit.type.image ? fruitImages[fruit.type.image] : null;
    
    if (fruitImage && fruitImage.complete) {
        // 绘制图片：蓝莓1.1倍，其他1.3倍，保持纵横比
        const isBlueberry = fruit.type.name === '蓝莓';
        const sizeMultiplier = isBlueberry ? 1.1 : 1.3;
        const baseSize = fruit.size * sizeMultiplier;
        
        // 计算保持纵横比的尺寸
        const imgAspect = fruitImage.width / fruitImage.height;
        let drawWidth = baseSize;
        let drawHeight = baseSize;
        
        if (imgAspect > 1) {
            // 图片更宽
            drawHeight = baseSize / imgAspect;
        } else {
            // 图片更高
            drawWidth = baseSize * imgAspect;
        }
        
        config.ctx.drawImage(
            fruitImage,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight
        );
    } else {
        // 绘制emoji
        config.ctx.font = `${fruit.size * 0.7}px Arial`;
        config.ctx.textAlign = 'center';
        config.ctx.textBaseline = 'middle';
        config.ctx.fillStyle = '#fff';
        config.ctx.fillText(fruit.type.emoji, 0, 0);
    }
    
    // 绘制分值
    const scoreFont = Math.max(12, fruit.size * 0.35 * 1.5); // 放大一半
    config.ctx.font = `${scoreFont}px Arial`;
    config.ctx.fillStyle = '#fff';
    const isBigger = fruit.score > config.score;
    config.ctx.strokeStyle = isBigger ? '#ff4d4f' : '#2ecc71'; // 大于为红，较小为绿
    config.ctx.lineWidth = 3;
    config.ctx.strokeText(fruit.score, 0, fruit.size * 0.65);
    config.ctx.fillText(fruit.score, 0, fruit.size * 0.65);
    
    config.ctx.restore();
}

// 绘制小蛋糕
function drawCake() {
    config.ctx.save();
    // 应用晃动偏移
    config.ctx.translate(cake.x + cake.shakeOffsetX, cake.y + cake.shakeOffsetY);
    
    // 圆形主体（无阴影）
    const grad = config.ctx.createRadialGradient(0, -cake.size * 0.1, cake.size * 0.1, 0, 0, cake.size / 2);
    grad.addColorStop(0, '#ffe4f3');
    grad.addColorStop(1, '#ff9ecb');
    config.ctx.fillStyle = grad;
    config.ctx.beginPath();
    config.ctx.arc(0, 0, cake.size / 2, 0, Math.PI * 2);
    config.ctx.fill();
    
    // 绘制小蛋糕图片（优先使用图片，否则使用emoji）
    // 根据移动状态和动画帧切换图片（每30帧切换一次，实现奔跑动画）
    let currentCakeImage = cakeImage;
    if (cake.isMoving && cakeRunImage && cakeRunImage.complete) {
        // 移动时在cake和cake_run之间切换（每30帧切换一次）
        currentCakeImage = (Math.floor(cake.animationFrame / 30) % 2 === 0) ? cakeImage : cakeRunImage;
    }
    
    if (currentCakeImage && currentCakeImage.complete) {
        // 绘制图片：1.3倍大小，保持纵横比
        const baseSize = cake.size * 1.3;
        const imgAspect = currentCakeImage.width / currentCakeImage.height;
        let drawWidth = baseSize;
        let drawHeight = baseSize;
        
        if (imgAspect > 1) {
            drawHeight = baseSize / imgAspect;
        } else {
            drawWidth = baseSize * imgAspect;
        }
        
        config.ctx.drawImage(
            currentCakeImage,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight
        );
    } else {
        // 绘制emoji
        config.ctx.font = `${cake.size * 0.8}px Arial`;
        config.ctx.textAlign = 'center';
        config.ctx.textBaseline = 'middle';
        config.ctx.fillStyle = '#fff';
        config.ctx.fillText('🎂', 0, 0);
    }
    
    // 绘制小蛋糕名字（悬浮在上方）
    const nameFont = Math.max(12, cake.size * 0.25);
    config.ctx.font = `bold ${nameFont}px Arial`;
    config.ctx.textAlign = 'center';
    config.ctx.textBaseline = 'bottom';
    config.ctx.fillStyle = '#fff';
    config.ctx.strokeStyle = '#ff8c00';
    config.ctx.lineWidth = 4;
    config.ctx.strokeText(config.cakeName, 0, -cake.size * 0.6);
    config.ctx.fillText(config.cakeName, 0, -cake.size * 0.6);
    
    // 绘制分值（放大一半，橙框白字）
    const cakeScoreFont = Math.max(14, cake.size * 0.35 * 1.5);
    config.ctx.font = `${cakeScoreFont}px Arial`;
    config.ctx.fillStyle = '#fff';
    config.ctx.strokeStyle = '#ff8c00';
    config.ctx.lineWidth = 3;
    config.ctx.textBaseline = 'top';
    config.ctx.strokeText(config.score, 0, cake.size * 0.8);
    config.ctx.fillText(config.score, 0, cake.size * 0.8);
    
    config.ctx.restore();
    
    // 绘制音符反馈
    noteFeedbacks.forEach(note => {
        config.ctx.save();
        config.ctx.globalAlpha = note.alpha;
        config.ctx.font = '30px Arial';
        config.ctx.textAlign = 'center';
        config.ctx.textBaseline = 'middle';
        config.ctx.fillText('🎵', note.x, note.y);
        config.ctx.restore();
    });
}

// 游戏循环
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 通关
function winGame() {
    config.gameRunning = false;
    const overlay = document.getElementById('gameOverlay');
    const title = document.getElementById('overlayTitle');
    const message = document.getElementById('overlayMessage');
    
    title.textContent = '🎂🎉 生日快乐！🎉🎂';
    
    // 显示胜利图片
    let winImageHtml = '';
    if (winImage && winImage.complete) {
        const maxWidth = Math.min(400, window.innerWidth * 0.6);
        const aspectRatio = winImage.width / winImage.height;
        const displayHeight = maxWidth / aspectRatio;
        winImageHtml = `<img src="./Assets/win.png" style="max-width: ${maxWidth}px; height: auto; display: block; margin: 20px auto;" alt="胜利">`;
    } else {
        winImageHtml = '<div style="font-size: 80px; margin: 20px 0;">🎂🕯️</div>';
    }
    
    message.innerHTML = `
        ${winImageHtml}
        <div>恭喜！！！</div>
        <div style="margin-top: 10px;">小蛋糕已经长大，可以点燃蜡烛庆祝生日了！</div>
        <div style="margin-top: 10px;">祝${config.playerName}生日快乐！❤</div>
    `;
    
    overlay.classList.add('show');
}

// 游戏失败
function loseGame(lastFruit) {
    config.gameRunning = false;
    const overlay = document.getElementById('gameOverlay');
    const title = document.getElementById('overlayTitle');
    const message = document.getElementById('overlayMessage');
    
    title.textContent = '💔 游戏结束 💔';
    
    // 显示最后一个水果的标志图片
    let fruitImageHtml = '';
    const fruitImage = lastFruit.type.image ? fruitImages[lastFruit.type.image] : null;
    
    if (fruitImage && fruitImage.complete) {
        const maxWidth = Math.min(300, window.innerWidth * 0.5);
        const aspectRatio = fruitImage.width / fruitImage.height;
        const displayHeight = maxWidth / aspectRatio;
        fruitImageHtml = `<img src="${lastFruit.type.image}" style="max-width: ${maxWidth}px; height: auto; display: block; margin: 20px auto;" alt="${lastFruit.type.name}">`;
    } else {
        fruitImageHtml = `<div style="font-size: 80px; margin: 20px 0;">${lastFruit.type.emoji}</div>`;
    }
    
    message.innerHTML = `
        ${fruitImageHtml}
        <div>呜哇，小蛋糕被 ${lastFruit.type.name}（${lastFruit.score}分）占领了！</div>
        <div style="margin-top: 10px;">最终得分：${config.score} 分</div>
        <div style="margin-top: 10px;">生日快乐！${lastFruit.type.name}祝${config.playerName}生日快乐！🎂</div>
    `;
    
    overlay.classList.add('show');
}

// 重新开始游戏
function restartGame() {
    config.score = 1;
    config.health = 3;
    config.gameRunning = true;
    cake.x = config.width / 2;
    cake.y = config.height / 2;
    cake.size = sizeFromScore(config.score);
    cake.vx = 0;
    cake.vy = 0;
    cake.targetVx = 0;
    cake.targetVy = 0;
    cake.animationFrame = 0;
    cake.isMoving = false;
    cake.shakeOffsetX = 0;
    cake.shakeOffsetY = 0;
    cake.shakeTimer = 0;
    noteFeedbacks.length = 0; // 清空音符反馈
    fruits.length = 0;
    
    // 重置键盘状态
    keys.w = false;
    keys.a = false;
    keys.s = false;
    keys.d = false;
    
    document.getElementById('health').textContent = config.health;
    document.getElementById('score').textContent = config.score;
    document.getElementById('gameOverlay').classList.remove('show');
    
    resetJoystick();
    
    // 重新开始生成水果
    setTimeout(() => spawnFruit(), 500);
}

// 注册Service Worker（PWA支持）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // 获取GitHub Pages基础路径（如果配置了）
        const basePath = (typeof GITHUB_PAGES_BASE !== 'undefined' ? GITHUB_PAGES_BASE : '') || '';
        
        // 动态更新manifest.json路径（如果是项目页面）
        if (basePath) {
            const manifestLink = document.getElementById('manifest-link');
            if (manifestLink) {
                fetch(manifestLink.href)
                    .then(r => r.json())
                    .then(manifest => {
                        manifest.start_url = basePath + '/';
                        manifest.scope = basePath + '/';
                        manifest.icons.forEach(icon => {
                            if (!icon.src.startsWith('http')) {
                                icon.src = basePath + icon.src;
                            }
                        });
                        const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        manifestLink.href = url;
                    })
                    .catch(e => console.warn('无法更新manifest:', e));
            }
        }
        
        // 使用绝对路径注册Service Worker
        const swPath = basePath + '/sw.js';
        navigator.serviceWorker.register(swPath, { scope: basePath + '/' })
            .then((registration) => {
                console.log('Service Worker 注册成功:', registration.scope);
                
                // 检查更新
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('发现新版本，请刷新页面');
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('Service Worker 注册失败:', error);
            });
    });
}

// PWA安装提示
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // 阻止默认的安装提示
    e.preventDefault();
    // 保存事件以便稍后使用
    deferredPrompt = e;
    console.log('PWA可以安装了');
    
    // 可以在这里显示自定义的安装按钮
    // showInstallButton();
});

// 监听PWA安装完成
window.addEventListener('appinstalled', () => {
    console.log('PWA已安装');
    deferredPrompt = null;
});

// 页面加载完成后初始化开始界面
window.addEventListener('load', () => {
    // 检查是否有保存的对话状态（可能来自之前的会话）
    const savedIndex = sessionStorage.getItem('dialogueCurrentIndex');
    if (savedIndex !== null) {
        sessionStorage.removeItem('dialogueCurrentIndex');
    }
    
    initStartScreen();
});
