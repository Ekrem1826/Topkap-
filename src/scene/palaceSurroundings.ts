import * as THREE from 'three';
import { PalaceMaterials, createOttomanDome } from './palaceMaterials';
import { getPalaceGroundHeight, Season, SEASON_PROFILES } from './palaceData';

const GROUND_Y = 8.0;
const TERRACE_Y = 5.0;

// Pre-allocated scratch helpers for zero-GC animation updates
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

export interface AnimatedGalley {
  mesh: THREE.Group;
  centerX: number;
  centerZ: number;
  radiusX: number;
  radiusZ: number;
  speed: number;
  phase: number;
}

export interface VisitorAgent {
  x: number;
  z: number;
  y: number;
  vx: number;
  vz: number;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  robeColor: number;
  headgearType: 'janissary' | 'vizier' | 'scholar';
  phase: number;
}

export interface SurroundingsHandle {
  root: THREE.Group;
  waterMesh: THREE.Mesh;
  waterShaderUniforms: { uTime: { value: number }; uBreeze: { value: number } };
  cypressCanopies: THREE.InstancedMesh;
  deciduousCanopies: THREE.InstancedMesh;
  deciduousBasePositions: { x: number; y: number; z: number; scale: number; phase: number }[];
  cypressBasePositions: { x: number; y: number; z: number; scale: number; phase: number }[];
  lanternLights: THREE.PointLight[];
  smokeParticles: THREE.Points;
  smokePositions: Float32Array;
  smokeBaseOrigins: THREE.Vector3[];
  fountainParticles: THREE.Points;
  fountainPositions: Float32Array;
  fountainCenter: THREE.Vector3;
  banners: THREE.Mesh[];
  galleys: AnimatedGalley[];
  visitorBodies: THREE.InstancedMesh;
  visitorHeads: THREE.InstancedMesh;
  visitorHats: THREE.InstancedMesh;
  visitors: VisitorAgent[];
  starField: THREE.Points;
  starMaterial: THREE.PointsMaterial;
  cloudGroup: THREE.Group;
  updateSeason: (season: Season) => void;
  updateTick: (elapsed: number, dt: number, breeze: number, visitorFraction: number) => void;
}

/**
 * Builds the Sarayburnu terrain, Sea of Marmara / Bosphorus / Golden Horn water,
 * instanced arcade colonnades, cypress & plane trees, Hagia Sophia in the distance,
 * Ottoman galleys, animated visitors, chimney smoke, and night stars.
 */
export function buildSurroundingsAndInstancing(
  mats: PalaceMaterials,
  chimneyTops: THREE.Vector3[],
  fountainCenters: THREE.Vector3[],
  flagPositions: THREE.Vector3[],
  isSoftwareGl: boolean
): SurroundingsHandle {
  const root = new THREE.Group();

  // ---------------------------------------------------------------------------
  // 1. SARAYBURNU (SERAGLIO POINT) PROMONTORY TERRAIN & SEAWALL CLIFFS
  // ---------------------------------------------------------------------------
  const terrainGeo = new THREE.PlaneGeometry(340, 420, 68, 84);
  terrainGeo.rotateX(-Math.PI * 0.5);
  const posAttr = terrainGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getZ(i);
    const vy = getPalaceGroundHeight(vx, vz);
    posAttr.setY(i, vy);
  }
  terrainGeo.computeVertexNormals();

  const terrainMesh = new THREE.Mesh(terrainGeo, mats.earthSlope);
  terrainMesh.receiveShadow = true;
  root.add(terrainMesh);

  // Outer Maritime Seawalls (Sur-ı Sultânî Coastal Ramparts along Bosphorus, Golden Horn & Marmara)
  const coastalWallGroup = new THREE.Group();
  const seaWallPts: [number, number][] = [
    [-82, 160],
    [-86, 60],
    [-82, -40],
    [-68, -145],
    [-25, -176],
    [25, -176],
    [68, -145],
    [82, -40],
    [86, 60],
    [82, 160],
  ];
  for (let i = 0; i < seaWallPts.length - 1; i++) {
    const [x1, z1] = seaWallPts[i];
    const [x2, z2] = seaWallPts[i + 1];
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const ang = Math.atan2(dx, dz);

    const sWall = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 5.8, len),
      mats.limestoneDark
    );
    sWall.position.set((x1 + x2) * 0.5, 2.5, (z1 + z2) * 0.5);
    sWall.rotation.y = ang;
    coastalWallGroup.add(sWall);

    const sTower = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 7.8, 5.2),
      mats.limestone
    );
    sTower.position.set(x1, 3.5, z1);
    coastalWallGroup.add(sTower);
  }
  root.add(coastalWallGroup);

  // ---------------------------------------------------------------------------
  // 2. BOSPHORUS, GOLDEN HORN & SEA OF MARMARA ANIMATED WATER SURFACE
  // ---------------------------------------------------------------------------
  const waterShaderUniforms = {
    uTime: { value: 0 },
    uBreeze: { value: 0.5 },
  };

  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x155878,
    roughness: 0.16,
    metalness: 0.65,
  });

  if (!isSoftwareGl) {
    waterMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = waterShaderUniforms.uTime;
      shader.uniforms.uBreeze = waterShaderUniforms.uBreeze;
      shader.vertexShader =
        `
        uniform float uTime;
        uniform float uBreeze;
        ` +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
          #include <begin_vertex>
          float wave = sin(transformed.x * 0.08 + uTime * 1.6) * cos(transformed.z * 0.08 + uTime * 1.2);
          transformed.y += wave * (0.15 + uBreeze * 0.25);
          `
        );
    };
  }

  const waterGeo = new THREE.PlaneGeometry(1600, 1600, isSoftwareGl ? 16 : 64, isSoftwareGl ? 16 : 64);
  waterGeo.rotateX(-Math.PI * 0.5);
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.position.y = 0.0;
  waterMesh.receiveShadow = true;
  root.add(waterMesh);

  // ---------------------------------------------------------------------------
  // 3. DISTANT HAGIA SOPHIA (AYASOFYA-İ KEBİR CAMİ-İ ŞERİFİ) & HISTORIC PENINSULA
  // ---------------------------------------------------------------------------
  const hagiaSophia = new THREE.Group();
  hagiaSophia.position.set(-22, GROUND_Y, 195);

  const hsMainBody = new THREE.Mesh(
    new THREE.BoxGeometry(38, 19, 42),
    mats.khorasanMasonry
  );
  hsMainBody.position.y = 9.5;
  hsMainBody.castShadow = true;
  hagiaSophia.add(hsMainBody);

  // Buttresses
  [-20, 20].forEach((bx) => {
    [-10, 10].forEach((bz) => {
      const buttress = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 17, 7),
        mats.limestoneDark
      );
      buttress.position.set(bx, 8.5, bz);
      hagiaSophia.add(buttress);
    });
  });

  // Great central dome of Hagia Sophia + half-domes
  const hsDrum = new THREE.Mesh(
    new THREE.CylinderGeometry(14.5, 15.2, 4.5, 24),
    mats.khorasanMasonry
  );
  hsDrum.position.y = 20.5;
  hagiaSophia.add(hsDrum);

  const hsDome = new THREE.Mesh(
    new THREE.SphereGeometry(14.5, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.48),
    mats.leadRoof
  );
  hsDome.position.y = 22.2;
  hagiaSophia.add(hsDome);

  // Four Imperial Minarets of Hagia Sophia (including Mehmed II, Bayezid II & Suleiman/Selim era minarets)
  [
    [-22, -23],
    [22, -23],
    [-22, 23],
    [22, 23],
  ].forEach(([mx, mz], idx) => {
    const min = new THREE.Group();
    min.position.set(mx, 0, mz);
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.7, 36, 12),
      idx === 0 ? mats.khorasanMasonry : mats.limestone
    );
    shaft.position.y = 18;
    min.add(shaft);

    const balcony = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 1.5, 1.4, 12),
      mats.marble
    );
    balcony.position.y = 30;
    min.add(balcony);

    const spire = new THREE.Mesh(
      new THREE.ConeGeometry(1.35, 8.5, 12),
      mats.leadRoof
    );
    spire.position.y = 39.5;
    min.add(spire);
    hagiaSophia.add(min);
  });

  root.add(hagiaSophia);

  // Low-rise 16th-century Ottoman timber & stone houses outside the Imperial Gate
  const mahalleGroup = new THREE.Group();
  const houseCoords: [number, number, number][] = [
    [28, 152, 0.2],
    [38, 165, -0.1],
    [22, 175, 0.4],
    [45, 145, 0.0],
    [-48, 155, -0.3],
    [-55, 172, 0.15],
  ];
  houseCoords.forEach(([hx, hz, rot]) => {
    const hGroup = new THREE.Group();
    hGroup.position.set(hx, getPalaceGroundHeight(hx, hz), hz);
    hGroup.rotation.y = rot;

    const lower = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 3.2, 6.5),
      mats.limestone
    );
    lower.position.y = 1.6;
    hGroup.add(lower);

    // Cumba (projecting timber upper story)
    const upper = new THREE.Mesh(
      new THREE.BoxGeometry(8.4, 3.2, 7.4),
      mats.darkWood
    );
    upper.position.y = 4.8;
    hGroup.add(upper);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(6.2, 2.6, 4),
      mats.terracottaRoof
    );
    roof.rotation.y = Math.PI * 0.25;
    roof.position.y = 7.7;
    hGroup.add(roof);

    mahalleGroup.add(hGroup);
  });
  root.add(mahalleGroup);

  // ---------------------------------------------------------------------------
  // 4. INSTANCED MARBLE ARCADE COLONNADES (SECOND & THIRD COURTYARDS)
  // ---------------------------------------------------------------------------
  const columnCoords: [number, number][] = [];
  // Second Courtyard colonnade perimeter (Z from +24 to -32, X from -30 to +22)
  for (let z = -30; z <= 24; z += 4.5) {
    columnCoords.push([22.5, z]); // In front of Imperial Kitchens
    columnCoords.push([-27.5, z]); // West portico
  }
  for (let x = -24; x <= 20; x += 4.5) {
    if (Math.abs(x) > 7) {
      columnCoords.push([x, 24.5]); // Inside Middle Gate
      columnCoords.push([x, -32.5]); // Flanking Gate of Felicity
    }
  }
  // Third Courtyard colonnade perimeter (Z from -44 to -94, X from -22 to +20)
  for (let z = -92; z <= -44; z += 4.8) {
    columnCoords.push([19.5, z]);
    columnCoords.push([-21.5, z]);
  }

  const colCount = columnCoords.length;
  const colShaftGeo = new THREE.CylinderGeometry(0.28, 0.34, 4.6, 12);
  const colCapGeo = new THREE.BoxGeometry(0.86, 0.55, 0.86);
  const archSpanGeo = new THREE.BoxGeometry(4.6, 1.1, 1.2);

  const instShafts = new THREE.InstancedMesh(colShaftGeo, mats.marble, colCount);
  const instCaps = new THREE.InstancedMesh(colCapGeo, mats.limestone, colCount);
  const instArches = new THREE.InstancedMesh(archSpanGeo, mats.khorasanMasonry, colCount);

  instShafts.castShadow = true;
  instShafts.receiveShadow = true;
  instArches.castShadow = true;

  columnCoords.forEach(([cx, cz], i) => {
    _dummy.position.set(cx, GROUND_Y + 2.3, cz);
    _dummy.rotation.set(0, 0, 0);
    _dummy.scale.set(1, 1, 1);
    _dummy.updateMatrix();
    instShafts.setMatrixAt(i, _dummy.matrix);

    _dummy.position.set(cx, GROUND_Y + 4.85, cz);
    _dummy.updateMatrix();
    instCaps.setMatrixAt(i, _dummy.matrix);

    _dummy.position.set(cx, GROUND_Y + 5.65, cz);
    _dummy.rotation.set(0, Math.abs(cx) > 18 ? Math.PI * 0.5 : 0, 0);
    _dummy.updateMatrix();
    instArches.setMatrixAt(i, _dummy.matrix);
  });

  instShafts.instanceMatrix.needsUpdate = true;
  instCaps.instanceMatrix.needsUpdate = true;
  instArches.instanceMatrix.needsUpdate = true;
  instShafts.computeBoundingSphere();
  instCaps.computeBoundingSphere();
  instArches.computeBoundingSphere();

  root.add(instShafts);
  root.add(instCaps);
  root.add(instArches);

  // ---------------------------------------------------------------------------
  // 5. INSTANCED CYPRESS TREES (SERVİ) & PLANE TREES (ÇINAR) WITH SEASONAL SUPPORT
  // ---------------------------------------------------------------------------
  const cypressCoords: [number, number][] = [];
  const deciduousCoords: [number, number][] = [];

  let seed = 1545;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // Avenue of tall cypresses along First & Second Courtyards
  for (let z = 36; z <= 98; z += 7.5) {
    cypressCoords.push([-7.5, z]);
    cypressCoords.push([7.5, z]);
    deciduousCoords.push([15 + rand() * 6, z + (rand() - 0.5) * 4]);
    deciduousCoords.push([-14 - rand() * 4, z + (rand() - 0.5) * 4]);
  }
  for (let z = -30; z <= 22; z += 6.5) {
    cypressCoords.push([-5.5, z]);
    cypressCoords.push([5.5, z]);
    cypressCoords.push([-16 + (rand() - 0.5) * 3, z]);
    deciduousCoords.push([12 + (rand() - 0.5) * 5, z]);
  }
  // Third & Fourth Courtyard Gardens
  for (let z = -94; z <= -62; z += 8) {
    cypressCoords.push([-12, z]);
    cypressCoords.push([12, z]);
    deciduousCoords.push([0 + (rand() - 0.5) * 14, z]);
  }
  for (let x = -28; x <= 28; x += 7) {
    if (Math.abs(x) > 10) {
      cypressCoords.push([x, -112]);
      deciduousCoords.push([x, -132]);
    }
  }
  // Outer Gülhane Imperial Rose Garden slopes (Hasbahçe) surrounding the palace walls
  for (let i = 0; i < 160; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = 54 + rand() * 32;
    const tx = Math.sin(angle) * dist * 0.85;
    const tz = Math.cos(angle) * dist * 1.35 - 10;
    const gy = getPalaceGroundHeight(tx, tz);
    if (gy > 1.2 && !(Math.abs(tx) < 16 && tz > 95)) {
      if (i % 2 === 0) cypressCoords.push([tx, tz]);
      else deciduousCoords.push([tx, tz]);
    }
  }

  const cypCount = cypressCoords.length;
  const cypTrunkGeo = new THREE.CylinderGeometry(0.22, 0.38, 2.6, 7);
  const cypCanopyGeo = new THREE.ConeGeometry(1.35, 10.5, 9);

  const instCypTrunks = new THREE.InstancedMesh(cypTrunkGeo, mats.darkWood, cypCount);
  const cypressCanopies = new THREE.InstancedMesh(cypCanopyGeo, mats.cypressFoliage, cypCount);
  cypressCanopies.castShadow = true;
  cypressCanopies.receiveShadow = true;

  const cypressBasePositions: { x: number; y: number; z: number; scale: number; phase: number }[] = [];

  cypressCoords.forEach(([tx, tz], i) => {
    const gy = getPalaceGroundHeight(tx, tz);
    const sc = 0.85 + rand() * 0.35;
    const phase = rand() * Math.PI * 2;
    cypressBasePositions.push({ x: tx, y: gy, z: tz, scale: sc, phase });

    _dummy.position.set(tx, gy + 1.3 * sc, tz);
    _dummy.rotation.set(0, 0, 0);
    _dummy.scale.set(sc, sc, sc);
    _dummy.updateMatrix();
    instCypTrunks.setMatrixAt(i, _dummy.matrix);

    _dummy.position.set(tx, gy + 6.4 * sc, tz);
    _dummy.updateMatrix();
    cypressCanopies.setMatrixAt(i, _dummy.matrix);

    const shade = 0.85 + rand() * 0.3;
    _color.setHex(0x19381f).multiplyScalar(shade);
    cypressCanopies.setColorAt(i, _color);
  });

  instCypTrunks.instanceMatrix.needsUpdate = true;
  cypressCanopies.instanceMatrix.needsUpdate = true;
  if (cypressCanopies.instanceColor) cypressCanopies.instanceColor.needsUpdate = true;
  instCypTrunks.computeBoundingSphere();
  cypressCanopies.computeBoundingSphere();

  root.add(instCypTrunks);
  root.add(cypressCanopies);

  // Deciduous Plane & Blossom Trees
  const decCount = deciduousCoords.length;
  const decTrunkGeo = new THREE.CylinderGeometry(0.32, 0.52, 3.6, 8);
  const decCanopyGeo = new THREE.IcosahedronGeometry(2.8, 1);

  const instDecTrunks = new THREE.InstancedMesh(decTrunkGeo, mats.darkWood, decCount);
  const deciduousCanopies = new THREE.InstancedMesh(decCanopyGeo, mats.deciduousFoliage, decCount);
  deciduousCanopies.castShadow = true;
  deciduousCanopies.receiveShadow = true;

  const deciduousBasePositions: { x: number; y: number; z: number; scale: number; phase: number }[] = [];

  deciduousCoords.forEach(([tx, tz], i) => {
    const gy = getPalaceGroundHeight(tx, tz);
    const sc = 0.85 + rand() * 0.35;
    const phase = rand() * Math.PI * 2;
    deciduousBasePositions.push({ x: tx, y: gy, z: tz, scale: sc, phase });

    _dummy.position.set(tx, gy + 1.8 * sc, tz);
    _dummy.rotation.set(0, rand() * Math.PI, 0);
    _dummy.scale.set(sc, sc, sc);
    _dummy.updateMatrix();
    instDecTrunks.setMatrixAt(i, _dummy.matrix);

    _dummy.position.set(tx, gy + 4.8 * sc, tz);
    _dummy.scale.set(sc * 1.15, sc * 0.85, sc * 1.15);
    _dummy.updateMatrix();
    deciduousCanopies.setMatrixAt(i, _dummy.matrix);

    _color.setHex(0x366e34).multiplyScalar(0.88 + rand() * 0.25);
    deciduousCanopies.setColorAt(i, _color);
  });

  instDecTrunks.instanceMatrix.needsUpdate = true;
  deciduousCanopies.instanceMatrix.needsUpdate = true;
  if (deciduousCanopies.instanceColor) deciduousCanopies.instanceColor.needsUpdate = true;
  instDecTrunks.computeBoundingSphere();
  deciduousCanopies.computeBoundingSphere();

  root.add(instDecTrunks);
  root.add(deciduousCanopies);

  // ---------------------------------------------------------------------------
  // 6. OTTOMAN GALLEYS (KADIRGA) & SHIPS ON THE BOSPHORUS AND GOLDEN HORN
  // ---------------------------------------------------------------------------
  const galleys: AnimatedGalley[] = [];
  const galleySpecs = [
    { cx: 145, cz: -60, rx: 32, rz: 65, speed: 0.12, phase: 0.0 },
    { cx: 185, cz: 35, rx: 28, rz: 55, speed: 0.09, phase: 2.1 },
    { cx: -145, cz: -75, rx: 35, rz: 60, speed: 0.11, phase: 4.2 },
    { cx: -35, cz: -215, rx: 75, rz: 28, speed: 0.1, phase: 1.4 },
    { cx: 95, cz: -195, rx: 55, rz: 35, speed: 0.08, phase: 3.5 },
  ];

  galleySpecs.forEach((spec) => {
    const ship = new THREE.Group();

    // Hull (Composite 5-part procedural 16th-century Ottoman Galley)
    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 1.8, 16.5),
      mats.darkWood
    );
    hull.position.y = 0.8;
    ship.add(hull);

    // Stern poop deck (puppa) with crimson canopy
    const sternCabin = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 2.2, 4.5),
      mats.ottomanCrimson
    );
    sternCabin.position.set(0, 2.2, -5.5);
    ship.add(sternCabin);

    // Forward ramming beak
    const prow = new THREE.Mesh(
      new THREE.ConeGeometry(1.6, 4.5, 4),
      mats.darkWood
    );
    prow.rotation.x = Math.PI * 0.5;
    prow.position.set(0, 1.0, 10.2);
    ship.add(prow);

    // Mast & Lateen triangular sail
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.2, 13.5, 8),
      mats.darkWood
    );
    mast.position.set(0, 6.8, 0.5);
    ship.add(mast);

    const yard = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 15.0, 6),
      mats.darkWood
    );
    yard.position.set(0, 8.8, 0.5);
    yard.rotation.x = 0.45;
    ship.add(yard);

    const sailGeo = new THREE.BufferGeometry();
    const sailVerts = new Float32Array([
      0, 13.2, 5.5,
      1.8, 4.2, -5.5,
      -1.8, 3.8, 2.5,
    ]);
    sailGeo.setAttribute('position', new THREE.BufferAttribute(sailVerts, 3));
    sailGeo.computeVertexNormals();
    const sailMat = new THREE.MeshStandardMaterial({
      color: 0xf5eedc,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
    const sail = new THREE.Mesh(sailGeo, sailMat);
    ship.add(sail);

    // Imperial crimson pennant at masthead
    const pennant = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 0.75),
      mats.ottomanCrimson
    );
    pennant.position.set(0, 13.4, -1.0);
    pennant.rotation.y = Math.PI * 0.5;
    ship.add(pennant);

    root.add(ship);
    galleys.push({
      mesh: ship,
      centerX: spec.cx,
      centerZ: spec.cz,
      radiusX: spec.rx,
      radiusZ: spec.rz,
      speed: spec.speed,
      phase: spec.phase,
    });
  });

  // ---------------------------------------------------------------------------
  // 7. ANIMATED 16TH-CENTURY OTTOMAN FIGURES (JANISSARIES, VIZIERS, SCHOLARS)
  // ---------------------------------------------------------------------------
  const maxVisitors = 80;
  const visitors: VisitorAgent[] = [];

  const bodyGeo = new THREE.CylinderGeometry(0.24, 0.34, 1.35, 8);
  const headGeo = new THREE.SphereGeometry(0.18, 8, 8);
  const hatGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.36, 8);

  const visitorBodyMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.75,
  });
  const visitorHeadMat = new THREE.MeshStandardMaterial({
    color: 0xe2b996,
    roughness: 0.65,
  });
  const visitorHatMat = new THREE.MeshStandardMaterial({
    color: 0xf4f1ea,
    roughness: 0.6,
  });

  const visitorBodies = new THREE.InstancedMesh(bodyGeo, visitorBodyMat, maxVisitors);
  const visitorHeads = new THREE.InstancedMesh(headGeo, visitorHeadMat, maxVisitors);
  const visitorHats = new THREE.InstancedMesh(hatGeo, visitorHatMat, maxVisitors);

  visitorBodies.frustumCulled = false;
  visitorHeads.frustumCulled = false;
  visitorHats.frustumCulled = false;

  const robePalette = [0x9e1b24, 0x1b3f8b, 0x1e5c3a, 0xc89628, 0x4a2c59];

  for (let i = 0; i < maxVisitors; i++) {
    // Distribute across Courtyards 1, 2, 3, and 4
    let minX = -18;
    let maxX = 18;
    let minZ = 36;
    let maxZ = 98;
    let y = GROUND_Y;

    if (i >= 30 && i < 60) {
      // Second Courtyard (Divan Square)
      minX = -20;
      maxX = 18;
      minZ = -30;
      maxZ = 22;
    } else if (i >= 60 && i < 72) {
      // Third Courtyard
      minX = -16;
      maxX = 16;
      minZ = -90;
      maxZ = -62;
    } else if (i >= 72) {
      // Fourth Courtyard Terrace
      minX = -18;
      maxX = 18;
      minZ = -134;
      maxZ = -112;
      y = TERRACE_Y;
    }

    const vx = minX + rand() * (maxX - minX);
    const vz = minZ + rand() * (maxZ - minZ);
    const ang = rand() * Math.PI * 2;
    const spd = 0.8 + rand() * 0.7;

    visitors.push({
      x: vx,
      z: vz,
      y,
      vx: Math.cos(ang) * spd,
      vz: Math.sin(ang) * spd,
      minX,
      maxX,
      minZ,
      maxZ,
      robeColor: robePalette[i % robePalette.length],
      headgearType: i < 30 ? 'janissary' : i < 60 ? 'vizier' : 'scholar',
      phase: rand() * Math.PI * 2,
    });

    _color.setHex(visitors[i].robeColor);
    visitorBodies.setColorAt(i, _color);
  }
  if (visitorBodies.instanceColor) visitorBodies.instanceColor.needsUpdate = true;

  root.add(visitorBodies);
  root.add(visitorHeads);
  root.add(visitorHats);

  // ---------------------------------------------------------------------------
  // 8. WAVING OTTOMAN BANNERS, LANTERNS, CHIMNEY SMOKE & FOUNTAIN SPRAY
  // ---------------------------------------------------------------------------
  const banners: THREE.Mesh[] = [];
  flagPositions.forEach((pos) => {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 4.5, 6),
      mats.gildedBronze
    );
    pole.position.copy(pos).add(new THREE.Vector3(0, 2.25, 0));
    root.add(pole);

    const bannerGeo = new THREE.PlaneGeometry(2.8, 1.1, 8, 2);
    bannerGeo.translate(1.4, 0, 0);
    const banner = new THREE.Mesh(bannerGeo, mats.ottomanCrimson);
    banner.position.copy(pos).add(new THREE.Vector3(0, 3.8, 0));
    banners.push(banner);
    root.add(banner);
  });

  // Nighttime Warm Palace Lanterns (5 strategic PointLights + glowing lantern meshes)
  const lanternCoords: [number, number, number][] = [
    [0, GROUND_Y + 6.5, 108], // Imperial Gate
    [0, GROUND_Y + 6.5, 33], // Middle Gate
    [-16, GROUND_Y + 6.5, -20], // Kubbealtı & Tower of Justice
    [0, GROUND_Y + 6.5, -34], // Gate of Felicity
    [0, TERRACE_Y + 4.5, -121], // Fourth Courtyard Pool
  ];

  const lanternLights: THREE.PointLight[] = [];
  lanternCoords.forEach(([lx, ly, lz]) => {
    const light = new THREE.PointLight(0xffa838, 0, 52, 1.6);
    light.position.set(lx, ly, lz);
    root.add(light);
    lanternLights.push(light);

    const bulb = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45, 0),
      mats.lanternGlow
    );
    bulb.position.set(lx, ly, lz);
    root.add(bulb);
  });

  // Imperial Kitchens Chimney Smoke Particles
  const smokeCount = chimneyTops.length * 14;
  const smokePositions = new Float32Array(smokeCount * 3);
  const smokeBaseOrigins: THREE.Vector3[] = [];

  for (let i = 0; i < smokeCount; i++) {
    const origin = chimneyTops[i % chimneyTops.length];
    smokeBaseOrigins.push(origin);
    const hOffset = (i / chimneyTops.length) * 0.8;
    smokePositions[i * 3] = origin.x;
    smokePositions[i * 3 + 1] = origin.y + hOffset;
    smokePositions[i * 3 + 2] = origin.z;
  }

  const smokeGeo = new THREE.BufferGeometry();
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
  const smokeMat = new THREE.PointsMaterial({
    color: 0xd8dce0,
    size: 1.6,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  const smokeParticles = new THREE.Points(smokeGeo, smokeMat);
  root.add(smokeParticles);

  // Fourth Courtyard Fountain Spray
  const fCenter = fountainCenters[0] || new THREE.Vector3(0, TERRACE_Y + 1.5, -121);
  const fCount = 60;
  const fountainPositions = new Float32Array(fCount * 3);
  for (let i = 0; i < fCount; i++) {
    fountainPositions[i * 3] = fCenter.x;
    fountainPositions[i * 3 + 1] = fCenter.y + (i / fCount) * 2.5;
    fountainPositions[i * 3 + 2] = fCenter.z;
  }
  const fGeo = new THREE.BufferGeometry();
  fGeo.setAttribute('position', new THREE.BufferAttribute(fountainPositions, 3));
  const fMat = new THREE.PointsMaterial({
    color: 0xe6f7ff,
    size: 0.4,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  const fountainParticles = new THREE.Points(fGeo, fMat);
  root.add(fountainParticles);

  // ---------------------------------------------------------------------------
  // 9. STARFIELD & DRIFTING CLOUDS
  // ---------------------------------------------------------------------------
  const starCount = 700;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = rand() * Math.PI * 0.44;
    const r = 680;
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.cos(phi) + 40;
    starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMaterial = new THREE.PointsMaterial({
    color: 0xfff8e7,
    size: 2.2,
    transparent: true,
    opacity: 0.0,
    fog: false,
  });
  const starField = new THREE.Points(starGeo, starMaterial);
  root.add(starField);

  const cloudGroup = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1.0,
    transparent: true,
    opacity: 0.65,
  });
  for (let c = 0; c < 14; c++) {
    const cCluster = new THREE.Group();
    const cx = (rand() - 0.5) * 600;
    const cz = (rand() - 0.5) * 600;
    const cy = 115 + rand() * 35;
    cCluster.position.set(cx, cy, cz);

    for (let p = 0; p < 3; p++) {
      const puff = new THREE.Mesh(
        new THREE.DodecahedronGeometry(14 + rand() * 10, 1),
        cloudMat
      );
      puff.scale.set(1.8, 0.45, 1.2);
      puff.position.set((p - 1) * 14, (rand() - 0.5) * 3, (rand() - 0.5) * 8);
      cCluster.add(puff);
    }
    cloudGroup.add(cCluster);
  }
  root.add(cloudGroup);

  // ---------------------------------------------------------------------------
  // SEASON & ANIMATION UPDATERS
  // ---------------------------------------------------------------------------
  function updateSeason(season: Season) {
    const profile = SEASON_PROFILES[season];
    mats.grassGround.color.set(profile.grassColor);
    mats.cypressFoliage.color.set(profile.cypressColor);

    // Update deciduous tree canopy colors & winter bareness scale
    const primary = new THREE.Color(profile.foliagePrimary);
    const secondary = new THREE.Color(profile.foliageSecondary);
    const blossom = new THREE.Color(profile.blossomColor);

    deciduousBasePositions.forEach((base, i) => {
      const chosen =
        season === 'spring' && i % 3 === 0
          ? blossom
          : i % 2 === 0
          ? primary
          : secondary;
      deciduousCanopies.setColorAt(i, chosen);

      const sc = base.scale * (season === 'winter' ? 0.52 : 1.0);
      _dummy.position.set(base.x, base.y + 4.8 * base.scale, base.z);
      _dummy.rotation.set(0, base.phase, 0);
      _dummy.scale.set(sc * 1.15, sc * 0.85, sc * 1.15);
      _dummy.updateMatrix();
      deciduousCanopies.setMatrixAt(i, _dummy.matrix);
    });

    if (deciduousCanopies.instanceColor) {
      deciduousCanopies.instanceColor.needsUpdate = true;
    }
    deciduousCanopies.instanceMatrix.needsUpdate = true;
  }

  function updateTick(
    elapsed: number,
    dt: number,
    breeze: number,
    visitorFraction: number
  ) {
    waterShaderUniforms.uTime.value = elapsed;
    waterShaderUniforms.uBreeze.value = breeze;

    // 1. Gently sway banners
    banners.forEach((banner, idx) => {
      banner.rotation.y = Math.sin(elapsed * (2.5 + breeze * 3) + idx) * (0.12 + breeze * 0.28);
    });

    // 2. Sway cypresses subtly in strong breeze
    if (breeze > 0.05) {
      cypressBasePositions.forEach((base, i) => {
        const sway = Math.sin(elapsed * 1.8 + base.phase) * 0.035 * breeze;
        _dummy.position.set(base.x, base.y + 6.4 * base.scale, base.z);
        _dummy.rotation.set(sway, 0, sway * 0.7);
        _dummy.scale.set(base.scale, base.scale, base.scale);
        _dummy.updateMatrix();
        cypressCanopies.setMatrixAt(i, _dummy.matrix);
      });
      cypressCanopies.instanceMatrix.needsUpdate = true;
    }

    // 3. Advance Ottoman galleys on Bosphorus & Golden Horn
    galleys.forEach((g) => {
      const t = elapsed * g.speed + g.phase;
      const nx = g.centerX + Math.cos(t) * g.radiusX;
      const nz = g.centerZ + Math.sin(t) * g.radiusZ;
      const dx = -Math.sin(t) * g.radiusX;
      const dz = Math.cos(t) * g.radiusZ;
      g.mesh.position.set(nx, 0.05 + Math.sin(elapsed * 2 + g.phase) * 0.12, nz);
      g.mesh.rotation.y = Math.atan2(dx, dz);
    });

    // 4. Advance Imperial Kitchens chimney smoke
    const sAttr = smokeParticles.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < smokeCount; i++) {
      const orig = smokeBaseOrigins[i];
      const cycle = ((elapsed * (0.9 + breeze * 0.8) + i * 0.37) % 6.5);
      sAttr.setXYZ(
        i,
        orig.x + cycle * breeze * 1.6 + Math.sin(elapsed + i) * 0.35,
        orig.y + cycle * 1.4,
        orig.z + cycle * breeze * 0.6
      );
    }
    sAttr.needsUpdate = true;

    // 5. Advance Fourth Courtyard Fountain spray
    const fAttr = fountainParticles.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < fCount; i++) {
      const cycle = (elapsed * 1.8 + (i / fCount) * 2.0) % 2.0;
      const angle = i * 2.4;
      const spread = cycle * (0.45 + breeze * 0.35);
      const fy = fCenter.y + cycle * 2.6 - cycle * cycle * 1.25;
      fAttr.setXYZ(
        i,
        fCenter.x + Math.cos(angle) * spread,
        Math.max(fCenter.y - 0.5, fy),
        fCenter.z + Math.sin(angle) * spread
      );
    }
    fAttr.needsUpdate = true;

    // 6. Drift clouds slowly
    cloudGroup.position.x = ((elapsed * (1.2 + breeze * 3.0)) % 240) - 120;

    // 7. Update active 16th-century court figures (Janissaries, Viziers, Scholars)
    const activeCount = Math.floor(maxVisitors * visitorFraction);
    for (let i = 0; i < maxVisitors; i++) {
      if (i >= activeCount) {
        _dummy.position.set(0, -100, 0);
        _dummy.scale.set(0.001, 0.001, 0.001);
        _dummy.updateMatrix();
        visitorBodies.setMatrixAt(i, _dummy.matrix);
        visitorHeads.setMatrixAt(i, _dummy.matrix);
        visitorHats.setMatrixAt(i, _dummy.matrix);
        continue;
      }

      const v = visitors[i];
      v.x += v.vx * dt;
      v.z += v.vz * dt;
      if (v.x < v.minX || v.x > v.maxX) v.vx *= -1;
      if (v.z < v.minZ || v.z > v.maxZ) v.vz *= -1;

      const bob = Math.abs(Math.sin(elapsed * 5 + v.phase)) * 0.08;
      const heading = Math.atan2(v.vx, v.vz);

      _dummy.position.set(v.x, v.y + 0.68 + bob, v.z);
      _dummy.rotation.set(0, heading, 0);
      _dummy.scale.set(1, 1, 1);
      _dummy.updateMatrix();
      visitorBodies.setMatrixAt(i, _dummy.matrix);

      _dummy.position.set(v.x, v.y + 1.52 + bob, v.z);
      _dummy.updateMatrix();
      visitorHeads.setMatrixAt(i, _dummy.matrix);

      _dummy.position.set(v.x, v.y + 1.78 + bob, v.z);
      if (v.headgearType === 'janissary') {
        // Tall white felt Janissary Börk with rear flap
        _dummy.scale.set(0.85, 1.45, 0.85);
      } else if (v.headgearType === 'vizier') {
        // Tall ribbed Selimiye / Kallavi turban
        _dummy.scale.set(1.15, 1.25, 1.15);
      } else {
        // Broad rounded Ulema turban
        _dummy.scale.set(1.25, 0.95, 1.25);
      }
      _dummy.updateMatrix();
      visitorHats.setMatrixAt(i, _dummy.matrix);
    }
    visitorBodies.instanceMatrix.needsUpdate = true;
    visitorHeads.instanceMatrix.needsUpdate = true;
    visitorHats.instanceMatrix.needsUpdate = true;
  }

  return {
    root,
    waterMesh,
    waterShaderUniforms,
    cypressCanopies,
    deciduousCanopies,
    deciduousBasePositions,
    cypressBasePositions,
    lanternLights,
    smokeParticles,
    smokePositions,
    smokeBaseOrigins,
    fountainParticles,
    fountainPositions,
    fountainCenter: fCenter,
    banners,
    galleys,
    visitorBodies,
    visitorHeads,
    visitorHats,
    visitors,
    starField,
    starMaterial,
    cloudGroup,
    updateSeason,
    updateTick,
  };
}
