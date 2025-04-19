import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";
import { HiGlobeAlt } from "react-icons/hi";
import { RiMapPinLine } from "react-icons/ri";
import { BiCopyright } from "react-icons/bi";
import { motion } from "framer-motion";
import { Suspense, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Girl from "../components/Girl";
import CanvasLoader from "./Loading";
import React from "react";

// Error Boundary Component to prevent crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn("3D rendering error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const Footer = () => {
  const [hovered, setHovered] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [canvasVisible, setCanvasVisible] = useState(true);
  const canvasErrorCount = useRef(0);

  // Handle Canvas errors to prevent repeated crashes
  const handleCanvasError = () => {
    canvasErrorCount.current += 1;
    if (canvasErrorCount.current > 2) {
      setCanvasVisible(false);
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setNewsletterEmail("");
      setSubmitted(false);
    }, 3000);
  };

  const socialLinks = [
    {
      icon: <FaFacebookF size={18} />,
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      name: "Facebook",
    },
    {
      icon: <FaTwitter size={18} />,
      color: "bg-sky-500",
      hoverColor: "hover:bg-sky-600",
      name: "Twitter",
    },
    {
      icon: <FaInstagram size={18} />,
      color: "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500",
      hoverColor: "hover:opacity-90",
      name: "Instagram",
    },
    {
      icon: <FaLinkedinIn size={18} />,
      color: "bg-blue-700",
      hoverColor: "hover:bg-blue-800",
      name: "LinkedIn",
    },
    {
      icon: <FaYoutube size={18} />,
      color: "bg-red-600",
      hoverColor: "hover:bg-red-700",
      name: "YouTube",
    },
    {
      icon: <FaTiktok size={18} />,
      color: "bg-black",
      hoverColor: "hover:bg-gray-800",
      name: "TikTok",
    },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Wave divider */}
      <div className="absolute top-0 left-0 w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="w-full h-auto"
        >
          <path
            fill="#f9fafb"
            fillOpacity="1"
            d="M0,160L60,154.7C120,149,240,139,360,154.7C480,171,600,213,720,218.7C840,224,960,192,1080,176C1200,160,1320,160,1380,160L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
          ></path>
        </svg>
      </div>

      <div className="bg-gradient-to-b from-indigo-900 to-purple-900 text-white pt-32 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
            {/* Company info - 4 columns on large screens */}
            <div className="lg:col-span-4 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="space-y-4"
              >
                <div className="flex items-center">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 1, type: "spring" }}
                    className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 mr-3"
                  >
                    <span className="text-xl font-bold text-white">V</span>
                  </motion.div>
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-pink-200">
                    Voyageur
                  </h2>
                </div>

                <p className="text-indigo-200 text-sm leading-relaxed">
                  Embark on extraordinary journeys with Voyageur. We connect
                  travelers with unique destinations and experiences around the
                  world.
                </p>

                <div className="flex space-x-3 pt-2">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href="#"
                      className={`w-9 h-9 ${social.color} ${social.hoverColor} rounded-full flex items-center justify-center text-white transition duration-300`}
                      whileHover={{ y: -4 }}
                      onHoverStart={() => setHovered(social.name)}
                      onHoverEnd={() => setHovered(null)}
                      aria-label={social.name}
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {/* Newsletter subscription */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-8 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10"
              >
                <h3 className="text-lg font-semibold mb-3 text-white">
                  Stay Updated
                </h3>
                <p className="text-indigo-200 text-sm mb-4">
                  Get travel tips and exclusive deals in your inbox
                </p>

                <form onSubmit={handleSubscribe} className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="submit"
                    className="absolute right-0.5 top-0.5 bottom-0.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-md font-medium text-sm text-white hover:from-indigo-600 hover:to-purple-600 transition-colors"
                  >
                    {submitted ? "Sent! ✓" : "Subscribe"}
                  </button>
                </form>
              </motion.div>
            </div>

            {/* Footer links - 5 columns on large screens */}
            <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8">
              <FooterSection
                title="Support"
                delay={0.3}
                links={[
                  "Help Centre",
                  "AirCover",
                  "Anti-discrimination",
                  "Disability support",
                  "Cancellation options",
                  "Report concern",
                ]}
              />

              <FooterSection
                title="Hosting"
                delay={0.4}
                links={[
                  "Voyageur your home",
                  "Voyageur for Hosts",
                  "Hosting resources",
                  "Community forum",
                  "Hosting responsibly",
                  "Hosting classes",
                ]}
              />

              <FooterSection
                title="Company"
                delay={0.5}
                links={[
                  "About us",
                  "Newsroom",
                  "New features",
                  "Careers",
                  "Investors",
                  "Emergency stays",
                ]}
              />
            </div>

            {/* 3D Section - 3 columns on large screens */}
            <div className="lg:col-span-3 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="h-[300px] md:h-[350px] border border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden relative shadow-xl shadow-purple-900/20"
              >
                {canvasVisible ? (
                  <ErrorBoundary
                    fallback={
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-800 to-purple-800">
                        <div className="text-center p-6">
                          <motion.div
                            className="w-16 h-16 mx-auto mb-3 bg-indigo-600/30 rounded-full flex items-center justify-center"
                            animate={{ rotate: 360 }}
                            transition={{
                              repeat: Infinity,
                              duration: 8,
                              ease: "linear",
                            }}
                          >
                            <span className="text-2xl">✨</span>
                          </motion.div>
                          <h4 className="text-white font-medium">
                            Interactive Experience
                          </h4>
                          <p className="text-indigo-200 text-sm mt-2">
                            Explore our virtual adventures
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <div className="w-full h-full" onError={handleCanvasError}>
                      <Canvas
                        shadows
                        camera={{ position: [0, 0, 10], fov: 25 }}
                        className="!absolute inset-0"
                      >
                        <ambientLight intensity={1.5} />
                        <spotLight
                          position={[10, 10, 10]}
                          angle={0.15}
                          penumbra={1}
                        />
                        <directionalLight
                          position={[10, 10, 10]}
                          intensity={1}
                        />
                        <OrbitControls
                          enableZoom={false}
                          maxPolarAngle={Math.PI / 2}
                          autoRotate
                          autoRotateSpeed={0.5}
                        />
                        <Suspense fallback={<CanvasLoader />}>
                          <Girl
                            position-y={-3}
                            scale={3}
                            animationName="salute"
                          />
                          <Environment preset="sunset" />
                        </Suspense>
                      </Canvas>
                    </div>
                  </ErrorBoundary>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-800 to-purple-800">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 mx-auto mb-3 bg-pink-500/30 rounded-full flex items-center justify-center">
                        <span role="img" aria-label="star" className="text-2xl">
                          ⭐
                        </span>
                      </div>
                      <h4 className="text-white font-medium">
                        Voyageur Experience
                      </h4>
                      <p className="text-indigo-200 text-sm mt-2">
                        Discover amazing destinations
                      </p>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-900/90 to-transparent p-4 text-center">
                  <motion.p
                    className="text-white text-sm font-medium"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    Interactive Guide
                  </motion.p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-300/20 to-transparent my-10" />

          {/* Footer bottom section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex flex-col md:flex-row justify-between items-center text-sm"
          >
            <div className="flex flex-wrap items-center justify-center md:justify-start mb-4 md:mb-0 text-indigo-200">
              <BiCopyright className="mr-1" size={16} />
              <span>2025 Voyageur, Inc.</span>
              <span className="mx-2">·</span>
              <FooterBottomLink text="Privacy" />
              <span className="mx-2">·</span>
              <FooterBottomLink text="Terms" />
              <span className="mx-2">·</span>
              <FooterBottomLink text="Sitemap" />
              <span className="mx-2">·</span>
              <FooterBottomLink text="Company details" />
            </div>

            <div className="flex items-center gap-6">
              <motion.div
                className="flex items-center text-indigo-200 hover:text-white transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                <HiGlobeAlt className="mr-2" size={18} />
                <span className="font-medium">English (IN)</span>
              </motion.div>

              <motion.div
                className="flex items-center text-indigo-200 hover:text-white transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                <RiMapPinLine className="mr-2" size={18} />
                <span className="font-medium">₹ INR</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Extra accent shapes */}
      <div className="absolute top-1/4 left-[5%] w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/4 right-[5%] w-80 h-80 bg-indigo-600/20 rounded-full filter blur-3xl"></div>
    </footer>
  );
};

// Footer Section Component
const FooterSection = ({ title, links, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7, delay }}
  >
    <h4 className="font-semibold text-lg text-white mb-4">{title}</h4>
    <ul className="space-y-2">
      {links.map((text, index) => (
        <FooterLink key={index} text={text} delay={0.1 * index} />
      ))}
    </ul>
  </motion.div>
);

// Footer Link Component
const FooterLink = ({ text, delay = 0 }) => (
  <motion.li
    initial={{ opacity: 0, x: -5 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <motion.a
      href="#"
      className="text-indigo-200 hover:text-white transition-colors inline-block"
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      {text}
    </motion.a>
  </motion.li>
);

// Footer Bottom Link Component
const FooterBottomLink = ({ text }) => (
  <motion.a
    href="#"
    className="text-indigo-200 hover:text-white transition-colors"
    whileHover={{ scale: 1.05 }}
  >
    {text}
  </motion.a>
);

export default Footer;
