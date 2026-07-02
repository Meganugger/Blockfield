import React from 'react';
import { Zap, Check, Loader2 } from 'lucide-react';
import { OBSTACLE_COURSES } from '@/game/world/obstacleCourses';

// Editor quick-load menu: one click swaps the baseplate layout to a saved
// obstacle course preset and persists it immediately -- no separate save step.
export default function QuickLoadMenu({ onApply, applyingId, appliedId }) {
  return (
    <div className="rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10 p-8 space-y-5">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-amber-300" />
        <h2 className="text-lg font-bold text-white">Quick Load</h2>
      </div>
      <p className="text-sm text-sky-100/50">
        Instantly swap the baseplate to a preset layout. Applying replaces current parts and jump pads and saves right away.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {OBSTACLE_COURSES.map((course) => {
          const applying = applyingId === course.id;
          const applied = appliedId === course.id;
          return (
            <button
              key={course.id}
              onClick={() => onApply(course)}
              disabled={!!applyingId}
              className={`flex flex-col items-start gap-1 px-4 py-3 rounded-xl border text-left transition-colors disabled:opacity-60 ${
                applied
                  ? 'bg-emerald-400/15 border-emerald-300/40'
                  : 'bg-black/25 border-white/10 hover:bg-white/10 hover:border-white/25'
              }`}
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
                {applying ? (
                  <Loader2 className="w-4 h-4 animate-spin text-sky-300" />
                ) : applied ? (
                  <Check className="w-4 h-4 text-emerald-300" />
                ) : (
                  <Zap className="w-4 h-4 text-amber-300" />
                )}
                {course.name}
              </span>
              <span className="text-xs text-sky-100/50">
                {applying ? 'Applying…' : applied ? 'Applied to baseplate' : course.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
