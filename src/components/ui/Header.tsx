'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Terminal, Calendar, User, LogOut, History } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut, loading } = useAuth();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Packages', href: '#packages' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Contact', href: '#contact' },
  ];

  // Format phone for display
  const displayPhone = user?.phoneNumber
    ? user.phoneNumber.replace('+91', '').slice(-10)
    : '';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-terminal-black/80 backdrop-blur-md border-b border-terminal-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-terminal-green/10 border border-terminal-green flex items-center justify-center group-hover:bg-terminal-green/20 transition-colors">
              <Terminal className="w-5 h-5 text-terminal-green" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-mono font-bold text-lg leading-tight">
                Container Theatre
              </h1>
              <p className="text-terminal-green text-xs font-mono">v1.0</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-terminal-muted hover:text-terminal-green font-mono text-sm transition-colors relative group"
              >
                <span className="text-terminal-green opacity-0 group-hover:opacity-100 transition-opacity">
                  {'> '}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button & User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* User Login/Menu */}
            {!loading && (
              <div className="relative">
                {user ? (
                  <>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-terminal-gray hover:border-terminal-green/50 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-terminal-green/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-terminal-green" />
                      </div>
                      <span className="text-terminal-muted font-mono text-sm">
                        {displayPhone.slice(0, 3)}...{displayPhone.slice(-3)}
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-terminal-dark border border-terminal-gray rounded-lg shadow-xl overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-terminal-gray">
                            <p className="text-terminal-green font-mono text-xs">Logged in as</p>
                            <p className="text-white font-mono text-sm">+91 {displayPhone}</p>
                          </div>
                          <Link
                            href="/my-bookings"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-3 text-terminal-muted hover:text-white hover:bg-terminal-gray/30 transition-colors font-mono text-sm"
                          >
                            <History className="w-4 h-4" />
                            My Bookings
                          </Link>
                          <button
                            onClick={() => {
                              signOut();
                              setShowUserMenu(false);
                            }}
                            className="flex items-center gap-2 px-4 py-3 text-terminal-red hover:bg-terminal-red/10 transition-colors font-mono text-sm w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-terminal-gray hover:border-terminal-green/50 text-terminal-muted hover:text-terminal-green transition-colors font-mono text-sm"
                  >
                    <User className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            )}

            <Link
              href="#booking"
              className="flex items-center gap-2 bg-terminal-green text-terminal-black px-4 py-2 rounded font-mono font-medium hover:bg-terminal-green/90 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Now</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-terminal-green"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-terminal-dark border-t border-terminal-gray"
          >
            <nav className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-white hover:text-terminal-green font-mono text-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {'>'} {item.label}
                </Link>
              ))}

              {/* Mobile User Menu */}
              {!loading && (
                <div className="pt-4 border-t border-terminal-gray">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-terminal-green/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-terminal-green" />
                        </div>
                        <div>
                          <p className="text-terminal-green font-mono text-xs">Logged in</p>
                          <p className="text-white font-mono">+91 {displayPhone}</p>
                        </div>
                      </div>
                      <Link
                        href="/my-bookings"
                        className="flex items-center gap-2 text-terminal-muted hover:text-white font-mono text-lg transition-colors mb-4"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <History className="w-5 h-5" />
                        My Bookings
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-2 text-terminal-red font-mono text-lg"
                      >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-2 text-terminal-muted hover:text-terminal-green font-mono text-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      Login
                    </Link>
                  )}
                </div>
              )}

              <Link
                href="#booking"
                className="block bg-terminal-green text-terminal-black px-4 py-3 rounded font-mono font-medium text-center mt-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Deploy Experience
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
