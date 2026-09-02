import * as THREE from 'three';
import TouchTexture from './TouchTexture.js';

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform float uTime;
  uniform float uAspect;
  uniform float uIntensity;
  uniform float uHover;
  uniform vec3  uBg;
  uniform vec3  uC1;
  uniform vec3  uC2;
  uniform vec3  uC3;
  uniform sampler2D uTouch;

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  // cheap 1-float hash for dithering
  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                   dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
               mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                   dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
  }

  // 6-octave fbm for finer, more detailed liquid
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p = m * p;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv;
    p.x *= uAspect;

    // pointer-driven displacement
    vec4 tch = texture2D(uTouch, uv);
    vec2 dir = tch.rg * 2.0 - 1.0;
    float strength = tch.b;
    vec2 disp = dir * strength;

    float t = uTime * 0.025;   // slower, calmer drift
    float scale = 2.0;

    // domain warping -> flowing liquid
    vec2 q = vec2(fbm(p * scale + t),
                  fbm(p * scale + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p * scale + 2.6 * q + vec2(1.7, 9.2) + 0.10 * t + disp * 1.3),
                  fbm(p * scale + 2.6 * q + vec2(8.3, 2.8) - 0.12 * t + disp * 1.3));
    float f = fbm(p * scale + 3.4 * r + disp * 2.0);

    // fine high-frequency filaments for extra detail
    float fine = fbm(p * scale * 3.0 + r * 1.5 - t * 1.4);

    float m1 = smoothstep(-0.30, 0.65, f);
    float m2 = smoothstep(0.00, 1.00, length(r));
    float m3 = clamp(q.x * 0.5 + 0.5, 0.0, 1.0);

    vec3 col = uBg;
    col = mix(col, uC1, m1);
    col = mix(col, uC2, m2 * 0.85);
    col = mix(col, uC3, smoothstep(0.35, 1.0, m3) * 0.65);

    // delicate sheen + wet highlight under the cursor
    col += uC3 * pow(clamp(f, 0.0, 1.0), 4.0) * 0.20;
    col += (uC2 + uC3) * 0.5 * strength * 1.2;

    // fine luminance filigree (the "finer" texture)
    col *= 1.0 + (fine - 0.5) * 0.07;

    float boost = mix(0.94, 1.12, uHover);
    col *= uIntensity * boost;

    // soft, deep vignette (keeps presence toward the edges)
    float vig = smoothstep(1.5, 0.1, length(uv - 0.5));
    col *= mix(0.78, 1.0, vig);

    // gentle desaturation -> elegant, less neon (but still rich)
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(lum), col, 0.94);

    // soft filmic compression so accents don't blow out
    col = col / (col + 0.42);
    col = pow(col, vec3(0.82));

    // ordered dithering removes banding across the dark gradients
    float dith = (hash12(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
    col += dith;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function hexToVec3(hex) {
  const c = new THREE.Color(hex);
  return new THREE.Vector3(c.r, c.g, c.b);
}

/**
 * LiquidSurface — a self-contained WebGL plane that fills `el` and renders an
 * animated liquid shader distorted by the pointer. Used for the hero and each
 * project card so the whole site shares one visual language.
 */
export default class LiquidSurface {
  constructor(el, opts = {}) {
    this.el = el;
    this.opts = opts;
    this.globalPointer = !!opts.globalPointer;
    this.dprCap = opts.dprCap ?? 2;
    this.visible = true;
    this.hoverTarget = 0;

    const colors = opts.colors || {};
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: !!opts.preserveBuffer,
    });
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.setClearColor(0x000000, 1);
    el.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();

    this.touch = new TouchTexture(128);

    this.uniforms = {
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uIntensity: { value: opts.intensity ?? 1.4 },
      uHover: { value: 0 },
      uBg: { value: hexToVec3(colors.bg || '#050505') },
      uC1: { value: hexToVec3(colors.c1 || '#3a1d8a') },
      uC2: { value: hexToVec3(colors.c2 || '#c81d6b') },
      uC3: { value: hexToVec3(colors.c3 || '#1fb6c9') },
      uTouch: { value: this.touch.texture },
    };

    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: this.uniforms,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);

    this.resize();
    this._ro = new ResizeObserver(() => this.resize());
    this._ro.observe(el);

    this._bindPointer();
  }

  _bindPointer() {
    if (this.globalPointer) {
      this._onMove = (e) => {
        this.touch.addTouch(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
      };
      window.addEventListener('pointermove', this._onMove, { passive: true });
    } else {
      this._onMove = (e) => {
        const rect = this.el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        if (x < 0 || x > 1 || y < 0 || y > 1) return;
        this.touch.addTouch(x, y);
      };
      this._onEnter = () => (this.hoverTarget = 1);
      this._onLeave = () => (this.hoverTarget = 0);
      this.el.addEventListener('pointermove', this._onMove, { passive: true });
      this.el.addEventListener('pointerenter', this._onEnter);
      this.el.addEventListener('pointerleave', this._onLeave);
    }
  }

  resize() {
    const w = this.el.clientWidth || 1;
    const h = this.el.clientHeight || 1;
    if (w < 2 || h < 2) return; // ignore collapsed layouts (e.g. hidden tab)
    const dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.uniforms.uAspect.value = w / h;
  }

  setVisible(v) {
    this.visible = v;
  }

  render(time) {
    if (!this.visible) return;
    this.touch.update();
    this.uniforms.uTime.value = time;
    // ease hover
    const u = this.uniforms.uHover;
    u.value += (this.hoverTarget - u.value) * 0.08;
    this.renderer.render(this.scene, this.camera);
  }

  /** Render a single static frame (used for reduced-motion). */
  renderStatic() {
    this.uniforms.uTime.value = 12.0;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this._ro?.disconnect();
    if (this.globalPointer) window.removeEventListener('pointermove', this._onMove);
    else {
      this.el.removeEventListener('pointermove', this._onMove);
      this.el.removeEventListener('pointerenter', this._onEnter);
      this.el.removeEventListener('pointerleave', this._onLeave);
    }
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.touch.texture.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
