import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t mt-12" style={{borderTopColor: 'var(--color-border)', backgroundColor: 'var(--color-card)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar style={{color: 'var(--color-primary)'}} size={24} />
              <span className="font-bold text-lg" style={{color: 'var(--color-primary)'}}>EventHub</span>
            </div>
            <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
              Your ultimate event management and registration platform.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4" style={{color: 'var(--text-primary)'}}>Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="transition" style={{color: 'var(--text-secondary)', textDecoration: 'none'}} onMouseEnter={(e) => {e.target.style.color = 'var(--color-primary)'}} onMouseLeave={(e) => {e.target.style.color = 'var(--text-secondary)'}}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="transition" style={{color: 'var(--text-secondary)', textDecoration: 'none'}} onMouseEnter={(e) => {e.target.style.color = 'var(--color-primary)'}} onMouseLeave={(e) => {e.target.style.color = 'var(--text-secondary)'}}>
                  Events
                </Link>
              </li>
              <li>
                <Link to="/registrations" className="transition" style={{color: 'var(--text-secondary)', textDecoration: 'none'}} onMouseEnter={(e) => {e.target.style.color = 'var(--color-primary)'}} onMouseLeave={(e) => {e.target.style.color = 'var(--text-secondary)'}}>
                  My Registrations
                </Link>
              </li>
              <li>
                <Link to="/tickets" className="transition" style={{color: 'var(--text-secondary)', textDecoration: 'none'}} onMouseEnter={(e) => {e.target.style.color = 'var(--color-primary)'}} onMouseLeave={(e) => {e.target.style.color = 'var(--text-secondary)'}}>
                  Tickets
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4" style={{color: 'var(--text-primary)'}}>Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#help" className="transition" style={{color: 'var(--text-secondary)', textDecoration: 'none'}} onMouseEnter={(e) => {e.target.style.color = 'var(--color-primary)'}} onMouseLeave={(e) => {e.target.style.color = 'var(--text-secondary)'}}>
                  Help Center
                </a>
              </li>
              <li>
                <a href="#contact" className="transition" style={{color: 'var(--text-secondary)', textDecoration: 'none'}} onMouseEnter={(e) => {e.target.style.color = 'var(--color-primary)'}} onMouseLeave={(e) => {e.target.style.color = 'var(--text-secondary)'}}>
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#faq" className="transition" style={{color: 'var(--text-secondary)', textDecoration: 'none'}} onMouseEnter={(e) => {e.target.style.color = 'var(--color-primary)'}} onMouseLeave={(e) => {e.target.style.color = 'var(--text-secondary)'}}>
                  FAQ
                </a>
              </li>
              <li>
                <a href="#terms" className="transition" style={{color: 'var(--text-secondary)', textDecoration: 'none'}} onMouseEnter={(e) => {e.target.style.color = 'var(--color-primary)'}} onMouseLeave={(e) => {e.target.style.color = 'var(--text-secondary)'}}>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4" style={{color: 'var(--text-primary)'}}>Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#privacy" className="transition" style={{color: 'var(--text-secondary)', textDecoration: 'none'}} onMouseEnter={(e) => {e.target.style.color = 'var(--color-primary)'}} onMouseLeave={(e) => {e.target.style.color = 'var(--text-secondary)'}}>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#cookies" className="transition" style={{color: 'var(--text-secondary)', textDecoration: 'none'}} onMouseEnter={(e) => {e.target.style.color = 'var(--color-primary)'}} onMouseLeave={(e) => {e.target.style.color = 'var(--text-secondary)'}}>
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#refund" className="transition" style={{color: 'var(--text-secondary)', textDecoration: 'none'}} onMouseEnter={(e) => {e.target.style.color = 'var(--color-primary)'}} onMouseLeave={(e) => {e.target.style.color = 'var(--text-secondary)'}}>
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8" style={{borderTopColor: 'var(--color-border)', borderTopWidth: '1px'}}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
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