import React from 'react';
import { motion } from 'framer-motion';
import acImage from '../assets/types-of-air-conditioners.jpeg';
import { Calculator } from 'lucide-react';

const Hero = () => {
  // Cost calculations
  const costCalculations = {
    wrongTonnage: {
      tons: 2.0,  // Oversized example
      hoursPerDay: 8,
      daysPerMonth: 30,
      monthsPerYear: 6, // AC usage months in India
      powerConsumptionPerTon: 1.2, // kW per ton (average)
      electricityRate: 8, // Rs per kWh (average in urban areas)
    },
    rightTonnage: {
      tons: 1.5,  // Correctly sized example
      hoursPerDay: 8,
      daysPerMonth: 30,
      monthsPerYear: 6,
      powerConsumptionPerTon: 1.2,
      electricityRate: 8,
    }
  };

  // Calculate annual costs
  const calculateAnnualCost = (params: typeof costCalculations.rightTonnage) => {
    const dailyKwh = params.tons * params.powerConsumptionPerTon * params.hoursPerDay;
    const monthlyKwh = dailyKwh * params.daysPerMonth;
    const annualKwh = monthlyKwh * params.monthsPerYear;
    return annualKwh * params.electricityRate;
  };

  const wrongSizedCost = calculateAnnualCost(costCalculations.wrongTonnage);
  const rightSizedCost = calculateAnnualCost(costCalculations.rightTonnage);
  const annualSavings = wrongSizedCost - rightSizedCost;
  const savingsPercentage = ((annualSavings / wrongSizedCost) * 100).toFixed(1);

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

            {/* Cost Savings Section */}
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div className="text-left space-y-4">
                <h3 className="text-xl font-semibold text-emerald-600 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Annual Cost Savings with Right AC Size
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Oversized AC (2.0 Ton)</p>
                    <p className="font-semibold">₹{wrongSizedCost.toLocaleString('en-IN')}/year</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Right-sized AC (1.5 Ton)</p>
                    <p className="font-semibold">₹{rightSizedCost.toLocaleString('en-IN')}/year</p>
                  </div>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-emerald-700 font-bold">
                    Save ₹{annualSavings.toLocaleString('en-IN')} per year
                  </p>
                  <p className="text-sm text-emerald-600">
                    That's {savingsPercentage}% reduction in your AC electricity bill!
                  </p>
                </div>
                <ul className="text-xs text-gray-500 list-disc list-inside">
                  <li>Based on {costCalculations.wrongTonnage.hoursPerDay} hours daily usage</li>
                  <li>Calculated for {costCalculations.wrongTonnage.monthsPerYear} months of AC season</li>
                  <li>Average electricity rate: ₹{costCalculations.wrongTonnage.electricityRate}/kWh</li>
                  <li>Includes standard power consumption of {costCalculations.wrongTonnage.powerConsumptionPerTon}kW per ton</li>
                </ul>
              </div>
            </motion.div>

            <motion.a
              href="#calculator"
              className="inline-block bg-emerald-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-emerald-700 transition duration-300 text-base sm:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Calculate Your AC Size
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