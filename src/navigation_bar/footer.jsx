import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";


const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-700 p-8">
      {/* Footer Main Content */}
      <div className="max-w-7xl mx-auto">
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
            <FooterLink text="Airbnb your home" />
            <FooterLink text="AirCover for Hosts" />
            <FooterLink text="Hosting resources" />
            <FooterLink text="Community forum" />
            <FooterLink text="Hosting responsibly" />
            <FooterLink text="Join a free Hosting class" />
            <FooterLink text="Find a co-host" />
          </FooterSection>

          <FooterSection title="Airbnb">
            <FooterLink text="Newsroom" />
            <FooterLink text="New features" />
            <FooterLink text="Careers" />
            <FooterLink text="Investors" />
            <FooterLink text="Airbnb.org emergency stays" />
          </FooterSection>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 text-sm">
          <p className="text-gray-500">
            © 2025 Airbnb, Inc. ·{" "}
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
