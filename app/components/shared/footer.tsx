import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-gray-100 mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Noctra AI
              </h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              Bring your images to life with powerful AI tools. Edit, restore, and enhance effortlessly.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-purple-600 transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-purple-600 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-purple-600 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:support@noctra.ai"
                className="text-black hover:text-purple-600 transition-colors duration-200"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Features</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/transformation/add/restore"
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  Image Restore
                </Link>
              </li>
              <li>
                <Link
                  href="/transformation/add/fill"
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  Generative Fill
                </Link>
              </li>
              <li>
                <Link
                  href="/transformation/add/remove"
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  Object Remove
                </Link>
              </li>
              <li>
                <Link
                  href="/transformation/add/recolor"
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  Object Recolor
                </Link>
              </li>
              <li>
                <Link
                  href="/transformation/add/removeBackground"
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  Background Remove
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/credits"
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  License
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-100 mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-gray-500">
              © {currentYear} Noctra AI. All rights reserved.
            </p>
           
          </div>
        </div>
      </div>
    </footer>
  );
}

