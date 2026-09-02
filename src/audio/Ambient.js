/**
 * Ambient — a calm but *active* generative lo-fi loop, built entirely with the
 * Web Audio API (no audio files). A warm pad + soft sub bass + a plucky arpeggio
 * running through a dub-style delay, a gentle kick and light hats, over a slow
 * mellow chord progression. Starts silent; fades in on the first user gesture.
 */
export default class Ambient {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = false;
    this.built = false;

    // sequencer
    this.bpm = 76;
    this.step = 0;
    this.nextTime = 0;
    this.lookahead = 0.12; // seconds scheduled ahead
    this.tickMs = 25;
    this._timer = null;
    this.volume = 0.3; // master target when on
  }

  get sixteenth() {
    return 60 / this.bpm / 4;
  }

  _noiseBuffer(seconds) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  _impulse(seconds, decay) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  _build() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = (this.ctx = new Ctx());

    const master = (this.master = ctx.createGain());
    master.gain.value = 0;

    // gentle master low-pass for lo-fi warmth
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 4200;
    tone.Q.value = 0.3;
    master.connect(tone);

    // reverb (synth impulse)
    const conv = ctx.createConvolver();
    conv.buffer = this._impulse(3.2, 2.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.32;
    const dry = ctx.createGain();
    dry.gain.value = 0.9;
    tone.connect(dry).connect(ctx.destination);
    tone.connect(conv).connect(wet).connect(ctx.destination);

    // dub delay bus for the plucks
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = this.sixteenth * 3; // dotted-8th echo
    const fb = ctx.createGain();
    fb.gain.value = 0.34;
    const delayWet = ctx.createGain();
    delayWet.gain.value = 0.5;
    delay.connect(fb).connect(delay);
    delay.connect(delayWet).connect(master);
    this._delayIn = delay;

    // airy noise texture, very low
    const noise = ctx.createBufferSource();
    noise.buffer = this._noiseBuffer(4);
    noise.loop = true;
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 1200;
    nf.Q.value = 0.5;
    const ng = ctx.createGain();
    ng.gain.value = 0.008;
    noise.connect(nf).connect(ng).connect(master);
    noise.start();

    this._hatBuf = this._noiseBuffer(0.2);
    this._setupMusic();
    this.built = true;
  }

  _setupMusic() {
    const N = {
      C2: 65.41, F2: 87.31, G2: 98.0, A2: 110.0,
      F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
      C5: 523.25,
    };
    // mellow vi–IV–I–V loop
    this.prog = [
      { root: N.A2, pad: [N.A3, N.C4, N.E4, N.G4], arp: [N.A3, N.C4, N.E4, N.G4, N.A4] }, // Am7
      { root: N.F2, pad: [N.F3, N.A3, N.C4, N.E4], arp: [N.F3, N.A3, N.C4, N.E4, N.F4] }, // Fmaj7
      { root: N.C2, pad: [N.C4, N.E4, N.G4, N.B4], arp: [N.C4, N.E4, N.G4, N.B4, N.C5] }, // Cmaj7
      { root: N.G2, pad: [N.G3, N.B3, N.D4, N.G4], arp: [N.G3, N.B3, N.D4, N.G4, N.A4] }, // G
    ];
    // 16-step arp pattern (indices into chord.arp, null = rest)
    this.pattern = [0, 2, 1, 3, null, 2, 4, null, 1, 3, 2, 0, null, 4, 2, null];
  }

  // ---- instruments (schedule at absolute time t) ----
  _pad(freqs, t, dur) {
    const ctx = this.ctx;
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i % 2 ? 'sine' : 'triangle';
      o.frequency.value = f;
      o.detune.value = Math.random() * 6 - 3;
      const g = ctx.createGain();
      o.connect(g).connect(this.master);
      const a = 0.9, r = 1.4, peak = 0.045;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + a);
      g.gain.setValueAtTime(peak, t + dur - r);
      g.gain.linearRampToValueAtTime(0, t + dur);
      o.start(t);
      o.stop(t + dur + 0.05);
    });
  }

  _bass(freq, t, dur, vol = 0.15) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    const g = ctx.createGain();
    o.connect(g).connect(this.master);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  _pluck(freq, t, vol = 0.085) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = freq;
    const g = ctx.createGain();
    const pan = ctx.createStereoPanner();
    pan.pan.value = (Math.random() * 2 - 1) * 0.5;
    o.connect(g);
    g.connect(pan).connect(this.master);
    g.connect(this._delayIn); // echo send
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.start(t);
    o.stop(t + 0.32);
  }

  _kick(t, vol = 0.17) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = 'sine';
    const g = ctx.createGain();
    o.connect(g).connect(this.master);
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.start(t);
    o.stop(t + 0.24);
  }

  _hat(t, vol = 0.02) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this._hatBuf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7500;
    const g = ctx.createGain();
    const pan = ctx.createStereoPanner();
    pan.pan.value = (Math.random() * 2 - 1) * 0.4;
    src.connect(hp).connect(g).connect(pan).connect(this.master);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    src.start(t);
    src.stop(t + 0.06);
  }

  _scheduleStep(step, t) {
    const bar = Math.floor(step / 16) % this.prog.length;
    const s = step % 16;
    const chord = this.prog[bar];
    const barLen = this.sixteenth * 16;

    if (s === 0) {
      this._pad(chord.pad, t, barLen);
      this._bass(chord.root, t, this.sixteenth * 6);
      this._kick(t);
    }
    if (s === 8) {
      this._bass(chord.root, t, this.sixteenth * 4, 0.11);
      this._kick(t, 0.13);
    }
    if (s % 4 === 2) this._hat(t);

    const idx = this.pattern[s];
    if (idx !== null && idx !== undefined) this._pluck(chord.arp[idx % chord.arp.length], t);
  }

  _scheduler() {
    const ctx = this.ctx;
    while (this.nextTime < ctx.currentTime + this.lookahead) {
      this._scheduleStep(this.step, this.nextTime);
      this.nextTime += this.sixteenth;
      this.step++;
    }
  }

  /** Toggle sound on/off with a smooth fade. Returns the new enabled state. */
  async toggle() {
    if (!this.built) this._build();
    if (this.ctx.state === 'suspended') await this.ctx.resume();

    this.enabled = !this.enabled;
    const now = this.ctx.currentTime;
    const g = this.master.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(this.enabled ? this.volume : 0.0, now + (this.enabled ? 1.6 : 0.9));

    if (this.enabled) {
      this.step = 0;
      this.nextTime = this.ctx.currentTime + 0.15;
      this._timer = setInterval(() => this._scheduler(), this.tickMs);
    } else if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    return this.enabled;
  }
}
