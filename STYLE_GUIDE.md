# ArchiMate Renderer Style Guide

This document outlines the coding standards and style guidelines for the ArchiMate Renderer project. Following these guidelines helps maintain consistency across the codebase and makes it easier for contributors to understand and modify the code.

## TypeScript Guidelines

### Formatting

- Use 2 spaces for indentation
- Use semicolons at the end of statements
- Use single quotes for string literals (with template literals allowed when appropriate)
- Limit line length to 100 characters when possible
- Use trailing commas in multi-line object literals and array literals
- Place opening braces on the same line as the statement
- Add a space before opening parenthesis in control statements (if, while, etc.)
- No space between function name and opening parenthesis
- Add spaces around operators (=, +, -, *, /, etc.)

```typescript
// Good
function calculateDimensions(width: number, height: number): Dimensions {
  const area = width * height;
  const aspectRatio = width / height;
  
  if (width > 100) {
    return {
      width,
      height,
      area,
      aspectRatio,
    };
  }
  
  return { width, height, area, aspectRatio };
}
```

### Naming Conventions

- Use `camelCase` for variables, functions, and method names
- Use `PascalCase` for class names, interfaces, types, and enums
- Use `UPPER_SNAKE_CASE` for constants
- Prefix interfaces with `I` (e.g., `IShape`)
- Prefix private class members with an underscore (e.g., `_privateMethod()`)
- Use descriptive names that convey meaning and purpose

```typescript
// Good
interface IShapeOptions {
  width: number;
  height: number;
  fillColor: string;
  strokeColor: string;
}

class RectangleShape implements IShape {
  private _dimensions: Dimensions;
  
  constructor(options: IShapeOptions) {
    // ...
  }
  
  public render(): SVGElement {
    // ...
  }
  
  private _calculateBoundingBox(): BoundingBox {
    // ...
  }
}

const DEFAULT_PADDING = 20;
```

### Code Organization

- Group related functionality in the same file or module
- Order class members: static properties, instance properties, constructor, public methods, private methods
- Keep files focused on a single responsibility
- Use barrel exports (index.ts files) to simplify imports
- Organize imports in groups: external libraries, internal modules, relative imports

### Documentation

- Use JSDoc comments for public APIs
- Document parameters, return values, and thrown exceptions
- Include examples where appropriate
- Document complex algorithms or non-obvious behavior

```typescript
/**
 * Renders an ArchiMate element as an SVG element.
 * 
 * @param element The ArchiMate element to render
 * @param options Rendering options
 * @returns An SVG element representing the ArchiMate element
 * @throws Error if the element type is not supported
 * 
 * @example
 * ```typescript
 * const element = { id: 'elem1', type: 'BusinessActor', name: 'User' };
 * const svg = renderElement(element, { width: 100, height: 50 });
 * ```
 */
function renderElement(element: ArchiMateElement, options: RenderOptions): SVGElement {
  // ...
}
```

### TypeScript Features

- Use explicit type annotations for function parameters and return types
- Use interfaces for object shapes
- Use enums for sets of related constants
- Use generics when appropriate
- Use optional chaining and nullish coalescing when appropriate
- Use type guards to narrow types

### Error Handling

- Use specific error types or messages
- Handle errors at the appropriate level
- Avoid swallowing errors without logging or reporting
- Use try/catch blocks for error recovery

## Testing Guidelines

- Write unit tests for all public APIs
- Use descriptive test names that explain the expected behavior
- Follow the Arrange-Act-Assert pattern
- Mock external dependencies
- Test edge cases and error conditions

## Git Workflow

- Use feature branches for new features or bug fixes
- Write clear, descriptive commit messages
- Keep commits focused on a single change
- Rebase feature branches on main before creating pull requests
- Squash commits before merging when appropriate

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
