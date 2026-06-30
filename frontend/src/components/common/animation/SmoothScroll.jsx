import { useEffect } from "react"
import Lenis from "lenis"
import "lenis/dist/lenis.css"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const SmoothScroll = ({ children }) => {
  useEffect(() => {
    // GSAP Mobile Optimization: Prevents layout thrashing on address bar hide/show
    ScrollTrigger.config({ ignoreMobileResize: true })

    // Removing ScrollTrigger.normalizeScroll(true) as it often breaks native scroll wheel and causes jank on desktop

    const lenis = new Lenis({
      lerp: 0.05, // Adjusted for even smoother feel without being sluggish
      wheelMultiplier: 1, // Standard wheel speed
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1.5,
    })

    // Make lenis globally available to allow modals to pause it
    window.lenis = lenis

    // Synchronize Lenis scrolling with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update)

    // Use GSAP's ticker instead of default requestAnimationFrame
    // to ensure animations and scrolling run in the same paint frame
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000)
      })
    }
  }, [])

  return children
}

export default SmoothScroll
