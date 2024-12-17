import React from 'react';
import { Home, User, Leaf, MessageSquare } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import ACCalculator from './components/Calculator';
import About from './components/About';
import Sustainability from './components/Sustainability';
import Contact from './components/Contact';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ACCalculator />
        <About />
        <Sustainability />
        <Contact />
      </main>
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 Smart Energy. Created by Darsh Shah</p>
        </div>
      </footer>
    </div>
  );
}

export default App;