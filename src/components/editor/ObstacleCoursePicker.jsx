import React from 'react';
import { Layers, Plus } from 'lucide-react';
import { OBSTACLE_COURSES } from '@/game/world/obstacleCourses';

// Editor tool: load a pre-built obstacle course into the world. Loading appends
// the course's parts and jump pads to what's already placed (via onLoad), so
// several courses can be combined. Nothing is saved until the user hits "Save World".
export default function ObstacleCoursePicker({ onLoad }) {
  return (
    <div className="rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10 p-8 space-y-5">
      <div className="flex items-center gap-2">
        <Layers className="w-5 h-5 text-sky-300" />
        <h2 className="text-lg font-bold text-white">Obstacle Courses</h2>
      </div>
      <p className="text-sm text-sky-100/50">
        Drop a pre-built parkour layout into your world. Courses stack — load several to combine them.
      </p>

      <div className="space-y-3">
        {OBSTACLE_COURSES.map((course) => (
          <div
            key={course.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/25 border border-white/10"
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white">{course.name}</div>
              <div className="text-xs text-sky-100/50 truncate">{course.description}</div>
            </div>
            <button
              onClick={() => onLoad(course)}
              className="ml-auto shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" /> Load
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
