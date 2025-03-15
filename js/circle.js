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
        this.afraidDistance = 150;
        this.afraidFactor = 3;
    }

    update(deltaTime, mouseX, mouseY) {
        // Check the distance to mouse
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Update approach circle
        if (this.fadeIn) {
            this.alpha = Math.min(1, this.alpha + 0.05);
            this.approachRadius = Math.max(this.radius, this.approachRadius - this.approachRate);
            if (this.approachRadius <= this.radius * 1.2) {
                this.fadeIn = false;
            }
        }
        
        // If mouse gets close, run away!
        if (distance < this.afraidDistance && !this.escaping) {
            this.escaping = true;
            
            // Run in the opposite direction of the mouse
            const angle = Math.atan2(dy, dx);
            const newTargetX = this.x - Math.cos(angle) * this.afraidDistance * this.afraidFactor;
            const newTargetY = this.y - Math.sin(angle) * this.afraidDistance * this.afraidFactor;
            
            // Keep within canvas bounds
            this.targetX = Math.max(this.radius, Math.min(this.game.canvas.width - this.radius, newTargetX));
            this.targetY = Math.max(this.radius, Math.min(this.game.canvas.height - this.radius, newTargetY));
        }

        // Move toward target position
        const targetDx = this.targetX - this.x;
        const targetDy = this.targetY - this.y;
        const targetDistance = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
        
        if (targetDistance > 1) {
            this.x += targetDx * this.speed * (this.escaping ? 2 : 0.5) * deltaTime / 16;
            this.y += targetDy * this.speed * (this.escaping ? 2 : 0.5) * deltaTime / 16;
        } else {
            this.escaping = false;
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
