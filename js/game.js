class Game {
    constructor(canvas, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;
        
        this.circles = [];
        this.score = 0;
        this.clicksTotal = 0;
        this.clicksHit = 0;
        
        this.circleInterval = 1000;
        this.lastCircleTime = 0;
        this.lastFrameTime = 0;
        this.isRunning = false;
        
        this.difficulty = 'normal';
        this.difficultySettings = {
            easy: { spawnRate: 1500, speed: 0.5, maxCircles: 5 },
            normal: { spawnRate: 1000, speed: 1, maxCircles: 10 },
            hard: { spawnRate: 700, speed: 1.5, maxCircles: 15 },
            impossible: { spawnRate: 500, speed: 2, maxCircles: 20 }
        };
        
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        
        this.scoreElement = document.getElementById('score-value');
        
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    start(difficulty) {
        this.difficulty = difficulty;
        this.circleInterval = this.difficultySettings[difficulty].spawnRate;
        
        this.reset();
        this.isRunning = true;
        this.audioManager.playSound('music');
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    stop() {
        this.isRunning = false;
        this.audioManager.stopSound('music');
    }
    
    reset() {
        this.circles = [];
        this.score = 0;
        this.clicksTotal = 0;
        this.clicksHit = 0;
        this.updateUI();
    }
    
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }
    
    handleClick(e) {
        if (!this.isRunning) return;
        
        this.audioManager.playSound('miss');
        this.clicksTotal++;
        this.updateUI();
    }
    
    spawnCircle() {
        const settings = this.difficultySettings[this.difficulty];
        
        if (this.circles.length >= settings.maxCircles) return;
        
        const radius = 30 + Math.random() * 20;
        
        const margin = radius * 2;
        let x, y, tooClose;
        
        do {
            x = margin + Math.random() * (this.canvas.width - margin * 2);
            y = margin + Math.random() * (this.canvas.height - margin * 2);
            
            const dx = x - this.mouseX;
            const dy = y - this.mouseY;
            const distanceFromMouse = Math.sqrt(dx * dx + dy * dy);
            
            tooClose = distanceFromMouse < 200;
            
        } while (tooClose);
        
        const circle = new Circle(this, x, y, radius, settings.speed);
        this.circles.push(circle);
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
    }
    
    gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (timestamp - this.lastCircleTime > this.circleInterval) {
            this.spawnCircle();
            this.lastCircleTime = timestamp;
        }
        
        this.circles = this.circles.filter(circle => circle.active);
        this.circles.forEach(circle => {
            this.score += parseInt(circle.update(deltaTime, this.mouseX, this.mouseY));
            circle.draw(this.ctx);
        });
        this.updateUI();
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}
