class Game {
    constructor(canvas, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;
        
        this.circles = [];
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
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
        
        // Background effects
        this.particles = [];
        this.maxParticles = 50;
        
        // Failure tracking
        this.failures = 0;
        this.maxFailuresAllowed = 5;
        
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        
        this.scoreElement = document.getElementById('score-value');
        this.comboElement = document.getElementById('combo-value');
        this.accuracyElement = document.getElementById('accuracy-value');
        this.multiplierElement = document.getElementById('multiplier-value');
        this.livesElement = document.getElementById('lives-value');
        
        this.pointsPerClick = 10;
        this.multiplier = 1;
        this.multiplierIncrement = 0.05;
        this.maxMultiplier = 5;
        
        this.popups = [];
        this.bgAngle = 0;
        
        this.loadImages();
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));
    }
    
    loadImages() {
        // Use fewer image objects to reduce memory usage
        this.images = {};
        
        // Create a single image loader with error handling
        const loadImage = (name, src, fallbackColor) => {
            const img = new Image();
            img.onload = () => console.log(`Loaded ${name} image`);
            img.onerror = () => {
                console.warn(`Failed to load ${name}, using canvas fallback`);
                this.images[name] = this.createFallbackImage(name.toUpperCase(), fallbackColor);
            };
            // Use smaller image size and format for better performance
            img.src = src;
            this.images[name] = img;
        };
        
        loadImage('perfect', 'assets/images/perfect.png', '#FFCC00');
        loadImage('good', 'assets/images/good.png', '#66CCFF');
        loadImage('miss', 'assets/images/miss.png', '#FF6666');
        loadImage('multiplier', 'assets/images/multiplier.png', '#FFCC00');
    }
    
    createFallbackImage(text, color) {
        // Create smaller fallback images to save memory
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(50, 50, 40, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(50, 50, 40, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 50, 50);
        
        return canvas;
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
        this.particles = [];
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.clicksTotal = 0;
        this.clicksHit = 0;
        this.multiplier = 1;
        this.popups = [];
        this.failures = 0;
        this.updateUI();
    }
    
    registerFailure(circle) {
        this.failures++;
        this.combo = 0;
        this.multiplier = Math.max(1, this.multiplier * 0.8);
        this.createPopup('miss', 0, circle.x, circle.y);
        
        // Create explosion particles
        for (let i = 0; i < 10; i++) {
            this.createParticle(circle.x, circle.y, circle.color);
        }
        
        this.updateUI();
        
        // Game over if too many failures
        if (this.failures >= this.maxFailuresAllowed) {
            setTimeout(() => {
                this.gameOver();
            }, 1000);
        }
    }
    
    gameOver() {
        alert(`Game Over! Final Score: ${this.score}`);
        this.stop();
        document.getElementById('menu').classList.add('active');
        document.getElementById('game').classList.remove('active');
    }
    
    createParticle(x, y, color) {
        const particle = {
            x,
            y,
            size: Math.random() * 5 + 2,
            speedX: (Math.random() - 0.5) * 5,
            speedY: (Math.random() - 0.5) * 5,
            color,
            life: 1,
            decay: 0.01 + Math.random() * 0.02
        };
        
        if (this.particles.length >= this.maxParticles) {
            this.particles.shift();
        }
        
        this.particles.push(particle);
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.speedX * deltaTime / 16;
            p.y += p.speedY * deltaTime / 16;
            p.speedY += 0.05; // gravity
            p.life -= p.decay * deltaTime / 16;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    drawParticles() {
        for (const p of this.particles) {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
    }
    
    drawBackground() {
        // Moving gradient background - very memory efficient
        this.bgAngle += 0.001;
        
        const gradient = this.ctx.createLinearGradient(
            this.canvas.width / 2 + Math.cos(this.bgAngle) * this.canvas.width / 2, 
            this.canvas.height / 2 + Math.sin(this.bgAngle) * this.canvas.height / 2,
            this.canvas.width / 2 - Math.cos(this.bgAngle) * this.canvas.width / 2,
            this.canvas.height / 2 - Math.sin(this.bgAngle) * this.canvas.height / 2
        );
        
        gradient.addColorStop(0, '#111');
        gradient.addColorStop(0.5, '#222');
        gradient.addColorStop(1, '#111');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw some ambient circles in the background
        const time = performance.now() / 1000;
        for (let i = 0; i < 5; i++) {
            const x = this.canvas.width * (0.2 + 0.6 * Math.sin(time * 0.1 + i * 1.3));
            const y = this.canvas.height * (0.2 + 0.6 * Math.cos(time * 0.13 + i * 1.1));
            const radius = 50 + 30 * Math.sin(time * 0.2 + i);
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${(time * 30 + i * 50) % 360}, 70%, 40%, 0.05)`;
            this.ctx.fill();
        }
    }
    
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        // Create small particle trail on mouse move
        if (this.isRunning && Math.random() < 0.3) {
            this.createParticle(
                this.mouseX, 
                this.mouseY, 
                `hsla(${Math.random() * 360}, 80%, 60%, 0.8)`
            );
        }
    }
    
    handleClick(e) {
        if (!this.isRunning) return;
        
        try {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            // Always create click particles
            for (let i = 0; i < 5; i++) {
                this.createParticle(clickX, clickY, `hsla(${Math.random() * 360}, 80%, 80%, 0.8)`);
            }
            
            let hitSomething = false;
            let closestDistance = Infinity;
            let closestCircle = null;
            
            for (const circle of this.circles) {
                if (circle.failing) continue;
                
                const dx = clickX - circle.x;
                const dy = clickY - circle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestCircle = circle;
                }
            }
            
            // Limit how close we can get for scoring purposes
            closestDistance = Math.max(50, closestDistance);
            
            if (closestCircle && closestDistance < 200) {
                // Cap the accuracy to prevent excessive scores
                const accuracy = Math.min(0.8, 1 - (closestDistance / 200));
                let pointsGained = Math.floor(this.pointsPerClick * this.multiplier * accuracy);
                
                // Cap the points per click to prevent extreme scores
                pointsGained = Math.min(200, pointsGained);
                
                this.score += pointsGained;
                this.clicksHit++;
                this.combo++;
                
                if (closestDistance < 100) {
                    this.multiplier = Math.min(this.maxMultiplier, this.multiplier + this.multiplierIncrement);
                    this.createPopup('perfect', pointsGained, clickX, clickY);
                    this.audioManager.playSound('hit');
                } else {
                    this.multiplier = Math.min(this.maxMultiplier, this.multiplier + this.multiplierIncrement / 2);
                    this.createPopup('good', pointsGained, clickX, clickY);
                    this.audioManager.playSound('hit');
                }
                
                if (this.combo > this.maxCombo) {
                    this.maxCombo = this.combo;
                }
                
                hitSomething = true;
            }
            
            if (!hitSomething) {
                this.audioManager.playSound('miss');
                this.combo = 0;
                this.multiplier = Math.max(1, this.multiplier - this.multiplierIncrement * 2);
                this.createPopup('miss', 0, clickX, clickY);
            }
            
            this.clicksTotal++;
            this.updateUI();
        } catch (error) {
            console.error("Error handling click:", error);
            this.audioManager.playSound('miss');
            this.clicksTotal++;
            this.updateUI();
        }
    }
    
    createPopup(type, points, x, y) {
        try {
            const popup = {
                type,
                points,
                x,
                y,
                alpha: 1,
                scale: 1,
                lifespan: 1000
            };
            
            // Limit the number of popups to prevent memory issues
            if (this.popups.length > 10) {
                this.popups.shift();
            }
            
            this.popups.push(popup);
        } catch (error) {
            console.error("Error creating popup:", error);
        }
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
        this.comboElement.textContent = this.combo;
        const accuracy = this.clicksTotal === 0 ? 0 : (this.clicksHit / this.clicksTotal * 100).toFixed(2);
        this.accuracyElement.textContent = accuracy;
        this.multiplierElement.textContent = this.multiplier.toFixed(1) + 'x';
        this.livesElement.textContent = this.maxFailuresAllowed - this.failures;
    }
    
    updatePopups(deltaTime) {
        for (let i = this.popups.length - 1; i >= 0; i--) {
            const popup = this.popups[i];
            popup.lifespan -= deltaTime;
            popup.y -= deltaTime * 0.1;
            
            if (popup.lifespan < 300) {
                popup.alpha = popup.lifespan / 300;
            }
            
            if (popup.lifespan <= 0) {
                this.popups.splice(i, 1);
            }
        }
    }
    
    drawPopups() {
        try {
            for (const popup of this.popups) {
                this.ctx.save();
                this.ctx.globalAlpha = popup.alpha;
                
                const image = this.images[popup.type];
                if (image) {
                    if (image.nodeName === 'CANVAS') {
                        // Using canvas-based fallback
                        this.ctx.drawImage(
                            image, 
                            popup.x - 40, 
                            popup.y - 40, 
                            80, 
                            80
                        );
                    } else if (image.complete && image.naturalWidth !== 0) {
                        // Using loaded image
                        this.ctx.drawImage(
                            image, 
                            popup.x - 40, 
                            popup.y - 40, 
                            80, 
                            80
                        );
                    }
                }
                
                if (popup.points > 0) {
                    this.ctx.font = 'bold 20px Arial';
                    this.ctx.fillStyle = '#FFFFFF';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(`+${popup.points}`, popup.x, popup.y + 50);
                }
                
                this.ctx.restore();
            }
        } catch (error) {
            console.error("Error drawing popups:", error);
        }
    }
    
    drawMultiplier() {
        try {
            if (this.multiplier > 1) {
                const x = 100;
                const y = this.canvas.height - 100;
                
                this.ctx.save();
                
                const image = this.images.multiplier;
                if (image) {
                    if (image.nodeName === 'CANVAS') {
                        this.ctx.drawImage(image, x - 30, y - 30, 60, 60);
                    } else if (image.complete && image.naturalWidth !== 0) {
                        this.ctx.drawImage(image, x - 30, y - 30, 60, 60);
                    }
                }
                
                this.ctx.font = 'bold 24px Arial';
                this.ctx.fillStyle = '#FFCC00';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`${this.multiplier.toFixed(1)}x`, x, y + 50);
                
                this.ctx.restore();
            }
        } catch (error) {
            console.error("Error drawing multiplier:", error);
        }
    }
    
    drawLives() {
        const livesLeft = this.maxFailuresAllowed - this.failures;
        const x = 100;
        const y = 60;
        
        this.ctx.save();
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillStyle = '#FF6666';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Lives: ${livesLeft}`, x, y);
        
        // Draw heart icons
        for (let i = 0; i < livesLeft; i++) {
            this.drawHeart(x + 100 + i * 30, y - 10, 12);
        }
        
        this.ctx.restore();
    }
    
    drawHeart(x, y, size) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + size / 4);
        this.ctx.bezierCurveTo(
            x, y - size / 2,
            x - size, y - size / 2,
            x - size, y + size / 4
        );
        this.ctx.bezierCurveTo(
            x - size, y + size,
            x, y + size * 1.5,
            x, y + size * 1.5
        );
        this.ctx.bezierCurveTo(
            x, y + size * 1.5,
            x + size, y + size,
            x + size, y + size / 4
        );
        this.ctx.bezierCurveTo(
            x + size, y - size / 2,
            x, y - size / 2,
            x, y + size / 4
        );
        this.ctx.fillStyle = '#FF6666';
        this.ctx.fill();
        this.ctx.restore();
    }
    
    gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        try {
            const deltaTime = Math.min(100, timestamp - this.lastFrameTime); // Cap delta time
            this.lastFrameTime = timestamp;
            
            // Clear using background rather than clearRect for better visuals
            this.drawBackground();
            
            if (timestamp - this.lastCircleTime > this.circleInterval) {
                this.spawnCircle();
                this.lastCircleTime = timestamp;
            }
            
            // Update and draw particles first (background layer)
            this.updateParticles(deltaTime);
            this.drawParticles();
            
            // Update and draw circles
            this.circles = this.circles.filter(circle => circle.active);
            this.circles.forEach(circle => {
                circle.update(deltaTime, this.mouseX, this.mouseY);
                circle.draw(this.ctx);
            });
            
            // Draw UI elements
            this.updatePopups(deltaTime);
            this.drawPopups();
            this.drawMultiplier();
            this.drawLives();
            
        } catch (error) {
            console.error("Error in game loop:", error);
        }
        
        // Use setTimeout instead of requestAnimationFrame for Safari optimization
        if (navigator.userAgent.indexOf('Safari') != -1 && 
            navigator.userAgent.indexOf('Chrome') == -1) {
            setTimeout(() => {
                requestAnimationFrame(this.gameLoop.bind(this));
            }, 1000 / 60); // Cap at 60fps for Safari
        } else {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
}
