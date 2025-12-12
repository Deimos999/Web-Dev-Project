import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-blue-400" size={24} />
              <span className="font-bold text-white text-lg">EventHub</span>
            </div>
            <p className="text-slate-400 text-sm">
              Your ultimate event management and registration platform.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <Link to="/" className="hover:text-blue-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-blue-400 transition">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/registrations" className="hover:text-blue-400 transition">
                  My Registrations
                </Link>
              </li>
              <li>
                <Link to="/tickets" className="hover:text-blue-400 transition">
                  Tickets
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <a href="#help" className="hover:text-blue-400 transition">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-blue-400 transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-blue-400 transition">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-blue-400 transition">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <a href="#privacy" className="hover:text-blue-400 transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#cookies" className="hover:text-blue-400 transition">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#refund" className="hover:text-blue-400 transition">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © {currentYear} EventHub. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#facebook" className="text-slate-400 hover:text-blue-400 transition">
                Facebook
              </a>
              <a href="#twitter" className="text-slate-400 hover:text-blue-400 transition">
                Twitter
              </a>
              <a href="#instagram" className="text-slate-400 hover:text-blue-400 transition">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;