// --- 3. 音效系统 (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

window.playSound = function(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    
    if (type === 'shot') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(GAME_CONFIG.AUDIO.SHOT.FREQ, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + GAME_CONFIG.AUDIO.SHOT.DURATION);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + GAME_CONFIG.AUDIO.SHOT.DURATION);
        osc.start(now);
        osc.stop(now + GAME_CONFIG.AUDIO.SHOT.DURATION);
    } else if (type === 'hit') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(GAME_CONFIG.AUDIO.HIT.FREQ, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + GAME_CONFIG.AUDIO.HIT.DURATION);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + GAME_CONFIG.AUDIO.HIT.DURATION);
        osc.start(now);
        osc.stop(now + GAME_CONFIG.AUDIO.HIT.DURATION);
    } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(GAME_CONFIG.AUDIO.GAMEOVER.FREQ, now);
        osc.frequency.linearRampToValueAtTime(50, now + GAME_CONFIG.AUDIO.GAMEOVER.DURATION);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + GAME_CONFIG.AUDIO.GAMEOVER.DURATION);
        osc.start(now);
        osc.stop(now + GAME_CONFIG.AUDIO.GAMEOVER.DURATION);
    }
}