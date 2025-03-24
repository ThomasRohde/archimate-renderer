/* eslint-disable max-len */
/**
 * SVG Generator Utility
 *
 * This module provides utilities for generating SVG elements
 * for ArchiMate diagrams.
 */

import {
  IViewElementStyle,
  IViewRelationshipStyle,
  IPoint,
  ArchiMateElementType,
  ArchiMateRelationshipType,
  IArchiMateRelationship,
} from '../types';
import { escapeXml } from './text-wrapper';

/**
 * Rectangle interface for bounding box calculations
 */
export interface IRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}
import { shapeRegistry } from './shape-registry';
import {
  rectangleShape,
  defaultArrowHeadMappings,
  defaultLineStyleMappings,
  solidLineStyle,
  getArrowHeadForRelationship,
  getSourceArrowHeadForRelationship,
  getArrowHeadPlacement,
} from './shape-templates';
import { createElementShapeGenerator } from './icon-renderer';
import { ARROW_HEAD_SIZES } from './shapes/arrow-heads';

// Initialize the shape registry with default mappings
function initializeShapeRegistry(): void {
  // Register default element shapes
  shapeRegistry.registerDefaultElementShape(rectangleShape);

  // Register element shapes using the icon-based generators
  // Register all ArchiMate element types
  for (const elementType in ArchiMateElementType) {
    if (Object.prototype.hasOwnProperty.call(ArchiMateElementType, elementType)) {
      const type = ArchiMateElementType[elementType as keyof typeof ArchiMateElementType];
      const generator = createElementShapeGenerator(type);
      shapeRegistry.registerElementShape(type, generator);
    }
  }

  // Register arrow heads
  for (const [type, generator] of Object.entries(defaultArrowHeadMappings)) {
    shapeRegistry.registerArrowHead(type, generator);
  }

  // Register line styles
  for (const [type, generator] of Object.entries(defaultLineStyleMappings)) {
    shapeRegistry.registerLineStyle(type, generator);
  }
}

// Initialize the registry
initializeShapeRegistry();

/**
 * Generate SVG for an element based on its type
 * @param x X coordinate
 * @param y Y coordinate
 * @param width Width of the element
 * @param height Height of the element
 * @param label Text label
 * @param elementType ArchiMate element type
 * @param style Style properties
 * @returns SVG string for the element
 */
export function generateElement(
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  elementType: ArchiMateElementType | string = 'default',
  style: IViewElementStyle = {},
): string {
  // Get the shape generator for this element type
  const shapeGenerator = shapeRegistry.getElementShape(elementType);

  // If no generator is found, use the rectangle shape as fallback
  if (!shapeGenerator) {
    return rectangleShape(x, y, width, height, label, style);
  }

  // Generate the SVG using the shape generator
  return shapeGenerator(x, y, width, height, label, style);
}

/**
 * Generate SVG for a rectangle element (maintained for backward compatibility)
 * @param x X coordinate
 * @param y Y coordinate
 * @param width Width of the rectangle
 * @param height Height of the rectangle
 * @param label Text label
 * @param style Style properties
 * @returns SVG string for the rectangle
 */
export function generateRectangle(
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  style: IViewElementStyle = {},
): string {
  return rectangleShape(x, y, width, height, label, style);
}

/**
 * Calculate the intersection point of a line with a rectangle
 * @param lineStart Start point of the line
 * @param lineEnd End point of the line
 * @param rect Rectangle defined by {x, y, width, height}
 * @returns Intersection point or null if no intersection
 */
function calculateIntersection(
  lineStart: IPoint,
  lineEnd: IPoint,
  rect: IRectangle,
): IPoint | null {
  // Convert rectangle to four line segments
  const topLeft = { x: rect.x, y: rect.y };
  const topRight = { x: rect.x + rect.width, y: rect.y };
  const bottomLeft = { x: rect.x, y: rect.y + rect.height };
  const bottomRight = { x: rect.x + rect.width, y: rect.y + rect.height };

  // Define the four edges of the rectangle
  const edges = [
    { start: topLeft, end: topRight }, // Top edge
    { start: topRight, end: bottomRight }, // Right edge
    { start: bottomRight, end: bottomLeft }, // Bottom edge
    { start: bottomLeft, end: topLeft }, // Left edge
  ];

  // Find the closest intersection point
  let closestIntersection: IPoint | null = null;
  let minDistance = Number.MAX_VALUE;

  for (const edge of edges) {
    const intersection = lineIntersection(lineStart, lineEnd, edge.start, edge.end);

    if (intersection) {
      // Calculate distance from lineStart to intersection
      const distance = Math.sqrt(
        Math.pow(intersection.x - lineStart.x, 2) + Math.pow(intersection.y - lineStart.y, 2),
      );

      // Keep the closest intersection
      if (distance < minDistance) {
        minDistance = distance;
        closestIntersection = intersection;
      }
    }
  }

  return closestIntersection;
}

/**
 * Calculate the intersection point of two line segments
 * @param line1Start Start point of the first line
 * @param line1End End point of the first line
 * @param line2Start Start point of the second line
 * @param line2End End point of the second line
 * @returns Intersection point or null if no intersection
 */
function lineIntersection(
  line1Start: IPoint,
  line1End: IPoint,
  line2Start: IPoint,
  line2End: IPoint,
): IPoint | null {
  // Line 1 represented as a1x + b1y = c1
  const a1 = line1End.y - line1Start.y;
  const b1 = line1Start.x - line1End.x;
  const c1 = a1 * line1Start.x + b1 * line1Start.y;

  // Line 2 represented as a2x + b2y = c2
  const a2 = line2End.y - line2Start.y;
  const b2 = line2Start.x - line2End.x;
  const c2 = a2 * line2Start.x + b2 * line2Start.y;

  const determinant = a1 * b2 - a2 * b1;

  // If lines are parallel, no intersection
  if (determinant === 0) {
    return null;
  }

  // Calculate intersection point
  const x = (b2 * c1 - b1 * c2) / determinant;
  const y = (a1 * c2 - a2 * c1) / determinant;

  // Check if the intersection point is on both line segments
  const onLine1 = isPointOnLineSegment(line1Start, line1End, { x, y });
  const onLine2 = isPointOnLineSegment(line2Start, line2End, { x, y });

  if (onLine1 && onLine2) {
    return { x, y };
  }

  return null;
}

/**
 * Check if a point is on a line segment
 * @param lineStart Start point of the line segment
 * @param lineEnd End point of the line segment
 * @param point Point to check
 * @returns True if the point is on the line segment, false otherwise
 */
function isPointOnLineSegment(lineStart: IPoint, lineEnd: IPoint, point: IPoint): boolean {
  // Check if the point is within the bounding box of the line segment
  const minX = Math.min(lineStart.x, lineEnd.x);
  const maxX = Math.max(lineStart.x, lineEnd.x);
  const minY = Math.min(lineStart.y, lineEnd.y);
  const maxY = Math.max(lineStart.y, lineEnd.y);

  return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
}

/**
 * Gets the appropriate arrow head size for a relationship type
 * @param relationshipType ArchiMate relationship type
 * @param isSource Whether this is for the source arrow head
 * @param relationship Optional relationship object with additional properties
 * @returns The size to use for the arrow head
 */
function getArrowHeadSizeForRelationship(
  relationshipType: ArchiMateRelationshipType | string,
  isSource: boolean,
): number {
  // For source arrow head
  if (isSource) {
    if ((relationshipType as ArchiMateRelationshipType) === ArchiMateRelationshipType.Assignment) {
      return ARROW_HEAD_SIZES.FILLED_CIRCLE;
    }
    if ((relationshipType as ArchiMateRelationshipType) === ArchiMateRelationshipType.Composition) {
      return ARROW_HEAD_SIZES.FILLED_DIAMOND;
    }
    if ((relationshipType as ArchiMateRelationshipType) === ArchiMateRelationshipType.Aggregation) {
      return ARROW_HEAD_SIZES.DIAMOND;
    }
  } else {
    // For target arrow head
    if ((relationshipType as ArchiMateRelationshipType) === ArchiMateRelationshipType.Access) {
      return ARROW_HEAD_SIZES.STANDARD;
    }
    if (
      (relationshipType as ArchiMateRelationshipType) === ArchiMateRelationshipType.Serving ||
      (relationshipType as ArchiMateRelationshipType) === ArchiMateRelationshipType.Realization ||
      (relationshipType as ArchiMateRelationshipType) === ArchiMateRelationshipType.Association
    ) {
      return ARROW_HEAD_SIZES.STANDARD;
    }
  }

  // Default sizes for other types
  return isSource ? ARROW_HEAD_SIZES.STANDARD : ARROW_HEAD_SIZES.STANDARD;
}

/**
 * Calculate an appropriate offset for arrow head positioning based on size
 * @param arrowHeadSize The size of the arrow head
 * @param relationshipType The type of relationship
 * @param isSource Whether this is for the source arrow head
 * @returns The offset value to use
 */
function calculateArrowHeadOffset(
  arrowHeadSize: number,
  relationshipType: ArchiMateRelationshipType | string,
  isSource: boolean,
): number {
  // Special case for Assignment relationships
  if (
    isSource &&
    (relationshipType as ArchiMateRelationshipType) === ArchiMateRelationshipType.Assignment
  ) {
    const circleRadius = arrowHeadSize / 2;
    const ASSIGNMENT_CIRCLE_OFFSET = 1.1;
    return circleRadius * ASSIGNMENT_CIRCLE_OFFSET;
  }

  // For diamond shapes (Composition, Aggregation)
  if (
    isSource &&
    ((relationshipType as ArchiMateRelationshipType) === ArchiMateRelationshipType.Composition ||
      (relationshipType as ArchiMateRelationshipType) === ArchiMateRelationshipType.Aggregation)
  ) {
    return arrowHeadSize * 1.0; // Adjust this factor as needed
  }

  // Default offset based on arrow head size
  return arrowHeadSize * 1.0; // Adjust this factor as needed
}

/**
 * Generate SVG for a connection/relationship with rectangle elements
 * @param sourceElement Source element rectangle {x, y, width, height}
 * @param targetElement Target element rectangle {x, y, width, height}
 * @param label Optional relationship label
 * @param relationshipType ArchiMate relationship type
 * @param bendpoints Optional array of bendpoints
 * @param style Style properties
 * @param relationship Optional relationship object with additional properties like accessType
 * @returns SVG string for the connection
 */
export function generateConnectionWithRectangles(
  sourceElement: IRectangle,
  targetElement: IRectangle,
  label?: string,
  relationshipType: ArchiMateRelationshipType | string = 'default',
  bendpoints: IPoint[] = [],
  style: IViewRelationshipStyle = {},
  relationship?: IArchiMateRelationship,
): string {
  const { textColor = '#000000', fontSize = 10, fontFamily = 'Arial, sans-serif' } = style;

  // Calculate center points
  const sourceCenter: IPoint = {
    x: sourceElement.x + sourceElement.width / 2,
    y: sourceElement.y + sourceElement.height / 2,
  };

  const targetCenter: IPoint = {
    x: targetElement.x + targetElement.width / 2,
    y: targetElement.y + targetElement.height / 2,
  };

  // Points for the path
  let pathPoints: IPoint[] = [];

  // Handle bendpoints
  if (bendpoints.length > 0) {
    // Calculate intersection with source element (from source center to first bendpoint)
    const firstBendpoint = bendpoints[0];
    const sourceIntersection = calculateIntersection(sourceCenter, firstBendpoint, sourceElement);

    // Calculate intersection with target element (from last bendpoint to target center)
    const lastBendpoint = bendpoints[bendpoints.length - 1];
    const targetIntersection = calculateIntersection(lastBendpoint, targetCenter, targetElement);

    // Build path points
    pathPoints.push(sourceIntersection || sourceCenter);
    pathPoints = pathPoints.concat(bendpoints);
    pathPoints.push(targetIntersection || targetCenter);
  } else {
    // No bendpoints, direct line from source to target
    // Calculate intersections with source and target elements
    const sourceIntersection = calculateIntersection(sourceCenter, targetCenter, sourceElement);

    const targetIntersection = calculateIntersection(sourceCenter, targetCenter, targetElement);

    // Build path points
    pathPoints.push(sourceIntersection || sourceCenter);
    pathPoints.push(targetIntersection || targetCenter);
  }

  // Generate path data
  let pathData = `M ${pathPoints[0].x} ${pathPoints[0].y}`;

  for (let i = 1; i < pathPoints.length; i++) {
    pathData += ` L ${pathPoints[i].x} ${pathPoints[i].y}`;
  }

  // Calculate midpoint for label placement
  const midIndex = Math.floor(pathPoints.length / 2);
  const midX =
    pathPoints.length % 2 === 0
      ? (pathPoints[midIndex - 1].x + pathPoints[midIndex].x) / 2
      : pathPoints[midIndex].x;

  const midY =
    pathPoints.length % 2 === 0
      ? (pathPoints[midIndex - 1].y + pathPoints[midIndex].y) / 2
      : pathPoints[midIndex].y;

  // Get the line style generator
  const lineStyleGenerator = shapeRegistry.getLineStyle(relationshipType);

  // Get the arrow head generator based on relationship type
  const arrowHeadGenerator =
    relationship &&
    (relationshipType as ArchiMateRelationshipType) === ArchiMateRelationshipType.Access
      ? getArrowHeadForRelationship(
          relationshipType as ArchiMateRelationshipType,
          relationship.accessType,
      )
      : shapeRegistry.getArrowHead(relationshipType);

  // Get arrow head placement
  const placement =
    relationship &&
    (relationshipType as ArchiMateRelationshipType) === ArchiMateRelationshipType.Access
      ? getArrowHeadPlacement(
          relationshipType as ArchiMateRelationshipType,
          relationship.accessType,
      )
      : getArrowHeadPlacement(relationshipType as ArchiMateRelationshipType);

  // Variables for source and target arrow heads
  let sourceArrowHeadX = 0,
    sourceArrowHeadY = 0,
    sourceAngle = 0;
  let targetArrowHeadX = 0,
    targetArrowHeadY = 0,
    targetAngle = 0;

  // Calculate source arrow head position and angle if needed
  if (placement.source) {
    const startPoint = pathPoints[0];
    const secondPoint = pathPoints[1];
    const dx = secondPoint.x - startPoint.x;
    const dy = secondPoint.y - startPoint.y;
    sourceAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

    // Calculate distance and unit vector for positioning
    const distance = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / distance;
    const unitY = dy / distance;

    // Get the appropriate arrow head size for this relationship
    const arrowHeadSize = getArrowHeadSizeForRelationship(
      relationshipType,
      true, // isSource
    );

    // Calculate appropriate offset based on arrow head size and relationship type
    const offset = calculateArrowHeadOffset(
      arrowHeadSize,
      relationshipType,
      true, // isSource
    );

    sourceArrowHeadX = startPoint.x + unitX * offset;
    sourceArrowHeadY = startPoint.y + unitY * offset;

    // For non-Assignment relationships, adjust the path to start at the arrow head
    if ((relationshipType as ArchiMateRelationshipType) !== ArchiMateRelationshipType.Assignment) {
      pathPoints[0] = { x: sourceArrowHeadX, y: sourceArrowHeadY };
    }
  }

  // Calculate target arrow head position and angle if needed
  if (placement.target) {
    const lastPoint = pathPoints[pathPoints.length - 2];
    const endPoint = pathPoints[pathPoints.length - 1];
    const dx = endPoint.x - lastPoint.x;
    const dy = endPoint.y - lastPoint.y;
    targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

    // For most target arrow heads, position at the end point
    targetArrowHeadX = endPoint.x;
    targetArrowHeadY = endPoint.y;
  }

  // Regenerate path data with the updated points
  pathData = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
  for (let i = 1; i < pathPoints.length; i++) {
    pathData += ` L ${pathPoints[i].x} ${pathPoints[i].y}`;
  }

  // Get the source arrow head generator based on relationship type
  const sourceArrowHeadGenerator =
    relationship &&
    (relationshipType as ArchiMateRelationshipType) === ArchiMateRelationshipType.Access
      ? getSourceArrowHeadForRelationship(
          relationshipType as ArchiMateRelationshipType,
          relationship.accessType,
      )
      : getSourceArrowHeadForRelationship(relationshipType as ArchiMateRelationshipType);

  // Generate SVG
  return `
    <g>
      ${lineStyleGenerator ? lineStyleGenerator(pathData, style) : solidLineStyle(pathData, style)}
      ${placement.source && sourceArrowHeadGenerator ? sourceArrowHeadGenerator(sourceArrowHeadX, sourceArrowHeadY, sourceAngle + 180, style) : ''}
      ${placement.target && arrowHeadGenerator ? arrowHeadGenerator(targetArrowHeadX, targetArrowHeadY, targetAngle, style) : ''}
      ${
  label
    ? `
        <text
          x="${midX}"
          y="${midY - 5}"
          font-family="${fontFamily}"
          font-size="${fontSize}"
          text-anchor="middle"
          fill="${textColor}"
        >${escapeXml(label)}</text>
      `
    : ''
}
    </g>
  `;
}

/**
 * Generate SVG for a connection/relationship
 * @param sourceX Source X coordinate
 * @param sourceY Source Y coordinate
 * @param targetX Target X coordinate
 * @param targetY Target Y coordinate
 * @param label Optional relationship label
 * @param relationshipType ArchiMate relationship type
 * @param bendpoints Optional array of bendpoints
 * @param style Style properties
 * @param relationship Optional relationship object with additional properties like accessType
 * @returns SVG string for the connection
 */
export function generateConnection(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  label?: string,
  relationshipType: ArchiMateRelationshipType | string = 'default',
  bendpoints: IPoint[] = [],
  style: IViewRelationshipStyle = {},
  relationship?: IArchiMateRelationship,
): string {
  // Create dummy rectangles centered at the provided points
  const sourceElement: IRectangle = {
    x: sourceX - 1,
    y: sourceY - 1,
    width: 2,
    height: 2,
  };

  const targetElement: IRectangle = {
    x: targetX - 1,
    y: targetY - 1,
    width: 2,
    height: 2,
  };

  return generateConnectionWithRectangles(
    sourceElement,
    targetElement,
    label,
    relationshipType,
    bendpoints,
    style,
    relationship,
  );
}

/**
 * Generate a complete SVG document
 * @param content SVG content elements
 * @param width SVG width
 * @param height SVG height
 * @param backgroundColor Background color
 * @returns Complete SVG document as string
 */
export function generateSvgDocument(
  content: string,
  width: number = 800,
  height: number = 600,
  backgroundColor: string = '#FFFFFF',
): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      ${content}
    </svg>
  `
    .trim()
    .replace(/\n\s+/g, '\n  ');
}
