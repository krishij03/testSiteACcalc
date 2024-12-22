import React, { useState } from 'react';
import {
  DifficultyLevel,
  CalculatorInputs,
  CalculationBreakdown,
  CITY_DATA,
  APPLIANCES,
  U_FACTORS,
  HEAT_CONSTANTS,
  SAFETY_FACTORS,
  SOLAR_HEAT_GAIN,
  Direction,
  Window,
  Wall
} from '../types/calculator';

const DEFAULT_INPUTS: CalculatorInputs = {
  difficultyLevel: 'low',
  roomDimensions: {
    length: 15,
    breadth: 12,
    height: 10
  },
  city: 'Mumbai',
  windows: [
    { area: 15, direction: 'W' },
    { area: 15, direction: 'E' }
  ],
  occupants: 2,
  roofCondition: 'exposed',
  appliances: {
    'Lights': 2
  }
};

const Calculator = () => {
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('low');
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [breakdown, setBreakdown] = useState<CalculationBreakdown | null>(null);

  const calculateTonnage = () => {
    const cityData = CITY_DATA[inputs.city];
    const { length, breadth, height } = inputs.roomDimensions;
    const roomArea = length * breadth;
    const roomVolume = roomArea * height;

    // Initialize breakdown structure
    const breakdown: CalculationBreakdown = {
      roomSensible: {
        glass: 0,
        wall: 0,
        floor: 0,
        roof: 0,
        people: 0,
        equipment: 0,
        lighting: 0,
        ductGain: 0,
        fanHeat: 0,
        total: 0
      },
      roomLatent: {
        people: 0,
        infiltration: 0,
        total: 0
      },
      outsideAir: {
        sensible: 0,
        latent: 0,
        total: 0
      },
      grandTotal: {
        subtotal: 0,
        safetyFactor: 0,
        final: 0
      },
      tonnage: 0
    };

    // 1. Room Sensible Heat Calculations
    
    // Glass Heat
    if (inputs.windows) {
      breakdown.roomSensible.glass = inputs.windows.reduce((total, window) => {
        return total + (window.area * SOLAR_HEAT_GAIN[window.direction] * U_FACTORS.glass);
      }, 0);
    }

    // Wall Heat
    const wallArea = 2 * (length + breadth) * height;
    breakdown.roomSensible.wall = wallArea * cityData.drange * U_FACTORS.wall;

    // Floor Heat
    breakdown.roomSensible.floor = roomArea * cityData.drange * U_FACTORS.floor;

    // Roof Heat
    const roofUFactor = inputs.roofCondition === 'insulated' ? U_FACTORS.roofInsulated : U_FACTORS.roofUninsulated;
    breakdown.roomSensible.roof = roomArea * cityData.drange * roofUFactor;

    // People Sensible Heat
    breakdown.roomSensible.people = (inputs.occupants || 2) * HEAT_CONSTANTS.personSensible;

    // Equipment Heat
    if (inputs.appliances) {
      breakdown.roomSensible.equipment = Object.entries(inputs.appliances).reduce((total, [name, count]) => {
        const appliance = APPLIANCES.find(a => a.name === name);
        if (appliance) {
          return total + (appliance.wattage * count * HEAT_CONSTANTS.equipmentFactor);
        }
        return total;
      }, 0);
    }

    // Lighting Heat
    breakdown.roomSensible.lighting = HEAT_CONSTANTS.lightingLoad * roomArea * HEAT_CONSTANTS.lightingFactor;

    // Subtotal before gains
    const sensibleSubtotal = Object.values(breakdown.roomSensible).reduce((a, b) => a + b, 0);

    // Duct and Fan Heat Gains
    breakdown.roomSensible.ductGain = sensibleSubtotal * SAFETY_FACTORS.supplyDuct;
    breakdown.roomSensible.fanHeat = sensibleSubtotal * SAFETY_FACTORS.fanHeat;
    breakdown.roomSensible.total = sensibleSubtotal + breakdown.roomSensible.ductGain + breakdown.roomSensible.fanHeat;

    // 2. Room Latent Heat Calculations
    const ventByArea = (roomVolume * HEAT_CONSTANTS.ventilationFactor) / 60;
    const ventByPeople = (inputs.occupants || 2) * HEAT_CONSTANTS.cfmPerPerson;
    const ventilation = Math.max(ventByArea, ventByPeople);

    breakdown.roomLatent.people = (inputs.occupants || 2) * HEAT_CONSTANTS.personLatent;
    breakdown.roomLatent.infiltration = ventilation * (cityData.grPerLb - HEAT_CONSTANTS.indoorGrains) * 
      HEAT_CONSTANTS.latentConstant * HEAT_CONSTANTS.bypassFactor;
    breakdown.roomLatent.total = breakdown.roomLatent.people + breakdown.roomLatent.infiltration;

    // 3. Outside Air Heat
    breakdown.outsideAir.sensible = ventilation * cityData.drange * 
      (1 - HEAT_CONSTANTS.bypassFactor) * HEAT_CONSTANTS.sensibleConstant;
    
    breakdown.outsideAir.latent = ventilation * (cityData.grPerLb - HEAT_CONSTANTS.indoorGrains) * 
      (1 - HEAT_CONSTANTS.bypassFactor) * HEAT_CONSTANTS.latentConstant;
    
    breakdown.outsideAir.total = breakdown.outsideAir.sensible + breakdown.outsideAir.latent;

    // 4. Grand Total Calculations
    breakdown.grandTotal.subtotal = breakdown.roomSensible.total + 
      breakdown.roomLatent.total + breakdown.outsideAir.total;
    
    breakdown.grandTotal.safetyFactor = breakdown.grandTotal.subtotal * SAFETY_FACTORS.overall;
    breakdown.grandTotal.final = breakdown.grandTotal.subtotal + breakdown.grandTotal.safetyFactor;

    // 5. Final Tonnage
    breakdown.tonnage = breakdown.grandTotal.final / HEAT_CONSTANTS.tonConversion;

    setBreakdown(breakdown);
  };

  const renderDifficultySelector = () => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Choose Calculation Level</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['low', 'medium', 'high'] as DifficultyLevel[]).map((level) => (
          <button
            key={level}
            onClick={() => {
              setDifficultyLevel(level);
              setInputs({ ...inputs, difficultyLevel: level });
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              difficultyLevel === level
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
  );

  const renderBasicInputs = () => (
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
          <label className="block text-gray-700 mb-2">Room Breadth (ft)</label>
          <input
            type="number"
            value={inputs.roomDimensions.breadth}
            onChange={(e) => setInputs({
              ...inputs,
              roomDimensions: { ...inputs.roomDimensions, breadth: Number(e.target.value) }
            })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Room Height (ft)</label>
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
        <label className="block text-gray-700 mb-2">City</label>
        <select
          value={inputs.city}
          onChange={(e) => setInputs({ ...inputs, city: e.target.value })}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
        >
          {Object.keys(CITY_DATA).map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        {/* Show selected city's data */}
        <div className="mt-2 text-sm text-gray-600">
          <p>DB: {CITY_DATA[inputs.city].db}°F, WB: {CITY_DATA[inputs.city].wb}°F</p>
          <p>RH: {CITY_DATA[inputs.city].rh}%, Grains/lb: {CITY_DATA[inputs.city].grPerLb}</p>
        </div>
      </div>
    </div>
  );

  const renderMediumInputs = () => (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 mb-2">Number of Occupants</label>
          <input
            type="number"
            value={inputs.occupants || 2}
            onChange={(e) => setInputs({ ...inputs, occupants: Number(e.target.value) })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Roof Condition</label>
          <select
            value={inputs.roofCondition}
            onChange={(e) => setInputs({ ...inputs, roofCondition: e.target.value as any })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          >
            <option value="exposed">Exposed</option>
            <option value="shaded">Shaded</option>
            <option value="insulated">Insulated</option>
            <option value="water-covered">Water Covered</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderHighInputs = () => (
    <div className="space-y-6 mt-6">
      <div>
        <h4 className="font-semibold mb-2">Appliances</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {APPLIANCES.map(appliance => (
            <div key={appliance.name} className="flex items-center space-x-2">
              <label className="flex-grow">{appliance.name}</label>
              <input
                type="number"
                min="0"
                value={inputs.appliances?.[appliance.name] || 0}
                onChange={(e) => setInputs({
                  ...inputs,
                  appliances: {
                    ...inputs.appliances,
                    [appliance.name]: Number(e.target.value)
                  }
                })}
                className="w-20 p-2 border rounded focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!breakdown) return null;

    return (
      <div className="mt-8 space-y-6 bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-emerald-600">
            Recommended AC Size: {Math.ceil(breakdown.tonnage * 2) / 2} Tons
          </h3>
        </div>

        {/* Room Sensible Heat Breakdown */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-4">Room Sensible Heat</h4>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Glass Heat:</div>
              <div>{breakdown.roomSensible.glass.toFixed(2)} BTU/hr</div>
              <div>Wall Heat:</div>
              <div>{breakdown.roomSensible.wall.toFixed(2)} BTU/hr</div>
              <div>Floor Heat:</div>
              <div>{breakdown.roomSensible.floor.toFixed(2)} BTU/hr</div>
              <div>Roof Heat:</div>
              <div>{breakdown.roomSensible.roof.toFixed(2)} BTU/hr</div>
              <div>People Heat:</div>
              <div>{breakdown.roomSensible.people.toFixed(2)} BTU/hr</div>
              <div>Equipment Heat:</div>
              <div>{breakdown.roomSensible.equipment.toFixed(2)} BTU/hr</div>
              <div>Lighting Heat:</div>
              <div>{breakdown.roomSensible.lighting.toFixed(2)} BTU/hr</div>
              <div>Duct Gain:</div>
              <div>{breakdown.roomSensible.ductGain.toFixed(2)} BTU/hr</div>
              <div>Fan Heat:</div>
              <div>{breakdown.roomSensible.fanHeat.toFixed(2)} BTU/hr</div>
              <div className="font-semibold">Total Sensible Heat:</div>
              <div className="font-semibold">{breakdown.roomSensible.total.toFixed(2)} BTU/hr</div>
            </div>
          </div>
        </div>

        {/* Room Latent Heat Breakdown */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-4">Room Latent Heat</h4>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>People Latent Heat:</div>
              <div>{breakdown.roomLatent.people.toFixed(2)} BTU/hr</div>
              <div>Infiltration Heat:</div>
              <div>{breakdown.roomLatent.infiltration.toFixed(2)} BTU/hr</div>
              <div className="font-semibold">Total Latent Heat:</div>
              <div className="font-semibold">{breakdown.roomLatent.total.toFixed(2)} BTU/hr</div>
            </div>
          </div>
        </div>

        {/* Outside Air Heat */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-4">Outside Air Heat</h4>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Sensible Heat:</div>
              <div>{breakdown.outsideAir.sensible.toFixed(2)} BTU/hr</div>
              <div>Latent Heat:</div>
              <div>{breakdown.outsideAir.latent.toFixed(2)} BTU/hr</div>
              <div className="font-semibold">Total Outside Air Heat:</div>
              <div className="font-semibold">{breakdown.outsideAir.total.toFixed(2)} BTU/hr</div>
            </div>
          </div>
        </div>

        {/* Grand Total */}
        <div className="bg-emerald-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-4">Grand Total Heat</h4>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Subtotal:</div>
              <div>{breakdown.grandTotal.subtotal.toFixed(2)} BTU/hr</div>
              <div>Safety Factor (3%):</div>
              <div>{breakdown.grandTotal.safetyFactor.toFixed(2)} BTU/hr</div>
              <div className="font-semibold text-lg">Final Total Heat:</div>
              <div className="font-semibold text-lg">{breakdown.grandTotal.final.toFixed(2)} BTU/hr</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">AC Tonnage Calculator</h2>
        <div className="max-w-4xl mx-auto">
          {renderDifficultySelector()}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {renderBasicInputs()}
            {difficultyLevel !== 'low' && renderMediumInputs()}
            {difficultyLevel === 'high' && renderHighInputs()}
            
            <div className="mt-8">
              <button
                onClick={calculateTonnage}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition duration-300"
              >
                Calculate AC Tonnage
              </button>
            </div>
          </div>
          {renderResults()}
        </div>
      </div>
    </section>
  );
};

export default Calculator;