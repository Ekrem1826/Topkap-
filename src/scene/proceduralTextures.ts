import * as THREE from 'three';

export interface PalaceTextures {
  limestoneAlbedo: THREE.CanvasTexture;
  limestoneBump: THREE.CanvasTexture;
  khorasanMasonryAlbedo: THREE.CanvasTexture;
  khorasanMasonryBump: THREE.CanvasTexture;
  iznikTileAlbedo: THREE.CanvasTexture;
  iznikTileBump: THREE.CanvasTexture;
  leadRoofAlbedo: THREE.CanvasTexture;
  leadRoofBump: THREE.CanvasTexture;
  terracottaTileAlbedo: THREE.CanvasTexture;
  terracottaTileBump: THREE.CanvasTexture;
  marbleAlbedo: THREE.CanvasTexture;
  woodAlbedo: THREE.CanvasTexture;
  courtyardStoneAlbedo: THREE.CanvasTexture;
  dispose: () => void;
}

function configureTexture(
  tex: THREE.CanvasTexture,
  isColor: boolean,
  repeatX: number,
  repeatY: number,
  maxAnisotropy: number
) {
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
}

/**
 * Generates a tileable cut Ottoman limestone (kesme küfeki taşı) texture.
 */
function createLimestoneTextures(maxAnisotropy: number) {
  const size = 512;
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const ctx = albedoCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Base warm limestone color
  ctx.fillStyle = '#ddd3c0';
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  const rows = 8;
  const cols = 4;
  const rowH = size / rows;
  const colW = size / cols;

  // Deterministic pseudo-random helper
  let seed = 1536;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (colW * 0.5);
    for (let c = -1; c <= cols; c++) {
      const x = c * colW + offset;
      const y = r * rowH;

      // Subtle variation per ashlar block
      const v = Math.floor((rand() - 0.5) * 18);
      const rCol = Math.min(255, Math.max(0, 224 + v));
      const gCol = Math.min(255, Math.max(0, 213 + v));
      const bCol = Math.min(255, Math.max(0, 193 + v));

      ctx.fillStyle = `rgb(${rCol},${gCol},${bCol})`;
      ctx.fillRect(x + 2, y + 2, colW - 4, rowH - 4);

      // Mortar joints
      ctx.strokeStyle = '#b9ad98';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, colW, rowH);

      const bv = Math.floor(135 + (rand() - 0.5) * 35);
      bCtx.fillStyle = `rgb(${bv},${bv},${bv})`;
      bCtx.fillRect(x + 2, y + 2, colW - 4, rowH - 4);
      bCtx.strokeStyle = '#383838';
      bCtx.lineWidth = 3;
      bCtx.strokeRect(x, y, colW, rowH);
    }
  }

  // Fine mineral grain
  for (let i = 0; i < 4000; i++) {
    const gx = rand() * size;
    const gy = rand() * size;
    const alpha = rand() * 0.08;
    ctx.fillStyle = rand() > 0.5 ? `rgba(255,250,240,${alpha})` : `rgba(80,70,55,${alpha})`;
    ctx.fillRect(gx, gy, 2, 2);

    const ba = rand() * 0.15;
    bCtx.fillStyle = rand() > 0.5 ? `rgba(255,255,255,${ba})` : `rgba(0,0,0,${ba})`;
    bCtx.fillRect(gx, gy, 2, 2);
  }

  const albedo = new THREE.CanvasTexture(albedoCanvas);
  const bump = new THREE.CanvasTexture(bumpCanvas);
  configureTexture(albedo, true, 3, 3, maxAnisotropy);
  configureTexture(bump, false, 3, 3, maxAnisotropy);
  return { albedo, bump };
}

/**
 * Generates alternating stone and Khorasan brick masonry (almaşık duvar) characteristic of Hagia Irene and early Ottoman walls.
 */
function createKhorasanMasonryTextures(maxAnisotropy: number) {
  const size = 512;
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const ctx = albedoCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Pinkish-buff Khorasan mortar base
  ctx.fillStyle = '#d8c5b4';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#606060';
  bCtx.fillRect(0, 0, size, size);

  let y = 0;
  let band = 0;
  while (y < size) {
    if (band % 2 === 0) {
      // Cut stone course
      const h = 44;
      const cols = 4;
      const w = size / cols;
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = c % 2 === 0 ? '#cfc3b0' : '#d6cbb8';
        ctx.fillRect(c * w + 3, y + 3, w - 6, h - 6);
        bCtx.fillStyle = '#b0b0b0';
        bCtx.fillRect(c * w + 3, y + 3, w - 6, h - 6);
      }
      y += h;
    } else {
      // 3 courses of thin red-terracotta Khorasan bricks
      const brickH = 14;
      for (let br = 0; br < 3; br++) {
        if (y + brickH > size) break;
        const cols = 8;
        const w = size / cols;
        const offset = (br % 2) * (w * 0.5);
        for (let c = -1; c <= cols; c++) {
          ctx.fillStyle = (c + br) % 2 === 0 ? '#a84a38' : '#9c4130';
          ctx.fillRect(c * w + offset + 2, y + 2, w - 4, brickH - 4);
          bCtx.fillStyle = '#969696';
          bCtx.fillRect(c * w + offset + 2, y + 2, w - 4, brickH - 4);
        }
        y += brickH;
      }
    }
    band++;
  }

  const albedo = new THREE.CanvasTexture(albedoCanvas);
  const bump = new THREE.CanvasTexture(bumpCanvas);
  configureTexture(albedo, true, 2, 2, maxAnisotropy);
  configureTexture(bump, false, 2, 2, maxAnisotropy);
  return { albedo, bump };
}

/**
 * Generates authentic 16th-century İznik ceramic tilework (cobalt blue, turquoise, bole red tulip & rumi rosettes on white slip).
 */
function createIznikTileTextures(maxAnisotropy: number) {
  const size = 512;
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const ctx = albedoCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Milky quartz slip background
  ctx.fillStyle = '#f2efe9';
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#d0d0d0';
  bCtx.fillRect(0, 0, size, size);

  const grid = 4;
  const tileW = size / grid;

  for (let gx = 0; gx < grid; gx++) {
    for (let gy = 0; gy < grid; gy++) {
      const cx = (gx + 0.5) * tileW;
      const cy = (gy + 0.5) * tileW;
      const x0 = gx * tileW;
      const y0 = gy * tileW;

      // Glaze border
      ctx.strokeStyle = '#1b3f8b'; // Cobalt blue
      ctx.lineWidth = 3;
      ctx.strokeRect(x0 + 3, y0 + 3, tileW - 6, tileW - 6);

      bCtx.strokeStyle = '#505050';
      bCtx.lineWidth = 3;
      bCtx.strokeRect(x0, y0, tileW, tileW);

      // Corner turquoise quarter-medallions
      ctx.fillStyle = '#1b8a99';
      const rCorner = tileW * 0.18;
      [
        [x0, y0],
        [x0 + tileW, y0],
        [x0, y0 + tileW],
        [x0 + tileW, y0 + tileW],
      ].forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, rCorner, 0, Math.PI * 2);
        ctx.fill();
      });

      // Central 8-pointed Hatayi / Rumi star rosette
      ctx.save();
      ctx.translate(cx, cy);
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = i % 2 === 0 ? '#1b3f8b' : '#1b8a99';
        ctx.beginPath();
        ctx.ellipse(0, tileW * 0.22, tileW * 0.07, tileW * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bole red tulip accents (characteristic mid-16th c. Suleiman era İznik)
        ctx.fillStyle = '#b8332a';
        ctx.beginPath();
        ctx.arc(0, tileW * 0.3, tileW * 0.04, 0, Math.PI * 2);
        ctx.fill();
      }

      // Gold/white center Boss
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(0, 0, tileW * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const albedo = new THREE.CanvasTexture(albedoCanvas);
  const bump = new THREE.CanvasTexture(bumpCanvas);
  configureTexture(albedo, true, 2, 2, maxAnisotropy);
  configureTexture(bump, false, 2, 2, maxAnisotropy);
  return { albedo, bump };
}

/**
 * Generates radial standing-seam Ottoman lead dome sheathing (kurşun kaplama).
 */
function createLeadRoofTextures(maxAnisotropy: number) {
  const size = 512;
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const ctx = albedoCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  ctx.fillStyle = '#6d7682';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  const ribs = 16;
  const ribW = size / ribs;
  for (let i = 0; i < ribs; i++) {
    const x = i * ribW;
    const grad = ctx.createLinearGradient(x, 0, x + ribW, 0);
    grad.addColorStop(0, '#59616b');
    grad.addColorStop(0.15, '#7c8694');
    grad.addColorStop(0.85, '#6a737f');
    grad.addColorStop(1, '#505861');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, ribW, size);

    // Standing seam rib
    bCtx.fillStyle = '#ffffff';
    bCtx.fillRect(x, 0, 3, size);
  }

  // Horizontal lap seams
  const seams = 8;
  const seamH = size / seams;
  for (let j = 0; j < seams; j++) {
    const y = j * seamH;
    ctx.fillStyle = '#535b66';
    ctx.fillRect(0, y, size, 3);
    bCtx.fillStyle = '#c8c8c8';
    bCtx.fillRect(0, y, size, 3);
  }

  const albedo = new THREE.CanvasTexture(albedoCanvas);
  const bump = new THREE.CanvasTexture(bumpCanvas);
  configureTexture(albedo, true, 2, 2, maxAnisotropy);
  configureTexture(bump, false, 2, 2, maxAnisotropy);
  return { albedo, bump };
}

/**
 * Generates traditional Ottoman red-terracotta barrel roof tiles (alaturka kiremit).
 */
function createTerracottaTileTextures(maxAnisotropy: number) {
  const size = 512;
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const ctx = albedoCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  ctx.fillStyle = '#9c432d';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#707070';
  bCtx.fillRect(0, 0, size, size);

  const cols = 16;
  const rows = 12;
  const colW = size / cols;
  const rowH = size / rows;

  for (let c = 0; c < cols; c++) {
    const x = c * colW;
    const grad = ctx.createLinearGradient(x, 0, x + colW, 0);
    grad.addColorStop(0, '#782f1d');
    grad.addColorStop(0.5, '#b85339');
    grad.addColorStop(1, '#782f1d');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, colW, size);

    const bGrad = bCtx.createLinearGradient(x, 0, x + colW, 0);
    bGrad.addColorStop(0, '#303030');
    bGrad.addColorStop(0.5, '#e8e8e8');
    bGrad.addColorStop(1, '#303030');
    bCtx.fillStyle = bGrad;
    bCtx.fillRect(x, 0, colW, size);
  }

  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    ctx.fillStyle = 'rgba(45, 15, 8, 0.45)';
    ctx.fillRect(0, y, size, 3);
    bCtx.fillStyle = '#202020';
    bCtx.fillRect(0, y, size, 4);
  }

  const albedo = new THREE.CanvasTexture(albedoCanvas);
  const bump = new THREE.CanvasTexture(bumpCanvas);
  configureTexture(albedo, true, 3, 3, maxAnisotropy);
  configureTexture(bump, false, 3, 3, maxAnisotropy);
  return { albedo, bump };
}

/**
 * Generates Marmara white-gray veined marble texture for columns, paving, and pools.
 */
function createMarbleTexture(maxAnisotropy: number) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ece9e2';
  ctx.fillRect(0, 0, size, size);

  // Subtle gray veins
  ctx.strokeStyle = 'rgba(130, 136, 145, 0.25)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 14; i++) {
    ctx.beginPath();
    let x = (i / 14) * size;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < size) {
      y += 32;
      x += Math.sin(y * 0.03 + i) * 18;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  configureTexture(tex, true, 2, 2, maxAnisotropy);
  return tex;
}

/**
 * Generates carved dark Anatolian walnut/oak timber texture for eaves and doors.
 */
function createWoodTexture(maxAnisotropy: number) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#4a3222';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 64; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(30, 18, 10, 0.25)' : 'rgba(95, 65, 42, 0.2)';
    ctx.fillRect(0, (i * size) / 64, size, 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  configureTexture(tex, true, 2, 2, maxAnisotropy);
  return tex;
}

/**
 * Generates courtyard flagstone & pebble path texture.
 */
function createCourtyardStoneTexture(maxAnisotropy: number) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#c8beaa';
  ctx.fillRect(0, 0, size, size);

  const grid = 8;
  const step = size / grid;
  for (let x = 0; x < grid; x++) {
    for (let y = 0; y < grid; y++) {
      ctx.strokeStyle = '#a89e8a';
      ctx.lineWidth = 2;
      ctx.strokeRect(x * step, y * step, step, step);
      ctx.fillStyle = (x + y) % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
      ctx.fillRect(x * step + 2, y * step + 2, step - 4, step - 4);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  configureTexture(tex, true, 12, 12, maxAnisotropy);
  return tex;
}

export function createPalaceTextures(renderer: THREE.WebGLRenderer): PalaceTextures {
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy() || 1;
  const limestone = createLimestoneTextures(maxAnisotropy);
  const khorasan = createKhorasanMasonryTextures(maxAnisotropy);
  const iznik = createIznikTileTextures(maxAnisotropy);
  const lead = createLeadRoofTextures(maxAnisotropy);
  const terracotta = createTerracottaTileTextures(maxAnisotropy);
  const marbleAlbedo = createMarbleTexture(maxAnisotropy);
  const woodAlbedo = createWoodTexture(maxAnisotropy);
  const courtyardStoneAlbedo = createCourtyardStoneTexture(maxAnisotropy);

  return {
    limestoneAlbedo: limestone.albedo,
    limestoneBump: limestone.bump,
    khorasanMasonryAlbedo: khorasan.albedo,
    khorasanMasonryBump: khorasan.bump,
    iznikTileAlbedo: iznik.albedo,
    iznikTileBump: iznik.bump,
    leadRoofAlbedo: lead.albedo,
    leadRoofBump: lead.bump,
    terracottaTileAlbedo: terracotta.albedo,
    terracottaTileBump: terracotta.bump,
    marbleAlbedo,
    woodAlbedo,
    courtyardStoneAlbedo,
    dispose() {
      limestone.albedo.dispose();
      limestone.bump.dispose();
      khorasan.albedo.dispose();
      khorasan.bump.dispose();
      iznik.albedo.dispose();
      iznik.bump.dispose();
      lead.albedo.dispose();
      lead.bump.dispose();
      terracotta.albedo.dispose();
      terracotta.bump.dispose();
      marbleAlbedo.dispose();
      woodAlbedo.dispose();
      courtyardStoneAlbedo.dispose();
    },
  };
}
