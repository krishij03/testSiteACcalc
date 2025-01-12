import React from 'react';
import { CalculationBreakdown } from '../types/calculator';

interface Props {
  breakdown: CalculationBreakdown;
}

const HeatFlowVisuals = ({ breakdown }: Props) => {
  const totalHeat = breakdown.grandTotal.final;
  const getPercentage = (value: number) => ((value / totalHeat) * 100).toFixed(1);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h4 className="text-lg font-semibold mb-4">Heat Flow Analysis</h4>
      
      <div className="space-y-6">
        {/* Room Visualization with Heat Sources */}
        <div className="relative aspect-video bg-gray-50 rounded-lg p-4">
          <div className="absolute inset-4 border-2 border-emerald-600">
            {/* Windows */}
            <div className="absolute left-0 top-1/4 w-2 h-8 bg-yellow-400">
              <div className="absolute -right-20 top-1/2 transform -translate-y-1/2 text-xs">
                Glass Heat: {getPercentage(breakdown.roomSensible.glass)}%
              </div>
            </div>

            {/* Walls */}
            <div className="absolute right-0 top-1/4 w-2 h-8 bg-emerald-400">
              <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 text-xs">
                Wall Heat: {getPercentage(breakdown.roomSensible.wall)}%
              </div>
            </div>

            {/* Roof */}
            <div className="absolute top-0 left-1/4 h-2 w-8 bg-red-400">
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-center">
                Roof: {getPercentage(breakdown.roomSensible.roof)}%
              </div>
            </div>

            {/* Internal Loads */}
            <div className="absolute center inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-4 h-4 bg-orange-400 rounded-full mx-auto mb-1 animate-pulse"/>
                <div className="text-xs">
                  Internal: {getPercentage(
                    breakdown.roomSensible.people + 
                    breakdown.roomSensible.equipment + 
                    breakdown.roomSensible.lighting
                  )}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Heat Flow Distribution */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-emerald-50 rounded text-center">
            <div className="text-sm font-medium">Sensible Heat</div>
            <div className="text-lg font-semibold text-emerald-600">
              {((breakdown.roomSensible.total / totalHeat) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="p-3 bg-blue-50 rounded text-center">
            <div className="text-sm font-medium">Latent Heat</div>
            <div className="text-lg font-semibold text-blue-600">
              {((breakdown.roomLatent.total / totalHeat) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="p-3 bg-yellow-50 rounded text-center">
            <div className="text-sm font-medium">Outside Air</div>
            <div className="text-lg font-semibold text-yellow-600">
              {((breakdown.outsideAir.total / totalHeat) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Heat Flow Arrows */}
        <div className="relative h-24 border border-gray-200 rounded-lg">
          <div className="absolute inset-0 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-2 bg-red-400"/>
              <span className="text-xs">Heat Gain</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-2 bg-blue-400"/>
              <span className="text-xs">Heat Loss</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatFlowVisuals; 