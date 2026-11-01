import React from 'react';
import {
  Compass,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Wind,
  Users,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  Info,
  X,
} from 'lucide-react';
import {
  ViewPresetId,
  TimeOfDay,
  Season,
  QualityPreset,
  CAMERA_VIEW_PRESETS,
  LIGHTING_PROFILES,
  SEASON_PROFILES,
  getCameraPresetById,
} from '../scene/palaceData';

export interface ControlDockProps {
  activeView: ViewPresetId;
  onSelectView: (view: ViewPresetId) => void;
  timeOfDay: TimeOfDay;
  onSelectTimeOfDay: (time: TimeOfDay) => void;
  season: Season;
  onSelectSeason: (season: Season) => void;
  breeze: number;
  onChangeBreeze: (val: number) => void;
  visitorActivity: number;
  onChangeVisitorActivity: (val: number) => void;
  quality: QualityPreset;
  onSelectQuality: (q: QualityPreset) => void;
  isGuidedTour: boolean;
  onToggleGuidedTour: () => void;
  isDockCollapsed: boolean;
  onToggleDockCollapsed: () => void;
  showHistoricalNote: boolean;
  onToggleHistoricalNote: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  activeView,
  onSelectView,
  timeOfDay,
  onSelectTimeOfDay,
  season,
  onSelectSeason,
  breeze,
  onChangeBreeze,
  visitorActivity,
  onChangeVisitorActivity,
  quality,
  onSelectQuality,
  isGuidedTour,
  onToggleGuidedTour,
  isDockCollapsed,
  onToggleDockCollapsed,
  showHistoricalNote,
  onToggleHistoricalNote,
}) => {
  const currentPreset = getCameraPresetById(activeView);
  const seasonLabel = SEASON_PROFILES[season].label;
  const timeLabel = LIGHTING_PROFILES[timeOfDay].label;

  return (
    <>
      {/* Top-Left Minimal Architectural Title & Historical Status Block */}
      <header className="fixed top-4 left-4 z-10 pointer-events-auto max-w-md">
        <div className="bg-slate-950/88 border border-amber-500/25 rounded-xl px-4 py-3 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-base sm:text-lg font-semibold tracking-wide text-amber-100 leading-snug">
                Topkapı Palace in the Age of Suleiman the Magnificent (c. 1550)
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
                <span className="font-medium text-amber-400">
                  {seasonLabel}, {timeLabel}
                </span>
                <span aria-hidden="true">·</span>
                <span>{currentPreset.turkishName}</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400">Unofficial historical 3D study</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleHistoricalNote}
              aria-label={showHistoricalNote ? 'Hide architectural notes' : 'Show architectural notes'}
              aria-expanded={showHistoricalNote}
              className="p-1.5 rounded-lg text-amber-300/90 hover:text-amber-200 hover:bg-slate-800/80 transition-colors shrink-0"
              title="Toggle Architectural Context"
            >
              {showHistoricalNote ? <X className="w-4 h-4" /> : <Info className="w-4 h-4" />}
            </button>
          </div>

          {showHistoricalNote && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-800/90 text-xs text-slate-300 leading-relaxed">
              <div className="font-semibold text-amber-200 mb-0.5">
                {currentPreset.label} — {currentPreset.subtitle}
              </div>
              <p className="text-slate-300/95">{currentPreset.description}</p>
            </div>
          )}
        </div>
      </header>

      {/* Unified Collapsible Bottom Control Dock (Zero Central Viewport Occlusion) */}
      <aside
        aria-label="Palace Camera & Atmosphere Controls"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10 w-[min(1180px,96vw)] pointer-events-auto"
      >
        {/* Collapse / Expand Handle */}
        <div className="flex justify-center mb-1.5">
          <button
            type="button"
            onClick={onToggleDockCollapsed}
            aria-expanded={!isDockCollapsed}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-950/92 border border-amber-500/25 text-xs font-medium text-slate-200 hover:text-amber-300 hover:border-amber-400/50 transition-colors shadow-lg whitespace-nowrap"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Show Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                <span>Hide Controls</span>
              </>
            )}
          </button>
        </div>

        {!isDockCollapsed && (
          <div className="bg-slate-950/92 border border-amber-500/25 rounded-2xl px-4 py-3 shadow-2xl space-y-2.5">
            {/* Row 1: All 9 Camera Viewpoints + Guided Tour Action on a single clean row */}
            <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800/90">
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-400 pr-1 flex items-center gap-1 shrink-0">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  Views
                </span>
                {CAMERA_VIEW_PRESETS.map((preset) => {
                  const isActive = activeView === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onSelectView(preset.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                          : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={onToggleGuidedTour}
                aria-pressed={isGuidedTour}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  isGuidedTour
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25'
                }`}
              >
                {isGuidedTour ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Tour</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Guided Tour</span>
                  </>
                )}
              </button>
            </div>

            {/* Row 2: Lighting, Season, Breeze, Visitor Activity, and Render Quality */}
            <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 text-xs">
              {/* Time of Day */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-slate-400 font-medium text-[11px] shrink-0">Light:</span>
                <div className="flex items-center gap-0.5 bg-slate-900/95 p-1 rounded-lg border border-slate-800">
                  {(
                    [
                      { id: 'morning', label: 'Morning', icon: Sunrise },
                      { id: 'midday', label: 'Midday', icon: Sun },
                      { id: 'golden_hour', label: 'Golden Hour', icon: Sunset },
                      { id: 'night', label: 'Night', icon: Moon },
                    ] as const
                  ).map((item) => {
                    const Icon = item.icon;
                    const active = timeOfDay === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectTimeOfDay(item.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-amber-500 text-slate-950 font-semibold'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3 h-3 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Season Switch */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-slate-400 font-medium text-[11px] shrink-0">Season:</span>
                <div className="flex items-center gap-0.5 bg-slate-900/95 p-1 rounded-lg border border-slate-800">
                  {(['spring', 'summer', 'autumn', 'winter'] as Season[]).map((s) => {
                    const active = season === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => onSelectSeason(s)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium capitalize transition-colors whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-amber-500 text-slate-950 font-semibold'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Breeze & Visitor Sliders */}
              <div className="flex items-center gap-4 flex-1 min-w-[220px] max-w-[320px]">
                <label className="flex items-center gap-1.5 flex-1">
                  <Wind className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px] text-slate-300 shrink-0">Breeze</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={breeze}
                    aria-label="Breeze strength"
                    onChange={(e) => onChangeBreeze(parseFloat(e.target.value))}
                    className="w-20"
                  />
                </label>

                <label className="flex items-center gap-1.5 flex-1">
                  <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px] text-slate-300 shrink-0">Court</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={visitorActivity}
                    aria-label="Court visitor activity"
                    onChange={(e) => onChangeVisitorActivity(parseFloat(e.target.value))}
                    className="w-20"
                  />
                </label>
              </div>

              {/* Quality Preset */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-slate-400 font-medium shrink-0 text-[11px]">Quality:</span>
                <div className="flex items-center gap-0.5 bg-slate-900/95 p-1 rounded-lg border border-slate-800">
                  {(['high', 'balanced', 'fast'] as QualityPreset[]).map((q) => {
                    const active = quality === q;
                    return (
                      <button
                        key={q}
                        type="button"
                        onClick={() => onSelectQuality(q)}
                        className={`px-2 py-1 rounded text-[11px] font-medium capitalize transition-colors whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-amber-500 text-slate-950 font-semibold'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {q}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
