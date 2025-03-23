/**
 * Circle Shapes
 * 
 * Provides the SVG shape implementation for a circle element.
 */

import { ElementShapeGenerator, shapeRegistry } from '../shape-registry';
import { generateWrappedText } from '../text-wrapper';

export const circleShape: ElementShapeGenerator = (
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

  // Compute the center and radius of the circle.
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2;

  return `
    <g transform="translate(${x}, ${y})">
      <circle
        cx="${centerX}"
        cy="${centerY}"
        r="${radius}"
        fill="${fillColor}"
        stroke="${strokeColor}"
        stroke-width="1"
        opacity="${opacity}"
      />
      ${generateWrappedText(centerX, centerY, label, {
    maxWidth: width - 10,
    maxHeight: height,
    fontSize,
    fontFamily,
    textAnchor: 'middle',
    dominantBaseline: 'middle',
    textColor,
    isCompound,
  })}
    </g>
  `;
};

shapeRegistry.registerElementShape('circle', circleShape);
