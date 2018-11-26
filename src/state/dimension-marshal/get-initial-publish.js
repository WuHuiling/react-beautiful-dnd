// @flow
import type { Position } from 'css-box-model';
import * as timings from '../../debug/timings';
import type {
  Entries,
  DroppableEntry,
  DraggableEntry,
  StartPublishingResult,
} from './dimension-marshal-types';
import { toDraggableMap, toDroppableMap } from '../dimension-structures';
import { values } from '../../native-with-fallback';
import type {
  DroppableDescriptor,
  DroppableDimension,
  DraggableDimension,
  DimensionMap,
  ScrollOptions,
  Critical,
  Viewport,
} from '../../types';
import isSameValueArray from './is-same-value-array';
import getViewport from '../../view/window/get-viewport';

type Args = {|
  critical: Critical,
  scrollOptions: ScrollOptions,
  entries: Entries,
  viewportClassName: ?string,
|};

export default ({
  critical,
  scrollOptions,
  entries,
  viewportClassName,
}: Args): StartPublishingResult => {
  const timingKey: string = 'Initial collection from DOM';
  timings.start(timingKey);

  const viewport: Viewport = getViewport(viewportClassName);
  const viewportScroll: Position = viewport.scroll.current;

  const home: DroppableDescriptor = critical.droppable;

  const droppables: DroppableDimension[] = values(entries.droppables)
    // Exclude things of the wrong type
    .filter(
      (entry: DroppableEntry): boolean => {
        const entryType = entry.descriptor.type;
        return Array.isArray(entryType) && Array.isArray(home.type)
          ? isSameValueArray(entryType, home.type)
          : entryType === home.type;
      },
    )
    .map(
      (entry: DroppableEntry): DroppableDimension =>
        entry.callbacks.getDimensionAndWatchScroll(viewportScroll, scrollOptions), // prettier-ignore
    );

  const droppableMaps = {};
  droppables.forEach((droppable: DroppableDimension) => {
    droppableMaps[droppable.descriptor.id] = {
      isSortable: droppable.isSortable,
    };
  });

  const draggables: DraggableDimension[] = values(entries.draggables)
    .filter(
      (entry: DraggableEntry): boolean => {
        const droppableType = entry.descriptor.droppableType;
        const droppableId = entry.descriptor.droppableId;
        const droppable = droppableMaps[droppableId];

        if (!droppable) {
          return false;
        }

        const isWithinDroppableType = Array.isArray(droppableType)
          ? droppableType.indexOf(entry.descriptor.type) > -1
          : droppableType === entry.descriptor.type;

        if (!isWithinDroppableType) {
          return false;
        }

        // if the currentDroppable isn't sortable, then within this droppable,
        // only the critical draggable need to publish its dimension info.
        const isSortable = droppable.isSortable
          ? true
          : entry.descriptor.id === critical.draggable.id;

        return isSortable;
      },
    )
    .map(
      (entry: DraggableEntry): DraggableDimension =>
        entry.getDimension(viewportScroll),
    );

  const dimensions: DimensionMap = {
    draggables: toDraggableMap(draggables),
    droppables: toDroppableMap(droppables),
  };

  timings.finish(timingKey);

  const result: StartPublishingResult = {
    dimensions,
    critical,
    viewport,
  };

  return result;
};
