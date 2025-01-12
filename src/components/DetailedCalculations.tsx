import React from 'react';
import { Tooltip } from 'react-tooltip';
import { CalculationBreakdown, CalculatorInputs, CALCULATION_CONSTANTS, CITY_DATA } from '../types/calculator';

interface Props {
  breakdown: CalculationBreakdown;
  inputs: CalculatorInputs;
}

const DetailedCalculations = ({ breakdown, inputs }: Props) => {
  const deltaT = CITY_DATA[inputs.city].db - CALCULATION_CONSTANTS.indoorTemp;
  const deltaGrains = CITY_DATA[inputs.city].grPerLb - CALCULATION_CONSTANTS.indoorGrains;
  const roomVolume = inputs.roomDimensions.length * inputs.roomDimensions.breadth * inputs.roomDimensions.height;
  const roomArea = inputs.roomDimensions.length * inputs.roomDimensions.breadth;
  const ventilation = Math.max(
    (roomVolume * CALCULATION_CONSTANTS.ventilationFactor) / 60,
    ((inputs.occupants || 2) * CALCULATION_CONSTANTS.cfmPerPerson)
  );

  return (
    <div className="space-y-8">
      {/* Formula Explanations with Tooltips */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold mb-4">Calculation Methodology</h4>
        <div className="space-y-4">
          {/* Room Volume */}
          <div 
            data-tooltip-id="formula-tip"
            data-tooltip-content="Basic room volume calculation"
            className="p-4 bg-gray-50 rounded"
          >
            <p className="font-mono">Room Volume = Length × Breadth × Height</p>
            <p className="text-sm text-gray-600 mt-1">
              = {inputs.roomDimensions.length} × {inputs.roomDimensions.breadth} × {inputs.roomDimensions.height}
              = {roomVolume} ft³
            </p>
          </div>

          {/* Glass Heat */}
          <div 
            data-tooltip-id="formula-tip"
            data-tooltip-content="Heat gain through glass depends on area, temperature difference, and glass properties"
            className="p-4 bg-gray-50 rounded"
          >
            <p className="font-mono">Q_glass = Σ(Window Area × ΔT × U_glass)</p>
            <p className="text-sm text-gray-600 mt-1">
              Where: ΔT = {deltaT}°F, U_glass = {CALCULATION_CONSTANTS.glassHeatFactor}
            </p>
          </div>

          {/* Wall Heat */}
          <div 
            data-tooltip-id="formula-tip"
            data-tooltip-content="Wall heat gain considers wall area and construction type"
            className="p-4 bg-gray-50 rounded"
          >
            <p className="font-mono">Q_wall = Σ(Wall Area × ΔT × U_wall)</p>
            <p className="text-sm text-gray-600 mt-1">
              Where: ΔT = {deltaT}°F, U_wall = {CALCULATION_CONSTANTS.wallHeatFactor}
            </p>
          </div>

          {/* Roof Heat */}
          <div 
            data-tooltip-id="formula-tip"
            data-tooltip-content="Roof heat gain varies based on roof condition"
            className="p-4 bg-gray-50 rounded"
          >
            <p className="font-mono">Q_roof = Roof Area × ΔT × U_roof</p>
            <p className="text-sm text-gray-600 mt-1">
              Roof Area = {roomArea} ft², ΔT = {deltaT}°F
            </p>
          </div>

          {/* People Heat */}
          <div 
            data-tooltip-id="formula-tip"
            data-tooltip-content="Heat gain from occupants includes both sensible and latent heat"
            className="p-4 bg-gray-50 rounded"
          >
            <p className="font-mono">Q_people = Number of People × (Sensible + Latent Heat)</p>
            <p className="text-sm text-gray-600 mt-1">
              Occupants: {inputs.occupants || 2}, 
              Sensible: {CALCULATION_CONSTANTS.personSensibleHeat} BTU/hr/person,
              Latent: {CALCULATION_CONSTANTS.personLatentHeat.min} BTU/hr/person
            </p>
          </div>

          {/* Equipment Heat */}
          <div 
            data-tooltip-id="formula-tip"
            data-tooltip-content="Heat gain from electrical equipment"
            className="p-4 bg-gray-50 rounded"
          >
            <p className="font-mono">Q_equipment = Σ(Equipment kW × 3410)</p>
          </div>

          {/* Ventilation */}
          <div 
            data-tooltip-id="formula-tip"
            data-tooltip-content="Ventilation requirements based on room volume or occupancy"
            className="p-4 bg-gray-50 rounded"
          >
            <p className="font-mono">Ventilation = max((L×B×H×0.42)/60, People×10)</p>
            <p className="text-sm text-gray-600 mt-1">
              Calculated Ventilation: {ventilation.toFixed(2)} CFM
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step Results */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold mb-4">Detailed Results</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2 bg-emerald-50 p-4 rounded">
              <h5 className="font-medium">Room Sensible Heat Components</h5>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>Glass Heat:</div>
                <div>{breakdown.roomSensible.glass.toFixed(2)} BTU/hr</div>
                <div>Wall Heat:</div>
                <div>{breakdown.roomSensible.wall.toFixed(2)} BTU/hr</div>
                <div>Roof Heat:</div>
                <div>{breakdown.roomSensible.roof.toFixed(2)} BTU/hr</div>
                <div>People Sensible:</div>
                <div>{breakdown.roomSensible.people.toFixed(2)} BTU/hr</div>
                <div>Equipment:</div>
                <div>{breakdown.roomSensible.equipment.toFixed(2)} BTU/hr</div>
                <div>Lighting:</div>
                <div>{breakdown.roomSensible.lighting.toFixed(2)} BTU/hr</div>
                <div className="font-medium">Total Sensible:</div>
                <div className="font-medium">{breakdown.roomSensible.total.toFixed(2)} BTU/hr</div>
              </div>
            </div>

            <div className="col-span-2 bg-blue-50 p-4 rounded">
              <h5 className="font-medium">Room Latent Heat Components</h5>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>People Latent:</div>
                <div>{breakdown.roomLatent.people.toFixed(2)} BTU/hr</div>
                <div>Infiltration:</div>
                <div>{breakdown.roomLatent.infiltration.toFixed(2)} BTU/hr</div>
                <div className="font-medium">Total Latent:</div>
                <div className="font-medium">{breakdown.roomLatent.total.toFixed(2)} BTU/hr</div>
              </div>
            </div>

            <div className="col-span-2 bg-yellow-50 p-4 rounded">
              <h5 className="font-medium">Outside Air Heat</h5>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>Sensible:</div>
                <div>{breakdown.outsideAir.sensible.toFixed(2)} BTU/hr</div>
                <div>Latent:</div>
                <div>{breakdown.outsideAir.latent.toFixed(2)} BTU/hr</div>
                <div className="font-medium">Total Outside Air:</div>
                <div className="font-medium">{breakdown.outsideAir.total.toFixed(2)} BTU/hr</div>
              </div>
            </div>

            <div className="col-span-2 bg-red-50 p-4 rounded">
              <h5 className="font-medium">Final Calculations</h5>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>Subtotal:</div>
                <div>{breakdown.grandTotal.subtotal.toFixed(2)} BTU/hr</div>
                <div>Safety Factor (3%):</div>
                <div>{breakdown.grandTotal.safetyFactor.toFixed(2)} BTU/hr</div>
                <div className="font-medium">Final Total:</div>
                <div className="font-medium">{breakdown.grandTotal.final.toFixed(2)} BTU/hr</div>
                <div className="font-medium">Required Tonnage:</div>
                <div className="font-medium">{breakdown.tonnage.toFixed(3)} Tons</div>
                <div className="font-medium text-emerald-700">Recommended Size:</div>
                <div className="font-medium text-emerald-700">
                  {Math.ceil(breakdown.tonnage * 2) / 2} Tons
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltips */}
      <Tooltip id="formula-tip" />
    </div>
  );
};

export default DetailedCalculations; 