import React, { useState, useRef, useEffect } from "react"
import { ChevronDown, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
  className,
  containerClassName,
  searchable = false,
  onSearch,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) setSearchTerm("")
  }, [isOpen])

  const selectedOption = options.find((opt) => opt.value === value)
  const filteredOptions = searchable
    ? options.filter((opt) =>
        (opt.label || "")
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      )
    : options

  return (
    <div className={`relative ${containerClassName || ""}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between outline-none ${className || ""}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 text-neutral-500 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-[#1a1721] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            data-lenis-prevent="true"
          >
            {searchable && (
              <div className="sticky top-0 z-10 bg-[#1a1721] p-2 border-b border-white/5">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                  />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      if (onSearch) onSearch(e.target.value)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-[#110e16] border border-white/5 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#f33767]/50"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {filteredOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/5 ${
                  value === opt.value
                    ? "bg-[#f33767]/10 text-[#f33767] font-bold border-l-2 border-[#f33767]"
                    : "text-neutral-300 border-l-2 border-transparent"
                }`}
              >
                {opt.label}
              </button>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-4 py-3 text-sm text-neutral-500 text-center">
                No options found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
