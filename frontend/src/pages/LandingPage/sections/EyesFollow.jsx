import React, { useEffect, useRef } from "react"
import gsap from "gsap"

const EyesFollow = () => {
  const leftEyeRef = useRef(null)
  const rightEyeRef = useRef(null)
  const leftPupilRef = useRef(null)
  const rightPupilRef = useRef(null)

  const leftHighlightRef = useRef(null)
  const rightHighlightRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e

      const moveEye = (eye, pupil, highlight) => {
        if (!eye || !pupil) return

        const rect = eye.getBoundingClientRect()
        const eyeX = rect.left + rect.width / 2
        const eyeY = rect.top + rect.height / 2

        const angle = Math.atan2(clientY - eyeY, clientX - eyeX)
        const maxDistance =
          rect.width / 2 - pupil.getBoundingClientRect().width / 2 - 10

        const distanceToMouse = Math.hypot(clientX - eyeX, clientY - eyeY)

        const mag = Math.min(maxDistance, distanceToMouse / 5)
        const x = Math.cos(angle) * mag
        const y = Math.sin(angle) * mag

        // Human eyes dart quickly to follow objects (saccadic movement)
        gsap.to(pupil, {
          x,
          y,
          duration: 0.15,
          ease: "power2.out",
        })

        if (highlight) {
          const maxDistance2 =
            pupil.getBoundingClientRect().width / 2 -
            highlight.getBoundingClientRect().width / 2 -
            2
          const ratio = mag / maxDistance
          const x2 = Math.cos(angle) * (ratio * maxDistance2)
          const y2 = Math.sin(angle) * (ratio * maxDistance2)

          gsap.to(highlight, {
            x: x2,
            y: y2,
            duration: 0.15,
            ease: "power2.out",
          })
        }
      }

      moveEye(
        leftEyeRef.current,
        leftPupilRef.current,
        leftHighlightRef.current,
      )
      moveEye(
        rightEyeRef.current,
        rightPupilRef.current,
        rightHighlightRef.current,
      )
    }

    const handleMouseLeave = () => {
      gsap.to([leftPupilRef.current, rightPupilRef.current], {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      })

      gsap.to([leftHighlightRef.current, rightHighlightRef.current], {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <section className="w-full py-32 bg-black flex flex-col items-center justify-center border-t border-white/5 relative overflow-hidden">
      <h2 className="text-3xl md:text-5xl font-serif text-[#FFFDD0] mb-20 text-center tracking-widest uppercase">
        Keep an eye
      </h2>
      <div className="flex gap-12 md:gap-24 relative z-10">
        {/* Left Eye */}
        <div
          ref={leftEyeRef}
          className="w-32 h-32 md:w-64 md:h-64 rounded-full bg-zinc-200 flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]"
        >
          <div
            ref={leftPupilRef}
            className="w-16 h-16 md:w-28 md:h-28 bg-black rounded-full relative flex items-center justify-center"
          >
            {/* Eye highlight */}
            <div
              ref={leftHighlightRef}
              className="w-4 h-4 md:w-6 md:h-6 bg-white rounded-full opacity-80 blur-[1px]"
            ></div>
          </div>
        </div>

        {/* Right Eye */}
        <div
          ref={rightEyeRef}
          className="w-32 h-32 md:w-64 md:h-64 rounded-full bg-zinc-200 flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]"
        >
          <div
            ref={rightPupilRef}
            className="w-16 h-16 md:w-28 md:h-28 bg-black rounded-full relative flex items-center justify-center"
          >
            {/* Eye highlight */}
            <div
              ref={rightHighlightRef}
              className="w-4 h-4 md:w-6 md:h-6 bg-white rounded-full opacity-80 blur-[1px]"
            ></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EyesFollow
