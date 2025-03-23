/**
 * Rectangle Shapes
 * 
 * This module provides SVG shape implementations for rectangle-based ArchiMate elements.
 */

import { ElementShapeGenerator } from '../shape-registry';
import { generateWrappedText } from '../text-wrapper';

/**
 * Generate SVG for a rectangle element
 */
export const rectangleShape: ElementShapeGenerator = (
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  style: Record<string, unknown> = {},
): string => {
  const {
    fillColor = '#FFFFFF',
    strokeColor = '#000000',
    textColor = '#000000',
    fontSize = 12,
    fontFamily = 'Arial, sans-serif',
    opacity = 1,
    isCompound = false,
  } = style as {
    fillColor?: string;
    strokeColor?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    opacity?: number;
    isCompound?: boolean;
  };
  
  return `
    <g transform="translate(${x}, ${y})">
      <rect
        width="${width}"
        height="${height}"
        rx="0"
        ry="0"
        fill="${fillColor}"
        stroke="${strokeColor}"
        stroke-width="1"
        opacity="${opacity}"
      />
      ${generateWrappedText(width / 2, 0, label, {
    maxWidth: width - 10, // Leave 5px padding on each side
    maxHeight: height,
    fontSize,
    fontFamily,
    textAnchor: 'middle',
    dominantBaseline: 'hanging',
    verticalPosition: isCompound ? 'top' : 'middle',
    textColor,
    isCompound,
  })}
    </g>
  `;
};
