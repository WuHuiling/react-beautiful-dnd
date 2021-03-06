/* tslint:disable */
/* eslint-disable */

// Type definitions for react-beautiful-dnd 10.0.3
// Project: https://github.com/atlassian/react-beautiful-dnd
// Forked definition project by:
//                 varHarrie <https://github.com/varHarrie>
//                 Bradley Ayers <https://github.com/bradleyayers>
//                 Austin Turner <https://github.com/paustint>
//                 Mark Nelissen <https://github.com/marknelissen>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.8

import * as React from 'react'

export type Id = string
export type DraggableId = Id
export type DroppableId = Id
export type TypeId = Id
export type ZIndex = React.CSSProperties['zIndex']
export type DropReason = 'DROP' | 'CANCEL'
export type Announce = (message: string) => void
export type DraggableType = TypeId // tb forked
export type DroppableType = TypeId | TypeId[] // tb forked
export type MovementMode = 'FLUID' | 'SNAP'

export type Combine = {
  draggableId: DraggableId
  droppableId: DroppableId
}

export interface DraggableLocation {
  droppableId: DroppableId
  index: number
}

export interface ResponderProvided {
  announce: Announce
}

/**
 *  DragDropContext
 */

export interface DragStart {
  draggableId: DraggableId
  type: DraggableType
  source: DraggableLocation
  mode: MovementMode
}

export interface DragUpdate extends DragStart {
  destination?: DraggableLocation | null
  combine?: Combine
}

export interface DropResult extends DragUpdate {
  reason: DropReason
}

export type OnBeforeDragStartResponder = (start: DragStart) => any;
export type OnDragStartResponder = (
  start: DragStart,
  provided: ResponderProvided,
) => any;
export type OnDragUpdateResponder = (
  update: DragUpdate,
  provided: ResponderProvided,
) => any;
export type OnDragEndResponder = (
  result: DropResult,
  provided: ResponderProvided,
) => any;

export interface DragDropContextProps {
  onBeforeDragStart?: OnBeforeDragStartResponder,
  onDragStart?: OnDragStartResponder,
  onDragUpdate?: OnDragUpdateResponder,
  onDragEnd: OnDragEndResponder,
  viewportClassName?: string
}

export class DragDropContext extends React.Component<DragDropContextProps> {}

/**
 *  Droppable
 */

export interface DroppableProvidedProps {
  // used for shared global styles
  'data-react-beautiful-dnd-droppable': string
}

export interface DroppableProvided {
  innerRef(element: HTMLElement | null): any
  placeholder?: React.ReactElement<any> | null
  droppableProps: DroppableProvidedProps
}

export interface DroppableStateSnapshot {
  isDraggingOver: boolean
  draggingOverWith?: DraggableId
  draggingFrom?: DroppableId
}

export interface DroppableProps {
  droppableId: DroppableId
  type?: DroppableType
  ignoreContainerClipping?: boolean
  isDropDisabled?: boolean
  isCombineEnabled?: boolean
  isSortable?: boolean // tb forked
  direction?: 'vertical' | 'horizontal'
  children(provided: DroppableProvided, snapshot: DroppableStateSnapshot): React.ReactElement<any>
}

export class Droppable extends React.Component<DroppableProps> {}

/**
 *  Draggable
 */

export interface NotDraggingStyle {
  transform?: string
  transition?: 'none'
}

export interface DraggingStyle {
  pointerEvents: 'none'
  position: 'fixed'
  width: number
  height: number
  boxSizing: 'border-box'
  top: number
  left: number
  margin: 0
  transform?: string
  transition: 'none'
  zIndex: ZIndex
}

export interface DraggableProvidedDraggableProps {
  // inline style
  style?: DraggingStyle | NotDraggingStyle
  // used for shared global styles
  'data-react-beautiful-dnd-draggable': string
}

export interface DraggableProvidedDragHandleProps {
  onMouseDown: React.MouseEventHandler<any>
  onKeyDown: React.KeyboardEventHandler<any>
  onTouchStart: React.TouchEventHandler<any>
  onTouchMove: React.TouchEventHandler<any>
  'data-react-beautiful-dnd-drag-handle': string
  'aria-roledescription': string
  tabIndex: number
  'aria-grabbed': boolean
  draggable: boolean
  onDragStart: React.DragEventHandler<any>
}

export interface DraggableProvided {
  draggableProps: DraggableProvidedDraggableProps
  dragHandleProps: DraggableProvidedDragHandleProps | null

  // will be removed after move to react 16
  innerRef(element?: HTMLElement | null): any
  placeholder?: React.ReactElement<any> | null
}

// to easily enable patching of styles
export type DropAnimation = {
  duration: number
  curve: string
  moveTo: Position
  opacity?: number
  scale?: number
}

export interface DraggableStateSnapshot {
  isDragging: boolean
  isDropAnimating: boolean
  dropAnimation?: DropAnimation
  draggingOver?: DroppableId
  combineWith?: DraggableId
  combineTargetFor?: DraggableId
  mode?: MovementMode
}

export interface DraggableProps {
  draggableId: DroppableId
  index: number
  isDragDisabled?: boolean
  disableInteractiveElementBlocking?: boolean
  children(provided: DraggableProvided, snapshot: DraggableStateSnapshot): React.ReactElement<any>
  type?: DraggableType
}

export class Draggable extends React.Component<DraggableProps> {}
