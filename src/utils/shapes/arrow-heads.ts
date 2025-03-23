/**
 * Arrow Heads
 *
 * This module provides SVG implementations for different arrow head styles
 * used in ArchiMate relationship connectors.
 */

import { ArrowHeadGenerator } from '../shape-registry';

/**
 * Arrow head size constants
 */
export const ARROW_HEAD_SIZES = {
  STANDARD: 10,
  OUTLINE: 10,
  OPEN: 10,
  DIAMOND: 15,
  FILLED_DIAMOND: 15,
  CIRCLE: 6,
  FILLED_CIRCLE: 6,
};

/**
 * Generate an empty SVG (no arrow head)
 */
export const noArrowHead: ArrowHeadGenerator = (): string => {
  return ''; // Return empty string - no arrow head
};

/**
 * Generate SVG for a standard arrow head
 */
export const standardArrowHead: ArrowHeadGenerator = (
  x: number,
  y: number,
  angle: number,
  style: Record<string, unknown> = {},
): string => {
  const {
    strokeColor = '#000000',
    fillColor = '#000000',
    size = ARROW_HEAD_SIZES.STANDARD,
  } = style as { strokeColor?: string; fillColor?: string; size?: number };

  // Calculate arrow points
  const points = ['0,0', `-${size},-${size / 2}`, `-${size},${size / 2}`].join(' ');

  return `
    <g transform="translate(${x}, ${y}) rotate(${angle})">
      <polygon
        points="${points}"
        fill="${fillColor}"
        stroke="${strokeColor}"
        stroke-width="1"
      />
    </g>
  `;
};

/**
 * Generate SVG for a non-filled standard arrow head (white fill)
 */
export const outlineArrowHead: ArrowHeadGenerator = (
  x: number,
  y: number,
  angle: number,
  style: Record<string, unknown> = {},
): string => {
  const {
    strokeColor = '#000000',
    fillColor = '#FFFFFF',
    size = ARROW_HEAD_SIZES.OUTLINE,
  } = style as { strokeColor?: string; fillColor?: string; size?: number };

  // Calculate arrow points
  const points = ['0,0', `-${size},-${size / 2}`, `-${size},${size / 2}`].join(' ');

  return `
    <g transform="translate(${x}, ${y}) rotate(${angle})">
      <polygon
        points="${points}"
        fill="${fillColor}"
        stroke="${strokeColor}"
        stroke-width="1"
      />
    </g>
  `;
};

/**
 * Generate SVG for an open arrow head
 */
export const openArrowHead: ArrowHeadGenerator = (
  x: number,
  y: number,
  angle: number,
  style: Record<string, unknown> = {},
): string => {
  const { strokeColor = '#000000', size = ARROW_HEAD_SIZES.OPEN } = style as {
    strokeColor?: string;
    size?: number;
  };

  return `
    <g transform="translate(${x}, ${y}) rotate(${angle})">
      <path
        d="M 0,0 L -${size},-${size / 2} M 0,0 L -${size},${size / 2}"
        fill="none"
        stroke="${strokeColor}"
        stroke-width="1"
      />
    </g>
  `;
};

/**
 * Generate SVG for a diamond arrow head (white fill - used for aggregation)
 */
export const diamondArrowHead: ArrowHeadGenerator = (
  x: number,
  y: number,
  angle: number,
  style: Record<string, unknown> = {},
): string => {
  const {
    strokeColor = '#000000',
    fillColor = '#FFFFFF',
    size = ARROW_HEAD_SIZES.DIAMOND,
  } = style as { strokeColor?: string; fillColor?: string; size?: number };

  // Calculate diamond points - shifted so the tip is at the shape boundary
  const points = [`${size},0`, `${size / 2},-${size / 3}`, '0,0', `${size / 2},${size / 3}`].join(
    ' ',
  );

  return `
    <g transform="translate(${x}, ${y}) rotate(${angle})">
      <polygon
        points="${points}"
        fill="${fillColor}"
        stroke="${strokeColor}"
        stroke-width="1"
      />
    </g>
  `;
};

/**
 * Generate SVG for a filled diamond arrow head (black fill - used for composition)
 */
export const filledDiamondArrowHead: ArrowHeadGenerator = (
  x: number,
  y: number,
  angle: number,
  style: Record<string, unknown> = {},
): string => {
  const {
    strokeColor = '#000000',
    fillColor = '#000000',
    size = ARROW_HEAD_SIZES.FILLED_DIAMOND,
  } = style as { strokeColor?: string; fillColor?: string; size?: number };

  // Calculate diamond points - shifted so the tip is at the shape boundary
  const points = [`${size},0`, `${size / 2},-${size / 3}`, '0,0', `${size / 2},${size / 3}`].join(
    ' ',
  );

  return `
    <g transform="translate(${x}, ${y}) rotate(${angle})">
      <polygon
        points="${points}"
        fill="${fillColor}"
        stroke="${strokeColor}"
        stroke-width="1"
      />
    </g>
  `;
};

/**
 * Generate SVG for a circle arrow head
 */
export const circleArrowHead: ArrowHeadGenerator = (
  x: number,
  y: number,
  angle: number,
  style: Record<string, unknown> = {},
): string => {
  const {
    strokeColor = '#000000',
    fillColor = '#FFFFFF',
    size = ARROW_HEAD_SIZES.CIRCLE,
  } = style as { strokeColor?: string; fillColor?: string; size?: number };

  return `
    <g>
      <circle
        cx="${x}"
        cy="${y}"
        r="${size / 2}"
        fill="${fillColor}"
        stroke="${strokeColor}"
        stroke-width="1"
      />
    </g>
  `;
};

/**
 * Generate SVG for a filled circle arrow head
 */
export const filledCircleArrowHead: ArrowHeadGenerator = (
  x: number,
  y: number,
  angle: number,
  style: Record<string, unknown> = {},
): string => {
  const {
    strokeColor = '#000000',
    fillColor = '#000000',
    size = ARROW_HEAD_SIZES.FILLED_CIRCLE,
  } = style as { strokeColor?: string; fillColor?: string; size?: number };

  return `
    <g>
      <circle
        cx="${x}"
        cy="${y}"
        r="${size / 2}"
        fill="${fillColor}"
        stroke="${strokeColor}"
        stroke-width="1"
      />
    </g>
  `;
};
