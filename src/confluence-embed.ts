/**
 * Confluence HTML Macro Embedding Support
 * 
 * This module provides the functionality needed to automatically render
 * ArchiMate diagrams when embedded in Confluence pages as HTML macros.
 */

import { IArchiMateRendererOptions, renderArchiMateView } from './index';

interface ArchimateEmbedConfig {
  xmlUrl: string;
  viewName?: string;
  viewId?: string;
  width?: number;
  height?: number;
  fontFamily?: string;
  fontSize?: number;
  theme?: string;
  customColorMapping?: string;
}

/**
 * Parse configuration from data attributes on a DOM element
 */
function parseConfigFromElement(element: HTMLElement): ArchimateEmbedConfig {
  return {
    xmlUrl: element.getAttribute('data-xml-url') || '',
    viewName: element.getAttribute('data-view-name') || undefined,
    viewId: element.getAttribute('data-view-id') || undefined,
    width: element.getAttribute('data-width') ? parseInt(element.getAttribute('data-width') || '0', 10) : undefined,
    height: element.getAttribute('data-height') ? parseInt(element.getAttribute('data-height') || '0', 10) : undefined,
    fontFamily: element.getAttribute('data-font-family') || undefined,
    fontSize: element.getAttribute('data-font-size') ? parseInt(element.getAttribute('data-font-size') || '0', 10) : undefined,
    theme: element.getAttribute('data-theme') || undefined,
    customColorMapping: element.getAttribute('data-custom-colors') || undefined,
  };
}

/**
 * Process theme and custom color settings into renderer options
 */
function processThemeOptions(config: ArchimateEmbedConfig): IArchiMateRendererOptions {
  const options: IArchiMateRendererOptions = {
    width: config.width,
    height: config.height,
    fontFamily: config.fontFamily,
    fontSize: config.fontSize,
  };

  // Apply theme presets
  if (config.theme) {
    switch (config.theme.toLowerCase()) {
      case 'dark':
        options.colors = {
          background: '#282c34',
          stroke: '#ffffff',
          text: '#ffffff',
          application: '#61afef',
          business: '#e5c07b',
          technology: '#98c379',
          motivation: '#c678dd',
          implementation: '#e06c75',
          strategy: '#d19a66',
          physical: '#56b6c2',
        };
        break;
      case 'light':
        options.colors = {
          background: '#ffffff',
          stroke: '#000000',
          text: '#000000',
          application: '#85C1E9',
          business: '#F9E79F',
          technology: '#ABEBC6',
          motivation: '#D7BDE2',
          implementation: '#F5CBA7',
          strategy: '#F1948A',
          physical: '#D5DBDB',
        };
        break;
      case 'colorful':
        options.colors = {
          background: '#ffffff',
          stroke: '#2c3e50',
          text: '#2c3e50',
          application: '#3498db',
          business: '#f1c40f',
          technology: '#2ecc71',
          motivation: '#9b59b6',
          implementation: '#e67e22',
          strategy: '#e74c3c',
          physical: '#1abc9c',
        };
        break;
      // Add more themes as needed
    }
  }

  // Apply custom color mapping if provided
  if (config.customColorMapping) {
    try {
      const customColors = JSON.parse(config.customColorMapping);
      options.colors = { ...(options.colors || {}), ...customColors };
    } catch (error) {
      console.error('Failed to parse custom color mapping:', error);
    }
  }

  return options;
}

/**
 * Fetch the ArchiMate XML file
 */
async function fetchArchiMateXml(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Failed to fetch ArchiMate XML:', error);
    throw error;
  }
}

/**
 * Render an ArchiMate diagram into a container element
 */
async function renderDiagram(container: HTMLElement, config: ArchimateEmbedConfig): Promise<void> {
  try {
    if (!config.xmlUrl) {
      throw new Error('Missing XML URL configuration');
    }

    if (!config.viewName && !config.viewId) {
      throw new Error('Either view name or view ID must be specified');
    }

    // Add loading indicator
    container.innerHTML = '<div class="archimate-loading">Loading diagram...</div>';

    // Fetch XML content
    const xmlContent = await fetchArchiMateXml(config.xmlUrl);

    // Process options
    const options = processThemeOptions(config);

    // Render the view
    const svg = renderArchiMateView(
      xmlContent,
      {
        id: config.viewId,
        name: config.viewName,
      },
      options
    );

    // Update the container with the rendered SVG
    container.innerHTML = svg;
  } catch (error) {
    console.error('Error rendering ArchiMate diagram:', error);
    container.innerHTML = `<div class="archimate-error">Error loading diagram: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
  }
}

/**
 * Initialize all ArchiMate diagrams on the page
 */
function initializeArchiMateDiagrams(): void {
  // Find all elements with the archimate-diagram class
  const diagramContainers = document.querySelectorAll('.archimate-diagram');

  // Process each container
  diagramContainers.forEach((container) => {
    if (container instanceof HTMLElement) {
      const config = parseConfigFromElement(container);
      void renderDiagram(container, config);
    }
  });
}

// Auto-initialize when the DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeArchiMateDiagrams);
  } else {
    // DOM is already ready
    initializeArchiMateDiagrams();
  }
}

// Export for manual initialization
export { initializeArchiMateDiagrams, renderDiagram };
