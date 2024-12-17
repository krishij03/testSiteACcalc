import React from 'react';
import { motion } from 'framer-motion';
import acImage from '../assets/types-of-air-conditioners.jpeg';

const Hero = () => {
  return (
    <section id="home" className="pt-16 md:pt-20 bg-gradient-to-br from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <motion.div 
            className="w-full md:w-1/2 text-center md:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Smart Energy Starts Here
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 px-4 md:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              HVAC systems consume 52% of building energy. Let's optimize your energy usage
              for a sustainable future.
            </motion.p>
            <motion.a
              href="#calculator"
              className="inline-block bg-emerald-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-emerald-700 transition duration-300 text-base sm:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Our AC Calculator
            </motion.a>
          </motion.div>
          <motion.div 
            className="w-full md:w-1/2 mt-8 md:mt-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={acImage}
              alt="Smart Energy"
              className="rounded-lg shadow-xl w-full max-w-lg mx-auto"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;