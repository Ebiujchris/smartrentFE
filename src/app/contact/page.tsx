'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real application, you would send this to your backend
      // For now, we'll show a success message
      console.log('Form submitted:', formData);
      toast.success('Message sent successfully!', {
        description: 'We\'ll get back to you as soon as possible.',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-md">
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-2m-9 2l4 2m0-11L7 7m7 0l-4 2" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">SmartRentUG</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="text-xs sm:text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <Link href="/login" className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-3 sm:px-6 h-8 sm:h-10 text-xs sm:text-sm">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Contact Hero */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-24 text-white">
          <div className="container mx-auto px-4 md:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">Get in Touch</h1>
            <p className="text-lg text-slate-300 max-w-2xl">
              Have questions or need support? We're here to help. Contact us and we'll respond as soon as possible.
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-8">Contact Information</h2>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <Mail className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                      <p className="text-slate-600">smartrent@gmail.com</p>
                      <p className="text-sm text-slate-500 mt-1">We'll respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Phone className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Phone</h3>
                      <p className="text-slate-600">+256 774 560 634</p>
                      <p className="text-sm text-slate-500 mt-1">Monday - Friday, 9AM - 6PM EAT</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <MessageSquare className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Chat Support</h3>
                      <p className="text-slate-600">Available in-app for all users</p>
                      <p className="text-sm text-slate-500 mt-1">Available 24/7 for premium members</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <MapPin className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Office</h3>
                      <p className="text-slate-600">Kampala, Uganda</p>
                      <p className="text-sm text-slate-500 mt-1">Open for meetings by appointment</p>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="mt-12 pt-8 border-t border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-4">Quick Links</h3>
                  <ul className="space-y-2">
                    <li><Link href="/about" className="text-emerald-600 hover:text-emerald-700 transition-colors">About Us</Link></li>
                    <li><Link href="/pricing" className="text-emerald-600 hover:text-emerald-700 transition-colors">Pricing</Link></li>
                    <li><Link href="/features" className="text-emerald-600 hover:text-emerald-700 transition-colors">Features</Link></li>
                    <li><Link href="/register" className="text-emerald-600 hover:text-emerald-700 transition-colors">Get Started</Link></li>
                  </ul>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      required
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-12 font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>

                <p className="text-xs text-slate-500 mt-4">
                  We'll get back to you as soon as possible. For urgent matters, please call us directly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Common Questions</h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  q: 'How can I contact support?',
                  a: 'You can reach us via email at smartrent@gmail.com, phone at +256 774 560 634, or use the chat feature in your dashboard.'
                },
                {
                  q: 'What are your business hours?',
                  a: 'Our support team is available Monday - Friday, 9AM - 6PM EAT. Premium members get 24/7 chat support.'
                },
                {
                  q: 'Do you offer phone support?',
                  a: 'Yes! Call us at +256 774 560 634 during business hours. Premium members can schedule dedicated support calls.'
                },
                {
                  q: 'How quickly do you respond?',
                  a: 'We aim to respond to all inquiries within 24 hours. Urgent issues for premium members are prioritized and handled within 2 hours.'
                },
                {
                  q: 'Can I request a demo?',
                  a: 'Absolutely! Contact us at smartrent@gmail.com or call +256 774 560 634 to schedule a personalized demo.'
                },
                {
                  q: 'Do you offer training?',
                  a: 'Yes, we provide comprehensive training for all users. New users get onboarding training, and premium members get advanced training.'
                },
              ].map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-600 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">SmartRentUG</h3>
              <p className="text-sm">Modern property management for Uganda</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>Email: smartrent@gmail.com</li>
                <li>Phone: +256 774 560 634</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2024 SmartRentUG. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
