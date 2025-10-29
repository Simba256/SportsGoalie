'use client';

import React, { useState } from 'react';
import { VideoControlsProps } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Play, Pause, Settings, Volume2, VolumeX } from 'lucide-react';

export const VideoControls: React.FC<VideoControlsProps> = ({
  playing,
  playbackRate,
  currentTime,
  duration,
  volume: externalVolume,
  muted: externalMuted,
  onPlayPause,
  onSeek,
  onPlaybackRateChange,
  onVolumeChange,
  onMuteToggle,
  disabled = false,
}) => {
  const [localVolume, setLocalVolume] = useState(1);
  const [localMuted, setLocalMuted] = useState(false);
  const [seeking, setSeeking] = useState(false);

  // Use external props if provided, otherwise use local state
  const volume = externalVolume !== undefined ? externalVolume : localVolume;
  const muted = externalMuted !== undefined ? externalMuted : localMuted;

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle progress bar seek
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    onSeek(seekTime);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    } else {
      setLocalVolume(newVolume);
    }
    // Auto-unmute if volume is raised
    if (newVolume > 0 && muted) {
      if (onMuteToggle) {
        onMuteToggle();
      } else {
        setLocalMuted(false);
      }
    }
  };

  // Handle mute toggle
  const handleMuteToggle = () => {
    if (onMuteToggle) {
      onMuteToggle();
    } else {
      setLocalMuted(!localMuted);
    }
  };

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="bg-gray-900 text-white">
      {/* Progress Bar */}
      <div className="relative w-full h-1 bg-gray-700 hover:h-2 transition-all group cursor-pointer">
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleProgressChange}
          onMouseDown={() => setSeeking(true)}
          onMouseUp={() => setSeeking(false)}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className="absolute top-0 left-0 h-full bg-primary transition-all"
          style={{ width: `${progressPercentage}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progressPercentage}%`, marginLeft: '-6px' }}
        />
      </div>

      {/* Controls Bar */}
      <div className="flex items-center gap-4 px-4 py-2">
        {/* Play/Pause Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onPlayPause}
          disabled={disabled}
          className="text-white hover:text-white hover:bg-white/20"
        >
          {playing ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        {/* Time Display */}
        <div className="text-sm font-medium min-w-[100px]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Playback Speed */}
        {onPlaybackRateChange ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={disabled}
                className="text-white hover:text-white hover:bg-white/20 text-xs font-medium min-w-[60px]"
              >
                {playbackRate}x
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              {playbackSpeeds.map((speed) => (
                <DropdownMenuItem
                  key={speed}
                  onClick={() => onPlaybackRateChange(speed)}
                  className={`cursor-pointer ${
                    playbackRate === speed ? 'bg-primary/10 font-semibold' : ''
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{speed}x</span>
                    {playbackRate === speed && (
                      <span className="text-primary">✓</span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="text-gray-500 hover:text-gray-400 text-xs font-medium min-w-[60px]"
            title="Speed control disabled for this quiz"
          >
            {playbackRate}x
          </Button>
        )}

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMuteToggle}
            disabled={disabled}
            className="text-white hover:text-white hover:bg-white/20"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            disabled={disabled}
            className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
        </div>

        {/* Settings (future features) */}
        <Button
          variant="ghost"
          size="icon"
          disabled
          className="text-gray-500 hover:text-gray-400"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
