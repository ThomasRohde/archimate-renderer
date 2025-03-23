/**
 * Compound Element Detector Utility
 * 
 * This module provides utilities for detecting compound elements (elements that contain other elements)
 * and adjusting their label positioning.
 */

import { IArchiMateViewElement } from '../types';

/**
 * Checks if an element is wholly contained within another element
 * @param childElement The potential child element
 * @param parentElement The potential parent element
 * @returns True if the child element is wholly contained within the parent element
 */
export function isElementContainedWithin(
  childElement: IArchiMateViewElement,
  parentElement: IArchiMateViewElement,
): boolean {
  // Check if the child element is completely inside the parent element
  return (
    childElement.x >= parentElement.x &&
    childElement.y >= parentElement.y &&
    childElement.x + childElement.width <= parentElement.x + parentElement.width &&
    childElement.y + childElement.height <= parentElement.y + parentElement.height
  );
}

/**
 * Identifies compound elements in a view and marks them for top-aligned labels
 * @param viewElements Array of view elements
 * @returns A map of element references to boolean indicating if they are compound elements
 */
export function identifyCompoundElements(
  viewElements: IArchiMateViewElement[],
): Map<string, boolean> {
  const compoundElements = new Map<string, boolean>();
  
  // Initialize all elements as non-compound
  viewElements.forEach(element => {
    compoundElements.set(element.elementRef, false);
  });
  
  // Check each pair of elements to identify parent-child relationships
  for (const potentialParent of viewElements) {
    for (const potentialChild of viewElements) {
      // Skip self-comparison
      if (potentialParent.elementRef === potentialChild.elementRef) {
        continue;
      }
      
      // Check if the potential child is contained within the potential parent
      if (isElementContainedWithin(potentialChild, potentialParent)) {
        // Mark the parent as a compound element
        compoundElements.set(potentialParent.elementRef, true);
      }
    }
  }
  
  return compoundElements;
}

/**
 * Processes view elements to identify compound elements and update their style
 * for top-aligned labels
 * @param viewElements Array of view elements
 * @returns Updated array of view elements with compound information
 */
export function processCompoundElements(
  viewElements: IArchiMateViewElement[],
): IArchiMateViewElement[] {
  // Identify compound elements
  const compoundElements = identifyCompoundElements(viewElements);
  
  // Update the style of each element based on whether it's a compound element
  return viewElements.map(element => {
    const isCompound = compoundElements.get(element.elementRef) || false;
    
    // If the element is a compound element, update its style to include the isCompound flag
    if (isCompound) {
      return {
        ...element,
        style: {
          ...element.style,
          isCompound: true,
        },
      };
    }
    
    return element;
  });
}
