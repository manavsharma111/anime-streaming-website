import React from "react"
import { Twitter, Instagram, Youtube, Github } from "lucide-react"

export default function ModernFooter() {
  return (
    <footer className="bg-[#020202] pt-24 pb-12 px-6 md:px-12 border-t border-white/10 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-black text-white mb-6 tracking-tight">
              ANIME STREAM.
            </h3>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              The ultimate destination for streaming the world's best anime in
              ultra-high definition, 100% free.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Youtube size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Github size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-neutral-500 hover:text-white transition-colors text-sm"
                >
                  Browse Catalog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-neutral-500 hover:text-white transition-colors text-sm"
                >
                  Simulcasts
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-neutral-500 hover:text-white transition-colors text-sm"
                >
                  Top Airing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-neutral-500 hover:text-white transition-colors text-sm"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-neutral-500 hover:text-white transition-colors text-sm"
                >
                  Community Guidelines
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-neutral-500 hover:text-white transition-colors text-sm"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-neutral-500 hover:text-white transition-colors text-sm"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-neutral-500 hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-neutral-500 hover:text-white transition-colors text-sm"
                >
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-neutral-500 hover:text-white transition-colors text-sm"
                >
                  Copyright Guidelines
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-600 text-sm">
            © {new Date().getFullYear()} Anime Stream. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-bold text-neutral-500">
            <span>ENGLISH (US)</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
