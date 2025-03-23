#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * ArchiMate Renderer CLI
 * 
 * Command line interface for rendering ArchiMate models as SVG
 */

import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { ArchiMateRenderer, IArchiMateRendererOptions } from './index';
import { IArchiMateElement, IArchiMateRelationship } from './types';
import { VERSION } from './version';
interface IArchiMateView {
  id: string;
  name?: string;
  viewpoint?: string;
  elements: IArchiMateElement[];
  relationships: IArchiMateRelationship[];
}

interface IArchiMateRendererInternal {
  views: Map<string, IArchiMateView>;
  elements: Map<string, IArchiMateElement>;
  relationships: Map<string, IArchiMateRelationship>;
}

interface IRenderOptions {
  view?: string;
  output?: string;
  width: number;
  height: number;
  padding: number;
  fontFamily: string;
  fontSize: number;
}

interface IRenderAllOptions {
  outputDir: string;
  width: number;
  height: number;
  padding: number;
  fontFamily: string;
  fontSize: number;
}

// Helper to parse numbers from command line options
const parseNumber = (value: string): number => {
  const result = parseInt(value, 10);
  if (isNaN(result)) {
    throw new Error(`Invalid number: ${value}`);
  }
  return result;
};

// Create the program
const program = new Command();

// Set up program metadata
program
  .name('archimate-renderer')
  .description('Command line tool for rendering ArchiMate models as SVG')
  .version(VERSION);

/**
 * Read XML file from the filesystem.
 * @param filePath - Path to the XML file.
 * @returns XML content as a string.
 */
function readXmlFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(chalk.red(`Error reading file: ${filePath}`));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

/**
 * Write SVG content to a file.
 * @param filePath - Path to the output file.
 * @param svgContent - SVG content as a string.
 */
function writeSvgFile(filePath: string, svgContent: string): void {
  try {
    // Ensure the directory exists
    fs.ensureDirSync(path.dirname(filePath));
    fs.writeFileSync(filePath, svgContent, 'utf-8');
    console.log(chalk.green(`SVG saved to: ${filePath}`));
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(chalk.red(`Error writing file: ${filePath}`));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

/**
 * Create a sanitized filename from a string.
 * @param name - The string to sanitize.
 * @returns A sanitized filename.
 */
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

// Command: List views in an ArchiMate model
program
  .command('list')
  .description('List all views in an ArchiMate model')
  .argument('<file>', 'ArchiMate XML file')
  .action((file: string) => {
    try {
      const xmlContent = readXmlFile(file);
      const renderer = new ArchiMateRenderer();
      renderer.loadXml(xmlContent);

      // Access internal views with type assertion
      const internalRenderer = renderer as unknown as IArchiMateRendererInternal;
      const views = Array.from(internalRenderer.views.entries());

      if (views.length === 0) {
        console.log(chalk.yellow('No views found in the model.'));
        return;
      }

      console.log(chalk.bold('\nViews in the model:'));
      console.log(chalk.gray('─'.repeat(50)));

      for (const [id, view] of views) {
        // Skip duplicate entries (views are indexed by both ID and name)
        if (id === view.id) {
          console.log(chalk.bold(`ID: ${chalk.green(view.id)}`));
          if (view.name) console.log(`Name: ${view.name}`);
          if (view.viewpoint) console.log(`Viewpoint: ${view.viewpoint}`);
          console.log(`Elements: ${view.elements.length}`);
          console.log(`Relationships: ${view.relationships.length}`);
          console.log(chalk.gray('─'.repeat(50)));
        }
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(chalk.red('Error listing views:'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Command: Show model information
program
  .command('info')
  .description('Display information about an ArchiMate model')
  .argument('<file>', 'ArchiMate XML file')
  .action((file: string) => {
    try {
      const xmlContent = readXmlFile(file);
      const renderer = new ArchiMateRenderer();
      renderer.loadXml(xmlContent);

      const internalRenderer = renderer as unknown as IArchiMateRendererInternal;
      const { elements, relationships, views } = internalRenderer;

      const elementTypes = new Map<string, number>();
      elements.forEach((element) => {
        const count = elementTypes.get(element.type) || 0;
        elementTypes.set(element.type, count + 1);
      });

      const relationshipTypes = new Map<string, number>();
      relationships.forEach((relationship) => {
        const count = relationshipTypes.get(relationship.type) || 0;
        relationshipTypes.set(relationship.type, count + 1);
      });

      console.log(chalk.bold('\nArchiMate Model Information:'));
      console.log(chalk.gray('─'.repeat(50)));

      console.log(chalk.bold('Elements:'), elements.size);
      elementTypes.forEach((count, type) => {
        console.log(`  ${type}: ${count}`);
      });

      console.log(chalk.bold('\nRelationships:'), relationships.size);
      relationshipTypes.forEach((count, type) => {
        console.log(`  ${type}: ${count}`);
      });

      const uniqueViews = new Set<string>();
      views.forEach((view) => {
        uniqueViews.add(view.id);
      });

      console.log(chalk.bold('\nViews:'), uniqueViews.size);
      console.log(chalk.gray('─'.repeat(50)));
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(chalk.red('Error displaying model information:'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Command: Render a specific view
program
  .command('render')
  .description('Render a specific view from an ArchiMate model as SVG')
  .argument('<file>', 'ArchiMate XML file')
  .option('-v, --view <view>', 'ID or name of the view to render')
  .option('-o, --output <output>', 'Output SVG file')
  .option('-w, --width <width>', 'SVG width in pixels', parseNumber, 1200)
  // Changed short flag for height to -H to avoid conflict with help (-h)
  .option('-H, --height <height>', 'SVG height in pixels', parseNumber, 800)
  .option('-p, --padding <padding>', 'SVG padding in pixels', parseNumber, 20)
  .option('-f, --font-family <fontFamily>', 'Font family', 'Arial, sans-serif')
  .option('-s, --font-size <fontSize>', 'Font size in pixels', parseNumber, 12)
  .action((file: string, options: IRenderOptions) => {
    try {
      const xmlContent = readXmlFile(file);
      const rendererOptions: IArchiMateRendererOptions = {
        width: options.width,
        height: options.height,
        padding: options.padding,
        fontFamily: options.fontFamily,
        fontSize: options.fontSize,
      };

      const renderer = new ArchiMateRenderer(rendererOptions);
      renderer.loadXml(xmlContent);

      if (!options.view) {
        console.log(chalk.yellow('No view specified. Available views:'));
        const internalRenderer = renderer as unknown as IArchiMateRendererInternal;
        const views = Array.from(internalRenderer.views.entries());
        for (const [id, view] of views) {
          if (id === view.id) {
            console.log(`ID: ${chalk.green(view.id)}, Name: ${view.name || 'Unnamed'}`);
          }
        }
        console.log(chalk.yellow('\nUse --view option to specify a view to render.'));
        return;
      }

      const svgContent = renderer.renderView({ id: options.view, name: options.view });
      let outputFile: string | undefined = options.output;

      if (!outputFile) {
        const viewName = sanitizeFilename(options.view);
        outputFile = `${path.basename(file, path.extname(file))}_${viewName}.svg`;
      }

      writeSvgFile(outputFile, svgContent);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(chalk.red('Error rendering view:'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Command: Render all views
program
  .command('render-all')
  .description('Render all views from an ArchiMate model as SVG files')
  .argument('<file>', 'ArchiMate XML file')
  .option('-o, --output-dir <outputDir>', 'Output directory for SVG files', './output')
  .option('-w, --width <width>', 'SVG width in pixels', parseNumber, 1200)
  // Changed short flag for height to -H to avoid conflict with help (-h)
  .option('-H, --height <height>', 'SVG height in pixels', parseNumber, 800)
  .option('-p, --padding <padding>', 'SVG padding in pixels', parseNumber, 20)
  .option('-f, --font-family <fontFamily>', 'Font family', 'Arial, sans-serif')
  .option('-s, --font-size <fontSize>', 'Font size in pixels', parseNumber, 12)
  .action((file: string, options: IRenderAllOptions) => {
    try {
      const xmlContent = readXmlFile(file);
      const rendererOptions: IArchiMateRendererOptions = {
        width: options.width,
        height: options.height,
        padding: options.padding,
        fontFamily: options.fontFamily,
        fontSize: options.fontSize,
      };

      const renderer = new ArchiMateRenderer(rendererOptions);
      renderer.loadXml(xmlContent);

      const internalRenderer = renderer as unknown as IArchiMateRendererInternal;
      const views = Array.from(internalRenderer.views.entries());
      const uniqueViewIds = new Set<string>();

      for (const [id, view] of views) {
        if (id === view.id) {
          uniqueViewIds.add(view.id);
        }
      }

      if (uniqueViewIds.size === 0) {
        console.log(chalk.yellow('No views found in the model.'));
        return;
      }

      fs.ensureDirSync(options.outputDir);
      console.log(chalk.bold(`Rendering ${uniqueViewIds.size} views...`));

      let rendered = 0;
      for (const viewId of uniqueViewIds) {
        try {
          const view = internalRenderer.views.get(viewId);
          if (!view) {
            console.warn(chalk.yellow(`View not found: ${viewId}`));
            continue;
          }

          const baseName = path.basename(file, path.extname(file));
          const viewName = view.name ? sanitizeFilename(view.name) : sanitizeFilename(viewId);
          const outputFile = path.join(options.outputDir, `${baseName}_${viewName}.svg`);

          const svgContent = renderer.renderView({ id: viewId });
          writeSvgFile(outputFile, svgContent);
          rendered++;
        } catch (err: unknown) {
          const error = err instanceof Error ? err : new Error(String(err));
          console.warn(chalk.yellow(`Error rendering view ${viewId}:`));
          console.warn(chalk.yellow(error.message));
        }
      }

      console.log(
        chalk.green(`\nRendered ${rendered} of ${uniqueViewIds.size} views to ${options.outputDir}`)
      );
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(chalk.red('Error rendering views:'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// If no arguments provided, show help
if (process.argv.length <= 2) {
  program.help();
}
