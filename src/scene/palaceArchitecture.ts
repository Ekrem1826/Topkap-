import * as THREE from 'three';
import { PalaceMaterials, createOttomanDome, createKitchenChimney } from './palaceMaterials';

const GROUND_Y = 8.0;
const TERRACE_Y = 5.0;

/**
 * Builds the entire architectural ensemble of Topkapı Palace circa 1550
 * (Reign of Kanuni Sultan Süleyman), including:
 * - Sur-ı Sultânî (Outer Fortress & Seawalls)
 * - 1. Bâb-ı Hümâyûn (Imperial Gate) & First Courtyard (Alay Meydanı) with Hagia Irene (Aya İrini)
 * - 2. Bâbüsselâm (Middle Gate) with twin octagonal conical towers
 * - 3. Second Courtyard (Divan Meydanı): Matbah-ı Âmire (Imperial Kitchens), Kubbealtı (Imperial Council), Adalet Kulesi (Tower of Justice), Outer Treasury & Stables
 * - 4. Bâbüssaade (Gate of Felicity)
 * - 5. Third Courtyard (Enderun Avlusu): Arz Odası (Audience Chamber), Has Oda (Privy Chamber), Inner Treasury, Enderun School, 16th-c. Harem Complex
 * - 6. Fourth Courtyard (Sofa-i Hümâyûn): Marble Terraces, Pools, and early 16th-century Kiosks
 */
export function buildPalaceArchitecture(mats: PalaceMaterials): {
  root: THREE.Group;
  chimneyTops: THREE.Vector3[];
  fountainCenters: THREE.Vector3[];
  flagPositions: THREE.Vector3[];
} {
  const root = new THREE.Group();
  const chimneyTops: THREE.Vector3[] = [];
  const fountainCenters: THREE.Vector3[] = [];
  const flagPositions: THREE.Vector3[] = [];

  // ---------------------------------------------------------------------------
  // 0. COURTYARD PAVING SLABS & TERRACES (Offset >= 0.03 above terrain to prevent Z-fighting)
  // ---------------------------------------------------------------------------
  // First Courtyard ground paving
  const court1Floor = new THREE.Mesh(
    new THREE.BoxGeometry(86, 0.25, 76),
    mats.courtyardPaving
  );
  court1Floor.position.set(0, GROUND_Y + 0.05, 68);
  court1Floor.receiveShadow = true;
  root.add(court1Floor);

  // Ceremonial stone pathway connecting Imperial Gate to Middle Gate
  const path1 = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 0.28, 76),
    mats.marble
  );
  path1.position.set(0, GROUND_Y + 0.09, 68);
  path1.receiveShadow = true;
  root.add(path1);

  // Second Courtyard lawn + axial marble walkways
  const court2Lawn = new THREE.Mesh(
    new THREE.BoxGeometry(78, 0.24, 68),
    mats.grassGround
  );
  court2Lawn.position.set(0, GROUND_Y + 0.04, -4);
  court2Lawn.receiveShadow = true;
  root.add(court2Lawn);

  // Central pathway from Middle Gate to Gate of Felicity
  const path2Center = new THREE.Mesh(
    new THREE.BoxGeometry(6.5, 0.29, 68),
    mats.marble
  );
  path2Center.position.set(0, GROUND_Y + 0.1, -4);
  path2Center.receiveShadow = true;
  root.add(path2Center);

  // DiagonalVizier path from Middle Gate toward Kubbealtı (Imperial Council)
  const pathDiagGeo = new THREE.BoxGeometry(4.2, 0.28, 60);
  const pathDiag = new THREE.Mesh(pathDiagGeo, mats.courtyardPaving);
  pathDiag.position.set(-12, GROUND_Y + 0.09, -3);
  pathDiag.rotation.y = 0.38;
  pathDiag.receiveShadow = true;
  root.add(pathDiag);

  // Third Courtyard stone floor
  const court3Floor = new THREE.Mesh(
    new THREE.BoxGeometry(74, 0.26, 62),
    mats.courtyardPaving
  );
  court3Floor.position.set(0, GROUND_Y + 0.05, -69);
  court3Floor.receiveShadow = true;
  root.add(court3Floor);

  // Fourth Courtyard Lower Marble Terrace
  const court4Terrace = new THREE.Mesh(
    new THREE.BoxGeometry(74, 3.2, 42),
    mats.limestone
  );
  court4Terrace.position.set(0, TERRACE_Y - 1.5, -121);
  court4Terrace.receiveShadow = true;
  root.add(court4Terrace);

  const court4MarbleDeck = new THREE.Mesh(
    new THREE.BoxGeometry(68, 0.25, 38),
    mats.marble
  );
  court4MarbleDeck.position.set(0, TERRACE_Y + 0.1, -121);
  court4MarbleDeck.receiveShadow = true;
  root.add(court4MarbleDeck);

  // Grand double staircase from Third Courtyard down to Fourth Courtyard Terrace
  for (let step = 0; step < 8; step++) {
    const stepMesh = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.4, 0.9),
      mats.marble
    );
    stepMesh.position.set(0, GROUND_Y - step * 0.36, -100.5 - step * 0.7);
    stepMesh.castShadow = true;
    stepMesh.receiveShadow = true;
    root.add(stepMesh);
  }

  // ---------------------------------------------------------------------------
  // 1. BÂB-I HÜMÂYÛN (IMPERIAL GATE, Z = +106)
  // ---------------------------------------------------------------------------
  const imperialGate = new THREE.Group();
  imperialGate.position.set(0, GROUND_Y, 106);

  // Left & Right massive ashlar limestone bastions
  const bastionGeo = new THREE.BoxGeometry(9, 13.5, 8.5);
  const leftBastion = new THREE.Mesh(bastionGeo, mats.limestone);
  leftBastion.position.set(-8.5, 6.75, 0);
  leftBastion.castShadow = true;
  leftBastion.receiveShadow = true;
  imperialGate.add(leftBastion);

  const rightBastion = new THREE.Mesh(bastionGeo, mats.limestone);
  rightBastion.position.set(8.5, 6.75, 0);
  rightBastion.castShadow = true;
  rightBastion.receiveShadow = true;
  imperialGate.add(rightBastion);

  // Upper arch span above gateway
  const gateSpan = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 5.5, 8.2),
    mats.limestone
  );
  gateSpan.position.set(0, 10.75, 0);
  gateSpan.castShadow = true;
  gateSpan.receiveShadow = true;
  imperialGate.add(gateSpan);

  // Marble portal surround & gilded Ottoman tughra / inscription plaque
  const portalFrame = new THREE.Mesh(
    new THREE.BoxGeometry(8.8, 10.5, 8.8),
    mats.marble
  );
  portalFrame.position.set(0, 10.2, 0);
  imperialGate.add(portalFrame);

  const kitabePlaque = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 1.6, 9.1),
    mats.iznikTile
  );
  kitabePlaque.position.set(0, 9.6, 0);
  imperialGate.add(kitabePlaque);

  const goldFrame = new THREE.Mesh(
    new THREE.BoxGeometry(6.0, 1.9, 9.0),
    mats.gildedBronze
  );
  goldFrame.position.set(0, 9.6, 0);
  imperialGate.add(goldFrame);

  // Central dome over Imperial Gate vestibule
  const impDome = createOttomanDome(3.8, mats, true, 1.2, true);
  impDome.position.set(0, 13.5, 0);
  imperialGate.add(impDome);

  // Crenellations along top
  for (let x = -12; x <= 12; x += 2.4) {
    const merlon = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 1.2, 1.2),
      mats.limestone
    );
    merlon.position.set(x, 14.1, 3.6);
    imperialGate.add(merlon);
  }

  flagPositions.push(new THREE.Vector3(-8.5, GROUND_Y + 13.5, 109));
  flagPositions.push(new THREE.Vector3(8.5, GROUND_Y + 13.5, 109));
  root.add(imperialGate);

  // ---------------------------------------------------------------------------
  // 2. HAGIA IRENE (AYA İRİNİ - IMPERIAL ARMORY IN FIRST COURTYARD)
  // ---------------------------------------------------------------------------
  const hagiaIrene = new THREE.Group();
  hagiaIrene.position.set(-25, GROUND_Y, 72);

  // Main Basilica Nave (alternating stone and red Khorasan brick masonry)
  const nave = new THREE.Mesh(
    new THREE.BoxGeometry(19, 13.5, 32),
    mats.khorasanMasonry
  );
  nave.position.set(0, 6.75, 0);
  nave.castShadow = true;
  nave.receiveShadow = true;
  hagiaIrene.add(nave);

  // Pitched terracotta aisles
  const aisleRoof = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 13.5, 32, 4),
    mats.terracottaRoof
  );
  aisleRoof.rotation.x = Math.PI * 0.5;
  aisleRoof.rotation.z = Math.PI * 0.25;
  aisleRoof.scale.set(1, 1, 0.32);
  aisleRoof.position.set(0, 14.2, 0);
  hagiaIrene.add(aisleRoof);

  // Tall Byzantine drum + main dome
  const hiDrum = new THREE.Mesh(
    new THREE.CylinderGeometry(6.8, 7.0, 5.2, 16),
    mats.khorasanMasonry
  );
  hiDrum.position.set(0, 15.5, -3);
  hiDrum.castShadow = true;
  hagiaIrene.add(hiDrum);

  // Arched windows around Hagia Irene drum
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 2.2, 0.4),
      mats.windowLit
    );
    win.position.set(
      Math.cos(angle) * 6.9,
      15.5,
      -3 + Math.sin(angle) * 6.9
    );
    win.rotation.y = -angle + Math.PI * 0.5;
    hagiaIrene.add(win);
  }

  const hiMainDome = new THREE.Mesh(
    new THREE.SphereGeometry(6.8, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.5),
    mats.leadRoof
  );
  hiMainDome.position.set(0, 18.0, -3);
  hiMainDome.castShadow = true;
  hagiaIrene.add(hiMainDome);

  // Secondary elliptical western dome
  const hiWestDome = new THREE.Mesh(
    new THREE.SphereGeometry(5.2, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.48),
    mats.leadRoof
  );
  hiWestDome.position.set(0, 14.2, 7.5);
  hiWestDome.castShadow = true;
  hagiaIrene.add(hiWestDome);

  // Eastern apse (polygonal)
  const apse = new THREE.Mesh(
    new THREE.CylinderGeometry(5.5, 5.8, 11.5, 6),
    mats.khorasanMasonry
  );
  apse.position.set(0, 5.75, -18);
  apse.castShadow = true;
  hagiaIrene.add(apse);

  // Atrium courtyard on south/west side
  const atrium = new THREE.Mesh(
    new THREE.BoxGeometry(17, 6.5, 11),
    mats.khorasanMasonry
  );
  atrium.position.set(0, 3.25, 20);
  atrium.castShadow = true;
  hagiaIrene.add(atrium);

  root.add(hagiaIrene);

  // First Courtyard Imperial Mint (Darphane-i Âmire) & Bakeries on East Flank
  const eastServiceWing = new THREE.Group();
  eastServiceWing.position.set(28, GROUND_Y, 68);
  const serviceBody = new THREE.Mesh(
    new THREE.BoxGeometry(12, 6.5, 54),
    mats.limestone
  );
  serviceBody.position.set(0, 3.25, 0);
  serviceBody.castShadow = true;
  serviceBody.receiveShadow = true;
  eastServiceWing.add(serviceBody);

  for (let i = -2; i <= 2; i++) {
    const sDome = createOttomanDome(4.2, mats, true, 0.9, true);
    sDome.position.set(0, 6.5, i * 10.5);
    eastServiceWing.add(sDome);
  }
  root.add(eastServiceWing);

  // ---------------------------------------------------------------------------
  // 3. BÂBÜSSELÂM (MIDDLE GATE / GATE OF SALUTATION, Z = +30)
  // ---------------------------------------------------------------------------
  const middleGate = new THREE.Group();
  middleGate.position.set(0, GROUND_Y, 30);

  // Twin monumental octagonal towers built under Mehmed II & Suleiman
  [-11.5, 11.5].forEach((tx) => {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(tx, 0, 0);

    // Lower octagonal shaft
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(4.8, 5.2, 16.5, 8),
      mats.limestone
    );
    shaft.position.y = 8.25;
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    towerGroup.add(shaft);

    // Corbelled upper gallery band
    const corbel = new THREE.Mesh(
      new THREE.CylinderGeometry(5.3, 4.8, 2.2, 8),
      mats.limestoneDark
    );
    corbel.position.y = 17.2;
    corbel.castShadow = true;
    towerGroup.add(corbel);

    // Sharp conical lead-sheathed roof (distinctive silhouette of Bâbüsselâm)
    const coneRoof = new THREE.Mesh(
      new THREE.ConeGeometry(5.5, 9.5, 16),
      mats.leadRoof
    );
    coneRoof.position.y = 23.0;
    coneRoof.castShadow = true;
    towerGroup.add(coneRoof);

    // Gilded finial on tower peak
    const finial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.12, 2.2, 8),
      mats.gildedBronze
    );
    finial.position.y = 28.4;
    towerGroup.add(finial);

    // Lit arrow-slit & upper watch windows
    for (let a = 0; a < 4; a++) {
      const ang = (a / 4) * Math.PI * 2;
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.5, 0.3),
        mats.windowLit
      );
      win.position.set(Math.sin(ang) * 4.9, 13.5, Math.cos(ang) * 4.9);
      win.rotation.y = ang;
      towerGroup.add(win);
    }

    middleGate.add(towerGroup);
  });

  // Central gatehouse block between the octagonal towers (leave 5.5m wide archway open)
  const mgLeftJamb = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 12.5, 7.2),
    mats.limestone
  );
  mgLeftJamb.position.set(-5.2, 6.25, 0);
  mgLeftJamb.castShadow = true;
  middleGate.add(mgLeftJamb);

  const mgRightJamb = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 12.5, 7.2),
    mats.limestone
  );
  mgRightJamb.position.set(5.2, 6.25, 0);
  mgRightJamb.castShadow = true;
  middleGate.add(mgRightJamb);

  const mgArchHeader = new THREE.Mesh(
    new THREE.BoxGeometry(15.5, 5.2, 7.4),
    mats.limestone
  );
  mgArchHeader.position.set(0, 10.6, 0);
  mgArchHeader.castShadow = true;
  middleGate.add(mgArchHeader);

  // Decorative İznik tile & gold calligraphy frieze above portal
  const mgTileBand = new THREE.Mesh(
    new THREE.BoxGeometry(9.2, 1.5, 7.6),
    mats.iznikTile
  );
  mgTileBand.position.set(0, 9.8, 0);
  middleGate.add(mgTileBand);

  const mgDome = createOttomanDome(3.5, mats, true, 1.0, true);
  mgDome.position.set(0, 13.2, 0);
  middleGate.add(mgDome);

  // Transverse dividing wall between First and Second Courtyard
  [-28, 28].forEach((wx) => {
    const wallSeg = new THREE.Mesh(
      new THREE.BoxGeometry(26, 9.5, 3.2),
      mats.limestoneDark
    );
    wallSeg.position.set(wx, 4.75, 0);
    wallSeg.castShadow = true;
    wallSeg.receiveShadow = true;
    middleGate.add(wallSeg);
  });

  flagPositions.push(new THREE.Vector3(-6.5, GROUND_Y + 13.2, 34));
  flagPositions.push(new THREE.Vector3(6.5, GROUND_Y + 13.2, 34));
  root.add(middleGate);

  // ---------------------------------------------------------------------------
  // 4. SECOND COURTYARD EAST: MATBAH-I ÂMİRE (IMPERIAL KITCHENS, X = +32)
  // ---------------------------------------------------------------------------
  const kitchens = new THREE.Group();
  kitchens.position.set(32, GROUND_Y, -4);

  // Long double-aisled stone hall
  const kitchenHall = new THREE.Mesh(
    new THREE.BoxGeometry(15, 7.5, 58),
    mats.limestone
  );
  kitchenHall.position.set(0, 3.75, 0);
  kitchenHall.castShadow = true;
  kitchenHall.receiveShadow = true;
  kitchens.add(kitchenHall);

  // 10 Iconic Domes + 10 Tall Conical Chimneys in two rows
  for (let i = 0; i < 10; i++) {
    const kz = -24.5 + i * 5.4;

    // Inner row: Domes over the vaults
    const kDome = createOttomanDome(2.4, mats, true, 0.8, true);
    kDome.position.set(-3.2, 7.5, kz);
    kitchens.add(kDome);

    // Outer row: Tall conical chimneys (Matbah bacaları) emitting gentle smoke
    const chimney = createKitchenChimney(1.65, 9.2, mats);
    chimney.position.set(3.2, 7.5, kz);
    kitchens.add(chimney);

    chimneyTops.push(new THREE.Vector3(32 + 3.2, GROUND_Y + 7.5 + 9.2, -4 + kz));
  }

  root.add(kitchens);

  // ---------------------------------------------------------------------------
  // 5. SECOND COURTYARD NORTHWEST: KUBBEALTI (IMPERIAL COUNCIL) & ADALET KULESİ (TOWER OF JUSTICE)
  // ---------------------------------------------------------------------------
  const divanComplex = new THREE.Group();
  divanComplex.position.set(-22, GROUND_Y, -26);

  // Three-domed Imperial Council Hall (Divân-ı Hümâyûn / Kubbealtı)
  const divanBody = new THREE.Mesh(
    new THREE.BoxGeometry(22, 8.2, 11.5),
    mats.limestone
  );
  divanBody.position.set(0, 4.1, 0);
  divanBody.castShadow = true;
  divanBody.receiveShadow = true;
  divanComplex.add(divanBody);

  // Rich İznik ceramic tile dado across the Kubbealtı facade
  const divanTileFacade = new THREE.Mesh(
    new THREE.BoxGeometry(20.5, 4.5, 11.8),
    mats.iznikTile
  );
  divanTileFacade.position.set(0, 3.5, 0);
  divanComplex.add(divanTileFacade);

  // Projecting gilded wooden eaves (saçak) & marble portico around Kubbealtı
  const divanEaves = new THREE.Mesh(
    new THREE.BoxGeometry(25.5, 0.7, 15.2),
    mats.darkWood
  );
  divanEaves.position.set(0, 7.6, 1.4);
  divanEaves.castShadow = true;
  divanComplex.add(divanEaves);

  const divanGildedFrieze = new THREE.Mesh(
    new THREE.BoxGeometry(25.7, 0.35, 15.4),
    mats.gildedBronze
  );
  divanGildedFrieze.position.set(0, 7.9, 1.4);
  divanComplex.add(divanGildedFrieze);

  // Three lead domes over Kubbealtı
  [-6.8, 0, 6.8].forEach((dx) => {
    const dDome = createOttomanDome(3.3, mats, true, 1.1, true);
    dDome.position.set(dx, 8.2, 0);
    divanComplex.add(dDome);
  });

  // ADALET KULESİ (TOWER OF JUSTICE) rising immediately behind Kubbealtı
  // Tallest landmark of Topkapı Palace, visible from across the Bosphorus
  const justiceTower = new THREE.Group();
  justiceTower.position.set(-8.5, 0, -6.5);

  // Lower stone shaft (Suleiman-era ashlar masonry)
  const jtLower = new THREE.Mesh(
    new THREE.BoxGeometry(7.2, 23, 7.2),
    mats.limestone
  );
  jtLower.position.y = 11.5;
  jtLower.castShadow = true;
  jtLower.receiveShadow = true;
  justiceTower.add(jtLower);

  // Corbelled stone cornice transition
  const jtCornice = new THREE.Mesh(
    new THREE.BoxGeometry(8.2, 1.6, 8.2),
    mats.marble
  );
  jtCornice.position.y = 23.5;
  jtCornice.castShadow = true;
  justiceTower.add(jtCornice);

  // Upper octagonal observation lantern chamber with arched windows
  const jtLantern = new THREE.Mesh(
    new THREE.CylinderGeometry(4.1, 4.3, 7.5, 8),
    mats.limestone
  );
  jtLantern.position.y = 28.0;
  jtLantern.castShadow = true;
  justiceTower.add(jtLantern);

  for (let w = 0; w < 8; w++) {
    const ang = (w / 8) * Math.PI * 2;
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 2.8, 0.3),
      mats.windowLit
    );
    win.position.set(Math.sin(ang) * 4.15, 28.0, Math.cos(ang) * 4.15);
    win.rotation.y = ang;
    justiceTower.add(win);
  }

  // Wide projecting eaves + tall conical lead cap + gilded alem
  const jtEave = new THREE.Mesh(
    new THREE.CylinderGeometry(5.2, 5.2, 0.5, 16),
    mats.darkWood
  );
  jtEave.position.y = 31.8;
  justiceTower.add(jtEave);

  const jtCone = new THREE.Mesh(
    new THREE.ConeGeometry(4.8, 10.5, 16),
    mats.leadRoof
  );
  jtCone.position.y = 37.3;
  jtCone.castShadow = true;
  justiceTower.add(jtCone);

  const jtFinial = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.16, 3.2, 8),
    mats.gildedBronze
  );
  jtFinial.position.y = 43.8;
  justiceTower.add(jtFinial);

  divanComplex.add(justiceTower);

  // Dîvân-ı Hümâyûn Hazinesi (Outer Public Treasury, 8-domed hall adjacent to Kubbealtı)
  const outerTreasury = new THREE.Group();
  outerTreasury.position.set(16.5, 0, 2.5);
  const otBody = new THREE.Mesh(
    new THREE.BoxGeometry(9.5, 7.2, 18),
    mats.limestone
  );
  otBody.position.set(0, 3.6, 0);
  otBody.castShadow = true;
  otBody.receiveShadow = true;
  outerTreasury.add(otBody);

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 2; col++) {
      const tDome = createOttomanDome(2.1, mats, true, 0.7, true);
      tDome.position.set(-2.2 + col * 4.4, 7.2, -6.3 + row * 4.2);
      outerTreasury.add(tDome);
    }
  }
  divanComplex.add(outerTreasury);

  root.add(divanComplex);

  // Dormitories of the Halberdiers with Tresses (Zülüflü Baltacılar) & Imperial Stables (Has Ahır) on West side of Second Courtyard
  const westStables = new THREE.Mesh(
    new THREE.BoxGeometry(10, 6.2, 42),
    mats.limestoneDark
  );
  westStables.position.set(-34, GROUND_Y + 3.1, 4);
  westStables.castShadow = true;
  westStables.receiveShadow = true;
  root.add(westStables);

  const westRoof = new THREE.Mesh(
    new THREE.BoxGeometry(10.8, 1.2, 42.8),
    mats.terracottaRoof
  );
  westRoof.position.set(-34, GROUND_Y + 6.7, 4);
  root.add(westRoof);

  // ---------------------------------------------------------------------------
  // 6. BÂBÜSSAADE (GATE OF FELICITY, Z = -38)
  // ---------------------------------------------------------------------------
  const felicityGate = new THREE.Group();
  felicityGate.position.set(0, GROUND_Y, -38);

  // Dividing wall between Second and Third Courtyards
  [-26, 26].forEach((wx) => {
    const wSeg = new THREE.Mesh(
      new THREE.BoxGeometry(30, 8.8, 3.0),
      mats.limestone
    );
    wSeg.position.set(wx, 4.4, 0);
    wSeg.castShadow = true;
    wSeg.receiveShadow = true;
    felicityGate.add(wSeg);
  });

  // Gatehouse piers flanking open central ceremonial passage
  [-5.2, 5.2].forEach((px) => {
    const pier = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 10.5, 7.5),
      mats.limestone
    );
    pier.position.set(px, 5.25, 0);
    pier.castShadow = true;
    pier.receiveShadow = true;
    felicityGate.add(pier);
  });

  const fgHeader = new THREE.Mesh(
    new THREE.BoxGeometry(15.6, 3.8, 7.8),
    mats.marble
  );
  fgHeader.position.set(0, 9.2, 0);
  fgHeader.castShadow = true;
  felicityGate.add(fgHeader);

  // İznik tile panels & gilded inscription over Gate of Felicity
  const fgTiles = new THREE.Mesh(
    new THREE.BoxGeometry(12.5, 2.2, 8.0),
    mats.iznikTile
  );
  fgTiles.position.set(0, 8.8, 0);
  felicityGate.add(fgTiles);

  // Deep ceremonial marble portico canopy in front of Bâbüssaade (where Bayram throne stood)
  const porticoCanopy = new THREE.Mesh(
    new THREE.BoxGeometry(18.5, 0.8, 6.5),
    mats.darkWood
  );
  porticoCanopy.position.set(0, 8.2, 5.2);
  porticoCanopy.castShadow = true;
  felicityGate.add(porticoCanopy);

  const porticoGoldTrim = new THREE.Mesh(
    new THREE.BoxGeometry(18.8, 0.35, 6.8),
    mats.gildedBronze
  );
  porticoGoldTrim.position.set(0, 8.5, 5.2);
  felicityGate.add(porticoGoldTrim);

  // Central Lead Dome of Bâbüssaade + 2 smaller portico domes
  const fgMainDome = createOttomanDome(4.2, mats, true, 1.3, true);
  fgMainDome.position.set(0, 11.0, 0);
  felicityGate.add(fgMainDome);

  const fgPorticoDome = createOttomanDome(2.6, mats, false, 0, true);
  fgPorticoDome.position.set(0, 8.6, 5.2);
  felicityGate.add(fgPorticoDome);

  // Bayram Throne platform marker (Bayram Tahtı) directly in front of Bâbüssaade
  const throneDais = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.35, 2.4),
    mats.marble
  );
  throneDais.position.set(0, 0.25, 4.8);
  felicityGate.add(throneDais);

  const goldThroneCanopy = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 2.2, 1.6),
    mats.gildedBronze
  );
  goldThroneCanopy.position.set(0, 1.4, 4.8);
  felicityGate.add(goldThroneCanopy);

  flagPositions.push(new THREE.Vector3(-7.5, GROUND_Y + 9.0, -32));
  flagPositions.push(new THREE.Vector3(7.5, GROUND_Y + 9.0, -32));
  root.add(felicityGate);

  // ---------------------------------------------------------------------------
  // 7. THIRD COURTYARD (ENDERUN AVLUSU): ARZ ODASI (AUDIENCE CHAMBER, Z = -52)
  // ---------------------------------------------------------------------------
  const arzOdasi = new THREE.Group();
  arzOdasi.position.set(0, GROUND_Y, -53);

  // Raised marble plinth
  const arzPlinth = new THREE.Mesh(
    new THREE.BoxGeometry(20, 1.2, 15),
    mats.marble
  );
  arzPlinth.position.set(0, 0.6, 0);
  arzPlinth.castShadow = true;
  arzPlinth.receiveShadow = true;
  arzOdasi.add(arzPlinth);

  // Inner chamber walls richly clad in 16th-century İznik tiles
  const arzCore = new THREE.Mesh(
    new THREE.BoxGeometry(13.5, 6.2, 9.2),
    mats.iznikTile
  );
  arzCore.position.set(0, 4.3, 0);
  arzCore.castShadow = true;
  arzCore.receiveShadow = true;
  arzOdasi.add(arzCore);

  // Peripteral colonnade of 22 marble columns surrounding the Audience Chamber
  const colGeo = new THREE.CylinderGeometry(0.28, 0.32, 5.8, 12);
  const capGeo = new THREE.BoxGeometry(0.8, 0.45, 0.8);
  const placeArzColumn = (cx: number, cz: number) => {
    const col = new THREE.Mesh(colGeo, mats.marble);
    col.position.set(cx, 4.1, cz);
    col.castShadow = true;
    arzOdasi.add(col);

    const cap = new THREE.Mesh(capGeo, mats.gildedBronze);
    cap.position.set(cx, 7.1, cz);
    arzOdasi.add(cap);
  };

  for (let x = -8.5; x <= 8.5; x += 3.4) {
    placeArzColumn(x, 6.4);
    placeArzColumn(x, -6.4);
  }
  for (let z = -3.2; z <= 3.2; z += 3.2) {
    placeArzColumn(-8.5, z);
    placeArzColumn(8.5, z);
  }

  // Deep overhanging wooden eaves & pitched lead hip roof of Arz Odası
  const arzEaves = new THREE.Mesh(
    new THREE.BoxGeometry(22.5, 0.8, 17.5),
    mats.darkWood
  );
  arzEaves.position.set(0, 7.5, 0);
  arzEaves.castShadow = true;
  arzOdasi.add(arzEaves);

  const arzRoof = new THREE.Mesh(
    new THREE.ConeGeometry(13.2, 4.5, 4),
    mats.leadRoof
  );
  arzRoof.rotation.y = Math.PI * 0.25;
  arzRoof.scale.set(1.22, 1, 0.95);
  arzRoof.position.set(0, 10.1, 0);
  arzRoof.castShadow = true;
  arzOdasi.add(arzRoof);

  root.add(arzOdasi);

  // ---------------------------------------------------------------------------
  // 8. THIRD COURTYARD PERIMETER: HAS ODA (PRIVY CHAMBER), FATİH PAVILION (TREASURY), ENDERUN SCHOOL & 16TH-C. HAREM
  // ---------------------------------------------------------------------------
  // Has Oda (Privy Chamber of Sultan Suleiman & Sacred Relics) on NW corner of Third Courtyard
  const hasOda = new THREE.Group();
  hasOda.position.set(-22, GROUND_Y, -84);
  const hoBody = new THREE.Mesh(
    new THREE.BoxGeometry(20, 8.2, 18),
    mats.limestone
  );
  hoBody.position.set(0, 4.1, 0);
  hoBody.castShadow = true;
  hoBody.receiveShadow = true;
  hasOda.add(hoBody);

  const hoTileWall = new THREE.Mesh(
    new THREE.BoxGeometry(18.5, 5.5, 18.3),
    mats.iznikTile
  );
  hoTileWall.position.set(0, 3.5, 0);
  hasOda.add(hoTileWall);

  [
    [-4.8, -4.2],
    [4.8, -4.2],
    [-4.8, 4.2],
    [4.8, 4.2],
  ].forEach(([dx, dz]) => {
    const dome = createOttomanDome(3.8, mats, true, 1.2, true);
    dome.position.set(dx, 8.2, dz);
    hasOda.add(dome);
  });
  root.add(hasOda);

  // Fatih Köşkü (Conqueror's Pavilion / Imperial Inner Treasury) on East flank overlooking the Sea of Marmara
  const fatihPavilion = new THREE.Group();
  fatihPavilion.position.set(28, GROUND_Y, -72);
  const fpBody = new THREE.Mesh(
    new THREE.BoxGeometry(14, 8.5, 36),
    mats.limestone
  );
  fpBody.position.set(0, 4.25, 0);
  fpBody.castShadow = true;
  fpBody.receiveShadow = true;
  fatihPavilion.add(fpBody);

  for (let i = -1.5; i <= 1.5; i += 1) {
    const fDome = createOttomanDome(4.2, mats, true, 1.1, true);
    fDome.position.set(0, 8.5, i * 8.8);
    fatihPavilion.add(fDome);
  }
  root.add(fatihPavilion);

  // 16th-Century Harem Expansion (Hürrem Sultan & Suleiman era quarters on Golden Horn / West flank)
  const haremComplex = new THREE.Group();
  haremComplex.position.set(-34, GROUND_Y, -58);

  const haremWall = new THREE.Mesh(
    new THREE.BoxGeometry(16, 9.2, 46),
    mats.limestone
  );
  haremWall.position.set(0, 4.6, 0);
  haremWall.castShadow = true;
  haremWall.receiveShadow = true;
  haremComplex.add(haremWall);

  // Domes of the Queen Mother's / Hürrem Sultan's quarters & Imperial Bath (Hünkâr Hamamı)
  [-14, -4, 6, 15].forEach((hz, idx) => {
    const hDome = createOttomanDome(idx % 2 === 0 ? 3.6 : 2.8, mats, true, 1.0, true);
    hDome.position.set(idx % 2 === 0 ? -2 : 2.5, 9.2, hz);
    haremComplex.add(hDome);
  });

  // Slender Harem Mosque Minaret
  const haremMinaret = new THREE.Group();
  haremMinaret.position.set(-5, 0, 12);
  const minShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 1.15, 22, 12),
    mats.limestone
  );
  minShaft.position.y = 11;
  minShaft.castShadow = true;
  haremMinaret.add(minShaft);

  const serefe = new THREE.Mesh(
    new THREE.CylinderGeometry(1.55, 1.15, 1.2, 12),
    mats.marble
  );
  serefe.position.y = 18.5;
  haremMinaret.add(serefe);

  const minCone = new THREE.Mesh(
    new THREE.ConeGeometry(1.0, 5.5, 12),
    mats.leadRoof
  );
  minCone.position.y = 24.5;
  haremMinaret.add(minCone);

  haremComplex.add(haremMinaret);
  root.add(haremComplex);

  // ---------------------------------------------------------------------------
  // 9. FOURTH COURTYARD (SOFA-I HÜMÂYÛN): MARBLE POOL, FOUNTAINS & 16TH-C. KIOSKS
  // ---------------------------------------------------------------------------
  const fourthCourtyard = new THREE.Group();
  fourthCourtyard.position.set(0, TERRACE_Y, -121);

  // Central reflective marble pool (Havuz) with fountain jet
  const poolCurb = new THREE.Mesh(
    new THREE.BoxGeometry(16, 0.75, 12),
    mats.marble
  );
  poolCurb.position.set(0, 0.4, 0);
  poolCurb.receiveShadow = true;
  fourthCourtyard.add(poolCurb);

  const poolWater = new THREE.Mesh(
    new THREE.BoxGeometry(14.6, 0.65, 10.6),
    mats.waterPool
  );
  poolWater.position.set(0, 0.52, 0);
  fourthCourtyard.add(poolWater);

  const fountainBowl = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 0.7, 1.3, 12),
    mats.marble
  );
  fountainBowl.position.set(0, 0.8, 0);
  fourthCourtyard.add(fountainBowl);

  fountainCenters.push(new THREE.Vector3(0, TERRACE_Y + 1.5, -121));

  // Octagonal 16th-century Royal Kiosks (Tiled / Belvedere Kiosks overlooking Golden Horn & Bosphorus)
  [-22, 22].forEach((kx) => {
    const kiosk = new THREE.Group();
    kiosk.position.set(kx, 0, -6);

    const kPlinth = new THREE.Mesh(
      new THREE.CylinderGeometry(6.8, 7.2, 1.4, 8),
      mats.marble
    );
    kPlinth.position.y = 0.7;
    kiosk.add(kPlinth);

    const kBody = new THREE.Mesh(
      new THREE.CylinderGeometry(5.2, 5.2, 5.8, 8),
      mats.iznikTile
    );
    kBody.position.y = 4.3;
    kBody.castShadow = true;
    kiosk.add(kBody);

    const kEaves = new THREE.Mesh(
      new THREE.CylinderGeometry(7.2, 7.2, 0.55, 8),
      mats.darkWood
    );
    kEaves.position.y = 7.2;
    kiosk.add(kEaves);

    const kDome = createOttomanDome(4.6, mats, true, 0.9, true);
    kDome.position.y = 7.4;
    kiosk.add(kDome);

    fourthCourtyard.add(kiosk);
  });

  // Marble balustrade along northern cliff edge overlooking Bosphorus & Golden Horn
  const northBalustrade = new THREE.Mesh(
    new THREE.BoxGeometry(66, 1.2, 0.8),
    mats.marble
  );
  northBalustrade.position.set(0, 0.8, -18.5);
  fourthCourtyard.add(northBalustrade);

  root.add(fourthCourtyard);

  // ---------------------------------------------------------------------------
  // 10. SUR-I SULTÂNÎ (FORTIFIED PALACE ENCLOSURE WALLS & DEFENSE TOWERS)
  // ---------------------------------------------------------------------------
  const wallsGroup = new THREE.Group();

  const addWallSegment = (
    x1: number,
    z1: number,
    x2: number,
    z2: number,
    height = 10.5,
    thickness = 2.8
  ) => {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);

    const wallGeo = new THREE.BoxGeometry(thickness, height, len);
    const wall = new THREE.Mesh(wallGeo, mats.limestoneDark);
    wall.position.set((x1 + x2) * 0.5, GROUND_Y + height * 0.5 - 3.0, (z1 + z2) * 0.5);
    wall.rotation.y = angle;
    wall.castShadow = true;
    wall.receiveShadow = true;
    wallsGroup.add(wall);

    // Square defensive bastion tower at start vertex
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(thickness * 2.1, height + 3.2, thickness * 2.1),
      mats.limestone
    );
    tower.position.set(x1, GROUND_Y + (height + 3.2) * 0.5 - 3.0, z1);
    tower.castShadow = true;
    tower.receiveShadow = true;
    wallsGroup.add(tower);

    const towerRoof = new THREE.Mesh(
      new THREE.ConeGeometry(thickness * 1.6, 3.5, 4),
      mats.terracottaRoof
    );
    towerRoof.rotation.y = Math.PI * 0.25;
    towerRoof.position.set(x1, GROUND_Y + height + 3.2 - 3.0 + 1.75, z1);
    wallsGroup.add(towerRoof);
  };

  // Perimeter ring of Sur-ı Sultânî leaving gap at Imperial Gate (Z = 106, X = -12..+12)
  const perimeter: [number, number, number, number][] = [
    [-13, 106, -44, 106],
    [-44, 106, -48, 30],
    [-48, 30, -48, -38],
    [-48, -38, -46, -100],
    [-46, -100, -36, -142],
    [-36, -142, 36, -142],
    [36, -142, 46, -100],
    [46, -100, 48, -38],
    [48, -38, 48, 30],
    [48, 30, 44, 106],
    [44, 106, 13, 106],
  ];

  perimeter.forEach(([x1, z1, x2, z2]) => addWallSegment(x1, z1, x2, z2));
  root.add(wallsGroup);

  return {
    root,
    chimneyTops,
    fountainCenters,
    flagPositions,
  };
}
