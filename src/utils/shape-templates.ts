/* eslint-disable max-len */
/**
 * Shape Templates
 *
 * This module provides SVG shape templates for different ArchiMate elements,
 * arrow heads, and line styles.
 *
 * Note: Element-specific shape files have been removed in favor of the icon-based approach
 * using shape-data.ts. Only base shapes and utility files remain.
 */

import { ArchiMateElementType, ArchiMateRelationshipType, IViewElementStyle } from '../types';

// Base shape imports
import { rectangleShape } from './shapes/rectangle-shapes';
import { roundedRectangleShape } from './shapes/rounded-rectangle-shapes';
import { chamferedRectangleShape } from './shapes/chamfered-rectangle-shapes';
import { circleShape } from './shapes/circle-shapes';

// Arrow head imports
import {
  standardArrowHead,
  outlineArrowHead,
  openArrowHead,
  diamondArrowHead,
  filledDiamondArrowHead,
  circleArrowHead,
  filledCircleArrowHead,
  noArrowHead,
} from './shapes/arrow-heads';

// Line style imports
import { solidLineStyle, dashedLineStyle, dottedLineStyle } from './shapes/line-styles';

// Re-export all shape generators
export {
  // Basic shapes
  rectangleShape,
  roundedRectangleShape,
  chamferedRectangleShape,

  // Arrow heads
  standardArrowHead,
  outlineArrowHead,
  openArrowHead,
  diamondArrowHead,
  filledDiamondArrowHead,
  circleArrowHead,
  filledCircleArrowHead,
  noArrowHead,

  // Line styles
  solidLineStyle,
  dashedLineStyle,
  dottedLineStyle,
};

// ===== Default Mappings =====

/**
 * Default element shape mappings
 *
 * Note: All element-specific shapes have been replaced with base shapes
 * as we now use the icon-based approach from shape-data.ts
 */
export const defaultElementShapeMappings = {
  // Business layer
  [ArchiMateElementType.BusinessActor]: rectangleShape,
  [ArchiMateElementType.BusinessRole]: rectangleShape,
  [ArchiMateElementType.BusinessCollaboration]: rectangleShape,
  [ArchiMateElementType.BusinessInterface]: rectangleShape,
  [ArchiMateElementType.BusinessProcess]: roundedRectangleShape,
  [ArchiMateElementType.BusinessFunction]: roundedRectangleShape,
  [ArchiMateElementType.BusinessInteraction]: roundedRectangleShape,
  [ArchiMateElementType.BusinessEvent]: roundedRectangleShape,
  [ArchiMateElementType.BusinessService]: roundedRectangleShape,
  [ArchiMateElementType.BusinessObject]: rectangleShape,
  [ArchiMateElementType.Contract]: rectangleShape,
  [ArchiMateElementType.Representation]: rectangleShape,
  [ArchiMateElementType.Product]: rectangleShape,

  // Application layer
  [ArchiMateElementType.ApplicationComponent]: rectangleShape,
  [ArchiMateElementType.ApplicationCollaboration]: rectangleShape,
  [ArchiMateElementType.ApplicationInterface]: rectangleShape,
  [ArchiMateElementType.ApplicationFunction]: roundedRectangleShape,
  [ArchiMateElementType.ApplicationInteraction]: roundedRectangleShape,
  [ArchiMateElementType.ApplicationProcess]: roundedRectangleShape,
  [ArchiMateElementType.ApplicationEvent]: roundedRectangleShape,
  [ArchiMateElementType.ApplicationService]: roundedRectangleShape,
  [ArchiMateElementType.DataObject]: rectangleShape,

  // Technology layer
  [ArchiMateElementType.Node]: rectangleShape,
  [ArchiMateElementType.Device]: rectangleShape,
  [ArchiMateElementType.SystemSoftware]: rectangleShape,
  [ArchiMateElementType.TechnologyCollaboration]: rectangleShape,
  [ArchiMateElementType.TechnologyInterface]: rectangleShape,
  [ArchiMateElementType.Path]: rectangleShape,
  [ArchiMateElementType.CommunicationNetwork]: rectangleShape,
  [ArchiMateElementType.TechnologyFunction]: roundedRectangleShape,
  [ArchiMateElementType.TechnologyProcess]: roundedRectangleShape,
  [ArchiMateElementType.TechnologyInteraction]: roundedRectangleShape,
  [ArchiMateElementType.TechnologyEvent]: roundedRectangleShape,
  [ArchiMateElementType.TechnologyService]: roundedRectangleShape,
  [ArchiMateElementType.Artifact]: rectangleShape,

  // Strategy layer
  [ArchiMateElementType.Resource]: rectangleShape,
  [ArchiMateElementType.Capability]: roundedRectangleShape,
  [ArchiMateElementType.ValueStream]: roundedRectangleShape,
  [ArchiMateElementType.CourseOfAction]: roundedRectangleShape,

  // Motivation layer
  [ArchiMateElementType.Stakeholder]: chamferedRectangleShape,
  [ArchiMateElementType.Driver]: chamferedRectangleShape,
  [ArchiMateElementType.Assessment]: chamferedRectangleShape,
  [ArchiMateElementType.Goal]: chamferedRectangleShape,
  [ArchiMateElementType.Outcome]: chamferedRectangleShape,
  [ArchiMateElementType.Principle]: chamferedRectangleShape,
  [ArchiMateElementType.Requirement]: chamferedRectangleShape,
  [ArchiMateElementType.Constraint]: chamferedRectangleShape,
  [ArchiMateElementType.Meaning]: chamferedRectangleShape,
  [ArchiMateElementType.Value]: chamferedRectangleShape,

  // Junction types
  [ArchiMateElementType.AndJunction]: circleShape,
  [ArchiMateElementType.OrJunction]: circleShape,

  // Default for other types
  default: rectangleShape,
};

/**
 * Get the arrow head placement for a relationship
 * @param relationshipType The type of relationship
 * @param accessType Optional accessType for Access relationships
 * @returns Object with source and target boolean flags indicating where to place arrow heads
 */
export function getArrowHeadPlacement(
  relationshipType: ArchiMateRelationshipType,
  accessType?: string,
): { source: boolean; target: boolean } {
  // Default placement (most relationships have arrow at target)
  const defaultPlacement = { source: false, target: true };

  // Handle Composition and Aggregation (arrow at source)
  if (
    relationshipType === ArchiMateRelationshipType.Composition ||
    relationshipType === ArchiMateRelationshipType.Aggregation
  ) {
    return { source: true, target: false };
  }

  // Handle Assignment (filled circle at source, arrow at target)
  if (relationshipType === ArchiMateRelationshipType.Assignment) {
    return { source: true, target: true };
  }

  // Handle Association (no arrows)
  if (relationshipType === ArchiMateRelationshipType.Association) {
    return { source: false, target: false };
  }

  // Handle Access relationships with different accessType values
  if (relationshipType === ArchiMateRelationshipType.Access) {
    if (accessType === 'Read') {
      return { source: true, target: false }; // Arrow at source for Read access
    } else if (accessType === 'Write') {
      return { source: false, target: true }; // Arrow at target for Write access
    } else if (accessType === 'ReadWrite') {
      return { source: true, target: true }; // Arrows at both ends for ReadWrite access
    }
  }

  // For other relationship types, use the default placement
  return defaultPlacement;
}

/**
 * Get the appropriate arrow head for a relationship's target end
 * @param relationshipType The type of relationship
 * @param accessType Optional accessType for Access relationships
 * @returns The arrow head generator function
 */
export function getArrowHeadForRelationship(
  relationshipType: ArchiMateRelationshipType,
  _accessType?: string,
): (x: number, y: number, angle: number, style: IViewElementStyle) => string {
  // For Access relationships, always use openArrowHead regardless of accessType
  if (relationshipType === ArchiMateRelationshipType.Access) {
    return openArrowHead;
  }

  // For other relationship types, use the default mappings
  return (
    defaultArrowHeadMappings[relationshipType as keyof typeof defaultArrowHeadMappings] ||
    defaultArrowHeadMappings['default']
  );
}

/**
 * Get the appropriate arrow head for a relationship's source end
 * @param relationshipType The type of relationship
 * @param accessType Optional accessType for Access relationships
 * @returns The arrow head generator function
 */
export function getSourceArrowHeadForRelationship(
  relationshipType: ArchiMateRelationshipType,
  _accessType?: string,
): (x: number, y: number, angle: number, style: IViewElementStyle) => string {
  // For Assignment relationships, use filledCircleArrowHead at the source end
  if (relationshipType === ArchiMateRelationshipType.Assignment) {
    return filledCircleArrowHead;
  }

  // For Access relationships with Read or ReadWrite access, use openArrowHead
  if (
    relationshipType === ArchiMateRelationshipType.Access &&
    (_accessType === 'Read' || _accessType === 'ReadWrite')
  ) {
    return openArrowHead;
  }

  // For Composition relationships, use filledDiamondArrowHead
  if (relationshipType === ArchiMateRelationshipType.Composition) {
    return filledDiamondArrowHead;
  }

  // For Aggregation relationships, use diamondArrowHead
  if (relationshipType === ArchiMateRelationshipType.Aggregation) {
    return diamondArrowHead;
  }

  // Default to no arrow head for other relationship types at the source end
  return noArrowHead;
}

/**
 * Default relationship arrow head mappings
 */
export const defaultArrowHeadMappings = {
  [ArchiMateRelationshipType.Composition]: filledDiamondArrowHead,
  [ArchiMateRelationshipType.Aggregation]: diamondArrowHead,
  [ArchiMateRelationshipType.Assignment]: standardArrowHead,
  [ArchiMateRelationshipType.Realization]: outlineArrowHead,
  [ArchiMateRelationshipType.Serving]: openArrowHead,
  [ArchiMateRelationshipType.Access]: openArrowHead, // Default for Access, can be overridden by accessType
  [ArchiMateRelationshipType.Influence]: openArrowHead,
  [ArchiMateRelationshipType.Triggering]: standardArrowHead,
  [ArchiMateRelationshipType.Flow]: standardArrowHead,
  [ArchiMateRelationshipType.Specialization]: outlineArrowHead,
  [ArchiMateRelationshipType.Association]: noArrowHead, // Association relationships don't have arrow heads

  // Default for other types
  default: standardArrowHead,
};

/**
 * Default relationship line style mappings
 */
export const defaultLineStyleMappings = {
  [ArchiMateRelationshipType.Composition]: solidLineStyle,
  [ArchiMateRelationshipType.Aggregation]: solidLineStyle,
  [ArchiMateRelationshipType.Assignment]: solidLineStyle,
  [ArchiMateRelationshipType.Realization]: dottedLineStyle,
  [ArchiMateRelationshipType.Serving]: solidLineStyle,
  [ArchiMateRelationshipType.Access]: dottedLineStyle,
  [ArchiMateRelationshipType.Influence]: dashedLineStyle,
  [ArchiMateRelationshipType.Triggering]: solidLineStyle,
  [ArchiMateRelationshipType.Flow]: dashedLineStyle,
  [ArchiMateRelationshipType.Specialization]: solidLineStyle,
  [ArchiMateRelationshipType.Association]: solidLineStyle,

  // Default for other types
  default: solidLineStyle,
};
