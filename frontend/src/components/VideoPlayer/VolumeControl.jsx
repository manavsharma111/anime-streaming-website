import React from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { cn } from './utils/cn';

export default function VolumeControl({ volume, isMuted, onVolumeChange, onMuteToggle, className }) {
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX size={20} />;
    if (volume < 0.5) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  return (
    <div className={cn("flex items-center gap-2 group/volume relative", className)}>
      <button 
        onClick={onMuteToggle}
        className="text-white hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-white/10"
        aria-label="Mute"
      >
        {getVolumeIcon()}
      </button>
      
      <div className="w-0 overflow-hidden opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 transition-all duration-300 ease-out origin-left flex items-center">
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.05" 
          value={isMuted ? 0 : volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="volume-slider w-full h-1 cursor-pointer accent-blue-500"
          aria-label="Volume Slider"
        />
      </div>
    </div>
  );
}
