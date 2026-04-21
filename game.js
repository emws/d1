// 游戏配置
const CONFIG = {
    levels: [
        { 
            name: "Kobold (狗头人)", 
            hp: 150, 
            attack: 8, 
            sequenceLength: 3, 
            timeLimit: 30, 
            img: "monster_kobold.png", 
            frames: 4, rows: 3,
            stateRows: { idle: 0, attack: 1, hurt: 2 }
        },
        { 
            name: "Alpha Wolf (头狼)", 
            hp: 300, 
            attack: 15, 
            sequenceLength: 4, 
            timeLimit: 40, 
            img: "monster_wolf.png", 
            frames: 4, rows: 3,
            stateRows: { idle: 0, attack: 1, hurt: 2 }
        },
        { 
            name: "Satyrs (萨特)", 
            hp: 500, 
            attack: 20, 
            sequenceLength: 5, 
            timeLimit: 50, 
            img: "monster_satyr.png", 
            frames: 4, rows: 3,
            stateRows: { idle: 0, attack: 1, hurt: 2 }
        },
        { 
            name: "Centaur (人马)", 
            hp: 800, 
            attack: 30, 
            sequenceLength: 6, 
            timeLimit: 60, 
            img: "monster_centaur.png", 
            frames: 4, rows: 3,
            stateRows: { idle: 0, attack: 1, hurt: 2 }
        },
        { 
            name: "Mud Golem (土偶)", 
            hp: 1200, 
            attack: 40, 
            sequenceLength: 7, 
            timeLimit: 70, 
            img: "monster_golem.png", 
            frames: 4, rows: 3,
            stateRows: { idle: 0, attack: 1, hurt: 2 }
        },
        { 
            name: "Roshan (肉山)", 
            hp: 3000, 
            attack: 60, 
            sequenceLength: 8, 
            timeLimit: 120, 
            img: "monster_roshan.png", 
            frames: 4, rows: 3,
            stateRows: { idle: 0, attack: 1, hurt: 2 }
        }
    ],
    heroes: {
        sf: {
            id: "sf",
            name: "Shadow Fiend (影魔)",
            maxHp: 250,
            maxMana: 150,
            baseDamage: 30,
            img: "sf_hero.png",
            frames: 4, rows: 3,
            stateRows: { idle: 0, attack: 1, hurt: 2 },
            skills: {
                z: { name: "影压(近)", cost: 30, damage: 100 },
                x: { name: "影压(中)", cost: 30, damage: 100 },
                c: { name: "影压(远)", cost: 30, damage: 100 },
                r: { name: "魂之挽歌", cost: 100, damage: 400 }
            }
        },
        cm: {
            id: "cm",
            name: "Crystal Maiden (冰女)",
            maxHp: 180,
            maxMana: 300,
            baseDamage: 25,
            img: "cm_hero.png",
            frames: 4, rows: 3,
            stateRows: { idle: 0, attack: 1, hurt: 2 },
            skills: {
                z: { name: "冰霜新星", cost: 40, damage: 80, effect: "slow" },
                x: { name: "冰封禁制", cost: 60, damage: 120, effect: "freeze" },
                c: { name: "辉煌光环", cost: 0, damage: 0, effect: "mana_regen" },
                r: { name: "极寒领域", cost: 150, damage: 500 }
            }
        },
        sniper: {
            id: "sniper",
            name: "Sniper (火枪)",
            maxHp: 200,
            maxMana: 120,
            baseDamage: 40,
            img: "sniper_hero.png",
            frames: 4, rows: 3,
            stateRows: { idle: 0, attack: 1, hurt: 2 },
            skills: {
                z: { name: "散弹", cost: 50, damage: 70, effect: "aoe" },
                x: { name: "爆头", cost: 0, damage: 30, effect: "passive" },
                c: { name: "瞄准", cost: 0, damage: 0, effect: "range" },
                r: { name: "暗杀", cost: 100, damage: 600 }
            }
        }
    },
    arrows: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"],
    arrowSymbols: {
        "ArrowUp": "↑",
        "ArrowDown": "↓",
        "ArrowLeft": "←",
        "ArrowRight": "→"
    }
};

// 实体类 (英雄和怪物通用)
class Entity {
    constructor(config, isHero) {
        this.config = config;
        this.isHero = isHero;
        this.x = isHero ? 100 : 550; // 稍微调整怪物位置
        this.y = 80; // 向上移动一点
        this.width = isHero ? 120 : 150; // 影魔体型大一点
        this.height = isHero ? 150 : 180;
        this.state = "idle"; // idle, attack, hurt
        this.frame = 0;
        this.frameTimer = 0;
        this.maxFrames = config.frames || 1;
        this.offsetX = 0; // 用于受击震动或攻击前冲
        this.img = new Image();
        this.img.src = config.img;
    }

    update() {
        // 动画帧循环
        this.frameTimer++;
        if (this.frameTimer > 10) { // 每10帧切换一次
            this.frame = (this.frame + 1) % this.maxFrames;
            this.frameTimer = 0;
            
            // 如果是攻击或受击状态，完成一轮后回到 idle
            if (this.state !== "idle" && this.frame === 0) {
                this.state = "idle";
                this.offsetX = 0;
            }
        }

        // 位移反馈逻辑
        if (this.state === "attack") {
            this.offsetX = this.isHero ? 20 : -20; // 攻击时前冲
        } else if (this.state === "hurt") {
            this.offsetX = (Math.random() - 0.5) * 10; // 受击时随机震动
        } else {
            this.offsetX = 0;
        }
    }

    draw(ctx) {
        if (this.img.complete && this.img.width > 0) {
            // 根据配置选择当前状态对应的行
            let row = 0;
            if (this.config.stateRows) {
                row = this.config.stateRows[this.state] || 0;
            } else {
                // 如果没有定义 stateRows (比如怪物)，则按老逻辑：0-idle, 1-attack, 2-hurt
                if (this.state === "attack") row = 1;
                if (this.state === "hurt") row = 2;
            }

            const totalCols = this.config.frames || 1;
            const totalRows = this.config.rows || 1;
            
            const sWidth = this.img.width / totalCols;
            const sHeight = this.img.height / totalRows;
            
            // 尝试裁剪掉顶部的文字标签（假设标签占每行高度的15%）
            const labelCropHeight = sHeight * 0.15;
            const actualSHeight = sHeight - labelCropHeight;
            
            // 帧循环逻辑
            const sx = (this.frame % totalCols) * sWidth;
            const sy = row * sHeight + labelCropHeight;

            ctx.save();
            ctx.translate(this.offsetX, 0);
            
            // 绘制倒影/阴影
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.beginPath();
            ctx.ellipse(this.x + this.width/2, this.y + this.height, this.width/3, this.height/10, 0, 0, Math.PI * 2);
            ctx.fill();

            // 绘制实体
            // 图片默认都是向右的，所以英雄（在左侧）不需要翻转
            // 怪物（在右侧）需要面向左，所以怪物需要翻转
            if (!this.isHero) { 
                // 怪物翻转（面向左）
                ctx.save();
                ctx.scale(-1, 1);
                // 翻转后坐标系也反了，需要调整绘制位置
                ctx.drawImage(this.img, sx, sy, sWidth, actualSHeight, -this.x - this.width, this.y, this.width, this.height);
                ctx.restore();
            } else {
                // 英雄保持原样（面向右）
                ctx.drawImage(this.img, sx, sy, sWidth, actualSHeight, this.x, this.y, this.width, this.height);
            }
            ctx.restore();
        } else {
            // 备选方案：绘制色块
            ctx.fillStyle = this.isHero ? "#3498db" : (this.config.color || "#e74c3c");
            ctx.fillRect(this.x + this.offsetX, this.y, this.width, this.height);
            
            // 为了便于区分，在色块上写字
            ctx.fillStyle = "#ffffff";
            ctx.font = "20px Arial";
            ctx.fillText(this.isHero ? "Hero" : "Boss", this.x + this.offsetX + 20, this.y + 60);
        }
    }

    playState(newState) {
        this.state = newState;
        this.frame = 0;
        this.frameTimer = 0;
    }
}

// 游戏状态
let state = {
    currentLevel: 0,
    selectedHeroId: 'sf', // 默认影魔
    heroHp: 0,
    heroMana: 0,
    monsterHp: 0,
    currentSequence: [],
    inputIndex: 0,
    combo: 0,
    isGameOver: false,
    timer: 0,
    lastMonsterAttack: 0,
    isPaused: true,
    projectiles: [],
    hero: null,
    monster: null
};

// DOM 元素 (将在 init 中初始化)
let elements = {};

// 初始化游戏
function init() {
    elements = {
        heroHpBar: document.getElementById('hero-hp'),
        heroManaBar: document.getElementById('hero-mana'),
        monsterHpBar: document.getElementById('monster-hp'),
        heroName: document.getElementById('hero-name'),
        monsterName: document.getElementById('monster-name'),
        levelText: document.getElementById('current-level'),
        sequenceContainer: document.getElementById('sequence-container'),
        comboDisplay: document.getElementById('combo-display'),
        messageDisplay: document.getElementById('message-display'),
        overlay: document.getElementById('overlay'),
        modalTitle: document.getElementById('modal-title'),
        modalContent: document.getElementById('modal-content'),
        restartBtn: document.getElementById('restart-btn'),
        heroSelection: document.getElementById('hero-selection'),
        canvas: document.getElementById('gameCanvas'),
        ctx: document.getElementById('gameCanvas').getContext('2d')
    };

    elements.canvas.width = 800;
    elements.canvas.height = 300;
    
    // 英雄选择点击事件
    document.querySelectorAll('.hero-card').forEach(card => {
        card.addEventListener('click', () => {
            const heroId = card.getAttribute('data-hero');
            selectHeroAndStart(heroId);
        });
    });

    elements.restartBtn.addEventListener('click', () => {
        showHeroSelection();
    });

    window.addEventListener('keydown', handleKeyDown);
    
    // 移动端触摸按钮事件
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const key = btn.getAttribute('data-key');
            
            // 模拟键盘事件
            if (CONFIG.arrows.includes(key)) {
                handleKeyDown({ code: key, preventDefault: () => {} });
            } else {
                handleKeyDown({ key: key, preventDefault: () => {} });
            }
        });
    });
    
    showHeroSelection();
    requestAnimationFrame(gameLoop);
}

function showHeroSelection() {
    state.isPaused = true;
    state.isGameOver = false;
    elements.overlay.classList.remove('hidden');
    elements.heroSelection.classList.remove('hidden');
    elements.restartBtn.classList.add('hidden');
    elements.modalTitle.innerText = "选择英雄";
    elements.modalContent.innerText = "";
}

function selectHeroAndStart(heroId) {
    state.selectedHeroId = heroId;
    const heroConfig = CONFIG.heroes[heroId];
    
    // 初始化英雄实体
    state.hero = new Entity(heroConfig, true);
    
    // 更新UI显示英雄名字和技能
    elements.heroName.innerText = heroConfig.name;
    updateSkillUI(heroConfig);
    
    startNewGame();
}

function updateSkillUI(heroConfig) {
    const skills = heroConfig.skills;
    document.getElementById('skill-q').innerText = `Z (${skills.z.name})`;
    document.getElementById('skill-w').innerText = `X (${skills.x.name})`;
    document.getElementById('skill-e').innerText = `C (${skills.c.name})`;
    document.getElementById('skill-r').innerText = `R (${skills.r.name})`;
}

function startNewGame() {
    const heroConfig = CONFIG.heroes[state.selectedHeroId];
    state.currentLevel = 0;
    state.heroHp = heroConfig.maxHp;
    state.heroMana = 0;
    state.combo = 0;
    state.isGameOver = false;
    state.isPaused = false;
    elements.overlay.classList.add('hidden');
    
    state.hero.playState("idle");
    loadLevel(0);
}

function loadLevel(levelIdx) {
    if (levelIdx >= CONFIG.levels.length) {
        winGame();
        return;
    }
    
    const level = CONFIG.levels[levelIdx];
    state.currentLevel = levelIdx;
    state.monsterHp = level.hp;
    state.timer = level.timeLimit;
    state.lastMonsterAttack = Date.now();
    
    // 初始化怪物
    state.monster = new Entity(level, false);
    
    elements.monsterName.innerText = level.name;
    elements.levelText.innerText = levelIdx + 1;
    elements.messageDisplay.innerText = `LEVEL ${levelIdx + 1}: ${level.name.toUpperCase()}`;
    elements.messageDisplay.style.color = "#fff";
    
    generateNewSequence();
    updateUI();
    
    setTimeout(() => {
        if (!state.isGameOver) elements.messageDisplay.innerText = "";
    }, 2000);
}

function generateNewSequence() {
    const level = CONFIG.levels[state.currentLevel];
    state.currentSequence = [];
    state.inputIndex = 0;
    
    for (let i = 0; i < level.sequenceLength; i++) {
        const randomArrow = CONFIG.arrows[Math.floor(Math.random() * CONFIG.arrows.length)];
        state.currentSequence.push(randomArrow);
    }
    
    renderSequence();
}

function renderSequence() {
    elements.sequenceContainer.innerHTML = '';
    state.currentSequence.forEach((arrow, idx) => {
        const div = document.createElement('div');
        div.className = 'arrow-icon';
        if (idx < state.inputIndex) div.classList.add('correct');
        div.innerText = CONFIG.arrowSymbols[arrow];
        elements.sequenceContainer.appendChild(div);
    });
}

function handleKeyDown(e) {
    if (state.isGameOver || state.isPaused) return;
    
    // 方向键逻辑
    if (CONFIG.arrows.includes(e.code)) {
        e.preventDefault();
        
        const expected = state.currentSequence[state.inputIndex];
        
        if (e.code === expected) {
            state.inputIndex++;
            // 立即渲染当前按下的反馈
            renderSequence();
            
            if (state.inputIndex === state.currentSequence.length) {
                // 延迟一小会儿再切换到下一组，让用户看清最后一个按键变绿
                setTimeout(() => {
                    completeSequence();
                }, 100);
            }
        } else {
            failSequence();
        }
    }
    
    // 技能键逻辑 (Z, X, C, R)
    const skillKey = e.key.toLowerCase();
    if (['z', 'x', 'c', 'r'].includes(skillKey)) {
        useSkill(skillKey);
    }
}

function useSkill(key) {
    const heroConfig = CONFIG.heroes[state.selectedHeroId];
    const skill = heroConfig.skills[key];
    const cost = skill.cost || 0;
    
    if (state.heroMana >= cost) {
        state.heroMana -= cost;
        state.hero.playState("attack");
        
        let damage = skill.damage || 0;
        let message = skill.name + "!";
        let color = "#fff";
        
        if (state.selectedHeroId === 'sf') {
            color = "#000000";
            const razeDistances = { z: 200, x: 450, c: 700 };
            if (key === 'r') {
                for(let i=0; i<12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    createProjectile(state.hero.x + state.hero.width/2, state.hero.y + state.hero.height/2, 
                                     state.hero.x + Math.cos(angle) * 800, state.hero.y + Math.sin(angle) * 800, 
                                     "#1a1a1a", damage / 12, "requiem");
                }
            } else {
                const dist = razeDistances[key];
                const razeX = state.hero.x + dist;
                const monsterRange = [state.monster.x - 50, state.monster.x + 100];
                const isHit = razeX >= monsterRange[0] && razeX <= monsterRange[1];
                createVFX(razeX, state.monster.y + state.monster.height/2, "shadowraze", isHit ? damage : 0);
            }
        } else if (state.selectedHeroId === 'cm') {
            color = "#3498db";
            if (key === 'r') {
                for(let i=0; i<20; i++) {
                    setTimeout(() => {
                        createVFX(state.monster.x + (Math.random()-0.5)*200, state.monster.y + (Math.random()-0.5)*200, "frost", 25);
                    }, i * 100);
                }
            } else {
                createProjectile(state.hero.x + state.hero.width, state.hero.y + state.hero.height/2, 
                                 state.monster.x, state.monster.y + state.monster.height/2, "#3498db", damage, "ice");
            }
        } else if (state.selectedHeroId === 'sniper') {
            color = "#e67e22";
            if (key === 'r') {
                createProjectile(state.hero.x + state.hero.width, state.hero.y + state.hero.height/2, 
                                 state.monster.x, state.monster.y + state.monster.height/2, "#e74c3c", damage, "assassinate");
            } else {
                createProjectile(state.hero.x + state.hero.width, state.hero.y + state.hero.height/2, 
                                 state.monster.x, state.monster.y + state.monster.height/2, "#f1c40f", damage, "bullet");
            }
        }
        
        elements.messageDisplay.innerText = message;
        elements.messageDisplay.style.color = color;
        
        updateUI();
        setTimeout(() => {
            if (!state.isGameOver) elements.messageDisplay.innerText = "";
        }, 1000);
    }
}

function completeSequence() {
    const heroConfig = CONFIG.heroes[state.selectedHeroId];
    // 英雄发起攻击动作
    state.hero.playState("attack");
    
    const damage = heroConfig.baseDamage + (state.combo * 2);
    
    // 根据英雄设置不同的普通攻击弹道颜色和消息
    let projectileColor = "#1a1a1a";
    let attackMessage = "ATTACK!";
    
    if (state.selectedHeroId === 'cm') {
        projectileColor = "#3498db";
        attackMessage = "FROST ATTACK!";
    } else if (state.selectedHeroId === 'sniper') {
        projectileColor = "#f1c40f";
        attackMessage = "FIRE!";
    } else {
        attackMessage = "SOUL ATTACK!";
    }

    createProjectile(
        state.hero.x + state.hero.width, 
        state.hero.y + state.hero.height/2, 
        state.monster.x, 
        state.monster.y + state.monster.height/2, 
        projectileColor, 
        damage, 
        "normal"
    );
    
    state.combo++;
    state.heroMana = Math.min(heroConfig.maxMana, state.heroMana + 15);
    
    // 视觉反馈
    elements.messageDisplay.innerText = attackMessage;
    elements.messageDisplay.style.color = projectileColor;
    
    generateNewSequence();
    updateUI();
    
    setTimeout(() => {
        if (!state.isGameOver) elements.messageDisplay.innerText = "";
    }, 500);
}

// 扩展 VFX 系统
let vfxs = [];
function createVFX(x, y, type, damage) {
    vfxs.push({
        x: x,
        y: y,
        type: type,
        damage: damage,
        timer: 0,
        maxTime: 30, // 持续 0.5 秒 (60fps)
        applied: false
    });
}

function updateVFX() {
    for (let i = vfxs.length - 1; i >= 0; i--) {
        const v = vfxs[i];
        v.timer++;
        
        // 影压/冰霜/子弹伤害判定
        if (!v.applied && v.timer > 10) {
            if (v.damage > 0) {
                state.monsterHp -= v.damage;
                state.monster.playState("hurt");
                if (state.monsterHp <= 0) {
                    state.monsterHp = 0;
                    loadLevel(state.currentLevel + 1);
                }
                updateUI();
            }
            v.applied = true;
        }
        
        if (v.timer > v.maxTime) {
            vfxs.splice(i, 1);
        }
    }
}

function createProjectile(startX, startY, targetX, targetY, color, damage, type) {
    state.projectiles.push({
        x: startX,
        y: startY,
        targetX: targetX,
        targetY: targetY,
        color: color,
        damage: damage,
        type: type,
        speed: type === "requiem" ? 5 : 12,
        reached: false
    });
}

function updateProjectiles() {
    state.projectiles.forEach((p, index) => {
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < p.speed) {
            p.x = p.targetX;
            p.y = p.targetY;
            if (!p.reached) {
                applyProjectileDamage(p);
                p.reached = true;
                state.projectiles.splice(index, 1);
            }
        } else {
            p.x += (dx / dist) * p.speed;
            p.y += (dy / dist) * p.speed;
        }
    });
}

function applyProjectileDamage(p) {
    if (p.type === "monster") {
        state.heroHp -= p.damage;
        state.hero.playState("hurt");
    } else {
        state.monsterHp -= p.damage;
        state.monster.playState("hurt");
    }
    
    if (state.monsterHp <= 0) {
        state.monsterHp = 0;
        loadLevel(state.currentLevel + 1);
    }
    updateUI();
}

function failSequence() {
    state.combo = 0;
    elements.messageDisplay.innerText = "MISS!";
    elements.messageDisplay.style.color = "#e74c3c";
    
    // 震动效果或惩罚逻辑
    generateNewSequence();
    updateUI();
    
    setTimeout(() => {
        if (!state.isGameOver) elements.messageDisplay.innerText = "";
    }, 500);
}

function updateUI() {
    // 更新血条
    const heroConfig = CONFIG.heroes[state.selectedHeroId];
    const heroHpPercent = (state.heroHp / heroConfig.maxHp) * 100;
    elements.heroHpBar.style.width = `${heroHpPercent}%`;
    
    const level = CONFIG.levels[state.currentLevel];
    if (level) {
        const monsterHpPercent = (state.monsterHp / level.hp) * 100;
        elements.monsterHpBar.style.width = `${monsterHpPercent}%`;
    }
    
    const manaPercent = (state.heroMana / heroConfig.maxMana) * 100;
    elements.heroManaBar.style.width = `${manaPercent}%`;
    
    elements.comboDisplay.innerText = `Combo x${state.combo}`;
    
    // 更新技能状态 (根据 mana)
    const skills = heroConfig.skills;
    document.getElementById('skill-q').classList.toggle('active', state.heroMana >= (skills.z.cost || 0));
    document.getElementById('skill-w').classList.toggle('active', state.heroMana >= (skills.x.cost || 0));
    document.getElementById('skill-e').classList.toggle('active', state.heroMana >= (skills.c.cost || 0));
    document.getElementById('skill-r').classList.toggle('active', state.heroMana >= (skills.r.cost || 0));
}

function gameLoop() {
    if (!state.isGameOver && !state.isPaused) {
        const now = Date.now();
        const level = CONFIG.levels[state.currentLevel];
        
        // 更新实体动画
        if (state.hero) state.hero.update();
        if (state.monster) state.monster.update();
        
        // 怪兽周期性攻击
        if (now - state.lastMonsterAttack > 2000) { // 每2秒攻击一次
            state.lastMonsterAttack = now;
            state.monster.playState("attack");
            
            // 怪物攻击弹道 (从右往左)
            createProjectile(600, 160, 180, 160, "#e74c3c", level.attack, "monster");
            
            updateUI();
            
            if (state.heroHp <= 0) {
                state.heroHp = 0;
                gameOver("Your hero has fallen!");
            }
        }
        
        updateProjectiles();
        updateVFX();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

function draw() {
    const { ctx, canvas } = elements;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, "#1a1a2e");
    bgGradient.addColorStop(1, "#16213e");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制地面
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 220, canvas.width, 80);

    // 绘制英雄
    if (state.hero) state.hero.draw(ctx);
    
    // 绘制怪兽
    if (state.monster) state.monster.draw(ctx);

    // 绘制弹道
    state.projectiles.forEach(p => {
        if (p.type === "requiem" || p.type === "normal") {
            // 影魔灵魂弹道：带拖尾的黑色圆点
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.type === "requiem" ? 12 : 6, 0, Math.PI * 2);
            ctx.fill();
            
            // 拖尾效果
            for(let i=1; i<=3; i++) {
                ctx.globalAlpha = 0.4 / i;
                ctx.beginPath();
                ctx.arc(p.x - (p.targetX - p.x)/10 * i, p.y - (p.targetY - p.y)/10 * i, 6 - i, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;
        } else {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 15, 4);
        }
    });

    // 绘制 VFX (如影压)
    vfxs.forEach(v => {
        ctx.save();
        const alpha = 1 - (v.timer / v.maxTime);
        ctx.globalAlpha = alpha;

        if (v.type === "shadowraze") {
            // 绘制黑色垂直爆发柱
            const gradient = ctx.createLinearGradient(v.x, v.y + 50, v.x, v.y - 150);
            gradient.addColorStop(0, "rgba(0, 0, 0, 0.8)");
            gradient.addColorStop(0.5, "rgba(30, 0, 50, 0.9)");
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            
            ctx.fillStyle = gradient;
            const width = 60 * (1 + v.timer/10); // 逐渐变宽
            ctx.fillRect(v.x - width/2, v.y - 150, width, 200);
            
            // 内部紫色核心
            ctx.fillStyle = "rgba(100, 0, 150, 0.5)";
            ctx.fillRect(v.x - width/4, v.y - 120, width/2, 170);
        } else if (v.type === "frost") {
            // 冰霜特效
            const rad = 20 + v.timer;
            const grad = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, rad);
            grad.addColorStop(0, "rgba(255,255,255,0.8)");
            grad.addColorStop(1, "rgba(52, 152, 219, 0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(v.x, v.y, rad, 0, Math.PI*2);
            ctx.fill();
        }
        
        ctx.restore();
    });
}

function gameOver(reason) {
    state.isGameOver = true;
    elements.overlay.classList.remove('hidden');
    elements.heroSelection.classList.add('hidden');
    elements.restartBtn.classList.remove('hidden');
    elements.modalTitle.innerText = "游戏结束";
    elements.modalContent.innerText = reason;
}

function winGame() {
    state.isGameOver = true;
    elements.overlay.classList.remove('hidden');
    elements.heroSelection.classList.add('hidden');
    elements.restartBtn.classList.remove('hidden');
    elements.modalTitle.innerText = "胜利！";
    elements.modalContent.innerText = "你击败了所有怪物，守护了遗迹！";
}

// 启动
window.onload = () => {
    init();
    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker Registered'))
            .catch(err => console.log('Service Worker Failed', err));
    }
};
