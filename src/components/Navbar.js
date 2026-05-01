'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/activities', label: 'Activities' },
    { href: '/night-shows', label: 'Night Shows' },
    { href: '/request', label: 'Song request' },
    { href: '/service', label: 'Service request'},
    { href: '/complaints', label: 'Complaints' },
    { href: '/weather', label: 'Weather Today' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity duration-300 flex-shrink-0">
            <div className="relative h-8 w-8 sm:h-10 sm:w-10">
              <Image
                src="/rosa beach logo.jpg"
                alt="Rosa Beach Logo"
                fill
                className="object-contain rounded-lg"
                priority
              />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-gray-800">Rosa Beach</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-2 lg:space-x-8 items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 lg:px-4 py-2 rounded-xl font-medium text-sm lg:text-base transition-all duration-300 ease-in-out ${
                  pathname === item.href
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium text-base transition-all duration-300 ease-in-out ${
                    pathname === item.href
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}