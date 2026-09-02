import * as THREE from 'three';

/**
 * TouchTexture
 * A small 2D canvas that records the pointer trail and encodes it into a texture:
 *   R,G channels -> movement direction  (0.5 = neutral)
 *   B channel    -> strength / freshness of the touch
 * The fluid shader samples this to push the liquid around the cursor.
 */
export default class TouchTexture {
  constructor(size = 128) {
    this.size = size;
    this.maxAge = 64; // frames a trail point lives
    this.radius = size * 0.14;
    this.points = [];
    this.last = null;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = size;
    this.ctx = this.canvas.getContext('2d');
    this.clear();

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.wrapS = this.texture.wrapT = THREE.ClampToEdgeWrapping;
  }

  clear() {
    // Neutral: no direction (127), no strength (0)
    this.ctx.fillStyle = 'rgb(127,127,0)';
    this.ctx.fillRect(0, 0, this.size, this.size);
  }

  /** x,y normalized [0..1] with y measured from the top (pointer space). */
  addTouch(x, y) {
    let force = 0;
    let vx = 0;
    let vy = 0;
    const last = this.last;
    if (last) {
      const dx = x - last.x;
      const dy = y - last.y;
      const dd = dx * dx + dy * dy;
      const d = Math.sqrt(dd) || 1;
      vx = dx / d;
      vy = dy / d;
      force = Math.min(dd * 9000, 1);
    }
    this.last = { x, y };
    this.points.push({ x, y, age: 0, force, vx, vy });
  }

  update() {
    const { ctx, size } = this;
    this.clear();

    for (let i = this.points.length - 1; i >= 0; i--) {
      const p = this.points[i];
      p.age++;
      if (p.age > this.maxAge) {
        this.points.splice(i, 1);
        continue;
      }
      const t = p.age / this.maxAge;
      const strength = (1 - t) * p.force;
      const px = p.x * size;
      const py = p.y * size;
      const r = this.radius * (0.6 + 0.4 * (1 - t));

      const cr = Math.floor(127 + p.vx * 127);
      const cg = Math.floor(127 + p.vy * 127);
      const cb = Math.floor(strength * 255);

      const grad = ctx.createRadialGradient(px, py, 0, px, py, r);
      grad.addColorStop(0, `rgba(${cr},${cg},${cb},${1 - t})`);
      grad.addColorStop(1, `rgba(${cr},${cg},0,0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    this.texture.needsUpdate = true;
  }
}
