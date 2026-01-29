'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { NeuralNetworkBackground } from '@/components/ui/NeuralNetworkBackground'

export function ProductShowcaseSection() {
  return (
    <section className="py-20 md:py-32 bg-[var(--color-offwhite)] relative overflow-hidden">
      {/* Neural Network Background */}
      <NeuralNetworkBackground />
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20">
        
        {/* Section: Backed by neuroscience */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative w-full h-[500px] z-10"
          >
            {/* Neuroscience Particle Animation */}
            <div className="absolute inset-0 -left-12 -right-12 -top-12 -bottom-12 z-10">
                {/* Central brain-like node */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-[#ff6a38] to-[#ff8c5a] opacity-40 blur-3xl"
                ></motion.div>

                {/* Particle 1 - Top Left */}
                <motion.div
                  animate={{ 
                    x: [0, -30, 0],
                    y: [0, -25, 0],
                    scale: [1, 1.3, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-16 left-16 w-20 h-20 rounded-full bg-[#ff6a38]/60 blur-xl"
                ></motion.div>

                {/* Particle 2 - Top Right */}
                <motion.div
                  animate={{ 
                    x: [0, 35, 0],
                    y: [0, -30, 0],
                    scale: [1, 1.4, 1]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute top-12 right-12 w-24 h-24 rounded-full bg-[#0073ba]/60 blur-2xl"
                ></motion.div>

                {/* Particle 3 - Bottom Left */}
                <motion.div
                  animate={{ 
                    x: [0, -25, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-20 left-12 w-22 h-22 rounded-full bg-[#ff6a38]/50 blur-xl"
                ></motion.div>

                {/* Particle 4 - Bottom Right */}
                <motion.div
                  animate={{ 
                    x: [0, 30, 0],
                    y: [0, 25, 0],
                    scale: [1, 1.35, 1]
                  }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="absolute bottom-16 right-16 w-18 h-18 rounded-full bg-[#0073ba]/65 blur-lg"
                ></motion.div>

                {/* Small particles */}
                <motion.div
                  animate={{ 
                    x: [0, 15, -15, 0],
                    y: [0, -15, 15, 0],
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/3 left-1/4 w-10 h-10 rounded-full bg-[#ff6a38]/70 blur-md"
                ></motion.div>

                <motion.div
                  animate={{ 
                    x: [0, -20, 20, 0],
                    y: [0, 20, -20, 0],
                    opacity: [0.4, 0.8, 0.4]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  className="absolute bottom-1/3 right-1/4 w-12 h-12 rounded-full bg-[#0073ba]/70 blur-md"
                ></motion.div>

                {/* Connection lines effect */}
                <motion.div
                  animate={{ 
                    opacity: [0.1, 0.3, 0.1],
                    scale: [0.95, 1.05, 0.95]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-72 h-72 border-2 border-[#ff6a38]/10 rounded-full"></div>
                </motion.div>
                <motion.div
                  animate={{ 
                    opacity: [0.15, 0.35, 0.15],
                    scale: [1.05, 0.95, 1.05]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-96 h-96 border-2 border-[#0073ba]/10 rounded-full"></div>
                </motion.div>

                {/* Synaptic spark effects */}
                <motion.div
                  animate={{ 
                    opacity: [0, 0.9, 0],
                    scale: [0.8, 1.3, 0.8]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/4 right-1/3 w-3 h-3 rounded-full bg-[#ff6a38]"
                ></motion.div>
                <motion.div
                  animate={{ 
                    opacity: [0, 0.9, 0],
                    scale: [0.8, 1.3, 0.8]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-1/4 left-1/3 w-3 h-3 rounded-full bg-[#0073ba]"
                ></motion.div>
            </div>
          </motion.div>

          {/* Right: Text content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#ff6a38] leading-tight uppercase">
              BACKED BY NEUROSCIENCE
            </h2>
            <p className="text-lg md:text-xl text-[var(--color-charcoal)] leading-relaxed">
              Built by doctors, psychologists, public speakers, and successful business owners. 
              Neuroscience-backed. Story-driven. It just works.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
