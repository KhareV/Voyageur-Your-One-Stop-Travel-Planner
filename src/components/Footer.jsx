import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Girl from "../components/Girl";
import CanvasLoader from "./Loading";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-700 p-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start">
        {/* Left Side: Footer Content */}
        <div className="w-full md:w-2/3 space-y-6">
          <div className="grid md:grid-cols-3 gap-8 border-b border-gray-300 pb-6">
            <FooterSection title="Support">
              <FooterLink text="Help Centre" />
              <FooterLink text="AirCover" />
              <FooterLink text="Anti-discrimination" />
              <FooterLink text="Disability support" />
              <FooterLink text="Cancellation options" />
              <FooterLink text="Report neighbourhood concern" />
            </FooterSection>

            <FooterSection title="Hosting">
              <FooterLink text="Voyageur your home" />
              <FooterLink text="Voyageur for Hosts" />
              <FooterLink text="Hosting resources" />
              <FooterLink text="Community forum" />
              <FooterLink text="Hosting responsibly" />
              <FooterLink text="Join a free Hosting class" />
              <FooterLink text="Find a co-host" />
            </FooterSection>

            <FooterSection title="Voyageur">
              <FooterLink text="Newsroom" />
              <FooterLink text="New features" />
              <FooterLink text="Careers" />
              <FooterLink text="Investors" />
              <FooterLink text="Voyageur.org emergency stays" />
            </FooterSection>
          </div>

          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center text-sm mt-6">
            <p className="text-gray-500">
              © 2025 Voyageur, Inc. ·{" "}
              <a href="#" className="hover:text-black transition">
                Privacy
              </a>{" "}
              ·
              <a href="#" className="hover:text-black transition">
                Terms
              </a>{" "}
              ·
              <a href="#" className="hover:text-black transition">
                Sitemap
              </a>{" "}
              ·
              <a href="#" className="hover:text-black transition">
                Company details
              </a>
            </p>

            {/* Language, Currency, and Social Icons */}
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <span className="cursor-pointer hover:text-black transition">
                🌐 English (IN)
              </span>
              <span className="cursor-pointer hover:text-black transition">
                ₹ INR
              </span>
              <motion.a
                whileHover={{ scale: 1.2 }}
                href="#"
                className="text-gray-600 hover:text-blue-600 transition"
              >
                <FaFacebookF size={16} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2 }}
                href="#"
                className="text-gray-600 hover:text-blue-400 transition"
              >
                <FaTwitter size={16} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2 }}
                href="#"
                className="text-gray-600 hover:text-pink-600 transition"
              >
                <FaInstagram size={16} />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Right Side: 3D Model */}
        <div className="w-full md:w-1/3 h-[300px] md:h-[400px] relative">
          <Canvas className="absolute inset-0">
            <ambientLight intensity={7} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <directionalLight position={[10, 10, 10]} intensity={1} />
            <OrbitControls
              enableZoom={false}
              maxPolarAngle={Math.PI / 2}
              autoRotate
              autoRotateSpeed={0.5}
            />
            <Suspense fallback={<CanvasLoader />}>
              <Girl position-y={-3} scale={3} animationName="salute" />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </footer>
  );
};

// Footer Section Component
const FooterSection = ({ title, children }) => (
  <div>
    <h4 className="text-lg font-semibold mb-4">{title}</h4>
    <ul className="space-y-2">{children}</ul>
  </div>
);

// Footer Link Component
const FooterLink = ({ text }) => (
  <motion.li
    whileHover={{ x: 5 }}
    className="text-gray-500 cursor-pointer hover:text-black transition"
  >
    {text}
  </motion.li>
);

export default Footer;
