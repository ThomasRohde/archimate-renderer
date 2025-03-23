/**
 * Line Styles
 *
 * This module provides SVG implementations for different line styles
 * used in ArchiMate relationship connectors.
 */

import { LineStyleGenerator } from '../shape-registry';

/**
 * Generate SVG for a solid line
 */
export const solidLineStyle: LineStyleGenerator = (
  pathData: string,
  style: Record<string, unknown> = {},
): string => {
  const { strokeColor = '#000000', strokeWidth = 1 } = style as {
    strokeColor?: string;
    strokeWidth?: number;
  };

  return `
    <path
      d="${pathData}"
      fill="none"
      stroke="${strokeColor}"
      stroke-width="${strokeWidth}"
    />
  `;
};

/**
 * Generate SVG for a dashed line
 */
export const dashedLineStyle: LineStyleGenerator = (
  pathData: string,
  style: Record<string, unknown> = {},
): string => {
  const {
    strokeColor = '#000000',
    strokeWidth = 1,
    dashArray = '5,5',
  } = style as {
    strokeColor?: string;
    strokeWidth?: number;
    dashArray?: string;
  };

  return `
    <path
      d="${pathData}"
      fill="none"
      stroke="${strokeColor}"
      stroke-width="${strokeWidth}"
      stroke-dasharray="${dashArray}"
    />
  `;
};

/**
 * Generate SVG for a dotted line
 */
export const dottedLineStyle: LineStyleGenerator = (
  pathData: string,
  style: Record<string, unknown> = {},
): string => {
  const { strokeColor = '#000000', strokeWidth = 1 } = style as {
    strokeColor?: string;
    strokeWidth?: number;
  };

  return `
    <path
      d="${pathData}"
      fill="none"
      stroke="${strokeColor}"
      stroke-width="${strokeWidth}"
      stroke-dasharray="1,3"
    />
  `;
};
