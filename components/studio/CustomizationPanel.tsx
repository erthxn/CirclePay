'use client';

import { useCallback } from 'react';
import { useStudioSelector, useDispatch } from './useStudioState';
import { MARKS, MEMBER_COUNTS, type Mark, type MemberCount } from '@/lib/studio/types';

export default function CustomizationPanel() {
  const custom = useStudioSelector((s) => s.customization);
  const dispatch = useDispatch();
  const setStopColor = useCallback((i: number, color: string) => dispatch({ type: 'SET_GRADIENT_STOP', index: i, color }), [dispatch]);
  const addStop = useCallback(() => dispatch({ type: 'ADD_GRADIENT_STOP' }), [dispatch]);
  const removeStop = useCallback((i: number) => dispatch({ type: 'REMOVE_GRADIENT_STOP', index: i }), [dispatch]);
  const setAngle = useCallback((a: number) => dispatch({ type: 'SET_GRADIENT_ANGLE', angle: a }), [dispatch]);
  const setStrokeWidth = useCallback((w: number) => dispatch({ type: 'SET_STROKE_WIDTH', width: w }), [dispatch]);
  const setStrokeOpacity = useCallback((o: number) => dispatch({ type: 'SET_STROKE_OPACITY', opacity: o }), [dispatch]);
  const setDash = useCallback((d: string) => dispatch({ type: 'SET_DASH_ARRAY', dash: d }), [dispatch]);
  const setMark = useCallback((m: Mark) => dispatch({ type: 'SET_MARK', mark: m }), [dispatch]);
  const setMemberCount = useCallback((c: MemberCount) => dispatch({ type: 'SET_MEMBER_COUNT', count: c }), [dispatch]);
  const toggleFilter = useCallback(() => dispatch({ type: 'TOGGLE_FILTER' }), [dispatch]);
  const setStrokeOverride = useCallback((c: string) => dispatch({ type: 'SET_STROKE_OVERRIDE', color: c }), [dispatch]);
  const reset = useCallback(() => dispatch({ type: 'RESET_CUSTOMIZATION' }), [dispatch]);

  return (
    <div className="flex flex-col gap-3 p-3 neu-raised rounded-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[var(--text)]">Customize</h3>
        <button onClick={reset} className="text-[10px] text-[var(--accent)]">Reset</button>
      </div>

      {/* Gradient stops */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] text-[var(--text-muted)]">Gradient stops</p>
          <button onClick={addStop} className="text-[10px] text-[var(--accent)]">+ Add</button>
        </div>
        <div className="flex flex-col gap-1">
          {custom.gradientStops.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input type="color" value={s.color} onChange={(e) => setStopColor(i, e.target.value)} className="w-7 h-7 rounded cursor-pointer bg-transparent" aria-label={`Stop ${i+1} color`} />
              <span className="text-[10px] text-[var(--text-muted)] font-mono flex-1">{s.color}</span>
              <span className="text-[10px] text-[var(--text-muted)] w-8 text-right">{Math.round(s.offset)}%</span>
              {custom.gradientStops.length > 2 && (
                <button onClick={() => removeStop(i)} className="text-[10px] text-red-500 w-5 h-5 rounded-full">×</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <SliderRow label="Angle" value={`${Math.round(custom.gradientAngle)}°`}>
        <input type="range" min={0} max={360} value={custom.gradientAngle} onChange={(e) => setAngle(Number(e.target.value))} className="studio-range" />
      </SliderRow>

      <SliderRow label="Stroke width" value={custom.strokeWidth.toFixed(2)}>
        <input type="range" min={0.2} max={4} step={0.1} value={custom.strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} className="studio-range" />
      </SliderRow>

      <SliderRow label="Stroke opacity" value={`${Math.round(custom.strokeOpacity * 100)}%`}>
        <input type="range" min={0} max={1} step={0.05} value={custom.strokeOpacity} onChange={(e) => setStrokeOpacity(Number(e.target.value))} className="studio-range" />
      </SliderRow>

      <div>
        <p className="text-[10px] text-[var(--text-muted)] mb-1">Stroke color</p>
        <div className="flex items-center gap-1.5">
          <input type="color" value={custom.strokeOverride ?? '#ffffff'} onChange={(e) => setStrokeOverride(e.target.value)} className="w-7 h-7 rounded cursor-pointer bg-transparent" />
          <span className="text-[10px] text-[var(--text-muted)] font-mono">{custom.strokeOverride ?? '#ffffff'}</span>
        </div>
      </div>

      <div>
        <p className="text-[10px] text-[var(--text-muted)] mb-1">Dash pattern</p>
        <input type="text" value={custom.dashArray} onChange={(e) => setDash(e.target.value)} placeholder="solid (empty)" className="neu-input w-full px-2 py-1.5 text-[11px] font-mono" />
      </div>

      <div>
        <p className="text-[10px] text-[var(--text-muted)] mb-1">Members</p>
        <div className="flex gap-1">
          {MEMBER_COUNTS.map((n) => (
            <button key={n} onClick={() => setMemberCount(n)} className={`studio-tap flex-1 py-1.5 text-[10px] rounded-full ${custom.memberCount === n ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'}`}>{n}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] text-[var(--text-muted)] mb-1">Mark</p>
        <div className="flex flex-wrap gap-1">
          {MARKS.map((m) => (
            <button key={m.id} onClick={() => setMark(m.id)} className={`studio-tap px-2 py-1 text-[10px] rounded-full ${custom.mark === m.id ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'}`}>{m.name}</button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-[var(--text-muted)]">Glow filter</p>
        <button onClick={toggleFilter} className={`studio-tap relative w-10 h-6 rounded-full transition-colors ${custom.filterEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--bg-dark)]'}`} role="switch" aria-checked={custom.filterEnabled}>
          <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${custom.filterEnabled ? 'translate-x-4' : ''}`} />
        </button>
      </div>
    </div>
  );
}

function SliderRow({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
        <span className="text-[10px] text-[var(--text)] font-mono">{value}</span>
      </div>
      {children}
    </div>
  );
}
