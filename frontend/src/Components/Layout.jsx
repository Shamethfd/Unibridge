import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-white border-t border-neutral-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-md flex items-center justify-center">
                <span className="text-white font-gilroyBold text-sm">U</span>
              </div>
              <span className="text-sm font-gilroyMedium text-neutral-600">
                Learn<span className="text-secondary-500">Bridge</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-gilroyRegular">
              © 2026 LearnBridge — Peer Tutoring Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
