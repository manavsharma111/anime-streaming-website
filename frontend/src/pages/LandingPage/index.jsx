import React from "react"
import { motion } from "framer-motion"

// Import all 10 Premium Sections
import CinematicHero from "./sections/CinematicHero"
import TrendingThisWeek from "./sections/TrendingThisWeek"
import PopularCategories from "./sections/PopularCategories"
import FeaturesBentoGrid from "./sections/FeaturesBentoGrid"
import FeaturedShowcase from "./sections/FeaturedShowcase"
import WatchAnywhere from "./sections/WatchAnywhere"
import CinematicTrailer from "./sections/CinematicTrailer"
import HoverRoster from "./sections/HoverRoster"
import StackedGenreCards from "./sections/StackedGenreCards"
import UserReviews from "./sections/UserReviews"
import FAQAccordion from "./sections/FAQAccordion"
import FreeCTA from "./sections/FreeCTA"
import EyesFollow from "./sections/EyesFollow"
import ModernFooter from "./sections/ModernFooter"
import { useJikanAnime } from "../../hooks/useJikan"
import SmoothScroll from "../../components/common/animation/SmoothScroll"

export default function LandingPage() {
  const { topAiring, loading } = useJikanAnime()

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
    </motion.div>
  )
}
