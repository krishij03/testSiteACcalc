export type DifficultyLevel = 'low' | 'medium' | 'high';
export type Direction = 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW';
export type RoofCondition = 'exposed' | 'shaded' | 'water-covered' | 'insulated';

export interface CityData {
  db: number;    // Dry Bulb Temperature
  wb: number;    // Wet Bulb Temperature
  drange: number;
  rh: number;    // Relative Humidity %
  dp: number;    // Dew Point
  grPerLb: number;  // Grains per Pound
}

export interface Window {
  area: number;
  direction: Direction;
}

export interface Wall {
  area: number;
  direction: Direction;
}

export interface Appliance {
  name: string;
  wattage: number; // in kW
}

// City Data Constants - Exactly as per report
export const CITY_DATA: Record<string, CityData> = {
  'New Delhi': { db: 104, wb: 80, drange: 24, rh: 40, dp: 73, grPerLb: 62 },
  'Mumbai': { db: 92, wb: 86, drange: 6, rh: 85, dp: 83, grPerLb: 82 },
  'Bengaluru': { db: 86, wb: 74, drange: 12, rh: 60, dp: 68, grPerLb: 50 },
  'Kolkata': { db: 95, wb: 88, drange: 7, rh: 75, dp: 85, grPerLb: 78 },
  'Chennai': { db: 100, wb: 91, drange: 9, rh: 70, dp: 86, grPerLb: 84 },
  'Hyderabad': { db: 95, wb: 82, drange: 13, rh: 55, dp: 76, grPerLb: 67 },
  'Ahmedabad': { db: 108, wb: 84, drange: 24, rh: 35, dp: 71, grPerLb: 58 },
  'Pune': { db: 90, wb: 76, drange: 14, rh: 50, dp: 72, grPerLb: 54 },
  'Jaipur': { db: 106, wb: 80, drange: 26, rh: 30, dp: 70, grPerLb: 55 },
  'Lucknow': { db: 102, wb: 78, drange: 24, rh: 40, dp: 72, grPerLb: 60 }
};

// U-Factors - Exactly as per report section 4.2
export const U_FACTORS = {
  glass: 0.30,    // Window Glass (ordinary)
  wall: 0.16,     // Standard Wall
  floor: 0.02,    // Floor
  roofExposed: 0.46,    // Uninsulated Roof (from section C)
  roofInsulated: 0.135, // Insulated Roof (from section C)
  roofShaded: 0.15,     // Standard exposed roof value
  roofWaterCovered: 0.1 // Reduced factor for water-covered
};

// Appliance Preset Wattages - Exactly as per report section 4.3
export const APPLIANCES: Appliance[] = [
  { name: 'Lights', wattage: 0.05 },
  { name: 'Oven/Microwave', wattage: 1.5 },
  { name: 'Fridge', wattage: 0.20 },
  { name: 'PC/Laptop', wattage: 0.125 },
  { name: 'TV', wattage: 0.1 },
  { name: 'Fan', wattage: 0.05 }
];

// Solar Heat Gain - Exactly as per report section B
export const SOLAR_HEAT_GAIN: Record<Direction, number> = {
  'W': 163,
  'SW': 85,
  'NW': 138,
  'N': 45,
  'S': 45,
  'E': 45,
  'SE': 85,
  'NE': 138
};

// All calculation constants from the report
export const CALCULATION_CONSTANTS = {
  // Occupant Loads (section 4.4)
  personSensibleHeat: 255,    // Default sensible heat
  personLatentHeat: {         // Latent heat range
    min: 245,
    max: 270
  },
  
  // Equipment & Lighting
  equipmentFactor: 3410,      // BTU/hr per kW
  lightingLoadFactor: 1.2,    // From lighting load formula
  lightingConstant: 3.4,      // From lighting load formula
  
  // Ventilation & Infiltration (section 4.5)
  ventilationFactor: 0.42,    // From ventilation rate formula
  bypassFactor: 0.12,         // Default Coil Bypass Factor
  sensibleConstant: 1.08,     // For outside air sensible calculation
  latentConstant: 0.68,       // For outside air latent calculation
  cfmPerPerson: 10,           // From ventilation rate formula
  
  // Temperature & Moisture
  indoorTemp: 75,             // °F - Standard indoor design temp
  indoorGrains: 60,           // grains/lb - Standard indoor moisture
  
  // Safety Margins (section 4.6)
  safetyFactor: 0.03,         // Overall Safety Factor = 3%
  supplyDuctGain: 0.02,       // Supply Duct Heat Gain = 2%
  fanHeatGain: 0.05,          // Fan Heat Gain = 5%
  
  // Conversion
  tonConversion: 12000        // BTU/hr per ton of refrigeration
};

// Advanced Options from section E
export const ACTIVITY_HEAT_GAIN = {
  seated: {
    sensible: { min: 175, max: 195 },
    latent: { min: 195, max: 230 }
  },
  office: {
    sensible: { min: 180, max: 200 },
    latent: { min: 250, max: 300 }
  },
  lightWork: {
    sensible: { min: 190, max: 220 },
    latent: { min: 530, max: 560 }
  }
};

// Bypass Factors from section A
export const COIL_BYPASS_FACTORS = {
  '2row': { min: 0.225, max: 0.373 },
  '3row': { min: 0.107, max: 0.228 },
  '4row': { min: 0.052, max: 0.140 }
};

// Occupancy Standards from section D
export const OCCUPANCY_STANDARDS = {
  apartmentHotel: {
    spacePerPerson: 60,      // ft² per person
    cfmPerPerson: { min: 20, max: 30 }
  }
};

// Add new types for advanced options
export type ActivityLevel = 'seated' | 'office' | 'lightWork';
export type CoilType = '2row' | '3row' | '4row';

export interface CalculatorInputs {
  difficultyLevel: DifficultyLevel;
  roomDimensions: {
    length: number;
    breadth: number;
    height: number;
  };
  city: string;
  windows?: Window[];
  walls?: Wall[];
  roofCondition?: RoofCondition;
  occupants?: number;
  appliances?: Record<string, number>;
  infiltrationRate?: number;
}

export interface CalculationBreakdown {
  roomSensible: {
    glass: number;
    wall: number;
    floor: number;
    roof: number;
    people: number;
    equipment: number;
    lighting: number;
    ductGain: number;
    fanHeat: number;
    total: number;
  };
  roomLatent: {
    people: number;
    infiltration: number;
    total: number;
  };
  outsideAir: {
    sensible: number;
    latent: number;
    total: number;
  };
  grandTotal: {
    subtotal: number;
    safetyFactor: number;
    final: number;
  };
  tonnage: number;
} 