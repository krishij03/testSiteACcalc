import React, { useState } from 'react';
import {
  DifficultyLevel,
  CalculatorInputs,
  CalculationBreakdown,
  CITY_DATA,
  APPLIANCES,
  U_FACTORS,
  CALCULATION_CONSTANTS,
  SOLAR_HEAT_GAIN,
  Direction,
  Window,
  Wall,
  RoofCondition
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

// Add medium difficulty defaults
const MEDIUM_DEFAULTS = {
  occupants: 3,
  roofCondition: 'exposed' as RoofCondition,
  // Preset windows and walls (not shown in UI for medium)
  windows: [
    { area: 15, direction: 'W' as Direction },
    { area: 15, direction: 'E' as Direction }
  ],
  walls: [
    { area: 120, direction: 'N' as Direction },
    { area: 100, direction: 'E' as Direction },
    { area: 120, direction: 'S' as Direction },
    { area: 100, direction: 'W' as Direction }
  ],
  appliances: {
    'Lights': 2,
    'Fan': 1
  }
};

const Calculator = () => {
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('low');
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [breakdown, setBreakdown] = useState<CalculationBreakdown | null>(null);
  const [showCalculations, setShowCalculations] = useState(false);

  const validateInputs = () => {
    // Basic validations
    if (!inputs.roomDimensions.length || !inputs.roomDimensions.breadth || !inputs.roomDimensions.height) {
      throw new Error('Room dimensions are required');
    }
    
    if (!inputs.city || !CITY_DATA[inputs.city]) {
      throw new Error('Valid city selection is required');
    }

    // Medium level validations
    if (difficultyLevel !== 'low') {
      if (!inputs.occupants || inputs.occupants < 1) {
        throw new Error('Number of occupants is required for medium/high difficulty');
      }
      
      if (!inputs.roofCondition) {
        throw new Error('Roof condition is required for medium/high difficulty');
      }
    }

    // High level validations
    if (difficultyLevel === 'high') {
      if (!inputs.windows || inputs.windows.length === 0) {
        throw new Error('Window details are required for high difficulty');
      }
      
      if (!inputs.walls || inputs.walls.length === 0) {
        throw new Error('Wall details are required for high difficulty');
      }
      
      if (!inputs.appliances || Object.keys(inputs.appliances).length === 0) {
        throw new Error('At least one appliance is required for high difficulty');
      }
    }
  };

  const calculateTonnage = () => {
    try {
      validateInputs();
      const cityData = CITY_DATA[inputs.city];
      const { length, breadth, height } = inputs.roomDimensions;

      // Use defaults based on difficulty level
      const occupants = inputs.occupants || (difficultyLevel === 'low' ? 2 : 3);
      const roofCondition = inputs.roofCondition || 'exposed';
      
      // For low difficulty, always use default windows
      const windows = difficultyLevel === 'low' 
        ? [{ area: 15, direction: 'W' }, { area: 15, direction: 'E' }]
        : inputs.windows;

      // For low difficulty, calculate wall areas automatically
      const walls = difficultyLevel === 'low'
        ? [
            { area: length * height, direction: 'N' as Direction },
            { area: breadth * height, direction: 'E' as Direction },
            { area: length * height, direction: 'S' as Direction },
            { area: breadth * height, direction: 'W' as Direction }
          ]
        : inputs.walls;

      // 1) ROOM VOLUME (as per report)
      const roomArea = length * breadth;
      const roomVolume = length * breadth * height;

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

      // 2) GLASS/WINDOW HEAT GAIN
      // Q_glass = Σ ( Window Area × directional ΔT × U_glass )
      if (windows) {
        breakdown.roomSensible.glass = windows.reduce((total, window) => {
          const deltaT = cityData.db - CALCULATION_CONSTANTS.indoorTemp;
          return total + (window.area * deltaT * U_FACTORS.glass);
        }, 0);
      } else if (difficultyLevel === 'low') {
        const defaultWindowArea = 15;
        const deltaT = cityData.db - CALCULATION_CONSTANTS.indoorTemp;
        breakdown.roomSensible.glass = 2 * (defaultWindowArea * deltaT * U_FACTORS.glass);
      }

      // 3) WALL HEAT GAIN
      // Q_wall = Σ ( Wall Area × ΔT × U_wall )
      const deltaT = cityData.db - CALCULATION_CONSTANTS.indoorTemp;
      if (walls) {
        breakdown.roomSensible.wall = walls.reduce((total, wall) => {
          return total + (wall.area * deltaT * U_FACTORS.wall);
        }, 0);
      } else {
        const wallArea = 2 * (length + breadth) * height;
        breakdown.roomSensible.wall = wallArea * deltaT * U_FACTORS.wall;
      }

      // 4) FLOOR HEAT
      // Q_floor = (Floor Area) × ΔT × U_floor
      breakdown.roomSensible.floor = roomArea * deltaT * U_FACTORS.floor;

      // 5) ROOF HEAT
      // Q_roof = (Roof Area) × ΔT × U_roof
      let roofUFactor = U_FACTORS.roofExposed; // default for uninsulated, exposed roof
      if (roofCondition) {
        switch (roofCondition) {
          case 'insulated': roofUFactor = U_FACTORS.roofInsulated; break;
          case 'shaded': roofUFactor = U_FACTORS.roofShaded; break;
          case 'water-covered': roofUFactor = U_FACTORS.roofWaterCovered; break;
        }
      }
      breakdown.roomSensible.roof = roomArea * deltaT * roofUFactor;

      // 6) PEOPLE HEAT (SENSIBLE)
      // Q_people_sensible = (Number of people) × 255
      breakdown.roomSensible.people = occupants * CALCULATION_CONSTANTS.personSensibleHeat;

      // 7) EQUIPMENT LOAD
      // Q_equipment = [ Σ (kW of each device) ] × 3410
      if (inputs.appliances && Object.keys(inputs.appliances).length > 0) {
        breakdown.roomSensible.equipment = Object.entries(inputs.appliances).reduce((total, [name, count]) => {
          const appliance = APPLIANCES.find(a => a.name === name);
          if (appliance) {
            return total + (appliance.wattage * count * CALCULATION_CONSTANTS.equipmentFactor);
          }
          return total;
        }, 0);
      } else if (difficultyLevel === 'low') {
        // Default for low difficulty: 2 lights at 0.1 kW each
        breakdown.roomSensible.equipment = 2 * 0.1 * CALCULATION_CONSTANTS.equipmentFactor;
      }

      // 8) LIGHTING LOAD
      // Q_lighting = 1.2 × (Floor Area) × 3.4
      breakdown.roomSensible.lighting = 
        CALCULATION_CONSTANTS.lightingLoadFactor * roomArea * CALCULATION_CONSTANTS.lightingConstant;

      // 9) SUM OF ROOM SENSIBLE GAINS
      const sensibleSubtotal = 
        breakdown.roomSensible.glass +
        breakdown.roomSensible.wall +
        breakdown.roomSensible.floor +
        breakdown.roomSensible.roof +
        breakdown.roomSensible.people +
        breakdown.roomSensible.equipment +
        breakdown.roomSensible.lighting;

      // 10) SUPPLY DUCT & FAN HEAT GAINS (7% total)
      breakdown.roomSensible.ductGain = sensibleSubtotal * CALCULATION_CONSTANTS.supplyDuctGain;
      breakdown.roomSensible.fanHeat = sensibleSubtotal * CALCULATION_CONSTANTS.fanHeatGain;
      breakdown.roomSensible.total = sensibleSubtotal * (1.07); // Combined 7%

      // 11) ROOM LATENT HEAT
      // Calculate Ventilation Rate
      const ventilation = inputs.infiltrationRate || Math.max(
        (roomVolume * CALCULATION_CONSTANTS.ventilationFactor) / 60,
        (occupants * CALCULATION_CONSTANTS.cfmPerPerson)
      );

      // People Latent Heat
      breakdown.roomLatent.people = occupants * CALCULATION_CONSTANTS.personLatentHeat.min;

      // Infiltration Latent Heat
      const deltaGrains = cityData.grPerLb - CALCULATION_CONSTANTS.indoorGrains;
      breakdown.roomLatent.infiltration = 
        ventilation * deltaGrains * CALCULATION_CONSTANTS.bypassFactor * CALCULATION_CONSTANTS.latentConstant;

      breakdown.roomLatent.total = breakdown.roomLatent.people + breakdown.roomLatent.infiltration;

      // 12) EFFECTIVE ROOM TOTAL HEAT
      const effectiveRoomTotal = breakdown.roomSensible.total + breakdown.roomLatent.total;

      // 13) OUTSIDE AIR HEAT
      breakdown.outsideAir.sensible = 
        ventilation * deltaT * (1 - CALCULATION_CONSTANTS.bypassFactor) * CALCULATION_CONSTANTS.sensibleConstant;
      
      breakdown.outsideAir.latent = 
        ventilation * deltaGrains * (1 - CALCULATION_CONSTANTS.bypassFactor) * CALCULATION_CONSTANTS.latentConstant;
      
      breakdown.outsideAir.total = breakdown.outsideAir.sensible + breakdown.outsideAir.latent;

      // 14) GRAND TOTAL HEAT SUBTOTAL
      breakdown.grandTotal.subtotal = effectiveRoomTotal + breakdown.outsideAir.total;

      // 15) OVERALL SAFETY FACTOR (3%)
      breakdown.grandTotal.safetyFactor = breakdown.grandTotal.subtotal * CALCULATION_CONSTANTS.safetyFactor;
      breakdown.grandTotal.final = breakdown.grandTotal.subtotal * (1 + CALCULATION_CONSTANTS.safetyFactor);

      // 16) TONNAGE CALCULATION
      breakdown.tonnage = breakdown.grandTotal.final / CALCULATION_CONSTANTS.tonConversion;

      setBreakdown(breakdown);
    } catch (error) {
      console.error('Calculation error:', error);
      // Handle error appropriately
    }
  };

  const handleDifficultyChange = (level: DifficultyLevel) => {
    setDifficultyLevel(level);
    
    switch(level) {
      case 'low':
        setInputs({
          ...DEFAULT_INPUTS,
          difficultyLevel: level
        });
        break;
        
      case 'medium':
        setInputs({
          ...inputs,
          difficultyLevel: level,
          occupants: MEDIUM_DEFAULTS.occupants,
          windows: MEDIUM_DEFAULTS.windows,
          walls: MEDIUM_DEFAULTS.walls,
          appliances: MEDIUM_DEFAULTS.appliances
        });
        break;
        
      case 'high':
        setInputs({
          ...inputs,
          difficultyLevel: level,
          windows: [],
          walls: [],
          occupants: undefined,
          appliances: {}
        });
        break;
    }
  };

  const renderDifficultySelector = () => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Choose Calculation Level</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['low', 'medium', 'high'] as DifficultyLevel[]).map((level) => (
          <button
            key={level}
            onClick={() => handleDifficultyChange(level)}
            className={`p-4 rounded-lg border-2 transition-all ${
              difficultyLevel === level
                ? 'border-emerald-600 bg-emerald-50'
                : 'border-gray-200 hover:border-emerald-400'
            }`}
          >
            <div className="font-semibold capitalize mb-2">{level}</div>
            <div className="text-sm text-gray-600">
              {level === 'low' && 'Basic calculation with preset values'}
              {level === 'medium' && 'Some customization with defaults'}
              {level === 'high' && 'Full customization of all parameters'}
            </div>
            {level === 'low' && (
              <div className="mt-2 text-xs text-gray-500">
                <p>• 2 windows (15 ft² each)</p>
                <p>• 2 occupants</p>
                <p>• Basic lighting only</p>
              </div>
            )}
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
        <div className="mt-2 text-sm text-gray-600 grid grid-cols-2 gap-2">
          <p>DB: {CITY_DATA[inputs.city].db}°F</p>
          <p>WB: {CITY_DATA[inputs.city].wb}°F</p>
          <p>RH: {CITY_DATA[inputs.city].rh}%</p>
          <p>Grains/lb: {CITY_DATA[inputs.city].grPerLb}</p>
        </div>
      </div>
    </div>
  );

  const renderMediumInputs = () => (
    <div className="space-y-6 mt-6">
      {/* Occupancy and Roof */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 mb-2">Number of Occupants</label>
          <input
            type="number"
            min="1"
            value={inputs.occupants || 3}
            onChange={(e) => setInputs({ ...inputs, occupants: Number(e.target.value) })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Roof Condition</label>
          <select
            value={inputs.roofCondition}
            onChange={(e) => setInputs({ ...inputs, roofCondition: e.target.value as RoofCondition })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          >
            <option value="exposed">Exposed</option>
            <option value="shaded">Shaded</option>
            <option value="insulated">Insulated</option>
            <option value="water-covered">Water Covered</option>
          </select>
        </div>
      </div>

      {/* Equipment Section */}
      <div>
        <h4 className="font-semibold mb-2">Equipment</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {APPLIANCES.map(appliance => (
            <div key={appliance.name} className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
              <label className="flex-grow">
                {appliance.name} ({appliance.wattage}kW)
              </label>
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

  const renderHighInputs = () => (
    <div className="space-y-6 mt-6">
      {/* Window Settings */}
      <div>
        <h4 className="font-semibold mb-2">Windows</h4>
        <div className="space-y-4">
          {(inputs.windows || []).map((window, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-gray-700 mb-2">Window {index + 1} Area (ft²)</label>
                <input
                  type="number"
                  min="0"
                  value={window.area}
                  onChange={(e) => {
                    const newWindows = [...(inputs.windows || [])];
                    newWindows[index] = { ...window, area: Number(e.target.value) };
                    setInputs({ ...inputs, windows: newWindows });
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Direction</label>
                <select
                  value={window.direction}
                  onChange={(e) => {
                    const newWindows = [...(inputs.windows || [])];
                    newWindows[index] = { ...window, direction: e.target.value as Direction };
                    setInputs({ ...inputs, windows: newWindows });
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                >
                  {(['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW'] as Direction[]).map(dir => (
                    <option key={dir} value={dir}>{dir}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    const newWindows = inputs.windows?.filter((_, i) => i !== index) || [];
                    setInputs({ ...inputs, windows: newWindows });
                  }}
                  className="w-full p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  Remove Window
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newWindows = [...(inputs.windows || []), { area: 15, direction: 'W' as Direction }];
              setInputs({ ...inputs, windows: newWindows });
            }}
            className="w-full p-2 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100"
          >
            Add Window
          </button>
        </div>
      </div>

      {/* Wall Settings */}
      <div>
        <h4 className="font-semibold mb-2">Walls</h4>
        <div className="space-y-4">
          {(inputs.walls || []).map((wall, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-gray-700 mb-2">Wall {index + 1} Area (ft²)</label>
                <input
                  type="number"
                  min="0"
                  value={wall.area}
                  onChange={(e) => {
                    const newWalls = [...(inputs.walls || [])];
                    newWalls[index] = { ...wall, area: Number(e.target.value) };
                    setInputs({ ...inputs, walls: newWalls });
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Direction</label>
                <select
                  value={wall.direction}
                  onChange={(e) => {
                    const newWalls = [...(inputs.walls || [])];
                    newWalls[index] = { ...wall, direction: e.target.value as Direction };
                    setInputs({ ...inputs, walls: newWalls });
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                >
                  {(['N', 'S', 'E', 'W'] as Direction[]).map(dir => (
                    <option key={dir} value={dir}>{dir}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    const newWalls = inputs.walls?.filter((_, i) => i !== index) || [];
                    setInputs({ ...inputs, walls: newWalls });
                  }}
                  className="w-full p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  Remove Wall
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newWalls = [...(inputs.walls || []), { area: 0, direction: 'N' as Direction }];
              setInputs({ ...inputs, walls: newWalls });
            }}
            className="w-full p-2 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100"
          >
            Add Wall
          </button>
        </div>
      </div>

      {/* Special Infiltration Rate */}
      <div>
        <label className="block text-gray-700 mb-2">Special Infiltration Rate (optional)</label>
        <input
          type="number"
          min="0"
          value={inputs.infiltrationRate || ''}
          onChange={(e) => setInputs({
            ...inputs,
            infiltrationRate: Number(e.target.value)
          })}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          Leave empty to use standard calculation method
        </p>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!breakdown) return null;

    return (
      <div className="mt-8 space-y-6 bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-emerald-600 mb-4">
            Recommended AC Size: {Math.ceil(breakdown.tonnage * 2) / 2} Tons
          </h3>
          
          <button
            onClick={() => setShowCalculations(!showCalculations)}
            className="mt-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
          >
            {showCalculations ? 'Hide Calculations' : 'Show Detailed Calculations'}
          </button>
        </div>

        {showCalculations && (
          <div className="space-y-6 mt-4">
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-4">Step 1: Room Sensible Heat</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="text-emerald-600">Supply Duct Gain (2%):</div>
                    <div className="text-emerald-600">{breakdown.roomSensible.ductGain.toFixed(2)} BTU/hr</div>
                    <div className="text-emerald-600">Fan Heat Gain (5%):</div>
                    <div className="text-emerald-600">{breakdown.roomSensible.fanHeat.toFixed(2)} BTU/hr</div>
                    <div className="font-semibold border-t pt-2">Total Sensible Heat:</div>
                    <div className="font-semibold border-t pt-2">{breakdown.roomSensible.total.toFixed(2)} BTU/hr</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-4">Step 2: Room Latent Heat</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>People Latent Heat:</div>
                    <div>{breakdown.roomLatent.people.toFixed(2)} BTU/hr</div>
                    <div>Infiltration Heat:</div>
                    <div>{breakdown.roomLatent.infiltration.toFixed(2)} BTU/hr</div>
                    <div className="font-semibold border-t pt-2">Total Latent Heat:</div>
                    <div className="font-semibold border-t pt-2">{breakdown.roomLatent.total.toFixed(2)} BTU/hr</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-4">Step 3: Outside Air Heat</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>Outside Air Sensible:</div>
                    <div>{breakdown.outsideAir.sensible.toFixed(2)} BTU/hr</div>
                    <div>Outside Air Latent:</div>
                    <div>{breakdown.outsideAir.latent.toFixed(2)} BTU/hr</div>
                    <div className="font-semibold border-t pt-2">Total Outside Air Heat:</div>
                    <div className="font-semibold border-t pt-2">{breakdown.outsideAir.total.toFixed(2)} BTU/hr</div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-4">Step 4: Grand Total Heat</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>Room Sensible Heat:</div>
                    <div>{breakdown.roomSensible.total.toFixed(2)} BTU/hr</div>
                    <div>Room Latent Heat:</div>
                    <div>{breakdown.roomLatent.total.toFixed(2)} BTU/hr</div>
                    <div>Outside Air Heat:</div>
                    <div>{breakdown.outsideAir.total.toFixed(2)} BTU/hr</div>
                    <div className="font-semibold">Subtotal:</div>
                    <div className="font-semibold">{breakdown.grandTotal.subtotal.toFixed(2)} BTU/hr</div>
                    <div className="text-emerald-600">Safety Factor (3%):</div>
                    <div className="text-emerald-600">{breakdown.grandTotal.safetyFactor.toFixed(2)} BTU/hr</div>
                    <div className="font-semibold text-lg border-t pt-2">Final Total Heat:</div>
                    <div className="font-semibold text-lg border-t pt-2">{breakdown.grandTotal.final.toFixed(2)} BTU/hr</div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-4">Step 5: Tonnage Calculation</h4>
                <div className="text-sm">
                  <p>Final Total Heat ÷ 12,000 BTU/hr/ton = {breakdown.tonnage.toFixed(3)} Tons</p>
                  <p className="font-semibold mt-2">Recommended Size (rounded up to nearest 0.5 ton):</p>
                  <p className="text-2xl font-bold text-emerald-700">{Math.ceil(breakdown.tonnage * 2) / 2} Tons</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section id="calculator" className="py-12 bg-gray-50">
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

          <div className="mt-6 text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Important Notes:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>All calculations are based on ASHRAE standards and industry best practices</li>
              <li>Room dimensions should be in feet (ft)</li>
              <li>Window areas should be in square feet (ft²)</li>
              <li>Final tonnage is rounded up to the nearest 0.5 ton for practical sizing</li>
              <li>For most accurate results, consider using the high difficulty level</li>
              <li>Consult with an HVAC professional for final verification</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;