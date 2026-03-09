'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Play,
  MapPin,
  Phone,
  Clock,
  Star,
  Users,
  Sparkles,
  ChevronDown,
  Instagram,
  MessageCircle
} from 'lucide-react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import BookingFlow from '@/components/booking/BookingFlow';
import { AnnouncementBar, PromoBanner, PromoPopup } from '@/components/banners';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  const features = [
    {
      icon: Users,
      title: '25 Seats',
      description: 'Intimate private experience',
    },
    {
      icon: Star,
      title: '4K Projection',
      description: 'Crystal clear visuals',
    },
    {
      icon: Sparkles,
      title: 'Dolby Sound',
      description: 'Immersive audio experience',
    },
    {
      icon: Clock,
      title: 'Flexible Slots',
      description: '10 AM to 11 PM daily',
    },
  ];

  const testimonials = [
    {
      name: 'Priya M.',
      text: 'Best birthday surprise ever! The decoration and private screening made it so special.',
      rating: 5,
    },
    {
      name: 'Karthik R.',
      text: 'Proposed to my girlfriend here. The team helped set up everything perfectly. She said yes!',
      rating: 5,
    },
    {
      name: 'Anitha S.',
      text: 'Our friend group had an amazing time. Way better than regular theatres!',
      rating: 5,
    },
  ];

  return (
    <main className="min-h-screen bg-terminal-black">
      {/* Announcement Bar - Top of page */}
      <AnnouncementBar />

      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 grid-bg opacity-50" />

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-terminal-green/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-terminal-blue/20 rounded-full blur-[100px] animate-pulse delay-1000" />

        <motion.div style={{ opacity, scale }} className="relative z-10 text-center px-4 pt-20">
          {/* Version badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-terminal-green/10 border border-terminal-green/30 rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-terminal-green rounded-full animate-pulse" />
            <span className="text-terminal-green font-mono text-sm">v1.0 | Now Live in Nagercoil</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-mono font-bold text-white mb-4"
          >
            Container Theatre
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl font-mono text-terminal-green mb-8 glow-text"
          >
            No bugs. Just blockbusters.
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-terminal-muted font-mono max-w-xl mx-auto mb-10"
          >
            Nagercoil&apos;s first private mini theatre. Book the entire 25-seat theatre for
            couples, birthdays, celebrations, or just a movie night with friends.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#booking"
              className="group flex items-center gap-3 px-8 py-4 bg-terminal-green text-terminal-black rounded-lg font-mono font-bold text-lg hover:bg-terminal-green/90 transition-all"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Deploy Experience
            </a>
            <a
              href="#packages"
              className="flex items-center gap-3 px-8 py-4 border border-terminal-green text-terminal-green rounded-lg font-mono font-medium hover:bg-terminal-green/10 transition-all"
            >
              View Packages
            </a>
          </motion.div>

          {/* Location badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex items-center justify-center gap-2 mt-10 text-terminal-muted font-mono text-sm"
          >
            <MapPin className="w-4 h-4 text-terminal-green" />
            <span>Nagercoil, Tamil Nadu</span>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-terminal-green"
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-terminal-dark/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-white mb-4">
              {'>'} System Specs
            </h2>
            <p className="text-terminal-muted font-mono">
              Premium hardware for the ultimate experience
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-terminal-dark border border-terminal-gray rounded-xl p-6 text-center hover:border-terminal-green/50 transition-colors"
              >
                <div className="w-14 h-14 bg-terminal-green/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-terminal-green" />
                </div>
                <h3 className="text-white font-mono font-bold mb-2">{feature.title}</h3>
                <p className="text-terminal-muted font-mono text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <PromoBanner />
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-terminal-green/10 border border-terminal-green/30 rounded-full mb-4">
              <span className="text-terminal-green font-mono text-sm">{'>'} npm run book</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-white mb-4">
              Book Your Experience
            </h2>
            <p className="text-terminal-muted font-mono">
              Select a package and deploy your private theatre experience
            </p>
          </motion.div>

          <div id="packages">
            <BookingFlow />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-terminal-dark/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-white mb-4">
              {'>'} console.log(reviews)
            </h2>
            <p className="text-terminal-muted font-mono">
              What our beta testers say
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-terminal-dark border border-terminal-gray rounded-xl p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-terminal-yellow text-terminal-yellow" />
                  ))}
                </div>
                <p className="text-white font-mono text-sm mb-4">&quot;{testimonial.text}&quot;</p>
                <p className="text-terminal-green font-mono text-sm">— {testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-terminal-dark border border-terminal-gray rounded-2xl p-8 md:p-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-mono font-bold text-white mb-4">
                {'>'} connect()
              </h2>
              <p className="text-terminal-muted font-mono">
                Have questions? Reach out to us
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a
                href="tel:+91XXXXXXXXXX"
                className="flex items-center gap-4 p-6 bg-terminal-gray/30 rounded-xl hover:bg-terminal-gray/50 transition-colors group"
              >
                <div className="w-14 h-14 bg-terminal-green/10 rounded-xl flex items-center justify-center group-hover:bg-terminal-green/20 transition-colors">
                  <Phone className="w-7 h-7 text-terminal-green" />
                </div>
                <div>
                  <p className="text-terminal-muted font-mono text-sm">Call us</p>
                  <p className="text-white font-mono font-bold">+91 XXXXX XXXXX</p>
                </div>
              </a>

              <a
                href="https://wa.me/91XXXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-6 bg-terminal-gray/30 rounded-xl hover:bg-terminal-gray/50 transition-colors group"
              >
                <div className="w-14 h-14 bg-terminal-green/10 rounded-xl flex items-center justify-center group-hover:bg-terminal-green/20 transition-colors">
                  <MessageCircle className="w-7 h-7 text-terminal-green" />
                </div>
                <div>
                  <p className="text-terminal-muted font-mono text-sm">WhatsApp</p>
                  <p className="text-white font-mono font-bold">Chat with us</p>
                </div>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-6 bg-terminal-gray/30 rounded-xl hover:bg-terminal-gray/50 transition-colors group"
              >
                <div className="w-14 h-14 bg-terminal-green/10 rounded-xl flex items-center justify-center group-hover:bg-terminal-green/20 transition-colors">
                  <Instagram className="w-7 h-7 text-terminal-green" />
                </div>
                <div>
                  <p className="text-terminal-muted font-mono text-sm">Instagram</p>
                  <p className="text-white font-mono font-bold">@containertheatre.v1</p>
                </div>
              </a>

              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-6 bg-terminal-gray/30 rounded-xl hover:bg-terminal-gray/50 transition-colors group"
              >
                <div className="w-14 h-14 bg-terminal-green/10 rounded-xl flex items-center justify-center group-hover:bg-terminal-green/20 transition-colors">
                  <MapPin className="w-7 h-7 text-terminal-green" />
                </div>
                <div>
                  <p className="text-terminal-muted font-mono text-sm">Location</p>
                  <p className="text-white font-mono font-bold">Nagercoil, TN</p>
                </div>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Promotional Popup - Shows after delay */}
      <PromoPopup delay={5000} />
    </main>
  );
}
