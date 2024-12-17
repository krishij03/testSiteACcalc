import React from 'react';
import acImage from '../assets/types-of-air-conditioners.jpeg';
const Hero = () => {
  return (
    <section id="home" className="pt-20 bg-gradient-to-br from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Smart Energy Starts Here
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              HVAC systems consume 52% of building energy. Let's optimize your energy usage
              for a sustainable future.
            </p>
            <a
              href="#calculator"
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition duration-300"
            >
              Try Our AC Calculator
            </a>
          </div>
          <div className="md:w-1/2">
            <img
              src={acImage}
              alt="Smart Energy"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;