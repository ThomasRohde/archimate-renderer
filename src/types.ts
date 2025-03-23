/**
 * Type definitions for archimate-renderer
 */

/**
 * ArchiMate element types
 */
export enum ArchiMateElementType {
  // Business layer
  BusinessActor = 'BusinessActor',
  BusinessRole = 'BusinessRole',
  BusinessCollaboration = 'BusinessCollaboration',
  BusinessInterface = 'BusinessInterface',
  BusinessProcess = 'BusinessProcess',
  BusinessFunction = 'BusinessFunction',
  BusinessInteraction = 'BusinessInteraction',
  BusinessEvent = 'BusinessEvent',
  BusinessService = 'BusinessService',
  BusinessObject = 'BusinessObject',
  Contract = 'Contract',
  Representation = 'Representation',
  Product = 'Product',

  // Application layer
  ApplicationComponent = 'ApplicationComponent',
  ApplicationCollaboration = 'ApplicationCollaboration',
  ApplicationInterface = 'ApplicationInterface',
  ApplicationFunction = 'ApplicationFunction',
  ApplicationInteraction = 'ApplicationInteraction',
  ApplicationProcess = 'ApplicationProcess',
  ApplicationEvent = 'ApplicationEvent',
  ApplicationService = 'ApplicationService',
  DataObject = 'DataObject',

  // Technology layer
  Node = 'Node',
  Device = 'Device',
  SystemSoftware = 'SystemSoftware',
  TechnologyCollaboration = 'TechnologyCollaboration',
  TechnologyInterface = 'TechnologyInterface',
  Path = 'Path',
  CommunicationNetwork = 'CommunicationNetwork',
  TechnologyFunction = 'TechnologyFunction',
  TechnologyProcess = 'TechnologyProcess',
  TechnologyInteraction = 'TechnologyInteraction',
  TechnologyEvent = 'TechnologyEvent',
  TechnologyService = 'TechnologyService',
  Artifact = 'Artifact',

  // Physical layer
  Equipment = 'Equipment',
  Facility = 'Facility',
  DistributionNetwork = 'DistributionNetwork',
  Material = 'Material',

  // Motivation layer
  Stakeholder = 'Stakeholder',
  Driver = 'Driver',
  Assessment = 'Assessment',
  Goal = 'Goal',
  Outcome = 'Outcome',
  Principle = 'Principle',
  Requirement = 'Requirement',
  Constraint = 'Constraint',
  Meaning = 'Meaning',
  Value = 'Value',

  // Strategy layer
  Resource = 'Resource',
  Capability = 'Capability',
  ValueStream = 'ValueStream',
  CourseOfAction = 'CourseOfAction',

  // Implementation layer
  WorkPackage = 'WorkPackage',
  Deliverable = 'Deliverable',
  ImplementationEvent = 'ImplementationEvent',
  Plateau = 'Plateau',
  Gap = 'Gap',

  // Relationships
  Relationship = 'Relationship',

  // Other
  AndJunction = 'AndJunction',
  OrJunction = 'OrJunction',
  Group = 'Group',
  Location = 'Location',
}

/**
 * ArchiMate relationship types
 */
export enum ArchiMateRelationshipType {
  Composition = 'Composition',
  Aggregation = 'Aggregation',
  Assignment = 'Assignment',
  Realization = 'Realization',
  Serving = 'Serving',
  Access = 'Access',
  Influence = 'Influence',
  Triggering = 'Triggering',
  Flow = 'Flow',
  Specialization = 'Specialization',
  Association = 'Association',
}

/**
 * ArchiMate element interface
 */
export interface IArchiMateElement {
  id: string;
  name?: string;
  type: ArchiMateElementType;
  documentation?: string;
  properties?: Record<string, string>;
}

/**
 * ArchiMate relationship interface
 */
export interface IArchiMateRelationship {
  id: string;
  name?: string;
  type: ArchiMateRelationshipType;
  source: string; // ID of source element
  target: string; // ID of target element
  documentation?: string;
  properties?: Record<string, string>;
  accessType?: string; // For Access relationships: Read, Write, ReadWrite
}

/**
 * ArchiMate view interface
 */
export interface IArchiMateView {
  id: string;
  name?: string;
  documentation?: string;
  viewpoint?: string;
  elements: IArchiMateViewElement[];
  relationships: IArchiMateViewRelationship[];
}

/**
 * ArchiMate view element interface
 */
export interface IArchiMateViewElement {
  elementRef: string; // ID of the referenced element
  x: number;
  y: number;
  width: number;
  height: number;
  style?: IViewElementStyle;
}

/**
 * ArchiMate view relationship interface
 */
export interface IArchiMateViewRelationship {
  relationshipRef: string; // ID of the referenced relationship
  bendpoints?: IPoint[];
  style?: IViewRelationshipStyle;
}

/**
 * Point interface for coordinates
 */
export interface IPoint {
  x: number;
  y: number;
}

/**
 * Style for view elements
 */
export interface IViewElementStyle {
  fillColor?: string;
  strokeColor?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  opacity?: number;
  isCompound?: boolean; // Indicates if the element contains other elements
}

/**
 * Style for view relationships
 */
export interface IViewRelationshipStyle {
  strokeColor?: string;
  strokeWidth?: number;
  strokeDashArray?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
}

/**
 * ArchiMate model interface
 */
export interface IArchiMateModel {
  id: string;
  name?: string;
  documentation?: string;
  elements: IArchiMateElement[];
  relationships: IArchiMateRelationship[];
  views: IArchiMateView[];
  properties?: Record<string, string>;
}
