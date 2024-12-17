import React from 'react';
import { Leaf, Sun, Wind } from 'lucide-react';

const Sustainability = () => {
  return (
    <section id="sustainability" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Sustainability Tips</h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Switch to Energy-Efficient Appliances</h3>
                <p className="text-gray-600">
                  Energy-efficient appliances consume significantly less power than traditional ones, 
                  helping reduce electricity bills and lower carbon emissions. Look for appliances 
                  with high energy ratings to maximize savings and sustainability.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Sun className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Leverage Natural Light and Ventilation</h3>
                <p className="text-gray-600">
                  Maximize the use of natural sunlight and airflow to reduce energy dependency. 
                  Designing spaces with large windows for daylight and cross-ventilation can lower 
                  the need for artificial lighting and air conditioning.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Wind className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Importance of Energy Modeling</h3>
                <p className="text-gray-600">
                  Energy modeling helps forecast consumption patterns and identify inefficiencies. 
                  By simulating real-world energy usage, it offers actionable insights for 
                  optimizing energy-saving strategies in homes and businesses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sustainability;