import * as THREE from 'three';

const VERT = /* glsl */ `
  attribute float aScale;
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  uniform float uDpr;
  uniform vec2  uMouse;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    float s = aSeed * 6.2831853;

    // slow, calm drift around the anchor position
    pos.x += sin(uTime * 0.10 + s) * 0.35;
    pos.y += cos(uTime * 0.12 + s * 1.3) * 0.35;
    pos.z += sin(uTime * 0.08 + s * 0.7) * 0.35;

    // depth-based parallax toward the cursor
    float depth = pos.z + 6.0;
    pos.xy += uMouse * (0.15 + depth * 0.06);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * uDpr * (16.0 / -mv.z);

    // fade with distance so the field dissolves into the dark
    vAlpha = smoothstep(-14.0, -2.0, mv.z);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * 0.6 * vAlpha);
  }
`;

/**
 * A soft, slow-drifting field of glowing particles with cursor parallax.
 * Rendered on its own transparent canvas layered above the hero fluid.
 */
export default class Particles {
  constructor(el, opts = {}) {
    this.el = el;
    this.count = opts.count ?? 1400;
    this.dprCap = opts.dprCap ?? 2;
    this.visible = true;
    this.mouse = new THREE.Vector2(0, 0);
    this.targetMouse = new THREE.Vector2(0, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: !!opts.preserveBuffer,
    });
    this.renderer.setClearColor(0x000000, 0);
    el.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    this.camera.position.z = 6;

    const positions = new Float32Array(this.count * 3);
    const scales = new Float32Array(this.count);
    const seeds = new Float32Array(this.count);
    for (let i = 0; i < this.count; i++) {
      positions[i * 3 + 0] = (Math.random() * 2 - 1) * 7.5;
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * 5.0;
      positions[i * 3 + 2] = (Math.random() * 2 - 1) * 5.0 - 1.0;
      scales[i] = 0.3 + Math.random() * Math.random() * 1.4;
      seeds[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    this.uniforms = {
      uTime: { value: 0 },
      uSize: { value: opts.size ?? 2.4 },
      uDpr: { value: 1 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color(opts.color || '#cdd6e6') },
    };

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: this.uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.scene.add(this.points);

    this.resize();
    this._ro = new ResizeObserver(() => this.resize());
    this._ro.observe(el);

    this._onMove = (e) => {
      this.targetMouse.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1)
      );
    };
    window.addEventListener('pointermove', this._onMove, { passive: true });
  }

  resize() {
    const w = this.el.clientWidth || 1;
    const h = this.el.clientHeight || 1;
    if (w < 2 || h < 2) return; // ignore collapsed layouts (e.g. hidden tab)
    const dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.uniforms.uDpr.value = dpr;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  setVisible(v) {
    this.visible = v;
  }

  render(time) {
    if (!this.visible) return;
    this.mouse.lerp(this.targetMouse, 0.04);
    this.uniforms.uMouse.value.copy(this.mouse);
    this.uniforms.uTime.value = time;
    this.renderer.render(this.scene, this.camera);
  }

  renderStatic() {
    this.uniforms.uTime.value = 6.0;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this._ro?.disconnect();
    window.removeEventListener('pointermove', this._onMove);
    this.points.geometry.dispose();
    this.points.material.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
