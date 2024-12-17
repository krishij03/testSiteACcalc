import React from 'react';
import darshImage from '../assets/darshNew.jpg';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-8">About Darsh Shah</h2>
          <motion.img
            src={darshImage}
            alt="Darsh Shah"
            className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          />
          <motion.p 
            className="text-lg text-gray-700 mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Hi, I'm Darsh Shah, a final year student at Bhartiya Vidya Bhavans Sardar Patel Institute of Technology and a social entrepreneur passionate about sustainability and energy efficiency.
            Based in Mumbai, I'm dedicated to helping individuals and businesses optimize their energy consumption
            through smart solutions.
          </motion.p>
          <motion.p 
            className="text-lg text-gray-700 mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Smart Energy is my vision to empower people with the tools and knowledge they need to make
            informed decisions about their energy usage, particularly in HVAC systems which account for
            52% of building energy consumption.
          </motion.p>
          <div className="flex justify-center space-x-4">
            <a
              href="https://www.linkedin.com/in/darsh-shah-b61333231/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700"
            >
              LinkedIn
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;