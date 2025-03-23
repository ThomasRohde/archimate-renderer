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

// Create the program
const program = new Command();

// Set up program metadata
program
  .name('archimate-renderer')
  .description('Command line tool for rendering ArchiMate models as SVG')
  .version('1.0.0');

/**
 * Read XML file from filesystem
 * @param filePath Path to XML file
 * @returns XML content as string
 */
function readXmlFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(chalk.red(`Error reading file: ${filePath}`));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

/**
 * Write SVG content to file
 * @param filePath Path to output file
 * @param svgContent SVG content as string
 */
function writeSvgFile(filePath: string, svgContent: string): void {
  try {
    // Ensure directory exists
    fs.ensureDirSync(path.dirname(filePath));
    
    // Write file
    fs.writeFileSync(filePath, svgContent, 'utf-8');
    console.log(chalk.green(`SVG saved to: ${filePath}`));
  } catch (error) {
    console.error(chalk.red(`Error writing file: ${filePath}`));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

/**
 * Create a sanitized filename from a string
 * @param name String to sanitize
 * @returns Sanitized filename
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase();
}

// Command: List views in an ArchiMate model
program
  .command('list')
  .description('List all views in an ArchiMate model')
  .argument('<file>', 'ArchiMate XML file')
  .action((file) => {
    try {
      // Read XML file
      const xmlContent = readXmlFile(file);
      
      // Create renderer
      const renderer = new ArchiMateRenderer();
      renderer.loadXml(xmlContent);
      
      // Get views
      const views = Array.from(renderer['views'].entries());
      
      if (views.length === 0) {
        console.log(chalk.yellow('No views found in the model.'));
        return;
      }
      
      // Display views
      console.log(chalk.bold('\nViews in the model:'));
      console.log(chalk.gray('─'.repeat(50)));
      
      views.forEach(([id, view]) => {
        // Skip duplicate entries (views are indexed by both ID and name)
        if (id === view.id) {
          console.log(chalk.bold(`ID: ${chalk.green(view.id)}`));
          if (view.name) console.log(`Name: ${view.name}`);
          if (view.viewpoint) console.log(`Viewpoint: ${view.viewpoint}`);
          console.log(`Elements: ${view.elements.length}`);
          console.log(`Relationships: ${view.relationships.length}`);
          console.log(chalk.gray('─'.repeat(50)));
        }
      });
    } catch (error) {
      console.error(chalk.red('Error listing views:'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// Command: Show model information
program
  .command('info')
  .description('Display information about an ArchiMate model')
  .argument('<file>', 'ArchiMate XML file')
  .action((file) => {
    try {
      // Read XML file
      const xmlContent = readXmlFile(file);
      
      // Create renderer
      const renderer = new ArchiMateRenderer();
      renderer.loadXml(xmlContent);
      
      // Get model data
      const elements = renderer['elements'];
      const relationships = renderer['relationships'];
      const views = renderer['views'];
      
      // Count elements by type
      const elementTypes = new Map<string, number>();
      elements.forEach((element) => {
        const count = elementTypes.get(element.type) || 0;
        elementTypes.set(element.type, count + 1);
      });
      
      // Count relationships by type
      const relationshipTypes = new Map<string, number>();
      relationships.forEach((relationship) => {
        const count = relationshipTypes.get(relationship.type) || 0;
        relationshipTypes.set(relationship.type, count + 1);
      });
      
      // Display model information
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
      
      // Count unique views (exclude name entries)
      const uniqueViews = new Set<string>();
      views.forEach((view) => {
        uniqueViews.add(view.id);
      });
      
      console.log(chalk.bold('\nViews:'), uniqueViews.size);
      console.log(chalk.gray('─'.repeat(50)));
      
    } catch (error) {
      console.error(chalk.red('Error displaying model information:'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// Command: Render a specific view
program
  .command('render')
  .description('Render a specific view from an ArchiMate model as SVG')
  .argument('<file>', 'ArchiMate XML file')
  .option('-v, --view <id>', 'ID or name of the view to render')
  .option('-o, --output <file>', 'Output SVG file')
  .option('-w, --width <width>', 'SVG width in pixels', '1200')
  .option('-h, --height <height>', 'SVG height in pixels', '800')
  .option('-p, --padding <padding>', 'SVG padding in pixels', '20')
  .option('-f, --font-family <font>', 'Font family', 'Arial, sans-serif')
  .option('-s, --font-size <size>', 'Font size in pixels', '12')
  .action((file, options) => {
    try {
      // Read XML file
      const xmlContent = readXmlFile(file);
      
      // Create renderer with options
      const rendererOptions: IArchiMateRendererOptions = {
        width: parseInt(options.width, 10),
        height: parseInt(options.height, 10),
        padding: parseInt(options.padding, 10),
        fontFamily: options.fontFamily,
        fontSize: parseInt(options.fontSize, 10),
      };
      
      const renderer = new ArchiMateRenderer(rendererOptions);
      renderer.loadXml(xmlContent);
      
      // If no view ID/name is provided, list available views
      if (!options.view) {
        console.log(chalk.yellow('No view specified. Available views:'));
        
        // Get views
        const views = Array.from(renderer['views'].entries());
        
        views.forEach(([id, view]) => {
          // Skip duplicate entries (views are indexed by both ID and name)
          if (id === view.id) {
            console.log(`ID: ${chalk.green(view.id)}, Name: ${view.name || 'Unnamed'}`);
          }
        });
        
        console.log(chalk.yellow('\nUse --view option to specify a view to render.'));
        return;
      }
      
      // Render the view
      const svgContent = renderer.renderView({ id: options.view, name: options.view });
      
      // Determine output file
      let outputFile = options.output;
      
      if (!outputFile) {
        // If no output file is specified, use the view ID/name
        const viewName = options.view.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        outputFile = `${path.basename(file, path.extname(file))}_${viewName}.svg`;
      }
      
      // Write SVG to file
      writeSvgFile(outputFile, svgContent);
      
    } catch (error) {
      console.error(chalk.red('Error rendering view:'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// Command: Render all views
program
  .command('render-all')
  .description('Render all views from an ArchiMate model as SVG files')
  .argument('<file>', 'ArchiMate XML file')
  .option('-o, --output-dir <directory>', 'Output directory for SVG files', './output')
  .option('-w, --width <width>', 'SVG width in pixels', '1200')
  .option('-h, --height <height>', 'SVG height in pixels', '800')
  .option('-p, --padding <padding>', 'SVG padding in pixels', '20')
  .option('-f, --font-family <font>', 'Font family', 'Arial, sans-serif')
  .option('-s, --font-size <size>', 'Font size in pixels', '12')
  .action((file, options) => {
    try {
      // Read XML file
      const xmlContent = readXmlFile(file);
      
      // Create renderer with options
      const rendererOptions: IArchiMateRendererOptions = {
        width: parseInt(options.width, 10),
        height: parseInt(options.height, 10),
        padding: parseInt(options.padding, 10),
        fontFamily: options.fontFamily,
        fontSize: parseInt(options.fontSize, 10),
      };
      
      const renderer = new ArchiMateRenderer(rendererOptions);
      renderer.loadXml(xmlContent);
      
      // Get views
      const views = Array.from(renderer['views'].entries());
      const uniqueViewIds = new Set<string>();
      
      // Filter out duplicate entries (views are indexed by both ID and name)
      views.forEach(([id, view]) => {
        if (id === view.id) {
          uniqueViewIds.add(view.id);
        }
      });
      
      if (uniqueViewIds.size === 0) {
        console.log(chalk.yellow('No views found in the model.'));
        return;
      }
      
      // Create output directory
      fs.ensureDirSync(options.outputDir);
      
      // Render each view
      console.log(chalk.bold(`Rendering ${uniqueViewIds.size} views...`));
      
      let rendered = 0;
      uniqueViewIds.forEach((viewId) => {
        try {
          const view = renderer['views'].get(viewId);
          
          if (!view) {
            console.warn(chalk.yellow(`View not found: ${viewId}`));
            return;
          }
          
          // Generate filename
          const baseName = path.basename(file, path.extname(file));
          const viewName = view.name ? sanitizeFilename(view.name) : sanitizeFilename(viewId);
          const outputFile = path.join(options.outputDir, `${baseName}_${viewName}.svg`);
          
          // Render view
          const svgContent = renderer.renderView({ id: viewId });
          
          // Write SVG to file
          writeSvgFile(outputFile, svgContent);
          rendered++;
          
        } catch (error) {
          console.warn(chalk.yellow(`Error rendering view ${viewId}:`));
          console.warn(chalk.yellow(error instanceof Error ? error.message : String(error)));
        }
      });
      
      console.log(chalk.green(`\nRendered ${rendered} of ${uniqueViewIds.size} views to ${options.outputDir}`));
      
    } catch (error) {
      console.error(chalk.red('Error rendering views:'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// If no arguments provided, show help
if (process.argv.length <= 2) {
  program.help();
}
