// @flow
import { type Position, type Rect } from 'css-box-model';
import type {
  DragMovement,
  DraggableDimension,
  DroppableDimension,
  DragImpact,
  Axis,
  Displacement,
  Viewport,
  UserDirection,
  DisplacedBy,
} from '../../types';
import getDisplacement from '../get-displacement';
import getDisplacementMap from '../get-displacement-map';
import isUserMovingForward from '../user-direction/is-user-moving-forward';
import getDisplacedBy from '../get-displaced-by';
import isSameType from './is-same-type';

const getNewIndex = (
  startIndex: number,
  amountOfDisplaced: number,
  isInFrontOfStart: boolean,
): number => {
  if (!amountOfDisplaced) {
    return startIndex;
  }

  if (isInFrontOfStart) {
    return startIndex + amountOfDisplaced;
  }
  // is moving backwards
  return startIndex - amountOfDisplaced;
};

type Args = {|
  pageBorderBoxCenterWithDroppableScrollChange: Position,
  draggable: DraggableDimension,
  home: DroppableDimension,
  insideHome: DraggableDimension[],
  previousImpact: DragImpact,
  viewport: Viewport,
  userDirection: UserDirection,
|};

export default ({
  pageBorderBoxCenterWithDroppableScrollChange: currentCenter,
  draggable,
  home,
  insideHome,
  previousImpact,
  viewport,
  userDirection: currentUserDirection,
}: Args): DragImpact => {
  const axis: Axis = home.axis;
  // The starting center position
  const originalCenter: Position = draggable.page.borderBox.center;
  const targetCenter: number = currentCenter[axis.line];
  const isInFrontOfStart: boolean = targetCenter > originalCenter[axis.line];

  // when behind where we started we push items forward
  // when in front of where we started we push items backwards
  const willDisplaceForward: boolean = !isInFrontOfStart;

  const isMovingForward: boolean = isUserMovingForward(
    home.axis,
    currentUserDirection,
  );
  const isMovingTowardStart: boolean = isInFrontOfStart
    ? !isMovingForward
    : isMovingForward;

  const displacedBy: DisplacedBy = getDisplacedBy(
    home.axis,
    draggable.displaceBy,
    willDisplaceForward,
  );
  const displacement: number = displacedBy.value;

  const dimensionIndexes: Array<number> = [];

  const dimensions = insideHome // prettier-ignore
    .filter(
      (child: DraggableDimension, index: number): boolean => {
        // do not want to displace the item that is dragging
        if (child === draggable) {
          return false;
        }

        const borderBox: Rect = child.page.borderBox;
        const start: number = borderBox[axis.start];
        const end: number = borderBox[axis.end];

        if (isInFrontOfStart) {
          // Nothing behind start can be displaced
          if (child.descriptor.index < draggable.descriptor.index) {
            return false;
          }

          // Moving backwards towards the starting location
          // Can reduce the amount of things that are displaced
          // Need to check if the center is going over the
          // end edge of a the target
          // We apply the displacement to the calculation even if
          // the item is not displaced so that it will have a consistent
          // impact moving in a list as well as moving into it
          if (isMovingTowardStart) {
            const displacedEndEdge: number = end + displacement;
            if (targetCenter > displacedEndEdge) {
              dimensionIndexes.push(index);
            }
            return targetCenter > displacedEndEdge;
          }

          // Moving forwards away from the starting location
          // Need to check if the center is going over the
          // start edge of the target
          // Can increase the amount of things that are displaced

          if (targetCenter >= start) {
            dimensionIndexes.push(index);
          }
          return targetCenter >= start;
        }

        // is behind where we started

        // Nothing in front of start can be displaced
        if (child.descriptor.index > draggable.descriptor.index) {
          return false;
        }

        // Moving back towards the starting location
        // Can reduce the amount of things displaced
        // We apply the displacement to the calculation even if
        // the item is not displaced so that it will have a consistent
        // impact moving in a list as well as moving into it
        // End displacement when we move onto the displaced start edge
        if (isMovingTowardStart) {
          const displacedStartEdge: number = start + displacement;
          if (targetCenter < displacedStartEdge) {
            dimensionIndexes.push(index);
          }
          return targetCenter < displacedStartEdge;
        }

        // Continuing to move further away backwards from the start
        // Can increase the amount of things that are displaced
        // Shift once the center goes onto the end of the thing before it
        if (targetCenter <= end) {
          return dimensionIndexes.push(index);
        }
        return targetCenter <= end;
      },
    );

  function getSortableDimensions(): DraggableDimension[] {
    if (!dimensions.length) {
      return dimensions;
    }

    if (isInFrontOfStart) {
      const theLastDimension = dimensions[dimensions.length - 1];
      const theLastDimensionIsSortable = isSameType(
        theLastDimension,
        draggable,
      );

      const theNextDimensionIndex =
        dimensionIndexes[dimensionIndexes.length - 1] + 1;
      const theNextDimension = insideHome[theNextDimensionIndex] || null;
      const theNextDimensionIsSortable = isSameType(
        theNextDimension,
        draggable,
      );

      const isEndOfTheList = insideHome.length === theNextDimensionIndex;

      if (
        theLastDimensionIsSortable ||
        theNextDimensionIsSortable ||
        isEndOfTheList
      ) {
        return dimensions;
      }

      return [];
    }

    const theFirstDimension = dimensions[0];
    const theFirstDimensionIsSortable = isSameType(
      theFirstDimension,
      draggable,
    );

    const thePreviousDimensionIndex = dimensionIndexes[0] - 1;
    const thePreviousDimension = insideHome[thePreviousDimensionIndex] || null;
    const thePreviousDimensionIsSortable = isSameType(
      thePreviousDimension,
      draggable,
    );

    const isTopOfTheList = thePreviousDimensionIndex === -1;

    if (
      theFirstDimensionIsSortable ||
      thePreviousDimensionIsSortable ||
      isTopOfTheList
    ) {
      return dimensions;
    }

    return [];
  }

  const sortableDimensions: DraggableDimension[] = getSortableDimensions();
  const displaced: Displacement[] = sortableDimensions.map(
    (dimension: DraggableDimension): Displacement =>
      getDisplacement({
        draggable: dimension,
        destination: home,
        previousImpact,
        viewport: viewport.frame,
      }),
  );

  // Need to ensure that we always order by the closest impacted item
  // when in front of start (displacing backwards) we need to reverse
  // the natural order of the list so that it is ordered from last to first
  const ordered: Displacement[] = isInFrontOfStart
    ? displaced.reverse()
    : displaced;
  const index: number = getNewIndex(
    draggable.descriptor.index,
    ordered.length,
    isInFrontOfStart,
  );

  const newMovement: DragMovement = {
    displaced: ordered,
    map: getDisplacementMap(ordered),
    willDisplaceForward,
    displacedBy,
  };

  const impact: DragImpact = {
    movement: newMovement,
    direction: axis.direction,
    destination: {
      droppableId: home.descriptor.id,
      index,
    },
    merge: null,
  };

  return impact;
};
