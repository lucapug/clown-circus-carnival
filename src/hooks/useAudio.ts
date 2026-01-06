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
    // Chopin's Funeral March - arcade reinterpretation
    // Strong march rhythm at ~60 BPM
    const G3 = 207.65, F3 = 185.00, A3 = 233.08, B3 = 246.94, C4 = 277.18;
    const D4 = 293.66, E4 = 329.63;
    
    const notes = [
      // Opening phrase: G#3 G#3 G#3 | G#3 (keep as is - user approved)
      { freq: G3, dur: 0.4, accent: true },
      { freq: G3, dur: 0.25 },
      { freq: G3, dur: 0.25 },
      { freq: G3, dur: 0.55, accent: true },
      // Main melodic phrase - rising with tension
      { freq: C4, dur: 0.45, accent: true },
      { freq: D4, dur: 0.35 },
      { freq: E4, dur: 0.5, accent: true },
      { freq: D4, dur: 0.3 },
      // Descending resolution phrase
      { freq: C4, dur: 0.4, accent: true },
      { freq: B3, dur: 0.3 },
      { freq: A3, dur: 0.35 },
      { freq: G3, dur: 0.45, accent: true },
      // Dramatic ending - echo and final
      { freq: A3, dur: 0.25 },
      { freq: G3, dur: 0.3 },
      { freq: F3, dur: 0.4, accent: true },
      { freq: G3, dur: 1.0, accent: true }, // Final held note
    ];
    
    let time = 0;
    notes.forEach(({ freq, dur, accent }) => {
      setTimeout(() => {
        const vol = accent ? 0.32 : 0.2;
        // Dark organ-like layered sound
        playTone(freq, dur * 0.9, 'sawtooth', vol);
        playTone(freq * 0.5, dur, 'triangle', vol * 0.5); // Sub-octave
        if (accent) {
          playTone(freq * 2, dur * 0.4, 'sine', 0.05); // Harmonic on accents
        }
      }, time * 1000);
      time += dur + 0.06;
    });
  }, [playTone]);

  const startBackgroundMusic = useCallback(() => {
    const ctx = getAudioContext();
    
    // Relaxing ambient melody with longer notes and softer tones
    const playAmbientLoop = () => {
      // Pentatonic scale for a calming, non-repetitive feel
      const ambientNotes = [
        { freq: 196, dur: 1.2 },   // G3
        { freq: 220, dur: 0.8 },   // A3
        { freq: 262, dur: 1.0 },   // C4
        { freq: 294, dur: 1.4 },   // D4
        { freq: 330, dur: 0.6 },   // E4
        { freq: 262, dur: 1.0 },   // C4
        { freq: 220, dur: 1.2 },   // A3
        { freq: 196, dur: 1.6 },   // G3
        { freq: 165, dur: 1.0 },   // E3
        { freq: 196, dur: 0.8 },   // G3
        { freq: 220, dur: 1.4 },   // A3
        { freq: 262, dur: 1.0 },   // C4
      ];
      
      let time = 0;
      ambientNotes.forEach(({ freq, dur }) => {
        setTimeout(() => {
          if (bgMusicRef.current !== null) {
            // Soft sine wave for relaxing sound
            playTone(freq, dur * 0.85, 'sine', 0.04);
            // Add subtle harmonic
            playTone(freq * 2, dur * 0.5, 'sine', 0.015);
          }
        }, time * 1000);
        time += dur * 0.7; // Overlap notes slightly for smoothness
      });
      
      // Loop with a pause
      setTimeout(() => {
        if (bgMusicRef.current !== null) {
          playAmbientLoop();
        }
      }, time * 1000 + 2000);
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
    
    playAmbientLoop();
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
