import json
import os
from collections import defaultdict

def create_rectangle_shape(width, height, fill="#FFFFFF", stroke="black", stroke_width=0.67):
    """Create a rectangle shape with the given parameters."""
    return {
        "name": "rectangle",
        "width": width,
        "height": height,
        "elements": [
            {
                "type": "path",
                "d": f"M1.5 0.5 {width-0.5} 0.5 {width-0.5} {height-0.5} 1.5 {height-0.5}Z",
                "stroke": stroke,
                "strokeWidth": stroke_width,
                "strokeMiterlimit": "1",
                "fill": fill,
                "fillRule": "evenodd"
            }
        ]
    }

def create_rounded_rectangle_shape(width, height, corner_radius=6.72, fill="#FFFFFF", stroke="black", stroke_width=0.67):
    """Create a rounded rectangle shape with the given parameters."""
    # Calculate corner positions
    left = 1.5
    right = width - 0.5
    top = 1.5
    bottom = height - 0.5
    
    # Calculate control points for rounded corners
    corner_radius = min(corner_radius, (width - 3) / 2, (height - 3) / 2)
    
    # Path data for rounded rectangle
    path_data = (
        f"M{left + corner_radius} {top} "
        f"{right - corner_radius} {top}"
        f"C{right - corner_radius/3} {top} {right} {top + corner_radius/3} {right} {top + corner_radius}"
        f"L{right} {bottom - corner_radius}"
        f"C{right} {bottom - corner_radius/3} {right - corner_radius/3} {bottom} {right - corner_radius} {bottom}"
        f"L{left + corner_radius} {bottom}"
        f"C{left + corner_radius/3} {bottom} {left} {bottom - corner_radius/3} {left} {bottom - corner_radius}"
        f"L{left} {top + corner_radius}"
        f"C{left} {top + corner_radius/3} {left + corner_radius/3} {top} {left + corner_radius} {top}Z"
    )
    
    return {
        "name": "rounded-rectangle",
        "width": width,
        "height": height,
        "elements": [
            {
                "type": "path",
                "d": path_data,
                "stroke": stroke,
                "strokeWidth": stroke_width,
                "strokeMiterlimit": "1",
                "fill": fill,
                "fillRule": "evenodd"
            }
        ]
    }

def create_chamfered_rectangle_shape(width, height, chamfer_size=5.6, fill="#FFFFFF", stroke="black", stroke_width=0.67):
    """Create a chamfered rectangle shape with the given parameters."""
    # Calculate corner positions
    left = 1.5
    right = width - 0.5
    top = 0.5
    bottom = height - 0.5
    
    # Calculate chamfer size (limit to half the height or width)
    chamfer_size = min(chamfer_size, (height - 1) / 2, (width - 3) / 2)
    
    # Path data for chamfered rectangle
    path_data = (
        f"M{left + chamfer_size} {top} "
        f"{right - chamfer_size} {top} "
        f"{right} {top + chamfer_size} "
        f"{right} {bottom - chamfer_size} "
        f"{right - chamfer_size} {bottom} "
        f"{left + chamfer_size} {bottom} "
        f"{left} {bottom - chamfer_size} "
        f"{left} {top + chamfer_size} "
        f"{left + chamfer_size} {top}Z"
    )
    
    return {
        "name": "chamfered-rectangle",
        "width": width,
        "height": height,
        "elements": [
            {
                "type": "path",
                "d": path_data,
                "stroke": stroke,
                "strokeWidth": stroke_width,
                "strokeMiterlimit": "1",
                "fill": fill,
                "fillRule": "evenodd"
            }
        ]
    }

def load_json_file(file_path):
    """Load and return JSON data from a file."""
    with open(file_path, 'r') as f:
        return json.load(f)

def create_svg_element(element_type, attributes):
    """Create an SVG element string with the given type and attributes."""
    attrs_str = ' '.join([f'{k}="{v}"' for k, v in attributes.items() if v is not None])
    return f'<{element_type} {attrs_str} />'

def create_svg_group(content, attributes=None):
    """Create an SVG group element with the given content and attributes."""
    attrs_str = ''
    if attributes:
        attrs_str = ' '.join([f'{k}="{v}"' for k, v in attributes.items() if v is not None])
    return f'<g {attrs_str}>{content}</g>'

def create_svg_path(d, stroke=None, stroke_width=None, fill=None, fill_rule=None, stroke_linecap=None, stroke_linejoin=None, stroke_miterlimit=None):
    """Create an SVG path element."""
    # Only include required 'd' attribute and any other attributes that are present
    attributes = {'d': d}
    
    # Only add attributes that are actually present
    if stroke is not None:
        attributes['stroke'] = stroke
    if stroke_width is not None:
        attributes['stroke-width'] = stroke_width
    if fill is not None:
        attributes['fill'] = fill
    if fill_rule is not None:
        attributes['fill-rule'] = fill_rule
    if stroke_linecap is not None:
        attributes['stroke-linecap'] = stroke_linecap
    if stroke_linejoin is not None:
        attributes['stroke-linejoin'] = stroke_linejoin
    if stroke_miterlimit is not None:
        attributes['stroke-miterlimit'] = stroke_miterlimit
    
    return create_svg_element('path', attributes)

def create_svg_rect(x, y, width, height, stroke=None, stroke_width=None, fill=None):
    """Create an SVG rect element."""
    # Include required position and size attributes
    attributes = {
        'x': x,
        'y': y,
        'width': width,
        'height': height
    }
    
    # Only add style attributes that are actually present
    if stroke is not None:
        attributes['stroke'] = stroke
    if stroke_width is not None:
        attributes['stroke-width'] = stroke_width
    if fill is not None:
        attributes['fill'] = fill
    
    return create_svg_element('rect', attributes)

def create_svg_text(x, y, text, font_size=12, text_anchor='middle'):
    """Create an SVG text element."""
    return f'<text x="{x}" y="{y}" font-size="{font_size}" text-anchor="{text_anchor}">{text}</text>'

def render_shape(shape, x, y, scale=1.0, override_fill=None):
    """Render a shape at the specified position with optional scaling and fill override."""
    elements_svg = []
    
    for element in shape['elements']:
        if element['type'] == 'path':
            # Create a dictionary of parameters for create_svg_path
            path_params = {'d': element.get('d')}
            
            # Only add parameters that exist in the element
            if 'stroke' in element:
                path_params['stroke'] = element['stroke']
            if 'strokeWidth' in element:
                path_params['stroke_width'] = element['strokeWidth']
                
            # Handle fill attribute - respect 'none' value and absence of fill
            if 'fill' in element:
                # If fill is explicitly set to 'none', keep it as none
                if element['fill'] == 'none':
                    path_params['fill'] = 'none'
                # Otherwise, use override_fill if provided, or the element's fill
                else:
                    path_params['fill'] = override_fill if override_fill is not None else element['fill']
            # If no fill attribute, don't add a fill at all (don't use override_fill)
                
            if 'fillRule' in element:
                path_params['fill_rule'] = element['fillRule']
            if 'strokeLinecap' in element:
                path_params['stroke_linecap'] = element['strokeLinecap']
            if 'strokeLinejoin' in element:
                path_params['stroke_linejoin'] = element['strokeLinejoin']
            if 'strokeMiterlimit' in element:
                path_params['stroke_miterlimit'] = element['strokeMiterlimit']
            
            elements_svg.append(create_svg_path(**path_params))
            
        elif element['type'] == 'rect':
            # Create a dictionary of parameters for create_svg_rect
            rect_params = {
                'x': element.get('x'),
                'y': element.get('y'),
                'width': element.get('width'),
                'height': element.get('height')
            }
            
            # Only add parameters that exist in the element
            if 'stroke' in element:
                rect_params['stroke'] = element['stroke']
            if 'strokeWidth' in element:
                rect_params['stroke_width'] = element['strokeWidth']
                
            # Handle fill attribute - respect 'none' value and absence of fill
            if 'fill' in element:
                # If fill is explicitly set to 'none', keep it as none
                if element['fill'] == 'none':
                    rect_params['fill'] = 'none'
                # Otherwise, use override_fill if provided, or the element's fill
                else:
                    rect_params['fill'] = override_fill if override_fill is not None else element['fill']
            # If no fill attribute, don't add a fill at all (don't use override_fill)
            
            elements_svg.append(create_svg_rect(**rect_params))
    
    # Create a group for the shape with translation
    return create_svg_group(''.join(elements_svg), {'transform': f'translate({x}, {y}) scale({scale})'})

def main():
    # Load the necessary data
    script_dir = os.path.dirname(os.path.abspath(__file__))
    element_mapping = load_json_file(os.path.join(script_dir, 'element-mapping.json'))
    all_shapes = load_json_file(os.path.join(script_dir, 'all-shapes.json'))
    layer_mapping = load_json_file(os.path.join(script_dir, 'layer-mapping.json'))
    
    # Create a lookup for shapes by name
    shapes_by_name = {shape['name']: shape for shape in all_shapes}
    
    # Add our generated shapes
    shapes_by_name['rectangle'] = create_rectangle_shape(112, 46)
    shapes_by_name['rounded-rectangle'] = create_rounded_rectangle_shape(111, 46)
    shapes_by_name['chamfered-rectangle'] = create_chamfered_rectangle_shape(114, 46)
    
    # Create a lookup for layer information by element name
    layer_by_element = {item['element']: {'layer': item['layer'], 'color': item['color']} for item in layer_mapping}
    
    # Group elements by layer
    elements_by_layer = defaultdict(list)
    for element_info in element_mapping:
        element_name = element_info['element']
        layer_info = layer_by_element.get(element_name, {'layer': 'Other', 'color': '#FFFFFF'})
        element_info['layer_color'] = layer_info['color']  # Add color to element info
        elements_by_layer[layer_info['layer']].append(element_info)
    
    # Sort layers in a specific order
    layer_order = [
        'Motivation', 
        'Strategy', 
        'Business', 
        'Application', 
        'Technology', 
        'Implementation and Migration', 
        'Composite',
        'Other'
    ]
    
    # Define poster dimensions and layout parameters
    poster_width = 1400
    poster_height = 2400  # Increased from 1800 to 2400 to ensure all elements are visible
    margin = 50
    title_height = 80
    layer_title_height = 40
    shape_width = 200
    shape_height = 80
    shapes_per_row = 6
    row_height = 120
    
    # Start building the SVG content
    svg_content = [
        '<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
        f'<svg width="{poster_width}" height="{poster_height}" xmlns="http://www.w3.org/2000/svg">',
        # Add a white background
        f'<rect width="{poster_width}" height="{poster_height}" fill="white"/>',
        # Add poster title
        f'<text x="{poster_width/2}" y="{margin + 40}" font-size="32" font-weight="bold" text-anchor="middle">ArchiMate Element Shapes</text>'
    ]
    
    # Current y position for layout
    current_y = margin + title_height
    
    # Process each layer
    for layer in layer_order:
        if layer in elements_by_layer and elements_by_layer[layer]:
            # Add layer title
            svg_content.append(
                f'<text x="{margin}" y="{current_y + 30}" font-size="24" font-weight="bold" font-family="Arial, Helvetica, sans-serif">{layer} Layer</text>'
            )
            current_y += layer_title_height
            
            # Process elements in this layer
            elements = elements_by_layer[layer]
            for i, element_info in enumerate(elements):
                row = i // shapes_per_row
                col = i % shapes_per_row
                
                x = margin + col * shape_width
                y = current_y + row * row_height
                
                # Get the icon and base shapes
                icon_name = element_info['icon']
                base_name = element_info['base']
                layer_color = element_info['layer_color']
                
                # If the base shape is one of our generated shapes, create it with the layer color
                if base_name in ["rectangle", "rounded-rectangle", "chamfered-rectangle"]:
                    if base_name == "rectangle":
                        base_shape = create_rectangle_shape(shape_width, shape_height, fill=layer_color)
                    elif base_name == "rounded-rectangle":
                        base_shape = create_rounded_rectangle_shape(shape_width, shape_height, fill=layer_color)
                    elif base_name == "chamfered-rectangle":
                        base_shape = create_chamfered_rectangle_shape(shape_width, shape_height, fill=layer_color)
                
                # Render the base shape if it exists
                if base_name in shapes_by_name:
                    # Scale factor to fit within our grid
                    scale_x = (shape_width * 0.8) / base_shape['width']
                    scale_y = (shape_height * 0.6) / base_shape['height']
                    scale = min(scale_x, scale_y)
                    
                    # Center the shape in its cell
                    center_x = x + shape_width / 2 - (base_shape['width'] * scale) / 2
                    center_y = y + shape_height / 2 - (base_shape['height'] * scale) / 2
                    
                    # Use the layer color for the base shape
                    svg_content.append(render_shape(base_shape, center_x, center_y, scale, layer_color))
                
                # Render the icon shape if it exists and is different from the base
                if icon_name != base_name and icon_name in shapes_by_name:
                    icon_shape = shapes_by_name[icon_name]
                    # Scale factor for the icon - make it smaller (10% of shape width/height)
                    icon_scale_factor = 0.2
                    icon_scale_x = (shape_width * icon_scale_factor) / icon_shape['width']
                    icon_scale_y = (shape_height * icon_scale_factor) / icon_shape['height']
                    icon_scale = min(icon_scale_x, icon_scale_y)
                    
                    # Calculate the scaled dimensions of the base shape
                    scaled_base_width = base_shape['width'] * scale
                    
                    # Calculate the scaled dimensions of the icon
                    scaled_icon_width = icon_shape['width'] * icon_scale
                    
                    # Define padding constants for x and y directions
                    icon_padding_x = 5  # Padding from the right edge in pixels
                    icon_padding_y = 5  # Padding from the top edge in pixels
                    
                    # First, render the base shape
                    base_svg = render_shape(base_shape, 0, 0, scale, layer_color)
                    
                    # For the x-coordinate, position based on scaled base width and icon width
                    # Place the icon at (scaled_base_width - scaled_icon_width - padding_x)
                    icon_x_relative = scaled_base_width - scaled_icon_width - icon_padding_x
                    
                    # For the y-coordinate, position with a fixed padding from the top
                    icon_y_relative = icon_padding_y
                    
                    # Render the icon at the calculated position
                    icon_svg = render_shape(icon_shape, icon_x_relative, icon_y_relative, icon_scale, layer_color)
                    
                    # Create a combined SVG group
                    combined_svg = f'<g transform="translate({center_x}, {center_y})">{base_svg}{icon_svg}</g>'
                    
                    # Add the combined SVG to the content
                    svg_content.append(combined_svg)
                
                # Add element name as a separate text element outside of any groups
                # Position it below the shape with enough padding to be visible
                text_y = y + shape_height + 4
                element_text = f'<text x="{x + shape_width/2}" y="{text_y}" font-size="12" font-weight="bold" text-anchor="middle" fill="black">{element_info["element"]}</text>'
                svg_content.append(element_text)
            
            # Update current_y for the next layer
            rows_in_layer = (len(elements) + shapes_per_row - 1) // shapes_per_row
            current_y += rows_in_layer * row_height + margin
    
    # Close the SVG
    svg_content.append('</svg>')
    
    # Write the SVG to a file
    with open(os.path.join(script_dir, 'poster.svg'), 'w') as f:
        f.write('\n'.join(svg_content))
    
    print(f"Poster generated at {os.path.join(script_dir, 'poster.svg')}")

if __name__ == "__main__":
    main()
