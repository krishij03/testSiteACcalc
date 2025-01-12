import React from 'react';
import { CalculatorInputs, CITY_DATA, CALCULATION_CONSTANTS } from '../types/calculator';

interface Props {
  inputs: CalculatorInputs;
}

const TemperatureVisuals = ({ inputs }: Props) => {
  const cityData = CITY_DATA[inputs.city];
  const deltaT = cityData.db - CALCULATION_CONSTANTS.indoorTemp;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h4 className="text-lg font-semibold mb-4">Temperature Analysis</h4>
      
      {/* Temperature Gradient */}
      <div className="space-y-6">
        <div>
          <h5 className="font-medium mb-2">Temperature Distribution</h5>
          <div className="h-32 bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 rounded-lg relative">
            <div className="absolute left-0 -bottom-6 text-sm">
              {CALCULATION_CONSTANTS.indoorTemp}°F
              <br />
              <span className="text-xs text-gray-600">Indoor</span>
            </div>
            <div className="absolute right-0 -bottom-6 text-sm text-right">
              {cityData.db}°F
              <br />
              <span className="text-xs text-gray-600">Outdoor</span>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-6 text-sm">
              ΔT: {deltaT}°F
            </div>
          </div>
        </div>

        {/* Humidity and Moisture */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded">
            <h5 className="font-medium mb-2">Humidity Conditions</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Indoor RH:</span>
                <span>50%</span>
              </div>
              <div className="flex justify-between">
                <span>Outdoor RH:</span>
                <span>{cityData.rh}%</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <h5 className="font-medium mb-2">Moisture Content</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Indoor:</span>
                <span>{CALCULATION_CONSTANTS.indoorGrains} gr/lb</span>
              </div>
              <div className="flex justify-between">
                <span>Outdoor:</span>
                <span>{cityData.grPerLb} gr/lb</span>
              </div>
            </div>
          </div>
        </div>

        {/* Heat Flow Indicators */}
        <div className="relative h-48 border-2 border-gray-200 rounded-lg p-4">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-sm text-gray-600">Room</div>
          </div>
          
          {/* Heat Flow Arrows */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2">
            <div className="w-8 h-2 bg-red-400 animate-pulse"/>
          </div>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2">
            <div className="w-8 h-2 bg-blue-400 animate-pulse"/>
          </div>
          
          {/* Labels */}
          <div className="absolute left-4 top-2 text-xs text-gray-600">Heat Gain</div>
          <div className="absolute right-4 top-2 text-xs text-gray-600">Heat Loss</div>
        </div>
      </div>
    </div>
  );
};

export default TemperatureVisuals; 