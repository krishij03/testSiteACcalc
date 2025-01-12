import React, { useState } from 'react';
import { Menu, X, Linkedin } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg fixed w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-emerald-600">Smart Energy</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-emerald-600">Home</a>
            <a href="#calculator" className="text-gray-700 hover:text-emerald-600">Calculator</a>
            <a href="#about" className="text-gray-700 hover:text-emerald-600">About</a>
            <a href="#sustainability" className="text-gray-700 hover:text-emerald-600">Sustainability</a>
            <a href="#contact" className="text-gray-700 hover:text-emerald-600">Contact</a>
            <a 
              href="https://www.linkedin.com/in/darsh-shah-b61333231/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700"
            >
              <Linkedin size={20} />
              <span>LinkedIn</span>
            </a>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#home" className="block px-3 py-2 text-gray-700 hover:text-emerald-600">Home</a>
              <a href="#calculator" className="block px-3 py-2 text-gray-700 hover:text-emerald-600">Calculator</a>
              <a href="#about" className="block px-3 py-2 text-gray-700 hover:text-emerald-600">About</a>
              <a href="#sustainability" className="block px-3 py-2 text-gray-700 hover:text-emerald-600">Sustainability</a>
              <a href="#contact" className="block px-3 py-2 text-gray-700 hover:text-emerald-600">Contact</a>
              <a 
                href="https://www.linkedin.com/in/darsh-shah-b61333231/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-2 text-emerald-600 hover:text-emerald-700"
              >
                <Linkedin size={20} />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;