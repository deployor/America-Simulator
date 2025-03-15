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
        this.failing = false;
        this.failTimer = 0;
        this.wobbleAmount = 0;
        this.wobbleSpeed = Math.random() * 0.05 + 0.02;
        this.wobbleOffset = Math.random() * Math.PI * 2;
        this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
        this.ringColor = `hsl(${Math.random() * 360}, 90%, 70%)`;
        this.approachTimer = 0;
        this.lifespan = 3000 + Math.random() * 2000;
        this.afraidDistance = 150;
        this.afraidFactor = 3;
        this.pulsePhase = 0;
        this.pulseSpeed = Math.random() * 0.05 + 0.03;
    }

    update(deltaTime, mouseX, mouseY) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.pulsePhase += this.pulseSpeed * deltaTime / 16;

        if (this.failing) {
            this.failTimer += deltaTime;
            if (this.failTimer > 500) {
                this.active = false;
            }
            this.alpha = Math.max(0, 1 - (this.failTimer / 500));
            this.radius = this.baseRadius * (1 + Math.sin(this.failTimer / 50) * 0.2);
            return;
        }
        
        if (this.fadeIn) {
            this.alpha = Math.min(1, this.alpha + 0.05);
            this.approachRadius = Math.max(this.radius, this.approachRadius - this.approachRate);
            
            // Check for failure condition - approach circle too close without being clicked
            if (this.approachRadius <= this.radius * 1.1 && !this.escaping) {
                this.fail();
                return;
            }
            
            if (this.approachRadius <= this.radius * 1.2) {
                this.fadeIn = false;
            }
        }
        
        if (distance < this.afraidDistance && !this.escaping) {
            this.escaping = true;
            
            const angle = Math.atan2(dy, dx);
            const newTargetX = this.x - Math.cos(angle) * this.afraidDistance * this.afraidFactor;
            const newTargetY = this.y - Math.sin(angle) * this.afraidDistance * this.afraidFactor;
            
            this.targetX = Math.max(this.radius, Math.min(this.game.canvas.width - this.radius, newTargetX));
            this.targetY = Math.max(this.radius, Math.min(this.game.canvas.height - this.radius, newTargetY));
        }

        const targetDx = this.targetX - this.x;
        const targetDy = this.targetY - this.y;
        const targetDistance = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
        
        if (targetDistance > 1) {
            this.x += targetDx * this.speed * (this.escaping ? 2 : 0.5) * deltaTime / 16;
            this.y += targetDy * this.speed * (this.escaping ? 2 : 0.5) * deltaTime / 16;
        } else {
            this.escaping = false;
        }
        
        // Apply some wobble motion even when not escaping to make it more interesting
        this.wobbleAmount = Math.sin(this.wobbleOffset + performance.now() * this.wobbleSpeed) * 2;
        this.x += this.wobbleAmount;
        
        this.lifespan -= deltaTime;
        if (this.lifespan <= 1000) {
            this.alpha = Math.max(0, this.lifespan / 1000);
        }
        
        if (this.lifespan <= 0) {
            this.active = false;
        }
    }

    fail() {
        if (!this.failing) {
            this.failing = true;
            this.game.registerFailure(this);
            this.game.audioManager.playSound('miss');
        }
    }

    draw(ctx) {
        if (this.failing) {
            this.drawFailingState(ctx);
            return;
        }
        
        // Pulse effect for the approach ring
        const pulseScale = 1 + Math.sin(this.pulsePhase) * 0.1;
        
        ctx.globalAlpha = this.alpha * 0.5;
        ctx.strokeStyle = this.ringColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.approachRadius * pulseScale, 0, Math.PI * 2);
        ctx.stroke();
        
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
        
        // Draw a little indicator of movement direction
        if (this.escaping) {
            const angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
            const arrowSize = this.radius * 0.8;
            
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(arrowSize * 0.7, arrowSize * 0.3);
            ctx.lineTo(arrowSize * 0.7, -arrowSize * 0.3);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fill();
            ctx.restore();
        }
        
        ctx.globalAlpha = 1;
    }
    
    drawFailingState(ctx) {
        const progress = this.failTimer / 500;
        const segments = 8;
        const segmentAngle = (Math.PI * 2) / segments;
        
        ctx.globalAlpha = this.alpha;
        
        // Draw exploding segments
        for (let i = 0; i < segments; i++) {
            const angle = i * segmentAngle;
            const distance = this.radius * progress * 2;
            const x = this.x + Math.cos(angle) * distance;
            const y = this.y + Math.sin(angle) * distance;
            const size = this.radius * (1 - progress) / 2;
            
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw shrinking center
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha * (1 - progress);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * (1 - progress), 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
    }
}
