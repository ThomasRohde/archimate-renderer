#!/usr/bin/env python3
"""
Generate shape-data.ts file from JSON data files.

This script reads the all-shapes.json and element-mapping.json files,
and generates a complete shape-data.ts file with all shape definitions
and mappings for ArchiMate elements.
"""

import json
import os
import re

def camel_to_space_case(camel_case):
    """Convert camelCase or PascalCase to 'Space Case'."""
    # Add space before capital letters and then capitalize the first letter
    s = re.sub(r'([a-z])([A-Z])', r'\1 \2', camel_case)
    # Handle consecutive capital letters (like 'ID' in 'UserID')
    s = re.sub(r'([A-Z])([A-Z][a-z])', r'\1 \2', s)
    return s

def json_with_single_quotes(obj):
    """Convert JSON to string with single quotes instead of double quotes and add trailing commas."""
    # Convert object to JSON string with double quotes
    json_str = json.dumps(obj, indent=2)
    
    # Replace double quotes with single quotes, but be careful with escape sequences
    # This converts "key": "value" to 'key': 'value'
    # First, replace escaped double quotes with a temporary marker
    temp_marker = "%%TEMP_ESCAPED_QUOTE%%"
    json_str = json_str.replace('\\"', temp_marker)
    # Now replace unescaped double quotes with single quotes
    json_str = json_str.replace('"', "'")
    # Finally, restore the escaped quotes (now as escaped single quotes)
    json_str = json_str.replace(temp_marker, "\\'")
    
    # Add trailing commas for arrays and objects for ESLint compliance
    # For objects: replace "}" with ",}" if preceded by a value or closing bracket
    json_str = re.sub(r'(\w|\'|\]|\})(\s*\})', r'\1,\2', json_str)
    # For arrays: replace "]" with ",]" if preceded by a value or closing brace
    json_str = re.sub(r'(\w|\'|\}|\])(\s*\])', r'\1,\2', json_str)
    
    return json_str

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Load the shape definitions
    with open(os.path.join(script_dir, 'all-shapes.json'), 'r') as f:
        all_shapes = json.load(f)
    
    # Load the element mappings
    with open(os.path.join(script_dir, 'element-mapping.json'), 'r') as f:
        element_mappings = json.load(f)
    
    # Create a mapping from ArchiMateElementType to element name
    # This is based on the types.ts file
    element_type_to_name_map = {}
    
    # Read the types.ts file to extract ArchiMateElementType enum values
    types_path = os.path.join(script_dir, '..', '..', 'types.ts')
    with open(types_path, 'r') as f:
        types_content = f.read()
    
    # Extract enum values using regex
    enum_pattern = r'export enum ArchiMateElementType \{([\s\S]*?)\}'
    enum_match = re.search(enum_pattern, types_content)
    
    if enum_match:
        enum_content = enum_match.group(1)
        # Extract each enum entry
        enum_entries = re.findall(r'(\w+)\s*=\s*[\'"](\w+)[\'"]', enum_content)
        
        # Create the mapping
        for enum_name, enum_value in enum_entries:
            # Convert enum name to space-separated words (e.g., BusinessActor -> Business Actor)
            element_name = camel_to_space_case(enum_name)
            element_type_to_name_map[enum_value] = element_name
    
    # Generate the TypeScript file content
    ts_content = """/**
 * Shape Data
 * 
 * This file exports the shape definitions and element mappings as TypeScript objects.
 * This approach is more compatible with various build systems than importing JSON directly.
 * 
 * THIS FILE IS GENERATED AUTOMATICALLY - DO NOT EDIT MANUALLY
 * Use generate_shape_data.py to regenerate this file
 */

import { ArchiMateElementType } from '../types';

// Define interfaces for the shape data
export interface ISvgElement {
  type: string;
  d?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeMiterlimit?: string;
  fill?: string;
  fillRule?: string;
  [key: string]: unknown; // Additional properties depend on the element type
}

export interface IShapeDefinition {
  name: string;
  width: number;
  height: number;
  elements: ISvgElement[];
}

export interface IElementMapping {
  element: string;
  icon: string;
  base: string;
}

// All shape definitions
export const allShapesData: IShapeDefinition[] = """
    
    # Add the shape definitions as JSON with single quotes
    ts_content += json_with_single_quotes(all_shapes)
    
    # Add the element mappings
    ts_content += """;

// Element mappings
export const elementMappingData: IElementMapping[] = """
    
    ts_content += json_with_single_quotes(element_mappings)
    
    # Add the element type to name mapping
    ts_content += """;

// Create a mapping from ArchiMateElementType to element name
export const elementTypeToNameMap: Record<string, string> = {
"""
    
    # Add each mapping entry with single quotes
    for enum_value, element_name in element_type_to_name_map.items():
        ts_content += f"  [ArchiMateElementType.{enum_value}]: '{element_name}',\n"
    
    ts_content += '};\n'
    
    # Write the TypeScript file
    with open(os.path.join(script_dir, '../shape-data.ts'), 'w') as f:
        f.write(ts_content)
    
    print(f"Generated shape-data.ts with {len(all_shapes)} shapes and {len(element_mappings)} element mappings")

if __name__ == "__main__":
    main()
