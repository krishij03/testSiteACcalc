import React, { useState } from 'react';
import { 
  CustomizationLevel, 
  CalculatorInputs, 
  DEFAULT_VALUES,
  CITY_TEMPERATURES,
  APPLIANCES,
  U_FACTORS,
  SAFETY_FACTORS,
  CONSTANTS,
  RoofType,
  CITY_DATA,
  HEAT_FACTORS
} from '../types/calculator';

const Calculator = () => {
  const [customizationLevel, setCustomizationLevel] = useState<CustomizationLevel>('low');
  const [inputs, setInputs] = useState<CalculatorInputs>({
    customizationLevel: 'low',
    roomDimensions: DEFAULT_VALUES.roomDimensions,
    city: DEFAULT_VALUES.city,
    indoorTemp: DEFAULT_VALUES.indoorTemp,
    relativeHumidity: DEFAULT_VALUES.relativeHumidity,
    roofType: DEFAULT_VALUES.roofType
  });
  const [result, setResult] = useState<number | null>(null);
  const [calculationDetails, setCalculationDetails] = useState<string[]>([]);

  const calculateTonnage = () => {
    const details: string[] = [];
    const cityData = CITY_DATA[inputs.city];
    const { length, width, height } = inputs.roomDimensions;
    const roomArea = length * width;
    const roomVolume = roomArea * height;

    // 1. Calculate Room Sensible Heat
    let roomSensibleHeat = 0;

    // Glass heat
    if (inputs.windowDoorDetails?.windowArea) {
      const glassHeat = inputs.windowDoorDetails.windowArea * cityData.drange * U_FACTORS.window;
      roomSensibleHeat += glassHeat;
      details.push(`Glass Heat: ${glassHeat.toFixed(2)} BTU/hr`);
    }

    // Wall heat
    const wallArea = 2 * (length + width) * height;
    const wallHeat = wallArea * cityData.drange * U_FACTORS.wall;
    roomSensibleHeat += wallHeat;
    details.push(`Wall Heat: ${wallHeat.toFixed(2)} BTU/hr`);

    // People heat
    const peopleHeat = (inputs.occupants || 0) * HEAT_FACTORS.PERSON_SENSIBLE_HEAT;
    roomSensibleHeat += peopleHeat;
    details.push(`People Sensible Heat: ${peopleHeat.toFixed(2)} BTU/hr`);

    // Equipment heat
    if (inputs.appliances) {
      let equipmentKW = 0;
      Object.entries(inputs.appliances).forEach(([name, count]) => {
        const appliance = APPLIANCES.find(a => a.name === name);
        if (appliance) {
          equipmentKW += (appliance.wattage * count) / 1000; // Convert to KW
        }
      });
      const equipmentHeat = equipmentKW * HEAT_FACTORS.EQUIPMENT_HEAT_FACTOR;
      roomSensibleHeat += equipmentHeat;
      details.push(`Equipment Heat: ${equipmentHeat.toFixed(2)} BTU/hr`);
    }

    // Lighting heat
    if (inputs.lightingLoad) {
      const lightingHeat = inputs.lightingLoad * roomArea;
      roomSensibleHeat += lightingHeat;
      details.push(`Lighting Heat: ${lightingHeat.toFixed(2)} BTU/hr`);
    }

    // Add duct and fan heat gains
    const ductGain = roomSensibleHeat * HEAT_FACTORS.DUCT_GAIN;
    const fanHeat = roomSensibleHeat * HEAT_FACTORS.FAN_HEAT_GAIN;
    roomSensibleHeat += ductGain + fanHeat;
    details.push(`Duct Gain: ${ductGain.toFixed(2)} BTU/hr`);
    details.push(`Fan Heat: ${fanHeat.toFixed(2)} BTU/hr`);

    // 2. Calculate Room Latent Heat
    // Calculate ventilation rate
    const ventByArea = (roomVolume * HEAT_FACTORS.VENTILATION_FACTOR) / 60;
    const ventByPeople = (inputs.occupants || 0) * 10;
    const ventilation = Math.max(ventByArea, ventByPeople);

    const roomLatentHeat = (inputs.occupants || 0) * HEAT_FACTORS.PERSON_LATENT_HEAT +
      (ventilation * (cityData.grPerLb - 70) * HEAT_FACTORS.LATENT_CONSTANT * HEAT_FACTORS.BYPASS_FACTOR);
    
    details.push(`Room Latent Heat: ${roomLatentHeat.toFixed(2)} BTU/hr`);

    // 3. Calculate Outside Air Heat
    const outsideAirSensible = ventilation * cityData.drange * 
      (1 - HEAT_FACTORS.BYPASS_FACTOR) * HEAT_FACTORS.SENSIBLE_CONSTANT;
    
    const outsideAirLatent = ventilation * (cityData.grPerLb - 70) * 
      (1 - HEAT_FACTORS.BYPASS_FACTOR) * HEAT_FACTORS.LATENT_CONSTANT;

    details.push(`Outside Air Sensible Heat: ${outsideAirSensible.toFixed(2)} BTU/hr`);
    details.push(`Outside Air Latent Heat: ${outsideAirLatent.toFixed(2)} BTU/hr`);

    // Calculate Grand Total Heat
    const effectiveRoomTotal = roomSensibleHeat + roomLatentHeat;
    const grandTotalSubtotal = effectiveRoomTotal + outsideAirSensible + outsideAirLatent;
    const safetyFactor = grandTotalSubtotal * HEAT_FACTORS.SAFETY_FACTOR;
    const grandTotal = grandTotalSubtotal + safetyFactor;

    details.push(`Effective Room Total: ${effectiveRoomTotal.toFixed(2)} BTU/hr`);
    details.push(`Grand Total Heat: ${grandTotal.toFixed(2)} BTU/hr`);

    // Convert to Tons
    const tons = grandTotal / HEAT_FACTORS.TON_CONVERSION;
    setResult(tons);
    setCalculationDetails(details);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-gray-700 mb-2">City</label>
          <select
            value={inputs.city}
            onChange={(e) => setInputs({ ...inputs, city: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          >
            {Object.keys(CITY_TEMPERATURES).map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Indoor Temperature (°F)</label>
          <input
            type="number"
            value={inputs.indoorTemp}
            onChange={(e) => setInputs({ ...inputs, indoorTemp: Number(e.target.value) })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Roof Type</label>
          <select
            value={inputs.roofType}
            onChange={(e) => setInputs({ ...inputs, roofType: e.target.value as RoofType })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          >
            <option value="insulated">Insulated</option>
            <option value="uninsulated">Uninsulated</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderMediumLevelInputs = () => (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 mb-2">Number of Windows</label>
          <input
            type="number"
            value={inputs.windowDoorDetails?.windowCount || DEFAULT_VALUES.windowDoorDetails.windowCount}
            onChange={(e) => setInputs({
              ...inputs,
              windowDoorDetails: {
                ...inputs.windowDoorDetails || DEFAULT_VALUES.windowDoorDetails,
                windowCount: Number(e.target.value)
              }
            })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Window Area (sq ft)</label>
          <input
            type="number"
            value={inputs.windowDoorDetails?.windowArea || DEFAULT_VALUES.windowDoorDetails.windowArea}
            onChange={(e) => setInputs({
              ...inputs,
              windowDoorDetails: {
                ...inputs.windowDoorDetails || DEFAULT_VALUES.windowDoorDetails,
                windowArea: Number(e.target.value)
              }
            })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 mb-2">Number of Doors</label>
          <input
            type="number"
            value={inputs.windowDoorDetails?.doorCount || DEFAULT_VALUES.windowDoorDetails.doorCount}
            onChange={(e) => setInputs({
              ...inputs,
              windowDoorDetails: {
                ...inputs.windowDoorDetails || DEFAULT_VALUES.windowDoorDetails,
                doorCount: Number(e.target.value)
              }
            })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Door Area (sq ft)</label>
          <input
            type="number"
            value={inputs.windowDoorDetails?.doorArea || DEFAULT_VALUES.windowDoorDetails.doorArea}
            onChange={(e) => setInputs({
              ...inputs,
              windowDoorDetails: {
                ...inputs.windowDoorDetails || DEFAULT_VALUES.windowDoorDetails,
                doorArea: Number(e.target.value)
              }
            })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
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
          <label className="block text-gray-700 mb-2">Air Changes per Hour</label>
          <input
            type="number"
            step="0.1"
            value={inputs.airChangesPerHour || DEFAULT_VALUES.airChangesPerHour}
            onChange={(e) => setInputs({ ...inputs, airChangesPerHour: Number(e.target.value) })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={inputs.isRoofSunExposed}
            onChange={(e) => setInputs({ ...inputs, isRoofSunExposed: e.target.checked })}
            className="form-checkbox text-emerald-600"
          />
          <span>Is Roof Sun Exposed?</span>
        </label>
      </div>
    </div>
  );

  const renderHighLevelInputs = () => (
    <div className="space-y-6 mt-6">
      <div>
        <label className="block text-gray-700 mb-2">Appliances</label>
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
      <div>
        <label className="block text-gray-700 mb-2">Lighting Load (W/ft²)</label>
        <input
          type="number"
          step="0.1"
          value={inputs.lightingLoad || DEFAULT_VALUES.lightingLoad}
          onChange={(e) => setInputs({ ...inputs, lightingLoad: Number(e.target.value) })}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
        />
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

            {result && (
              <div className="mt-8 p-6 bg-emerald-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Recommended AC Tonnage:</h3>
                <p className="text-3xl text-emerald-600 font-bold">
                  {Math.ceil(result * 2) / 2} Tons
                </p>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Calculation Details:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {calculationDetails.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  This calculation is based on your input parameters and standard cooling load factors.
                  For the most accurate results, please consult with an HVAC professional.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;