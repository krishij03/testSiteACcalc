import React, { useState } from 'react';
import { 
  CustomizationLevel, 
  CalculatorInputs, 
  DEFAULT_VALUES,
  FloorLevel,
  WindowOrientation,
  InsulationQuality,
  RoomUsage,
  BuildingMaterial
} from '../types/calculator';
import { motion, AnimatePresence } from 'framer-motion';

const Calculator = () => {
  const [customizationLevel, setCustomizationLevel] = useState<CustomizationLevel>('low');
  const [inputs, setInputs] = useState<CalculatorInputs>({
    customizationLevel: 'low',
    roomDimensions: DEFAULT_VALUES.roomDimensions,
    location: DEFAULT_VALUES.location,
  });
  const [result, setResult] = useState<number | null>(null);

  const calculateTonnage = () => {
    let totalBTU = 0;
    
    // 1. Room Area Load
    const roomArea = inputs.roomDimensions.length * inputs.roomDimensions.width;
    totalBTU += roomArea * 20;

    // 2. Ceiling Height Adjustment
    if (inputs.roomDimensions.height > 10) {
      totalBTU *= 1.1;
    }

    // 3. Occupant Load
    if (inputs.occupants) {
      totalBTU += inputs.occupants * 600;
    }

    // 4. Window Load
    if (inputs.windowDetails?.area) {
      const windowLoadFactor = {
        south: 200,
        east: 150,
        west: 150,
        north: 100,
      }[inputs.windowDetails.orientation || 'south'];
      
      totalBTU += inputs.windowDetails.area * windowLoadFactor;
    }

    // 5. Appliance Load
    if (inputs.applianceLoad) {
      totalBTU += inputs.applianceLoad * 3.41;
    }

    // 6. Wall Insulation Adjustment
    if (inputs.insulationQuality) {
      const insulationFactor = {
        poor: 1.1,
        average: 1.05,
        good: 1.0,
      }[inputs.insulationQuality];
      
      totalBTU *= insulationFactor;
    }

    // 7. Sunlight Exposure
    if (inputs.sunlightHours) {
      totalBTU += inputs.sunlightHours * 1000;
    }

    // 8. Ventilation Load
    if (inputs.ventilationRate) {
      totalBTU += inputs.ventilationRate * 200;
    }

    // Additional factors
    if (inputs.hasKitchen) {
      totalBTU += 1200; // Additional load for kitchen
    }

    if (inputs.hasRoofExposure) {
      totalBTU *= 1.1; // 10% increase for roof exposure
    }

    // Convert BTU to Tons
    const tons = totalBTU / 12000;
    setResult(tons);
  };

  const renderLowLevelInputs = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-gray-700 mb-2">Room Length (ft)</label>
          <input
            type="number"
            value={inputs.roomDimensions.length}
            onChange={(e) => setInputs({
              ...inputs,
              roomDimensions: { ...inputs.roomDimensions, length: Number(e.target.value) }
            })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Room Width (ft)</label>
          <input
            type="number"
            value={inputs.roomDimensions.width}
            onChange={(e) => setInputs({
              ...inputs,
              roomDimensions: { ...inputs.roomDimensions, width: Number(e.target.value) }
            })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Ceiling Height (ft)</label>
          <input
            type="number"
            value={inputs.roomDimensions.height}
            onChange={(e) => setInputs({
              ...inputs,
              roomDimensions: { ...inputs.roomDimensions, height: Number(e.target.value) }
            })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-gray-700 mb-2">Location</label>
        <select
          value={inputs.location}
          onChange={(e) => setInputs({ ...inputs, location: e.target.value })}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
        >
          <option value="Mumbai">Mumbai</option>
          <option value="Delhi">Delhi</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Chennai">Chennai</option>
          <option value="Kolkata">Kolkata</option>
        </select>
      </div>
    </div>
  );

  const renderMediumLevelInputs = () => (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 mb-2">Number of Occupants</label>
          <input
            type="number"
            value={inputs.occupants || DEFAULT_VALUES.occupants}
            onChange={(e) => setInputs({ ...inputs, occupants: Number(e.target.value) })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Window Area (sq ft)</label>
          <input
            type="number"
            value={inputs.windowDetails?.area || DEFAULT_VALUES.windowArea}
            onChange={(e) => setInputs({
              ...inputs,
              windowDetails: { ...inputs.windowDetails, area: Number(e.target.value) }
            })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 mb-2">Floor Level</label>
          <select
            value={inputs.floorLevel || DEFAULT_VALUES.floorLevel}
            onChange={(e) => setInputs({ ...inputs, floorLevel: e.target.value as FloorLevel })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ground">Ground Floor</option>
            <option value="middle">Middle Floor</option>
            <option value="top">Top Floor</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Kitchen in Room?</label>
          <div className="flex items-center space-x-4 mt-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={inputs.hasKitchen === true}
                onChange={() => setInputs({ ...inputs, hasKitchen: true })}
                className="form-radio text-emerald-600"
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={inputs.hasKitchen === false}
                onChange={() => setInputs({ ...inputs, hasKitchen: false })}
                className="form-radio text-emerald-600"
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHighLevelInputs = () => (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-gray-700 mb-2">Window Orientation</label>
          <select
            value={inputs.windowDetails?.orientation || DEFAULT_VALUES.windowOrientation}
            onChange={(e) => setInputs({
              ...inputs,
              windowDetails: { ...inputs.windowDetails, orientation: e.target.value as WindowOrientation }
            })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          >
            <option value="north">North</option>
            <option value="south">South</option>
            <option value="east">East</option>
            <option value="west">West</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Wall Insulation</label>
          <select
            value={inputs.insulationQuality || DEFAULT_VALUES.insulationQuality}
            onChange={(e) => setInputs({ ...inputs, insulationQuality: e.target.value as InsulationQuality })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          >
            <option value="poor">Poor</option>
            <option value="average">Average</option>
            <option value="good">Good</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Room Usage</label>
          <select
            value={inputs.roomUsage || DEFAULT_VALUES.roomUsage}
            onChange={(e) => setInputs({ ...inputs, roomUsage: e.target.value as RoomUsage })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          >
            <option value="residential">Residential</option>
            <option value="office">Office</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-gray-700 mb-2">Appliance Load (Watts)</label>
          <input
            type="number"
            value={inputs.applianceLoad || DEFAULT_VALUES.applianceLoad}
            onChange={(e) => setInputs({ ...inputs, applianceLoad: Number(e.target.value) })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Sunlight Hours</label>
          <input
            type="number"
            value={inputs.sunlightHours || DEFAULT_VALUES.sunlightHours}
            onChange={(e) => setInputs({ ...inputs, sunlightHours: Number(e.target.value) })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Ventilation Rate (ACH)</label>
          <input
            type="number"
            step="0.1"
            value={inputs.ventilationRate || DEFAULT_VALUES.ventilationRate}
            onChange={(e) => setInputs({ ...inputs, ventilationRate: Number(e.target.value) })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 mb-2">Building Material</label>
          <select
            value={inputs.buildingMaterial || DEFAULT_VALUES.buildingMaterial}
            onChange={(e) => setInputs({ ...inputs, buildingMaterial: e.target.value as BuildingMaterial })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          >
            <option value="concrete">Concrete</option>
            <option value="brick">Brick</option>
            <option value="wood">Wood</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Roof Exposure</label>
          <div className="flex items-center space-x-4 mt-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={inputs.hasRoofExposure === true}
                onChange={() => setInputs({ ...inputs, hasRoofExposure: true })}
                className="form-radio text-emerald-600"
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={inputs.hasRoofExposure === false}
                onChange={() => setInputs({ ...inputs, hasRoofExposure: false })}
                className="form-radio text-emerald-600"
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="calculator" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">AC Tonnage Calculator</h2>
        
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          {/* Customization Level Selector */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Choose Customization Level</h3>
            <div className="grid grid-cols-3 gap-4">
              {(['low', 'medium', 'high'] as CustomizationLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setCustomizationLevel(level);
                    setInputs(prev => ({
                      ...prev,
                      customizationLevel: level
                    }));
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    customizationLevel === level
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-400'
                  }`}
                >
                  <div className="font-semibold capitalize mb-2">{level}</div>
                  <div className="text-sm text-gray-600">
                    {level === 'low' && 'Basic calculation with minimal inputs'}
                    {level === 'medium' && 'Balanced inputs for better accuracy'}
                    {level === 'high' && 'Detailed inputs for precise results'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-6">
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {renderLowLevelInputs()}
              {customizationLevel !== 'low' && renderMediumLevelInputs()}
              {customizationLevel === 'high' && renderHighLevelInputs()}

              <div className="mt-8">
                <button
                  onClick={calculateTonnage}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition duration-300"
                >
                  Calculate AC Tonnage
                </button>
              </div>
            </motion.div>

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 p-6 bg-emerald-50 rounded-lg"
                >
                  <h3 className="text-xl font-semibold mb-2">Recommended AC Tonnage:</h3>
                  <p className="text-3xl text-emerald-600 font-bold">
                    {Math.ceil(result * 2) / 2} Tons
                  </p>
                  <p className="mt-2 text-gray-600">
                    This calculation is based on your input parameters and standard cooling load factors.
                    For the most accurate results, please consult with an HVAC professional.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;