import React from 'react';
import { formatTime } from './utils/formatTime';
import { cn } from './utils/cn';

export default function TimeDisplay({ currentTime, duration, className }) {
  return (
    <div className={cn("text-xs font-medium text-slate-300 tabular-nums select-none flex items-center gap-1", className)}>
      <span>{formatTime(currentTime)}</span>
      <span className="text-slate-500">/</span>
      <span className="text-slate-400">{formatTime(duration)}</span>
    </div>
  );
}
