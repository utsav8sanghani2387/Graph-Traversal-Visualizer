// Lightweight Web Audio API synthesizer for tactile interface feedback

class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = false;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playStep(freq = 440, type: OscillatorType = 'sine') {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Audio autoplay policy catch
    }
  }

  playVisit() {
    this.playStep(587.33, 'triangle'); // D5
  }

  playEnqueue() {
    this.playStep(523.25, 'sine'); // C5
  }

  playComplete() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C - E - G - C
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playStep(freq, 'sine');
        }, idx * 110);
      });
    } catch {
      // Audio catch
    }
  }
}

export const sound = new SoundEffects();
