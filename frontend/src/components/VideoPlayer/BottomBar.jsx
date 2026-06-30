import React from 'react';
import { cn } from './utils/cn';
import PlayPauseButton from './PlayPauseButton';
import VolumeControl from './VolumeControl';
import TimeDisplay from './TimeDisplay';
import FullscreenButton from './FullscreenButton';
import PictureInPictureButton from './PictureInPictureButton';
import SettingsMenu from './SettingsMenu';
import SeekBar from './SeekBar';

export default function BottomBar({
  showControls,
  isPlaying, togglePlay,
  isMuted, toggleMute,
  volume, changeVolume,
  currentTime, duration, buffered, onSeek,
  isFullscreen, toggleFullscreen,
  videoRef,
  settingsProps // object containing qualities, audio, speed states and handlers
}) {
  return (
    <div 
      className={cn(
        "absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 pb-4 px-6 flex flex-col gap-3 z-30 transition-opacity duration-300 pointer-events-auto",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <SeekBar 
        duration={duration} 
        currentTime={currentTime} 
        buffered={buffered} 
        onSeek={onSeek} 
      />

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-6">
          <PlayPauseButton isPlaying={isPlaying} onClick={togglePlay} />
          
          <VolumeControl 
            volume={volume} 
            isMuted={isMuted} 
            onVolumeChange={changeVolume} 
            onMuteToggle={toggleMute} 
          />

          <TimeDisplay currentTime={currentTime} duration={duration} />
        </div>

        <div className="flex items-center gap-4">
          <SettingsMenu {...settingsProps} />
          <PictureInPictureButton videoRef={videoRef} />
          <FullscreenButton isFullscreen={isFullscreen} onClick={toggleFullscreen} />
        </div>
      </div>
    </div>
  );
}
