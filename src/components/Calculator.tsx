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
import CalculationVisuals from './CalculationVisuals';
import TemperatureVisuals from './TemperatureVisuals';
import HeatFlowVisuals from './HeatFlowVisuals';
import DetailedCalculations from './DetailedCalculations';

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
  occupants: 3,
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

    // Medium and High level validations
    if (difficultyLevel !== 'low') {
      // For high difficulty, check if occupants exist in inputs
      if (difficultyLevel === 'high') {
        // Initialize arrays if they don't exist
        if (!inputs.windows) {
          inputs.windows = [];
        }
        if (!inputs.walls) {
          inputs.walls = [];
        }
        // For high difficulty, set default occupants if not provided
        if (!inputs.occupants) {
          inputs.occupants = 3; // Default value for high difficulty
        }

        // Validate windows if any exist
        inputs.windows.forEach((window, index) => {
          if (!window.area || window.area <= 0) {
            throw new Error(`Window ${index + 1} area must be greater than 0`);
          }
          if (!window.direction) {
            throw new Error(`Window ${index + 1} direction is required`);
          }
        });

        // Validate walls if any exist
        inputs.walls.forEach((wall, index) => {
          if (!wall.area || wall.area <= 0) {
            throw new Error(`Wall ${index + 1} area must be greater than 0`);
          }
          if (!wall.direction) {
            throw new Error(`Wall ${index + 1} direction is required`);
          }
        });
      } else {
        // For medium difficulty, use default of 3
        if (!inputs.occupants) {
          inputs.occupants = 3;
        }
      }
      
      if (!inputs.roofCondition) {
        inputs.roofCondition = 'exposed';
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
      
      // For high difficulty, use provided arrays or empty arrays
      const windows = difficultyLevel === 'high' 
        ? (inputs.windows || [])
        : (difficultyLevel === 'low' 
            ? [{ area: 15, direction: 'W' as Direction }, { area: 15, direction: 'E' as Direction }]
            : MEDIUM_DEFAULTS.windows);

      const walls = difficultyLevel === 'high'
        ? (inputs.walls || [])
        : (difficultyLevel === 'low'
            ? [
                { area: length * height, direction: 'N' as Direction },
                { area: breadth * height, direction: 'E' as Direction },
                { area: length * height, direction: 'S' as Direction },
                { area: breadth * height, direction: 'W' as Direction }
              ]
            : MEDIUM_DEFAULTS.walls);

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
                <p>• 3 occupants</p>
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

  const renderDetailedCalculations = () => {
    if (!showCalculations || !breakdown) return null;

    return (
      <div className="space-y-8 mt-6">
        {/* Input Summary with Visual Representation */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold text-lg mb-4">Input Parameters</h4>
          
          {/* Room Visualization */}
          <div className="mb-6">
            <h5 className="font-medium mb-2">Room Dimensions</h5>
            <div className="border-2 border-emerald-200 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>Length: {inputs.roomDimensions.length} ft</p>
                  <p>Breadth: {inputs.roomDimensions.breadth} ft</p>
                  <p>Height: {inputs.roomDimensions.height} ft</p>
                  <p className="mt-2 font-medium">
                    Floor Area: {inputs.roomDimensions.length * inputs.roomDimensions.breadth} ft²
                  </p>
                  <p className="font-medium">
                    Wall Area: {2 * (inputs.roomDimensions.length + inputs.roomDimensions.breadth) * inputs.roomDimensions.height} ft²
                  </p>
                </div>
                <div className="relative aspect-square bg-emerald-50 rounded flex items-center justify-center">
                  <div className="text-xs text-center">
                    Room Visualization
                    <br />
                    {inputs.roomDimensions.length}' × {inputs.roomDimensions.breadth}' × {inputs.roomDimensions.height}'
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Climate Data */}
          <div className="mb-6">
            <h5 className="font-medium mb-2">Climate Conditions ({inputs.city})</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded shadow-sm">
                <div className="text-sm text-gray-600">Dry Bulb</div>
                <div className="font-medium">{CITY_DATA[inputs.city].db}°F</div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <div className="text-sm text-gray-600">Wet Bulb</div>
                <div className="font-medium">{CITY_DATA[inputs.city].wb}°F</div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <div className="text-sm text-gray-600">Relative Humidity</div>
                <div className="font-medium">{CITY_DATA[inputs.city].rh}%</div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <div className="text-sm text-gray-600">Grains/lb</div>
                <div className="font-medium">{CITY_DATA[inputs.city].grPerLb}</div>
              </div>
            </div>
          </div>

          {/* Other Parameters */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Occupants:</div>
            <div>{inputs.occupants} people</div>
            <div>Roof Condition:</div>
            <div className="capitalize">{inputs.roofCondition}</div>
            {inputs.windows && (
              <>
                <div>Windows:</div>
                <div>
                  {inputs.windows.map((w, i) => (
                    <div key={i}>
                      Window {i + 1}: {w.area} ft² facing {w.direction}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Step-by-Step Calculations */}
        <div className="space-y-6">
          {/* 1. Room Volume */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-lg mb-4">1. Room Volume Calculation</h4>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded">
                <p className="font-medium">Formula:</p>
                <p className="font-mono">Volume = Length × Breadth × Height</p>
              </div>
              <div className="bg-white p-4 rounded">
                <p className="font-medium">Calculation:</p>
                <p className="font-mono">
                  Volume = {inputs.roomDimensions.length} × {inputs.roomDimensions.breadth} × {inputs.roomDimensions.height}
                </p>
                <p className="font-mono mt-2">
                  Volume = {inputs.roomDimensions.length * inputs.roomDimensions.breadth * inputs.roomDimensions.height} ft³
                </p>
              </div>
            </div>
          </div>

          {/* 2. Glass Heat Gain */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-lg mb-4">2. Glass Heat Gain</h4>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded">
                <p className="font-medium">Formula:</p>
                <p className="font-mono">Q_glass = Σ(Window Area × ΔT × U_glass)</p>
                <p className="mt-2">Where:</p>
                <ul className="list-disc list-inside ml-4">
                  <li>ΔT = Outdoor DB - Indoor Design Temp</li>
                  <li>U_glass = Glass heat transfer coefficient</li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded">
                <p className="font-medium">Constants:</p>
                <ul className="space-y-1">
                  <li>U_glass = {U_FACTORS.glass}</li>
                  <li>Indoor Design Temp = {CALCULATION_CONSTANTS.indoorTemp}°F</li>
                  <li>ΔT = {CITY_DATA[inputs.city].db} - {CALCULATION_CONSTANTS.indoorTemp} = {CITY_DATA[inputs.city].db - CALCULATION_CONSTANTS.indoorTemp}°F</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded">
                <p className="font-medium">Calculations:</p>
                {inputs.windows?.map((window, idx) => (
                  <div key={idx} className="mb-2">
                    <p className="font-mono">Window {idx + 1}:</p>
                    <p className="font-mono ml-4">
                      = {window.area} ft² × {CITY_DATA[inputs.city].db - CALCULATION_CONSTANTS.indoorTemp}°F × {U_FACTORS.glass}
                    </p>
                    <p className="font-mono ml-4">
                      = {(window.area * (CITY_DATA[inputs.city].db - CALCULATION_CONSTANTS.indoorTemp) * U_FACTORS.glass).toFixed(2)} BTU/hr
                    </p>
                  </div>
                ))}
                <p className="font-medium mt-3">
                  Total Glass Heat = {breakdown.roomSensible.glass.toFixed(2)} BTU/hr
                </p>
              </div>
            </div>
          </div>

          {/* Continue with similar detailed breakdowns for each component... */}
          {/* Add Wall Heat, Floor Heat, Roof Heat, etc. in the same detailed format */}

          {/* Final Summary with Pie Chart */}
          <div className="bg-emerald-50 p-6 rounded-lg">
            <h4 className="font-semibold text-lg mb-4">Heat Load Distribution</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium mb-2">Component Breakdown:</h5>
                <ul className="space-y-2">
                  <li>Glass Heat: {((breakdown.roomSensible.glass / breakdown.grandTotal.final) * 100).toFixed(1)}%</li>
                  <li>Wall Heat: {((breakdown.roomSensible.wall / breakdown.grandTotal.final) * 100).toFixed(1)}%</li>
                  <li>Roof Heat: {((breakdown.roomSensible.roof / breakdown.grandTotal.final) * 100).toFixed(1)}%</li>
                  <li>People Heat: {((breakdown.roomSensible.people / breakdown.grandTotal.final) * 100).toFixed(1)}%</li>
                  <li>Equipment Heat: {((breakdown.roomSensible.equipment / breakdown.grandTotal.final) * 100).toFixed(1)}%</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded">
                <p className="font-medium">Final Calculations:</p>
                <p>Total Heat Load = {breakdown.grandTotal.final.toFixed(2)} BTU/hr</p>
                <p>Required Tonnage = {breakdown.grandTotal.final.toFixed(2)} ÷ 12,000</p>
                <p>= {breakdown.tonnage.toFixed(3)} Tons</p>
                <p className="font-medium mt-2">
                  Recommended Size = {Math.ceil(breakdown.tonnage * 2) / 2} Tons
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInputSummary = () => {
    if (!breakdown) return null;

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h4 className="text-lg font-semibold mb-4">Input Summary</h4>
        
        <div className="space-y-6">
          {/* Difficulty Level */}
          <div>
            <h5 className="font-medium text-emerald-700">Selected Difficulty: {difficultyLevel.toUpperCase()}</h5>
            <p className="text-sm text-gray-600 mt-1">
              {difficultyLevel === 'low' && 'Using basic presets with minimal customization'}
              {difficultyLevel === 'medium' && 'Using medium level presets with some customization'}
              {difficultyLevel === 'high' && 'Full customization with no presets'}
            </p>
          </div>

          {/* User-Set Inputs */}
          <div>
            <h5 className="font-medium text-emerald-700">User-Set Parameters</h5>
            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
              <div className="col-span-2 bg-gray-50 p-3 rounded">
                <p className="font-medium">Room Dimensions:</p>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <p>Length: {inputs.roomDimensions.length} ft</p>
                  <p>Breadth: {inputs.roomDimensions.breadth} ft</p>
                  <p>Height: {inputs.roomDimensions.height} ft</p>
                </div>
              </div>
              <div className="col-span-2 bg-gray-50 p-3 rounded">
                <p className="font-medium">Location:</p>
                <p>{inputs.city} (DB: {CITY_DATA[inputs.city].db}°F, WB: {CITY_DATA[inputs.city].wb}°F)</p>
              </div>
              {inputs.occupants && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">Occupants:</p>
                  <p>{inputs.occupants} people</p>
                </div>
              )}
              {inputs.roofCondition && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">Roof Condition:</p>
                  <p className="capitalize">{inputs.roofCondition}</p>
                </div>
              )}
            </div>
          </div>

          {/* Preset Values */}
          <div>
            <h5 className="font-medium text-emerald-700">Preset/Default Values</h5>
            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
              {difficultyLevel === 'low' && (
                <>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">Windows:</p>
                    <p>2 windows, 15 ft² each (East & West)</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">Equipment:</p>
                    <p>2 lights (0.1 kW each)</p>
                  </div>
                </>
              )}
              {difficultyLevel === 'medium' && (
                <>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">Default Windows:</p>
                    <p>2 windows, 15 ft² each (East & West)</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">Default Equipment:</p>
                    <p>2 lights, 1 fan</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Constants Used */}
          <div>
            <h5 className="font-medium text-emerald-700">Constants & Factors Used</h5>
            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">U-Factors:</p>
                <p>Glass: {U_FACTORS.glass}</p>
                <p>Wall: {U_FACTORS.wall}</p>
                <p>Floor: {U_FACTORS.floor}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">Safety Factors:</p>
                <p>Overall: {CALCULATION_CONSTANTS.safetyFactor * 100}%</p>
                <p>Supply Duct: {CALCULATION_CONSTANTS.supplyDuctGain * 100}%</p>
                <p>Fan Heat: {CALCULATION_CONSTANTS.fanHeatGain * 100}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!breakdown) return null;

    return (
      <div className="mt-8 space-y-6">
        {/* Initial Result */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
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
          <div className="space-y-8">
            {/* Temperature Analysis */}
            <TemperatureVisuals inputs={inputs} />

            {/* Heat Flow Visualization */}
            <HeatFlowVisuals breakdown={breakdown} />

            {/* Detailed Calculations */}
            <DetailedCalculations 
              breakdown={breakdown}
              inputs={inputs}
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-emerald-50 p-6 rounded-lg">
                <h4 className="font-semibold mb-2">Sensible Heat</h4>
                <p className="text-2xl font-bold text-emerald-600">
                  {breakdown.roomSensible.total.toFixed(0)} BTU/hr
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {((breakdown.roomSensible.total / breakdown.grandTotal.final) * 100).toFixed(1)}% of total load
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-semibold mb-2">Latent Heat</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {breakdown.roomLatent.total.toFixed(0)} BTU/hr
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {((breakdown.roomLatent.total / breakdown.grandTotal.final) * 100).toFixed(1)}% of total load
                </p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <h4 className="font-semibold mb-2">Outside Air</h4>
                <p className="text-2xl font-bold text-yellow-600">
                  {breakdown.outsideAir.total.toFixed(0)} BTU/hr
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {((breakdown.outsideAir.total / breakdown.grandTotal.final) * 100).toFixed(1)}% of total load
                </p>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-4">Important Notes</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• All calculations follow ASHRAE standards</li>
                <li>• Safety factor of {CALCULATION_CONSTANTS.safetyFactor * 100}% applied</li>
                <li>• Final tonnage rounded up to nearest 0.5 ton</li>
                <li>• Calculations include both sensible and latent heat loads</li>
                <li>• Outside air requirements based on occupancy and room volume</li>
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-emerald-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-4">Recommendations</h4>
              <ul className="space-y-2 text-sm">
                <li>• Recommended AC size: {Math.ceil(breakdown.tonnage * 2) / 2} Tons</li>
                <li>• Consider energy-efficient units with high SEER ratings</li>
                <li>• Ensure proper installation and maintenance</li>
                <li>• Consider zoning for better temperature control</li>
                <li>• Regular maintenance recommended for optimal performance</li>
              </ul>
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

          {renderInputSummary()}

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