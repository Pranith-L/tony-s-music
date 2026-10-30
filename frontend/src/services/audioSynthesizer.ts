/**
 * Devotional Web Audio Harmonic Synthesizer
 * 
 * Provides an instant, warm, high-fidelity devotional acoustic sound generator.
 * Automatically activates whenever a remote audio file is unreachable, offline,
 * or still syncing to cloud storage, ensuring audio output is ALWAYS heard.
 */

class DevotionalAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private currentVolume: number = 0.85;
  private chordInterval: any = null;

  private chords = [
    // Sacred praise chords (frequencies in Hz, tuned around 432Hz harmonic warmth)
    [216.0, 270.0, 324.0, 432.0], // C chord warmth
    [192.0, 240.0, 288.0, 384.0], // G chord warmth
    [228.0, 285.0, 342.0, 456.0], // Am chord warmth
    [180.0, 225.0, 270.0, 360.0], // F chord warmth
  ];
  private chordIndex = 0;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.currentVolume * 0.25, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
  }

  public async start() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.isRunning) return;
    this.isRunning = true;

    this.playNextChord();
    this.chordInterval = setInterval(() => {
      if (this.isRunning) {
        this.playNextChord();
      }
    }, 4500);
  }

  private playNextChord() {
    if (!this.ctx || !this.masterGain || !this.isRunning) return;

    // Fade out previous oscillators
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.oscillators = [];

    const chord = this.chords[this.chordIndex % this.chords.length];
    this.chordIndex++;

    const now = this.ctx.currentTime;

    chord.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Soft sine & triangle for sacred flute/organ warmth
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Gentle attack and release envelope
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.08 / (i + 1), now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 4.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 4.5);
      this.oscillators.push(osc);
    });
  }

  public pause() {
    this.isRunning = false;
    if (this.chordInterval) {
      clearInterval(this.chordInterval);
      this.chordInterval = null;
    }
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.oscillators = [];
  }

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.currentVolume * 0.25, this.ctx.currentTime);
    }
  }

  public isActive(): boolean {
    return this.isRunning;
  }
}

export const devotionalSynthesizer = new DevotionalAudioSynthesizer();
