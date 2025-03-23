/* eslint-disable max-len */
/**
 * Icon Renderer
 * 
 * This module provides utilities for rendering ArchiMate element icons
 * using the shape definitions from shape-data.ts.
 */

import { allShapesData, elementMappingData, elementTypeToNameMap, ISvgElement } from './shape-data';
import { ArchiMateElementType } from '../types';
import { ElementShapeGenerator } from './shape-registry';
import { rectangleShape } from './shapes/rectangle-shapes';
import { roundedRectangleShape } from './shapes/rounded-rectangle-shapes';
import { circleShape } from './shapes/circle-shapes';
import { chamferedRectangleShape } from './shapes/chamfered-rectangle-shapes';

// Constants for icon rendering
const ICON_PADDING = 5; // Padding from the edge of the shape
const ICON_SIZE = 15; // Fixed size for icons in pixels
const MIN_SHAPE_SIZE_FOR_ICON = 10; // Minimum shape size to show an icon

// Map of base shape names to their generator functions
const baseShapeGenerators: Record<string, ElementShapeGenerator> = {
  'circle': circleShape, 
  'rectangle': rectangleShape,
  'roundedRectangle': roundedRectangleShape,
  'chamferedRectangle': chamferedRectangleShape,
};

// Convert hyphenated base shape name to camelCase
function convertShapeName(name: string): string {
  if (name === 'rounded-rectangle') return 'roundedRectangle';
  if (name === 'chamfered-rectangle') return 'chamferedRectangle';
  return name;
}

/**
 * Render an SVG element from shape data
 * @param element The SVG element data
 * @param fillColor Optional fill color override
 * @returns SVG string for the element
 */
function renderSvgElement(element: ISvgElement, fillColor?: string): string {
  switch (element.type) {
  case 'path':
    return renderPathElement(element, fillColor);
  case 'rect':
    return renderRectElement(element, fillColor);
  default:
    console.warn(`Unsupported SVG element type: ${element.type}`);
    return '';
  }
}

/**
 * Render a path element
 * @param element The path element data
 * @param fillColor Optional fill color override
 * @returns SVG string for the path
 */
function renderPathElement(element: ISvgElement, fillColor?: string): string {  
  // Handle fill attribute based on presence and value
  let fillAttribute = '';
  
  if (element.fill !== undefined) {
    // If fill is explicitly 'none', keep it as none
    // Otherwise, use the override fillColor if provided, or the element's fill
    const fill = element.fill === 'none' ? 'none' : (fillColor || element.fill);
    fillAttribute = `fill="${fill}"`;
  }
  // If no fill attribute in the element, don't add a fill attribute at all
  // This allows SVG to use its default (which is black fill)
  // This matches the behavior in poster.py
  
  return `<path
    d="${element.d}"
    ${element.stroke ? `stroke="${element.stroke}"` : ''}
    ${element.strokeWidth ? `stroke-width="${element.strokeWidth}"` : ''}
    ${element.strokeLinecap ? `stroke-linecap="${element.strokeLinecap}"` : ''}
    ${element.strokeLinejoin ? `stroke-linejoin="${element.strokeLinejoin}"` : ''}
    ${element.strokeMiterlimit ? `stroke-miterlimit="${element.strokeMiterlimit}"` : ''}
    ${fillAttribute}
    ${element.fillRule ? `fill-rule="${element.fillRule}"` : ''}
  />`;
}

/**
 * Render a rect element
 * @param element The rect element data
 * @param fillColor Optional fill color override
 * @returns SVG string for the rect
 */
function renderRectElement(element: ISvgElement, fillColor?: string): string {
  const fill = element.fill === 'none' ? 'none' : (fillColor || element.fill || '#FFFFFF');
  
  return `<rect
    ${element.x !== undefined ? `x="${element.x}"` : ''}
    ${element.y !== undefined ? `y="${element.y}"` : ''}
    ${element.width !== undefined ? `width="${element.width}"` : ''}
    ${element.height !== undefined ? `height="${element.height}"` : ''}
    ${element.stroke ? `stroke="${element.stroke}"` : ''}
    ${element.strokeWidth ? `stroke-width="${element.strokeWidth}"` : ''}
    fill="${fill}"
  />`;
}

/**
 * Render an icon from shape data
 * @param iconName The name of the icon to render
 * @param fillColor Optional fill color override
 * @returns SVG string for the icon or empty string if icon not found
 */
function renderIcon(iconName: string, fillColor?: string): string {
  const iconShape = allShapesData.find(shape => shape.name === iconName);
  
  if (!iconShape) {
    console.warn(`Icon shape not found: ${iconName}`);
    return '';
  }
  
  const svgElements = iconShape.elements.map(element => renderSvgElement(element, fillColor)).join('\n');
  
  return `<g>${svgElements}</g>`;
}

/**
 * Get the element mapping for an ArchiMate element type
 * @param elementType The ArchiMate element type
 * @returns The element mapping or undefined if not found
 */
function getElementMapping(elementType: ArchiMateElementType | string): { icon: string, base: string } | undefined {
  // Convert element type to element name
  const elementName = elementTypeToNameMap[elementType];
  
  if (!elementName) {
    console.warn(`Element name not found for type: ${elementType}`);
    return undefined;
  }
  
  // Find the mapping for this element name
  const mapping = elementMappingData.find(mapping => mapping.element === elementName);
  
  if (!mapping) {
    console.warn(`Element mapping not found for: ${elementName}`);
    return undefined;
  }
  
  return {
    icon: mapping.icon,
    base: mapping.base,
  };
}

/**
 * Create a shape generator that combines a base shape with an icon
 * @param baseShapeGenerator The base shape generator function
 * @param iconName The name of the icon to add
 * @returns A new shape generator function that combines the base shape with the icon
 */
function createIconShapeGenerator(
  baseShapeGenerator: ElementShapeGenerator,
  iconName: string,
): ElementShapeGenerator {
  return (
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    style: Record<string, unknown> = {},
  ): string => {
    // Render the base shape
    const baseShape = baseShapeGenerator(x, y, width, height, label, style);
    
    // Find the icon shape
    const iconShape = allShapesData.find(shape => shape.name === iconName);
    
    if (!iconShape) {
      // If icon not found, just return the base shape
      return baseShape;
    }
    
    // Skip adding icon if the shape is too small
    if (width < MIN_SHAPE_SIZE_FOR_ICON || height < MIN_SHAPE_SIZE_FOR_ICON) {
      return baseShape;
    }
    
    // Calculate scale based on fixed icon size instead of shape dimensions
    const iconScale = ICON_SIZE / Math.max(iconShape.width, iconShape.height);
    
    // Calculate the scaled dimensions
    const scaledIconWidth = iconShape.width * iconScale;
    
    // Position the icon in the top-right corner with padding
    const iconX = width - scaledIconWidth - ICON_PADDING;
    const iconY = ICON_PADDING;
    
    // Render the icon
    const iconSvg = renderIcon(iconName, style.fillColor as string | undefined);
    
    if (!iconSvg) {
      // If icon rendering failed, just return the base shape
      return baseShape;
    }
    
    // Insert the icon into the base shape
    // We need to find the closing </g> tag and insert our icon before it
    const closingTagIndex = baseShape.lastIndexOf('</g>');
    
    if (closingTagIndex === -1) {
      // If no closing tag found, just return the base shape
      return baseShape;
    }
    
    // Insert the icon with appropriate transformation
    const iconWithTransform = `<g transform="translate(${iconX}, ${iconY}) scale(${iconScale})">${iconSvg}</g>`;
    
    return baseShape.substring(0, closingTagIndex) + iconWithTransform + baseShape.substring(closingTagIndex);
  };
}

/**
 * Create a shape generator for an ArchiMate element type
 * @param elementType The ArchiMate element type
 * @returns A shape generator function for the element type
 */
export function createElementShapeGenerator(elementType: ArchiMateElementType | string): ElementShapeGenerator {
  // Get the element mapping
  const mapping = getElementMapping(elementType);
  
  if (!mapping) {
    // If no mapping found, return the rectangle shape as fallback
    console.warn(`No mapping found for element type: ${elementType}, using rectangle as fallback`);
    return rectangleShape;
  }
  
  // Get the base shape generator - convert hyphenated name if needed
  const baseShapeName = convertShapeName(mapping.base);
  const baseShapeGenerator = baseShapeGenerators[baseShapeName];
  
  if (!baseShapeGenerator) {
    // If base shape generator not found, return the rectangle shape as fallback
    console.warn(`Base shape generator not found for: ${mapping.base}, using rectangle as fallback`);
    return rectangleShape;
  }
  
  // Special case: For Or Junction, force white fill for base shape
  if (elementTypeToNameMap[elementType] === 'Or Junction') {
    return (x, y, width, height, label, style = {}) => {
      style.fillColor = '#FFFFFF';
      return baseShapeGenerator(x, y, width, height, label, style);
    };
  }

  // If the icon is the same as the base, just return the base shape generator
  if (mapping.icon === mapping.base) {
    return baseShapeGenerator;
  }
  
  // Create a combined shape generator
  return createIconShapeGenerator(baseShapeGenerator, mapping.icon);
}
