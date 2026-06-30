/**
 * Formats seconds into MM:SS or HH:MM:SS format
 * @param {number} seconds 
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };
