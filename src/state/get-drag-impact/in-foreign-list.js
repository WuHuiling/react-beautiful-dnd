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

type Args = {|
  pageBorderBoxCenterWithDroppableScrollChange: Position,
  draggable: DraggableDimension,
  destination: DroppableDimension,
  insideDestination: DraggableDimension[],
  previousImpact: DragImpact,
  viewport: Viewport,
  userDirection: UserDirection,
|};

export default ({
  pageBorderBoxCenterWithDroppableScrollChange: currentCenter,
  draggable,
  destination,
  insideDestination,
  previousImpact,
  viewport,
  userDirection,
}: Args): DragImpact => {
  const axis: Axis = destination.axis;

  const isMovingForward: boolean = isUserMovingForward(
    destination.axis,
    userDirection,
  );

  const displacedBy: DisplacedBy = getDisplacedBy(
    destination.axis,
    draggable.displaceBy,
    // always displace forward in foreign list
    true,
  );

  const targetCenter: number = currentCenter[axis.line];
  const displacement: number = displacedBy.value;

  const dimensionIndexes = [];

  const dimensions: DraggableDimension[] = insideDestination // prettier-ignore
    .filter(
      (child: DraggableDimension, index: number): boolean => {
        const borderBox: Rect = child.page.borderBox;
        const start: number = borderBox[axis.start];
        const end: number = borderBox[axis.end];

        // If entering list then assume everything is displaced for initial impact
        // reminder: 'displacement' can be positive or negative

        // When in foreign list, can only displace forwards
        // Moving forward will decrease the amount of things needed to be displaced
        if (isMovingForward) {
          if (targetCenter <= start + displacement) {
            dimensionIndexes.push(index);
          }
          return targetCenter <= start + displacement;
        }

        // Moving backwards towards top of list
        // Moving backwards will increase the amount of things needed to be displaced

        // this will be hit when:
        // - move backwards in the first position
        // - enter into a foreign list moving backwards

        if (targetCenter < end) {
          dimensionIndexes.push(index);
        }
        return targetCenter < end;
      },
    );

  function getSortableDimensions(): DraggableDimension[] {
    const isEndOfTheList = dimensions.length === insideDestination.length;

    if (!dimensions.length || isEndOfTheList) {
      return dimensions;
    }

    const firstDimension = dimensions[0];
    const firstDimensionIsSortable = isSameType(firstDimension, draggable);

    const previousDimensionIndex = dimensionIndexes[0] - 1;
    const previousDimension = insideDestination[previousDimensionIndex] || null;
    const previousDimensionIsSortable = isSameType(
      previousDimension,
      draggable,
    );

    if (firstDimensionIsSortable || previousDimensionIsSortable) {
      return dimensions;
    }

    return [];
  }

  const sortableDimensions: DraggableDimension[] = getSortableDimensions();
  const displaced: Displacement[] = sortableDimensions.map(
    (dimension: DraggableDimension): Displacement =>
      getDisplacement({
        draggable: dimension,
        destination,
        previousImpact,
        viewport: viewport.frame,
      }),
  );

  const newIndex: number = insideDestination.length - displaced.length;

  const movement: DragMovement = {
    displacedBy,
    displaced,
    map: getDisplacementMap(displaced),
    willDisplaceForward: true,
  };

  const impact: DragImpact = {
    movement,
    direction: axis.direction,
    destination: {
      droppableId: destination.descriptor.id,
      index: newIndex,
    },
    merge: null,
  };

  return impact;
};
