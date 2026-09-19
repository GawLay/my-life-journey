import * as THREE from 'three';

const RADIUS = 1;
const DEG = Math.PI / 180;
const COMPOSITION_YAW = -45 * DEG;

function latLngToVector(lat, lng) {
  const latR = lat * DEG;
  const lngR = lng * DEG;
  return new THREE.Vector3(
    Math.cos(latR) * Math.cos(lngR),
    Math.sin(latR),
    -Math.cos(latR) * Math.sin(lngR)
  );
}

function pointInRing(point, ring) {
  const [lng, lat] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const crosses = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi || Number.EPSILON) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

function pointInPolygon(point, polygon) {
  if (!polygon.length || !pointInRing(point, polygon[0])) return false;
  return !polygon.slice(1).some((hole) => pointInRing(point, hole));
}

function pointInFeature(point, feature) {
  const { type, coordinates } = feature.geometry;
  if (type === 'Polygon') return pointInPolygon(point, coordinates);
  if (type === 'MultiPolygon') return coordinates.some((polygon) => pointInPolygon(point, polygon));
  return false;
}

export default class Globe {
  constructor(element, options = {}) {
    this.element = element;
    const styles = getComputedStyle(document.documentElement);
    const token = (name) => styles.getPropertyValue(name).trim();
    this.palette = {
      ocean: token('--charcoal'),
      land: token('--globe-land'),
      line: token('--globe-line'),
      visited: token('--amber'),
      active: token('--accent-glow'),
      mist: token('--cream'),
      shade: token('--sage'),
      grid: `rgba(${token('--mist-rgb')}, .11)`,
    };
    this.places = options.places || [];
    this.onSelect = options.onSelect || (() => {});
    this.onHover = options.onHover || (() => {});
    this.reduced = options.reduced || false;
    this.autoRotate = options.autoRotate !== false;
    this.focusSpeed = 0.055;
    this.features = [];
    this.visitedFeatures = new Map();
    this.selectedIso = null;
    this.hoveredIso = null;
    this.visible = true;
    this.dragging = false;
    this.dragDistance = 0;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.tabIndex = 0;
    this.renderer.domElement.setAttribute('aria-label', 'Rotatable atlas globe');
    element.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 20);
    // Keep the wireframe halo inside the square render target. At 3.35 the
    // sphere's tangent angle was slightly wider than half the 34° camera FOV,
    // which shaved a flat edge from both sides of the globe.
    this.baseCameraZ = 3.5;
    this.camera.position.set(0, 0, this.baseCameraZ);
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.canvas = document.createElement('canvas');
    this.canvas.width = 2048;
    this.canvas.height = 1024;
    this.context = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());

    this.sphere = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS, 96, 64),
      new THREE.MeshStandardMaterial({ map: this.texture, roughness: 0.92, metalness: 0 })
    );
    this.group.add(this.sphere);

    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.004, 24, 16),
      new THREE.MeshBasicMaterial({ color: this.palette.line, transparent: true, opacity: 0.08, wireframe: true })
    );
    this.group.add(wire);

    this.scene.add(new THREE.HemisphereLight(this.palette.mist, this.palette.shade, 2.1));
    const key = new THREE.DirectionalLight(this.palette.mist, 2.8);
    key.position.set(-3, 4, 5);
    this.scene.add(key);

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(-10, -10);
    this.targetQuaternion = new THREE.Quaternion();
    this.currentQuaternion = new THREE.Quaternion();
    this.targetQuaternion.setFromEuler(new THREE.Euler(-0.12, -0.38 + COMPOSITION_YAW, 0.02));
    this.currentQuaternion.copy(this.targetQuaternion);
    this.lastPointer = { x: 0, y: 0 };

    this.drawTexture();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(element);
    this.bindEvents();
    this.ready = this.loadGeography(options.dataUrl || './data/world-countries.geojson');
  }

  async loadGeography(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Atlas data failed: ${response.status}`);
      const collection = await response.json();
      this.features = collection.features.filter((feature) => feature.geometry);
      for (const place of this.places) {
        const feature = this.features.find((item) => item.properties.ISO_A3 === place.iso || item.properties.ADM0_A3 === place.iso);
        if (feature) this.visitedFeatures.set(place.iso, feature);
      }
      this.drawTexture();
    } catch (error) {
      console.warn(error);
      this.element.classList.add('atlas-data-error');
    }
  }

  traceRing(ring, offset = 0) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    let previousX = null;
    let wrap = 0;
    ring.forEach(([lng, lat], index) => {
      let x = ((lng + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      if (previousX !== null) {
        const candidate = x + wrap;
        if (candidate - previousX > width / 2) wrap -= width;
        else if (candidate - previousX < -width / 2) wrap += width;
      }
      x += wrap;
      previousX = x;
      if (index === 0) this.context.moveTo(x + offset, y);
      else this.context.lineTo(x + offset, y);
    });
    this.context.closePath();
  }

  drawFeature(feature, fill, stroke, lineWidth = 0.85) {
    const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    for (const polygon of polygons) {
      for (const offset of [-this.canvas.width, 0, this.canvas.width]) {
        this.context.beginPath();
        polygon.forEach((ring) => this.traceRing(ring, offset));
        this.context.fillStyle = fill;
        this.context.fill('evenodd');
        this.context.strokeStyle = stroke;
        this.context.lineWidth = lineWidth;
        this.context.stroke();
      }
    }
  }

  drawTexture() {
    const ctx = this.context;
    ctx.fillStyle = this.palette.ocean;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.strokeStyle = this.palette.grid;
    ctx.lineWidth = 1;
    for (let lng = -150; lng <= 150; lng += 30) {
      const x = ((lng + 180) / 360) * this.canvas.width;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.canvas.height); ctx.stroke();
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = ((90 - lat) / 180) * this.canvas.height;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.canvas.width, y); ctx.stroke();
    }

    for (const feature of this.features) {
      const iso = feature.properties.ISO_A3 || feature.properties.ADM0_A3;
      const visited = this.visitedFeatures.has(iso);
      const active = iso === this.selectedIso;
      const hovered = iso === this.hoveredIso;
      const fill = active ? this.palette.active : hovered ? this.palette.mist : visited ? this.palette.visited : this.palette.land;
      const stroke = visited ? this.palette.active : this.palette.line;
      this.drawFeature(feature, fill, stroke, visited ? 1.8 : 0.75);
    }
    this.texture.needsUpdate = true;
  }

  bindEvents() {
    const dom = this.renderer.domElement;
    this.onPointerDown = (event) => {
      this.dragging = true;
      this.dragDistance = 0;
      this.lastPointer = { x: event.clientX, y: event.clientY };
      dom.setPointerCapture?.(event.pointerId);
    };
    this.onPointerMove = (event) => {
      const rect = dom.getBoundingClientRect();
      this.pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      if (!this.dragging) return;
      const dx = event.clientX - this.lastPointer.x;
      const dy = event.clientY - this.lastPointer.y;
      this.dragDistance += Math.abs(dx) + Math.abs(dy);
      this.lastPointer = { x: event.clientX, y: event.clientY };
      const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * 0.0042);
      const pitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * 0.0042);
      this.targetQuaternion.premultiply(pitch).premultiply(yaw).normalize();
    };
    this.onPointerUp = (event) => {
      if (this.dragging && this.dragDistance < 7 && this.hoveredIso) {
        const place = this.places.find((item) => item.iso === this.hoveredIso);
        if (place) this.onSelect(place.id);
      }
      this.dragging = false;
      dom.releasePointerCapture?.(event.pointerId);
    };
    this.onPointerLeave = () => {
      this.pointer.set(-10, -10);
      this.dragging = false;
      this.updateHover(null);
    };
    this.onKeyDown = (event) => {
      const keyMap = { ArrowLeft: [0, -0.08], ArrowRight: [0, 0.08], ArrowUp: [-0.08, 0], ArrowDown: [0.08, 0] };
      if (!keyMap[event.key]) return;
      event.preventDefault();
      const [x, y] = keyMap[event.key];
      this.targetQuaternion.premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, 0))).normalize();
    };
    dom.addEventListener('pointerdown', this.onPointerDown);
    dom.addEventListener('pointermove', this.onPointerMove);
    dom.addEventListener('pointerup', this.onPointerUp);
    dom.addEventListener('pointerleave', this.onPointerLeave);
    dom.addEventListener('keydown', this.onKeyDown);
  }

  updateHover(iso) {
    if (iso === this.hoveredIso) return;
    this.hoveredIso = iso;
    this.renderer.domElement.style.cursor = iso ? 'pointer' : this.dragging ? 'grabbing' : 'grab';
    this.drawTexture();
    this.onHover(iso ? this.places.find((item) => item.iso === iso)?.id || null : null);
  }

  hitTest() {
    if (this.dragging || !this.features.length) return;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObject(this.sphere, false)[0];
    if (!hit) { this.updateHover(null); return; }
    const local = hit.point.clone().applyQuaternion(this.group.quaternion.clone().invert()).normalize();
    const lat = Math.asin(THREE.MathUtils.clamp(local.y, -1, 1)) / DEG;
    const lng = Math.atan2(-local.z, local.x) / DEG;
    let iso = null;
    for (const [candidate, feature] of this.visitedFeatures) {
      if (pointInFeature([lng, lat], feature)) { iso = candidate; break; }
    }
    // A click just outside a country's rendered border still selects it, so the
    // warm regions stay easy to hit without pixel-perfect aim.
    if (!iso) {
      const nearby = this.places.find((place) => {
        const dx = (lng - place.lng) * Math.cos(lat * DEG);
        const dy = lat - place.lat;
        return Math.hypot(dx, dy) < 1.15;
      });
      iso = nearby?.iso || null;
    }
    this.updateHover(iso);
  }

  focus(placeId, options = {}) {
    const place = this.places.find((item) => item.id === placeId);
    if (!place) return;
    const direction = latLngToVector(place.lat, place.lng);
    // The discovery composition sits the country slightly up-left; `center` aims it
    // dead-on at the camera instead, for the head-on descent into the deep dive.
    const target = options.center
      ? new THREE.Vector3(0, 0, 1)
      : new THREE.Vector3(0.12, 0.04, 1)
        .normalize()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), COMPOSITION_YAW);
    this.targetQuaternion.copy(new THREE.Quaternion().setFromUnitVectors(direction, target));
    this.focusSpeed = options.speed || 0.055;
    if (options.immediate) {
      this.currentQuaternion.copy(this.targetQuaternion);
      this.focusSpeed = 0.055;
    }
    this.setActive(place.iso);
  }

  setActive(iso) {
    this.selectedIso = iso;
    this.drawTexture();
  }

  resize() {
    const width = this.element.clientWidth || 1;
    const height = this.element.clientHeight || width;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  setVisible(value) { this.visible = value; }

  render() {
    if (!this.visible) return;
    const now = performance.now();
    const frames = Math.min((now - (this.lastRenderTime ?? now - 1000 / 60)) / (1000 / 60), 2);
    this.lastRenderTime = now;
    if (!this.dragging && !this.reduced && this.autoRotate) {
      const idle = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.00022);
      this.targetQuaternion.premultiply(idle).normalize();
    }
    // Keep damping consistent across refresh rates. The focus timeline owns its
    // speed, so the render loop must not reset it mid-animation.
    this.currentQuaternion.slerp(this.targetQuaternion, this.reduced ? 1 : 1 - Math.pow(1 - this.focusSpeed, frames));
    this.group.quaternion.copy(this.currentQuaternion);
    this.hitTest();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.resizeObserver.disconnect();
    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.onPointerDown);
    dom.removeEventListener('pointermove', this.onPointerMove);
    dom.removeEventListener('pointerup', this.onPointerUp);
    dom.removeEventListener('pointerleave', this.onPointerLeave);
    dom.removeEventListener('keydown', this.onKeyDown);
    this.sphere.geometry.dispose();
    this.sphere.material.dispose();
    this.texture.dispose();
    this.renderer.dispose();
  }
}
