export class SoundSystem {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private getCtx(): AudioContext {
    if (!this.ctx) { this.ctx = new AudioContext(); }
    return this.ctx;
  }

  private play(freq: number, dur: number, type: OscillatorType = 'sine', vol: number = 0.1) {
    if (!this.enabled || typeof window === 'undefined') return;
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.type = type;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + dur);
    } catch (e) {}
  }

  addToCart() { this.play(800, 0.15); setTimeout(() => this.play(1000, 0.1), 100); }
  removeFromCart() { this.play(600, 0.15); setTimeout(() => this.play(400, 0.1), 100); }
  wishlist() { this.play(1200, 0.2); setTimeout(() => this.play(1500, 0.15), 150); }
  success() { this.play(600, 0.1); setTimeout(() => this.play(800, 0.1), 100); setTimeout(() => this.play(1000, 0.2), 200); }
  error() { this.play(300, 0.2, 'sawtooth', 0.05); }
  click() { this.play(1000, 0.05, 'sine', 0.04); }
  toggle(enabled: boolean) { this.enabled = enabled; }
}

export const sounds = new SoundSystem();
