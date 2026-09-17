'use client';

import { Mail, Phone } from 'lucide-react';

export default function ContactForm() {
  return (
    <div className="bg-background relative">
      <section className="py-12 sm:py-16 px-4 bg-gradient-to-br from-[#2d6a4f] to-[#1a4d3a]">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-semibold mb-4 tracking-wide uppercase">
            Get in Touch
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">Contact FarmDirect</h1>
          <p className="text-white/80 text-sm sm:text-base">We&apos;d love to hear from you — whether you want to invest or just say hello.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <a href="tel:+919840830369" className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#d8f3dc] hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#2d6a4f] flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-[#52796f]">Call Us</p>
              <p className="font-semibold text-[#1a2e1a] text-sm">+91 98408 30369</p>
              <p className="text-xs text-[#52796f]">Weekdays 9 AM – 6 PM</p>
            </div>
          </a>

          <a href="mailto:farmdirect.ind@gmail.com" className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#d8f3dc] hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#40916c] flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-[#52796f]">Email Us</p>
              <p className="font-semibold text-[#1a2e1a] text-sm">farmdirect.ind@gmail.com</p>
              <p className="text-xs text-[#52796f]">Replies within 24 hours</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}