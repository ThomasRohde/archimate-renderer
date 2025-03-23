/**
 * Chamfered Rectangle Shapes
 *
 * This module provides SVG shape implementations for chamfered rectangle-based ArchiMate elements.
 * Chamfered rectangles are primarily used for motivation elements like Goal, Principle, Requirement, etc.
 */

import { ElementShapeGenerator } from '../shape-registry';
import { generateWrappedText } from '../text-wrapper';

/**
 * Generate SVG for a chamfered rectangle element.
 * A chamfered rectangle has cut corners (chamfers) instead of rounded corners.
 */
export const chamferedRectangleShape: ElementShapeGenerator = (
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
    chamferSize = 10,
    isCompound = false,
  } = style as {
    fillColor?: string;
    strokeColor?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    opacity?: number;
    chamferSize?: number;
    isCompound?: boolean;
  };

  // Create a path for a rectangle with chamfered (cut) corners
  const path = [
    `M ${chamferSize},0`,
    `L ${width - chamferSize},0`,
    `L ${width},${chamferSize}`,
    `L ${width},${height - chamferSize}`,
    `L ${width - chamferSize},${height}`,
    `L ${chamferSize},${height}`,
    `L 0,${height - chamferSize}`,
    `L 0,${chamferSize}`,
    'Z',
  ].join(' ');

  return `
    <g transform="translate(${x}, ${y})">
      <path
        d="${path}"
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
