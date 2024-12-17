import React from 'react';
import darshImage from '../assets/darshNew.jpg';

const About = () => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">About Darsh Shah</h2>
          <img
            src={darshImage}
            alt="Darsh Shah"
            className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
          />
          <p className="text-lg text-gray-700 mb-6">
            Hi, I'm Darsh Shah, a final year student at Bhartiya Vidya Bhavans Sardar Patel Institute of Technology and asocial entrepreneur passionate about sustainability and energy efficiency.
            Based in Mumbai, I'm dedicated to helping individuals and businesses optimize their energy consumption
            through smart solutions.
          </p>
          <p className="text-lg text-gray-700 mb-6">
            Smart Energy is my vision to empower people with the tools and knowledge they need to make
            informed decisions about their energy usage, particularly in HVAC systems which account for
            52% of building energy consumption.
          </p>
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
        </div>
      </div>
    </section>
  );
};

export default About;