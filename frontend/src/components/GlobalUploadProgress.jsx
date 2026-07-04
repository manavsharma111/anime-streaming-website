import React from 'react';
import { useUpload } from '../context/UploadContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function GlobalUploadProgress() {
  const { isUploading, uploadProgress, statusMessage } = useUpload();

  return (
    <AnimatePresence>
      {isUploading && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[9999] w-80 bg-[#110e16]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5 overflow-hidden cursor-grab active:cursor-grabbing"
        >
          {/* Background progress glow */}
          <div 
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />

          <div className="flex items-start gap-4">
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${statusMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : statusMessage.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={24} />
              ) : statusMessage.type === 'error' ? (
                <AlertTriangle size={24} />
              ) : uploadProgress === 100 ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <Upload size={24} className="animate-bounce" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white mb-1 truncate">
                {statusMessage.type === 'success' 
                  ? 'Upload Complete' 
                  : statusMessage.type === 'error' 
                  ? 'Upload Failed' 
                  : uploadProgress === 100
                  ? 'Processing Video...'
                  : 'Uploading File...'}
              </h4>
              <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                {statusMessage.text || "Please do not close the browser."}
              </p>

              {statusMessage.type !== 'success' && statusMessage.type !== 'error' && uploadProgress < 100 && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-indigo-400">{uploadProgress}%</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
