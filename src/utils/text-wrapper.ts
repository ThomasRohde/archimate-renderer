/* eslint-disable max-len */
/**
 * Text Wrapper Utility
 * 
 * This module provides utilities for wrapping text in SVG elements
 * to fit within specified dimensions.
 */

/**
 * Escape special XML characters in a string
 * @param text Text to escape
 * @returns Escaped text safe for XML/SVG
 */
export function escapeXml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Constants for text positioning and padding
 */
export const TEXT_POSITIONING = {
  TOP_PADDING: 3,     // Padding from top of container
  BOTTOM_PADDING: 10,  // Padding from bottom of container  
  SIDE_PADDING: 5,      // Padding from sides of container
};

/**
 * Options for text wrapping
 */
export interface ITextWrapOptions {
  maxWidth: number;
  maxHeight?: number;
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  textAnchor?: 'start' | 'middle' | 'end';
  dominantBaseline?: 'auto' | 'middle' | 'hanging';
  verticalPosition?: 'top' | 'middle' | 'bottom';
  textColor?: string;
  ellipsis?: string;
  maxLines?: number;
  topPadding?: number;    // Custom top padding
  bottomPadding?: number; // Custom bottom padding
  isCompound?: boolean;   // Indicates if the element is compound (has child elements)
}

/**
 * Default options for text wrapping
 */
const defaultOptions: ITextWrapOptions = {
  maxWidth: 100,
  fontSize: 12,
  fontFamily: 'Arial, sans-serif',
  lineHeight: 1.2,
  textAnchor: 'middle',
  dominantBaseline: 'middle',
  verticalPosition: 'middle',
  textColor: '#000000',
  ellipsis: '...',
  maxLines: 0, // 0 means no limit
  topPadding: TEXT_POSITIONING.TOP_PADDING,
  bottomPadding: TEXT_POSITIONING.BOTTOM_PADDING,
};

/**
 * Approximate character width based on font size
 * This is a rough estimate as actual width depends on the specific characters and font
 * @param fontSize Font size in pixels
 * @returns Estimated average character width
 */
function estimateCharWidth(fontSize: number): number {
  // For most fonts, average character width is roughly 0.6 times the font size
  return fontSize * 0.6;
}

/**
 * Wrap text to fit within specified width
 * @param text Text to wrap
 * @param options Wrapping options
 * @returns Array of wrapped text lines
 */
function wrapText(text: string, options: ITextWrapOptions): string[] {
  const { 
    maxWidth, 
    fontSize = defaultOptions.fontSize, 
    maxLines = defaultOptions.maxLines || 0, 
  } = options;
  
  // If text is empty, return empty array
  if (!text || text.trim() === '') {
    return [];
  }
  
  // Estimate characters per line based on font size and max width
  const avgCharWidth = estimateCharWidth(fontSize!);
  
  // Split text into words
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';
  
  // Process each word
  for (const word of words) {
    // Check if adding this word would exceed the line width
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testLineWidth = testLine.length * avgCharWidth;
    
    if (testLineWidth <= maxWidth) {
      // Word fits on current line
      currentLine = testLine;
    } else {
      // Word doesn't fit, start a new line
      if (currentLine) {
        lines.push(currentLine);
      }
      
      // Check if we've reached the maximum number of lines
      if (maxLines > 0 && lines.length >= maxLines) {
        // Add ellipsis to the last line and truncate
        const lastLine = lines[lines.length - 1];
        const ellipsis = options.ellipsis || defaultOptions.ellipsis;
        const truncatedLine = lastLine.substring(0, lastLine.length - ellipsis!.length) + ellipsis;
        lines[lines.length - 1] = truncatedLine;
        break;
      }
      
      // Start new line with current word
      // If the word itself is too long for a line, split it
      if (word.length * avgCharWidth > maxWidth) {
        // Determine how many characters can fit on a line
        const charsPerLine = Math.max(1, Math.floor(maxWidth / avgCharWidth));
        let remainingWord = word;
        
        while (remainingWord.length > 0) {
          const chunk = remainingWord.substring(0, charsPerLine);
          lines.push(chunk);
          remainingWord = remainingWord.substring(charsPerLine);
          
          // Check if we've reached the maximum number of lines
          if (maxLines > 0 && lines.length >= maxLines) {
            // Add ellipsis to the last line and truncate
            const lastLine = lines[lines.length - 1];
            const ellipsis = options.ellipsis || defaultOptions.ellipsis;
            const truncatedLine = lastLine.substring(0, lastLine.length - ellipsis!.length) + ellipsis;
            lines[lines.length - 1] = truncatedLine;
            break;
          }
        }
        
        currentLine = '';
      } else {
        currentLine = word;
      }
    }
  }
  
  // Add the last line if it's not empty
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // If we have a maxLines limit, ensure we don't exceed it
  if (maxLines > 0 && lines.length > maxLines) {
    lines.splice(maxLines);
    // Add ellipsis to the last line
    const lastLine = lines[lines.length - 1];
    const ellipsis = options.ellipsis || defaultOptions.ellipsis;
    lines[lines.length - 1] = lastLine.substring(0, lastLine.length - ellipsis!.length) + ellipsis;
  }
  
  return lines;
}

/**
 * Generate SVG text element with wrapped text
 * @param x X coordinate for text anchor point
 * @param y Y coordinate for text anchor point
 * @param text Text content to wrap
 * @param options Wrapping options
 * @returns SVG text element string with wrapped text
 */
export function generateWrappedText(
  x: number,
  y: number,
  text: string,
  options: Partial<ITextWrapOptions> = {},
): string {
  // Merge with default options
  const mergedOptions: ITextWrapOptions = {
    ...defaultOptions,
    ...options,
  };
  
  const {
    fontSize = defaultOptions.fontSize,
    fontFamily = defaultOptions.fontFamily,
    lineHeight = defaultOptions.lineHeight,
    textAnchor = defaultOptions.textAnchor,
    dominantBaseline = defaultOptions.dominantBaseline,
    verticalPosition = defaultOptions.verticalPosition,
    topPadding = defaultOptions.topPadding,
    bottomPadding = defaultOptions.bottomPadding,
    textColor = defaultOptions.textColor,
    maxHeight = 0,
    isCompound = false,
  } = mergedOptions;
  
  // Wrap the text
  const lines = wrapText(text, mergedOptions);
  
  // If no lines, return empty string
  if (lines.length === 0) {
    return '';
  }
  
  // Calculate line height in pixels
  const lineHeightPx = fontSize! * lineHeight!;
  
  // Calculate total text height
  const totalTextHeight = lines.length * lineHeightPx;
  
  // Calculate appropriate y position based on verticalPosition
  // If the element is compound, force top alignment regardless of verticalPosition setting
  let adjustedY = y;
  
  if (isCompound || verticalPosition === 'top') {
    // Position at top with padding
    // Add small offset to ensure text appears inside the shape
    adjustedY = y + topPadding!;
  } else if (verticalPosition === 'bottom') {
    // For bottom position, we need to place the text so that when all lines are drawn,
    // the bottom line will be at the desired position (container bottom - padding)
    const containerBottomY = y + (maxHeight || 0);
    adjustedY = containerBottomY - bottomPadding! - totalTextHeight + lineHeightPx;
  } else {
    // Middle position - center text vertically in container
    if (maxHeight) {
      // Remove the half line-height offset that was causing the issue
      adjustedY = y + (maxHeight / 2) - (totalTextHeight / 2);
    } else {
      // If no container height is provided, just use the given y
      adjustedY = y;
    }
  }

  // Generate SVG text element with tspan elements for each line
  let svgText = `
    <text
      x="${x}"
      y="${adjustedY}"
      font-family="${fontFamily}"
      font-size="${fontSize}"
      text-anchor="${textAnchor}"
      dominant-baseline="${dominantBaseline === 'middle' ? 'middle' : 'hanging'}"
      fill="${textColor}"
    >`;
  
  // Add tspan elements for each line
  lines.forEach((line, index) => {
    // For first line, no additional offset; for subsequent lines, add lineHeight
    const dy = index === 0 ? 0 : lineHeightPx;
    svgText += `
      <tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`;
  });
  
  // Close text element
  svgText += `
    </text>`;
  
  return svgText;
}

/**
 * Calculate the dimensions of wrapped text
 * @param text Text content to wrap
 * @param options Wrapping options
 * @returns Object with width and height of the wrapped text
 */
export function calculateWrappedTextDimensions(
  text: string,
  options: Partial<ITextWrapOptions> = {},
): { width: number; height: number } {
  // Merge with default options
  const mergedOptions: ITextWrapOptions = {
    ...defaultOptions,
    ...options,
  };
  
  const {
    fontSize = defaultOptions.fontSize,
    lineHeight = defaultOptions.lineHeight,
  } = mergedOptions;
  
  // Wrap the text
  const lines = wrapText(text, mergedOptions);
  
  // If no lines, return zero dimensions
  if (lines.length === 0) {
    return { width: 0, height: 0 };
  }
  
  // Calculate line height in pixels
  const lineHeightPx = fontSize! * lineHeight!;
  
  // Calculate total height
  const height = lines.length * lineHeightPx;
  
  // Calculate maximum line width
  const avgCharWidth = estimateCharWidth(fontSize!);
  const width = Math.max(...lines.map(line => line.length * avgCharWidth));
  
  return { width, height };
}
