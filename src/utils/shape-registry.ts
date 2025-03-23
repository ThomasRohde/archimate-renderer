/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/**
 * Shape Registry
 * 
 * This module provides a registry for SVG shape templates that can be used
 * to render different ArchiMate elements and relationships.
 */

import { ArchiMateElementType, ArchiMateRelationshipType } from '../types';

/**
 * Type for element shape generator function
 */
export type ElementShapeGenerator = (
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  style: Record<string, any>
) => string;

/**
 * Type for relationship arrow generator function
 */
export type ArrowHeadGenerator = (
  x: number,
  y: number,
  angle: number,
  style: Record<string, any>
) => string;

/**
 * Type for relationship line generator function
 */
export type LineStyleGenerator = (
  pathData: string,
  style: Record<string, any>
) => string;

/**
 * Shape Registry class
 * Manages the registration and retrieval of shape templates
 */
export class ShapeRegistry {
  private static instance: ShapeRegistry;
  
  private elementShapes: Map<string, ElementShapeGenerator> = new Map();
  private arrowHeads: Map<string, ArrowHeadGenerator> = new Map();
  private lineStyles: Map<string, LineStyleGenerator> = new Map();
  
  private defaultElementShape: ElementShapeGenerator | null = null;
  private defaultArrowHead: ArrowHeadGenerator | null = null;
  private defaultLineStyle: LineStyleGenerator | null = null;
  
  /**
   * Get the singleton instance of ShapeRegistry
   */
  public static getInstance(): ShapeRegistry {
    if (!ShapeRegistry.instance) {
      ShapeRegistry.instance = new ShapeRegistry();
    }
    return ShapeRegistry.instance;
  }
  
  /**
   * Register a shape generator for an ArchiMate element type
   * @param type ArchiMate element type
   * @param generator Shape generator function
   */
  public registerElementShape(type: ArchiMateElementType | string, generator: ElementShapeGenerator): void {
    this.elementShapes.set(type, generator);
  }
  
  /**
   * Register a default shape generator for elements
   * @param generator Shape generator function
   */
  public registerDefaultElementShape(generator: ElementShapeGenerator): void {
    this.defaultElementShape = generator;
  }
  
  /**
   * Get a shape generator for an ArchiMate element type
   * @param type ArchiMate element type
   * @returns Shape generator function or default if not found
   */
  public getElementShape(type: ArchiMateElementType | string): ElementShapeGenerator | null {
    return this.elementShapes.get(type) || this.defaultElementShape;
  }
  
  /**
   * Register an arrow head generator for a relationship type
   * @param type ArchiMate relationship type
   * @param generator Arrow head generator function
   */
  public registerArrowHead(type: ArchiMateRelationshipType | string, generator: ArrowHeadGenerator): void {
    this.arrowHeads.set(type, generator);
  }
  
  /**
   * Register a default arrow head generator
   * @param generator Arrow head generator function
   */
  public registerDefaultArrowHead(generator: ArrowHeadGenerator): void {
    this.defaultArrowHead = generator;
  }
  
  /**
   * Get an arrow head generator for a relationship type
   * @param type ArchiMate relationship type
   * @returns Arrow head generator function or default if not found
   */
  public getArrowHead(type: ArchiMateRelationshipType | string): ArrowHeadGenerator | null {
    return this.arrowHeads.get(type) || this.defaultArrowHead;
  }
  
  /**
   * Register a line style generator for a relationship type
   * @param type ArchiMate relationship type
   * @param generator Line style generator function
   */
  public registerLineStyle(type: ArchiMateRelationshipType | string, generator: LineStyleGenerator): void {
    this.lineStyles.set(type, generator);
  }
  
  /**
   * Register a default line style generator
   * @param generator Line style generator function
   */
  public registerDefaultLineStyle(generator: LineStyleGenerator): void {
    this.defaultLineStyle = generator;
  }
  
  /**
   * Get a line style generator for a relationship type
   * @param type ArchiMate relationship type
   * @returns Line style generator function or default if not found
   */
  public getLineStyle(type: ArchiMateRelationshipType | string): LineStyleGenerator | null {
    return this.lineStyles.get(type) || this.defaultLineStyle;
  }
  
  /**
   * Clear all registered shapes, arrow heads, and line styles
   */
  public clear(): void {
    this.elementShapes.clear();
    this.arrowHeads.clear();
    this.lineStyles.clear();
    this.defaultElementShape = null;
    this.defaultArrowHead = null;
    this.defaultLineStyle = null;
  }
}

// Export singleton instance
export const shapeRegistry = ShapeRegistry.getInstance();
