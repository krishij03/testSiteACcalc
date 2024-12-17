import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import acImage from '../assets/types-of-air-conditioners.jpeg';
import { getGlobalVisitCount } from '../utils/counter';
import VisitorWebSocket from '../utils/websocket';

const Hero = () => {
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const wsRef = useRef<VisitorWebSocket | null>(null);

  useEffect(() => {
    const fetchVisitorCount = async () => {
      const count = await getGlobalVisitCount();
      setVisitorCount(count);
    };

    fetchVisitorCount();

    // Initialize WebSocket connection
    wsRef.current = new VisitorWebSocket((count) => {
      setVisitorCount(count);
    });

    // Cleanup WebSocket connection
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, []);

  return (
    <section id="home" className="pt-20 bg-gradient-to-br from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div 
            className="md:w-1/2 mb-10 md:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Smart Energy Starts Here
            </motion.h1>
            <AnimatePresence mode='wait'>
              <motion.p
                key={visitorCount}
                className="text-lg text-emerald-600 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                You're visitor #{visitorCount}
              </motion.p>
            </AnimatePresence>
            <motion.p 
              className="text-xl text-gray-600 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              HVAC systems consume 52% of building energy. Let's optimize your energy usage
              for a sustainable future.
            </motion.p>
            <motion.a
              href="#calculator"
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition duration-300"
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
            className="md:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={acImage}
              alt="Smart Energy"
              className="rounded-lg shadow-xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;