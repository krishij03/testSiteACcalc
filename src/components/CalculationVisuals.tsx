import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { CalculationBreakdown } from '../types/calculator';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface Props {
  breakdown: CalculationBreakdown;
}

const CalculationVisuals = ({ breakdown }: Props) => {
  // Prepare data for pie chart
  const pieData = {
    labels: ['Glass Heat', 'Wall Heat', 'Roof Heat', 'People Heat', 'Equipment Heat', 'Other'],
    datasets: [{
      data: [
        breakdown.roomSensible.glass,
        breakdown.roomSensible.wall,
        breakdown.roomSensible.roof,
        breakdown.roomSensible.people,
        breakdown.roomSensible.equipment,
        breakdown.roomSensible.lighting + breakdown.roomSensible.floor
      ],
      backgroundColor: [
        '#10B981', // emerald-500
        '#34D399', // emerald-400
        '#6EE7B7', // emerald-300
        '#A7F3D0', // emerald-200
        '#D1FAE5', // emerald-100
        '#ECFDF5', // emerald-50
      ]
    }]
  };

  // Prepare data for bar chart
  const barData = {
    labels: ['Sensible Heat', 'Latent Heat', 'Outside Air'],
    datasets: [{
      label: 'Heat Distribution (BTU/hr)',
      data: [
        breakdown.roomSensible.total,
        breakdown.roomLatent.total,
        breakdown.outsideAir.total
      ],
      backgroundColor: '#10B981'
    }]
  };

  return (
    <div className="space-y-8">
      {/* Heat Flow Diagram */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold mb-4">Heat Flow Diagram</h4>
        <div className="relative aspect-video bg-gray-50 rounded-lg p-4">
          {/* Room Outline */}
          <div className="absolute inset-4 border-2 border-emerald-600">
            {/* Solar Radiation Arrows */}
            <div className="absolute -left-8 top-1/2 transform -translate-y-1/2"
                 data-tooltip-id="heat-flow" 
                 data-tooltip-content="Solar radiation through windows">
              <div className="w-8 h-2 bg-yellow-400 relative">
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 
                               border-8 border-transparent border-l-yellow-400"/>
              </div>
            </div>

            {/* Wall Heat Transfer */}
            <div className="absolute -right-8 top-1/2 transform -translate-y-1/2"
                 data-tooltip-id="heat-flow"
                 data-tooltip-content="Heat transfer through walls">
              <div className="w-8 h-2 bg-red-400 relative">
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 
                               border-8 border-transparent border-l-red-400"/>
              </div>
            </div>

            {/* Internal Heat Sources */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                 data-tooltip-id="heat-flow"
                 data-tooltip-content="Internal heat sources (people, equipment)">
              <div className="w-4 h-4 bg-orange-400 rounded-full animate-pulse"/>
            </div>
          </div>
        </div>
      </div>

      {/* Heat Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="text-lg font-semibold mb-4">Heat Load Distribution</h4>
          <div className="aspect-square">
            <Pie data={pieData} options={{
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="text-lg font-semibold mb-4">Heat Type Comparison</h4>
          <Bar data={barData} options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: 'Heat Distribution by Type'
              }
            }
          }} />
        </div>
      </div>

      {/* Tooltips */}
      <ReactTooltip id="heat-flow" place="top" />
    </div>
  );
};

export default CalculationVisuals; 