class AudioManager {
    constructor() {
        this.sounds = {
            miss: new Audio('assets/sounds/miss.mp3'),
            music: new Audio('assets/sounds/background.mp3')
        };
        
        this.sounds.music.loop = true;
        this.sounds.music.volume = 0.5;
        
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        
        this.setMusicVolume(this.musicVolume);
        this.setSFXVolume(this.sfxVolume);
    }
    
    playSound(soundName) {
        if (this.sounds[soundName]) {
            if (soundName !== 'music') {
                const sound = this.sounds[soundName].cloneNode();
                sound.volume = this.sfxVolume;
                sound.play();
            } else {
                this.sounds[soundName].play();
            }
        }
    }
    
    stopSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].pause();
            this.sounds[soundName].currentTime = 0;
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = volume;
        this.sounds.music.volume = volume;
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = volume;
    }
}
