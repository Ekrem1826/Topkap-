import * as THREE from 'three';
import { PalaceTextures } from './proceduralTextures';

export interface PalaceMaterials {
  limestone: THREE.MeshStandardMaterial;
  limestoneDark: THREE.MeshStandardMaterial;
  khorasanMasonry: THREE.MeshStandardMaterial;
  iznikTile: THREE.MeshPhysicalMaterial;
  leadRoof: THREE.MeshStandardMaterial;
  terracottaRoof: THREE.MeshStandardMaterial;
  marble: THREE.MeshStandardMaterial;
  porphyryColumn: THREE.MeshStandardMaterial;
  verdAntiqueColumn: THREE.MeshStandardMaterial;
  gildedBronze: THREE.MeshStandardMaterial;
  darkWood: THREE.MeshStandardMaterial;
  courtyardPaving: THREE.MeshStandardMaterial;
  grassGround: THREE.MeshStandardMaterial;
  earthSlope: THREE.MeshStandardMaterial;
  cypressFoliage: THREE.MeshStandardMaterial;
  deciduousFoliage: THREE.MeshStandardMaterial;
  blossomFoliage: THREE.MeshStandardMaterial;
  windowLit: THREE.MeshStandardMaterial;
  lanternGlow: THREE.MeshBasicMaterial;
  ottomanCrimson: THREE.MeshStandardMaterial;
  waterPool: THREE.MeshPhysicalMaterial;
  dispose: () => void;
}

export function createPalaceMaterials(textures: PalaceTextures): PalaceMaterials {
  const limestone = new THREE.MeshStandardMaterial({
    color: 0xe6decb,
    map: textures.limestoneAlbedo,
    bumpMap: textures.limestoneBump,
    bumpScale: 0.08,
    roughness: 0.85,
    metalness: 0.02,
  });

  const limestoneDark = new THREE.MeshStandardMaterial({
    color: 0xcdc2ab,
    map: textures.limestoneAlbedo,
    bumpMap: textures.limestoneBump,
    bumpScale: 0.1,
    roughness: 0.88,
    metalness: 0.03,
  });

  const khorasanMasonry = new THREE.MeshStandardMaterial({
    color: 0xebe3d5,
    map: textures.khorasanMasonryAlbedo,
    bumpMap: textures.khorasanMasonryBump,
    bumpScale: 0.12,
    roughness: 0.84,
    metalness: 0.02,
  });

  const iznikTile = new THREE.MeshPhysicalMaterial({
    color: 0xeae6df,
    map: textures.iznikTileAlbedo,
    bumpMap: textures.iznikTileBump,
    bumpScale: 0.04,
    roughness: 0.28,
    metalness: 0.03,
    clearcoat: 0.55,
    clearcoatRoughness: 0.2,
  });

  const leadRoof = new THREE.MeshStandardMaterial({
    color: 0xd0d6de,
    map: textures.leadRoofAlbedo,
    bumpMap: textures.leadRoofBump,
    bumpScale: 0.06,
    roughness: 0.52,
    metalness: 0.45,
  });

  const terracottaRoof = new THREE.MeshStandardMaterial({
    color: 0xeddcd5,
    map: textures.terracottaTileAlbedo,
    bumpMap: textures.terracottaTileBump,
    bumpScale: 0.1,
    roughness: 0.75,
    metalness: 0.02,
  });

  const marble = new THREE.MeshStandardMaterial({
    color: 0xdcd7cc,
    map: textures.marbleAlbedo,
    roughness: 0.46,
    metalness: 0.03,
  });

  const porphyryColumn = new THREE.MeshStandardMaterial({
    color: 0x6b2d34,
    roughness: 0.35,
    metalness: 0.05,
  });

  const verdAntiqueColumn = new THREE.MeshStandardMaterial({
    color: 0x2d4f3e,
    roughness: 0.35,
    metalness: 0.05,
  });

  const gildedBronze = new THREE.MeshStandardMaterial({
    color: 0xd9ab38,
    roughness: 0.3,
    metalness: 0.82,
  });

  const darkWood = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textures.woodAlbedo,
    roughness: 0.72,
    metalness: 0.02,
  });

  const courtyardPaving = new THREE.MeshStandardMaterial({
    color: 0xd9d0be,
    map: textures.courtyardStoneAlbedo,
    roughness: 0.88,
    metalness: 0.01,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const grassGround = new THREE.MeshStandardMaterial({
    color: 0x3e5e32,
    roughness: 0.9,
    metalness: 0.0,
  });

  const earthSlope = new THREE.MeshStandardMaterial({
    color: 0x6b604e,
    roughness: 0.92,
    metalness: 0.02,
  });

  const cypressFoliage = new THREE.MeshStandardMaterial({
    color: 0x19381f,
    roughness: 0.82,
    metalness: 0.0,
  });

  const deciduousFoliage = new THREE.MeshStandardMaterial({
    color: 0x366e34,
    roughness: 0.78,
    metalness: 0.0,
  });

  const blossomFoliage = new THREE.MeshStandardMaterial({
    color: 0x3f783b,
    roughness: 0.75,
    metalness: 0.0,
  });

  const windowLit = new THREE.MeshStandardMaterial({
    color: 0x2a3542,
    emissive: new THREE.Color(0xffa838),
    emissiveIntensity: 0.1,
    roughness: 0.2,
    metalness: 0.3,
  });

  const lanternGlow = new THREE.MeshBasicMaterial({
    color: 0xffc864,
  });

  const ottomanCrimson = new THREE.MeshStandardMaterial({
    color: 0x9e1b24,
    roughness: 0.6,
    metalness: 0.08,
    side: THREE.DoubleSide,
  });

  const waterPool = new THREE.MeshPhysicalMaterial({
    color: 0x1e6b7b,
    roughness: 0.08,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });

  const all = [
    limestone,
    limestoneDark,
    khorasanMasonry,
    iznikTile,
    leadRoof,
    terracottaRoof,
    marble,
    porphyryColumn,
    verdAntiqueColumn,
    gildedBronze,
    darkWood,
    courtyardPaving,
    grassGround,
    earthSlope,
    cypressFoliage,
    deciduousFoliage,
    blossomFoliage,
    windowLit,
    lanternGlow,
    ottomanCrimson,
    waterPool,
  ];

  return {
    limestone,
    limestoneDark,
    khorasanMasonry,
    iznikTile,
    leadRoof,
    terracottaRoof,
    marble,
    porphyryColumn,
    verdAntiqueColumn,
    gildedBronze,
    darkWood,
    courtyardPaving,
    grassGround,
    earthSlope,
    cypressFoliage,
    deciduousFoliage,
    blossomFoliage,
    windowLit,
    lanternGlow,
    ottomanCrimson,
    waterPool,
    dispose() {
      all.forEach((m) => m.dispose());
    },
  };
}

/**
 * Helper to create an Ottoman dome with drum, lead hemisphere, and gilded alem (finial).
 */
export function createOttomanDome(
  radius: number,
  mats: PalaceMaterials,
  withDrum = true,
  drumHeight = 1.4,
  octagonalDrum = true
): THREE.Group {
  const group = new THREE.Group();

  let yOffset = 0;
  if (withDrum) {
    const drumGeo = new THREE.CylinderGeometry(
      radius * 1.02,
      radius * 1.04,
      drumHeight,
      octagonalDrum ? 8 : 16
    );
    const drum = new THREE.Mesh(drumGeo, mats.limestone);
    drum.position.y = drumHeight * 0.5;
    drum.castShadow = true;
    drum.receiveShadow = true;
    group.add(drum);
    yOffset = drumHeight;
  }

  // Lead-covered dome shell
  const domeGeo = new THREE.SphereGeometry(
    radius,
    20,
    12,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.52
  );
  const dome = new THREE.Mesh(domeGeo, mats.leadRoof);
  dome.position.y = yOffset - radius * 0.05;
  dome.castShadow = true;
  dome.receiveShadow = true;
  group.add(dome);

  // Gilded bronze finial (Alem)
  const spireGeo = new THREE.CylinderGeometry(0.03, 0.07, radius * 0.45, 8);
  const spire = new THREE.Mesh(spireGeo, mats.gildedBronze);
  spire.position.y = yOffset + radius + radius * 0.2;
  group.add(spire);

  const crescentGeo = new THREE.TorusGeometry(radius * 0.1, 0.025, 6, 12, Math.PI * 1.45);
  const crescent = new THREE.Mesh(crescentGeo, mats.gildedBronze);
  crescent.position.y = yOffset + radius + radius * 0.42;
  crescent.rotation.z = Math.PI * 0.75;
  group.add(crescent);

  return group;
}

/**
 * Helper to create a tall conical kitchen chimney (Matbah-ı Âmire bacası).
 */
export function createKitchenChimney(
  baseRadius: number,
  height: number,
  mats: PalaceMaterials
): THREE.Group {
  const group = new THREE.Group();

  // Octagonal stone base
  const baseH = height * 0.3;
  const baseGeo = new THREE.CylinderGeometry(baseRadius * 0.9, baseRadius, baseH, 8);
  const base = new THREE.Mesh(baseGeo, mats.limestone);
  base.position.y = baseH * 0.5;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Tall tapered lead-and-plaster cone
  const coneH = height * 0.65;
  const coneGeo = new THREE.CylinderGeometry(baseRadius * 0.28, baseRadius * 0.88, coneH, 16);
  const cone = new THREE.Mesh(coneGeo, mats.leadRoof);
  cone.position.y = baseH + coneH * 0.5;
  cone.castShadow = true;
  cone.receiveShadow = true;
  group.add(cone);

  // Ventilated cap
  const capGeo = new THREE.ConeGeometry(baseRadius * 0.36, height * 0.12, 12);
  const cap = new THREE.Mesh(capGeo, mats.leadRoof);
  cap.position.y = baseH + coneH + height * 0.05;
  group.add(cap);

  return group;
}
