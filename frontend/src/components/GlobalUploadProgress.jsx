import React from "react"
import { useUpload } from "../context/UploadContext"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"

export default function GlobalUploadProgress() {
  const { isUploading, uploadProgress, statusMessage } = useUpload()

  return (
    <AnimatePresence>
      {isUploading && (
        <motion.div
          drag
          dragMomentum={false}
          dragConstraints={{ left: -3000, right: 50, top: -2000, bottom: 50 }}
          dragElastic={0.1}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] w-[calc(100vw-32px)] md:w-80 bg-[#110e16]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 md:p-5 overflow-hidden cursor-grab active:cursor-grabbing touch-none"
        >
          {/* Background progress glow */}
          <div
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />

          <div className="flex items-start gap-4">
            <div
              className={`p-2.5 rounded-xl flex-shrink-0 ${statusMessage.type === "success" ? "bg-emerald-500/10 text-emerald-500" : statusMessage.type === "error" ? "bg-red-500/10 text-red-500" : "bg-indigo-500/10 text-indigo-500"}`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 size={24} />
              ) : statusMessage.type === "error" ? (
                <AlertTriangle size={24} />
              ) : uploadProgress === 100 ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <Upload size={24} className="animate-bounce" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white mb-1 truncate">
                {statusMessage.type === "success"
                  ? "Upload Complete"
                  : statusMessage.type === "error"
                    ? "Upload Failed"
                    : uploadProgress === 100
                      ? "Processing Video..."
                      : "Uploading File..."}
              </h4>
              <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                {statusMessage.text || "Please do not close the browser."}
              </p>

              {statusMessage.type !== "success" &&
                statusMessage.type !== "error" &&
                uploadProgress < 100 && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-indigo-400">
                      {uploadProgress}%
                    </span>
                  </div>
                )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
