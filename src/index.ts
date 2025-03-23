/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable max-len */
/**
 * archimate-renderer
 * A library for rendering ArchiMate models as SVG in both Node.js and browser environments
 */

import { parseXml, getElementText, getElementAttribute } from './utils/xml-parser';
import {
  generateElement,
  generateConnectionWithRectangles,
  generateSvgDocument,
} from './utils/svg-generator';
import { escapeXml } from './utils/text-wrapper';
import { processCompoundElements } from './utils/compound-element-detector';
import type {
  IArchiMateElement,
  IArchiMateRelationship,
  IArchiMateView,
  IArchiMateViewElement,
  IPoint,
  IViewElementStyle,
  IViewRelationshipStyle,
} from './types';

// Export shape registry for customization
export { shapeRegistry } from './utils/shape-registry';
export {
  ElementShapeGenerator,
  ArrowHeadGenerator,
  LineStyleGenerator,
} from './utils/shape-registry';

// Export shape templates for reuse
export * from './utils/shape-templates';

// Export text wrapping utility
export * from './utils/text-wrapper';

// Export compound element detector utility
export * from './utils/compound-element-detector';

// Types
export interface IArchiMateRendererOptions {
  width?: number;
  height?: number;
  padding?: number;
  fontFamily?: string;
  fontSize?: number;
  colors?: Record<string, string>;
}

export interface IViewIdentifier {
  id?: string;
  name?: string;
}

/**
 * Main renderer class for converting ArchiMate XML to SVG
 */
export class ArchiMateRenderer {
  private options: IArchiMateRendererOptions;
  private xmlDoc: Document | null = null;
  private elements: Map<string, IArchiMateElement> = new Map();
  private relationships: Map<string, IArchiMateRelationship> = new Map();
  private views: Map<string, IArchiMateView> = new Map();

  /**
   * Create a new ArchiMateRenderer instance
   * @param options Rendering options
   */
  constructor(options: IArchiMateRendererOptions = {}) {
    this.options = {
      width: 800,
      height: 600,
      padding: 20,
      fontFamily: 'Arial, sans-serif',
      fontSize: 12,
      colors: {
        // Default colors for ArchiMate elements
        // These can be overridden via options
        application: '#85C1E9',
        business: '#F9E79F',
        technology: '#ABEBC6',
        motivation: '#D7BDE2',
        implementation: '#F5CBA7',
        strategy: '#F1948A',
        physical: '#D5DBDB',
        background: '#FFFFFF',
        stroke: '#000000',
        text: '#000000',
      },
      ...options,
    };
  }

  /**
   * Load ArchiMate XML content
   * @param xmlContent ArchiMate XML content as string
   * @returns this instance for method chaining
   */
  public loadXml(xmlContent: string): ArchiMateRenderer {
    try {
      // Use the cross-platform XML parser
      this.xmlDoc = parseXml(xmlContent);

      // Parse the model
      this.parseModel();
    } catch (error) {
      throw new Error(
        `Failed to parse ArchiMate XML: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return this;
  }

  /**
   * Parse the ArchiMate model from the XML document
   * @private
   */
  private parseModel(): void {
    if (!this.xmlDoc) {
      throw new Error('No XML document loaded');
    }

    // Clear existing data
    this.elements.clear();
    this.relationships.clear();
    this.views.clear();

    // Parse elements
    this.parseElements();

    // Parse relationships
    this.parseRelationships();

    // Parse views
    this.parseViews();
  }

  /**
   * Parse ArchiMate elements from the XML document
   * @private
   */
  private parseElements(): void {
    if (!this.xmlDoc) return;

    // Find all element nodes - handle both browser and Node.js environments
    let elementNodes: Element[] = [];

    try {
      // Try browser-style querySelectorAll
      if (typeof this.xmlDoc.querySelectorAll === 'function') {
        elementNodes = Array.from(this.xmlDoc.querySelectorAll('element'));
      } else {
        // Fallback for xmldom which doesn't fully implement querySelectorAll
        const elements = this.xmlDoc.getElementsByTagName('element');
        for (let i = 0; i < elements.length; i++) {
          elementNodes.push(elements[i]);
        }
      }
    } catch (error) {
      console.error('Error selecting elements:', error);
      // Fallback to getElementsByTagName which is more widely supported
      const elements = this.xmlDoc.getElementsByTagName('element');
      for (let i = 0; i < elements.length; i++) {
        elementNodes.push(elements[i]);
      }
    }

    for (let i = 0; i < elementNodes.length; i++) {
      const node = elementNodes[i];
      const id = getElementAttribute(node, 'identifier');

      if (!id) continue;

      const type = getElementAttribute(node, 'xsi:type') || 'Unknown';
      const name = getElementText(node, 'name');
      const documentation = getElementText(node, 'documentation');

      // Create element object
      const element: IArchiMateElement = {
        id,
        type: type as any, // Cast to ArchiMateElementType
        name: name || undefined,
        documentation: documentation || undefined,
        properties: {},
      };

      // Parse properties if any
      let propertyNodes: Element[] = [];

      try {
        if (typeof node.querySelectorAll === 'function') {
          propertyNodes = Array.from(node.querySelectorAll('property'));
        } else {
          const properties = node.getElementsByTagName('property');
          for (let j = 0; j < properties.length; j++) {
            propertyNodes.push(properties[j]);
          }
        }
      } catch (error) {
        console.error('Error selecting properties:', error);
        const properties = node.getElementsByTagName('property');
        for (let j = 0; j < properties.length; j++) {
          propertyNodes.push(properties[j]);
        }
      }

      for (let j = 0; j < propertyNodes.length; j++) {
        const propNode = propertyNodes[j];
        const propKey = getElementAttribute(propNode, 'key');
        const propValue = getElementAttribute(propNode, 'value');

        if (propKey && propValue) {
          element.properties = element.properties || {};
          element.properties[propKey] = propValue;
        }
      }

      // Add to elements map
      this.elements.set(id, element);
    }
  }

  /**
   * Parse ArchiMate relationships from the XML document
   * @private
   */
  private parseRelationships(): void {
    if (!this.xmlDoc) return;

    // Find all relationship nodes - handle both browser and Node.js environments
    let relationshipNodes: Element[] = [];

    try {
      // Try browser-style querySelectorAll
      if (typeof this.xmlDoc.querySelectorAll === 'function') {
        relationshipNodes = Array.from(this.xmlDoc.querySelectorAll('relationship'));
      } else {
        // Fallback for xmldom which doesn't fully implement querySelectorAll
        const relationships = this.xmlDoc.getElementsByTagName('relationship');
        for (let i = 0; i < relationships.length; i++) {
          relationshipNodes.push(relationships[i]);
        }
      }
    } catch (error) {
      console.error('Error selecting relationships:', error);
      // Fallback to getElementsByTagName which is more widely supported
      const relationships = this.xmlDoc.getElementsByTagName('relationship');
      for (let i = 0; i < relationships.length; i++) {
        relationshipNodes.push(relationships[i]);
      }
    }

    for (let i = 0; i < relationshipNodes.length; i++) {
      const node = relationshipNodes[i];
      const id = getElementAttribute(node, 'identifier');

      if (!id) continue;

      const type = getElementAttribute(node, 'xsi:type') || 'Association';
      const source = getElementAttribute(node, 'source');
      const target = getElementAttribute(node, 'target');

      if (!source || !target) continue;

      const name = getElementText(node, 'name');
      const documentation = getElementText(node, 'documentation');

      // Create relationship object
      const relationship: IArchiMateRelationship = {
        id,
        type: type as any, // Cast to ArchiMateRelationshipType
        source,
        target,
        name: name || undefined,
        documentation: documentation || undefined,
        properties: {},
      };

      // Extract accessType attribute for Access relationships
      if (type === 'Access') {
        const accessType = getElementAttribute(node, 'accessType');
        if (accessType) {
          relationship.accessType = accessType;
        }
      }

      // Parse properties if any
      let propertyNodes: Element[] = [];

      try {
        if (typeof node.querySelectorAll === 'function') {
          propertyNodes = Array.from(node.querySelectorAll('property'));
        } else {
          const properties = node.getElementsByTagName('property');
          for (let j = 0; j < properties.length; j++) {
            propertyNodes.push(properties[j]);
          }
        }
      } catch (error) {
        console.error('Error selecting properties:', error);
        const properties = node.getElementsByTagName('property');
        for (let j = 0; j < properties.length; j++) {
          propertyNodes.push(properties[j]);
        }
      }

      for (let j = 0; j < propertyNodes.length; j++) {
        const propNode = propertyNodes[j];
        const propKey = getElementAttribute(propNode, 'key');
        const propValue = getElementAttribute(propNode, 'value');

        if (propKey && propValue) {
          relationship.properties = relationship.properties || {};
          relationship.properties[propKey] = propValue;
        }
      }

      // Add to relationships map
      this.relationships.set(id, relationship);
    }
  }

  /**
   * Parse ArchiMate views from the XML document
   * @private
   */
  private parseViews(): void {
    if (!this.xmlDoc) return;

    // Find all view nodes - handle both browser and Node.js environments
    let viewNodes: Element[] = [];

    try {
      // Try browser-style querySelectorAll
      if (typeof this.xmlDoc.querySelectorAll === 'function') {
        viewNodes = Array.from(this.xmlDoc.querySelectorAll('view'));
      } else {
        // Fallback for xmldom which doesn't fully implement querySelectorAll
        const views = this.xmlDoc.getElementsByTagName('view');
        for (let i = 0; i < views.length; i++) {
          viewNodes.push(views[i]);
        }
      }
    } catch (error) {
      console.error('Error selecting views:', error);
      // Fallback to getElementsByTagName which is more widely supported
      const views = this.xmlDoc.getElementsByTagName('view');
      for (let i = 0; i < views.length; i++) {
        viewNodes.push(views[i]);
      }
    }

    for (let i = 0; i < viewNodes.length; i++) {
      const node = viewNodes[i];
      const id = getElementAttribute(node, 'identifier');

      if (!id) continue;

      const name = getElementText(node, 'name');
      const documentation = getElementText(node, 'documentation');
      const viewpoint = getElementAttribute(node, 'viewpoint');

      // Create view object
      const view: IArchiMateView = {
        id,
        name: name || undefined,
        documentation: documentation || undefined,
        viewpoint: viewpoint || undefined,
        elements: [],
        relationships: [],
      };

      // Parse view elements
      let nodeElements: Element[] = [];

      try {
        if (typeof node.querySelectorAll === 'function') {
          nodeElements = Array.from(node.querySelectorAll('node'));
        } else {
          const nodes = node.getElementsByTagName('node');
          for (let j = 0; j < nodes.length; j++) {
            nodeElements.push(nodes[j]);
          }
        }
      } catch (error) {
        console.error('Error selecting nodes:', error);
        const nodes = node.getElementsByTagName('node');
        for (let j = 0; j < nodes.length; j++) {
          nodeElements.push(nodes[j]);
        }
      }

      for (let j = 0; j < nodeElements.length; j++) {
        const nodeElement = nodeElements[j];
        const elementRef = getElementAttribute(nodeElement, 'elementRef');

        if (!elementRef) continue;

        // Check if bounds are defined as a child element
        let bounds: Element | null = null;

        try {
          if (typeof nodeElement.querySelector === 'function') {
            bounds = nodeElement.querySelector('bounds');
          } else {
            const boundsElements = nodeElement.getElementsByTagName('bounds');
            if (boundsElements.length > 0) {
              bounds = boundsElements[0];
            }
          }
        } catch (error) {
          console.error('Error selecting bounds:', error);
          const boundsElements = nodeElement.getElementsByTagName('bounds');
          if (boundsElements.length > 0) {
            bounds = boundsElements[0];
          }
        }

        let x, y, width, height;

        if (bounds) {
          // Get coordinates from bounds element (sample-model.xml format)
          x = parseInt(getElementAttribute(bounds, 'x') || '0', 10);
          y = parseInt(getElementAttribute(bounds, 'y') || '0', 10);
          width = parseInt(getElementAttribute(bounds, 'width') || '0', 10);
          height = parseInt(getElementAttribute(bounds, 'height') || '0', 10);
        } else {
          // Get coordinates from node attributes (sample-model2.xml format from Archi)
          x = parseInt(getElementAttribute(nodeElement, 'x') || '0', 10);
          y = parseInt(getElementAttribute(nodeElement, 'y') || '0', 10);
          // Note: Archi uses 'w' and 'h' instead of 'width' and 'height'
          width = parseInt(
            getElementAttribute(nodeElement, 'w') ||
              getElementAttribute(nodeElement, 'width') ||
              '0',
            10,
          );
          height = parseInt(
            getElementAttribute(nodeElement, 'h') ||
              getElementAttribute(nodeElement, 'height') ||
              '0',
            10,
          );
        }

        // Skip if we couldn't determine position and size
        if (x === 0 && y === 0 && width === 0 && height === 0) continue;

        // Parse style
        const style: IViewElementStyle = {};
        let styleNode: Element | null = null;

        try {
          if (typeof nodeElement.querySelector === 'function') {
            styleNode = nodeElement.querySelector('style');
          } else {
            const styleElements = nodeElement.getElementsByTagName('style');
            if (styleElements.length > 0) {
              styleNode = styleElements[0];
            }
          }
        } catch (error) {
          console.error('Error selecting style:', error);
          const styleElements = nodeElement.getElementsByTagName('style');
          if (styleElements.length > 0) {
            styleNode = styleElements[0];
          }
        }

        if (styleNode) {
          let fillColor: Element | null = null;
          let lineColor: Element | null = null;
          let font: Element | null = null;

          try {
            if (typeof styleNode.querySelector === 'function') {
              fillColor = styleNode.querySelector('fillColor');
              lineColor = styleNode.querySelector('lineColor');
              font = styleNode.querySelector('font');
            } else {
              const fillColors = styleNode.getElementsByTagName('fillColor');
              if (fillColors.length > 0) {
                fillColor = fillColors[0];
              }

              const lineColors = styleNode.getElementsByTagName('lineColor');
              if (lineColors.length > 0) {
                lineColor = lineColors[0];
              }

              const fonts = styleNode.getElementsByTagName('font');
              if (fonts.length > 0) {
                font = fonts[0];
              }
            }
          } catch (error) {
            console.error('Error selecting style elements:', error);

            const fillColors = styleNode.getElementsByTagName('fillColor');
            if (fillColors.length > 0) {
              fillColor = fillColors[0];
            }

            const lineColors = styleNode.getElementsByTagName('lineColor');
            if (lineColors.length > 0) {
              lineColor = lineColors[0];
            }

            const fonts = styleNode.getElementsByTagName('font');
            if (fonts.length > 0) {
              font = fonts[0];
            }
          }

          if (fillColor) {
            const r = parseInt(getElementAttribute(fillColor, 'r') || '255', 10);
            const g = parseInt(getElementAttribute(fillColor, 'g') || '255', 10);
            const b = parseInt(getElementAttribute(fillColor, 'b') || '255', 10);
            style.fillColor = `rgb(${r}, ${g}, ${b})`;
          }

          if (lineColor) {
            const r = parseInt(getElementAttribute(lineColor, 'r') || '0', 10);
            const g = parseInt(getElementAttribute(lineColor, 'g') || '0', 10);
            const b = parseInt(getElementAttribute(lineColor, 'b') || '0', 10);
            style.strokeColor = `rgb(${r}, ${g}, ${b})`;
          }

          if (font) {
            style.fontFamily = getElementAttribute(font, 'name') || undefined;
            const size = getElementAttribute(font, 'size');
            if (size) {
              style.fontSize = parseInt(size, 10);
            }
          }
        }

        // Add view element
        view.elements.push({
          elementRef,
          x,
          y,
          width,
          height,
          style,
        });
      }

      // Parse view relationships
      let connectionElements: Element[] = [];

      try {
        if (typeof node.querySelectorAll === 'function') {
          connectionElements = Array.from(node.querySelectorAll('connection'));
        } else {
          const connections = node.getElementsByTagName('connection');
          for (let j = 0; j < connections.length; j++) {
            connectionElements.push(connections[j]);
          }
        }
      } catch (error) {
        console.error('Error selecting connections:', error);
        const connections = node.getElementsByTagName('connection');
        for (let j = 0; j < connections.length; j++) {
          connectionElements.push(connections[j]);
        }
      }

      for (let j = 0; j < connectionElements.length; j++) {
        const connectionElement = connectionElements[j];
        const relationshipRef = getElementAttribute(connectionElement, 'relationshipRef');

        if (!relationshipRef) continue;

        // Parse bendpoints
        const bendpoints: IPoint[] = [];
        let bendpointElements: Element[] = [];

        try {
          if (typeof connectionElement.querySelectorAll === 'function') {
            bendpointElements = Array.from(connectionElement.querySelectorAll('bendpoint'));
          } else {
            const bendpointsArray = connectionElement.getElementsByTagName('bendpoint');
            for (let k = 0; k < bendpointsArray.length; k++) {
              bendpointElements.push(bendpointsArray[k]);
            }
          }
        } catch (error) {
          console.error('Error selecting bendpoints:', error);
          const bendpointsArray = connectionElement.getElementsByTagName('bendpoint');
          for (let k = 0; k < bendpointsArray.length; k++) {
            bendpointElements.push(bendpointsArray[k]);
          }
        }

        for (let k = 0; k < bendpointElements.length; k++) {
          const bendpointElement = bendpointElements[k];
          const x = parseInt(getElementAttribute(bendpointElement, 'x') || '0', 10);
          const y = parseInt(getElementAttribute(bendpointElement, 'y') || '0', 10);

          bendpoints.push({ x, y });
        }

        // Parse style
        const style: IViewRelationshipStyle = {};
        let styleNode: Element | null = null;

        try {
          if (typeof connectionElement.querySelector === 'function') {
            styleNode = connectionElement.querySelector('style');
          } else {
            const styleElements = connectionElement.getElementsByTagName('style');
            if (styleElements.length > 0) {
              styleNode = styleElements[0];
            }
          }
        } catch (error) {
          console.error('Error selecting style:', error);
          const styleElements = connectionElement.getElementsByTagName('style');
          if (styleElements.length > 0) {
            styleNode = styleElements[0];
          }
        }

        if (styleNode) {
          let lineColor: Element | null = null;
          let lineWidth: Element | null = null;
          let font: Element | null = null;

          try {
            if (typeof styleNode.querySelector === 'function') {
              lineColor = styleNode.querySelector('lineColor');
              lineWidth = styleNode.querySelector('lineWidth');
              font = styleNode.querySelector('font');
            } else {
              const lineColors = styleNode.getElementsByTagName('lineColor');
              if (lineColors.length > 0) {
                lineColor = lineColors[0];
              }

              const lineWidths = styleNode.getElementsByTagName('lineWidth');
              if (lineWidths.length > 0) {
                lineWidth = lineWidths[0];
              }

              const fonts = styleNode.getElementsByTagName('font');
              if (fonts.length > 0) {
                font = fonts[0];
              }
            }
          } catch (error) {
            console.error('Error selecting style elements:', error);

            const lineColors = styleNode.getElementsByTagName('lineColor');
            if (lineColors.length > 0) {
              lineColor = lineColors[0];
            }

            const lineWidths = styleNode.getElementsByTagName('lineWidth');
            if (lineWidths.length > 0) {
              lineWidth = lineWidths[0];
            }

            const fonts = styleNode.getElementsByTagName('font');
            if (fonts.length > 0) {
              font = fonts[0];
            }
          }

          if (lineColor) {
            const r = parseInt(getElementAttribute(lineColor, 'r') || '0', 10);
            const g = parseInt(getElementAttribute(lineColor, 'g') || '0', 10);
            const b = parseInt(getElementAttribute(lineColor, 'b') || '0', 10);
            style.strokeColor = `rgb(${r}, ${g}, ${b})`;
          }

          if (lineWidth) {
            style.strokeWidth = parseInt(getElementAttribute(lineWidth, 'value') || '1', 10);
          }

          if (font) {
            style.fontFamily = getElementAttribute(font, 'name') || undefined;
            const size = getElementAttribute(font, 'size');
            if (size) {
              style.fontSize = parseInt(size, 10);
            }
          }
        }

        // Add view relationship
        view.relationships.push({
          relationshipRef,
          bendpoints: bendpoints.length > 0 ? bendpoints : undefined,
          style,
        });
      }

      // Add to views map
      this.views.set(id, view);

      // Also index by name if available
      if (name) {
        this.views.set(name, view);
      }
    }
  }

  /**
   * Find a view by ID or name
   * @private
   */
  private findView(viewIdentifier: IViewIdentifier): IArchiMateView | undefined {
    if (!viewIdentifier.id && !viewIdentifier.name) {
      throw new Error('View identifier must contain either id or name.');
    }

    const viewId = viewIdentifier.id;
    const viewName = viewIdentifier.name;

    if (viewId && this.views.has(viewId)) {
      return this.views.get(viewId);
    } else if (viewName && this.views.has(viewName)) {
      return this.views.get(viewName);
    }

    return undefined;
  }

  /**
   * Render a specific view from the loaded ArchiMate model
   * @param viewIdentifier The ID or name of the view to render
   * @returns SVG content as string
   */
  public renderView(viewIdentifier: IViewIdentifier): string {
    if (!this.xmlDoc) {
      throw new Error('No XML content loaded. Call loadXml() first.');
    }

    // Find the view
    const view = this.findView(viewIdentifier);

    if (!view) {
      // If view not found, return a placeholder SVG
      return generateSvgDocument(
        `<text x="50%" y="50%" font-family="${this.options.fontFamily}" font-size="${this.options.fontSize}" 
          text-anchor="middle" dominant-baseline="middle" fill="${this.options.colors?.text || '#000000'}">
          View not found: ${escapeXml(viewIdentifier.name || viewIdentifier.id || '')}
        </text>`,
        this.options.width || 800,
        this.options.height || 600,
        this.options.colors?.background || '#FFFFFF',
      );
    }

    // Generate SVG content for the view
    let svgContent = '';

    // Process view elements to identify compound elements
    const processedElements = processCompoundElements(view.elements);

    // Render elements
    for (const viewElement of processedElements) {
      const element = this.elements.get(viewElement.elementRef);

      if (!element) continue;

      // Determine element color based on type
      let fillColor = this.options.colors?.background || '#FFFFFF';

      if (element.type.includes('Business')) {
        fillColor = this.options.colors?.business || '#F9E79F';
      } else if (element.type.includes('Application')) {
        fillColor = this.options.colors?.application || '#85C1E9';
      } else if (element.type.includes('Technology')) {
        fillColor = this.options.colors?.technology || '#ABEBC6';
      } else if (element.type.includes('Motivation')) {
        fillColor = this.options.colors?.motivation || '#D7BDE2';
      } else if (element.type.includes('Implementation')) {
        fillColor = this.options.colors?.implementation || '#F5CBA7';
      } else if (element.type.includes('Strategy')) {
        fillColor = this.options.colors?.strategy || '#F1948A';
      } else if (element.type.includes('Physical')) {
        fillColor = this.options.colors?.physical || '#D5DBDB';
      }

      // Create style object
      const style: IViewElementStyle = {
        fillColor,
        strokeColor: this.options.colors?.stroke || '#000000',
        textColor: this.options.colors?.text || '#000000',
        fontSize: this.options.fontSize,
        fontFamily: this.options.fontFamily,
        ...viewElement.style,
      };

      // Generate element with appropriate shape based on type
      svgContent += generateElement(
        viewElement.x,
        viewElement.y,
        viewElement.width,
        viewElement.height,
        element.name || '',
        element.type,
        style,
      );
    }

    // Render relationships
    for (const viewRelationship of view.relationships) {
      const relationship = this.relationships.get(viewRelationship.relationshipRef);

      if (!relationship) continue;

      // Find source and target elements in the view
      const sourceViewElement = view.elements.find(
        (e: IArchiMateViewElement) => e.elementRef === relationship.source,
      );
      const targetViewElement = view.elements.find(
        (e: IArchiMateViewElement) => e.elementRef === relationship.target,
      );

      if (!sourceViewElement || !targetViewElement) continue;

      // Create style object
      const style: IViewRelationshipStyle = {
        strokeColor: this.options.colors?.stroke || '#000000',
        textColor: this.options.colors?.text || '#000000',
        fontSize: this.options.fontSize ? this.options.fontSize - 2 : 10,
        fontFamily: this.options.fontFamily,
        ...viewRelationship.style,
      };

      // Generate connection for the relationship with appropriate arrow head and line style
      svgContent += generateConnectionWithRectangles(
        sourceViewElement,
        targetViewElement,
        relationship.name,
        relationship.type,
        viewRelationship.bendpoints,
        style,
        relationship,
      );
    }

    // Generate the complete SVG document
    return generateSvgDocument(
      svgContent,
      this.options.width,
      this.options.height,
      this.options.colors?.background,
    );
  }

  /**
   * Compute the bounds needed to contain all elements in a view
   * @param viewIdentifier The ID or name of the view
   * @returns Object containing width and height
   */
  public computeBounds(viewIdentifier: IViewIdentifier): { width: number; height: number } {
    if (!this.xmlDoc) {
      throw new Error('No XML content loaded. Call loadXml() first.');
    }

    // Find the view
    const view = this.findView(viewIdentifier);

    if (!view) {
      throw new Error(`View not found: ${viewIdentifier.id || viewIdentifier.name}`);
    }

    // Initialize with minimum values
    let maxX = 0;
    let maxY = 0;

    // Iterate through all elements to find maximum bounds
    for (const element of view.elements) {
      const rightEdge = element.x + element.width;
      const bottomEdge = element.y + element.height;

      maxX = Math.max(maxX, rightEdge);
      maxY = Math.max(maxY, bottomEdge);
    }

    // Include relationship bendpoints in bounding box calculation
    for (const relationship of view.relationships) {
      if (relationship.bendpoints && relationship.bendpoints.length > 0) {
        for (const point of relationship.bendpoints) {
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        }
      }
    }

    // Add padding
    const padding = this.options.padding || 20;

    return {
      width: maxX + padding,
      height: maxY + padding,
    };
  }

  /**
   * Get a list of all views in the model
   * @returns Array of view identifiers with id and name
   */
  public getViews(): IViewIdentifier[] {
    if (!this.xmlDoc) {
      throw new Error('No XML content loaded. Call loadXml() first.');
    }

    const result: IViewIdentifier[] = [];

    // Iterate through the views map
    this.views.forEach((view, key) => {
      // Only add entries where the key is the ID (to avoid duplicates)
      if (key === view.id) {
        result.push({
          id: view.id,
          name: view.name || view.id,
        });
      }
    });

    return result;
  }
}

// Export a convenience function for quick usage
export function renderArchiMateView(
  xmlContent: string,
  viewIdentifier: IViewIdentifier,
  options?: IArchiMateRendererOptions,
): string {
  return new ArchiMateRenderer(options).loadXml(xmlContent).renderView(viewIdentifier);
}

// Export types
export * from './types';
