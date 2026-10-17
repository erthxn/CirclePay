'use client';

import { useCallback } from 'react';
import { useStudioSelector, useDispatch } from './useStudioState';
import {
  CARD_MARKS,
  MEMBER_COUNTS,
  type CardMark,
  type MemberCount,
} from '@/lib/studio/types';

export default function CustomizationPanel() {
  const custom = useStudioSelector((s) => s.customization);
  const dispatch = useDispatch();

  const setStopColor = useCallback((i: number, color: string) => {
    dispatch({ type: 'SET_GRADIENT_STOP', index: i, color });
  }, [dispatch]);

  const addStop = useCallback(() => dispatch({ type: 'ADD_GRADIENT_STOP' }), [dispatch]);
  const removeStop = useCallback((i: number) => dispatch({ type: 'REMOVE_GRADIENT_STOP', index: i }), [dispatch]);
  const setAngle = useCallback((a: number) => dispatch({ type: 'SET_GRADIENT_ANGLE', angle: a }), [dispatch]);
  const setStrokeWidth = useCallback((w: number) => dispatch({ type: 'SET_STROKE_WIDTH', width: w }), [dispatch]);
  const setStrokeOpacity = useCallback((o: number) => dispatch({ type: 'SET_STROKE_OPACITY', opacity: o }), [dispatch]);
  const setDash = useCallback((d: string) => dispatch({ type: 'SET_DASH_ARRAY', dash: d }), [dispatch]);
  const setMark = useCallback((m: CardMark) => dispatch({ type: 'SET_MARK', mark: m }), [dispatch]);
  const setMemberCount = useCallback((c: MemberCount) => dispatch({ type: 'SET_MEMBER_COUNT', count: c }), [dispatch]);
  const toggleFilter = useCallback(() => dispatch({ type: 'TOGGLE_FILTER' }), [dispatch]);
  const setStrokeOverride = useCallback((c: string) => dispatch({ type: 'SET_STROKE_OVERRIDE', color: c }), [dispatch]);
  const reset = useCallback(() => dispatch({ type: 'RESET_CUSTOMIZATION' }), [dispatch]);

  return (
    <div className="flex flex-col gap-4 p-4 neu-raised rounded-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text)]">Customize</h3>
        <button onClick={reset} className="text-[11px] text-[var(--accent)]">Reset</button>
      </div>

      {/* Gradient stops */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[11px] text-[var(--text-muted)]">Gradient stops</p>
          <button onClick={addStop} className="text-[11px] text-[var(--accent)]">+ Add stop</button>
        </div>
        <div className="flex flex-col gap-1.5">
          {custom.gradientStops.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="color"
                value={s.color}
                onChange={(e) => setStopColor(i, e.target.value)}
                className="w-9 h-9 rounded-md border-0 cursor-pointer bg-transparent"
                aria-label={`Stop ${i + 1} color`}
              />
              <span className="text-[11px] text-[var(--text-muted)] font-mono flex-1">{s.color}</span>
              <span className="text-[11px] text-[var(--text-muted)] w-10 text-right">{Math.round(s.offset)}%</span>
              {custom.gradientStops.length > 2 && (
                <button
                  onClick={() => removeStop(i)}
                  className="text-[11px] text-red-500 w-6 h-6 rounded-full hover:bg-red-50"
                  aria-label="Remove stop"
                >×</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Gradient angle */}
      <SliderRow label="Gradient angle" value={`${Math.round(custom.gradientAngle)}°`}>
        <input
          type="range"
          min={0}
          max={360}
          value={custom.gradientAngle}
          onChange={(e) => setAngle(Number(e.target.value))}
          className="studio-range"
          aria-label="Gradient angle"
        />
      </SliderRow>

      {/* Stroke width */}
      <SliderRow label="Stroke width" value={custom.strokeWidth.toFixed(2)}>
        <input
          type="range"
          min={0.2}
          max={4}
          step={0.1}
          value={custom.strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="studio-range"
          aria-label="Stroke width"
        />
      </SliderRow>

      {/* Stroke opacity */}
      <SliderRow label="Stroke opacity" value={Math.round(custom.strokeOpacity * 100) + '%'}>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={custom.strokeOpacity}
          onChange={(e) => setStrokeOpacity(Number(e.target.value))}
          className="studio-range"
          aria-label="Stroke opacity"
        />
      </SliderRow>

      {/* Stroke color override */}
      <div>
        <p className="text-[11px] text-[var(--text-muted)] mb-1.5">Stroke color</p>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={custom.strokeOverride ?? '#ffffff'}
            onChange={(e) => setStrokeOverride(e.target.value)}
            className="w-9 h-9 rounded-md border-0 cursor-pointer bg-transparent"
            aria-label="Stroke color"
          />
          <span className="text-[11px] text-[var(--text-muted)] font-mono">{custom.strokeOverride ?? '#ffffff'}</span>
        </div>
      </div>

      {/* Dash pattern */}
      <div>
        <p className="text-[11px] text-[var(--text-muted)] mb-1.5">Dash pattern (e.g. "6 3" or "0.1 5")</p>
        <input
          type="text"
          value={custom.dashArray}
          onChange={(e) => setDash(e.target.value)}
          placeholder="solid (empty)"
          className="neu-input w-full px-3 py-2 text-[12px] font-mono"
          aria-label="Dash pattern"
        />
      </div>

      {/* Member count */}
      <div>
        <p className="text-[11px] text-[var(--text-muted)] mb-1.5">Members</p>
        <div className="flex gap-1.5">
          {MEMBER_COUNTS.map((n) => (
            <button
              key={n}
              onClick={() => setMemberCount(n)}
              className={`studio-tap flex-1 py-2 text-[11px] rounded-full ${custom.memberCount === n ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Mark */}
      <div>
        <p className="text-[11px] text-[var(--text-muted)] mb-1.5">Brand mark</p>
        <div className="flex flex-wrap gap-1.5">
          {CARD_MARKS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMark(m.id)}
              className={`studio-tap px-2.5 py-1 text-[11px] rounded-full ${custom.mark === m.id ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'}`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filter toggle */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-[var(--text-muted)]">Glow filter</p>
        <button
          onClick={toggleFilter}
          className={`studio-tap relative w-12 h-7 rounded-full transition-colors ${custom.filterEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--bg-dark)]'}`}
          role="switch"
          aria-checked={custom.filterEnabled}
          aria-label="Toggle glow filter"
        >
          <span
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${custom.filterEnabled ? 'translate-x-5' : ''}`}
          />
        </button>
      </div>
    </div>
  );
}

function SliderRow({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[11px] text-[var(--text-muted)]">{label}</p>
        <span className="text-[11px] text-[var(--text)] font-mono">{value}</span>
      </div>
      {children}
    </div>
  );
}
