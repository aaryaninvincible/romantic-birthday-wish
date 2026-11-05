// Romantic Ambient Melody & Sound Effects Generator using Web Audio API
class RomanticAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timer = null;
    this.volume = 0.35;
    this.currentStep = 0;

    // Romantic chord progression in F Major / D Minor (nostalgic, emotional, warm)
    this.chords = [
      // Fmaj9
      [174.61, 220.00, 261.63, 329.63, 392.00], // F3, A3, C4, E4, G4
      // Dm9
      [146.83, 220.00, 261.63, 329.63, 349.23], // D3, A3, C4, E4, F4
      // Bbmaj7
      [116.54, 174.61, 233.08, 293.66, 349.23], // Bb2, F3, Bb3, D4, F4
      // C9sus4 / C
      [130.81, 196.00, 261.63, 293.66, 392.00]  // C3, G3, C4, D4, G4
    ];

    this.melodyNotes = [
      349.23, 392.00, 440.00, 523.25, 440.00, 392.00, 349.23, 329.63,
      293.66, 329.63, 349.23, 440.00, 392.00, 349.23, 293.66, 261.63
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPianoNote(freq, time, duration = 2.5, gainVal = 0.2) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const oscHarmonic = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Warm low-pass filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.frequency.exponentialRampToValueAtTime(300, time + duration);

    // Sine + warm triangle for soft felt-piano tone
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.setValueAtTime(freq * 2, time);

    const harmonicGain = this.ctx.createGain();
    harmonicGain.gain.setValueAtTime(0.15, time);
    oscHarmonic.connect(harmonicGain);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(gainVal * this.volume, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(gainVal * this.volume * 0.6, time + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    harmonicGain.connect(gain);
    gain.connect(filter);
    filter.connect(this.ctx.destination);

    osc.start(time);
    oscHarmonic.start(time);
    osc.stop(time + duration);
    oscHarmonic.stop(time + duration);
  }

  playChime(freq = 880, duration = 1.2) {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25 * this.volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  playLoveSparkle() {
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C E G C E
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playChime(freq, 0.8);
      }, idx * 70);
    });
  }

  playCandleBlow() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 1.2);
    filter.Q.setValueAtTime(2, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3 * this.volume, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 1.5);
  }

  startMelody() {
    if (this.isPlaying) return;
    this.init();
    this.isPlaying = true;

    const tempoMs = 500; // 120 bpm eighth notes
    this.currentStep = 0;

    const loop = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const chordIndex = Math.floor((this.currentStep / 8) % this.chords.length);
      const chord = this.chords[chordIndex];

      // Arpeggiate chord notes
      const noteInChord = chord[this.currentStep % chord.length];
      this.playPianoNote(noteInChord, now, 2.0, 0.18);

      // Add gentle melody tone every 2 steps
      if (this.currentStep % 2 === 0) {
        const melNote = this.melodyNotes[(this.currentStep / 2) % this.melodyNotes.length];
        this.playPianoNote(melNote, now + 0.05, 2.8, 0.14);
      }

      this.currentStep++;
      this.timer = setTimeout(loop, tempoMs);
    };

    loop();
  }

  stopMelody() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stopMelody();
      return false;
    } else {
      this.startMelody();
      return true;
    }
  }
}

window.romanticAudio = new RomanticAudio();
