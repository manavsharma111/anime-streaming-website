import React, { useEffect, Suspense, lazy } from "react"
import { motion } from "framer-motion"

// Import above-the-fold sections synchronously for instant LCP
import CinematicHero from "./sections/CinematicHero"
import TrendingThisWeek from "./sections/TrendingThisWeek"

// Lazily load below-the-fold sections to prevent main thread blocking on mount
const PopularCategories = lazy(() => import("./sections/PopularCategories"))
const FeaturesBentoGrid = lazy(() => import("./sections/FeaturesBentoGrid"))
const FeaturedShowcase = lazy(() => import("./sections/FeaturedShowcase"))
const WatchAnywhere = lazy(() => import("./sections/WatchAnywhere"))
const CinematicTrailer = lazy(() => import("./sections/CinematicTrailer"))
const HoverRoster = lazy(() => import("./sections/HoverRoster"))
const StackedGenreCards = lazy(() => import("./sections/StackedGenreCards"))
const UserReviews = lazy(() => import("./sections/UserReviews"))
const FAQAccordion = lazy(() => import("./sections/FAQAccordion"))
const FreeCTA = lazy(() => import("./sections/FreeCTA"))
const EyesFollow = lazy(() => import("./sections/EyesFollow"))
const ModernFooter = lazy(() => import("./sections/ModernFooter"))

import { useJikanAnime } from "../../hooks/useJikan"
import SmoothScroll from "../../components/common/animation/SmoothScroll"

export default function LandingPage() {
  const { topAiring, loading } = useJikanAnime()

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }
    window.scrollTo(0, 0)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#050505] text-white min-h-screen selection:bg-red-500/30 overflow-x-hidden relative"
    >
      <SmoothScroll />
      {/* Global Noise Overlay */}
      <div
        className="fixed inset-0 w-full h-full opacity-[0.03] z-[9999] pointer-events-none"
        style={{
          backgroundImage:
            'url("https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png")',
        }}
      ></div>

      <CinematicHero />
      <TrendingThisWeek animeList={topAiring.slice(0, 5)} loading={loading} />
      
      <Suspense fallback={<div className="h-screen w-full bg-[#050505]" />}>
        <PopularCategories />
        <FeaturesBentoGrid />
        <FeaturedShowcase animeList={topAiring.slice(5, 8)} loading={loading} />
        <WatchAnywhere />

        <CinematicTrailer />
        <HoverRoster animeList={topAiring} loading={loading} />
        <StackedGenreCards />

        <UserReviews />
        <FAQAccordion />
        <FreeCTA />
        <EyesFollow />
        <ModernFooter />
      </Suspense>
    </motion.div>
  )
}
