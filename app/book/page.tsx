'use client';

import { Suspense } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import BookingWizard from '../components/features/BookingWizard';

export default function BookPage() {
  return (
    <main className="bg-surface min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-32 pb-20 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <a href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm font-semibold no-underline">
              <span>←</span> Back to Home
            </a>
          </div>
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Book Your Visit</h1>
            <p className="text-gray-600 text-lg">Tell us a bit about your pet so we can prepare for your visit.</p>
          </div>

          <Suspense fallback={<div className="text-center p-10 text-gray-500">Loading booking form...</div>}>
            <BookingWizard />
          </Suspense>
        </div>
      </div>
      <Footer />
    </main>
  );
}
