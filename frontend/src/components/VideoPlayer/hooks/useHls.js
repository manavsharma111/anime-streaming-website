import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export const useHls = (streamUrl, videoRef) => {
  const [qualities, setQualities] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const [subtitleTracks, setSubtitleTracks] = useState([]);
  
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [currentAudio, setCurrentAudio] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState(-1); // -1 means disabled
  
  const hlsRef = useRef(null);

  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;

    // Clean up previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
      const hls = new Hls({
        maxBufferLength: 30,
        capLevelToPlayerSize: true,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Fetch and deduplicate qualities by height, keeping the highest bitrate for each height
        const uniqueLevels = {};
        hls.levels.forEach((level, index) => {
          if (level.height) {
            if (!uniqueLevels[level.height] || uniqueLevels[level.height].bitrate < level.bitrate) {
              uniqueLevels[level.height] = { ...level, originalIndex: index };
            }
          }
        });

        // Convert back to array, sort descending (1080p -> 720p -> etc)
        const levels = Object.values(uniqueLevels)
          .sort((a, b) => b.height - a.height)
          .map((level) => ({
            id: level.originalIndex, // MUST use original index to tell HLS which level to switch to
            name: `${level.height}p`,
          }));

        setQualities([{ id: -1, name: "Auto" }, ...levels]);
        
        // Fetch audio tracks
        const audios = hls.audioTracks || [];
        console.log("Audio Tracks parsed:", audios);
        setAudioTracks(audios);

        // Fetch subtitle tracks
        const subs = hls.subtitleTracks || [];
        console.log("Subtitle Tracks parsed:", subs);
        setSubtitleTracks([{ id: -1, name: "Off" }, ...subs]);
      });

      // Fetch Audio Tracks when they are updated
      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (event, data) => {
        console.log("Audio Tracks Updated:", data.audioTracks);
        setAudioTracks(data.audioTracks || []);
      });

      // Fetch Subtitle Tracks when they are updated
      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (event, data) => {
        console.log("Subtitle Tracks Updated:", data.subtitleTracks);
        setSubtitleTracks([{ id: -1, name: "Off" }, ...(data.subtitleTracks || [])]);
      });

      // Track quality changes
      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentQuality(hls.autoLevelEnabled ? -1 : data.level);
      });

      // Track audio changes
      hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (event, data) => {
        setCurrentAudio(data.id);
      });

      // Track subtitle changes
      hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (event, data) => {
        setCurrentSubtitle(data.id);
      });

      // Handle Errors
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad(); // Try to recover
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } 
    // Fallback for native Safari HLS OR direct video files (MP4/MKV)
    else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl") || !streamUrl.includes('.m3u8')) {
      videoRef.current.src = streamUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, videoRef]);

  const changeQuality = (levelId) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
      setCurrentQuality(levelId);
    }
  };

  const changeAudioTrack = (trackId) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = trackId;
      setCurrentAudio(trackId);
    }
  };

  const changeSubtitleTrack = (trackId) => {
    if (hlsRef.current) {
      hlsRef.current.subtitleTrack = trackId;
      setCurrentSubtitle(trackId);
    }
  };

  return { 
    qualities, 
    audioTracks, 
    subtitleTracks,
    currentQuality, 
    currentAudio, 
    currentSubtitle,
    changeQuality, 
    changeAudioTrack,
    changeSubtitleTrack
  };
};
