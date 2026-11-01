export type ViewPresetId =
  | 'imperial_gate'
  | 'first_courtyard'
  | 'middle_gate'
  | 'second_courtyard'
  | 'kubbealti'
  | 'gate_of_felicity'
  | 'third_courtyard'
  | 'fourth_courtyard'
  | 'aerial_overview';

export type TimeOfDay = 'morning' | 'midday' | 'golden_hour' | 'night';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type QualityPreset = 'high' | 'balanced' | 'fast';

export interface CameraViewPreset {
  id: ViewPresetId;
  label: string;
  turkishName: string;
  subtitle: string;
  description: string;
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

export interface LightingProfile {
  timeOfDay: TimeOfDay;
  label: string;
  sunPosition: [number, number, number];
  sunColor: string;
  sunIntensity: number;
  hemiSkyColor: string;
  hemiGroundColor: string;
  hemiIntensity: number;
  fogColor: string;
  fogDensity: number;
  skyTopColor: string;
  skyBottomColor: string;
  waterColor: string;
  waterDeepColor: string;
  lanternIntensity: number;
  windowEmissiveIntensity: number;
  starOpacity: number;
  exposure: number;
}

export interface SeasonProfile {
  season: Season;
  label: string;
  foliagePrimary: string;
  foliageSecondary: string;
  blossomColor: string;
  cypressColor: string;
  grassColor: string;
  groundTint: string;
  snowCoverage: number;
  leafDensity: number;
}

export const CAMERA_VIEW_PRESETS: CameraViewPreset[] = [
  {
    id: 'imperial_gate',
    label: 'Imperial Gate',
    turkishName: 'Bâb-ı Hümâyûn',
    subtitle: 'Outer Threshold of the Sultanate',
    description:
      'Erected under Mehmed II and maintained under Suleiman the Magnificent, the monumental limestone portal separates the civic fabric of Constantinople from the First Courtyard.',
    position: [0, 14, 152],
    target: [0, 8, 108],
    fov: 45,
  },
  {
    id: 'first_courtyard',
    label: 'First Courtyard',
    turkishName: 'Alay Meydanı',
    subtitle: 'Court of the Janissaries & Hagia Irene',
    description:
      'The vast outer precinct where imperial processions assembled. Dominated on the west by the former Byzantine church of Hagia Irene (used as the Imperial Armory) and service bakeries.',
    position: [32, 24, 96],
    target: [-8, 8, 56],
    fov: 48,
  },
  {
    id: 'middle_gate',
    label: 'Middle Gate',
    turkishName: 'Bâbüsselâm',
    subtitle: 'Gate of Salutation',
    description:
      'Flanked by twin octagonal defensive towers with conical lead-sheathed roofs. Beyond this threshold, all officials except the Sultan himself were required to dismount.',
    position: [12, 13, 62],
    target: [0, 9, 28],
    fov: 42,
  },
  {
    id: 'second_courtyard',
    label: 'Second Courtyard',
    turkishName: 'Divan Meydanı',
    subtitle: 'Administrative Heart of the Empire',
    description:
      'Surrounded by marble colonnades, shaded cypress avenues, and the ten domed chimneys of the Imperial Kitchens (Matbah-ı Âmire) on the eastern flank.',
    position: [26, 20, 18],
    target: [-6, 7, -18],
    fov: 46,
  },
  {
    id: 'kubbealti',
    label: 'Kubbealtı & Tower',
    turkishName: 'Divân-ı Hümâyûn & Adalet Kulesi',
    subtitle: 'Imperial Council Hall & Tower of Justice',
    description:
      'Where the Grand Vizier and Viziers of the Dome deliberated state affairs beneath three lead domes, while Suleiman observed unseen through the gilded grille beneath the soaring Tower of Justice.',
    position: [14, 15, -6],
    target: [-22, 14, -26],
    fov: 44,
  },
  {
    id: 'gate_of_felicity',
    label: 'Gate of Felicity',
    turkishName: 'Bâbüssaade',
    subtitle: 'Threshold of the Inner Palace (Enderun)',
    description:
      'Framed by a domed marble portico where the Sultan sat enthroned during Bayram ceremonies and accession homages. Marks entry into the secluded private domain.',
    position: [0, 10.5, -14],
    target: [0, 8.5, -42],
    fov: 40,
  },
  {
    id: 'third_courtyard',
    label: 'Third Courtyard',
    turkishName: 'Enderun Avlusu',
    subtitle: 'Audience Chamber (Arz Odası) & Palace School',
    description:
      'Immediately behind the Gate of Felicity rises the colonnaded Chamber of Petitions (Arz Odası), surrounded by the Privy Chamber of the Sacred Relics, Imperial Treasury, and early 16th-century Harem quarters.',
    position: [26, 21, -48],
    target: [-4, 8, -72],
    fov: 46,
  },
  {
    id: 'fourth_courtyard',
    label: 'Fourth Courtyard',
    turkishName: 'Sofa-i Hümâyûn',
    subtitle: 'Terraced Gardens & Sea Kiosks',
    description:
      'Tiered marble terraces, reflective pools, and early 16th-century royal pavilions perched high on the Seraglio Point promontory overlooking the Golden Horn and Bosphorus.',
    position: [-28, 22, -138],
    target: [6, 9, -108],
    fov: 46,
  },
  {
    id: 'aerial_overview',
    label: 'Aerial Overview',
    turkishName: 'Sarayburnu Panoraması',
    subtitle: 'Seraglio Point & Confluence of Three Seas',
    description:
      'Full bird’s-eye perspective of the Sur-ı Sultânî seawalls, the sequential four courtyards along the ridge, Hagia Sophia to the southwest, and Ottoman galleys plying the Bosphorus.',
    position: [135, 92, 95],
    target: [-5, 6, -20],
    fov: 45,
  },
];

export const LIGHTING_PROFILES: Record<TimeOfDay, LightingProfile> = {
  morning: {
    timeOfDay: 'morning',
    label: 'Morning',
    sunPosition: [140, 48, 30],
    sunColor: '#f5c794',
    sunIntensity: 1.25,
    hemiSkyColor: '#7ea8cc',
    hemiGroundColor: '#544638',
    hemiIntensity: 0.45,
    fogColor: '#b5cada',
    fogDensity: 0.0014,
    skyTopColor: '#2d5885',
    skyBottomColor: '#d9b898',
    waterColor: '#19455c',
    waterDeepColor: '#0c2536',
    lanternIntensity: 0.0,
    windowEmissiveIntensity: 0.04,
    starOpacity: 0.0,
    exposure: 0.78,
  },
  midday: {
    timeOfDay: 'midday',
    label: 'Midday',
    sunPosition: [55, 135, 45],
    sunColor: '#f7efe0',
    sunIntensity: 1.4,
    hemiSkyColor: '#73addb',
    hemiGroundColor: '#5c4e3e',
    hemiIntensity: 0.5,
    fogColor: '#b8cde0',
    fogDensity: 0.0011,
    skyTopColor: '#194980',
    skyBottomColor: '#9ec2de',
    waterColor: '#124a66',
    waterDeepColor: '#08293b',
    lanternIntensity: 0.0,
    windowEmissiveIntensity: 0.0,
    starOpacity: 0.0,
    exposure: 0.8,
  },
  golden_hour: {
    timeOfDay: 'golden_hour',
    label: 'Golden Hour',
    sunPosition: [-150, 32, 40],
    sunColor: '#f08a3e',
    sunIntensity: 1.35,
    hemiSkyColor: '#cc825e',
    hemiGroundColor: '#3d2c20',
    hemiIntensity: 0.42,
    fogColor: '#c28d6e',
    fogDensity: 0.0015,
    skyTopColor: '#233254',
    skyBottomColor: '#d47f46',
    waterColor: '#1e364a',
    waterDeepColor: '#0f1c2b',
    lanternIntensity: 0.55,
    windowEmissiveIntensity: 0.35,
    starOpacity: 0.15,
    exposure: 0.78,
  },
  night: {
    timeOfDay: 'night',
    label: 'Night',
    sunPosition: [-80, 95, -90],
    sunColor: '#5c7dad',
    sunIntensity: 0.42,
    hemiSkyColor: '#172640',
    hemiGroundColor: '#0f141f',
    hemiIntensity: 0.35,
    fogColor: '#0a1220',
    fogDensity: 0.0016,
    skyTopColor: '#050912',
    skyBottomColor: '#132033',
    waterColor: '#081624',
    waterDeepColor: '#040b12',
    lanternIntensity: 2.2,
    windowEmissiveIntensity: 1.35,
    starOpacity: 0.95,
    exposure: 0.75,
  },
};

export const SEASON_PROFILES: Record<Season, SeasonProfile> = {
  spring: {
    season: 'spring',
    label: 'Spring',
    foliagePrimary: '#4d8c4a',
    foliageSecondary: '#73ab5c',
    blossomColor: '#f4b8c8',
    cypressColor: '#1f4226',
    grassColor: '#486e3a',
    groundTint: '#cbbd9f',
    snowCoverage: 0,
    leafDensity: 1.0,
  },
  summer: {
    season: 'summer',
    label: 'Summer',
    foliagePrimary: '#366e34',
    foliageSecondary: '#4d8241',
    blossomColor: '#3f783b',
    cypressColor: '#19381f',
    grassColor: '#3e5e32',
    groundTint: '#d2c2a3',
    snowCoverage: 0,
    leafDensity: 1.0,
  },
  autumn: {
    season: 'autumn',
    label: 'Autumn',
    foliagePrimary: '#c2692b',
    foliageSecondary: '#d99b38',
    blossomColor: '#a83c28',
    cypressColor: '#213b22',
    grassColor: '#6e6535',
    groundTint: '#c9b493',
    snowCoverage: 0,
    leafDensity: 0.85,
  },
  winter: {
    season: 'winter',
    label: 'Winter',
    foliagePrimary: '#7d878c',
    foliageSecondary: '#97a1a6',
    blossomColor: '#8d969c',
    cypressColor: '#243b2b',
    grassColor: '#8a9188',
    groundTint: '#dce2e6',
    snowCoverage: 0.85,
    leafDensity: 0.35,
  },
};

/**
 * Pure helper to get the next camera preset in the Guided Tour sequence.
 */
export function getNextTourPresetId(currentId: ViewPresetId): ViewPresetId {
  const index = CAMERA_VIEW_PRESETS.findIndex((p) => p.id === currentId);
  if (index === -1) return CAMERA_VIEW_PRESETS[0].id;
  return CAMERA_VIEW_PRESETS[(index + 1) % CAMERA_VIEW_PRESETS.length].id;
}

/**
 * Pure helper to get a preset by ID.
 */
export function getCameraPresetById(id: ViewPresetId): CameraViewPreset {
  return (
    CAMERA_VIEW_PRESETS.find((p) => p.id === id) || CAMERA_VIEW_PRESETS[0]
  );
}

/**
 * Pure helper to compute terrain elevation on Sarayburnu (Seraglio Point).
 * The palace sits on a flat-topped hill ridge (y = 8.0) with a gentle drop
 * to the Fourth Courtyard terraces (y = 4.5) and drops sharply outside the
 * seawalls down to sea level (y = 0).
 */
export function getPalaceGroundHeight(x: number, z: number): number {
  // Fourth courtyard lower terrace
  if (z < -102 && z > -142 && Math.abs(x) < 42) {
    return 5.0;
  }
  // Core palace plateau (Courtyards 1, 2, 3 & upper 4th)
  if (z >= -102 && z <= 135 && Math.abs(x) <= 58) {
    return 8.0;
  }
  // Outer slope toward sea
  const distX = Math.max(0, Math.abs(x) - 58);
  const distZNorth = Math.max(0, -142 - z);
  const distZSouth = Math.max(0, z - 135);
  const edgeDist = Math.sqrt(
    distX * distX + distZNorth * distZNorth + distZSouth * distZSouth
  );
  if (edgeDist < 42) {
    const t = edgeDist / 42;
    return 8.0 * (1 - t * t);
  }
  return -0.5;
}

/**
 * Pure helper to compute quality configuration parameters.
 */
export function getQualitySettings(
  quality: QualityPreset,
  isSoftwareGl: boolean
) {
  if (isSoftwareGl) {
    return {
      pixelRatio: 1,
      shadowMapSize: 0,
      shadowsEnabled: false,
      bloomEnabled: false,
      treeMultiplier: 0.65,
      maxVisitors: 45,
      waterSegments: 24,
    };
  }
  switch (quality) {
    case 'high':
      return {
        pixelRatio: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 2, 2),
        shadowMapSize: 2048,
        shadowsEnabled: true,
        bloomEnabled: true,
        treeMultiplier: 1.0,
        maxVisitors: 90,
        waterSegments: 64,
      };
    case 'balanced':
      return {
        pixelRatio: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1.5, 1.5),
        shadowMapSize: 1024,
        shadowsEnabled: true,
        bloomEnabled: true,
        treeMultiplier: 0.85,
        maxVisitors: 65,
        waterSegments: 48,
      };
    case 'fast':
      return {
        pixelRatio: 1.0,
        shadowMapSize: 512,
        shadowsEnabled: false,
        bloomEnabled: false,
        treeMultiplier: 0.6,
        maxVisitors: 35,
        waterSegments: 24,
      };
  }
}
