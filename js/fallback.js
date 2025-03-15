class FallbackManager {
    constructor(game) {
        this.game = game;
        this.fallbackImages = {
            perfect: this.createFallbackImage('PERFECT', '#FFCC00'),
            good: this.createFallbackImage('GOOD', '#66CCFF'),
            miss: this.createFallbackImage('MISS', '#FF6666'),
            multiplier: this.createFallbackImage('×', '#FFCC00')
        };
    }

    createFallbackImage(text, color) {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(100, 100, 80, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(100, 100, 80, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 100, 100);
        
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }

    provideFallbackImage(type) {
        if (this.fallbackImages[type]) {
            return this.fallbackImages[type];
        }
        return null;
    }

    handleImageError(game) {
        if (!game.imagesLoaded) {
            for (const type in game.images) {
                game.images[type] = this.provideFallbackImage(type);
            }
            game.imagesLoaded = true;
        }
    }
}
