import React from 'react';
import { motion } from 'framer-motion';
import { Zap, DollarSign, LineChart, Lightbulb, IndianRupee } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, index }: { 
  icon: React.ElementType, 
  title: string, 
  description: string,
  index: number 
}) => (
  <motion.div 
    className="p-6 bg-white rounded-lg shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.2, duration: 0.5 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
  >
    <motion.div 
      className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4"
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.6 }}
    >
      <Icon className="w-6 h-6 text-emerald-600" />
    </motion.div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Energy Efficiency",
      description: "HVAC systems consume 52% of building energy. Optimize your usage with our smart calculator."
    },
    {
      icon: IndianRupee,
      title: "Cost Savings",
      description: "Reduce your electricity bills by choosing the right AC capacity for your space."
    },
    {
      icon: LineChart,
      title: "Accurate Calculations",
      description: "Our calculator considers multiple factors including room size, sunlight exposure, and occupancy."
    },
    {
      icon: Lightbulb,
      title: "Smart Recommendations",
      description: "Get personalized suggestions for optimal AC tonnage based on your specific requirements."
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Smart Energy?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;