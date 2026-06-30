import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function TopBar({ title, onBack }) {
  return (
    <div className="absolute top-0 inset-x-0 p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center gap-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-auto">
      <button 
        onClick={onBack}
        className="text-white hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-white/10 active:scale-95"
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="text-white font-bold text-lg drop-shadow-md line-clamp-1">{title || "Untitled Video"}</h1>
    </div>
  );
}
