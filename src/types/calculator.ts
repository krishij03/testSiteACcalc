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

// City Data Constants
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

// U-Factors
export const U_FACTORS = {
  glass: 0.30,
  wall: 0.16,
  floor: 0.02,
  roofUninsulated: 0.15,
  roofInsulated: 0.135
};

// Preset Appliances
export const APPLIANCES: Appliance[] = [
  { name: 'Lights', wattage: 0.05 },
  { name: 'Oven/Microwave', wattage: 1.5 },
  { name: 'Fridge', wattage: 0.20 },
  { name: 'PC/Laptop', wattage: 0.125 },
  { name: 'TV', wattage: 0.1 },
  { name: 'Fan', wattage: 0.05 }
];

// Heat Load Constants
export const HEAT_CONSTANTS = {
  personSensible: 255,
  personLatent: 245,
  equipmentFactor: 3410,
  lightingFactor: 3.4,
  lightingLoad: 1.2,
  ventilationFactor: 0.42,
  bypassFactor: 0.12,
  sensibleConstant: 1.08,
  latentConstant: 0.68,
  tonConversion: 12000,
  cfmPerPerson: 10,
  indoorTemp: 75,
  indoorGrains: 60
};

// Safety Factors
export const SAFETY_FACTORS = {
  overall: 0.03,
  supplyDuct: 0.02,
  fanHeat: 0.05
};

// Solar Heat Gain through Glass (4 PM)
export const SOLAR_HEAT_GAIN: Record<Direction, number> = {
  'W': 163,
  'SW': 85,
  'NW': 138,
  'N': 45,
  'S': 45,
  'E': 45,
  'SE': 45,
  'NE': 45
};

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