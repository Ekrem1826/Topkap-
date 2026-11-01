/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ViewPresetId,
  TimeOfDay,
  Season,
  QualityPreset,
  getNextTourPresetId,
} from './scene/palaceData';
import { TopkapiViewport } from './components/TopkapiViewport';
import { ControlDock } from './components/ControlDock';

export default function App() {
  const [activeView, setActiveView] = useState<ViewPresetId>('aerial_overview');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('golden_hour');
  const [season, setSeason] = useState<Season>('summer');
  const [breeze, setBreeze] = useState<number>(0.45);
  const [visitorActivity, setVisitorActivity] = useState<number>(0.75);
  const [quality, setQuality] = useState<QualityPreset>('high');
  const [isGuidedTour, setIsGuidedTour] = useState<boolean>(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [showHistoricalNote, setShowHistoricalNote] = useState<boolean>(true);

  // Guided Tour automatic cycling across the 9 architectural viewpoints
  useEffect(() => {
    if (!isGuidedTour) return;
    const interval = window.setInterval(() => {
      setActiveView((prev) => getNextTourPresetId(prev));
    }, 6500);
    return () => clearInterval(interval);
  }, [isGuidedTour]);

  // Keyboard shortcut 'H' to toggle HUD dock collapse (Zen / Showcase recording mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setIsDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectView = useCallback((view: ViewPresetId) => {
    setActiveView(view);
  }, []);

  const handleUserCameraOverride = useCallback(() => {
    setIsGuidedTour(false);
  }, []);

  return (
    <main
      className="relative w-screen h-screen overflow-hidden bg-[#0a0f18] select-none"
      data-view={activeView}
      data-time={timeOfDay}
      data-season={season}
      data-tour={isGuidedTour ? 'active' : 'idle'}
    >
      <TopkapiViewport
        activeView={activeView}
        timeOfDay={timeOfDay}
        season={season}
        breeze={breeze}
        visitorActivity={visitorActivity}
        quality={quality}
        onUserCameraOverride={handleUserCameraOverride}
      />

      <ControlDock
        activeView={activeView}
        onSelectView={handleSelectView}
        timeOfDay={timeOfDay}
        onSelectTimeOfDay={setTimeOfDay}
        season={season}
        onSelectSeason={setSeason}
        breeze={breeze}
        onChangeBreeze={setBreeze}
        visitorActivity={visitorActivity}
        onChangeVisitorActivity={setVisitorActivity}
        quality={quality}
        onSelectQuality={setQuality}
        isGuidedTour={isGuidedTour}
        onToggleGuidedTour={() => setIsGuidedTour((prev) => !prev)}
        isDockCollapsed={isDockCollapsed}
        onToggleDockCollapsed={() => setIsDockCollapsed((prev) => !prev)}
        showHistoricalNote={showHistoricalNote}
        onToggleHistoricalNote={() => setShowHistoricalNote((prev) => !prev)}
      />
    </main>
  );
}
