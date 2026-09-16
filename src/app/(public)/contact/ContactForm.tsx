'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        const data = await res.json();
        setStatus('error');
        setErrorMessage(data.error || 'Failed to send message. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="bg-background relative">
      <section className="py-12 sm:py-16 px-4 bg-gradient-to-br from-[#2d6a4f] to-[#1a4d3a]">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-semibold mb-4 tracking-wide uppercase">
            Get in Touch
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">Contact FarmDirect</h1>
          <p className="text-white/80 text-sm sm:text-base">We&apos;d love to hear from you — whether you want to invest, visit, or just say hello.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid lg:grid-cols-5 gap-6 mb-12">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-4">
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

            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#d8f3dc]">
              <div className="w-12 h-12 rounded-xl bg-[#52b788] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-[#52796f]">Visit the Farm</p>
                <p className="font-semibold text-[#1a2e1a] text-sm">Coimbatore, Tamil Nadu</p>
                <p className="text-xs text-[#52796f]">Exact location shared after booking</p>
              </div>
            </div>

            {/* Visit CTA */}
            <div className="bg-[#f0f7f0] rounded-2xl p-5 border border-[#d8f3dc] text-center mt-2">
              <MapPin className="w-10 h-10 text-[#2d6a4f] mx-auto mb-3" />
              <p className="text-[#52796f] text-sm mb-4">
                Experience the farm firsthand — walk the fields, meet the animals, and enjoy a traditional Kerala meal.
              </p>
              <Link
                href="mailto:farmdirect.ind@gmail.com?subject=Farm%20Visit%20Booking&body=I%20would%20like%20to%20book%20a%20visit%20to%20FarmDirect.%20Please%20let%20me%20know%20available%20dates%20and%20details."
                className="inline-flex items-center gap-2 bg-[#2d6a4f] text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-[#1a4d3a] transition-colors text-sm"
              >
                <MapPin className="w-4 h-4" />
                Book a Visit
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-[#d8f3dc]">
            <h3 className="font-display text-xl font-semibold text-[#1a2e1a] mb-5">Send Us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm text-[#52796f] mb-1.5">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-[#d8f3dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm text-[#52796f] mb-1.5">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-[#d8f3dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm text-[#52796f] mb-1.5">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-[#d8f3dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm text-[#52796f] mb-1.5">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-[#d8f3dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent text-sm"
                >
                  <option value="">Select a topic</option>
                  <option value="investment">Investment Inquiry</option>
                  <option value="visit">Farm Visit Booking</option>
                  <option value="partnership">Farmer Partnership</option>
                  <option value="media">Media / Press</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm text-[#52796f] mb-1.5">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-[#d8f3dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent text-sm resize-none"
                />
              </div>

              {status === 'error' && (
                <div className="bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] px-4 py-3 rounded-xl text-sm">
                  {errorMessage}
                </div>
              )}

              {status === 'success' && (
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] px-4 py-3 rounded-xl text-sm">
                  Message sent successfully! We&apos;ll get back to you within 24 hours.
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-[#2d6a4f] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#1a4d3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'submitting' ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#d8f3dc] aspect-[16/9] flex items-center justify-center">
          <div className="text-center px-6 py-12">
            <MapPin className="w-12 h-12 text-[#95d5b2] mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold text-[#1a2e1a] mb-2">Farm Location</h3>
            <p className="text-[#52796f] text-sm mb-3">Coimbatore, Tamil Nadu</p>
            <p className="text-xs text-[#95d5b2] mb-5">Exact address shared with confirmed visitors for privacy and security</p>
            <div className="grid grid-cols-3 gap-4 text-center max-w-md mx-auto">
              <div className="bg-[#f0f7f0] rounded-xl p-4">
                <p className="text-2xl font-bold text-[#2d6a4f]">50+</p>
                <p className="text-xs text-[#52796f]">Acres</p>
              </div>
              <div className="bg-[#f0f7f0] rounded-xl p-4">
                <p className="text-2xl font-bold text-[#2d6a4f]">200+</p>
                <p className="text-xs text-[#52796f]">Partner Farmers</p>
              </div>
              <div className="bg-[#f0f7f0] rounded-xl p-4">
                <p className="text-2xl font-bold text-[#2d6a4f]">15+</p>
                <p className="text-xs text-[#52796f]">Crop Varieties</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}