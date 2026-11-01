import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAMERA_VIEW_PRESETS,
  LIGHTING_PROFILES,
  SEASON_PROFILES,
  getNextTourPresetId,
  getCameraPresetById,
  getPalaceGroundHeight,
  getQualitySettings,
} from './palaceData';

test('CAMERA_VIEW_PRESETS contains all 9 required historical views', () => {
  assert.equal(CAMERA_VIEW_PRESETS.length, 9);
  const ids = CAMERA_VIEW_PRESETS.map((p) => p.id);
  assert.deepEqual(ids, [
    'imperial_gate',
    'first_courtyard',
    'middle_gate',
    'second_courtyard',
    'kubbealti',
    'gate_of_felicity',
    'third_courtyard',
    'fourth_courtyard',
    'aerial_overview',
  ]);
});

test('getNextTourPresetId cycles sequentially and wraps around', () => {
  assert.equal(getNextTourPresetId('imperial_gate'), 'first_courtyard');
  assert.equal(getNextTourPresetId('third_courtyard'), 'fourth_courtyard');
  assert.equal(getNextTourPresetId('aerial_overview'), 'imperial_gate');
});

test('getCameraPresetById retrieves accurate coordinates and target', () => {
  const kubbealti = getCameraPresetById('kubbealti');
  assert.equal(kubbealti.label, 'Kubbealtı & Tower');
  assert.equal(kubbealti.position.length, 3);
  assert.equal(kubbealti.target.length, 3);
});

test('LIGHTING_PROFILES and SEASON_PROFILES cover all presets with valid ranges', () => {
  assert.ok(LIGHTING_PROFILES.morning.sunIntensity > 1);
  assert.ok(LIGHTING_PROFILES.morning.exposure <= 0.85);
  assert.ok(LIGHTING_PROFILES.night.lanternIntensity > 1.5);
  assert.equal(SEASON_PROFILES.winter.snowCoverage, 0.85);
  assert.equal(SEASON_PROFILES.summer.snowCoverage, 0);
});

test('getPalaceGroundHeight returns accurate plateau and terrace heights', () => {
  // Second courtyard center -> plateau height 8.0
  assert.equal(getPalaceGroundHeight(0, 0), 8.0);
  // Fourth courtyard terrace -> height 5.0
  assert.equal(getPalaceGroundHeight(0, -120), 5.0);
  // Distant Bosphorus water -> below 0
  assert.equal(getPalaceGroundHeight(150, -200), -0.5);
});

test('getQualitySettings respects software WebGL and quality presets', () => {
  const swSettings = getQualitySettings('high', true);
  assert.equal(swSettings.shadowsEnabled, false);
  assert.equal(swSettings.pixelRatio, 1);

  const highGpuSettings = getQualitySettings('high', false);
  assert.equal(highGpuSettings.shadowsEnabled, true);
  assert.equal(highGpuSettings.shadowMapSize, 2048);
});
