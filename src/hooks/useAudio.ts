import { useCallback, useRef } from 'react';

// Audio context for generating sounds
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const useAudio = () => {
  const bgMusicRef = useRef<OscillatorNode | null>(null);
  const bgGainRef = useRef<GainNode | null>(null);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'square', volume = 0.3) => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, []);

  const playPop = useCallback(() => {
    // Quick pop sound
    playTone(800, 0.05, 'square', 0.2);
    setTimeout(() => playTone(400, 0.05, 'square', 0.15), 30);
  }, [playTone]);

  const playBonus = useCallback(() => {
    // Ascending arpeggio for row clear
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, 'square', 0.25), i * 80);
    });
  }, [playTone]);

  const playDeath = useCallback(() => {
    // Descending sad tones
    const notes = [400, 350, 300, 250, 200];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sawtooth', 0.2), i * 120);
    });
  }, [playTone]);

  const playBounce = useCallback(() => {
    playTone(300, 0.08, 'triangle', 0.15);
  }, [playTone]);

  const playGameOver = useCallback(() => {
    // Funeral march style
    const notes = [
      { freq: 294, dur: 0.4 }, // D
      { freq: 294, dur: 0.2 }, // D
      { freq: 294, dur: 0.2 }, // D
      { freq: 294, dur: 0.6 }, // D (long)
      { freq: 349, dur: 0.4 }, // F
      { freq: 330, dur: 0.4 }, // E
      { freq: 294, dur: 0.4 }, // D
      { freq: 262, dur: 0.6 }, // C (long)
    ];
    
    let time = 0;
    notes.forEach(({ freq, dur }) => {
      setTimeout(() => playTone(freq, dur, 'sawtooth', 0.3), time * 1000);
      time += dur + 0.1;
    });
  }, [playTone]);

  const startBackgroundMusic = useCallback(() => {
    const ctx = getAudioContext();
    
    // Simple looping melody
    const playMelody = () => {
      const melody = [
        { freq: 262, dur: 0.2 }, // C
        { freq: 294, dur: 0.2 }, // D
        { freq: 330, dur: 0.2 }, // E
        { freq: 349, dur: 0.2 }, // F
        { freq: 392, dur: 0.4 }, // G
        { freq: 349, dur: 0.2 }, // F
        { freq: 330, dur: 0.2 }, // E
        { freq: 294, dur: 0.4 }, // D
      ];
      
      let time = 0;
      melody.forEach(({ freq, dur }) => {
        setTimeout(() => {
          if (bgMusicRef.current !== null) {
            playTone(freq, dur * 0.9, 'square', 0.08);
          }
        }, time * 1000);
        time += dur;
      });
      
      // Loop
      setTimeout(() => {
        if (bgMusicRef.current !== null) {
          playMelody();
        }
      }, time * 1000 + 500);
    };
    
    // Use a dummy oscillator to track if music is playing
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.connect(ctx.destination);
    osc.start();
    bgMusicRef.current = osc;
    bgGainRef.current = gain;
    
    playMelody();
  }, [playTone]);

  const stopBackgroundMusic = useCallback(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.stop();
      bgMusicRef.current = null;
    }
  }, []);

  return {
    playPop,
    playBonus,
    playDeath,
    playBounce,
    playGameOver,
    startBackgroundMusic,
    stopBackgroundMusic,
  };
};
