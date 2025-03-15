class Circle {
    constructor(game, x, y, radius, speed) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.baseRadius = radius;
        this.speed = speed;
        this.targetX = x;
        this.targetY = y;
        this.approachRadius = radius * 3;
        this.approachRate = 0.8;
        this.alpha = 0;
        this.fadeIn = true;
        this.active = true;
        this.escaping = false;
        this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
        this.ringColor = `hsl(${Math.random() * 360}, 90%, 70%)`;
        this.approachTimer = 0;
        this.lifespan = 3000 + Math.random() * 2000; // 3-5 seconds
        this.afraidDistance = 300;
        this.afraidFactor = 3;
    }

    update(deltaTime, mouseX, mouseY) {
        // Check the distance to mouse
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        
        // Update approach circle
        if (this.fadeIn) {
            this.alpha = Math.min(1, this.alpha + 0.05);
            this.approachRadius = Math.max(this.radius, this.approachRadius - this.approachRate);
            if (this.approachRadius <= this.radius * 1.2) {
                this.fadeIn = false;
            }
        }
        
        let squareDistance = dx * dx + dy * dy;
        if (squareDistance < this.afraidDistance * this.afraidDistance) {
            let moveX = 10000/((dx * dx) * -Math.sign(dx))
            let moveY = 10000/((dy * dy) * -Math.sign(dy))
            this.x += moveX;
            this.y += moveY;
        }

        
        // Countdown lifespan
        this.lifespan -= deltaTime;
        if (this.lifespan <= 1000) {
            this.alpha = Math.max(0, this.lifespan / 1000);
        }
        
        // Mark as inactive when lifespan ends
        if (this.lifespan <= 0) {
            this.active = false;
        }
    }

    draw(ctx) {
        // Draw approaching circle
        ctx.globalAlpha = this.alpha * 0.5;
        ctx.strokeStyle = this.ringColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.approachRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw main circle
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Reset global alpha
        ctx.globalAlpha = 1;
    }
}
