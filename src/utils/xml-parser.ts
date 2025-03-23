/* eslint-disable max-len */
/**
 * Cross-platform XML parser utility
 *
 * This module provides XML parsing functionality that works in both
 * Node.js and browser environments without relying on environment-specific APIs.
 */

// Import xmldom for Node.js environments
let DOMParserImpl: typeof DOMParser;

// Check if we're in a Node.js environment
if (typeof window === 'undefined' || !window.DOMParser) {
  try {
    // Use dynamic import to avoid bundling issues
    const xmldom = require('xmldom');
    DOMParserImpl = xmldom.DOMParser;
  } catch (error) {
    console.error('Failed to load xmldom:', error);
    throw new Error('xmldom is required for Node.js environments');
  }
} else {
  // In browser, use the native DOMParser
  DOMParserImpl = DOMParser;
}

/**
 * Parse XML string into a DOM Document
 * @param xmlString XML content as string
 * @returns DOM Document object
 * @throws Error if parsing fails
 */
export function parseXml(xmlString: string): Document {
  try {
    const parser = new DOMParserImpl();
    const doc = parser.parseFromString(xmlString, 'application/xml');

    // Check for parsing errors in browser environments
    if (typeof window !== 'undefined' && window.DOMParser) {
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error('XML parsing error: ' + parserError.textContent);
      }
    }

    return doc;
  } catch (error) {
    throw new Error(
      `Failed to parse XML: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Get text content of an element
 * @param element DOM Element
 * @param selector CSS selector for the child element
 * @returns Text content of the element or empty string if not found
 */
export function getElementText(element: Element, selector: string): string {
  let child: Element | null = null;

  try {
    // Try browser-style querySelector
    if (typeof element.querySelector === 'function') {
      child = element.querySelector(selector);
    }
    // Fallback for xmldom which doesn't fully implement querySelector
    else {
      const children = element.getElementsByTagName(selector);
      if (children.length > 0) {
        child = children[0];
      }
    }
  } catch (error) {
    console.error('Error in getElementText:', error);
    // Fallback to getElementsByTagName which is more widely supported
    const children = element.getElementsByTagName(selector);
    if (children.length > 0) {
      child = children[0];
    }
  }

  return child ? child.textContent || '' : '';
}

/**
 * Get attribute value of an element
 * @param element DOM Element
 * @param attributeName Name of the attribute
 * @returns Attribute value or null if not found
 */
export function getElementAttribute(element: Element, attributeName: string): string | null {
  return element.getAttribute(attributeName);
}

/**
 * Find elements by XPath
 * @param doc DOM Document
 * @param xpathExpression XPath expression
 * @returns Array of matching elements
 */
export function findElementsByXPath(doc: Document, xpathExpression: string): Element[] {
  // Check if we're in a browser environment with XPath support
  if (typeof document !== 'undefined' && document.evaluate) {
    const result: Element[] = [];
    const xpathResult = document.evaluate(
      xpathExpression,
      doc,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null,
    );

    for (let i = 0; i < xpathResult.snapshotLength; i++) {
      const node = xpathResult.snapshotItem(i) as Element;
      result.push(node);
    }

    return result;
  }
  // If XPath is not supported, use a fallback approach
  else {
    // This is a simplified fallback that only handles very basic XPath expressions
    // In a real implementation, you would use a more robust solution

    // Example: handle simple element selection like '/model/elements/element'
    const parts = xpathExpression.split('/').filter(Boolean);
    let currentElements: Element[] = [doc.documentElement];

    for (const part of parts) {
      const nextElements: Element[] = [];
      for (const element of currentElements) {
        const children = Array.from(element.children);
        nextElements.push(...children.filter((child) => child.tagName === part));
      }
      currentElements = nextElements;
    }

    return currentElements;
  }
}

/**
 * Serialize DOM Document to XML string
 * @param doc DOM Document
 * @returns XML string
 */
export function serializeXml(doc: Document): string {
  try {
    // Check if we're in a browser environment with XMLSerializer
    if (typeof window !== 'undefined' && window.XMLSerializer) {
      const serializer = new XMLSerializer();
      return serializer.serializeToString(doc);
    }
    // If we're in Node.js, use xmldom's XMLSerializer
    else {
      const xmldom = require('xmldom');
      const XMLSerializerImpl = xmldom.XMLSerializer;
      const serializer = new XMLSerializerImpl();
      return serializer.serializeToString(doc);
    }
  } catch (error) {
    console.error('XML serialization error:', error);
    return doc.documentElement?.outerHTML || '<error>XML serialization failed</error>';
  }
}
