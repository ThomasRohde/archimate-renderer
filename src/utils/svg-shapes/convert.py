#!/usr/bin/env python3
import os
import re
import json
import xml.etree.ElementTree as ET

# Minimum stroke width to use if value is less than 1
MIN_STROKE_WIDTH = 2.0

# Mapping provided by the user.
ELEMENT_MAPPING = [
  {"element": "Stakeholder", "layer": "Motivation", "color": "#800080"},
  {"element": "Driver", "layer": "Motivation", "color": "#800080"},
  {"element": "Assessment", "layer": "Motivation", "color": "#800080"},
  {"element": "Goal", "layer": "Motivation", "color": "#800080"},
  {"element": "Outcome", "layer": "Motivation", "color": "#800080"},
  {"element": "Principle", "layer": "Motivation", "color": "#800080"},
  {"element": "Requirement", "layer": "Motivation", "color": "#800080"},
  {"element": "Constraint", "layer": "Motivation", "color": "#800080"},
  {"element": "Meaning", "layer": "Motivation", "color": "#800080"},
  {"element": "Value", "layer": "Motivation", "color": "#800080"},
  {"element": "Resource", "layer": "Strategy", "color": "#A52A2A"},
  {"element": "Capability", "layer": "Strategy", "color": "#A52A2A"},
  {"element": "Value Stream", "layer": "Strategy", "color": "#A52A2A"},
  {"element": "Course of Action", "layer": "Strategy", "color": "#A52A2A"},
  {"element": "Business Actor", "layer": "Business", "color": "#FFFF00"},
  {"element": "Business Role", "layer": "Business", "color": "#FFFF00"},
  {"element": "Business Collaboration", "layer": "Business", "color": "#FFFF00"},
  {"element": "Business Interface", "layer": "Business", "color": "#FFFF00"},
  {"element": "Business Process", "layer": "Business", "color": "#FFFF00"},
  {"element": "Business Function", "layer": "Business", "color": "#FFFF00"},
  {"element": "Business Interaction", "layer": "Business", "color": "#FFFF00"},
  {"element": "Business Event", "layer": "Business", "color": "#FFFF00"},
  {"element": "Business Service", "layer": "Business", "color": "#FFFF00"},
  {"element": "Business Object", "layer": "Business", "color": "#FFFF00"},
  {"element": "Contract", "layer": "Business", "color": "#FFFF00"},
  {"element": "Representation", "layer": "Business", "color": "#FFFF00"},
  {"element": "Product", "layer": "Business", "color": "#FFFF00"},
  {"element": "Application Component", "layer": "Application", "color": "#0000FF"},
  {"element": "Application Collaboration", "layer": "Application", "color": "#0000FF"},
  {"element": "Application Interface", "layer": "Application", "color": "#0000FF"},
  {"element": "Application Function", "layer": "Application", "color": "#0000FF"},
  {"element": "Application Interaction", "layer": "Application", "color": "#0000FF"},
  {"element": "Application Process", "layer": "Application", "color": "#0000FF"},
  {"element": "Application Event", "layer": "Application", "color": "#0000FF"},
  {"element": "Application Service", "layer": "Application", "color": "#0000FF"},
  {"element": "Data Object", "layer": "Application", "color": "#0000FF"},
  {"element": "Node", "layer": "Technology", "color": "#008000"},
  {"element": "Device", "layer": "Technology", "color": "#008000"},
  {"element": "System Software", "layer": "Technology", "color": "#008000"},
  {"element": "Technology Collaboration", "layer": "Technology", "color": "#008000"},
  {"element": "Technology Interface", "layer": "Technology", "color": "#008000"},
  {"element": "Path", "layer": "Technology", "color": "#008000"},
  {"element": "Communication Network", "layer": "Technology", "color": "#008000"},
  {"element": "Technology Function", "layer": "Technology", "color": "#008000"},
  {"element": "Technology Process", "layer": "Technology", "color": "#008000"},
  {"element": "Technology Interaction", "layer": "Technology", "color": "#008000"},
  {"element": "Technology Event", "layer": "Technology", "color": "#008000"},
  {"element": "Technology Service", "layer": "Technology", "color": "#008000"},
  {"element": "Artifact", "layer": "Technology", "color": "#008000"},
  {"element": "Equipment", "layer": "Technology", "color": "#008000"},
  {"element": "Facility", "layer": "Technology", "color": "#008000"},
  {"element": "Distribution Network", "layer": "Technology", "color": "#008000"},
  {"element": "Material", "layer": "Technology", "color": "#008000"},
  {"element": "Work Package", "layer": "Implementation and Migration", "color": "#FFC0CB"},
  {"element": "Deliverable", "layer": "Implementation and Migration", "color": "#FFC0CB"},
  {"element": "Implementation Event", "layer": "Implementation and Migration", "color": "#FFC0CB"},
  {"element": "Plateau", "layer": "Implementation and Migration", "color": "#FFC0CB"},
  {"element": "Gap", "layer": "Implementation and Migration", "color": "#FFC0CB"},
  {"element": "Grouping", "layer": "Composite", "color": "#808080"},
  {"element": "Location", "layer": "Composite", "color": "#808080"}
]

# Create a lookup dictionary for fast color retrieval.
ELEMENT_COLOR_LOOKUP = {
    entry["element"].lower(): entry["color"]
    for entry in ELEMENT_MAPPING
}

def get_fill_color(shape_name):
    """
    Given the element name (from the file name), normalize it and return the fill color
    based on the provided mapping.
    """
    normalized = shape_name.lower().replace('-', ' ').strip()
    return ELEMENT_COLOR_LOOKUP.get(normalized)

def parse_transform(transform_str):
    """
    Parse a transform attribute of the form 'translate(tx ty)' and return (tx, ty).
    If not found, return (0, 0).
    """
    m = re.search(r"translate\(\s*([-+]?\d*\.?\d+)[,\s]+([-+]?\d*\.?\d+)\s*\)", transform_str)
    if m:
        return float(m.group(1)), float(m.group(2))
    return 0.0, 0.0

def transform_path_d(d, tx, ty):
    """
    Adjust all numeric coordinates in the 'd' attribute by applying the translation.
    Each coordinate is updated and rounded to 2 decimal places.
    """
    counter = 0
    def repl(match):
        nonlocal counter
        value = float(match.group(0))
        new_val = value + (tx if counter % 2 == 0 else ty)
        counter += 1
        return str(round(new_val, 2))
    return re.sub(r"[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?", repl, d)

def process_svg_file(file_path):
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
        # Get width and height from the <svg> element.
        width = float(root.attrib.get("width", "0"))
        height = float(root.attrib.get("height", "0"))
        # Use the file name (without extension) as the shape (element) name.
        shape_name = os.path.splitext(os.path.basename(file_path))[0]
        # Determine the fill color based on the element name.
        fill_color = get_fill_color(shape_name)

        # Find the first <g> element (considering possible namespaces).
        g = root.find(".//{http://www.w3.org/2000/svg}g")
        if g is None:
            g = root.find("g")

        # Default translation (if no transform is provided)
        tx, ty = 0.0, 0.0
        if g is not None and "transform" in g.attrib:
            tx, ty = parse_transform(g.attrib["transform"])

        elements = []
        if g is not None:
            for elem in g:
                # Remove namespace from tag name if present.
                tag = elem.tag.split("}")[-1]
                if tag == "path":
                    d = elem.attrib.get("d", "")
                    new_d = transform_path_d(d, tx, ty)
                    # Start with required attributes
                    element_data = {
                        "type": tag,
                        "d": new_d
                    }
                    
                    # Add stroke attribute if present or if it's black
                    if "stroke" in elem.attrib:
                        if elem.attrib.get("stroke", "").lower() in ["#000000", "black"]:
                            element_data["stroke"] = "black"
                        else:
                            element_data["stroke"] = elem.attrib.get("stroke")
                    
                    # Add stroke-width if present
                    if "stroke-width" in elem.attrib:
                        stroke_width = float(elem.attrib.get("stroke-width"))
                        if stroke_width < 1:
                            stroke_width = MIN_STROKE_WIDTH
                        element_data["strokeWidth"] = round(stroke_width, 2)
                    
                    # Add other stroke attributes only if present
                    if "stroke-linecap" in elem.attrib:
                        element_data["strokeLinecap"] = elem.attrib.get("stroke-linecap")
                    
                    if "stroke-linejoin" in elem.attrib:
                        element_data["strokeLinejoin"] = elem.attrib.get("stroke-linejoin")
                    
                    if "stroke-miterlimit" in elem.attrib:
                        element_data["strokeMiterlimit"] = elem.attrib.get("stroke-miterlimit")
                    
                    # Explicitly handle fill="none" to ensure it's preserved
                    if "fill" in elem.attrib:
                        fill_value = elem.attrib.get("fill")
                        element_data["fill"] = fill_value
                    
                    # Add fill-rule if present
                    if "fill-rule" in elem.attrib:
                        element_data["fillRule"] = elem.attrib.get("fill-rule")
                    elements.append(element_data)
                elif tag == "rect":
                    x = float(elem.attrib.get("x", "0"))
                    y = float(elem.attrib.get("y", "0"))
                    new_x = round(x + tx, 2)
                    new_y = round(y + ty, 2)
                    # Start with required attributes for rectangle
                    element_data = {
                        "type": tag,
                        "x": new_x,
                        "y": new_y,
                        "width": round(float(elem.attrib.get("width", "0")), 2),
                        "height": round(float(elem.attrib.get("height", "0")), 2)
                    }
                    
                    # Add stroke attribute if present
                    if "stroke" in elem.attrib:
                        element_data["stroke"] = elem.attrib.get("stroke")
                    
                    # Add stroke-width if present
                    if "stroke-width" in elem.attrib:
                        stroke_width = float(elem.attrib.get("stroke-width"))
                        if stroke_width < 1:
                            stroke_width = MIN_STROKE_WIDTH
                        element_data["strokeWidth"] = round(stroke_width, 2)
                    
                    # Add fill attribute (from element color or from SVG)
                    if fill_color is not None:
                        element_data["fill"] = fill_color
                    elif "fill" in elem.attrib:
                        element_data["fill"] = elem.attrib.get("fill")
                    elements.append(element_data)
                # Additional SVG element types can be handled here.
        shape_data = {
            "name": shape_name,
            "width": int(width),
            "height": int(height),
            "elements": elements
        }
        return shape_data
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def main():
    import argparse
    
    # Setup command-line argument parsing
    parser = argparse.ArgumentParser(
        description='Convert SVG files to JSON shape definitions for ArchiMate Renderer'
    )
    parser.add_argument(
        '--source', '-s', 
        default='./source', 
        help='Directory containing SVG files (default: ./source)'
    )
    parser.add_argument(
        '--output', '-o', 
        default='all-shapes.json', 
        help='Output JSON file path (default: all-shapes.json)'
    )
    
    args = parser.parse_args()
    
    # Check if source directory exists
    source_dir = args.source
    if not os.path.isdir(source_dir):
        print(f"Error: Source directory '{source_dir}' does not exist")
        return
    
    shapes = []
    # Process all .svg files in the source directory
    for file in os.listdir(source_dir):
        if file.endswith(".svg"):
            file_path = os.path.join(source_dir, file)
            shape = process_svg_file(file_path)
            if shape:
                shapes.append(shape)
                print(f"Processed: {file}")
    
    if not shapes:
        print(f"Warning: No SVG files found in '{source_dir}'")
        return
    
    # Write the JSON output to the specified file
    with open(args.output, "w") as out_file:
        json.dump(shapes, out_file, indent=2)
    
    print(f"Successfully processed {len(shapes)} shapes and saved to '{args.output}'")

if __name__ == "__main__":
    main()
