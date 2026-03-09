'use client';

import { Terminal, MapPin, Phone, Mail, Instagram, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-terminal-dark border-t border-terminal-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-terminal-green/10 border border-terminal-green flex items-center justify-center">
                <Terminal className="w-6 h-6 text-terminal-green" />
              </div>
              <div>
                <h3 className="text-white font-mono font-bold text-xl">Container Theatre</h3>
                <p className="text-terminal-green text-sm font-mono">v1.0</p>
              </div>
            </div>
            <p className="text-terminal-muted font-mono text-sm mb-4 max-w-md">
              No bugs. Just blockbusters. Nagercoil&apos;s first private mini theatre experience.
              Deployed with love by a developer.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-terminal-gray/50 flex items-center justify-center text-terminal-muted hover:text-terminal-green hover:bg-terminal-gray transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/91XXXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-terminal-gray/50 flex items-center justify-center text-terminal-muted hover:text-terminal-green hover:bg-terminal-gray transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-terminal-green font-mono font-bold mb-4">{'> navigate'}</h4>
            <ul className="space-y-2">
              {['Home', 'Packages', 'Gallery', 'FAQ', 'Contact'].map((item) => (
                <li key={item}>
                  <Link
                    href={`#${item.toLowerCase()}`}
                    className="text-terminal-muted hover:text-terminal-green font-mono text-sm transition-colors"
                  >
                    ./{item.toLowerCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-terminal-green font-mono font-bold mb-4">{'> connect'}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-terminal-green mt-1 flex-shrink-0" />
                <span className="text-terminal-muted font-mono text-sm">
                  Nagercoil, Tamil Nadu
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-terminal-green flex-shrink-0" />
                <a
                  href="tel:+91XXXXXXXXXX"
                  className="text-terminal-muted hover:text-terminal-green font-mono text-sm transition-colors"
                >
                  +91 XXXXX XXXXX
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-terminal-green flex-shrink-0" />
                <a
                  href="mailto:book@containertheatre.in"
                  className="text-terminal-muted hover:text-terminal-green font-mono text-sm transition-colors"
                >
                  book@containertheatre.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-terminal-gray flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-terminal-muted font-mono text-xs">
            &copy; {new Date().getFullYear()} Container Theatre v1.0. All rights reserved.
          </p>
          <p className="text-terminal-muted font-mono text-xs">
            deployed with <span className="text-terminal-red">❤</span> by a developer
          </p>
        </div>
      </div>
    </footer>
  );
}
