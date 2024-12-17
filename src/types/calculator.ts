export type CustomizationLevel = 'low' | 'medium' | 'high';

export type FloorLevel = 'ground' | 'middle' | 'top';
export type WindowOrientation = 'north' | 'south' | 'east' | 'west';
export type InsulationQuality = 'poor' | 'average' | 'good';
export type RoomUsage = 'residential' | 'office' | 'commercial';
export type BuildingMaterial = 'concrete' | 'brick' | 'wood';

export interface RoomDimensions {
  length: number;
  width: number;
  height: number;
}

export interface WindowDetails {
  area?: number;
  orientation?: WindowOrientation;
  hasShading?: boolean;
}

export interface CalculatorInputs {
  // Low Level
  customizationLevel: CustomizationLevel;
  roomDimensions: RoomDimensions;
  location: string;

  // Medium Level
  occupants?: number;
  windowDetails?: WindowDetails;
  floorLevel?: FloorLevel;
  hasKitchen?: boolean;

  // High Level
  insulationQuality?: InsulationQuality;
  hasRoofExposure?: boolean;
  applianceLoad?: number;
  sunlightHours?: number;
  roomUsage?: RoomUsage;
  buildingMaterial?: BuildingMaterial;
  ventilationRate?: number;
}

export const DEFAULT_VALUES = {
  // Low Level
  roomDimensions: {
    length: 15,
    width: 12,
    height: 10
  },
  location: 'Mumbai',

  // Medium Level
  occupants: 3,
  windowArea: 30,
  floorLevel: 'middle' as FloorLevel,
  hasKitchen: false,

  // High Level
  windowOrientation: 'south' as WindowOrientation,
  insulationQuality: 'average' as InsulationQuality,
  hasRoofExposure: true,
  applianceLoad: 500,
  sunlightHours: 5,
  roomUsage: 'residential' as RoomUsage,
  hasShading: false,
  buildingMaterial: 'concrete' as BuildingMaterial,
  ventilationRate: 0.5
}; 