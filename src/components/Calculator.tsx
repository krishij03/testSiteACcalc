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
  RoofType
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
    let totalBTU = 0;

    // Get room dimensions
    const { length, width, height } = inputs.roomDimensions;
    const roomArea = length * width;
    const roomVolume = roomArea * height;
    
    // Get temperatures
    const cityTemp = CITY_TEMPERATURES[inputs.city];
    const deltaT = inputs.indoorTemp - cityTemp.dbt;

    // 1. Sensible Heat Through Walls
    const wallArea = 2 * (length + width) * height;
    const Q_walls = U_FACTORS.wall * wallArea * Math.abs(deltaT);
    details.push(`Wall Heat Load: ${Q_walls.toFixed(2)} BTU/hr`);
    totalBTU += Q_walls;

    // 2. Roof Heat Load
    const roofArea = length * width;
    const roofUFactor = inputs.roofType === 'insulated' ? U_FACTORS.roof_insulated : U_FACTORS.roof_uninsulated;
    const Q_roof = roofUFactor * roofArea * Math.abs(deltaT);
    details.push(`Roof Heat Load (${inputs.roofType}): ${Q_roof.toFixed(2)} BTU/hr`);
    totalBTU += Q_roof;

    // Add roof weight factor if sun exposed
    if (inputs.isRoofSunExposed) {
      const roofWeightFactor = CONSTANTS.roofSunExposed / CONSTANTS.roofShaded;
      totalBTU *= roofWeightFactor;
      details.push(`Roof Sun Exposure Factor Applied: ${roofWeightFactor.toFixed(2)}x`);
    }

    // 3. Windows and Doors (Medium and High levels)
    if (inputs.windowDoorDetails) {
      const { windowCount, windowArea, doorCount, doorArea } = inputs.windowDoorDetails;
      const totalWindowArea = windowCount * windowArea;
      const totalDoorArea = doorCount * doorArea;

      const Q_windows = U_FACTORS.window * totalWindowArea * Math.abs(deltaT);
      const Q_doors = U_FACTORS.door * totalDoorArea * Math.abs(deltaT);

      details.push(`Window Heat Load: ${Q_windows.toFixed(2)} BTU/hr`);
      details.push(`Door Heat Load: ${Q_doors.toFixed(2)} BTU/hr`);

      totalBTU += Q_windows + Q_doors;
    }

    // 4. Ventilation Load
    if (inputs.airChangesPerHour) {
      // Fresh air requirement
      const occupantCFM = (inputs.occupants || 0) * CONSTANTS.cfmPerPerson;
      const volumeCFM = (roomVolume * inputs.airChangesPerHour) / 60;
      const totalCFM = Math.max(occupantCFM, volumeCFM);

      // Sensible heat
      const Q_ventilation_sensible = CONSTANTS.sensibleHeat * totalCFM * Math.abs(deltaT);
      // Latent heat
      const Q_ventilation_latent = CONSTANTS.latentHeat * totalCFM * CONSTANTS.humidityRatio;

      details.push(`Ventilation Sensible Load: ${Q_ventilation_sensible.toFixed(2)} BTU/hr`);
      details.push(`Ventilation Latent Load: ${Q_ventilation_latent.toFixed(2)} BTU/hr`);

      totalBTU += Q_ventilation_sensible + Q_ventilation_latent;
    }

    // 5. Occupant Load
    if (inputs.occupants) {
      const Q_people = inputs.occupants * CONSTANTS.personHeatGain;
      details.push(`Occupant Load: ${Q_people.toFixed(2)} BTU/hr`);
      totalBTU += Q_people;
    }

    // 6. Appliance Load
    if (inputs.appliances) {
      let applianceWattage = 0;
      Object.entries(inputs.appliances).forEach(([name, count]) => {
        const appliance = APPLIANCES.find(a => a.name === name);
        if (appliance) {
          applianceWattage += appliance.wattage * count;
        }
      });
      const Q_appliances = applianceWattage * CONSTANTS.btuConversion;
      details.push(`Appliance Load: ${Q_appliances.toFixed(2)} BTU/hr`);
      totalBTU += Q_appliances;
    }

    // 7. Lighting Load
    if (inputs.lightingLoad) {
      const Q_lighting = inputs.lightingLoad * roomArea * CONSTANTS.btuConversion;
      details.push(`Lighting Load: ${Q_lighting.toFixed(2)} BTU/hr`);
      totalBTU += Q_lighting;
    }

    // Apply safety factors
    const ductLoss = totalBTU * SAFETY_FACTORS.ductLeakage;
    const fanHeat = totalBTU * SAFETY_FACTORS.fanHeat;
    const safetyLoad = totalBTU * SAFETY_FACTORS.heatLoad;
    
    totalBTU += ductLoss + fanHeat + safetyLoad;
    
    details.push(`Duct Loss: ${ductLoss.toFixed(2)} BTU/hr`);
    details.push(`Fan Heat: ${fanHeat.toFixed(2)} BTU/hr`);
    details.push(`Safety Load: ${safetyLoad.toFixed(2)} BTU/hr`);
    details.push(`Total Heat Load: ${totalBTU.toFixed(2)} BTU/hr`);
    
    // Convert to Tons
    const tons = totalBTU / CONSTANTS.tonConversion;
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