"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Globe,
  MapPin,
  Calendar,
  Wallet,
  ChevronDown,
  Camera,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";
import { ReactLenis } from "lenis/react"; // Import ReactLenis for smooth scrolling
import { debounce } from "lodash"; // Import debounce to optimize scroll events

// Star animations styles component with reduced complexity
const StarAnimationStyles = () => (
  <style jsx global>{`
    @keyframes twinkle {
      0%,
      100% {
        opacity: 0.2;
      }
      50% {
        opacity: 1;
      }
    }

    .stars-sm {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: radial-gradient(1px 1px at 10% 20%, white, transparent),
        radial-gradient(1px 1px at 40% 10%, white, transparent),
        radial-gradient(1px 1px at 70% 40%, white, transparent),
        radial-gradient(1px 1px at 90% 60%, white, transparent);
      background-size: 1000px 1000px;
      animation: twinkle 8s ease-in-out infinite alternate;
      will-change: opacity;
    }

    .stars-md {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: radial-gradient(
          1.5px 1.5px at 15% 15%,
          white,
          transparent
        ),
        radial-gradient(1.5px 1.5px at 45% 15%, white, transparent),
        radial-gradient(1.5px 1.5px at 75% 45%, white, transparent);
      background-size: 1000px 1000px;
      animation: twinkle 12s ease-in-out infinite alternate;
      will-change: opacity;
    }

    .stars-lg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: radial-gradient(2px 2px at 5% 25%, white, transparent),
        radial-gradient(2px 2px at 35% 5%, white, transparent),
        radial-gradient(2px 2px at 65% 35%, white, transparent);
      background-size: 1000px 1000px;
      animation: twinkle 15s ease-in-out infinite alternate;
      will-change: opacity;
    }

    .sticky-section {
      transform: translateZ(0); /* Hardware acceleration */
      will-change: transform; /* Hint to browser */
      backface-visibility: hidden; /* Another performance hint */
    }
  `}</style>
);

// Main component
const TripView = ({ trips }) => {
  const safeTrips = trips || [];
  const [activeSection, setActiveSection] = useState(0);
  const totalSections = safeTrips.length + 2; // Header, trips, and footer
  const sectionRefs = useRef([]);
  const prefersReducedMotion = useReducedMotion();
  const isScrolling = useRef(false);

  // Initialize refs array for all sections
  useEffect(() => {
    // Create references for header, all trips, and footer
    sectionRefs.current = Array(totalSections)
      .fill()
      .map(() => React.createRef());
  }, [totalSections]);

  // Debounced function to update the active section
  const updateActiveSection = useCallback(
    debounce((sectionIndex) => {
      setActiveSection(sectionIndex);
    }, 100),
    []
  );

  // Set up intersection observer with optimized options
  useEffect(() => {
    if (typeof window === "undefined" || !sectionRefs.current.length) return;

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: [0.25, 0.55, 0.75], // Multiple thresholds for smoother transitions
    };

    const observerCallback = (entries) => {
      if (isScrolling.current) return; // Skip updates while programmatic scrolling

      // Find the most visible section
      let maxVisibility = 0;
      let mostVisibleSection = activeSection;

      entries.forEach((entry) => {
        const sectionIndex = Number(entry.target.dataset.sectionIndex);

        if (entry.isIntersecting && entry.intersectionRatio > maxVisibility) {
          maxVisibility = entry.intersectionRatio;
          mostVisibleSection = sectionIndex;
        }
      });

      if (mostVisibleSection !== activeSection && maxVisibility > 0) {
        updateActiveSection(mostVisibleSection);
      }
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    // Observe all section elements
    sectionRefs.current.forEach((ref, index) => {
      if (ref.current) {
        ref.current.dataset.sectionIndex = index;
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
      updateActiveSection.cancel();
    };
  }, [updateActiveSection, activeSection]);

  // Function to scroll to a specific section
  const scrollToSection = (index) => {
    if (sectionRefs.current[index]?.current) {
      isScrolling.current = true; // Flag to prevent observer updates during programmatic scrolling

      sectionRefs.current[index].current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Set active section immediately for UI feedback
      setActiveSection(index);

      // Reset flag after animation completes
      setTimeout(() => {
        isScrolling.current = false;
      }, 1000);
    }
  };

  // Configure Lenis for better performance
  const lenisOptions = {
    smoothWheel: true,
    smoothTouch: false, // Disable on touch devices for better performance
    syncTouch: true,
    syncTouchLerp: 0.1, // Lower value for smoother performance
    touchInertiaMultiplier: 20,
    wheelMultiplier: 0.8, // Reduce multiplier for smoother scrolling
    lerp: 0.08, // Lower value for smoother performance
    duration: 1.2,
  };

  return (
    <ReactLenis root options={lenisOptions}>
      <div className="bg-[#030014]">
        {/* Header Section */}
        <HeaderSection
          ref={(el) => (sectionRefs.current[0] = { current: el })}
          onScrollDown={() => scrollToSection(1)}
          isActive={activeSection === 0}
          reducedMotion={prefersReducedMotion}
        />

        {/* Trip Sections */}
        {safeTrips.map((trip, index) => (
          <TripSection
            key={trip.id || trip._id || index}
            ref={(el) => (sectionRefs.current[index + 1] = { current: el })}
            trip={trip}
            index={index}
            isActive={activeSection === index + 1}
            totalTrips={safeTrips.length}
            onNextSection={() => scrollToSection(index + 2)}
            onPrevSection={() => scrollToSection(index)}
            reducedMotion={prefersReducedMotion}
          />
        ))}

        {/* Footer Section */}
        <FooterSection
          ref={(el) =>
            (sectionRefs.current[totalSections - 1] = { current: el })
          }
          isActive={activeSection === totalSections - 1}
          reducedMotion={prefersReducedMotion}
        />

        {/* Enhanced Navigation dots */}
        <Navigation
          totalSections={totalSections}
          activeSection={activeSection}
          onNavigate={scrollToSection}
        />
      </div>
    </ReactLenis>
  );
};

// Optimized Navigation dots component
const Navigation = ({ totalSections, activeSection, onNavigate }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.5, duration: 0.3 }}
    className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 p-3 bg-black/20 backdrop-blur-md rounded-full"
  >
    {Array.from({ length: totalSections }).map((_, index) => (
      <button
        key={index}
        onClick={() => onNavigate(index)}
        className={`w-3 h-3 rounded-full transition-all duration-200 ${
          activeSection === index
            ? "bg-gradient-to-r from-pink-500 to-violet-500 scale-125 shadow-lg shadow-pink-500/20"
            : "bg-white/30 hover:bg-white/70"
        }`}
        aria-label={`Navigate to section ${index + 1}`}
      />
    ))}
  </motion.div>
);

// Optimized Header section
const HeaderSection = React.forwardRef(
  ({ onScrollDown, isActive, reducedMotion }, ref) => {
    return (
      <section
        ref={ref}
        className="h-screen w-full flex flex-col items-center justify-center 
                text-white relative sticky top-0 z-10 overflow-hidden sticky-section"
      >
        {/* Enhanced gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0a29] via-[#0a0a24] to-[#030014]"></div>

        {/* Star field effect - conditionally rendered for performance */}
        {isActive && !reducedMotion && (
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <div className="stars-sm"></div>
            <div className="stars-md"></div>
            <div className="stars-lg"></div>
          </div>
        )}

        {/* Grid background - simplified */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] 
                 bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"
        ></div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mb-6 inline-block"
          >
            <span
              className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-violet-500 
                      font-medium tracking-wider text-lg px-4 py-2 rounded-full border border-pink-500/20 shadow-xl shadow-purple-900/20"
            >
              YOUR JOURNEY AWAITS
            </span>
          </motion.div>

          <motion.h1
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 
                   tracking-tighter leading-[1.1] bg-clip-text text-transparent 
                   bg-gradient-to-r from-white via-blue-100 to-gray-300 drop-shadow-[0_2px_2px_rgba(10,10,50,0.5)]"
          >
            Travel Adventures
            <br />
            <span className="text-3xl md:text-4xl lg:text-5xl opacity-90 font-medium">
              Relive Your Memories
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="max-w-md mx-auto text-lg text-blue-100/90 drop-shadow-md"
          >
            Scroll to explore your journey through time and place
          </motion.p>

          {/* Enhanced scroll indicator */}
          {!reducedMotion && (
            <motion.button
              onClick={onScrollDown}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                y: [0, 10, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: 0.6,
              }}
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer 
                      bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-all duration-300
                      border border-white/10 shadow-lg shadow-purple-900/20"
              aria-label="Scroll down"
            >
              <ChevronDown className="w-6 h-6 text-purple-300" />
            </motion.button>
          )}

          {/* Reduced decorative elements */}
          <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full bg-pink-600/10 blur-3xl"></div>
          <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full bg-blue-600/10 blur-3xl"></div>
        </div>
      </section>
    );
  }
);

HeaderSection.displayName = "HeaderSection";

// Optimized Trip section
const TripSection = React.forwardRef(
  (
    {
      trip,
      index,
      isActive,
      totalTrips,
      onNextSection,
      onPrevSection,
      reducedMotion,
    },
    ref
  ) => {
    // Fallback image for missing trip images
    const defaultImage =
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800";
    const tripImage = trip.images?.[0] || defaultImage;

    // Enhanced visual variety based on index
    const isEven = index % 2 === 0;
    const colors = [
      {
        bg: "from-indigo-950 via-purple-900 to-indigo-950",
        accent: "purple",
        destination: "text-violet-400",
      },
      {
        bg: "from-blue-950 via-cyan-900 to-blue-950",
        accent: "blue",
        destination: "text-cyan-400",
      },
      {
        bg: "from-emerald-950 via-teal-900 to-emerald-950",
        accent: "green",
        destination: "text-emerald-400",
      },
      {
        bg: "from-amber-950 via-orange-900 to-amber-950",
        accent: "orange",
        destination: "text-amber-400",
      },
    ];

    const themeColor = colors[index % colors.length];
    const gradientBg = themeColor.bg;
    const accentColor = themeColor.accent;
    const destinationColor = themeColor.destination;

    // Derive button styling based on accent color
    const buttonGlow = {
      purple: "shadow-purple-900/30",
      blue: "shadow-blue-900/30",
      green: "shadow-emerald-900/30",
      orange: "shadow-orange-900/30",
    }[accentColor];

    return (
      <section
        ref={ref}
        className={`h-screen w-full relative flex items-center sticky top-0 z-20 sticky-section
                   ${index === 0 ? "rounded-tr-2xl rounded-tl-2xl" : ""}`}
      >
        {/* Enhanced background with accent color */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${gradientBg}`}
        ></div>

        {/* Simplified background effects */}
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 bg-white"></div>

        {/* Simplified grid pattern */}
        {isActive && (
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] 
                      bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"
          ></div>
        )}

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

        {/* Main content - Always render but with animations controlled by isActive */}
        <div className="container mx-auto relative z-10 px-4 md:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8 md:gap-12">
            {/* Trip details */}
            <div
              className={`md:w-[45%] ${isEven ? "md:order-1" : "md:order-2"}`}
            >
              <motion.div
                className="space-y-6"
                initial={{
                  opacity: reducedMotion ? 0.8 : 0,
                  x: reducedMotion ? 0 : isEven ? -30 : 30,
                }}
                animate={{
                  opacity: isActive ? 1 : 0.6,
                  x: isActive || reducedMotion ? 0 : isEven ? -10 : 10,
                }}
                transition={{ duration: reducedMotion ? 0.2 : 0.4 }}
              >
                <div>
                  <div
                    className={`inline-block text-sm font-medium tracking-wider ${destinationColor} 
                                   px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10`}
                  >
                    <div className="flex items-center gap-2">
                      <Camera size={14} />
                      <span>
                        DESTINATION {index + 1} OF {totalTrips}
                      </span>
                    </div>
                  </div>

                  <h2
                    className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mt-3 
                          bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 drop-shadow-sm"
                  >
                    {trip.tripName}
                  </h2>

                  <p className="text-xl text-gray-300 mt-2 flex items-center gap-2">
                    <MapPin
                      className={`w-5 h-5 ${destinationColor}`}
                      strokeWidth={2}
                    />
                    {trip.destination}
                  </p>
                </div>

                <TripDetails
                  trip={trip}
                  accentColor={accentColor}
                  reducedMotion={reducedMotion}
                />

                {/* Enhanced Call-to-action */}
                <div className="flex flex-wrap gap-4 mt-4">
                  <a
                    href={`/user-dashboard/trips/${trip.id || trip._id}`}
                    className={`px-5 py-3 rounded-lg bg-gradient-to-r 
                              from-white/90 to-white/80 text-[#030014] font-medium 
                              hover:from-white hover:to-white/90 transition-all duration-300
                              flex items-center gap-2 shadow-lg ${buttonGlow}`}
                  >
                    <Globe className="w-4 h-4" />
                    View Trip Details
                  </a>

                  <div className="flex gap-3">
                    {index > 0 && (
                      <button
                        onClick={onPrevSection}
                        className={`px-5 py-3 rounded-lg bg-white/10 backdrop-blur-sm
                                  font-medium hover:bg-white/20 transition-all duration-300
                                  border border-white/10 shadow-lg shadow-black/20 text-white
                                  flex items-center gap-2`}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                      </button>
                    )}

                    {index < totalTrips - 1 && (
                      <button
                        onClick={onNextSection}
                        className={`px-5 py-3 rounded-lg bg-white/10 backdrop-blur-sm
                                  font-medium hover:bg-white/20 transition-all duration-300 
                                  border border-white/10 shadow-lg shadow-black/20 text-white
                                  flex items-center gap-2`}
                      >
                        Next Trip
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Enhanced trip image - optimized */}
            <motion.div
              initial={{
                opacity: reducedMotion ? 0.8 : 0,
                scale: reducedMotion ? 0.95 : 0.9,
              }}
              animate={{
                opacity: isActive ? 1 : 0.7,
                scale: isActive ? 1 : 0.95,
              }}
              transition={{ duration: reducedMotion ? 0.2 : 0.4 }}
              className={`md:w-[55%] ${isEven ? "md:order-2" : "md:order-1"}`}
            >
              <div
                className={`relative h-[300px] md:h-[400px] lg:h-[500px] w-full rounded-2xl overflow-hidden 
                           shadow-2xl shadow-black/50 border border-white/10
                           ${isEven ? "rotate-1" : "-rotate-1"}`}
              >
                {/* Image container with optimizations */}
                <div className="absolute inset-0">
                  <div className="h-full w-full">
                    {/* Using a div with background-image */}
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${tripImage})` }}
                    />
                  </div>

                  {/* Simplified overlay gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>

                  {/* Photo credit badge */}
                  <div
                    className="absolute bottom-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-md 
                                 text-white/70 text-xs flex items-center gap-1.5 border border-white/10"
                  >
                    <Camera size={12} />
                    <span>Travel Photo</span>
                  </div>
                </div>
              </div>

              {/* Simplified decorative elements */}
              {isActive && (
                <>
                  <div
                    className={`absolute ${
                      isEven ? "-right-5 -bottom-5" : "-left-5 -bottom-5"
                    } w-20 h-20 
                                border-r-2 border-b-2 border-white/20 rounded-br-xl -z-10`}
                  ></div>
                  <div
                    className={`absolute ${
                      isEven ? "-left-5 -top-5" : "-right-5 -top-5"
                    } w-20 h-20  
                                border-l-2 border-t-2 border-white/20 rounded-tl-xl -z-10`}
                  ></div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    );
  }
);

TripSection.displayName = "TripSection";

// Optimized Trip details component
const TripDetails = ({ trip, accentColor, reducedMotion }) => {
  const { startDate, endDate, totalExpenses, expenses } = trip;

  // Icon colors based on accent theme
  const iconColors = {
    purple: {
      date: "bg-fuchsia-500/20 text-fuchsia-400",
      budget: "bg-purple-500/20 text-purple-400",
    },
    blue: {
      date: "bg-cyan-500/20 text-cyan-400",
      budget: "bg-sky-500/20 text-sky-400",
    },
    green: {
      date: "bg-emerald-500/20 text-emerald-400",
      budget: "bg-teal-500/20 text-teal-400",
    },
    orange: {
      date: "bg-amber-500/20 text-amber-400",
      budget: "bg-yellow-500/20 text-yellow-400",
    },
  }[accentColor];

  // Tag background based on accent
  const tagBg = {
    purple: "bg-purple-500/10 border-purple-500/30 text-purple-300",
    blue: "bg-blue-500/10 border-blue-500/30 text-blue-300",
    green: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    orange: "bg-orange-500/10 border-orange-500/30 text-orange-300",
  }[accentColor];

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/10">
      <div className="space-y-5">
        {/* Date Range */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full ${iconColors.date} flex items-center justify-center`}
          >
            <Calendar className="w-5 h-5" strokeWidth={2} />
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">
              Trip Dates
            </div>
            <span className="text-gray-200 font-medium">
              {formatDate(startDate)} — {formatDate(endDate)}
            </span>
          </div>
        </div>

        {/* Budget */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full ${iconColors.budget} flex items-center justify-center`}
          >
            <Wallet className="w-5 h-5" strokeWidth={2} />
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">
              Total Budget
            </div>
            <span className="text-gray-100 font-semibold text-lg">
              ${totalExpenses?.toLocaleString() || "N/A"}
            </span>
          </div>
        </div>

        {/* Expenses Breakdown */}
        {expenses && Object.keys(expenses).length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 rounded bg-white/40"></span>
              EXPENSES BREAKDOWN
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(expenses)
                .slice(0, 6)
                .map(([category, amount]) => (
                  <div
                    key={category}
                    className={`px-3 py-1.5 rounded-full ${tagBg} text-sm border`}
                  >
                    {category}:{" "}
                    <span className="font-semibold">
                      ${Number(amount)?.toLocaleString() || amount}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Optimized Footer section
const FooterSection = React.forwardRef(({ isActive, reducedMotion }, ref) => (
  <section
    ref={ref}
    className="h-screen w-full flex flex-col items-center justify-center 
               bg-gradient-to-t from-[#0f0a29] via-[#0a0a24] to-[#030014] relative overflow-hidden
               sticky top-0 z-30 sticky-section"
  >
    {/* Simplified background effects */}
    {isActive && !reducedMotion && (
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="stars-sm"></div>
        <div className="stars-md"></div>
      </div>
    )}

    <div
      className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] 
                  bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
    ></div>

    {/* Simplified decorative elements */}
    <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-700/10 blur-3xl rounded-full"></div>
    <div className="absolute top-0 right-0 w-1/4 h-1/4 bg-blue-700/10 blur-3xl rounded-full"></div>

    <div className="relative z-10 max-w-5xl px-6 text-center">
      <motion.h1
        initial={
          reducedMotion ? { opacity: 0.7, y: 15 } : { opacity: 0, y: 30 }
        }
        animate={{ opacity: isActive ? 1 : 0.7, y: isActive ? 0 : 15 }}
        transition={{ duration: reducedMotion ? 0.3 : 0.6 }}
        className="text-[12vw] md:text-[8vw] font-bold tracking-tighter 
                  bg-clip-text text-transparent bg-gradient-to-b from-white via-purple-100 to-purple-400"
      >
        Travel Memories
      </motion.h1>

      <motion.div
        initial={{ opacity: 0.5, scale: 0.95 }}
        animate={{ opacity: isActive ? 0.8 : 0.5, scale: isActive ? 1 : 0.95 }}
        transition={{ duration: 0.4 }}
        className="mt-4 flex justify-center"
      >
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0.5 }}
        animate={{ opacity: isActive ? 0.9 : 0.5 }}
        transition={{ duration: 0.4 }}
        className="mt-6 text-lg text-center max-w-md mx-auto text-gray-300"
      >
        Your adventures saved forever. Return anytime to relive these precious
        moments and plan your next journey.
      </motion.p>

      <motion.div
        initial={reducedMotion ? { opacity: 0.7 } : { opacity: 0, y: 20 }}
        animate={{ opacity: isActive ? 1 : 0.7, y: isActive ? 0 : 10 }}
        transition={{ duration: reducedMotion ? 0.3 : 0.5 }}
        className="mt-12"
      >
        <a
          href="/user-dashboard"
          className="px-7 py-3.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white
                   font-medium hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-900/30"
        >
          Back to Dashboard
        </a>
      </motion.div>
    </div>
  </section>
));

FooterSection.displayName = "FooterSection";

// Create TripViewWithStars component that includes the star animations
const TripViewWithStars = (props) => (
  <>
    <StarAnimationStyles />
    <TripView {...props} />
  </>
);

// Export the component with stars
export default TripViewWithStars;
