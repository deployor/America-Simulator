document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const menuScreen = document.getElementById('menu');
    const gameScreen = document.getElementById('game');
    const optionsScreen = document.getElementById('options');
    const playButton = document.getElementById('play-button');
    const optionsButton = document.getElementById('options-button');
    const backButton = document.getElementById('back-button');
    const optionsBackButton = document.getElementById('options-back');
    const musicVolumeSlider = document.getElementById('music-volume');
    const sfxVolumeSlider = document.getElementById('sfx-volume');
    const difficultySelect = document.getElementById('difficulty');
    const canvas = document.getElementById('game-canvas');
    
    // Initialize audio manager
    const audioManager = new AudioManager();
    
    // Initialize game
    const game = new Game(canvas, audioManager);
    
    // Show a specific screen and hide others
    function showScreen(screenId) {
        menuScreen.classList.remove('active');
        gameScreen.classList.remove('active');
        optionsScreen.classList.remove('active');
        
        document.getElementById(screenId).classList.add('active');
    }
    
    // Play button click handler
    playButton.addEventListener('click', () => {
        showScreen('game');
        game.start(difficultySelect.value);
    });
    
    // Options button click handler
    optionsButton.addEventListener('click', () => {
        showScreen('options');
    });
    
    // Back button click handler
    backButton.addEventListener('click', () => {
        game.stop();
        showScreen('menu');
    });
    
    // Options back button click handler
    optionsBackButton.addEventListener('click', () => {
        showScreen('menu');
    });
    
    // Music volume slider handler
    musicVolumeSlider.addEventListener('input', () => {
        const volume = musicVolumeSlider.value / 100;
        audioManager.setMusicVolume(volume);
    });
    
    // SFX volume slider handler
    sfxVolumeSlider.addEventListener('input', () => {
        const volume = sfxVolumeSlider.value / 100;
        audioManager.setSFXVolume(volume);
    });
    
    // Difficulty select handler
    difficultySelect.addEventListener('change', () => {
        game.setDifficulty(difficultySelect.value);
    });
});
