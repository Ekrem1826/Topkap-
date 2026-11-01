import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import {
  ViewPresetId,
  TimeOfDay,
  Season,
  QualityPreset,
  getCameraPresetById,
  LIGHTING_PROFILES,
  getQualitySettings,
} from '../scene/palaceData';
import { createPalaceTextures } from '../scene/proceduralTextures';
import { createPalaceMaterials } from '../scene/palaceMaterials';
import { buildPalaceArchitecture } from '../scene/palaceArchitecture';
import { buildSurroundingsAndInstancing } from '../scene/palaceSurroundings';

export interface TopkapiViewportProps {
  activeView: ViewPresetId;
  timeOfDay: TimeOfDay;
  season: Season;
  breeze: number;
  visitorActivity: number;
  quality: QualityPreset;
  onUserCameraOverride?: () => void;
}

// Reusable scratch vectors & colors for zero-GC render loop
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _sunPosTarget = new THREE.Vector3();
const _sunColorTarget = new THREE.Color();
const _hemiSkyTarget = new THREE.Color();
const _hemiGroundTarget = new THREE.Color();
const _fogColorTarget = new THREE.Color();
const _waterColorTarget = new THREE.Color();

export const TopkapiViewport: React.FC<TopkapiViewportProps> = ({
  activeView,
  timeOfDay,
  season,
  breeze,
  visitorActivity,
  quality,
  onUserCameraOverride,
}) => {
  const canvasMountRef = useRef<HTMLDivElement>(null);

  // Store reactive props in refs so React updates never tear down the WebGL context
  const stateRef = useRef({
    activeView,
    timeOfDay,
    season,
    breeze,
    visitorActivity,
    quality,
    isCameraTransitioning: true,
    onUserCameraOverride,
  });

  const seasonUpdateRef = useRef<((s: Season) => void) | null>(null);
  const qualityUpdateRef = useRef<((q: QualityPreset) => void) | null>(null);

  useEffect(() => {
    const prevView = stateRef.current.activeView;
    const prevSeason = stateRef.current.season;
    const prevQuality = stateRef.current.quality;

    stateRef.current.activeView = activeView;
    stateRef.current.timeOfDay = timeOfDay;
    stateRef.current.season = season;
    stateRef.current.breeze = breeze;
    stateRef.current.visitorActivity = visitorActivity;
    stateRef.current.quality = quality;
    stateRef.current.onUserCameraOverride = onUserCameraOverride;

    if (prevView !== activeView) {
      stateRef.current.isCameraTransitioning = true;
    }
    if (prevSeason !== season && seasonUpdateRef.current) {
      seasonUpdateRef.current(season);
    }
    if (prevQuality !== quality && qualityUpdateRef.current) {
      qualityUpdateRef.current(quality);
    }
  }, [activeView, timeOfDay, season, breeze, visitorActivity, quality, onUserCameraOverride]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Detect Software WebGL from GPU renderer string
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const initialQ = getQualitySettings(stateRef.current.quality, isSoftwareGl);

    // 2. Initialize WebGLRenderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(initialQ.pixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = initialQ.shadowsEnabled;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('data-testid', 'topkapi-canvas');

    container.appendChild(renderer.domElement);

    // 3. Scene & Studio Environment Reflection (RoomEnvironment + PMREMGenerator)
    const scene = new THREE.Scene();
    const initialLight = LIGHTING_PROFILES[stateRef.current.timeOfDay];
    scene.background = new THREE.Color(initialLight.fogColor);
    scene.fog = new THREE.FogExp2(initialLight.fogColor, initialLight.fogDensity);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.25;
    pmremGenerator.dispose();

    // 4. Camera & OrbitControls
    const initialPreset = getCameraPresetById(stateRef.current.activeView);
    const camera = new THREE.PerspectiveCamera(
      initialPreset.fov || 45,
      container.clientWidth / container.clientHeight,
      0.5,
      1400
    );
    camera.position.set(...initialPreset.position);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...initialPreset.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI * 0.485;
    controls.minDistance = 8;
    controls.maxDistance = 380;
    controls.update();

    const handleControlStart = () => {
      stateRef.current.isCameraTransitioning = false;
      stateRef.current.onUserCameraOverride?.();
    };
    controls.addEventListener('start', handleControlStart);

    // 5. Three-Point / Atmospheric Lighting Rig (1 Shadow Caster)
    const hemiLight = new THREE.HemisphereLight(
      initialLight.hemiSkyColor,
      initialLight.hemiGroundColor,
      initialLight.hemiIntensity
    );
    hemiLight.position.set(0, 120, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(
      initialLight.sunColor,
      initialLight.sunIntensity
    );
    sunLight.position.set(...initialLight.sunPosition);
    sunLight.castShadow = initialQ.shadowsEnabled;
    if (!isSoftwareGl) {
      sunLight.shadow.mapSize.set(initialQ.shadowMapSize, initialQ.shadowMapSize);
      const d = 145;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.camera.near = 10;
      sunLight.shadow.camera.far = 420;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
    }
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x88a8c8, 0.22);
    rimLight.position.set(-90, 55, -120);
    scene.add(rimLight);

    // 6. Build Procedural Textures, Materials, Palace Architecture & Surroundings
    const textures = createPalaceTextures(renderer);
    const materials = createPalaceMaterials(textures);
    const architecture = buildPalaceArchitecture(materials);
    scene.add(architecture.root);

    const surroundings = buildSurroundingsAndInstancing(
      materials,
      architecture.chimneyTops,
      architecture.fountainCenters,
      architecture.flagPositions,
      isSoftwareGl
    );
    scene.add(surroundings.root);

    // Apply initial season
    surroundings.updateSeason(stateRef.current.season);
    seasonUpdateRef.current = surroundings.updateSeason;

    // 7. Post-Processing with OutputPass (so ACESFilmicToneMapping and sRGB work properly on GPU)
    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(container.clientWidth, container.clientHeight),
        0.22,
        0.4,
        0.92
      );
      composer.addPass(bloomPass);
      composer.addPass(new OutputPass());
    }

    // Quality switcher callback
    qualityUpdateRef.current = (newQuality: QualityPreset) => {
      const q = getQualitySettings(newQuality, isSoftwareGl);
      renderer.setPixelRatio(q.pixelRatio);
      renderer.shadowMap.enabled = q.shadowsEnabled;
      sunLight.castShadow = q.shadowsEnabled;
    };

    // Pre-warm shaders on hardware GPUs
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 8. Animation & Software-WebGL Paced Render Loop
    let frameId = 0;
    let isDisposed = false;
    let lastTime = performance.now();
    const startTime = lastTime;

    function afterDraw(cb: () => void) {
      if (isDisposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (isDisposed) return;
      const now = performance.now();
      const rawDt = (now - lastTime) * 0.001;
      lastTime = now;
      const dt = Math.min(Math.max(rawDt, 0.001), 0.1);
      const elapsed = (now - startTime) * 0.001;

      const st = stateRef.current;

      // Smooth Camera Flight Interpolation
      if (st.isCameraTransitioning) {
        const preset = getCameraPresetById(st.activeView);
        _targetCamPos.set(...preset.position);
        _targetLookAt.set(...preset.target);

        const dampFactor = isSoftwareGl ? 0.55 : 1 - Math.exp(-3.6 * dt);
        camera.position.lerp(_targetCamPos, dampFactor);
        controls.target.lerp(_targetLookAt, dampFactor);

        if (
          camera.position.distanceToSquared(_targetCamPos) < 0.08 &&
          controls.target.distanceToSquared(_targetLookAt) < 0.08
        ) {
          camera.position.copy(_targetCamPos);
          controls.target.copy(_targetLookAt);
          st.isCameraTransitioning = false;
        }
      }

      controls.update();

      // Smooth Lighting & Atmosphere Blending
      const lp = LIGHTING_PROFILES[st.timeOfDay];
      const lightAlpha = isSoftwareGl ? 0.45 : 1 - Math.exp(-3.2 * dt);

      _sunPosTarget.set(...lp.sunPosition);
      sunLight.position.lerp(_sunPosTarget, lightAlpha);

      _sunColorTarget.set(lp.sunColor);
      sunLight.color.lerp(_sunColorTarget, lightAlpha);
      sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, lp.sunIntensity, lightAlpha);

      _hemiSkyTarget.set(lp.hemiSkyColor);
      _hemiGroundTarget.set(lp.hemiGroundColor);
      hemiLight.color.lerp(_hemiSkyTarget, lightAlpha);
      hemiLight.groundColor.lerp(_hemiGroundTarget, lightAlpha);
      hemiLight.intensity = THREE.MathUtils.lerp(hemiLight.intensity, lp.hemiIntensity, lightAlpha);

      _fogColorTarget.set(lp.fogColor);
      if (scene.background instanceof THREE.Color) {
        scene.background.lerp(_fogColorTarget, lightAlpha);
      }
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.lerp(_fogColorTarget, lightAlpha);
        scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, lp.fogDensity, lightAlpha);
      }

      _waterColorTarget.set(lp.waterColor);
      (surroundings.waterMesh.material as THREE.MeshStandardMaterial).color.lerp(
        _waterColorTarget,
        lightAlpha
      );

      // Update Night Lanterns, Lit Windows, and Stars
      materials.windowLit.emissiveIntensity = THREE.MathUtils.lerp(
        materials.windowLit.emissiveIntensity,
        lp.windowEmissiveIntensity,
        lightAlpha
      );
      surroundings.lanternLights.forEach((l) => {
        l.intensity = THREE.MathUtils.lerp(l.intensity, lp.lanternIntensity, lightAlpha);
      });
      surroundings.starMaterial.opacity = THREE.MathUtils.lerp(
        surroundings.starMaterial.opacity,
        lp.starOpacity,
        lightAlpha
      );
      renderer.toneMappingExposure = THREE.MathUtils.lerp(
        renderer.toneMappingExposure,
        lp.exposure,
        lightAlpha
      );

      // Update World Animations (Breeze, Ships, Smoke, Fountain, Visitors)
      const qSettings = getQualitySettings(st.quality, isSoftwareGl);
      surroundings.updateTick(
        elapsed,
        dt,
        st.breeze,
        st.visitorActivity * (qSettings.maxVisitors / 80)
      );

      // Render Frame
      if (isSoftwareGl || !composer || !qSettings.bloomEnabled) {
        renderer.render(scene, camera);
      } else {
        if (bloomPass) {
          bloomPass.enabled = st.timeOfDay === 'night';
          bloomPass.strength = st.timeOfDay === 'night' ? 0.32 : 0.0;
        }
        composer.render();
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    // 9. Responsive Resize Listener
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (composer) composer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', handleControlStart);
      controls.dispose();
      textures.dispose();
      materials.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={canvasMountRef}
      className="fixed inset-0 w-full h-full overflow-hidden z-0"
      aria-label="Interactive 3D viewport of Topkapı Palace in circa 1550"
    />
  );
};
