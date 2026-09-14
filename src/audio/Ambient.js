/**
* Ambient — a calm but *active* generative lo-fi loop, built entirely with the
* Web Audio API (no audio files). A warm pad + soft sub bass + a plucky arpeggio
* running through a dub-style delay, a gentle kick and light hats, over a slow
* mellow chord progression. The UI can remember an "on" preference, while audio
* itself starts on the first user gesture to respect browser autoplay rules.
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
    this._request = 0;
    this.onStateChange = null;
    this.volume = 0.3; // master target when on

    // Weather beds (Aether page): the rain/storm scenes duck the lo-fi and play a
    // generated rain bed; storm adds thunder cued by the on-screen lightning.
    this.scene = 'none';
    this._musicMuted = false;
    this._rain = null;
    this._rainStopTimer = null;
  }

  get isPlaying() {
    return this.enabled && this.ctx?.state === 'running';
  }

  get sixteenth() {
    return 60 / this.bpm / 4;
  }

  _noiseBuffer(seconds) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);

    for (let i = 0; i < len; i++) {
      d[i] = Math.random() * 2 - 1;
    }

    return buf;
  }

  _brownNoiseBuffer(seconds) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;

    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + white * 0.02) / 1.02;
      d[i] = last * 3.5;
    }

    return buf;
  }

  _impulse(seconds, decay) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(2, len, this.ctx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);

      for (let i = 0; i < len; i++) {
        d[i] =
          (Math.random() * 2 - 1) *
          Math.pow(1 - i / len, decay);
      }
    }

    return buf;
  }

  _build() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = (this.ctx = new Ctx());

    ctx.addEventListener('statechange', () =>
      this.onStateChange?.(this.isPlaying)
    );

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

    // weather bed bus (rain + thunder)
    // under master, so the sound toggle governs it
    const weatherGain = (this._weatherGain = ctx.createGain());
    weatherGain.gain.value = 0;
    weatherGain.connect(master);

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

    noise
      .connect(nf)
      .connect(ng)
      .connect(master);

    noise.start();

    this._hatBuf = this._noiseBuffer(0.2);

    this._setupMusic();

    this.built = true;
  }

  _setupMusic() {
    const N = {
      C2: 65.41,
      F2: 87.31,
      G2: 98.0,
      A2: 110.0,

      F3: 174.61,
      G3: 196.0,
      A3: 220.0,
      B3: 246.94,

      C4: 261.63,
      D4: 293.66,
      E4: 329.63,
      F4: 349.23,
      G4: 392.0,
      A4: 440.0,
      B4: 493.88,

      C5: 523.25,
    };

    // mellow vi–IV–I–V loop
    this.prog = [
      {
        root: N.A2,
        pad: [N.A3, N.C4, N.E4, N.G4],
        arp: [N.A3, N.C4, N.E4, N.G4, N.A4],
      }, // Am7

      {
        root: N.F2,
        pad: [N.F3, N.A3, N.C4, N.E4],
        arp: [N.F3, N.A3, N.C4, N.E4, N.F4],
      }, // Fmaj7

      {
        root: N.C2,
        pad: [N.C4, N.E4, N.G4, N.B4],
        arp: [N.C4, N.E4, N.G4, N.B4, N.C5],
      }, // Cmaj7

      {
        root: N.G2,
        pad: [N.G3, N.B3, N.D4, N.G4],
        arp: [N.G3, N.B3, N.D4, N.G4, N.A4],
      }, // G
    ];

    // 16-step arp pattern
    // indices into chord.arp, null = rest
    this.pattern = [
      0,
      2,
      1,
      3,
      null,
      2,
      4,
      null,
      1,
      3,
      2,
      0,
      null,
      4,
      2,
      null,
    ];
  }

  // ---- instruments ---------------------------------------------------------

  _pad(freqs, t, dur) {
    const ctx = this.ctx;

    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();

      o.type = i % 2 ? 'sine' : 'triangle';
      o.frequency.value = f;
      o.detune.value = Math.random() * 6 - 3;

      const g = ctx.createGain();

      o
        .connect(g)
        .connect(this.master);

      const a = 0.9;
      const r = 1.4;
      const peak = 0.045;

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

    o
      .connect(g)
      .connect(this.master);

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

    g
      .connect(pan)
      .connect(this.master);

    // echo send
    g.connect(this._delayIn);

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

    o
      .connect(g)
      .connect(this.master);

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

    src
      .connect(hp)
      .connect(g)
      .connect(pan)
      .connect(this.master);

    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

    src.start(t);
    src.stop(t + 0.06);
  }

  _scheduleStep(step, t) {
    // a weather bed (rain/storm) is playing instead
    if (this._musicMuted) return;

    const bar =
      Math.floor(step / 16) %
      this.prog.length;

    const s = step % 16;

    const chord = this.prog[bar];

    const barLen =
      this.sixteenth * 16;

    if (s === 0) {
      this._pad(
        chord.pad,
        t,
        barLen
      );

      this._bass(
        chord.root,
        t,
        this.sixteenth * 6
      );

      this._kick(t);
    }

    if (s === 8) {
      this._bass(
        chord.root,
        t,
        this.sixteenth * 4,
        0.11
      );

      this._kick(
        t,
        0.13
      );
    }

    if (s % 4 === 2) {
      this._hat(t);
    }

    const idx =
      this.pattern[s];

    if (
      idx !== null &&
      idx !== undefined
    ) {
      this._pluck(
        chord.arp[
        idx %
        chord.arp.length
        ],
        t
      );
    }
  }

  _scheduler() {
    const ctx = this.ctx;

    while (
      this.nextTime <
      ctx.currentTime +
      this.lookahead
    ) {
      this._scheduleStep(
        this.step,
        this.nextTime
      );

      this.nextTime +=
        this.sixteenth;

      this.step++;
    }
  }

  // ---- weather beds (Aether page) -----------------------------------------

  // Continuous generated rain:
  // looped noise shaped with high-pass + low-pass filtering,
  // plus a gentle LFO so it breathes instead of sounding static.
  _startRain() {
    if (
      this._rain ||
      !this.ctx
    ) {
      return;
    }

    const ctx = this.ctx;

    clearTimeout(
      this._rainStopTimer
    );

    const src =
      ctx.createBufferSource();

    src.buffer =
      this._rainBuf ||
      (this._rainBuf =
        this._noiseBuffer(3));

    src.loop = true;

    const hp =
      ctx.createBiquadFilter();

    hp.type = 'highpass';
    hp.frequency.value = 220;

    const lp =
      ctx.createBiquadFilter();

    lp.type = 'lowpass';
    lp.frequency.value = 3000;
    lp.Q.value = 0.4;

    // Keep the rain dark and behind the scene rather than sounding like hiss.
    const g =
      ctx.createGain();

    g.gain.value = 0.28;

    src
      .connect(hp)
      .connect(lp)
      .connect(g)
      .connect(this._weatherGain);

    const lfo =
      ctx.createOscillator();

    lfo.frequency.value = 0.16;

    const lfoG =
      ctx.createGain();

    lfoG.gain.value = 0.015;

    lfo
      .connect(lfoG)
      .connect(g.gain);

    src.start();
    lfo.start();

    this._rain = {
      src,
      lfo,
      gain: g,
    };
  }

  _stopRain() {
    if (!this._rain) {
      return;
    }

    try {
      this._rain.src.stop();
    } catch (_) {
      /* already stopped */
    }

    try {
      this._rain.lfo.stop();
    } catch (_) {
      /* already stopped */
    }

    this._rain = null;
  }

  /**
  * One thunder crack that breaks into a distant right-channel rumble.
  */
  thunder() {
    if (
      !this.built ||
      !this.enabled ||
      this.scene !== 'storm'
    ) {
      return;
    }

    const ctx = this.ctx;
    const t = ctx.currentTime;

    // Duck only the rain, leaving the thunder at full strength.
    const rainGain =
      this._rain?.gain?.gain;

    if (rainGain) {
      rainGain.cancelScheduledValues(t);
      rainGain.setValueAtTime(
        rainGain.value,
        t
      );
      rainGain.linearRampToValueAtTime(
        0.12,
        t + 0.12
      );
      rainGain.linearRampToValueAtTime(
        0.28,
        t + 6.5
      );
    }

    const pan =
      ctx.createStereoPanner();

    pan.pan.value = 0.58;
    pan.connect(this._weatherGain);

    // Jagged broadband noise makes a crack without introducing a pitched hit.
    // Jagged broadband noise makes a crack without introducing a pitched hit.
    // Main crack + two short echoes for a more layered / echoing attack.
    const makeCrack = (offset, vol, panOff, hpFreq, lpStart) => {
      const crack = ctx.createBufferSource();
      crack.buffer = this._noiseBuffer(0.9);           // slightly shorter buffer

      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = hpFreq;                     // brighter on the main hit

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(lpStart, t + offset);
      lp.frequency.exponentialRampToValueAtTime(900, t + offset + 0.7);

      const g = ctx.createGain();
      const start = t + offset;

      // Fast, punchy envelope – more "snap" than the previous soft multi-peak
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(vol, start + 0.008);   // very fast attack
      g.gain.linearRampToValueAtTime(vol * 0.55, start + 0.035);
      g.gain.linearRampToValueAtTime(vol * 0.22, start + 0.09);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);

      const p = ctx.createStereoPanner();
      p.pan.value = 0.55 + panOff;

      crack.connect(hp).connect(lp).connect(g).connect(p).connect(this._weatherGain);

      crack.start(start);
      crack.stop(start + 0.9);
    };

    // Main sharp crack (closest to the reference)
    // makeCrack(0, 0.42, 0.00, 140, 4800);
    makeCrack(0, 0.42, 0.08, 140, 4800);
    // First tight echo / secondary crack (~45 ms later)
    // makeCrack(0.045, 0.26, 0.18, 180, 3400);
    makeCrack(0.045, 0.26, 0.22, 180, 3400);
    // Softer third layer (~95 ms)
    //makeCrack(0.095, 0.14, -0.12, 220, 2600);
    makeCrack(0.095, 0.14, -0.15, 220, 2600);

    const rumble =
      ctx.createBufferSource();

    rumble.buffer =
      this._rumbleBuf ||
      (this._rumbleBuf =
        this._brownNoiseBuffer(7));

    const rumbleFilter =
      ctx.createBiquadFilter();

    rumbleFilter.type =
      'lowpass';

    rumbleFilter.frequency.setValueAtTime(
      520,
      t
    );

    rumbleFilter.frequency.exponentialRampToValueAtTime(
      95,
      t + 6.8
    );

    const rumbleGain =
      ctx.createGain();

    rumbleGain.gain.setValueAtTime(
      0.0001,
      t
    );

    rumbleGain.gain.linearRampToValueAtTime(
      0.5,
      t + 0.22
    );

    rumbleGain.gain.linearRampToValueAtTime(
      0.28,
      t + 1.05
    );

    rumbleGain.gain.linearRampToValueAtTime(
      0.43,
      t + 1.75
    );

    rumbleGain.gain.linearRampToValueAtTime(
      0.2,
      t + 2.9
    );

    rumbleGain.gain.linearRampToValueAtTime(
      0.3,
      t + 3.7
    );

    rumbleGain.gain.exponentialRampToValueAtTime(
      0.0001,
      t + 6.8
    );

    rumble
      .connect(rumbleFilter)
      .connect(rumbleGain)
      .connect(pan);

    rumble.start(t);
    rumble.stop(t + 7);

    // A second brown-noise pass supplies sub-bass without a drum-like pitch.
    const sub =
      ctx.createBufferSource();

    sub.buffer = this._rumbleBuf;

    const subFilter =
      ctx.createBiquadFilter();

    subFilter.type = 'bandpass';
    subFilter.frequency.value = 72;
    subFilter.Q.value = 0.65;

    const subGain =
      ctx.createGain();

    subGain.gain.setValueAtTime(
      0.0001,
      t
    );
    subGain.gain.linearRampToValueAtTime(
      0.38,
      t + 0.45
    );
    subGain.gain.linearRampToValueAtTime(
      0.2,
      t + 2.2
    );
    subGain.gain.linearRampToValueAtTime(
      0.29,
      t + 3.2
    );
    subGain.gain.exponentialRampToValueAtTime(
      0.0001,
      t + 6.5
    );

    sub
      .connect(subFilter)
      .connect(subGain)
      .connect(pan);

    sub.start(t);
    sub.stop(t + 7);
  }

  /**
  * Reconcile the weather bed against the current on/off state and scene.
  */
  _updateAudio() {
    if (
      !this.built ||
      !this.ctx
    ) {
      return;
    }

    const weatherOn =
      this.enabled &&
      this.scene !== 'none';

    this._musicMuted =
      weatherOn;

    const now =
      this.ctx.currentTime;

    const wg =
      this._weatherGain.gain;

    wg.cancelScheduledValues(
      now
    );

    wg.setValueAtTime(
      wg.value,
      now
    );

    wg.linearRampToValueAtTime(
      weatherOn ? 1 : 0,
      now +
      (weatherOn
        ? 1.2
        : 0.7)
    );

    if (weatherOn) {
      this._startRain();
    } else {
      clearTimeout(
        this._rainStopTimer
      );

      this._rainStopTimer =
        setTimeout(() => {
          if (
            !(
              this.enabled &&
              this.scene !==
              'none'
            )
          ) {
            this._stopRain();
          }
        }, 800);
    }
  }

  /**
  * Aether page:
  *
  * 'rain' and 'storm' play the rain bed and duck the lo-fi.
  * Any other scene returns to the music.
  */
  setScene(name) {
    const scene =
      name === 'rain' ||
        name === 'storm'
        ? name
        : 'none';

    if (
      scene === this.scene
    ) {
      return;
    }

    this.scene = scene;

    this._updateAudio();
  }

  /**
  * Set sound on/off with a smooth fade.
  * Returns the resulting enabled state.
  */
  async setEnabled(enabled) {
    const request =
      ++this._request;

    const nextEnabled =
      Boolean(enabled);

    if (
      !nextEnabled &&
      !this.built
    ) {
      this.enabled = false;
      return false;
    }

    if (!this.built) {
      this._build();
    }

    if (
      nextEnabled &&
      this.ctx.state ===
      'suspended'
    ) {
      try {
        await this.ctx.resume();
      } catch (_) {
        /* waits for a trusted gesture */
      }
    }

    if (
      request !==
      this._request
    ) {
      return this.isPlaying;
    }

    this.enabled =
      nextEnabled;

    const now =
      this.ctx.currentTime;

    const g =
      this.master.gain;

    g.cancelScheduledValues(
      now
    );

    g.setValueAtTime(
      g.value,
      now
    );

    g.linearRampToValueAtTime(
      this.enabled
        ? this.volume
        : 0.0,
      now +
      (this.enabled
        ? 1.6
        : 0.9)
    );

    if (this.enabled) {
      if (!this._timer) {
        this.step = 0;

        this.nextTime =
          this.ctx.currentTime +
          0.15;

        this._timer =
          setInterval(
            () =>
              this._scheduler(),
            this.tickMs
          );
      }
    } else if (
      this._timer
    ) {
      clearInterval(
        this._timer
      );

      this._timer = null;
    }

    this._updateAudio();

    this.onStateChange?.(
      this.isPlaying
    );

    return this.isPlaying;
  }

  /**
  * Toggle sound on/off with a smooth fade.
  * Returns the new enabled state.
  */
  toggle() {
    return this.setEnabled(
      !this.enabled
    );
  }
}